import { api } from '@/lib/apiBuilder';
import z from 'zod';

export const GET = api()
  .auth()
  .validate(
    z.object({
      email: z.email({
        message: 'Invalid email',
      }),
    })
  )
  .get(async () => {
    return {
      message: 'Hello, world!',
    };
  })
  .build();
