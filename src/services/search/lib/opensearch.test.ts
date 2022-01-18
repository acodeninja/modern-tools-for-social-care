import {beforeAll, beforeEach, describe, expect, jest, test} from '@jest/globals';
import {signedRequest} from "./http";
import {getIndexes, search} from "./opensearch";
import {RequestError} from "./lambda";

jest.mock("./http");
process.env.AWS_OPENSEARCH_ENDPOINT = 'https://search-service';
process.env.AWS_REGION = 'eu-west-2';

const mockGetIndexes = (index) => {
  (signedRequest as jest.Mock).mockResolvedValueOnce({
    body: `${index}\nkibana\n`,
    statusCode: 200,
    headers: {},
  });
};

const mockGetTextFieldsForIndex = (index, fields) => {
  (signedRequest as jest.Mock).mockResolvedValueOnce({
    body: {
      [index]: {
        mappings: {
          properties: Object.fromEntries(fields.map(field => [field, {type: 'text'}])),
        },
      },
    },
    statusCode: 200,
    headers: {},
  });
};

const mockSearchRequest = (body = null) => {
  (signedRequest as jest.Mock).mockResolvedValueOnce({
    response: {
      body: body ? body : Buffer.from(''),
      statusCode: 200,
      headers: {},
    },
  })
}

describe('services/search/lib/opensearch', () => {
  describe('calling search', () => {
    describe('with only a term', () => {
      beforeAll(async () => {
        (signedRequest as jest.Mock).mockClear();
        (signedRequest as jest.Mock).mockResolvedValueOnce({
          response: {
            body: Buffer.from(''),
            statusCode: 200,
            headers: {},
          },
        })
        await search('search terms')
      });

      test('does a global search on the _meta.compound key', () => {
        expect(signedRequest).toHaveBeenCalledWith({
          body: JSON.stringify({
            query: {
              fuzzy: {
                '_meta.compound': {
                  value: 'search terms',
                },
              },
            },
          }),
          method: 'POST',
          region: 'eu-west-2',
          service: 'es',
          url: new URL('https://search-service/_search'),
        });
      });
    });

    describe('with a term and an existing index', () => {
      beforeAll(async () => {
        (signedRequest as jest.Mock).mockClear();
        mockGetIndexes('test-index');
        mockGetTextFieldsForIndex('test-index', ['fieldOne', 'fieldTwo']);
        mockSearchRequest({});
        await search('search terms', 'test-index');
      });

      test('calls the getIndexes function', () => {
        expect(signedRequest).toHaveBeenCalledWith({
          method: 'GET',
          region: 'eu-west-2',
          service: 'es',
          url: new URL('https://search-service/_cat/indices?v&h=i'),
        });
      });

      test('calls the getTextFieldsForIndex function', () => {
        expect(signedRequest).toHaveBeenCalledWith({
          method: 'GET',
          region: 'eu-west-2',
          service: 'es',
          url: new URL('https://search-service/test-index/_mapping'),
        });
      });

      test('calls the expected search endpoint', () => {
        expect(signedRequest).toHaveBeenCalledWith({
          body: JSON.stringify({
              query: {
                bool: {
                  should: [
                    {match: {fieldOne: {query: "search terms", fuzziness: "AUTO", operator: "and"}}},
                    {match: {fieldTwo: {query: "search terms", fuzziness: "AUTO", operator: "and"}}},
                  ],
                },
              },
            },
          ),
          method: 'POST',
          region: 'eu-west-2',
          service: 'es',
          url: new URL('https://search-service/test-index/_search'),
        });
      });
    });

    describe('with an index that does not exist', () => {
      beforeEach(async () => {
        (signedRequest as jest.Mock).mockClear();
        mockGetIndexes('test-index');
      });

      test('calls the getIndexes function', async () => {
        try {
          await search('search terms', 'not-an-index');
        } catch (e) {

        }
        expect(signedRequest).toHaveBeenCalledWith({
          method: 'GET',
          region: 'eu-west-2',
          service: 'es',
          url: new URL('https://search-service/_cat/indices?v&h=i'),
        });
      });

      test('throws a request error', async () => {
        await expect(search('search terms', 'not-an-index')).rejects
          .toThrow(new RequestError('index not-an-index does not exist'));
      });
    });
  });

  describe('calling getIndexes', () => {
    let indexes;

    beforeAll(async () => {
      (signedRequest as jest.Mock).mockClear();
      mockGetIndexes('test-index');
      indexes = await getIndexes();
    });

    test('calls the api with the expected request', () => {
      expect(signedRequest).toHaveBeenCalledWith({
        method: 'GET',
        region: 'eu-west-2',
        service: 'es',
        url: new URL('https://search-service/_cat/indices?v&h=i'),
      })
    });
    test('returns a list of expected indexes', () => {
      expect(indexes).toEqual(['test-index']);
    });
  });
});
