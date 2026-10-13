import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getGenre } from "./genres";
import type { GenerateSongInput, LyricsResult } from "./types";

function buildDemoLyrics(input: GenerateSongInput): LyricsResult {
  const genre = getGenre(input.genreId);
  const theme = input.theme.trim() || "คืนที่เมืองยังไม่หลับ";
  const title =
    input.title?.trim() ||
    (input.language === "en" ? "Midnight Frequency" : "คลื่นความถี่เที่ยงคืน");

  const th = `[Verse 1]
${theme}
แสงไฟกระพริบบนถนนเปียก
ใจยังเดินต่อทั้งที่เหนื่อยนัก
แต่ยังมีจังหวะให้ลุกขึ้นอีกครั้ง

[Pre-Chorus]
หายใจเข้าลึก ๆ แล้วปล่อยไป
ทุกคำที่ค้างไว้ในใจ

[Chorus]
เราจะร้องให้ดังกว่าเสียงฝน
ให้คืนนี้จำชื่อเราได้สักคน
${genre.labelTh} ในเส้นเลือดและในลมหายใจ
GuyMusicStation จุดไฟในเพลงนี้

[Verse 2]
เรื่องราวพับเก็บไว้ในกระเป๋าเก่า
แต่ท่อนฮุคยังดังก้องในหัว
ก้าวเล็ก ๆ บนทางที่ยังไม่ชัด
ก็พอให้เริ่มต้นใหม่วันนี้

[Bridge]
ถ้าโลกเงียบไปชั่วครู่
ปล่อยให้เมโลดี้พาเราไปต่อ

[Chorus]
เราจะร้องให้ดังกว่าเสียงฝน
ให้คืนนี้จำชื่อเราได้สักคน
${genre.labelTh} ในเส้นเลือดและในลมหายใจ
GuyMusicStation จุดไฟในเพลงนี้`;

  const en = `[Verse 1]
${theme}
City lights flicker on wet streets
Tired feet keep finding the beat
There's still a rhythm to rise again

[Pre-Chorus]
Breathe it in, then let it go
Every word we never showed

[Chorus]
We'll sing louder than the rain
Leave a name this night can claim
${genre.label} running through the wire
GuyMusicStation sparks the fire

[Verse 2]
Old stories folded in a worn-out bag
But the hook still echoes back
Small steps on a road half-drawn
Are enough to start at dawn

[Bridge]
If the world goes quiet for a while
Let the melody carry us another mile

[Chorus]
We'll sing louder than the rain
Leave a name this night can claim
${genre.label} running through the wire
GuyMusicStation sparks the fire`;

  const mixed = `[Verse 1]
${theme}
ไฟเมืองกระพริบ on a quiet street
หัวใจยังตามจังหวะที่ไม่ยอมพัก

[Chorus]
Sing it loud / ร้องให้สุดลมหายใจ
Let this night remember our name
${genre.label} pulse under neon sky
GuyMusicStation keeps the fire alive

[Verse 2]
เก็บเรื่องเก่าไว้ในกระเป๋า
But the hook still calls us home
ก้าวเล็ก ๆ ก็พอเริ่มต้น
When the beat says we're not alone

[Chorus]
Sing it loud / ร้องให้สุดลมหายใจ
Let this night remember our name
${genre.label} pulse under neon sky
GuyMusicStation keeps the fire alive`;

  const lyrics =
    input.language === "en" ? en : input.language === "mixed" ? mixed : th;

  return {
    title,
    lyrics,
    styleTags: `${genre.styleTags}${input.mood ? `, ${input.mood}` : ""}`,
    source: "demo",
  };
}

export async function generateLyrics(
  input: GenerateSongInput,
): Promise<LyricsResult> {
  if (!process.env.OPENAI_API_KEY) {
    return buildDemoLyrics(input);
  }

  const genre = getGenre(input.genreId);
  const languageRule =
    input.language === "th"
      ? "เขียนเนื้อเป็นภาษาไทยทั้งเพลง"
      : input.language === "en"
        ? "Write the entire song in English"
        : "ผสมไทย-อังกฤษอย่างเป็นธรรมชาติ (ประมาณ 50/50)";

  const vocal =
    input.vocalGender === "unspecified"
      ? "ไม่ระบุเพศเสียง"
      : input.vocalGender === "male"
        ? "น้ำเสียงผู้ชาย"
        : "น้ำเสียงผู้หญิง";

  try {
    const { text } = await generateText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      system: `You are a professional songwriter for GuyMusicStation.
Return ONLY valid JSON with keys: title (string), lyrics (string).
Lyrics MUST use section tags like [Verse 1], [Pre-Chorus], [Chorus], [Bridge], [Outro].
Keep 2 verses, 1 pre-chorus, 2 chorus repeats, 1 bridge.
${languageRule}
Genre craft notes: ${genre.lyricHints}
Avoid copyrighted phrases or existing song titles.`,
      prompt: `Genre: ${genre.label} (${genre.labelTh})
Theme: ${input.theme}
Mood: ${input.mood || "open"}
Vocal: ${vocal}
Suggested title: ${input.title || "(invent a short original title)"}
Style tags to respect: ${genre.styleTags}`,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return buildDemoLyrics(input);
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      title?: string;
      lyrics?: string;
    };

    if (!parsed.lyrics?.trim()) {
      return buildDemoLyrics(input);
    }

    return {
      title: parsed.title?.trim() || input.title?.trim() || "Untitled Track",
      lyrics: parsed.lyrics.trim(),
      styleTags: `${genre.styleTags}${input.mood ? `, ${input.mood}` : ""}`,
      source: "openai",
    };
  } catch {
    return buildDemoLyrics(input);
  }
}
