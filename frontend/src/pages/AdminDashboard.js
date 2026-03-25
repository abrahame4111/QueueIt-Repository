import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, SkipForward, Trash2, Play, Music, List, QrCode, LogOut, Settings, Music2, Zap, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SpotifyPlayer from '@/components/SpotifyPlayer';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import OnboardingTutorial from '@/components/OnboardingTutorial';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [isSkipping, setIsSkipping] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('player');

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchData();
      checkSpotifyToken(savedToken);
      if (!localStorage.getItem('queueit_onboarding_done')) setShowOnboarding(true);
    }
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && savedToken) handleSpotifyCallback(code, savedToken);
  }, []);

  const checkSpotifyToken = async (authToken) => {
    try {
      const res = await axios.get(`${API}/spotify/token`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.data.has_token) setSpotifyToken(res.data.access_token);
    } catch (e) { console.error(e); }
  };

  const handleSpotifyLogin = async () => {
    try {
      const res = await axios.get(`${API}/spotify/auth-url`, { headers: { Authorization: `Bearer ${token}` } });
      window.location.href = res.data.auth_url;
    } catch { toast.error('Failed to initiate Spotify login'); }
  };

  const handleSpotifyCallback = async (code, authToken) => {
    try {
      const res = await axios.post(`${API}/spotify/callback?code=${code}`, {}, { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.data.success) { setSpotifyToken(res.data.access_token); toast.success('Connected to Spotify!'); window.history.replaceState({}, document.title, '/admin'); }
    } catch { toast.error('Failed to connect to Spotify'); }
  };

  useEffect(() => {
    if (isAuthenticated) { fetchData(); const i = setInterval(fetchData, 3000); return () => clearInterval(i); }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [cur, q] = await Promise.all([axios.get(`${API}/queue/current`), axios.get(`${API}/queue`)]);
      setCurrentSong(cur.data.current || null);
      setQueue(q.data.queue);
    } catch (e) { console.error(e); }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/login`, { password });
      if (res.data.success) {
        setToken(res.data.token); localStorage.setItem('admin_token', res.data.token);
        setIsAuthenticated(true); checkSpotifyToken(res.data.token); toast.success('Login successful');
        if (!localStorage.getItem('queueit_onboarding_done')) setShowOnboarding(true);
      }
    } catch { toast.error('Invalid password'); }
    finally { setLoading(false); }
  };

  const handleSkip = async () => {
    if (isSkipping) return;
    setIsSkipping(true);
    try {
      const res = await axios.post(`${API}/queue/skip`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Song skipped');
      if (res.data.next_song) { const n = res.data.next_song; n['_id'] = n['_id'] || n.id; setCurrentSong(n); }
      else setCurrentSong(null);
      fetchData();
    } catch { toast.error('Failed to skip song'); }
    finally { setTimeout(() => setIsSkipping(false), 1000); }
  };

  const handleClearQueue = async () => {
    if (!window.confirm('Clear entire queue?')) return;
    try {
      await axios.post(`${API}/queue/clear`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setCurrentSong(null);
      setQueue([]);
      toast.success('Queue cleared');
    }
    catch { toast.error('Failed to clear queue'); }
  };

  const handleRemoveSong = async (itemId) => {
    try { await axios.delete(`${API}/queue/${itemId}`, { headers: { Authorization: `Bearer ${token}` } }); toast.success('Song removed'); fetchData(); }
    catch { toast.error('Failed to remove song'); }
  };

  const fmt = (ms) => { const m = Math.floor(ms / 60000); const s = ((ms % 60000) / 1000).toFixed(0); return `${m}:${s.padStart(2, '0')}`; };

  const handleLogout = async () => {
    try { if (spotifyToken) await axios.post(`${API}/spotify/logout`, {}, { headers: { Authorization: `Bearer ${token}` } }); } catch {}
    localStorage.removeItem('admin_token'); setIsAuthenticated(false); setToken(''); setPassword(''); setSpotifyToken(null); toast.success('Logged out');
  };

  const queuedSongs = queue.filter(i => i.status === 'queued');

  // ─── Login ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 relative scanlines">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative">
          <div className="cyber-card hud-corners p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src="/queueit-logo.png" alt="QueueIt" className="h-20 object-contain" />
            </div>
            <div className="text-center mb-8">
              <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-[0.2em]">Admin Access Terminal</p>
            </div>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="// ENTER ACCESS CODE"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-black border-[var(--border)] text-white placeholder:text-white/30 py-6 rounded-none font-mono focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] focus:shadow-[0_0_10px_var(--cyan)]"
                data-testid="admin-password-input"
              />
              <button onClick={handleLogin} disabled={loading} className="neon-button w-full py-4 text-base" data-testid="admin-login-button">
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  {loading ? 'AUTHENTICATING...' : 'INITIALIZE'}
                </span>
              </button>
              <p className="text-center text-[var(--text-muted)] text-xs font-mono mt-4 opacity-40">
                ACCESS: hostel2024
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Dashboard ───
  return (
    <div className="min-h-screen bg-[var(--bg)] relative" data-testid="admin-dashboard">
      {showOnboarding && <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />}

      {/* ─── DESKTOP ─── */}
      <div className="hidden md:block p-6 lg:p-8 scanlines">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img src="/queueit-icon.png" alt="" className="w-10 h-10" />
            <div>
              <h1 className="font-cyber text-3xl font-bold tracking-tight text-white">
                QUEUE<span className="text-[var(--primary)]">IT</span>
              </h1>
              <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-[0.2em]">Control Terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border border-[var(--border)] px-4 py-2">
              <div className={`w-2 h-2 ${spotifyToken ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-[var(--accent)]'}`} />
              <span className="font-mono text-xs text-[var(--text-muted)]">{spotifyToken ? 'SPOTIFY:ONLINE' : 'SPOTIFY:OFFLINE'}</span>
            </div>
            <button onClick={handleLogout} className="border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/10 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors duration-200" data-testid="logout-button">
              DISCONNECT
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 mb-6">
          {[
            { label: 'NOW PLAYING', value: currentSong ? '1' : '0', color: 'var(--primary)', icon: Radio },
            { label: 'IN QUEUE', value: queuedSongs.length, color: 'var(--cyan)', icon: List },
            { label: 'TOTAL PROCESSED', value: queue.length, color: 'var(--text-muted)', icon: Music },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="cyber-card p-5 hud-corners" data-testid={`stat-${['current','queue','total'][i]}`}>
              <div className="flex items-center gap-2 mb-3">
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">{s.label}</span>
              </div>
              <p className="font-cyber text-4xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Player */}
        <div className="mb-6">
          <SpotifyPlayer currentSong={currentSong} token={token} spotifyToken={spotifyToken} onSpotifyLogin={handleSpotifyLogin} onPlayNext={handleSkip} />
        </div>

        {/* Queue */}
        <div className="cyber-card hud-corners">
          <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-[var(--cyan)]" />
              <span className="font-cyber text-lg font-bold text-white">QUEUE</span>
              <span className="font-mono text-xs text-[var(--text-muted)] ml-2">[{queuedSongs.length}]</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSkip} className="cyan-button px-4 py-2 text-xs font-bold" data-testid="play-next-button">
                <span className="flex items-center gap-1"><SkipForward className="w-3 h-3" /> NEXT</span>
              </button>
              <button onClick={handleClearQueue} className="border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/10 px-4 py-2 text-xs font-bold uppercase transition-colors duration-200" data-testid="clear-queue-button">
                <span className="flex items-center gap-1"><Trash2 className="w-3 h-3" /> PURGE</span>
              </button>
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            {queuedSongs.length === 0 ? (
              <div className="text-center py-16 text-[var(--text-muted)] font-mono">
                <List className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">// QUEUE EMPTY</p>
                <p className="text-xs opacity-50 mt-1">Awaiting song requests...</p>
              </div>
            ) : (
              <div>
                {queuedSongs.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="queue-item group" data-testid={`admin-queue-item-${i}`}>
                    <div className="text-[var(--cyan)] font-mono font-bold text-lg w-8">{String(i + 1).padStart(2, '0')}</div>
                    <img src={item.song.album_art || 'https://via.placeholder.com/56'} alt="" className="w-14 h-14" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{item.song.name}</p>
                      <p className="text-[var(--text-muted)] text-sm truncate">{item.song.artist}</p>
                      <p className="text-[var(--text-muted)] text-xs mt-0.5 font-mono opacity-50">{item.requested_by || 'ANONYMOUS'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--text-muted)] font-mono text-sm">{fmt(item.song.duration_ms)}</span>
                      <button onClick={() => handleRemoveSong(item._id)}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        data-testid={`remove-song-${i}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* QR */}
        <div className="mt-6"><QRCodeGenerator /></div>
      </div>

      {/* ─── MOBILE ─── */}
      <div className="md:hidden flex flex-col min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 glass-panel px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/queueit-icon.png" alt="" className="w-7 h-7" />
              <span className="font-cyber text-base font-bold text-white">QUEUE<span className="text-[var(--primary)]">IT</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-[var(--border)] px-2.5 py-1">
                <div className={`w-1.5 h-1.5 ${spotifyToken ? 'bg-green-500' : 'bg-[var(--accent)]'}`} />
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{spotifyToken ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
              <button onClick={handleLogout} className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)]" data-testid="mobile-logout-button">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pt-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'player' && (
              <motion.div key="player" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="space-y-4" data-testid="mobile-player-tab">
                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { v: currentSong ? '1' : '0', l: 'PLAYING', c: 'var(--primary)' },
                    { v: queuedSongs.length, l: 'QUEUED', c: 'var(--cyan)' },
                    { v: queue.length, l: 'TOTAL', c: 'var(--text-muted)' },
                  ].map(s => (
                    <div key={s.l} className="cyber-card p-3 text-center">
                      <p className="font-cyber text-2xl font-bold" style={{ color: s.c }}>{s.v}</p>
                      <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>
                <SpotifyPlayer currentSong={currentSong} token={token} spotifyToken={spotifyToken} onSpotifyLogin={handleSpotifyLogin} onPlayNext={handleSkip} />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleSkip} disabled={isSkipping || !currentSong} className="cyan-button h-14 font-bold text-sm disabled:opacity-30" data-testid="mobile-skip-button">
                    <span className="flex items-center justify-center gap-2"><SkipForward className="w-5 h-5" /> SKIP</span>
                  </button>
                  <button onClick={handleClearQueue} disabled={queuedSongs.length === 0}
                    className="border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/10 h-14 font-bold text-sm uppercase disabled:opacity-30 transition-colors duration-200" data-testid="mobile-clear-button">
                    <span className="flex items-center justify-center gap-2"><Trash2 className="w-5 h-5" /> PURGE</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'queue' && (
              <motion.div key="queue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                data-testid="mobile-queue-tab">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-cyber text-lg font-bold text-white">QUEUE</h2>
                  <span className="font-mono text-xs text-[var(--cyan)]">[{queuedSongs.length}]</span>
                </div>
                {queuedSongs.length === 0 ? (
                  <div className="text-center py-16 text-[var(--text-muted)] font-mono">
                    <List className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">// QUEUE EMPTY</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {queuedSongs.map((item, i) => (
                      <div key={item.id} className="flex items-center gap-3 cyber-card p-3" data-testid={`mobile-queue-item-${i}`}>
                        <div className="text-[var(--cyan)] font-mono font-bold text-xs w-5">{String(i+1).padStart(2,'0')}</div>
                        <img src={item.song.album_art || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{item.song.name}</p>
                          <p className="text-[var(--text-muted)] text-xs truncate">{item.song.artist}</p>
                        </div>
                        <button onClick={() => handleRemoveSong(item._id)} className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)]" data-testid={`mobile-remove-song-${i}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'qr' && (
              <motion.div key="qr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                data-testid="mobile-qr-tab"><QRCodeGenerator /></motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="space-y-4" data-testid="mobile-settings-tab">
                <h2 className="font-cyber text-lg font-bold text-white">SETTINGS</h2>
                <div className="cyber-card p-4">
                  <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em]">Spotify Connection</span>
                  <div className="flex items-center gap-2 mt-3 mb-4">
                    <div className={`w-2.5 h-2.5 ${spotifyToken ? 'bg-green-500' : 'bg-[var(--accent)]'}`} />
                    <span className="font-mono text-sm text-white">{spotifyToken ? 'CONNECTED' : 'DISCONNECTED'}</span>
                  </div>
                  {spotifyToken ? (
                    <div className="space-y-2">
                      <button onClick={async () => { try { await axios.post(`${API}/spotify/logout`, {}, { headers: { Authorization: `Bearer ${token}` } }); setSpotifyToken(null); toast.success('Disconnected'); } catch {} }}
                        className="w-full border border-[var(--accent)]/30 text-[var(--accent)] py-3 font-mono text-xs uppercase" data-testid="mobile-spotify-logout">DISCONNECT</button>
                      <button onClick={async () => { try { await axios.post(`${API}/spotify/logout`, {}, { headers: { Authorization: `Bearer ${token}` } }); setSpotifyToken(null); handleSpotifyLogin(); } catch {} }}
                        className="w-full border border-[var(--border)] text-white py-3 font-mono text-xs uppercase hover:bg-white/5" data-testid="mobile-spotify-switch">SWITCH ACCOUNT</button>
                    </div>
                  ) : (
                    <button onClick={handleSpotifyLogin} className="neon-button w-full py-3 text-sm" data-testid="mobile-spotify-login">
                      <span className="flex items-center justify-center gap-2"><Music2 className="w-4 h-4" /> CONNECT SPOTIFY</span>
                    </button>
                  )}
                </div>
                <div className="cyber-card p-4">
                  <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em]">System Info</span>
                  <div className="mt-3 space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-[var(--text-muted)]"><span>VERSION</span><span className="text-white">1.0.0</span></div>
                    <div className="flex justify-between text-[var(--text-muted)]"><span>STATUS</span><span className="text-green-500">OPERATIONAL</span></div>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full border border-[var(--accent)]/30 text-[var(--accent)] py-4 font-mono text-sm uppercase font-bold hover:bg-[var(--accent)]/10 transition-colors duration-200" data-testid="mobile-logout-full">
                  <span className="flex items-center justify-center gap-2"><LogOut className="w-5 h-5" /> TERMINATE SESSION</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel safe-area-bottom" data-testid="mobile-tab-bar">
          <div className="grid grid-cols-4 h-16">
            {[
              { id: 'player', icon: Play, label: 'PLAYER' },
              { id: 'queue', icon: List, label: 'QUEUE', badge: queuedSongs.length },
              { id: 'qr', icon: QrCode, label: 'QR' },
              { id: 'settings', icon: Settings, label: 'SYS' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center gap-0.5 relative transition-colors duration-200"
                style={{ color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-muted)' }}
                data-testid={`mobile-tab-${tab.id}`}>
                <div className="relative">
                  <tab.icon className="w-5 h-5" />
                  {tab.badge > 0 && (
                    <div className="absolute -top-1.5 -right-2.5 bg-[var(--primary)] text-black text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center font-mono">{tab.badge > 9 ? '9+' : tab.badge}</div>
                  )}
                </div>
                <span className="font-mono text-[9px] tracking-wider">{tab.label}</span>
                {activeTab === tab.id && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--cyan)] shadow-[0_0_6px_var(--cyan)]" />}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminDashboard;
