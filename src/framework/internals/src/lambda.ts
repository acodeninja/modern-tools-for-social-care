import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyHandlerV2
} from "aws-lambda";
import {ActionManifest, ActionPayload} from "./types";
import {inspect} from "util";

export class RequestError extends Error {

}

export class ServerError extends Error {

}

export const LambdaExtractPayload = (event: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>): ActionPayload => {
  let payload = {};

  try {
    payload = Object.assign(payload, JSON.parse(
      event.isBase64Encoded ?
        Buffer.from(event.body ? event.body : '', 'base64').toString('ascii') :
        event.body ?? ''
    ));
  } catch (e) {
    if (event.body && event.body.length !== 0) {
      throw new RequestError('The request body is malformed.');
    }
  }

  try {
    payload = Object.assign(payload, event.queryStringParameters);
  } catch (e) {
  }

  try {
    payload = Object.assign(payload, event.pathParameters);
  } catch (e) {
  }

  return payload;
}

export const stringifyResponse = (input: unknown) => {
  if (!input) return;

  const allKeys: any[] = [];
  const seen: any = {};

  JSON.stringify(input, (key, value) => {
    if (!(key in seen)) {
      allKeys.push(key);
      seen[key] = null;
    }
    return value;
  });

  allKeys.sort();

  return JSON.stringify(input, allKeys);
}

export const LambdifyHandler = (Handler: ActionManifest['Handler']): APIGatewayProxyHandlerV2 => async (event) => {
  console.log(`event: ${inspect(event, false, 15)}`);

  try {
    const payload = LambdaExtractPayload(event);
    const response = await Handler(payload);

    return {
      statusCode: 200,
      isBase64Encoded: false,
      body: stringifyResponse(response),
    };
  } catch (e) {
    if (e instanceof Error) {
      switch (e.constructor) {
        case RequestError:
          return {
            statusCode: 400,
            isBase64Encoded: false,
            body: JSON.stringify({
              message: e.message,
            }),
          };
        case ServerError:
          return {
            statusCode: 500,
            isBase64Encoded: false,
            body: JSON.stringify({
              message: e.message,
            }),
          }
        default:
          return {
            statusCode: 500,
            isBase64Encoded: false,
            body: JSON.stringify({
              message: e.message,
            }),
          };
      }
    }

    return {
      statusCode: 500,
      isBase64Encoded: false,
      body: JSON.stringify({
        message: e,
      }),
    };
  }
};
