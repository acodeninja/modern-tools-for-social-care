import {APIGatewayProxyHandlerV2} from "aws-lambda";
import {ActionManifest} from "../../../framework/service/types";

export const LambdifyHandler = (Handler: ActionManifest['Handler']): APIGatewayProxyHandlerV2 => async (event) => {
  const payload = Object.assign(JSON.parse(
    event.isBase64Encoded ?
      Buffer.from(event.body, 'base64').toString('ascii') :
      event.body
  ), event.queryStringParameters);

  const response = await Handler(payload);

  return {
    statusCode: 200,
    isBase64Encoded: false,
    body: JSON.stringify(response),
  };
};
