import {beforeAll, describe, expect, jest, test} from '@jest/globals';
import {Handler, Response} from "./drop-index";
import {dropIndex} from "../lib/opensearch";
import {RequestError} from "internals/lambda";

jest.mock('../lib/opensearch');

describe('services/search/actions/drop-index', () => {
  describe('dropping an index that exists', () => {
    let response: Response;

    beforeAll(async () => {
      (dropIndex as jest.Mock).mockResolvedValue({});
      response = await Handler({index: 'test'});
    });

    test('calls delete with the test index', () => {
      expect(dropIndex).toHaveBeenCalledWith('test');
    });
  });

  describe('dropping an index that does not', () => {
    test('calls delete with the test index', async () => {
      (dropIndex as jest.Mock).mockResolvedValue({result: 'failure', error: 'test error'});

      await expect(Handler({index: 'test'})).rejects.toThrow(new RequestError('test error'));
    });
  });
});
