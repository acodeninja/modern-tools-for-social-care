import {beforeAll, describe, expect, jest, test} from '@jest/globals';
import {Handler, Payload, Response} from "./search";

import {search} from "../lib/opensearch";
import {RequestError} from "../lib/lambda";

jest.mock('../lib/opensearch');

(search as jest.Mock).mockResolvedValue({
  count: 0,
  results: [],
});

describe('services/search/actions/search', () => {
  describe('searching without specifying an index', () => {
    let response: Response;

    beforeAll(async () => {
      const payload = new Payload();
      payload.terms = "test";

      response = await Handler(payload);
    });

    test('calls the search function with the expected input', () => {
      expect(search).toHaveBeenCalledWith('test', undefined);
    });

    test('returns appropriate results for the search', () => {
      expect(response).toHaveProperty('results');
    });
  });

  describe('searching with a specified index', () => {
    let response: Response;

    beforeAll(async () => {
      const payload = new Payload();
      payload.terms = 'test-term';
      payload.index = 'test-index'

      response = await Handler(payload);
    });

    test('calls the search function with the expected input', () => {
      expect(search).toHaveBeenCalledWith('test-term', 'test-index');
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
  })
});
