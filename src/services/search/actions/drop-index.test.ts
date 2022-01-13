import {beforeAll, describe, expect, jest, test} from '@jest/globals';
import {Handler, Payload, Response} from "./drop-index";

import {dropIndex} from "../lib/opensearch";

jest.mock('../lib/opensearch');

(dropIndex as jest.Mock).mockResolvedValue({});

describe('services/search/actions/search', () => {
  describe('searching for a single term', () => {
    let response: Response;

    beforeAll(async () => {
      const payload = new Payload();
      payload.index = "test";

      response = await Handler(payload);
    });

    test('calls delete with the test index', () => {
      expect(dropIndex).toHaveBeenCalledWith('test');
    });
  });
});
