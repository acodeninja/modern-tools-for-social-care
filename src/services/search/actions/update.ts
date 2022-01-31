import {ActionPayload, ActionResponse} from "internals/types";
import {LambdifyHandler, RequestError} from "internals/lambda";
import {put} from "../lib/opensearch";
import {inspect} from "util";

export const Name = 'Update';

export class Payload implements ActionPayload {
  index: string;
  items?: Array<{
    _meta: {
      location: {
        api: string;
        frontend: string;
      };
      domain: string;
    };
    [key: string]: unknown;
  }>;
}

export class Response implements ActionResponse {
  result: 'failure' | 'success';
  error?: unknown;
}

export const Handler = async (payload: Payload): Promise<Response> => {
  console.log(`Running update with payload ${inspect(payload)}`);
  const response = new Response();

  Validate(payload);

  response.result =
    await put({index: payload.index, items: payload.items}) ?
      'success' : 'failure';

  return response;
}

const Validate = (payload) => {
  if (!payload.index) throw new RequestError('index must be specified.');

  payload.items.map((item, index) => {
    if (!item._meta?.domain) throw new RequestError(`_meta.domain must be set on item #${index}.`);
    if (!item._meta?.location?.api) throw new RequestError(`_meta.location.api must be set on item #${index}.`);
    if (!item._meta?.location?.frontend) throw new RequestError(`_meta.location.frontend must be set on item #${index}.`);
  });
};

export const LambdaHandler = LambdifyHandler(Handler);
