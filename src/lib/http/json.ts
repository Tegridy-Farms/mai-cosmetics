export function json(data: unknown, init?: number | ResponseInit): Response {
  if (typeof init === 'number') {
    return Response.json(data, { status: init });
  }
  return Response.json(data, init);
}
