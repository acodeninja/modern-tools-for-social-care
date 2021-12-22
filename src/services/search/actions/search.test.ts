import {beforeAll, describe, expect, test} from '@jest/globals';
import {Handler, Payload, Response} from "./search";

describe('services/search/actions/search', () => {
  describe('searching for a single term', () => {
    let response: Response;

    beforeAll(async () => {
      const payload = new Payload();
      payload.terms = "test";

      response = await Handler(payload);
    });

    test('returns appropriate results for the search', () => {
      expect(response).toHaveProperty('results');
    });
  });
});
