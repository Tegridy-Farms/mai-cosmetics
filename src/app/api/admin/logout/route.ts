import { cookies } from 'next/headers';
import { json, withApiHandlerNoParams } from '@/lib/http';

const AUTH_COOKIE_NAME = 'admin_auth';

export const POST = withApiHandlerNoParams(async () => {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return json({ ok: true });
});
