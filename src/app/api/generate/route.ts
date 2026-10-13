import { NextResponse } from "next/server";
import { GENRES } from "@/lib/genres";
import { runSongPipeline } from "@/lib/pipeline";
import type { GenerateSongInput, Language, VocalGender } from "@/lib/types";

export const maxDuration = 300;

const LANGUAGES = new Set<Language>(["th", "en", "mixed"]);
const VOCALS = new Set<VocalGender>(["male", "female", "unspecified"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<GenerateSongInput>;
    const genreId = String(body.genreId || "").trim();
    const theme = String(body.theme || "").trim();
    const mood = String(body.mood || "").trim();
    const language = (body.language || "th") as Language;
    const vocalGender = (body.vocalGender || "unspecified") as VocalGender;
    const title = body.title ? String(body.title).trim() : undefined;

    if (!GENRES.some((g) => g.id === genreId)) {
      return NextResponse.json(
        { error: "กรุณาเลือกแนวเพลงที่รองรับ" },
        { status: 400 },
      );
    }

    if (theme.length < 3) {
      return NextResponse.json(
        { error: "กรุณาใส่หัวข้อ/ธีมอย่างน้อย 3 ตัวอักษร" },
        { status: 400 },
      );
    }

    if (!LANGUAGES.has(language)) {
      return NextResponse.json({ error: "ภาษาไม่ถูกต้อง" }, { status: 400 });
    }

    if (!VOCALS.has(vocalGender)) {
      return NextResponse.json(
        { error: "ตัวเลือกเสียงร้องไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const result = await runSongPipeline({
      genreId,
      theme,
      mood,
      language,
      vocalGender,
      title,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "สร้างเพลงไม่สำเร็จ กรุณาลองใหม่",
      },
      { status: 500 },
    );
  }
}
