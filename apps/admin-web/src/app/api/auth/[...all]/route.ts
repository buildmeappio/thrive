import { auth } from '@/domains/auth/server/better-auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST, DELETE, PATCH } = toNextJsHandler({
  handler(request) {
    console.log('request', request.url);
    return auth.handler(request);
  },
});
