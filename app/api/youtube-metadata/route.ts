import { NextResponse } from "next/server";
import { toWatchUrl } from "@/app/lib/youtube";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const watchUrl = toWatchUrl(url);
  if (!watchUrl) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
    const res = await fetch(oembedUrl, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch video metadata" },
        { status: res.status }
      );
    }
    const data = (await res.json()) as { title?: string; author_name?: string };
    return NextResponse.json({
      title: data.title ?? null,
      author: data.author_name ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
