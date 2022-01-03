import {beforeAll, describe, expect, jest, test} from '@jest/globals';
import {Handler, Payload, Response} from "./update";

import {put} from "../lib/opensearch";

jest.mock('../lib/opensearch');

(put as jest.Mock).mockResolvedValue({});

describe('services/search/actions/update', () => {
  describe('adding a new item for indexing', () => {
    let response: Response;

    beforeAll(async () => {
      const payload = new Payload();

      payload.index = "test-index";
      payload.items = [{
        _meta: {
          location: "internal://resident/12249",
          domain: "resident"
        },
        mosaicId: 12249,
        title: "Mr.",
        firstName: "Juwan",
        lastName: "Haag",
        otherNames: [
          {
            firstName: "Juwan",
            lastName: "Lebsack"
          }
        ],
        dateOfBirth: "1984-05-21",
        dateOfDeath: null,
        nhsNumber: 72302,
        emailAddress: "Juwan_Haag@example.com",
        address: {
          address: "51930 King Squares",
          postcode: "E88 7IF"
        },
        phoneNumbers: [
          {number: "07862024384"},
          {number: "08958797953"}
        ]
      }];

      response = await Handler(payload);
    });

    test('calls put with appropriate index name', () => {
      expect(put).toHaveBeenCalledWith(expect.objectContaining({
        index: 'test-index'
      }));
    });

    test('calls put with appropriate items', () => {
      expect(put).toHaveBeenCalledWith(expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            _meta: {
              location: "internal://resident/12249",
              domain: "resident"
            },
          }),
        ]),
      }));
    });
  });
});
