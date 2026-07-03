import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/require-session";
import { getAudioStream } from "@/lib/tts/blob";

export const runtime = "nodejs";

/**
 * GET /api/audio/[cacheKey] — stream a private cached MP3.
 *
 * The audio object lives in private Vercel Blob storage and is never
 * accessible via a public URL. This route authenticates the session, reads
 * the blob, and streams it as `audio/mpeg` with `X-Content-Type-Options:
 * nosniff` and private cache headers. No range handling in the first
 * release — paragraph audio is small enough to serve as a complete object.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cacheKey: string }> },
): Promise<Response> {
  const authResponse = await requireApiSession();
  if (authResponse) return authResponse;

  const { cacheKey } = await params;

  // Only allow the tts/ prefix pattern; reject anything that looks like a
  // path traversal or non-audio object.
  if (!/^[a-f0-9]+$/.test(cacheKey)) {
    return NextResponse.json({ error: "Invalid cache key" }, { status: 400 });
  }

  const pathname = `tts/${cacheKey}.mp3`;

  let audio: { stream: ReadableStream<Uint8Array>; size: number | undefined };
  try {
    audio = await getAudioStream(pathname);
  } catch {
    return NextResponse.json({ error: "Audio not found" }, { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "audio/mpeg",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private",
  };
  if (audio.size) {
    headers["Content-Length"] = String(audio.size);
  }

  return new Response(audio.stream, { headers });
}
