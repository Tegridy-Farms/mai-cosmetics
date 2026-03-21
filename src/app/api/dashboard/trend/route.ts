import { getTrendData } from '@/lib/calculations';
import { json, withApiHandlerNoParams } from '@/lib/http';

export const GET = withApiHandlerNoParams(async () => {
  const months = await getTrendData();
  return json({ months });
});
