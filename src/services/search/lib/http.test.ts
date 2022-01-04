import {beforeAll, describe, expect, jest, test} from '@jest/globals';
import {signedRequest} from "./http";
import {SignatureV4} from "@aws-sdk/signature-v4";
import {defaultProvider} from "@aws-sdk/credential-provider-node";
import {Sha256} from "@aws-crypto/sha256-browser";
import {HttpResponse} from "@aws-sdk/protocol-http";
import {NodeHttpHandler} from "@aws-sdk/node-http-handler";

jest.mock("@aws-sdk/protocol-http");
jest.mock("@aws-sdk/credential-provider-node");
jest.mock("@aws-sdk/signature-v4");
jest.mock("@aws-sdk/node-http-handler");
jest.mock("@aws-crypto/sha256-browser");

(defaultProvider as jest.Mock).mockReturnValue({accessKeyId: 'ACCESS_KEY', secretAccessKey: 'SECRET_KEY'});

(Sha256 as jest.Mock).mockReturnValue({});

(NodeHttpHandler as jest.Mock).mockReturnValue({
  handle: jest.fn().mockResolvedValue({
    response: new HttpResponse({
      body: undefined,
      headers: undefined,
      statusCode: 200
    })
  }),
});

describe('services/search/lib/http', () => {
  describe('making a sign http request', () => {
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
  });
});
