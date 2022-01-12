import {signedRequest} from "./http";

export interface AddItemInput {
  index: string;
  items?: Array<{
    _meta: {
      location: {
        api: string;
        frontend: string;
      };
      domain: string;
      compound?: string;
    },
    [key: string]: unknown;
  }>;
}

export const put = async (input: AddItemInput) => {
  const body = input.items.map(item => {
    const _meta = Object.assign(item._meta);
    delete item._meta;
    _meta.compound = JSON.stringify(Object.values(item).join('\n'));

    return JSON.stringify({index: { _index: input.index }}) + '\n' +
      JSON.stringify({...item, _meta});
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
  const response = await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}/_search?q=${terms}`),
    method: "GET",
    service: "es",
    region: process.env.AWS_REGION,
  });

  return {
    count: response.body?.hits?.total?.value,
    results: response.body?.hits?.hits?.map(result => {
      return {
        score: result._score,
        data: result._source,
      }
    }),
  }
}
