export type Language = "th" | "en" | "mixed";

export type VocalGender = "male" | "female" | "unspecified";

export interface GenerateSongInput {
  genreId: string;
  theme: string;
  mood: string;
  language: Language;
  vocalGender: VocalGender;
  title?: string;
}

export interface LyricsResult {
  title: string;
  lyrics: string;
  styleTags: string;
  source: "openai" | "demo";
}

export interface MusicTrack {
  id: string;
  title: string;
  audioUrl: string | null;
  localPath: string | null;
  durationSeconds: number | null;
  source: "suno" | "demo";
}

export interface SongJobResult {
  jobId: string;
  mode: "live" | "demo";
  input: GenerateSongInput;
  lyrics: LyricsResult;
  tracks: MusicTrack[];
  outputDir: string;
  createdAt: string;
  notes: string[];
}
