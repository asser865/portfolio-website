"use client";

import { useEffect, useState } from "react";

const fmt = () =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "shortOffset",
    timeZone: "Africa/Cairo",
  }).format(new Date());

/**
 * Live local time in Cairo. SSR renders a placeholder so hydration
 * never mismatches; the real clock appears after mount and ticks
 * once a minute. Offset comes from the tz database (Egypt observes
 * DST — never hardcode GMT+2).
 */
export function CairoTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(fmt());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{time ?? "—— ——"}</span>;
}
