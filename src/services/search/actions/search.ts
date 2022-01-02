import {SearchResult} from "../domains";
import {ActionPayload, ActionResponse} from "../../../shared/service/types";
import {APIGatewayProxyHandlerV2} from "aws-lambda";

export const Name = 'search';

export class Payload implements ActionPayload {
  terms: string;
}

export class Response implements ActionResponse {
  results: Array<SearchResult> = [];
}

export const Handler = async (payload: Payload) => {
  return new Response();
}

const LambdaHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const response = await Handler({
    terms: event.queryStringParameters.terms,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  }
}

export default LambdaHandler;
