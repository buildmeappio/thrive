import prisma from "@/lib/db";

export async function markContractAsViewedService(contractId: string) {
  return await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: "VIEWED",
      viewedAt: new Date(),
    },
  });
}

export async function createContractViewedEvent(
  contractId: string,
  accountId: string
) {
  return await prisma.contractEvent.create({
    data: {
      contractId,
      eventType: "contract_viewed",
      actorRole: "examiner",
      actorId: accountId,
      meta: {
        viewedFrom: "create_account_page",
      },
    },
  });
}
