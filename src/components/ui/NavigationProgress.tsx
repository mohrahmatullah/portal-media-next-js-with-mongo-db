"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type State = "idle" | "loading" | "done";

/**
 * A zero-dependency top progress bar for App Router client navigations.
 * Starts on internal link clicks and back/forward, completes when the
 * destination route finishes rendering (path or query change).
 */
function Bar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>("idle");
  const firstRender = useRef(true);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Complete the bar whenever the route has finished changing.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setState("done");
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setState("idle"), 400);
  }, [pathname, searchParams]);

  // Start the bar on internal navigations (link clicks + browser back/forward).
  useEffect(() => {
    function start() {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      setState("loading");
    }

    function onClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.getAttribute("target") === "_blank") return;
      if (anchor.hasAttribute("download")) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // Same URL = no navigation, don't start.
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }
      start();
    }

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", start);
    };
  }, []);

  return <div className={`nav-progress nav-progress--${state}`} aria-hidden="true" />;
}

export default function NavigationProgress() {
  // useSearchParams() requires a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
