export interface GenreOption {
  id: string;
  label: string;
  labelTh: string;
  styleTags: string;
  lyricHints: string;
}

export const GENRES: GenreOption[] = [
  {
    id: "tpop",
    label: "T-Pop",
    labelTh: "ทีป๊อป",
    styleTags: "Thai pop, catchy chorus, bright vocal, modern production, 100 BPM",
    lyricHints: "hook ที่จำง่าย ท่อน chorus ซ้ำได้ ความยาวท่อนสมดุล",
  },
  {
    id: "pop",
    label: "Pop",
    labelTh: "ป๊อป",
    styleTags: "contemporary pop, warm vocal, polished drums, radio-friendly, 102 BPM",
    lyricHints: "verse เล่าเรื่อง chorus เป็นอารมณ์หลัก",
  },
  {
    id: "rock",
    label: "Rock",
    labelTh: "ร็อก",
    styleTags: "alternative rock, electric guitar, driving drums, anthemic chorus, 118 BPM",
    lyricHints: "พลัง ดื้อรั้น chorus กว้างและตะโกนได้",
  },
  {
    id: "hiphop",
    label: "Hip-Hop",
    labelTh: "ฮิปฮอป",
    styleTags: "modern hip hop, strong beat, melodic hook, punchy bass, 92 BPM",
    lyricHints: "verse แน่นด้วยภาพและจังหวะคำ hook ติดหู",
  },
  {
    id: "ballad",
    label: "Ballad",
    labelTh: "บัลลาด",
    styleTags: "emotional ballad, soft piano, acoustic guitar, intimate vocal, 76 BPM",
    lyricHints: "อารมณ์ลึก ภาพชัด ช้าลงในท่อนสะเทือนใจ",
  },
  {
    id: "acoustic",
    label: "Acoustic",
    labelTh: "อะคูสติก",
    styleTags: "acoustic folk pop, fingerpicked guitar, warm vocal, intimate, 88 BPM",
    lyricHints: "เรียบง่าย ซื่อตรง ใกล้ชิด",
  },
  {
    id: "lofi",
    label: "Lo-fi",
    labelTh: "โลไฟ",
    styleTags: "lofi chill hop, dusty drums, warm keys, relaxed vibe, 84 BPM",
    lyricHints: "สั้น นุ่ม คิดถึงแบบเบา ๆ",
  },
  {
    id: "edm",
    label: "EDM",
    labelTh: "อีดีเอ็ม",
    styleTags: "dance EDM, synth lead, festival drop, energetic vocal chop, 128 BPM",
    lyricHints: "pre-chorus สร้างความตึง chorus/drop ปล่อยพลัง",
  },
];

export function getGenre(id: string): GenreOption {
  return GENRES.find((g) => g.id === id) ?? GENRES[0];
}
