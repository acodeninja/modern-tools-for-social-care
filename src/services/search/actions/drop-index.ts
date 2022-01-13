import {ActionPayload, ActionResponse} from "../../../framework/service/types";
import {dropIndex} from "../lib/opensearch";
import {LambdifyHandler, RequestError} from "../lib/lambda";
import {inspect} from "util";

export const Name = 'DropIndex';

export class Payload implements ActionPayload {
  index: string;
}

export class Response implements ActionResponse {
  result: 'failure' | 'success';
  error?: unknown;
}

export const Handler = async (payload: Payload) => {
  console.log(`Running drop-index with payload ${inspect(payload)}`);

  const response = await dropIndex(payload.index);

  if (response.result === 'failure') {
    throw new RequestError(response.error);
  }

  return Object.assign(new Response(), response);
}

export const LambdaHandler = LambdifyHandler(Handler);
