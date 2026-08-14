import { useEffect, useState } from 'react';
import { RotateCcw, AlertCircle, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';
import './ResultCard.css';

function now() {
  return new Date().toLocaleString('id-ID', {
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit', second:'2-digit',
  });
}

export default function ResultCard({ result, preview, onReset }) {
  const [visible, setVisible]   = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const [ts] = useState(now());

  const isAI      = result?.label === 'AI';
  const confidence = result?.confidence ?? 0;
  const description = result?.description ?? '';
  const signals    = result?.signals ?? [];
  const fileName   = result?.file_name ?? 'image';

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 30);
    const t2 = setTimeout(() => setBarWidth(confidence), 120);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [confidence]);

  return (
    <div className={`rc${visible ? ' rc--visible' : ''} ${isAI ? 'rc--ai' : 'rc--real'}`}>

      {/* Header — verdict */}
      <div className="rc__header">
        <div className="rc__header-left">
          <div className="rc__verdict-icon">
            {isAI
              ? <ShieldAlert size={18} strokeWidth={1.75} />
              : <ShieldCheck size={18} strokeWidth={1.75} />}
          </div>
          <div>
            <p className="rc__eyebrow">Hasil Analisis</p>
            <h2 className="rc__verdict">
              {isAI ? 'Gambar AI-Generated' : 'Gambar Asli (Real)'}
            </h2>
          </div>
        </div>
        <div className="rc__badge">
          {isAI
            ? <><AlertCircle size={12} /> Sintetis</>
            : <><CheckCircle2 size={12} /> Autentik</>}
        </div>
      </div>

      {/* Meta strip */}
      <div className="rc__meta">
        <span className="rc__meta-item"><span className="rc__meta-label">FILE</span>{fileName}</span>
        <span className="rc__meta-item"><span className="rc__meta-label">WAKTU</span>{ts}</span>
        <span className="rc__meta-item"><span className="rc__meta-label">MESIN</span>AI Vision</span>
      </div>

      {/* Body */}
      <div className="rc__body">
        {/* Thumbnail */}
        <div className="rc__thumb-col">
          <div className={`rc__thumb-wrap ${isAI ? 'rc__thumb-wrap--ai' : 'rc__thumb-wrap--real'}`}>
            <img src={preview} alt="Analyzed" className="rc__thumb" />
          </div>
        </div>

        {/* Content */}
        <div className="rc__content">
          {/* Confidence */}
          <div className="rc__section">
            <p className="rc__section-label">Tingkat Kepercayaan</p>
            <div className="rc__conf-row">
              <div className="rc__conf-track">
                <div
                  className={`rc__conf-fill ${isAI ? 'rc__conf-fill--ai' : 'rc__conf-fill--real'}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className={`rc__conf-val ${isAI ? 'rc__conf-val--ai' : 'rc__conf-val--real'}`}>
                {confidence}%
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="rc__section">
            <p className="rc__section-label">Analisis Deskriptif</p>
            <p className="rc__desc">{description}</p>
          </div>

          {/* Signals */}
          {signals.length > 0 && (
            <div className="rc__section">
              <p className="rc__section-label">Sinyal Terdeteksi</p>
              <div className="rc__signals">
                {signals.map((s, i) => (
                  <span key={i} className={`rc__signal ${isAI ? 'rc__signal--ai' : 'rc__signal--real'}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="rc__footer">
        <p className="rc__disclaimer">
          Hasil ini bersifat indikatif. Gunakan sebagai salah satu referensi, bukan satu-satunya acuan.
        </p>
        <button className="rc__reset" onClick={onReset}>
          <RotateCcw size={13} strokeWidth={2} /> Unggah Gambar Baru
        </button>
      </div>
    </div>
  );
}
