import { ScanEye, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Frame.css';
import './Landing.css';

export default function Landing() {
  return (
    <div className="frame">
      <div className="frame__box">

        <Navbar />

        <main className="lp__hero">
          <div className="lp__hero-copy">
            <h1 className="lp__title">
              Ada Cara Lebih
              Cerdas untuk
              <br />
              Kenali Gambar AI.
            </h1>

            <Link to="/deteksi" className="lp__cta">
              Mulai Deteksi Sekarang
              <span className="lp__cta-icon"><ArrowRight size={14} strokeWidth={2.5} /></span>
            </Link>

            <p className="lp__desc">
              NeuralScan adalah pemindai gambar berbasis AI yang membantu kamu
              mengenali mana foto asli dan mana yang dihasilkan AI hanya
              dalam hitungan detik.
            </p>
          </div>

          <div className="lp__visual" aria-hidden="true">
            <div className="lp__eye">
              <div className="lp__eye-ring lp__eye-ring--dashed" />
              <div className="lp__eye-ring" />
              <ScanEye className="lp__eye-icon" size={128} strokeWidth={1.25} />
            </div>
          </div>
        </main>

        <footer className="lp__footer">
          <p>Dipindai secara lokal · hasil dalam hitungan detik</p>
          <Link to="/about#cara-kerja" className="lp__footer-link">
            Pelajari cara pakainya <ArrowUpRight size={13} strokeWidth={2.25} />
          </Link>
        </footer>
      </div>
    </div>
  );
}
