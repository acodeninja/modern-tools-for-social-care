import {beforeAll, describe, expect, jest, test} from '@jest/globals';
import {Handler, Payload, Response} from "./search";
import {search} from "../lib/opensearch";
import {RequestError} from "internals/lambda";

jest.mock('../lib/opensearch');

(search as jest.Mock).mockResolvedValue({
  count: 0,
  results: [],
});

describe('services/search/actions/search', () => {
  describe('searching without specifying an index', () => {
    let response: Response;

    beforeAll(async () => {
      response = await Handler({terms: "test"});
    });

    test('calls the search function with the expected input', () => {
      expect(search).toHaveBeenCalledWith('test', undefined, undefined);
    });

    test('returns appropriate results for the search', () => {
      expect(response).toHaveProperty('results');
    });
  });

  describe('searching with a specified index', () => {
    let response: Response;

    beforeAll(async () => {
      response = await Handler({terms: "test-term", index: "test-index"});
    });

    test('calls the search function with the expected input', () => {
      expect(search).toHaveBeenCalledWith('test-term', 'test-index', undefined);
    });

    test('returns appropriate results for the search', () => {
      expect(response).toHaveProperty('results');
    });
  });

  describe('searching with field paths', () => {
    let response: Response;

    beforeAll(async () => {
      response = await Handler({'test.field': 'test-term'});
    });

    test('calls the search function with the expected input', () => {
      expect(search).toHaveBeenCalledWith({'test.field': 'test-term'}, undefined, undefined);
    });

    test('returns appropriate results for the search', () => {
      expect(response).toHaveProperty('results');
    });
  });

  describe('invalid requests', () => {
    test('no payload values', async () => {
      await expect(Handler({})).rejects.toThrow(new RequestError("Must provide one of terms or field paths."));
    });

    test('terms and fields', async () => {
      await expect(Handler({terms: 'test', 'test.field': 'test'})).rejects
        .toThrow(new RequestError("Must provide only one of terms or field paths."));
    });

    test('highlights without matching fields', async () => {
      await expect(Handler({'test.field': 'test', highlight: 'test.not.field'}))
        .rejects.toThrow(new RequestError("If passing a highlight you must also specify the term for that field."));
    })

    test('highlights of _meta fields', async () => {
      await expect(Handler({'_meta.domain': 'test', highlight: '_meta.domain'}))
        .rejects.toThrow(new RequestError("Cannot add highlighting to _meta fields."));
    })
  })
});
