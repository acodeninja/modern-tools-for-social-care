import {APIGatewayProxyHandlerV2} from "aws-lambda";
import {ActionManifest} from "../../../framework/service/types";

export class RequestError extends Error {

}

export class ServerError extends Error {

}

export const LambdifyHandler = (Handler: ActionManifest['Handler']): APIGatewayProxyHandlerV2 => async (event) => {
  const payload = Object.assign(JSON.parse(
    event.isBase64Encoded ?
      Buffer.from(event.body, 'base64').toString('ascii') :
      event.body
  ), event.queryStringParameters);

  try {
    const response = await Handler(payload);

    return {
      statusCode: 200,
      isBase64Encoded: false,
      body: JSON.stringify(response),
    };
  } catch (e) {
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
