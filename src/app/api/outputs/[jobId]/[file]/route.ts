import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const ALLOWED = new Set([
  "lyrics.txt",
  "meta.json",
  "tracks.json",
  "demo-note.txt",
  "track-1.mp3",
  "track-2.mp3",
  "suno-error.json",
  "suno-raw.json",
  "suno-poll.json",
]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string; file: string }> },
) {
  const { jobId, file } = await context.params;

  if (!/^[a-z0-9-]{4,64}$/i.test(jobId) || !ALLOWED.has(file)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "output", jobId, file);

  try {
    const data = await readFile(filePath);
    const contentType = file.endsWith(".mp3")
      ? "audio/mpeg"
      : file.endsWith(".json")
        ? "application/json; charset=utf-8"
        : "text/plain; charset=utf-8";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
