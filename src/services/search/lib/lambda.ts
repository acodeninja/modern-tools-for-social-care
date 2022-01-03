import {APIGatewayProxyHandlerV2} from "aws-lambda";
import {ActionManifest} from "../../../shared/service/types";

export const LambdifyHandler = (Handler: ActionManifest['Handler']): APIGatewayProxyHandlerV2 => async (event) => {
  const response = await Handler({
    terms: event.queryStringParameters.terms,
  });

  return {
    statusCode: 200,
    isBase64Encoded: false,
    body: JSON.stringify(response),
  };
};
