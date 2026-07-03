import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiSession } from "@/lib/auth/require-session";
import { generateOrRetrieveAudio, TtsError } from "@/lib/tts/service";

export const runtime = "nodejs";

const requestSchema = z.object({
  paragraphId: z.string().min(1).max(200),
});

/**
 * POST /api/tts — generate or retrieve cached narration for a paragraph.
 *
 * Accepts `{ paragraphId }` only — never arbitrary text. The paragraph text
 * is resolved server-side from the reviewed content registry, so a client
 * cannot inject unreviewed prose into TTS generation.
 *
 * Returns `{ cacheKey, status }` where `status` is `"hit"` (served from
 * cache, no Rime call) or `"generated"` (newly created).
 */
export async function POST(request: Request): Promise<Response> {
  await requireApiSession();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Expected { paragraphId: string }" },
      { status: 400 },
    );
  }

  try {
    const result = await generateOrRetrieveAudio(parsed.data.paragraphId);
    const cacheKey = result.audioPath.replace(/^tts\//, "").replace(/\.mp3$/, "");
    return NextResponse.json({ cacheKey, status: result.status });
  } catch (error) {
    if (error instanceof TtsError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
