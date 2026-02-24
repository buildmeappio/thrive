import { api } from '@/lib/apiBuilder';
import { z } from 'zod';
import { login } from '@/domains/auth/server/handlers/login';

// Mark route as dynamic to prevent static analysis during build
export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginData = z.infer<typeof loginSchema>;

export const POST = api()
  .validate(loginSchema)
  .post(async (req, ctx) => {
    const authDto = await login(ctx.body as LoginData);
    return { message: 'Login successful', data: authDto };
  })
  .build();
