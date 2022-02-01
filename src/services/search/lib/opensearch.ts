import {signedRequest} from "internals/http";
import {RequestError} from "internals/lambda";
import {SearchResult} from "../domains";
import {getVariable} from "./Environment";

export interface AddItemInput {
  index: string;
  items: Array<{
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

const without = (source: { [key: string]: unknown }, key: string) => {
  const destination = Object.assign({}, source);
  delete destination[key];
  return destination;
};

export const put = async (input: AddItemInput) => {
  const updates = await Promise.all(input.items.map(item => (async () => {
    item._meta.compound = Object.values(without(item, '_meta'))
      .filter(i => (i as string).toString() === i)
      .join(' ');

    const indexInfo: { index: { _index: string, _id?: string } }
      = {index: {_index: input.index}};

    const existingDocument = await findDocument(item._meta, input.index);

    if (existingDocument?.id) indexInfo.index._id = existingDocument.id;

    return JSON.stringify(indexInfo) + '\n' + JSON.stringify(item);
  })()));

  const body = updates.join('\n') + '\n';

  const response = await signedRequest({
    url: new URL(`${getVariable('AWS_OPENSEARCH_ENDPOINT')}/_bulk`),
    body,
    method: "POST",
    service: "es",
    region: getVariable('AWS_REGION'),
  });

  return response.statusCode === 200;
};

export const getIndexes = async () => {
  const response = await signedRequest({
    url: new URL(`${getVariable('AWS_OPENSEARCH_ENDPOINT')}/_cat/indices?v&h=i`),
    method: "GET",
    service: "es",
    region: getVariable('AWS_REGION'),
  });

  return response.body.split('\n')
    .filter((index: string) => !!index && index !== 'i' && index.indexOf('kibana') === -1);
}

export const getTextFieldsForIndex = async (index: string): Promise<Array<string>> => {
  const response = await signedRequest({
    url: new URL(`${getVariable('AWS_OPENSEARCH_ENDPOINT')}/${index}/_mapping`),
    method: "GET",
    service: "es",
    region: getVariable('AWS_REGION'),
  });

  return Object.entries(response.body[index].mappings.properties)
    .map(([key, info]) => {
      if (key === '_meta') return null;
      if ((info as any)['type'] === 'text') return key;
      return null;
    })
    .filter(field => !!field) as Array<string>;
}

export const search =
  async (
    terms: string | { [key: string]: string },
    index?: string,
    highlight?: Array<string>,
  ): Promise<{
    count: number;
    results: Array<SearchResult>;
  }> => {
    let url = `${getVariable('AWS_OPENSEARCH_ENDPOINT')}`
    if (index) url += `/${index}`;
    url += '/_search';

    let body = '';

    if (index) {
      if (!(await getIndexes()).includes(index)) {
        throw new RequestError(`index ${index} does not exist`);
      }
    }

    if (typeof terms === 'string') {
      if (index) {
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
      const request: any = {
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

      if (Array.isArray(highlight) && highlight.length) {
        request.highlight = {
          pre_tags: ["<strong>"],
          post_tags: ["</strong>"],
          fields: Object.fromEntries(highlight.map(field => [field, {}])),
        };
      }

      body = JSON.stringify(request);
    }

    const response = await signedRequest({
      url: new URL(url),
      method: "POST",
      service: "es",
      region: getVariable('AWS_REGION'),
      body,
    });


    const results = response.body?.hits?.hits?.map((result: { _score: number, _source: { [key: string]: unknown }, highlight: any }) => {
      const computedResult = {score: result._score, data: result._source};

      if (result.highlight) {
        Object.entries(result.highlight)
          .forEach(([field, highlights]) => {
            let position: any = computedResult.data;
            const path = `${field}__highlights`.split('.');

            path.forEach((key, index) => {
              if (index === path.length - 1) {
                position[key] = highlights;
              } else {
                position = position[key];
              }
            });
          })
      }

      return computedResult;
    });

    return {
      count: response.body?.hits?.total?.value,
      results,
    }
  };

export const dropIndex = async (index: string): Promise<{
  result: 'failure' | 'success';
  error?: string;
}> => {
  const response = await signedRequest({
    url: new URL(`${getVariable('AWS_OPENSEARCH_ENDPOINT')}/${index}`),
    method: "DELETE",
    service: "es",
    region: getVariable('AWS_REGION'),
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
}, index: string): Promise<{
  id: string;
  index: string;
} | null> => {
  let url = `${getVariable('AWS_OPENSEARCH_ENDPOINT')}`;
  if (index) url += `/${index}`;
  url += '/_search';

  const response = await signedRequest({
    url: new URL(url),
    method: "POST",
    service: "es",
    region: getVariable('AWS_REGION'),
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

  return null;
}
