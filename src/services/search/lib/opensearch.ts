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
  const body = input.items
    .map(item => {
      const meta = Object.assign(item._meta);
      delete item._meta;
      meta.compound = Object.values(item).join(' ');
      item._meta = meta;
    })
    .map(item => {
      return JSON.stringify({index: {_index: input.index}}) + '\n' + JSON.stringify(item);
    })
    .join('\n') + '\n';

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
    // body: JSON.stringify({
    //   query: {
    //     fuzzy: {
    //       '_meta.compound': {
    //         value: terms
    //       },
    //     },
    //   },
    //   partial_fields: {
    //     excludeCompound: {
    //       exclude: "_meta.compound"
    //     }
    //   }
    // }),
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
