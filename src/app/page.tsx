import { SongForm } from "@/components/SongForm";

export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <div className="brand">GuyMusicStation</div>
        <h1 className="headline">แต่งเนื้อ เลือกแนว แล้วสร้างดนตรีจาก brief เดียว</h1>
        <p className="lede">
          MVP เว็บฟอร์ม: ส่งแนวเพลง + ธีม → ได้เนื้อเพลงและแทร็ก (หรือโหมด demo
          ถ้ายังไม่มี API key) เก็บไฟล์ไว้ในโฟลเดอร์ output/
        </p>
      </header>

      <SongForm />

      <p className="footer-note">
        ขั้นถัดไปใน roadmap: สไลด์ภาพ lyric video แล้วอัป YouTube / Facebook แบบ draft
      </p>
    </main>
  );
}
