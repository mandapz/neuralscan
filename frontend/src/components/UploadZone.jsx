import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImgIcon, X, ArrowRight } from 'lucide-react';
import './UploadZone.css';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadZone({ onScan, scanning }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length) {
      const tooBig = rejected[0].errors?.some(e => e.code === 'file-too-large');
      setError(tooBig
        ? 'Ukuran gambar melebihi 10 MB. Gunakan file yang lebih kecil.'
        : 'Format tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }
    setError('');
    const f = accepted[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg','.jpeg','.png','.webp'] },
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled: scanning,
  });

  const clear = (e) => { e.stopPropagation(); setFile(null); setPreview(null); setError(''); };

  return (
    <div className="uz">
      <div {...getRootProps()}
        className={`uz__zone${isDragActive ? ' uz__zone--drag' : ''}${preview ? ' uz__zone--filled' : ''}${scanning ? ' uz__zone--scanning' : ''}`}>
        <input {...getInputProps()} />

        {preview ? (
          <div className="uz__preview">
            <img src={preview} alt="preview" className="uz__img" />
            {scanning && (
              <div className="uz__scan-overlay">
                <div className="uz__scan-line" />
                <div className="uz__scan-badge">
                  <span className="uz__scan-dot" />
                  Menganalisis gambar...
                </div>
              </div>
            )}
            {!scanning && (
              <button className="uz__clear" onClick={clear}>
                <X size={13} />
              </button>
            )}
          </div>
        ) : (
          <div className="uz__empty">
            <div className="uz__icon">
              <ImgIcon size={24} strokeWidth={1.5} />
            </div>
            <p className="uz__label">
              {isDragActive ? 'Lepaskan gambar di sini' : 'Seret gambar ke sini'}
            </p>
            <p className="uz__sub">atau klik untuk memilih file · JPG, PNG, WEBP · maks. 10 MB</p>
          </div>
        )}
      </div>

      {error && <p className="uz__error">{error}</p>}

      {file && !scanning && (
        <div className="uz__bar">
          <div className="uz__file-info">
            <Upload size={12} strokeWidth={2} />
            <span className="uz__fname">{file.name}</span>
            <span className="uz__fsize">{(file.size/1024/1024).toFixed(2)} MB</span>
          </div>
          <button className="uz__btn" onClick={() => onScan(file, preview)}>
            Analisis <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
