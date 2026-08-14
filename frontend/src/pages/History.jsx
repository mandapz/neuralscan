import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getHistory, getHistoryStats, deleteHistoryEntry, clearHistory,
  getLocalHistory, deleteLocalEntry, clearLocalHistory,
} from '../utils/api';
import { Trash2, Clock, AlertCircle, CheckCircle2, ScanLine, LogIn } from 'lucide-react';
import './History.css';

function timeAgo(iso) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d/60000), h = Math.floor(m/60), dy = Math.floor(h/24);
  if (dy > 0) return `${dy} hari lalu`;
  if (h > 0)  return `${h} jam lalu`;
  if (m > 0)  return `${m} menit lalu`;
  return 'baru saja';
}

export default function History() {
  const { user, loading: authLoading, login } = useAuth();
  const [entries,     setEntries]     = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [confirm,     setConfirm]     = useState(false);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const [data, s] = await Promise.all([getHistory({ page, perPage: 20 }), getHistoryStats()]);
        setEntries(data.items); setTotalPages(data.pages); setStats(s);
      } else {
        const local = getLocalHistory();
        setEntries(local);
        const ai = local.filter(e => e.label === 'AI').length;
        setStats({ total: local.length, ai_count: ai, real_count: local.length - ai });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user, page]);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  const handleDelete = async (id) => {
    user ? await deleteHistoryEntry(id) : deleteLocalEntry(id);
    setEntries(p => p.filter(e => e.id !== id));
    setStats(s => s ? { ...s, total: s.total - 1 } : s);
  };

  const handleClear = async () => {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return; }
    user ? await clearHistory() : clearLocalHistory();
    setEntries([]); setStats(s => s ? { ...s, total: 0, ai_count: 0, real_count: 0 } : s);
    setConfirm(false);
  };

  if (authLoading || loading) {
    return (
      <main className="hist">
        <div className="hist__head" style={{ paddingTop: '2.5rem' }}>
          <div className="hist__skel-title" />
        </div>
        <div className="hist__skel-list">
          {[...Array(5)].map((_, i) => <div key={i} className="hist__skel-item" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="hist">
      <div className="hist__head">
        <div className="hist__head-info">
          <h1 className="hist__title">Riwayat Deteksi</h1>
          <p className="hist__sub">
            {user ? 'Tersinkronisasi ke akun Google' : 'Tersimpan di perangkat ini'}
            {' · '}{stats?.total ?? 0} scan
          </p>
        </div>
        <button
          className={`hist__clear${confirm ? ' hist__clear--confirm' : ''}`}
          onClick={handleClear}
          style={{ visibility: entries.length > 0 ? 'visible' : 'hidden' }}
        >
          <Trash2 size={13} /> {confirm ? 'Yakin hapus semua?' : 'Hapus semua'}
        </button>
      </div>

      {!user && (
        <div className="hist__banner">
          <LogIn size={14} />
          <span>Masuk dengan Google untuk sinkronisasi riwayat lintas perangkat.</span>
          <button className="hist__banner-btn" onClick={login}>Masuk</button>
        </div>
      )}

      {stats && stats.total > 0 && (
        <div className="hist__stats">
          <div className="hist__stat">
            <ScanLine size={14} strokeWidth={2} />
            <span className="hist__stat-n">{stats.total}</span>
            <span className="hist__stat-l">Total scan</span>
          </div>
          <div className="hist__stat hist__stat--ai">
            <AlertCircle size={14} strokeWidth={2} />
            <span className="hist__stat-n">{stats.ai_count}</span>
            <span className="hist__stat-l">AI-Generated</span>
          </div>
          <div className="hist__stat hist__stat--real">
            <CheckCircle2 size={14} strokeWidth={2} />
            <span className="hist__stat-n">{stats.real_count}</span>
            <span className="hist__stat-l">Asli</span>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="hist__empty">
          <div className="hist__empty-icon"><Clock size={26} strokeWidth={1.5} /></div>
          <p className="hist__empty-title">Belum ada riwayat</p>
          <p className="hist__empty-sub">Gambar yang kamu scan akan muncul di sini.</p>
        </div>
      ) : (
        <>
          <ul className="hist__list">
            {entries.map((e, i) => {
              const isAI = e.label === 'AI';
              const thumb = e.thumbnail || e.thumbnail_b64;
              return (
                <li key={e.id} className={`hist__item anim-fade-up`} style={{ animationDelay: `${i*35}ms` }}>
                  <div className="hist__thumb-wrap">
                    {thumb
                      ? <img src={thumb} alt="" className="hist__thumb" />
                      : <div className="hist__thumb-fb">{isAI ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}</div>
                    }
                    <span className={`hist__chip ${isAI ? 'hist__chip--ai' : 'hist__chip--real'}`}>
                      {e.label}
                    </span>
                  </div>

                  <div className="hist__content">
                    <div className="hist__top">
                      <span className="hist__name">{e.file_name || e.fileName || 'Gambar'}</span>
                      <span className="hist__time">{timeAgo(e.scanned_at)}</span>
                    </div>
                    <p className="hist__desc">{e.description}</p>
                    <div className="hist__bar-row">
                      <div className="hist__bar-track">
                        <div className={`hist__bar-fill ${isAI ? 'hist__bar-fill--ai' : 'hist__bar-fill--real'}`}
                          style={{ width: `${e.confidence}%` }} />
                      </div>
                      <span className="hist__conf">{e.confidence}%</span>
                    </div>
                  </div>

                  <button className="hist__del" onClick={() => handleDelete(e.id)}>
                    <Trash2 size={13} />
                  </button>
                </li>
              );
            })}
          </ul>

          {user && totalPages > 1 && (
            <div className="hist__pager">
              <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="hist__pager-btn">← Sebelumnya</button>
              <span className="hist__pager-info">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="hist__pager-btn">Selanjutnya →</button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
