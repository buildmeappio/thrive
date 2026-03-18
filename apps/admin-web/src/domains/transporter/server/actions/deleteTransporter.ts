'use server';

export async function deleteTransporter(id: string) {
  const { deleteTransporter: handlerDeleteTransporter } =
    await import('../handlers/deleteTransporter');
  return await handlerDeleteTransporter(id);
}
