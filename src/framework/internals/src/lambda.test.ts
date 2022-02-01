import {describe, expect, test} from '@jest/globals';
import {LambdaExtractPayload, LambdifyHandler, RequestError, ServerError, stringifyResponse} from "./lambda";
import {APIGatewayEventRequestContextV2, APIGatewayProxyEventV2WithRequestContext, Context} from "aws-lambda";

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

describe('services/search/lib/lambda.LambdifyHandler', () => {
  describe('when there is a successful response', () => {
    const mockSuccessHandler = jest.fn().mockResolvedValue({});
    let response;

    beforeAll(async () => {
      response = await (LambdifyHandler(mockSuccessHandler))(
        {
          body: '',
          isBase64Encoded: false,
        } as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>,
        {} as Context,
        jest.fn(),
      );
    });

    test('calls the handler function', () => {
      expect(mockSuccessHandler).toHaveBeenCalled();
    });

    test('returns a successful response', () => {
      expect(response).toEqual({
        statusCode: 200,
        body: '{}',
        isBase64Encoded: false,
      })
    });
  });

  describe('when there is a request error', () => {
    const mockRequestErrorHandler = jest.fn().mockRejectedValue(new RequestError("request error"));
    let response;

    beforeAll(async () => {
      response = await (LambdifyHandler(mockRequestErrorHandler))(
        {
          body: '',
          isBase64Encoded: false,
        } as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>,
        {} as Context,
        jest.fn(),
      );
    });

    test('calls the handler function', () => {
      expect(mockRequestErrorHandler).toHaveBeenCalled();
    });

    test('returns a request error response', () => {
      expect(response).toEqual({
        statusCode: 400,
        body: '{"message":"request error"}',
        isBase64Encoded: false,
      })
    });
  });

  describe('when there is a server error', () => {
    const mockServerErrorHandler = jest.fn().mockRejectedValue(new ServerError("server error"));
    let response;

    beforeAll(async () => {
      response = await (LambdifyHandler(mockServerErrorHandler))(
        {
          body: '',
          isBase64Encoded: false,
        } as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>,
        {} as Context,
        jest.fn(),
      );
    });

    test('calls the handler function', () => {
      expect(mockServerErrorHandler).toHaveBeenCalled();
    });

    test('returns a request error response', () => {
      expect(response).toEqual({
        statusCode: 500,
        body: '{"message":"server error"}',
        isBase64Encoded: false,
      })
    });
  });

  describe('when there is an unhandled error', () => {
    const mockUnhandledErrorHandler = jest.fn().mockRejectedValue(new Error("unhandled error"));
    let response;

    beforeAll(async () => {
      response = await (LambdifyHandler(mockUnhandledErrorHandler))(
        {
          body: '',
          isBase64Encoded: false,
        } as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>,
        {} as Context,
        jest.fn(),
      );
    });

    test('calls the handler function', () => {
      expect(mockUnhandledErrorHandler).toHaveBeenCalled();
    });

    test('returns a request error response', () => {
      expect(response).toEqual({
        statusCode: 500,
        body: '{"message":"unhandled error"}',
        isBase64Encoded: false,
      })
    });
  });
});
