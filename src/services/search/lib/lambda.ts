import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyHandlerV2
} from "aws-lambda";
import {ActionManifest, ActionPayload} from "../../../framework/service/types";
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
        Buffer.from(event.body, 'base64').toString('ascii') :
        event.body
    ));
  } catch (e) {
    if (event.body.length !== 0) {
      throw new RequestError('The request body is malformed.');
    }
  }

  try {
    payload = Object.assign(payload, event.queryStringParameters);
  } catch (e) {
  }

  return payload;
}

export const LambdifyHandler = (Handler: ActionManifest['Handler']): APIGatewayProxyHandlerV2 => async (event) => {
  try {
    const payload = LambdaExtractPayload(event);
    const response = await Handler(payload);

    return {
      statusCode: 200,
      isBase64Encoded: false,
      body: JSON.stringify(response),
    };
  } catch (e) {
    console.log(inspect({
      stack: e.stack,
      code: e.code,
      message: e.message,
      error: e.constructor.name,
    }));

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
};
