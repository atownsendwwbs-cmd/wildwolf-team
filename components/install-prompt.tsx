"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "wwb_install_prompt_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Status =
  | { platform: "ios" }
  | { platform: "android"; deferredPrompt: BeforeInstallPromptEvent | null };

export default function InstallPrompt() {
  const [status, setStatus] = useState<Status | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);

    // Detection here only ever reacts to the browser's own async signal
    // (a same-tick microtask for iOS, the beforeinstallprompt event for
    // Android) rather than setting state synchronously as the effect runs.
    if (isIos) {
      queueMicrotask(() => {
        setStatus({ platform: "ios" });
        setDismissed(false);
      });
    } else if (isAndroid) {
      const handler = (e: Event) => {
        e.preventDefault();
        setStatus({ platform: "android", deferredPrompt: e as BeforeInstallPromptEvent });
        setDismissed(false);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  }

  async function install() {
    if (!status || status.platform !== "android" || !status.deferredPrompt) return;
    await status.deferredPrompt.prompt();
    await status.deferredPrompt.userChoice;
    dismiss();
  }

  if (dismissed || !status) return null;

  return (
    <div className="border-b border-orange-200 bg-orange-50">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
        {status.platform === "ios" ? (
          <p className="text-orange-800">
            Add this to your home screen: tap <strong>Share</strong>{" "}
            <span aria-hidden>⬆️</span> then <strong>Add to Home Screen</strong>.
          </p>
        ) : (
          <p className="text-orange-800">Install this app for quick access from your home screen.</p>
        )}
        <div className="flex items-center gap-3 shrink-0">
          {status.platform === "android" && status.deferredPrompt && (
            <button
              type="button"
              onClick={install}
              className="text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-md px-3 py-1 transition-colors"
            >
              Install
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="text-orange-700 hover:text-black"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
