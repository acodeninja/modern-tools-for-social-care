import {APIGatewayProxyHandlerV2} from "aws-lambda";
import {ActionManifest} from "../../../shared/service/types";

export const LambdifyHandler = (Handler: ActionManifest['Handler']): APIGatewayProxyHandlerV2 => async (event) => {
  const response = await Handler(JSON.parse(
    event.isBase64Encoded ?
      Buffer.from(event.body, 'base64').toString('ascii') :
      event.body
  ));

  return {
    statusCode: 200,
    isBase64Encoded: false,
    body: JSON.stringify(response),
  };
};
