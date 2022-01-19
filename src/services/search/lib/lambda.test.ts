import {describe, expect, test} from '@jest/globals';
import {LambdaExtractPayload, RequestError, stringifyResponse} from "./lambda";
import {APIGatewayEventRequestContextV2, APIGatewayProxyEventV2WithRequestContext} from "aws-lambda";

describe('services/search/lib/lambda.LambdaExtractPayload', () => {
  describe('when there is no payload', () => {
    test('returns an empty object', () => {
      expect(LambdaExtractPayload({
        body: '',
        queryStringParameters: {},
      } as unknown as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>)).toEqual({});
    });
  });

  describe('when the payload is in the query string', () => {
    test('parses the payload', () => {
      expect(LambdaExtractPayload({
        body: '',
        queryStringParameters: {
          test: 'test',
        },
      } as unknown as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>)).toEqual({
        test: 'test',
      });
    });
  });

  describe('when the payload is in the path parameters', () => {
    test('parses the payload', () => {
      expect(LambdaExtractPayload({
        body: '',
        queryStringParameters: {},
        pathParameters: {test: 'test'},
      } as unknown as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>)).toEqual({
        test: 'test',
      });
    });
  });

  describe('when the payload is a string in the body', () => {
    test('parses a valid payload', () => {
      expect(LambdaExtractPayload({
        body: JSON.stringify({test: 'test'}),
      } as unknown as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>)).toEqual({
        test: 'test',
      });
    });

    test('throws a request error when the body is not JSON', () => {
      expect(() => LambdaExtractPayload({
        body: '{test: "test"}',
      } as unknown as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>))
        .toThrow(new RequestError("The request body is malformed."));
    });
  });

  describe('when the payload is base64 encoded in the body', () => {
    test('parses a valid payload', () => {
      expect(LambdaExtractPayload({
        body: Buffer.from(JSON.stringify({test: 'test'})).toString('base64'),
        isBase64Encoded: true,
      } as unknown as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>)).toEqual({
        test: 'test',
      });
    });

    test('throws a request error when the body is not JSON', () => {
      expect(() => LambdaExtractPayload({
        body: Buffer.from('{test: "test"}').toString('base64'),
        isBase64Encoded: true,
      } as unknown as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>))
        .toThrow(new RequestError("The request body is malformed."));
    });
  });
});

describe('services/search/lib/lambda.stringifyResponse', () => {
  describe('when there is no response', () => {
    test('when given null returns undefined', () => {
      expect(stringifyResponse(null)).toEqual(undefined);
    });
    test('when given undefined returns undefined', () => {
      expect(stringifyResponse(undefined)).toEqual(undefined);
    });
    test('when given false returns undefined', () => {
      expect(stringifyResponse(false)).toEqual(undefined);
    });
  });

  describe('when there is a response', () => {
    test('orders keys with alphabetical sorting', () => {
      expect(stringifyResponse({
        b: {},
        a: {},
      })).toEqual(JSON.stringify({
        a: {},
        b: {},
      }));
    });

    test('orders nested keys with alphabetical sorting', () => {
      expect(stringifyResponse({
        b: {
          d: {},
          c: {},
        },
        a: {},
      })).toEqual(JSON.stringify({
        a: {},
        b: {
          c: {},
          d: {},
        },
      }));
    });
  });
});
