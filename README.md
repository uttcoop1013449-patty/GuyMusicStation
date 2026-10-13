# GuyMusicStation

MVP เว็บแอปสำหรับแต่งเนื้อเพลงตามแนวที่เลือก แล้วสร้างดนตรีประกอบด้วย AI

## สิ่งที่ทำได้ตอนนี้

1. เลือกแนวเพลง (T-Pop, Pop, Rock, Hip-Hop, Ballad, Acoustic, Lo-fi, EDM)
2. ใส่ธีม / อารมณ์ / ภาษา / เสียงร้อง
3. สร้างเนื้อเพลง (OpenAI ถ้ามี key, ไม่มีก็ใช้ demo lyrics)
4. สร้างเสียงผ่าน Suno API แบบ custom lyrics (ถ้ามี `SUNO_API_KEY`)
5. บันทึกผลลง `output/<jobId>/`

## เริ่มใช้งาน

```bash
cp .env.example .env.local
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### โหมด Demo

ถ้าวาง key ไม่ครบ ระบบยังรันได้: ได้เนื้อเพลง + ไฟล์ `lyrics.txt` / `meta.json` ใน `output/`

### Live music

ใส่ใน `.env.local`:

```env
OPENAI_API_KEY=sk-...
SUNO_API_KEY=...
```

## API

`POST /api/generate`

```json
{
  "genreId": "tpop",
  "theme": "คืนฝนในกรุงเทพ",
  "mood": "คิดถึง / nostalgic",
  "language": "th",
  "vocalGender": "female",
  "title": "ฝนบนกระจก"
}
```

ดาวน์โหลดไฟล์: `/api/outputs/<jobId>/lyrics.txt`

## Roadmap

- สร้างภาพสไลด์ต่อท่อน + รวม lyric video (FFmpeg/Remotion)
- โพสอัตโนมัติ YouTube / Facebook แบบ private/draft ก่อน public
