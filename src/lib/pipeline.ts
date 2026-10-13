import { randomUUID } from "node:crypto";
import path from "node:path";
import { generateLyrics } from "./lyrics";
import { generateMusic } from "./music";
import type { GenerateSongInput, SongJobResult } from "./types";

export async function runSongPipeline(
  input: GenerateSongInput,
): Promise<SongJobResult> {
  const jobId = randomUUID().slice(0, 8);
  const outputDir = path.join(process.cwd(), "output", jobId);
  const notes: string[] = [];

  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasSuno = Boolean(process.env.SUNO_API_KEY);
  const mode: "live" | "demo" = hasOpenAI || hasSuno ? "live" : "demo";

  if (!hasOpenAI) {
    notes.push("ไม่มี OPENAI_API_KEY — ใช้เนื้อเพลง demo");
  }
  if (!hasSuno) {
    notes.push("ไม่มี SUNO_API_KEY — ข้ามการสร้างเสียงจริง");
  }

  const lyrics = await generateLyrics(input);
  const music = await generateMusic({ jobId, input, lyrics, outputDir });

  return {
    jobId,
    mode,
    input,
    lyrics,
    tracks: music.tracks,
    outputDir,
    createdAt: new Date().toISOString(),
    notes: [...notes, ...music.notes],
  };
}
