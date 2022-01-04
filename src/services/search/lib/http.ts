import {HttpRequest} from "@aws-sdk/protocol-http";
import {defaultProvider} from "@aws-sdk/credential-provider-node";
import {SignatureV4} from "@aws-sdk/signature-v4";
import {NodeHttpHandler} from "@aws-sdk/node-http-handler";
import {Sha256} from "@aws-crypto/sha256-browser";
import {HttpResponse} from "@aws-sdk/protocol-http";

export interface SignedRequestInput {
  body: unknown;
  url: URL;
  method: 'GET' | 'PUT' | 'PATCH' | 'POST';
  region: string;
  service: string;
}

export interface SignedRequestOutput {

}

export const signedRequest =
  async ({
           body,
           url,
           method = 'GET',
           region,
           service,
         }: SignedRequestInput): Promise<HttpResponse> => {

    console.log('Sending request', new HttpRequest({
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'host': url.host,
      },
      hostname: url.host,
      method,
      path: url.pathname,
    }));

    const signer = new SignatureV4({
      credentials: defaultProvider(),
      region: region,
      service,
      sha256: Sha256
    });

    const {response} = await (new NodeHttpHandler()).handle(
      await signer.sign(new HttpRequest({
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'host': url.host
        },
        hostname: url.host,
        method,
        path: url.pathname,
      })) as HttpRequest,
    );

    return response as HttpResponse;
  }
