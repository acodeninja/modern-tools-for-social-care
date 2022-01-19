# Search Service

## Developing an integration

Requirements

* nodejs >=14
* aws cli
* aws sam cli
* docker

To start the local development server run `.bin/mtsc dev search`. The search
engine will be seeded with data that can be used with the examples given later
in this document.

Once the dev server is started you can see logs for the various processes under
`/logs/search`.

## Technical Documentation

### Domain

```typescript
interface SearchResult {
  score: number;
  data: {
    _meta: {
      location: {
        frontend: string;
        api: string;
      };
      domain: string;
      compound: string;
    };
    [key: string]: unknown;
  }
}
```

### Actions

* [Search](#search---get-)
* [Update](#update---put-)
* [Drop Index](#drop-index---delete-index)

#### Search - `GET /`

```typescript
interface Payload {
  terms?: string;
  index?: string;
  highlight?: string;
  [key: string]: string;
}

interface Response {
  count: number;
  results: Array<SearchResult>;
}
```

##### Examples

Assuming the following item has been uploaded to the search service.

```typescript
const item = {
  _meta: {
    domain: 'entity',
    location: {
      api: 'https://service-api/entity/1',
      frontend: 'https://service-website/entity/1',
    },
  },
  printable: "Chandler Bing E8 0AA",
  name: 'Chandler Bing',
  address: {
    address: '123 Somewhere Pl. Hackney',
    postcode: 'E8 0AA',
  },
};
```

Search all indexes for a string (very inaccurate and relatively slow).

```http request
GET /?terms=Chandler
```

<details>
  <summary>Response</summary>

```json
{
  "count": 1,
  "results": [
    {
      "_meta": {
        "domain": "entity",
        "location": {
          "api": "https://service-api/entity/1",
          "frontend": "https://service-website/entity/1"
        }
      },
      "printable": "Chandler Bing E8 0AA",
      "name": "Chandler Bing",
      "address": {
        "address": "123 Somewhere Pl. Hackney",
        "postcode": "E8 0AA"
      }
    }
  ]
}
```

</details>


Search a specific index for a string (more accurate and very slow).

```http request
GET /?index=entities&terms=search term
```

<details>
  <summary>Response</summary>

```json
{
  "count": 1,
  "results": [
    {
      "_meta": {
        "domain": "entity",
        "location": {
          "api": "https://service-api/entity/1",
          "frontend": "https://service-website/entity/1"
        }
      },
      "printable": "Chandler Bing E8 0AA",
      "name": "Chandler Bing",
      "address": {
        "address": "123 Somewhere Pl. Hackney",
        "postcode": "E8 0AA"
      }
    }
  ]
}
```

</details>

Search a specific index and a specific field for a string (more accurate and relatively fast).

```http request
GET /?index=entities&name=chandler
```

<details>
  <summary>Response</summary>

```json
{
  "count": 1,
  "results": [
    {
      "_meta": {
        "domain": "entity",
        "location": {
          "api": "https://service-api/entity/1",
          "frontend": "https://service-website/entity/1"
        }
      },
      "printable": "Chandler Bing E8 0AA",
      "name": "Chandler Bing",
      "address": {
        "address": "123 Somewhere Pl. Hackney",
        "postcode": "E8 0AA"
      }
    }
  ]
}
```

</details>

Search a specific index and multiple specific fields for a string (more accurate and relatively fast).

```http request
GET /?index=entities&name=chandler&address.postcode=E8
```

<details>
  <summary>Response</summary>

```json
{
  "count": 1,
  "results": [
    {
      "_meta": {
        "domain": "entity",
        "location": {
          "api": "https://service-api/entity/1",
          "frontend": "https://service-website/entity/1"
        }
      },
      "printable": "Chandler Bing E8 0AA",
      "name": "Chandler Bing",
      "address": {
        "address": "123 Somewhere Pl. Hackney",
        "postcode": "E8 0AA"
      }
    }
  ]
}
```

</details>

Search a specific index and a specific field for a string, highlighting the result (more accurate and relatively fast).

```http request
GET /?index=entities&name=chandler&highlight=name
```

<details>
  <summary>Response</summary>

```json
{
  "count": 1,
  "results": [
    {
      "_meta": {
        "domain": "entity",
        "location": {
          "api": "https://service-api/entity/1",
          "frontend": "https://service-website/entity/1"
        }
      },
      "printable": "Chandler Bing E8 0AA",
      "name": "Chandler Bing",
      "name__highlights": [
        "<strong>Chandler</strong> Bing"
      ],
      "address": {
        "address": "123 Somewhere Pl. Hackney",
        "postcode": "E8 0AA"
      }
    }
  ]
}
```

</details>

#### Update - `PUT /`

```typescript
interface Payload {
  index: string;
  items: Array<{
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

interface Response {
  result: 'failure' | 'success';
  error?: unknown;
}
```

##### Examples

Put a new entity to the entities index.

```http request
PUT /
Content-Type: application/json

{
  "index": "entities",
  "items": [
    {
      "_meta": {
        "domain": "entity",
        "location": {
          "api": "https://service-api/entity/1",
          "frontend": "https://service-website/entity/1"
        }
      },
      "printable": "Chandler Bing E8 0AA",
      "name": "Chandler Bing",
      "address": {
        "address": "123 Somewhere Pl. Hackney",
        "postcode": "E8 0AA"
      }
    }
  ]
}
```

**Response**

```json
{"result": "success"}
```

#### Drop Index - `DELETE /{index}`

```typescript
interface Payload {
  index: string;
}

interface Response {
  result: 'failure' | 'success';
  error?: unknown;
}
```

##### Examples

Drop an index from the search engine.

```http request
DELETE /entities
```

**Response**

```json
{"result": "success"}
```
