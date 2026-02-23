// import { api } from '@/lib/apiBuilder';
// import z from 'zod';

// export const GET = api()
//   .auth()
//   .validate(
//     z.object({
//       email: z.email({
//         message: 'Invalid email',
//       }),
//     })
//   )
//   .get(async () => {
//     return {
//       message: 'Hello, world!',
//     };
//   })
//   .build();

export async function GET() {
  // logic
}

// import SuccessMessages from '@/constants/SuccessMessages';
// // import { acceptOrganizationAction } from '@/features/organization/organization.actions';
// import { api } from '@/lib/apiBuilder';
// import z from 'zod';

// export const PATCH = api()
//   .validate(z.object({ id: z.string() }))
//   .patch(async ({ body }) => {
//     console.log('body', body);
//     if (!body) {
//       throw new Error('Request body is missing');
//     }
//     // const result = await acceptOrganizationAction(body.id);
//     const result = null;
//     return {
//       success: true,
//       message: SuccessMessages.ORG_ACCEPTED,
//       data: result,
//     };
//   })
//   .build();
