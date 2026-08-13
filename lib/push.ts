import "server-only";
import webpush from "web-push";
import { db } from "./db";

function isConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT
  );
}

function configure() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

// Sends to specific users' devices, or every subscribed device when
// `userIds` is "all" (used for warehouse-wide announcements). Silently
// no-ops if VAPID keys aren't configured, and prunes subscriptions the
// push service reports as gone (uninstalled app, expired, etc).
export async function sendPushToUsers(userIds: string[] | "all", payload: PushPayload) {
  if (!isConfigured()) return;
  configure();

  const subscriptions = await db.pushSubscription.findMany({
    where: userIds === "all" ? {} : { userId: { in: userIds } },
  });

  const body = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    })
  );
}
