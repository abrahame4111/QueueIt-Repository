import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Music, List, Play, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CustomerHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    fetchPlaylists(); fetchQueue(); fetchCurrentSong();
    const interval = setInterval(() => { fetchQueue(); fetchCurrentSong(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPlaylists = async () => { try { const r = await axios.get(`${API}/songs/playlists`); setPlaylists(r.data.playlists); } catch {} };
  const fetchPlaylistTracks = async (id) => { setLoading(true); try { const r = await axios.get(`${API}/songs/playlist/${id}`); setPlaylistTracks(r.data.songs); setSelectedPlaylist(id); } catch { toast.error('Failed to load playlist'); } finally { setLoading(false); } };
  const searchSongs = async () => { if (!searchQuery.trim()) return; setLoading(true); try { const r = await axios.get(`${API}/songs/search?q=${encodeURIComponent(searchQuery)}`); setSearchResults(r.data.songs); } catch { toast.error('Search failed'); } finally { setLoading(false); } };
  const fetchQueue = async () => { try { const r = await axios.get(`${API}/queue`); setQueue(r.data.queue); } catch {} };
  const fetchCurrentSong = async () => { 
    try { 
      const r = await axios.get(`${API}/queue/current`); 
      const fetched = r.data.current;
      setCurrentSong(prev => {
        if (!fetched && !prev) return null;
        if (!fetched) return null;
        if (!prev) return fetched;
        // Only update if song actually changed (prevents re-render flicker)
        if (prev.song?.spotify_uri === fetched.song?.spotify_uri) return prev;
        return fetched;
      });
    } catch {} 
  };

  const addToQueue = async (song) => {
    try {
      await axios.post(`${API}/queue/add`, { song, requested_by: 'Guest' });
      toast.success('Song queued!', { description: `${song.name} by ${song.artist}` });
      fetchQueue(); fetchCurrentSong();
    } catch { toast.error('Failed to add song'); }
  };

  const fmt = (ms) => { const m = Math.floor(ms / 60000); const s = ((ms % 60000) / 1000).toFixed(0); return `${m}:${s.padStart(2, '0')}`; };

  const SongCard = ({ song }) => (
    <div
      className="song-card group"
      data-testid={`song-card-${song.id}`}
      style={{ display: 'grid', gridTemplateColumns: '40px 1fr 56px', gap: '10px', alignItems: 'center', width: '100%' }}
    >
      <img src={song.album_art || 'https://via.placeholder.com/40'} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
      <div style={{ minWidth: 0 }}>
        <h3 className="text-white font-semibold text-sm truncate leading-tight">{song.name}</h3>
        <p className="text-[var(--text-muted)] text-xs truncate font-mono">{song.artist}</p>
      </div>
      <button onClick={() => addToQueue(song)} className="neon-button text-[10px] font-bold h-8 px-1" data-testid={`add-to-queue-${song.id}`}>
        <span><Zap className="w-3 h-3 inline" /> ADD</span>
      </button>
    </div>
  );

  const queuedSongs = queue.filter(i => i.status === 'queued');
  const tabs = [
    { id: 'search', label: 'SEARCH', icon: Search },
    { id: 'playlists', label: 'BROWSE', icon: Music },
    { id: 'queue', label: 'QUEUE', icon: List, badge: queuedSongs.length },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20 relative">
      {/* Hero */}
      <div className="relative h-40 sm:h-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--cyan)]/10 via-[var(--bg)]/60 to-[var(--bg)]" />
        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.04) 2px, rgba(0,240,255,0.04) 4px)' }} />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex justify-center mb-3">
              <img src="/queueit-icon.png" alt="" className="w-14 h-14 sm:w-16 sm:h-16" />
            </div>
            <h1 className="font-cyber text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-1 glitch-text" data-text="QUEUEIT">
              QUEUE<span className="text-[var(--primary)]">IT</span>
            </h1>
            <p className="font-mono text-[var(--text-muted)] uppercase tracking-[0.25em] text-[10px] sm:text-xs">Request. Queue. Vibe.</p>
          </motion.div>
        </div>
      </div>

      {/* Now Playing */}
      <AnimatePresence>
        {currentSong && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="cyber-card breathe-border mx-4 mt-4 p-4" data-testid="current-playing">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-[var(--cyan)] shadow-[0_0_6px_var(--cyan)] animate-pulse" />
              <span className="font-mono text-[var(--cyan)] uppercase tracking-[0.15em] text-[10px] font-bold">NOW PLAYING</span>
            </div>
            <div className="flex gap-3 items-center">
              <img src={currentSong.song.album_art || 'https://via.placeholder.com/64'} alt="" className="w-14 h-14 sm:w-16 sm:h-16 shrink-0" />
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">{currentSong.song.name}</h2>
                <p className="text-[var(--text-muted)] text-sm truncate font-mono">{currentSong.song.artist}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Selector */}
      <div className="px-4 mt-5">
        <div className="flex border border-[var(--border)]">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3 flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-wider transition-colors duration-200 relative"
              style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? '#050505' : 'var(--text-muted)',
              }}
              data-testid={`tab-${tab.id}`}>
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="ml-1 text-[9px] font-bold" style={{ color: activeTab === tab.id ? '#050505' : 'var(--cyan)' }}>
                  [{tab.badge}]
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        <AnimatePresence mode="wait">
          {/* Search */}
          {activeTab === 'search' && (
            <motion.div key="search" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-full">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="// SEARCH TRACKS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchSongs()}
                  className="bg-black border-[var(--border)] text-white placeholder:text-white/20 py-5 rounded-none font-mono text-sm focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)]"
                  data-testid="search-input"
                />
                <button onClick={searchSongs} disabled={loading} className="neon-button px-5 py-3 text-xs shrink-0" data-testid="search-button">
                  <span>{loading ? '...' : 'GO'}</span>
                </button>
              </div>
              <ScrollArea className="h-[400px] sm:h-[500px]">
                <div className="space-y-1.5">
                  {searchResults.map((song, i) => <SongCard key={song.id} song={song} delay={i} />)}
                </div>
                {searchResults.length === 0 && !loading && (
                  <div className="text-center py-16 font-mono text-[var(--text-muted)]">
                    <Search className="w-10 h-10 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">// ENTER QUERY TO SEARCH</p>
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          )}

          {/* Playlists */}
          {activeTab === 'playlists' && (
            <motion.div key="playlists" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {!selectedPlaylist ? (
                <div className="space-y-2">
                  {playlists.map((pl, i) => (
                    <motion.div key={pl.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => fetchPlaylistTracks(pl.id)} className="cyber-card cursor-pointer p-3 flex gap-3 items-center hover:border-[var(--cyan)]" data-testid={`playlist-${pl.id}`}>
                      <img src={pl.image} alt="" className="w-14 h-14 sm:w-16 sm:h-16 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white truncate">{pl.name}</h3>
                        <p className="text-[var(--text-muted)] text-xs truncate font-mono">{pl.description}</p>
                      </div>
                    </motion.div>
                  ))}
                  {playlists.length === 0 && (
                    <div className="text-center py-16 font-mono text-[var(--text-muted)]">
                      <Music className="w-10 h-10 mx-auto mb-4 opacity-20" />
                      <p className="text-sm">// NO PLAYLISTS AVAILABLE</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <button onClick={() => { setSelectedPlaylist(null); setPlaylistTracks([]); }}
                    className="border border-[var(--border)] text-[var(--cyan)] px-4 py-2 font-mono text-xs uppercase mb-4 hover:bg-[var(--cyan)]/10 transition-colors duration-200" data-testid="back-to-playlists">
                    &lt; BACK
                  </button>
                  <ScrollArea className="h-[400px] sm:h-[500px]">
                    <div className="space-y-1.5">
                      {playlistTracks.map((song, i) => <SongCard key={song.id} song={song} delay={i} />)}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </motion.div>
          )}

          {/* Queue */}
          {activeTab === 'queue' && (
            <motion.div key="queue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ScrollArea className="h-[400px] sm:h-[500px]">
                <div>
                  {queuedSongs.map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="queue-item" data-testid={`queue-item-${i}`}>
                      <div className="text-[var(--cyan)] font-mono font-bold text-sm w-6 shrink-0">{String(i+1).padStart(2,'0')}</div>
                      <img src={item.song.album_art || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{item.song.name}</p>
                        <p className="text-[var(--text-muted)] text-xs truncate font-mono">{item.song.artist}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--text-muted)] shrink-0">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono text-xs">{fmt(item.song.duration_ms)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {queuedSongs.length === 0 && (
                  <div className="text-center py-16 font-mono text-[var(--text-muted)]">
                    <List className="w-10 h-10 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">// QUEUE EMPTY</p>
                    <p className="text-xs opacity-50 mt-1">Search and add tracks to get started</p>
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomerHome;
