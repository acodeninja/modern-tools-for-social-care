export interface SearchResult {
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
