import {signedRequest} from "./http";
import {SearchResult} from "../domains";
import {RequestError} from "./lambda";
import {inspect} from "util";

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
  const updates = await Promise.all(input.items.map(item => (async () => {
    const existingDocument = await findDocument(item._meta, input.index);

    const meta = Object.assign(item._meta);
    delete item._meta;
    meta.compound = Object.values(item).join(' ');
    item._meta = meta;

    const indexInfo: { index: { _index: string, _id?: string } }
      = {index: {_index: input.index}};

    if (existingDocument.id) indexInfo.index._id = existingDocument.id;

    return JSON.stringify(indexInfo) + '\n' + JSON.stringify(item);
  })()));

  const body = updates.join('\n') + '\n';

  return await signedRequest({
    url: new URL(`${process.env.AWS_OPENSEARCH_ENDPOINT}/_bulk`),
    body,
    method: "POST",
    service: "es",
    region: process.env.AWS_REGION,
  });
};

export const getIndexes = async () => {
  const response = await signedRequest({
    url: new URL(`${process.env.AWS_OPENSEARCH_ENDPOINT}/_cat/indices?v&h=i`),
    method: "GET",
    service: "es",
    region: process.env.AWS_REGION,
  });

  return response.body.split('\n').filter(index => !!index && index !== 'i' && index.indexOf('kibana') === -1);
}

export const getTextFieldsForIndex = async (index: string): Promise<Array<string>> => {
  const response = await signedRequest({
    url: new URL(`${process.env.AWS_OPENSEARCH_ENDPOINT}/${index}/_mapping`),
    method: "GET",
    service: "es",
    region: process.env.AWS_REGION,
  });

  return Object.entries(response.body[index].mappings.properties).map(([key, info]) => {
    if (key === '_meta') return null;
    if (info['type'] === 'text') return key;
  }).filter(field => !!field);
}

export const search =
  async (
    terms: string | { [key: string]: string },
    index: string = null,
    highlight: string = undefined,
    results: number = 20,
  ): Promise<{
    count: number;
    results: Array<SearchResult>;
  }> => {
    let url = `${process.env.AWS_OPENSEARCH_ENDPOINT}`
    if (index) url += `/${index}`;
    url += '/_search';

    let body = '';

    if (typeof terms === 'string') {
      if (index) {
        const indexes = await getIndexes();
        if (indexes.includes(index)) {
          const fields = await getTextFieldsForIndex(index);

          body = JSON.stringify({
            query: {
              bool: {
                should: fields.map(field => ({
                  match: {
                    [field]: {
                      query: terms,
                      fuzziness: "AUTO",
                      operator: "and"
                    }
                  }
                })),
              }
            }
          });
        } else {
          throw new RequestError(`index ${index} does not exist`);
        }
      } else {
        body = JSON.stringify({
          query: {
            fuzzy: {
              '_meta.compound': {
                value: terms
              },
            },
          },
        })
      }
    } else {
      const highlighting = {
        highlight: {
          pre_tags: ["<strong>"],
          post_tags: ["</strong>"],
          fields: {fieldOne: {}},
        },
      }
      const osRequest = {
        query: {
          bool: {
            should: Object.entries(terms).map(([field, value]) => ({
              match: {
                [field]: {
                  query: value,
                  fuzziness: "AUTO",
                  operator: "and"
                }
              }
            })),
          }
        }
      };

      if (!!highlight) {
        osRequest['highlight'] = {
          pre_tags: ["<strong>"],
          post_tags: ["</strong>"],
          fields: Object.fromEntries(highlight.split(',').map(field => [field, {}])),
        };
      }

      body = JSON.stringify(osRequest);
    }

    const response = await signedRequest({
      url: new URL(url),
      method: "POST",
      service: "es",
      region: process.env.AWS_REGION,
      body,
    });

    return {
      count: response.body?.hits?.total?.value,
      results: response.body?.hits?.hits?.map(result => ({
        score: result._score,
        data: {
          ...result._source,
          _highlights: result.highlight,
        },
      })),
    }
  };

export const dropIndex = async (index: string): Promise<{
  result: 'failure' | 'success';
  error?: string;
}> => {
  const response = await signedRequest({
    url: new URL(`${process.env.AWS_OPENSEARCH_ENDPOINT}/${index}`),
    method: "DELETE",
    service: "es",
    region: process.env.AWS_REGION,
  });

  if (response.statusCode !== 200) {
    return {
      result: 'failure',
      error: response.body?.error?.reason,
    };
  }

  return {result: 'success'};
};

const findDocument = async (documentMeta: {
  location: {
    api: string;
    frontend: string;
  };
  domain: string;
}, index: string) => {
  let url = `${process.env.AWS_OPENSEARCH_ENDPOINT}`;
  if (index) url += `/${index}`;
  url += '/_search';

  const response = await signedRequest({
    url: new URL(url),
    method: "POST",
    service: "es",
    region: process.env.AWS_REGION,
    body: JSON.stringify({
      query: {
        bool: {
          must: [
            {
              match: {
                '_meta.location.api': documentMeta.location.api
              }
            },
            {
              match: {
                '_meta.location.frontend': documentMeta.location.frontend
              }
            },
            {
              match: {
                '_meta.domain': documentMeta.domain
              }
            },
          ],
        },
      },
    }),
  });

  const firstHit = response.body?.hits?.hits[0];

  if (firstHit) {
    return {
      id: firstHit._id,
      index: firstHit._index,
    };
  }

  return {};
}
