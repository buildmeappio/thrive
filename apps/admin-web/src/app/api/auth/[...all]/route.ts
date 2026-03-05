import { auth } from '@/domains/auth/server/better-auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';

const handler = toNextJsHandler(auth);

export const { GET, POST, DELETE, PATCH } = handler;
