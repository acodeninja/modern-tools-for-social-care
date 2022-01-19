import {beforeAll, describe, expect, jest, test} from '@jest/globals';
import {Readable} from 'stream';
import {signedRequest} from "./http";
import {SignatureV4} from "@aws-sdk/signature-v4";
import {defaultProvider} from "@aws-sdk/credential-provider-node";
import {Sha256} from "@aws-crypto/sha256-browser";
import {HttpRequest, HttpResponse} from "@aws-sdk/protocol-http";
import {NodeHttpHandler} from "@aws-sdk/node-http-handler";

jest.mock("@aws-sdk/credential-provider-node");
jest.mock("@aws-sdk/signature-v4");
jest.mock("@aws-sdk/node-http-handler");
jest.mock("@aws-crypto/sha256-browser");

(defaultProvider as jest.Mock).mockReturnValue({accessKeyId: 'ACCESS_KEY', secretAccessKey: 'SECRET_KEY'});

(Sha256 as jest.Mock).mockReturnValue({});

const mockSign = jest.fn().mockResolvedValue({
  // @ts-ignore
  signedRequest: true,
});
(SignatureV4 as jest.Mock).mockReturnValue({sign: mockSign});

const mockHandle = jest.fn().mockResolvedValue({
  // @ts-ignore
  response: new HttpResponse({
    body: undefined,
    headers: undefined,
    statusCode: 200
  })
});
(NodeHttpHandler as jest.Mock).mockReturnValue({handle: mockHandle});

describe('services/search/lib/http', () => {
  describe('making a signed http request', () => {
    let response: HttpResponse;

    beforeAll(async () => {
      response = await signedRequest({
        body: 'test',
        url: new URL("https://example.com"),
        method: "POST",
        region: 'aws-region',
        service: 'es',
      });
    });

    test('creates a new signing instance using the default credential provider', () => {
      expect(SignatureV4).toHaveBeenCalledWith({
        credentials: {accessKeyId: 'ACCESS_KEY', secretAccessKey: 'SECRET_KEY'},
        region: 'aws-region',
        service: 'es',
        sha256: Sha256,
      });
    });

    test('signs the http request', () => {
      expect(mockSign).toHaveBeenCalledWith(new HttpRequest({
        body: 'test',
        headers: {
          'Content-Type': 'application/json',
          'host': 'example.com'
        },
        hostname: 'example.com',
        protocol: 'https:',
        port: NaN,
        query: {},
        method: 'POST',
        path: '/',
      }));
    });

    test('calls the node http handler with the signed request', () => {
      expect(mockHandle).toHaveBeenCalledWith({signedRequest: true});
    });

    describe('when the response contains json', () => {
      test('decodes the json to an object', async () => {
        const body = new Readable();
        body.push(JSON.stringify({test:'test'}));
        body.push(null);
        mockHandle.mockResolvedValue({
          // @ts-ignore
          response: new HttpResponse({
            body,
            headers: undefined,
            statusCode: 200
          }),
        });

        await expect(signedRequest({
          body: 'test',
          url: new URL("https://example.com"),
          method: "POST",
          region: 'aws-region',
          service: 'es',
        })).resolves.toEqual(expect.objectContaining({body: {test:'test'}}));
      });
    });

    describe('when the response contains plain text', () => {
      let response;
      const consoleError = console.error;

      beforeAll(async () => {
        console.error = jest.fn();
        const body = new Readable();
        body.push('test string');
        body.push(null);
        mockHandle.mockResolvedValue({
          // @ts-ignore
          response: new HttpResponse({
            body,
            headers: undefined,
            statusCode: 200
          }),
        });
        response = await signedRequest({
          body: 'test',
          url: new URL("https://example.com"),
          method: "POST",
          region: 'aws-region',
          service: 'es',
        });
      });

      afterAll(() => {
        console.error = consoleError;
      });

      test('does nothing to the response body', () => {
        expect(response.body).toEqual('test string');
      });

      test('calls console.error to indicate the plain text could not be decoded', () => {
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("error parsing http response SyntaxError: Unexpected token e in JSON at position 1"),
        );
      });
    });

    describe('when no body is provided', function () {
      test('defaults to a null body', async () => {
        await signedRequest({
          url: new URL("https://example.com"),
          method: 'GET',
          region: 'aws-region',
          service: 'es',
        });

        expect(mockSign).toHaveBeenCalledWith(new HttpRequest({
          body: null,
          headers: {
            'Content-Type': 'application/json',
            'host': 'example.com'
          },
          hostname: 'example.com',
          protocol: 'https:',
          port: NaN,
          query: {},
          method: 'GET',
          path: '/',
        }));
      });
    });
  });
});
