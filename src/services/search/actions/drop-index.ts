import {ActionPayload, ActionResponse} from "internals/types";
import {dropIndex} from "../lib/opensearch";
import {LambdifyHandler, RequestError} from "internals/lambda";
import {inspect} from "util";
import {APIGatewayProxyHandlerV2} from "aws-lambda";

export const Name = 'DropIndex';

export interface Payload extends ActionPayload {
  index: string;
}

export interface Response extends ActionResponse {
  result: 'failure' | 'success';
  error?: unknown;
}

export const Handler = async (payload: Payload) => {
  console.log(`Running drop-index with payload ${inspect(payload)}`);

  const response = await dropIndex(payload.index);

  if (response.result === 'failure') {
    throw new RequestError(response.error);
  }

  return response;
}

export const LambdaHandler: APIGatewayProxyHandlerV2 = LambdifyHandler(Handler);
