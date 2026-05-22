import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "./providers";
import { buildMetadata, jsonLd } from "./lib/seo";
import "./globals.css";

export const metadata: Metadata = buildMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = jsonLd();

  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <Script
          id="adtv-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
