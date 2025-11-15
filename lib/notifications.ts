import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  relatedEntity?: string,
  relatedId?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        relatedEntity,
        relatedId,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function markAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}
