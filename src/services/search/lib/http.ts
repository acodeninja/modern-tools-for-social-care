import {HttpRequest} from "@aws-sdk/protocol-http";
import {defaultProvider} from "@aws-sdk/credential-provider-node";
import {SignatureV4} from "@aws-sdk/signature-v4";
import {NodeHttpHandler} from "@aws-sdk/node-http-handler";
import {Sha256} from "@aws-crypto/sha256-browser";
import {HttpResponse} from "@aws-sdk/protocol-http";
import {inspect} from "util";

export interface SignedRequestInput {
  body?: unknown;
  url: URL;
  method: 'GET' | 'PUT' | 'PATCH' | 'POST' | 'DELETE';
  region: string;
  service: string;
}

export const signedRequest =
  async ({
           body = null,
           url,
           method = 'GET',
           region,
           service,
         }: SignedRequestInput): Promise<HttpResponse> => {
    const signer = new SignatureV4({
      credentials: defaultProvider(),
      region: region,
      service,
      sha256: Sha256
    });

    const response = await (new NodeHttpHandler()).handle(
      await signer.sign(new HttpRequest({
        body,
        headers: {
          'Content-Type': 'application/json',
          'host': url.host
        },
        hostname: url.hostname,
        protocol: url.protocol,
        port: parseInt(url.port),
        query: Object.fromEntries(url.searchParams.entries()),
        method,
        path: url.pathname,
      })) as HttpRequest,
    );

    let responseBody = '';

    try {
      for await (const chunk of response.response.body) {
        responseBody += chunk;
      }

      responseBody = JSON.parse(responseBody);
    } catch (e) {
      console.error(`error parsing http response ${inspect(e)}, ${inspect(responseBody)}`);
    }

    return {
      body: responseBody,
      headers: response.response.headers,
      statusCode: response.response.statusCode,
    };
  }
