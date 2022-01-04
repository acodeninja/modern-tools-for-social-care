import {signedRequest} from "./http";

export interface AddItemInput {
  index: string;
  items?: Array<{ [key: string]: unknown }>;
}

export const put = async (input: AddItemInput) => {
  const body = input.items.map(item => {
    return JSON.stringify({index: { _index: input.index }}) + '\n' + JSON.stringify(item);
  }).join('\n') + '\n';

  return await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}/_bulk`),
    body,
    method: "POST",
    service: "es",
    region: process.env.AWS_REGION,
  });
};

export const search = async (terms: string, results: number = 20) => {
  return await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}/_search?q=${terms}`),
    method: "GET",
    service: "es",
    region: process.env.AWS_REGION,
  });
}
