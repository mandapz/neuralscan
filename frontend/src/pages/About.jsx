import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye, AlertTriangle, Upload, Shield, TrendingUp, Users, Globe, Lock } from 'lucide-react';
import './About.css';

const dangers = [
  { icon: Users, title: 'Disinformasi & propaganda', body: 'Gambar AI digunakan untuk memalsukan peristiwa dan memanipulasi opini publik secara masif, terutama saat pemilu atau konflik. Otak manusia memproses gambar sebagai bukti secara instinktif, jauh sebelum akal sehat bereaksi.' },
  { icon: Lock,  title: 'Penipuan identitas & deepfake', body: 'Wajah sintetis digunakan untuk membangun profil palsu, melewati verifikasi identitas, dan menciptakan konten intim non-konsensual dari individu nyata dengan dampak personal yang bisa sangat merusak.' },
  { icon: Globe, title: 'Erosi kepercayaan', body: 'Semakin meyakinkan gambar AI, semakin orang meragukan semua gambar. Fenomena "liar\'s dividend" ini menguntungkan pihak jahat. Bukti nyata pun dapat dimentahkan begitu saja sebagai deepfake.' },
  { icon: TrendingUp, title: 'Manipulasi pasar', body: 'Gambar palsu tentang bencana, kegagalan produk, atau peristiwa politik digunakan untuk menggerakkan pasar keuangan. Satu gambar AI viral dari ledakan pabrik sudah cukup untuk menghancurkan harga saham sebelum klarifikasi.' },
];

const howWorks = [
  { step: '01', title: 'Unggah gambar', body: 'Seret & lepas gambar ke kotak unggah, atau klik untuk memilih file dari perangkatmu. Mendukung format JPG, PNG, dan WEBP hingga 10 MB.' },
  { step: '02', title: 'Tunggu analisis', body: 'NeuralScan otomatis memindai gambar menggunakan AI, menganalisis pola, tekstur, dan artefak visual hanya dalam hitungan detik.' },
  { step: '03', title: 'Lihat hasilnya', body: 'Dapatkan skor kepercayaan beserta penjelasan sinyal yang ditemukan, sehingga kamu tahu seberapa yakin gambar itu asli atau dibuat oleh AI.' },
];

const signals = [
  'Tekstur kulit terlalu halus tanpa pori atau ketidaksempurnaan',
  'Simetri wajah yang terlalu sempurna secara algoritmik',
  'Arah pencahayaan tidak konsisten dengan bayangan di frame',
  'Teks pada rambu atau label terlihat cacat atau tidak terbaca',
  'Jari tangan, telinga, atau gigi yang terdistorsi',
  'Elemen latar belakang yang berulang secara tidak alami',
  'Tidak ada aberasi kromatik di area kontras tinggi',
  'Distribusi noise terlalu seragam di seluruh gambar',
  'Bokeh terlihat matematis, bukan dari lensa optis nyata',
  'Detail rambut di tepi wajah yang tidak masuk akal secara fisik',
];

export default function About() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, [hash]);

  return (
    <main className="about">
      <section className="about__hero">
        <div className="about__eyebrow"><Eye size={13} /> Mengapa deteksi penting</div>
        <h1 className="about__title">Ancaman tak kasat mata<br />dari gambar sintetis</h1>
        <p className="about__lead">
          Generasi gambar AI telah melampaui kemampuan kita untuk membedakan yang nyata dari yang palsu.
          Apa yang dulu butuh studio profesional dan berminggu-minggu pekerjaan kini bisa dilakukan siapa saja dalam hitungan detik.
        </p>
      </section>

      {/* Bahaya */}
      <section className="about__section">
        <div className="about__section-hd">
          <AlertTriangle size={15} className="about__section-icon about__section-icon--warn" />
          <h2 className="about__section-title">Risiko gambar AI-generated</h2>
        </div>
        <div className="about__grid-2">
          {dangers.map(({ icon: Icon, title, body }) => (
            <div key={title} className="about__card">
              <div className="about__card-icon"><Icon size={16} strokeWidth={1.75} /></div>
              <h3 className="about__card-title">{title}</h3>
              <p className="about__card-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sinyal visual */}
      <section className="about__section">
        <div className="about__section-hd">
          <Eye size={15} className="about__section-icon" />
          <h2 className="about__section-title">Tanda gambar AI yang bisa dikenali</h2>
        </div>
        <p className="about__body">
          Model AI saat ini meninggalkan sidik jari yang terdeteksi, artefak yang muncul dari cara sistem tersebut
          menghasilkan piksel. Mata manusia sering melewatkannya, tapi bisa diukur. Ini yang paling sering ditemukan:
        </p>
        <ul className="about__signals">
          {signals.map((s, i) => (
            <li key={i} className="about__signal">
              <span className="about__signal-n">{String(i+1).padStart(2,'0')}</span>
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Cara pakai */}
      <section className="about__section" id="cara-kerja">
        <div className="about__section-hd">
          <Upload size={15} className="about__section-icon about__section-icon--blue" />
          <h2 className="about__section-title">Cara pakai NeuralScan</h2>
        </div>
        <div className="about__steps">
          {howWorks.map(({ step, title, body }) => (
            <div key={step} className="about__step">
              <span className="about__step-n">{step}</span>
              <div>
                <h3 className="about__step-title">{title}</h3>
                <p className="about__step-body">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Limitasi */}
      <section className="about__section">
        <div className="about__section-hd">
          <Shield size={15} className="about__section-icon about__section-icon--green" />
          <h2 className="about__section-title">Keterbatasan yang perlu diketahui</h2>
        </div>
        <p className="about__body">
          Tidak ada detektor yang sempurna. NeuralScan adalah alat bantu, bukan pengganti penilaian kritis.
          Ada kondisi di mana akurasi bisa menurun:
        </p>
        <ul className="about__limit-list">
          <li>Gambar sangat kecil atau terkompresi berat kehilangan artefak yang dibutuhkan model</li>
          <li>Screenshot gambar AI di layar menambahkan noise kamera yang menyamarkan sidik jari sintetis</li>
          <li>Arsitektur model generatif baru yang tidak ada dalam data latih mungkin lolos</li>
          <li>Foto asli yang diedit berat dapat memicu positif palsu</li>
          <li>Bidang ini berkembang cepat sehingga model detektor perlu diperbarui secara berkala</li>
        </ul>
        <p className="about__body" style={{ marginTop: '1rem' }}>
          Jika digunakan untuk pengambilan keputusan penting, hasil ini sebaiknya dijadikan sebagai salah satu referensi dan 
          tetap diverifikasi melalui pemeriksaan metadata, reverse image search, serta kredibilitas sumber.
        </p>
      </section>
    </main>
  );
}
