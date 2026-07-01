"use client";

import { useState } from "react";
import { LoadingState } from "@/components/ui/states";

/**
 * Renders a migrated legacy calculator (a self-contained HTML file served from
 * /public/modules) inside the authenticated dashboard shell via a sandboxed
 * iframe. This preserves 100% of the original tool's behaviour — including its
 * inline calculation engine and client-side Excel export — while the platform
 * supplies auth, navigation, and layout around it.
 */
export function ModuleFrame({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-[calc(100vh-8.5rem)] w-full overflow-hidden rounded-lg border bg-card">
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <LoadingState label={`Loading ${title}…`} />
        </div>
      ) : null}
      <iframe
        src={src}
        title={title}
        onLoad={() => setLoaded(true)}
        // allow-downloads is required for the calculators' client-side .xlsx
        // export; allow-same-origin keeps localStorage/sessionStorage working.
        sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-forms allow-modals"
        className="h-full w-full border-0"
      />
    </div>
  );
}
