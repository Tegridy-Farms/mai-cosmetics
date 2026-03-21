import { toResponse } from '@/lib/http/to-response';

export type RouteHandlerCtx = { params: Record<string, string | string[]> };

export function withApiHandler(
  handler: (request: Request, context: RouteHandlerCtx) => Promise<Response>
): (request: Request, context: RouteHandlerCtx) => Promise<Response> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err) {
      return toResponse(err);
    }
  };
}

/** For routes with no dynamic params (GET list, POST collection, etc.). */
export function withApiHandlerNoParams(
  handler: (request: Request) => Promise<Response>
): (request: Request, context: RouteHandlerCtx) => Promise<Response> {
  return withApiHandler((request) => handler(request));
}
