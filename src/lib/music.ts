import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GenerateSongInput, LyricsResult, MusicTrack } from "./types";

const SUNO_BASE = process.env.SUNO_API_BASE || "https://www.suno-api.io";

interface SunoSong {
  song_id?: string;
  id?: string;
  title?: string;
  audio_url?: string;
  audioUrl?: string;
  duration?: number;
  duration_s?: number;
}

function pickSongs(payload: unknown): SunoSong[] {
  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;
  const candidates = [data.songs, data.data, data.results, data.items];
  for (const c of candidates) {
    if (Array.isArray(c)) return c as SunoSong[];
  }
  if (Array.isArray(payload)) return payload as SunoSong[];
  return [];
}

async function downloadToFile(url: string, filePath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download audio (${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(filePath, buf);
}

function buildDemoTracks(
  jobId: string,
  lyrics: LyricsResult,
  outputDir: string,
): MusicTrack[] {
  return [
    {
      id: `${jobId}-demo-a`,
      title: `${lyrics.title} (Demo A)`,
      audioUrl: null,
      localPath: path.join(outputDir, "demo-note.txt"),
      durationSeconds: null,
      source: "demo",
    },
    {
      id: `${jobId}-demo-b`,
      title: `${lyrics.title} (Demo B)`,
      audioUrl: null,
      localPath: path.join(outputDir, "demo-note.txt"),
      durationSeconds: null,
      source: "demo",
    },
  ];
}

export async function generateMusic(params: {
  jobId: string;
  input: GenerateSongInput;
  lyrics: LyricsResult;
  outputDir: string;
}): Promise<{ tracks: MusicTrack[]; notes: string[] }> {
  const { jobId, input, lyrics, outputDir } = params;
  const notes: string[] = [];
  await mkdir(outputDir, { recursive: true });

  await writeFile(
    path.join(outputDir, "lyrics.txt"),
    `# ${lyrics.title}\n\n${lyrics.lyrics}\n`,
    "utf8",
  );
  await writeFile(
    path.join(outputDir, "meta.json"),
    JSON.stringify(
      {
        jobId,
        input,
        lyrics,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );

  if (!process.env.SUNO_API_KEY) {
    await writeFile(
      path.join(outputDir, "demo-note.txt"),
      [
        "GuyMusicStation DEMO MODE",
        "",
        "No SUNO_API_KEY found. Lyrics were saved.",
        "Add SUNO_API_KEY to .env.local to generate real audio via suno-api.io",
        `Style tags: ${lyrics.styleTags}`,
      ].join("\n"),
      "utf8",
    );
    notes.push("รันในโหมด demo — ยังไม่มี SUNO_API_KEY จึงยังไม่สร้างไฟล์เสียงจริง");
    return { tracks: buildDemoTracks(jobId, lyrics, outputDir), notes };
  }

  const vocalGender =
    input.vocalGender === "unspecified" ? undefined : input.vocalGender;

  const body = {
    model: process.env.SUNO_MODEL || "suno-v6",
    lyrics: lyrics.lyrics,
    style_tags: lyrics.styleTags,
    song_title: lyrics.title.slice(0, 100),
    ...(vocalGender ? { vocal_gender: vocalGender } : {}),
    accept_mode: "async",
  };

  const createRes = await fetch(`${SUNO_BASE}/api/music/create/custom`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
      "Content-Type": "application/json",
      "X-Accept-Mode": "async",
    },
    body: JSON.stringify(body),
  });

  const createJson = (await createRes.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!createRes.ok) {
    notes.push(
      `Suno API error ${createRes.status}: ${JSON.stringify(createJson).slice(0, 300)}`,
    );
    await writeFile(
      path.join(outputDir, "suno-error.json"),
      JSON.stringify(createJson, null, 2),
      "utf8",
    );
    return { tracks: buildDemoTracks(jobId, lyrics, outputDir), notes };
  }

  const requestId =
    (createJson.request_id as string | undefined) ||
    (createJson.requestId as string | undefined) ||
    (createJson.id as string | undefined);

  let songs = pickSongs(createJson);

  if (requestId && songs.length === 0) {
    notes.push(`รอผลจาก Suno request_id=${requestId}`);
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const poll = await fetch(`${SUNO_BASE}/api/music/requests/${requestId}`, {
        headers: { Authorization: `Bearer ${process.env.SUNO_API_KEY}` },
      });
      const pollJson = (await poll.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      songs = pickSongs(pollJson);
      const status = String(pollJson.status || pollJson.state || "");
      if (songs.length > 0) break;
      if (/fail|error/i.test(status)) {
        notes.push(`Suno request failed: ${status}`);
        await writeFile(
          path.join(outputDir, "suno-poll.json"),
          JSON.stringify(pollJson, null, 2),
          "utf8",
        );
        break;
      }
    }
  }

  const tracks: MusicTrack[] = [];
  for (const [index, song] of songs.slice(0, 2).entries()) {
    const id = String(song.song_id || song.id || `${jobId}-${index}`);
    const audioUrl = song.audio_url || song.audioUrl || null;
    let localPath: string | null = null;
    if (audioUrl) {
      const fileName = `track-${index + 1}.mp3`;
      localPath = path.join(outputDir, fileName);
      try {
        await downloadToFile(audioUrl, localPath);
      } catch (err) {
        notes.push(
          `ดาวน์โหลดแทร็ก ${index + 1} ไม่สำเร็จ: ${err instanceof Error ? err.message : String(err)}`,
        );
        localPath = null;
      }
    }
    tracks.push({
      id,
      title: song.title || `${lyrics.title} (${index + 1})`,
      audioUrl,
      localPath,
      durationSeconds: song.duration_s ?? song.duration ?? null,
      source: "suno",
    });
  }

  if (tracks.length === 0) {
    notes.push("Suno ยังไม่คืนแทร็ก — เก็บ lyrics ไว้แล้ว และบันทึก response ดิบ");
    await writeFile(
      path.join(outputDir, "suno-raw.json"),
      JSON.stringify(createJson, null, 2),
      "utf8",
    );
    return { tracks: buildDemoTracks(jobId, lyrics, outputDir), notes };
  }

  await writeFile(
    path.join(outputDir, "tracks.json"),
    JSON.stringify(tracks, null, 2),
    "utf8",
  );

  notes.push(`สร้างเสียงสำเร็จ ${tracks.length} แทร็ก`);
  return { tracks, notes };
}
