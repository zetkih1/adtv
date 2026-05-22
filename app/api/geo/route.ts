import { headers } from "next/headers";
import { NextResponse } from "next/server";

const TURKEY = "TR";

function countryFromHeaders(h: Headers): string | null {
  const candidates = [
    "x-vercel-ip-country",
    "cf-ipcountry",
    "x-country-code",
    "cloudfront-viewer-country",
  ];
  for (const name of candidates) {
    const value = h.get(name);
    if (value && value.length === 2) return value.toUpperCase();
  }
  return null;
}

async function countryFromIp(ip: string): Promise<string | null> {
  if (!ip || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip === "::1") {
    return null;
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status?: string;
      countryCode?: string;
    };
    if (data.status === "success" && data.countryCode) {
      return data.countryCode.toUpperCase();
    }
  } catch {
    /* fallback failed */
  }
  return null;
}

export async function GET() {
  const h = await headers();
  let country = countryFromHeaders(h);
  let source: "headers" | "ip-api" | "unknown" = country ? "headers" : "unknown";

  if (!country) {
    const forwarded = h.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      h.get("cf-connecting-ip") ??
      null;
    if (ip) {
      country = await countryFromIp(ip);
      if (country) source = "ip-api";
    }
  }

  return NextResponse.json({
    country,
    inTurkey: country === TURKEY,
    source,
  });
}
