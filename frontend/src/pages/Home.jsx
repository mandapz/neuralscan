import { useState } from 'react';
import UploadZone from '../components/UploadZone';
import ResultCard from '../components/ResultCard';
import { detectImage, saveLocalHistory } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Cpu, ShieldCheck, Clock } from 'lucide-react';
import './Home.css';

const features = [
  { icon: Cpu,        label: 'AI Vision', desc: 'Terlatih dari ribuan gambar' },
  { icon: ShieldCheck,label: 'Privat',    desc: 'Gambar tidak disimpan tanpa izin' },
  { icon: Clock,      label: 'Riwayat',   desc: 'Tersimpan otomatis saat login' },
];

export default function Home() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result,   setResult]   = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [error,    setError]    = useState('');

  const handleScan = async (file, imagePreview) => {
    setScanning(true);
    setError('');
    setPreview(imagePreview);
    try {
      const data = await detectImage(file);
      setResult(data);
      if (!user) {
        saveLocalHistory({
          file_name: file.name, fileName: file.name,
          thumbnail: data.thumbnail,
          label: data.label, confidence: data.confidence,
          description: data.description, signals: data.signals,
        });
      }
    } catch (err) {
      setError(err.message || 'Deteksi gagal. Pastikan backend berjalan.');
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => { setResult(null); setPreview(null); setError(''); };

  return (
    <main className={`home${result ? ' home--result' : ''}`}>
      <section className={`home__hero collapsible${result ? ' collapsible--hidden' : ''}`}>
        <p className="home__eyebrow">Deteksi Gambar AI</p>
        <h1 className="home__title">
          Gambar ini <em>asli</em> atau<br />dibuat oleh AI?
        </h1>
        <p className="home__subtitle">
          Unggah gambar apa pun. NeuralScan menganalisisnya menggunakan
          teknologi AI dan memberikan hasil dalam hitungan detik.
        </p>
      </section>

      <div className={`home__scanner${result ? ' home__scanner--result' : ''}`}>
        {!result
          ? <UploadZone onScan={handleScan} scanning={scanning} />
          : <ResultCard result={result} preview={preview} onReset={handleReset} />
        }
        {error && <p className="home__error">{error}</p>}
      </div>

      <div className={`home__features collapsible${result ? ' collapsible--hidden' : ''}`}>
        {features.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="home__feature">
            <div className="home__feature-icon"><Icon size={15} strokeWidth={1.75} /></div>
            <div className="home__feature-text">
              <p className="home__feature-name">{label}</p>
              <p className="home__feature-desc">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
