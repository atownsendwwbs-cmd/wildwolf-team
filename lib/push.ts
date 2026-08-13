import "server-only";
import webpush from "web-push";
import { db } from "./db";
import type { Lang, Role } from "./generated/prisma/enums";
import { MANAGER_ROLES } from "./auth";

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

// Notifies every Manager/Admin except the person who triggered the event
// (e.g. so reporting your own low-inventory item doesn't ping yourself).
export async function notifyManagers(
  excludeUserId: string,
  payloads: Record<Lang, PushPayload>,
  roles: Role[] = MANAGER_ROLES
) {
  const recipients = await db.user.findMany({
    where: { role: { in: roles }, active: true, id: { not: excludeUserId } },
    select: { id: true },
  });
  if (recipients.length === 0) return;
  await sendLocalizedPushToUsers(recipients.map((r) => r.id), payloads);
}

// Notifies a single user, unless they're the one who triggered the event.
export async function notifyUser(
  userId: string,
  excludeUserId: string,
  payloads: Record<Lang, PushPayload>
) {
  if (userId === excludeUserId) return;
  await sendLocalizedPushToUsers([userId], payloads);
}

// Same as sendPushToUsers, but sends each recipient the payload matching
// their own preferredLang (e.g. an announcement posted in Spanish shows up
// in English for someone who prefers English).
export async function sendLocalizedPushToUsers(
  userIds: string[] | "all",
  payloads: Record<Lang, PushPayload>
) {
  if (!isConfigured()) return;
  configure();

  const subscriptions = await db.pushSubscription.findMany({
    where: userIds === "all" ? {} : { userId: { in: userIds } },
    include: { user: { select: { preferredLang: true } } },
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        const payload = payloads[sub.user.preferredLang];
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
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
