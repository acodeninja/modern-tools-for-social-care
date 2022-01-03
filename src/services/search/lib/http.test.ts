import {beforeAll, describe, expect, jest, test} from '@jest/globals';
import {signedRequest, SignedRequestOutput} from "./http";
import {SignatureV4} from "@aws-sdk/signature-v4";
import {defaultProvider} from "@aws-sdk/credential-provider-node";
import {Sha256} from "@aws-crypto/sha256-browser";

jest.mock("@aws-sdk/protocol-http");
jest.mock("@aws-sdk/credential-provider-node");
jest.mock("@aws-sdk/signature-v4");
jest.mock("@aws-sdk/node-http-handler");
jest.mock("@aws-crypto/sha256-browser");

(defaultProvider as jest.Mock).mockReturnValue({accessKeyId: 'ACCESS_KEY', secretAccessKey: 'SECRET_KEY'});
(Sha256 as jest.Mock).mockReturnValue({})

describe('services/search/lib/http', () => {
  describe('making a sign http request', () => {
    let response: SignedRequestOutput;

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
