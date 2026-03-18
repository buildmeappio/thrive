'use server';

import type { UpdateTransporterData } from '../../types/TransporterData';

export async function updateTransporter(id: string, data: UpdateTransporterData) {
  const { updateTransporter: handlerUpdateTransporter } =
    await import('../handlers/updateTransporter');
  return await handlerUpdateTransporter(id, data);
}
