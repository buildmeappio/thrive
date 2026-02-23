import { type NextRequest, NextResponse } from 'next/server';
import type { Method, RouteCtx, Handler, User } from '@/types/apiBuilder';
import { HttpError } from '@/utils/httpError';
import z, { type ZodObject, type ZodAny, ZodError } from 'zod';

type Validator = ZodObject<any> | ZodAny;

class ApiBuilder<M extends Method | null = Method, TBody extends object = object> {
  private middlewares: Array<(req: NextRequest, ctx: RouteCtx<TBody>) => void | Promise<void>> = [];
  private authFn?: (req: NextRequest, ctx: RouteCtx) => void | Promise<void>;
  private validator?: Validator;
  private errorHandler?: (err: unknown) => Response;
  private method?: M;
  private bound?: Handler<object>;

  use(fn: (req: NextRequest, ctx: RouteCtx) => void | Promise<void>) {
    this.middlewares.push(fn);
    return this;
  }
  auth(fn?: (req: NextRequest, ctx: RouteCtx) => void | Promise<void>) {
    if (!fn) {
      this.authFn = defaultAuth;
      return this;
    }
    this.authFn = fn;
    return this;
  }

  validate<TBody extends object>(arg: Validator): ApiBuilder<Method, TBody> {
    this.validator = arg;
    return this as unknown as ApiBuilder<Method, TBody>;
  }

  onError(fn: (err: unknown) => Response) {
    this.errorHandler = fn;
    return this;
  }

  get<T extends object>(this: ApiBuilder<Method>, h: Handler<T>) {
    this.guard('GET');
    this.method = 'GET' as const;
    this.bound = h as any;
    return this as ApiBuilder<'GET'>;
  }

  post<T extends object>(this: ApiBuilder<Method>, h: Handler<T>) {
    this.guard('POST');
    this.method = 'POST' as const;
    this.bound = h as any;
    return this as ApiBuilder<'POST'>;
  }

  patch<T extends object>(this: ApiBuilder<Method>, h: Handler<T>) {
    this.guard('PATCH');
    this.method = 'PATCH' as const;
    this.bound = h as any;
    return this as ApiBuilder<'PATCH'>;
  }

  delete<T extends object>(this: ApiBuilder<Method>, h: Handler<T>) {
    this.guard('DELETE');
    this.method = 'DELETE' as const;
    this.bound = h as any;
    return this as ApiBuilder<'DELETE'>;
  }

  private guard(m: Method) {
    if (this.method && this.method !== m) {
      throw new Error(`Method already set to ${this.method}. Create a new builder for ${m}.`);
    }
  }

  build() {
    if (!this.method || !this.bound)
      throw new Error('No method bound. Call one of get/post/patch/delete first.');

    const run = async (req: NextRequest, ctx: RouteCtx<TBody> = { body: {} as TBody }) => {
      try {
        if (req.method !== this.method) throw new HttpError(405, 'Method Not Allowed');

        if (this.validator) {
          const body = await jsonIfAny(req);
          const data = await this.validator.safeParseAsync(body);
          if (!data.success) throw new HttpError(400, z.prettifyError(data.error));
          ctx.body = data.data;
        }

        // sequential middlewares, compliant with no-await-in-loop
        await this.middlewares.reduce<Promise<void>>(
          (p, mw) => p.then(() => mw(req, ctx)),
          Promise.resolve()
        );

        if (this.authFn) await this.authFn(req, ctx);

        const result = this?.bound?.(req, ctx) || Promise.resolve({});

        const payload = await result;
        return NextResponse.json(payload, { status: 200 });
      } catch (err) {
        if (this.errorHandler) return this.errorHandler(err);
        return defaultError(err);
      }
    };

    return run;
  }
}

// helpers
async function jsonIfAny(req: NextRequest) {
  const ct = req.headers.get('content-type') ?? '';
  if (!ct.toLowerCase().includes('application/json')) {
    throw new HttpError(400, 'Invalid Content-Type');
  }
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
}

function defaultError(err: unknown) {
  if (err instanceof HttpError) {
    return NextResponse.json(
      { error: err.message, details: err.details ?? null, success: false },
      { status: err.status }
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json({ error: z.prettifyError(err) }, { status: 400 });
  }
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

export const api = () => new ApiBuilder();

const getUser = async (token: string): Promise<User> => {
  console.log('token', token);
  return {
    id: '1',
    name: 'John Doe',
  };
};

const defaultAuth = async (req: NextRequest, ctx: RouteCtx) => {
  const token = req.headers.get('authorization');
  if (!token) throw new HttpError(401, 'Unauthorized');
  const user = await getUser(token);
  ctx.user = user;
};
