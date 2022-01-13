import {ActionPayload, ActionResponse} from "../../../framework/service/types";
import {LambdifyHandler, RequestError} from "../lib/lambda";
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
  success: boolean;
}

export const Handler = async (payload: Payload): Promise<Response> => {
  console.log(`Running update with payload ${inspect(payload)}`);
  const response = new Response();

  Validate(payload);

  const results = await put({
    index: payload.index,
    items: payload.items,
  });

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
