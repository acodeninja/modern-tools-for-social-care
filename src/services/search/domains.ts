export class SearchResult {
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
    _highlights: { [key: string]: Array<string> };
    [key: string]: unknown;
  }
}
