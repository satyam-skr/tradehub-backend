import { prisma } from "../db/prisma.js";

export async function auditLog(
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  metadata: any,
  tx?: any
) {
  const client = tx ?? prisma;

  await client.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      metadata
    }
  });
}
