import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogIn, SkipForward, Trash2, Play, Music, List, FastForward } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import SpotifyPlayer from '@/components/SpotifyPlayer';

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

  useEffect(() => {
    // Check for saved token
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchData();
      checkSpotifyToken(savedToken);
    }

    // Handle OAuth callback
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
      console.error('Spotify login error:', error);
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
        // Clean up URL
        window.history.replaceState({}, document.title, '/admin');
      }
    } catch (error) {
      toast.error('Failed to connect to Spotify');
      console.error('Spotify callback error:', error);
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
      
      // Only update currentSong if it actually changed (by ID)
      // This prevents unnecessary re-renders and SpotifyPlayer useEffect triggers
      setCurrentSong(prevSong => {
        if (!fetchedCurrent && !prevSong) return null;
        if (!fetchedCurrent) return null;
        if (!prevSong) return fetchedCurrent;
        
        // Only update if the song ID actually changed
        if (prevSong.id !== fetchedCurrent.id) {
          console.log('fetchData: Current song changed from', prevSong.song?.name, 'to', fetchedCurrent.song?.name);
          return fetchedCurrent;
        }
        
        // Same song, don't update to prevent useEffect trigger
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
      const response = await axios.post(`${API}/admin/login`, {
        password: password
      });
      
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('admin_token', response.data.token);
        setIsAuthenticated(true);
        checkSpotifyToken(response.data.token);
        toast.success('Login successful');
      }
    } catch (error) {
      toast.error('Invalid password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      const response = await axios.post(
        `${API}/queue/skip`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Song skipped');
      
      // Use the next_song from skip response to update state immediately
      if (response.data.next_song) {
        const nextSongData = response.data.next_song;
        nextSongData['_id'] = nextSongData['_id'] || nextSongData.id;
        setCurrentSong(nextSongData);
        console.log('Skip: Updated currentSong to', nextSongData.song?.name);
      } else {
        setCurrentSong(null);
        console.log('Skip: No more songs in queue');
      }
      
      // Also fetch full queue state to refresh UI
      const queueResponse = await axios.get(`${API}/queue`);
      setQueue(queueResponse.data.queue);
    } catch (error) {
      toast.error('Failed to skip song');
      console.error('Skip error:', error);
    }
  };

  const handleClearQueue = async () => {
    if (!window.confirm('Clear entire queue?')) return;
    
    try {
      await axios.post(
        `${API}/queue/clear`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Queue cleared');
      fetchData();
    } catch (error) {
      toast.error('Failed to clear queue');
      console.error('Clear error:', error);
    }
  };

  const handleRemoveSong = async (itemId) => {
    try {
      await axios.delete(
        `${API}/queue/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Song removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove song');
      console.error('Remove error:', error);
    }
  };

  const handlePlayNext = async () => {
    // Skip current song and play next one
    await handleSkip();
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setToken('');
    setPassword('');
  };

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-surface border-primary/30" data-testid="stat-current">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Now Playing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-primary">
              {currentSong ? '1' : '0'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-white/10" data-testid="stat-queue">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <List className="w-4 h-4" />
              In Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-white">
              {queue.filter(item => item.status === 'queued').length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-white/10" data-testid="stat-total">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Total Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-white">
              {queue.length}
            </p>
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
              <Play className="w-5 h-5 animate-pulse" />
              NOW PLAYING
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 items-center">
              <img
                src={currentSong.song.album_art || 'https://via.placeholder.com/120'}
                alt={currentSong.song.album}
                className="w-32 h-32 rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-heading font-bold text-white mb-2">
                  {currentSong.song.name}
                </h2>
                <p className="text-xl text-neutral-500 mb-4">{currentSong.song.artist}</p>
                <p className="text-neutral-500 text-sm">
                  Requested by: <span className="text-white">{currentSong.requested_by || 'Guest'}</span>
                </p>
              </div>
              <Button
                onClick={handleSkip}
                className="neon-button h-16 px-8"
                data-testid="skip-button"
              >
                <span className="flex items-center gap-2">
                  <SkipForward className="w-5 h-5" />
                  SKIP
                </span>
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
              <List className="w-5 h-5" />
              QUEUE
            </CardTitle>
            <div className="flex gap-3">
              <Button
                onClick={handlePlayNext}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                data-testid="play-next-button"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                PLAY NEXT
              </Button>
              <Button
                onClick={handleClearQueue}
                variant="outline"
                className="border-accent-error text-accent-error hover:bg-accent-error/10"
                data-testid="clear-queue-button"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                CLEAR ALL
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {queue.filter(item => item.status === 'queued').length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <List className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Queue is empty</p>
              </div>
            ) : (
              <div className="space-y-0">
                {queue.filter(item => item.status === 'queued').map((item, index) => (
                  <div key={item.id} className="queue-item group" data-testid={`admin-queue-item-${index}`}>
                    <div className="text-primary font-mono font-bold text-xl w-10">
                      {index + 1}
                    </div>
                    <img
                      src={item.song.album_art || 'https://via.placeholder.com/64'}
                      alt={item.song.album}
                      className="w-16 h-16 rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-lg truncate">{item.song.name}</p>
                      <p className="text-neutral-500 truncate">{item.song.artist}</p>
                      <p className="text-neutral-500 text-xs mt-1">
                        Requested by: {item.requested_by || 'Guest'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-neutral-500 font-mono">
                        {formatDuration(item.song.duration_ms)}
                      </p>
                      <Button
                        onClick={() => handleRemoveSong(item._id)}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`remove-song-${index}`}
                      >
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
    </div>
  );
};

export default AdminDashboard;