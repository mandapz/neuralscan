import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft, LogIn, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const navItems = [
  { to: '/deteksi', label: 'Deteksi' },
  { to: '/history', label: 'Riwayat' },
  { to: '/about',   label: 'Informasi' },
];

export default function Navbar() {
  const { user, loading, login, logout } = useAuth();
  const [userOpen, setUserOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <header className={`nav${menuOpen ? ' nav--menu-open' : ''}`}>
      <div className="nav__row">
        <NavLink to="/" className="nav__brand">
          <span className="nav__logo-mark">N</span>
          NEURALSCAN
        </NavLink>

        <nav className="nav__links">
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav__right">
          {loading ? <div className="nav__auth-skeleton" /> :
           !user ? (
            <button className="nav__auth-btn" onClick={login}>
              <LogIn size={14} strokeWidth={2} /> Masuk
            </button>
           ) : (
            <div className="nav__user" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setUserOpen(false); }}>
              <button className="nav__user-btn" onClick={() => setUserOpen(!userOpen)}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="" className="nav__user-avatar" />
                  : <div className="nav__user-avatar-fb">{(user.name || '?')[0]}</div>
                }
                <span className="nav__user-name">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={12} className={userOpen ? 'rotated' : ''} />
              </button>
              {userOpen && (
                <div className="nav__user-dropdown">
                  <div className="nav__user-dropdown-info">
                    <p className="nav__user-dropdown-name">{user.name}</p>
                    <p className="nav__user-dropdown-email">{user.email}</p>
                  </div>
                  <button className="nav__user-dropdown-out" onClick={() => { logout(); setUserOpen(false); }}>
                    <LogOut size={13} /> Keluar
                  </button>
                </div>
              )}
            </div>
           )}

          {!isLanding && (
            <NavLink to="/" className="nav__cta">
              <span className="nav__cta-icon"><ArrowLeft size={13} strokeWidth={2.5} /></span>
              <span className="nav__cta-label">Beranda</span>
            </NavLink>
          )}

          <button className="nav__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="nav__mobile">
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav__mobile-link${isActive ? ' active' : ''}`}>
              {label}
            </NavLink>
          ))}
          {!isLanding && (
            <NavLink to="/" className="nav__mobile-link nav__mobile-link--cta" onClick={() => setMenuOpen(false)}>
              Beranda
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}
