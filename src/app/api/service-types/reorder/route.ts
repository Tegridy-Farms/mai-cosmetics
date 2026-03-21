import { json, parseJsonBody, parseSchema, withApiHandlerNoParams } from '@/lib/http';
import { applyReorder } from '@/lib/reorder';
import { ReorderBodySchema } from '@/lib/validation/reorder';

export const dynamic = 'force-dynamic';

export const PUT = withApiHandlerNoParams(async (request) => {
  const body = await parseJsonBody(request);
  const { ordered_ids } = parseSchema(ReorderBodySchema, body);

  await applyReorder('service_types', ordered_ids);

  return json({ ok: true });
});
