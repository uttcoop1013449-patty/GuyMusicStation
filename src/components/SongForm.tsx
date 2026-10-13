"use client";

import { useState, useTransition } from "react";
import { GENRES } from "@/lib/genres";
import type { Language, SongJobResult, VocalGender } from "@/lib/types";

const moods = [
  "หวังดี / hopeful",
  "คิดถึง / nostalgic",
  "มันส์ / energetic",
  "เศร้าสวย / bittersweet",
  "ชิค / cool",
];

export function SongForm() {
  const [genreId, setGenreId] = useState(GENRES[0].id);
  const [theme, setTheme] = useState("");
  const [mood, setMood] = useState(moods[0]);
  const [language, setLanguage] = useState<Language>("th");
  const [vocalGender, setVocalGender] = useState<VocalGender>("unspecified");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SongJobResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            genreId,
            theme,
            mood,
            language,
            vocalGender,
            title: title || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "เกิดข้อผิดพลาด");
          setResult(null);
          return;
        }
        setResult(data as SongJobResult);
      } catch {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
        setResult(null);
      }
    });
  }

  return (
    <div className="station-shell">
      <form className="station-form" onSubmit={onSubmit}>
        <label className="field">
          <span>แนวเพลง</span>
          <select
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
            required
          >
            {GENRES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label} · {g.labelTh}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>หัวข้อ / ธีม</span>
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="เช่น คืนฝนในกรุงเทพ, first day far from home"
            required
            minLength={3}
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>อารมณ์</span>
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              {moods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>ภาษา</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <option value="th">ไทย</option>
              <option value="en">English</option>
              <option value="mixed">ผสม</option>
            </select>
          </label>

          <label className="field">
            <span>เสียงร้อง</span>
            <select
              value={vocalGender}
              onChange={(e) =>
                setVocalGender(e.target.value as VocalGender)
              }
            >
              <option value="unspecified">ไม่ระบุ</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>ชื่อเพลง (ไม่บังคับ)</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ปล่อยว่างให้ AI ตั้งชื่อ"
          />
        </label>

        <button className="cta" type="submit" disabled={pending}>
          {pending ? "กำลังแต่งและสร้างเพลง..." : "สร้างเนื้อ + ดนตรี"}
        </button>

        {error ? <p className="error">{error}</p> : null}
      </form>

      {result ? (
        <section className="result" aria-live="polite">
          <div className="result-head">
            <h2>{result.lyrics.title}</h2>
            <span className={`badge badge-${result.mode}`}>
              {result.mode === "demo" ? "DEMO" : "LIVE"}
            </span>
          </div>

          <p className="meta">
            Job <code>{result.jobId}</code> · lyrics: {result.lyrics.source} ·
            style: {result.lyrics.styleTags}
          </p>

          <pre className="lyrics">{result.lyrics.lyrics}</pre>

          <div className="tracks">
            {result.tracks.map((track) => (
              <div key={track.id} className="track">
                <strong>{track.title}</strong>
                <span className="track-source">{track.source}</span>
                {track.audioUrl || track.localPath?.endsWith(".mp3") ? (
                  <audio
                    controls
                    src={
                      track.audioUrl ||
                      `/api/outputs/${result.jobId}/${track.localPath?.split("/").pop()}`
                    }
                  />
                ) : (
                  <p className="muted">
                    ยังไม่มีไฟล์เสียง — ดู{" "}
                    <a href={`/api/outputs/${result.jobId}/demo-note.txt`}>
                      demo-note.txt
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="links">
            <a href={`/api/outputs/${result.jobId}/lyrics.txt`}>ดาวน์โหลดเนื้อเพลง</a>
            <a href={`/api/outputs/${result.jobId}/meta.json`}>meta.json</a>
          </div>

          {result.notes.length > 0 ? (
            <ul className="notes">
              {result.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
