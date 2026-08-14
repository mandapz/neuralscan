import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import PageFrame from './components/PageFrame';
import Landing  from './pages/Landing';
import Home     from './pages/Home';
import History  from './pages/History';
import About    from './pages/About';
import './index.css';

function AppShell() {
  return (
    <Routes>
      <Route path="/"         element={<Landing />} />
      <Route path="/deteksi"  element={<PageFrame><Home /></PageFrame>} />
      <Route path="/history"  element={<PageFrame><History /></PageFrame>} />
      <Route path="/about"    element={<PageFrame><About /></PageFrame>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#131311', color: '#f5f4ef',
              border: '1px solid rgba(245,244,240,0.10)',
              fontSize: '13.5px', fontFamily: "'DM Sans', sans-serif",
              borderRadius: '8px', boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
