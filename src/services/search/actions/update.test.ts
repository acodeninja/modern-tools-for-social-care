import {beforeAll, describe, expect, jest, test} from '@jest/globals';
import {Handler, Payload, Response} from "./update";
import {HttpResponse} from "@aws-sdk/protocol-http";

import {put} from "../lib/opensearch";
import {RequestError} from "../lib/lambda";

jest.mock('../lib/opensearch');

(put as jest.Mock).mockResolvedValue(new HttpResponse({
  statusCode: 200,
  body: "BODY",
}));


describe('services/search/actions/update', () => {
  describe('adding a new item to an index', () => {

    describe('an invalid request', () => {

      test('a request without an index', async () => {
        await expect(() => Handler({items: []} as Payload)).rejects.toThrow(new RequestError('index must be specified.'));
      });

      test('a request where some items are missing domains', async () => {
        await expect(() => Handler({index: 'test', items: [{_meta: {}}]} as Payload))
          .rejects.toThrow(new RequestError('_meta.domain must be set on item #0.'));
      });

      test('a request where some items are missing api locations', async () => {
        await expect(() => Handler({index: 'test', items: [{_meta: { domain: "test", location: {frontend: "frontend"}}}]} as Payload))
          .rejects.toThrow(new RequestError('_meta.location.api must be set on item #0.'));
      });

      test('a request where some items are missing frontend locations', async () => {
        await expect(() => Handler({index: 'test', items: [{_meta: { domain: "test", location: {api: "api"}}}]} as Payload))
          .rejects.toThrow(new RequestError('_meta.location.frontend must be set on item #0.'));
      });

    });

    describe('a valid request', () => {
      let response: Response;

      beforeAll(async () => {
        const payload = new Payload();

        payload.index = "test-index";
        payload.items = [{
          _meta: {
            location: {
              api: "http://api/resident/12249",
              frontend: "http://website/resident/12249",
            },
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
                location: {
                  api: "http://api/resident/12249",
                  frontend: "http://website/resident/12249",
                },
                domain: "resident"
              },
            }),
          ]),
        }));
      });
    });
  });
});
