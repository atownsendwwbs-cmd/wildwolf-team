"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function subscribeToPushAction(subscription: PushSubscriptionInput) {
  const user = await requireUser();

  await db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userId: user.id,
    },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userId: user.id,
    },
  });
}

export async function unsubscribeFromPushAction(endpoint: string) {
  await db.pushSubscription.deleteMany({ where: { endpoint } });
}
