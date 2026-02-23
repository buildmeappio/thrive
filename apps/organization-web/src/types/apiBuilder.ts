import { type NextRequest } from 'next/server';

export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type User = {
  id: string;
  name: string;
};

export type RouteCtx<TBody extends object = object> = {
  params?: Record<string, string | string[]>;
  body: TBody;
  user?: User;
};

// If V is void, handler has 2 args. Otherwise 3rd arg is the validated value.
export type Handler<TData extends object> = (req: NextRequest, ctx: RouteCtx) => Promise<TData>;

export type FnValidator<V> = (req: NextRequest, ctx: RouteCtx) => V | Promise<V>;
export type SchemaLike<V> = { parse: (v: unknown) => V };

export type AnyValidator<V> = FnValidator<V> | SchemaLike<V>;
