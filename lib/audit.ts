import { prisma } from "@/lib/prisma";

export async function logAuditEvent(
  userId: string,
  action: string,
  targetEntity: string,
  targetId: string,
  details?: string
) {
  try {
    await prisma.auditEvent.create({
      data: {
        userId,
        action,
        targetEntity,
        targetId,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
