"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Invisible — just re-fetches the current page's server data on an
// interval so a screen left running (e.g. a warehouse monitor) stays
// live without anyone touching it.
export default function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);

  return null;
}
