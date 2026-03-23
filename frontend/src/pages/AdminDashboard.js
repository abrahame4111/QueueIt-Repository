import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogIn, SkipForward, Trash2, Play, Music, List, QrCode, LogOut, Settings, ChevronDown, ChevronUp, Music2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      if (!localStorage.getItem('queueit_onboarding_done')) {
        setShowOnboarding(true);
      }
    }
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && savedToken) {
      handleSpotifyCallback(code, savedToken);
    }
  }, []);

  const checkSpotifyToken = async (authToken) => {
    try {
      const response = await axios.get(`${API}/spotify/token`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.has_token) {
        setSpotifyToken(response.data.access_token);
      }
    } catch (error) {
      console.error('Error checking Spotify token:', error);
    }
  };

  const handleSpotifyLogin = async () => {
    try {
      const response = await axios.get(`${API}/spotify/auth-url`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = response.data.auth_url;
    } catch (error) {
      toast.error('Failed to initiate Spotify login');
    }
  };

  const handleSpotifyCallback = async (code, authToken) => {
    try {
      const response = await axios.post(
        `${API}/spotify/callback?code=${code}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.data.success) {
        setSpotifyToken(response.data.access_token);
        toast.success('Connected to Spotify!');
        window.history.replaceState({}, document.title, '/admin');
      }
    } catch (error) {
      toast.error('Failed to connect to Spotify');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [currentResponse, queueResponse] = await Promise.all([
        axios.get(`${API}/queue/current`),
        axios.get(`${API}/queue`)
      ]);
      const fetchedCurrent = currentResponse.data.current;
      setCurrentSong(prevSong => {
        if (!fetchedCurrent && !prevSong) return null;
        if (!fetchedCurrent) return null;
        if (!prevSong) return fetchedCurrent;
        if (prevSong.id !== fetchedCurrent.id) return fetchedCurrent;
        return prevSong;
      });
      setQueue(queueResponse.data.queue);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, { password });
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('admin_token', response.data.token);
        setIsAuthenticated(true);
        checkSpotifyToken(response.data.token);
        toast.success('Login successful');
        if (!localStorage.getItem('queueit_onboarding_done')) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      toast.error('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (isSkipping) return;
    setIsSkipping(true);
    try {
      const response = await axios.post(`${API}/queue/skip`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Song skipped');
      if (response.data.next_song) {
        const nextSongData = response.data.next_song;
        nextSongData['_id'] = nextSongData['_id'] || nextSongData.id;
        setCurrentSong(nextSongData);
      } else {
        setCurrentSong(null);
      }
      const queueResponse = await axios.get(`${API}/queue`);
      setQueue(queueResponse.data.queue);
    } catch (error) {
      toast.error('Failed to skip song');
    } finally {
      setTimeout(() => setIsSkipping(false), 1000);
    }
  };

  const handleClearQueue = async () => {
    if (!window.confirm('Clear entire queue?')) return;
    try {
      await axios.post(`${API}/queue/clear`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Queue cleared');
      fetchData();
    } catch (error) {
      toast.error('Failed to clear queue');
    }
  };

  const handleRemoveSong = async (itemId) => {
    try {
      await axios.delete(`${API}/queue/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Song removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove song');
    }
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    try {
      if (spotifyToken) {
        await axios.post(`${API}/spotify/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error logging out from Spotify:', error);
    }
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setToken('');
    setPassword('');
    setSpotifyToken(null);
    toast.success('Logged out successfully');
  };

  const queuedSongs = queue.filter(item => item.status === 'queued');

  // ─── Login Screen ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-surface border-white/10">
          <CardHeader>
            <CardTitle className="text-3xl font-heading font-bold text-center">
              ADMIN <span className="text-primary">LOGIN</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 py-6"
                data-testid="admin-password-input"
              />
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full neon-button py-6"
                data-testid="admin-login-button"
              >
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {loading ? 'LOGGING IN...' : 'LOGIN'}
                </span>
              </Button>
              <p className="text-center text-neutral-500 text-sm mt-4">
                Default password: <span className="font-mono">hostel2024</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Authenticated Dashboard ───
  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      {showOnboarding && (
        <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />
      )}

      {/* ─── Desktop Layout (md+) ─── */}
      <div className="hidden md:block p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white tracking-tighter">
              ADMIN <span className="text-primary">CONSOLE</span>
            </h1>
            <p className="text-neutral-500 uppercase tracking-widest text-sm mt-1">Control Room</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5"
            data-testid="logout-button"
          >
            LOGOUT
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-surface border-primary/30" data-testid="stat-current">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                <Play className="w-4 h-4" /> Now Playing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-heading font-bold text-primary">{currentSong ? '1' : '0'}</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-white/10" data-testid="stat-queue">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                <List className="w-4 h-4" /> In Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-heading font-bold text-white">{queuedSongs.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-white/10" data-testid="stat-total">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                <Music className="w-4 h-4" /> Total Songs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-heading font-bold text-white">{queue.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Spotify Player */}
        <div className="mb-8">
          <SpotifyPlayer
            currentSong={currentSong}
            token={token}
            spotifyToken={spotifyToken}
            onSpotifyLogin={handleSpotifyLogin}
            onPlayNext={handleSkip}
          />
        </div>

        {/* Currently Playing - Only show if not using Spotify player */}
        {currentSong && !spotifyToken && (
          <Card className="bg-surface border-primary/30 mb-8" data-testid="current-song-card">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-primary flex items-center gap-2">
                <Play className="w-5 h-5 animate-pulse" /> NOW PLAYING
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 items-center">
                <img src={currentSong.song.album_art || 'https://via.placeholder.com/120'} alt={currentSong.song.album} className="w-32 h-32 rounded-lg" />
                <div className="flex-1">
                  <h2 className="text-3xl font-heading font-bold text-white mb-2">{currentSong.song.name}</h2>
                  <p className="text-xl text-neutral-500 mb-4">{currentSong.song.artist}</p>
                  <p className="text-neutral-500 text-sm">Requested by: <span className="text-white">{currentSong.requested_by || 'Guest'}</span></p>
                </div>
                <Button onClick={handleSkip} className="neon-button h-16 px-8" data-testid="skip-button">
                  <span className="flex items-center gap-2"><SkipForward className="w-5 h-5" /> SKIP</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Queue Management */}
        <Card className="bg-surface border-white/10">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="uppercase tracking-wider flex items-center gap-2">
                <List className="w-5 h-5" /> QUEUE
              </CardTitle>
              <div className="flex gap-3">
                <Button onClick={handleSkip} variant="outline" className="border-primary text-primary hover:bg-primary/10" data-testid="play-next-button">
                  <SkipForward className="w-4 h-4 mr-2" /> PLAY NEXT
                </Button>
                <Button onClick={handleClearQueue} variant="outline" className="border-accent-error text-accent-error hover:bg-accent-error/10" data-testid="clear-queue-button">
                  <Trash2 className="w-4 h-4 mr-2" /> CLEAR ALL
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {queuedSongs.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <List className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Queue is empty</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {queuedSongs.map((item, index) => (
                    <div key={item.id} className="queue-item group" data-testid={`admin-queue-item-${index}`}>
                      <div className="text-primary font-mono font-bold text-xl w-10">{index + 1}</div>
                      <img src={item.song.album_art || 'https://via.placeholder.com/64'} alt={item.song.album} className="w-16 h-16 rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-lg truncate">{item.song.name}</p>
                        <p className="text-neutral-500 truncate">{item.song.artist}</p>
                        <p className="text-neutral-500 text-xs mt-1">Requested by: {item.requested_by || 'Guest'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-neutral-500 font-mono">{formatDuration(item.song.duration_ms)}</p>
                        <Button onClick={() => handleRemoveSong(item._id)} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`remove-song-${index}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* QR Code Generator */}
        <div className="mt-8">
          <QRCodeGenerator />
        </div>
      </div>

      {/* ─── Mobile Layout (< md) ─── */}
      <div className="md:hidden flex flex-col min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-heading font-bold text-white tracking-tight">
              QUEUE<span className="text-primary">IT</span>
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1">
                <div className={`w-2 h-2 rounded-full ${spotifyToken ? 'bg-green-500' : 'bg-neutral-600'}`} />
                <span className="text-xs text-neutral-400">{spotifyToken ? 'Connected' : 'Offline'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                data-testid="mobile-logout-button"
              >
                <LogOut className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Content Area */}
        <div className="flex-1 px-4 pt-4 overflow-y-auto">

          {/* Player Tab */}
          {activeTab === 'player' && (
            <div className="space-y-4" data-testid="mobile-player-tab">
              {/* Mini Stats Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface border border-primary/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{currentSong ? '1' : '0'}</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Playing</p>
                </div>
                <div className="bg-surface border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">{queuedSongs.length}</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">In Queue</p>
                </div>
                <div className="bg-surface border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">{queue.length}</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Total</p>
                </div>
              </div>

              {/* Spotify Player */}
              <SpotifyPlayer
                currentSong={currentSong}
                token={token}
                spotifyToken={spotifyToken}
                onSpotifyLogin={handleSpotifyLogin}
                onPlayNext={handleSkip}
              />

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleSkip}
                  disabled={isSkipping || !currentSong}
                  className="h-14 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 rounded-xl font-bold"
                  data-testid="mobile-skip-button"
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  SKIP
                </Button>
                <Button
                  onClick={handleClearQueue}
                  disabled={queuedSongs.length === 0}
                  variant="outline"
                  className="h-14 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-bold"
                  data-testid="mobile-clear-button"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  CLEAR
                </Button>
              </div>
            </div>
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <div data-testid="mobile-queue-tab">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-white">Queue</h2>
                <span className="text-sm text-neutral-500">{queuedSongs.length} songs</span>
              </div>

              {queuedSongs.length === 0 ? (
                <div className="text-center py-16 text-neutral-500">
                  <List className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-base">Queue is empty</p>
                  <p className="text-sm text-neutral-600 mt-1">Waiting for requests...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queuedSongs.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-surface border border-white/5 rounded-xl p-3 active:bg-white/5 transition-colors"
                      data-testid={`mobile-queue-item-${index}`}
                    >
                      <div className="text-primary font-mono font-bold text-sm w-6 text-center shrink-0">
                        {index + 1}
                      </div>
                      <img
                        src={item.song.album_art || 'https://via.placeholder.com/48'}
                        alt={item.song.album}
                        className="w-12 h-12 rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{item.song.name}</p>
                        <p className="text-neutral-500 text-xs truncate">{item.song.artist}</p>
                        <p className="text-neutral-600 text-[10px] mt-0.5">{item.requested_by || 'Guest'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-neutral-600 text-xs font-mono">{formatDuration(item.song.duration_ms)}</span>
                        <button
                          onClick={() => handleRemoveSong(item._id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                          data-testid={`mobile-remove-song-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* QR Tab */}
          {activeTab === 'qr' && (
            <div data-testid="mobile-qr-tab">
              <QRCodeGenerator />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4" data-testid="mobile-settings-tab">
              <h2 className="text-lg font-heading font-bold text-white">Settings</h2>

              {/* Spotify Connection */}
              <div className="bg-surface border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Spotify</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${spotifyToken ? 'bg-green-500' : 'bg-neutral-600'}`} />
                  <span className="text-sm text-neutral-300">{spotifyToken ? 'Connected to Spotify' : 'Not connected'}</span>
                </div>
                {spotifyToken ? (
                  <div className="space-y-2">
                    <Button
                      onClick={async () => {
                        try {
                          await axios.post(`${API}/spotify/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
                          setSpotifyToken(null);
                          toast.success('Disconnected from Spotify');
                        } catch { toast.error('Failed to disconnect'); }
                      }}
                      variant="outline"
                      className="w-full h-12 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
                      data-testid="mobile-spotify-logout"
                    >
                      Disconnect Spotify
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          await axios.post(`${API}/spotify/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
                          setSpotifyToken(null);
                          handleSpotifyLogin();
                        } catch { toast.error('Failed to switch'); }
                      }}
                      variant="outline"
                      className="w-full h-12 border-white/20 text-white hover:bg-white/5 rounded-xl"
                      data-testid="mobile-spotify-switch"
                    >
                      Switch Spotify Account
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleSpotifyLogin}
                    className="w-full h-12 bg-[#1DB954] hover:bg-[#1DB954]/80 text-white rounded-xl font-bold"
                    data-testid="mobile-spotify-login"
                  >
                    <Music2 className="w-5 h-5 mr-2" />
                    Connect Spotify
                  </Button>
                )}
              </div>

              {/* App Info */}
              <div className="bg-surface border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">About</h3>
                <div className="space-y-2 text-sm text-neutral-400">
                  <div className="flex justify-between">
                    <span>Version</span><span className="text-white">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer URL</span>
                    <span className="text-primary text-xs font-mono truncate max-w-[180px]">{BACKEND_URL}/</span>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full h-14 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-bold mt-4"
                data-testid="mobile-logout-full"
              >
                <LogOut className="w-5 h-5 mr-2" />
                LOGOUT
              </Button>
            </div>
          )}
        </div>

        {/* ─── Bottom Tab Bar ─── */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-white/10 safe-area-bottom" data-testid="mobile-tab-bar">
          <div className="grid grid-cols-4 h-16">
            {[
              { id: 'player', icon: Play, label: 'Player' },
              { id: 'queue', icon: List, label: 'Queue', badge: queuedSongs.length },
              { id: 'qr', icon: QrCode, label: 'QR Code' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                  activeTab === tab.id ? 'text-primary' : 'text-neutral-500'
                }`}
                data-testid={`mobile-tab-${tab.id}`}
              >
                <div className="relative">
                  <tab.icon className="w-5 h-5" />
                  {tab.badge > 0 && (
                    <div className="absolute -top-1.5 -right-2.5 bg-primary text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminDashboard;
