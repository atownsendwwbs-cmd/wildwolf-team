"use client";

import { useEffect, useState } from "react";
import { subscribeToPushAction, unsubscribeFromPushAction } from "@/lib/actions/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Support = "checking" | "unsupported" | "ios-needs-install" | "denied" | "subscribed" | "available";

export default function NotificationOptIn() {
  const [support, setSupport] = useState<Support>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        setSupport("unsupported");
        return;
      }

      const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
      if (isIos && !isStandalone) {
        setSupport("ios-needs-install");
        return;
      }

      if (Notification.permission === "denied") {
        setSupport("denied");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      setSupport(existing ? "subscribed" : "available");
    }

    check().catch(() => setSupport("unsupported"));
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setSupport("denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = subscription.toJSON();
      await subscribeToPushAction({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      setSupport("subscribed");
    } catch {
      setError("Couldn't enable notifications. Try again in a bit.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await unsubscribeFromPushAction(endpoint);
      }
      setSupport("available");
    } catch {
      setError("Couldn't turn off notifications. Try again in a bit.");
    } finally {
      setBusy(false);
    }
  }

  if (support === "checking" || support === "unsupported") return null;

  if (support === "ios-needs-install") {
    return (
      <p className="text-xs text-neutral-500">
        Add this app to your home screen first to get push notifications on iPhone.
      </p>
    );
  }

  if (support === "denied") {
    return (
      <p className="text-xs text-neutral-500">
        Notifications are blocked in your browser settings — enable them there to get task and
        announcement alerts.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={support === "subscribed" ? disable : enable}
        className={`text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors disabled:opacity-60 ${
          support === "subscribed"
            ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            : "border-orange-600 text-orange-400 hover:bg-orange-950/40"
        }`}
      >
        {support === "subscribed"
          ? "Notifications on"
          : busy
            ? "Enabling…"
            : "Enable notifications"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
