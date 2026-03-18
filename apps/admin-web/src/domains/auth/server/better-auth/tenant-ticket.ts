import 'server-only';

import crypto from 'node:crypto';
import masterDb from '@thrive/database-master/db';
import { TenantUserRole } from '@thrive/database-master';

const tenantTicketTtlSeconds = Number(process.env.TENANT_LOGIN_TICKET_TTL ?? 60);

export type TenantTicketData = {
  ticket: string;
  tenantId: string;
  keycloakSub: string;
  role: TenantUserRole;
  nextPath: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

type CreateTenantTicketInput = {
  tenantId: string;
  keycloakSub: string;
  role: TenantUserRole;
  nextPath: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

function hashTicket(ticket: string): string {
  return crypto.createHash('sha256').update(ticket).digest('hex');
}

export async function createTenantLoginTicket(input: CreateTenantTicketInput): Promise<string> {
  const ticket = crypto.randomBytes(32).toString('base64url');
  const ticketHash = hashTicket(ticket);
  const expiresAt = new Date(Date.now() + tenantTicketTtlSeconds * 1000);

  await masterDb.tenantLoginTicket.create({
    data: {
      ticketHash,
      tenantId: input.tenantId,
      keycloakSub: input.keycloakSub,
      role: input.role,
      nextPath: input.nextPath,
      expiresAt,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      email: input.email ?? null,
    },
  });

  return ticket;
}

export async function consumeTenantLoginTicket(ticket: string): Promise<TenantTicketData | null> {
  const ticketHash = hashTicket(ticket);
  const now = new Date();

  const consumed = await masterDb.$transaction(async tx => {
    const existing = await tx.tenantLoginTicket.findFirst({
      where: {
        ticketHash,
        consumedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    });

    if (!existing) return null;

    const updateResult = await tx.tenantLoginTicket.updateMany({
      where: {
        id: existing.id,
        consumedAt: null,
      },
      data: {
        consumedAt: now,
      },
    });

    if (updateResult.count !== 1) return null;
    return existing;
  });

  if (!consumed) return null;

  return {
    ticket,
    tenantId: consumed.tenantId,
    keycloakSub: consumed.keycloakSub,
    role: consumed.role,
    nextPath: consumed.nextPath,
    firstName: consumed.firstName ?? null,
    lastName: consumed.lastName ?? null,
    email: consumed.email ?? null,
  };
}
