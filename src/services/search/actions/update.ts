import {ActionPayload, ActionResponse} from "../../../framework/service/types";
import {LambdifyHandler} from "../lib/lambda";
import {put} from "../lib/opensearch";

export const Name = 'Update';

export class Payload implements ActionPayload {
  index: string;
  items?: Array<{
    _meta: {
      location: string;
      domain: string;
    };
    [key: string]: unknown;
  }>;
}

export class Response implements ActionResponse {
  success: boolean;
}

export const Handler = async (payload: Payload): Promise<Response> => {
  const response = new Response();

  const results = await put({
    index: payload.index,
    items: payload.items,
  });

  return response;
}

export const LambdaHandler = LambdifyHandler(Handler);
