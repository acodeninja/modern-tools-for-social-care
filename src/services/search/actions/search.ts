import {ActionPayload, ActionResponse} from "internals/types";
import {search} from "../lib/opensearch";
import {SearchResult} from "../domains";
import {LambdifyHandler, RequestError} from "internals/lambda";
import {inspect} from "util";
import {APIGatewayProxyHandlerV2} from "aws-lambda";

export const Name = 'Search';

export interface Payload extends ActionPayload {
  terms?: string;
  index?: string;
  highlight?: string;
  [key: string]: string | undefined;
}

export interface Response extends ActionResponse {
  count: number;
  results: Array<SearchResult>;
}

export const Handler = async (payload: Payload) => {
  console.log(`Running search with payload ${inspect(payload)}`);

  Validate(payload);

  return await search(
    payload.terms || without(payload, ['terms', 'index', 'highlight']),
    payload.index,
    payload.highlight ? payload.highlight.split(',') : undefined,
  );
}

const without = (source: any, keys: Array<string>) => {
  const destination = Object.assign({}, source);
  keys.forEach((key: string) => delete destination[key]);
  return destination;
}

const Validate = (payload: Payload) => {
  const otherTerms = without(payload, ['terms', 'index', 'highlight']);
  const highlights = !!payload.highlight ? payload.highlight.split(',') : null;

  if (!payload.terms && Object.entries(otherTerms).length === 0) {
    throw new RequestError("Must provide one of terms or field paths.");
  }

  if (payload.terms && Object.entries(otherTerms).length > 0) {
    throw new RequestError("Must provide only one of terms or field paths.");
  }

  if (
    !!highlights &&
    !highlights.every(highlight => Object.keys(otherTerms).includes(highlight))
  ) {
    throw new RequestError('If passing a highlight you must also specify the term for that field.');
  }

  if (!!highlights && !highlights.every(highlight => highlight.indexOf('_meta') !== 0)) {
    throw new RequestError('Cannot add highlighting to _meta fields.');
  }
};

export const LambdaHandler: APIGatewayProxyHandlerV2 = LambdifyHandler(Handler);
