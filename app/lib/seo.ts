import type { Metadata } from "next";

export const siteConfig = {
  name: "ADTV",
  title: "ADTV — Canlı Haber Duvarı",
  titleEn: "ADTV — Live News Wall",
  description:
    "Türkiye'nin önde gelen haber kanallarını tek ekranda izleyin. Sürükle-bırak düzen, yeniden boyutlandırılabilir 6 panelli canlı yayın duvarı.",
  descriptionEn:
    "Watch leading Turkish news channels on one screen. Drag-and-drop layout with a resizable six-panel live news wall.",
  keywords: [
    "canlı haber",
    "haber izle",
    "Türkiye haber",
    "CNN Türk canlı",
    "TRT Haber canlı",
    "çoklu haber yayını",
    "haber duvarı",
    "live news Turkey",
    "Turkish news live",
    "news wall",
    "ADTV",
  ],
  locale: "tr_TR",
  twitterHandle: "@adtv",
} as const;

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://adtv.vercel.app";
}

export function buildMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "news",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        tr: siteUrl,
        en: `${siteUrl}?lang=en`,
      },
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      alternateLocale: ["en_US"],
      url: siteUrl,
      siteName: siteConfig.name,
      title: siteConfig.title,
      description: siteConfig.description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "ADTV — Canlı Haber Duvarı",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
      images: ["/opengraph-image"],
    },
    icons: {
      icon: "/favicon.ico",
    },
    manifest: "/manifest.webmanifest",
  };
}

export const jsonLd = () => {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    applicationCategory: "NewsApplication",
    operatingSystem: "Web",
    inLanguage: ["tr", "en"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "TRY",
    },
    featureList: [
      "Six-panel live news grid",
      "Drag-and-drop panel layout",
      "Resizable video panels",
      "Turkish and English interface",
    ],
  };
};
