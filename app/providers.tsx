"use client";

import { Suspense, type ReactNode } from "react";
import { AppProvider } from "./providers/AppProvider";

function AppFallback() {
  return (
    <div className="news-shell">
      <header className="news-header">
        <div className="news-brand">
          <span className="news-brand-dot" aria-hidden />
          <h1>ADTV</h1>
        </div>
      </header>
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AppFallback />}>
      <AppProvider>{children}</AppProvider>
    </Suspense>
  );
}
