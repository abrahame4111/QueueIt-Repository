import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Music2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SpotifyPlayer = ({ currentSong, token, spotifyToken, onSpotifyLogin, onPlayNext }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [devices, setDevices] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState('checking'); // checking, active, inactive, error
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [songDuration, setSongDuration] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const pollIntervalRef = useRef(null);
  const lastSongIdRef = useRef(null);
  const lastPlayedUriRef = useRef(null);
  const currentSongRef = useRef(currentSong);
  
  // Keep currentSongRef in sync with currentSong prop
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  // Fetch devices and monitor playback
  useEffect(() => {
    if (spotifyToken) {
      fetchDevices();
      startPlaybackMonitoring();
      return () => stopPlaybackMonitoring();
    }
  }, [spotifyToken]);

  // Auto-play new songs when they change
  useEffect(() => {
    if (currentSong && spotifyToken) {
      const newSongId = currentSong.id;
      const newSongName = currentSong.song?.name;
      const newSongUri = currentSong.song?.spotify_uri;
      
      console.log('🎵 useEffect triggered:', {
        newSongId,
        newSongName,
        lastSongId: lastSongIdRef.current,
        isTransitioning,
        willPlay: newSongId !== lastSongIdRef.current && !isTransitioning
      });
      
      // Only auto-play if this is actually a different song AND we're not already transitioning
      if (newSongId !== lastSongIdRef.current && !isTransitioning) {
        console.log('✅ New song detected, will auto-play:', newSongName);
        lastSongIdRef.current = newSongId;
        // Small delay to ensure state has settled
        setTimeout(() => {
          playCurrentSong();
        }, 100);
      } else if (newSongId === lastSongIdRef.current) {
        console.log('⏭️ Same song detected, skipping auto-play');
      }
    } else if (!currentSong && lastSongIdRef.current) {
      console.log('🔄 No current song, resetting lastSongIdRef');
      lastSongIdRef.current = null;
      lastPlayedUriRef.current = null;
    }
  }, [currentSong?.id, spotifyToken]);

  const startPlaybackMonitoring = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(() => {
      checkPlaybackState();
      fetchDevices();
    }, 3000); // Poll every 3 seconds
  };

  const stopPlaybackMonitoring = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${API}/spotify/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const deviceList = response.data.devices || [];
      setDevices(deviceList);
      
      // Check device status
      const hasActiveDevice = deviceList.some(d => d.is_active);
      const hasAnyDevice = deviceList.length > 0;
      
      if (hasActiveDevice) {
        setDeviceStatus('active');
        setRetryCount(0);
      } else if (hasAnyDevice) {
        setDeviceStatus('inactive');
      } else {
        setDeviceStatus('error');
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDeviceStatus('error');
    }
  };

  const checkPlaybackState = async () => {
    try {
      const response = await axios.get(`${API}/spotify/playback-state`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const state = response.data;
      
      if (!state.item) {
        setIsPlaying(false);
        return;
      }
      
      // Update playback state
      setIsPlaying(state.is_playing || false);
      setPlaybackProgress(state.progress_ms || 0);
      setSongDuration(state.item.duration_ms || 0);
      
      // Check if current playing track matches our queue
      // Use ref to get the latest currentSong value
      const latestCurrentSong = currentSongRef.current;
      const currentSpotifyUri = state.item?.uri;
      const queuedUri = latestCurrentSong?.song?.spotify_uri;
      
      if (currentSpotifyUri === queuedUri) {
        // Perfect match, reset retry count and update last played
        if (lastPlayedUriRef.current !== queuedUri) {
          lastPlayedUriRef.current = queuedUri;
        }
        setRetryCount(0);
      } else if (currentSpotifyUri && queuedUri && currentSpotifyUri !== queuedUri && !isTransitioning) {
        // Mismatch detected - ONLY sync if:
        // 1. This is not what we just commanded to play
        // 2. We haven't exceeded retry limit
        // 3. Enough time has passed since last play command (prevent rapid-fire)
        
        const isRecentlyPlayed = lastPlayedUriRef.current === queuedUri;
        const isRecentlyCommandedSpotify = lastPlayedUriRef.current === currentSpotifyUri;
        
        if (!isRecentlyPlayed && !isRecentlyCommandedSpotify) {
          console.log('Track mismatch detected:', {
            spotifyPlaying: state.item?.name,
            queuedSong: latestCurrentSong?.song?.name,
            queuedUri: queuedUri,
            lastPlayedUri: lastPlayedUriRef.current,
            spotifyUri: currentSpotifyUri,
            retryCount: retryCount
          });
          
          // DISABLED: Only allow manual sync, no automatic retry to prevent loops
          // User can manually click play if needed
          console.log('⚠️ Sync disabled to prevent loops. Use manual play if needed.');
        } else {
          // This is expected during transitions
          console.log('Mismatch expected during transition, ignoring...');
        }
      }
      
      // Auto-advance when song ends (within last 2 seconds but not in last 500ms to avoid duplicate triggers)
      const duration = state.item.duration_ms || 0;
      const progress = state.progress_ms || 0;
      
      if (duration > 0 && progress >= duration - 2000 && progress < duration - 500) {
        if (!isTransitioning) {
          console.log('Song ending soon, will skip to next track...');
          setIsTransitioning(true);
          // Skip the current song in backend, fetchData will update currentSong, 
          // which will trigger the auto-play useEffect above
          if (onPlayNext) {
            onPlayNext();
          }
          // Reset transitioning state after a delay
          setTimeout(() => {
            setIsTransitioning(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error checking playback state:', error);
    }
  };

  const playCurrentSong = async () => {
    if (!currentSong) {
      console.log('⏭️ No currentSong, skipping playback');
      return;
    }
    
    if (isTransitioning) {
      console.log('⏭️ Already transitioning, skipping duplicate play call');
      return;
    }

    const trackUri = currentSong.song.spotify_uri;
    
    // Prevent duplicate plays of the same song
    if (lastPlayedUriRef.current === trackUri) {
      console.log('⏭️ This song was just played, skipping duplicate play call');
      return;
    }
    
    console.log('▶️ Playing song:', currentSong.song.name, 'URI:', trackUri);
    setIsTransitioning(true);
    
    try {
      await axios.post(
        `${API}/spotify/play`,
        { track_uri: trackUri },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Track what we just played to avoid mismatch false positives and duplicates
      lastPlayedUriRef.current = trackUri;
      setIsPlaying(true);
      setRetryCount(0);
      toast.success(`▶️ ${currentSong.song.name}`, {
        description: `by ${currentSong.song.artist}`
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setDeviceStatus('error');
        toast.error('No active device', {
          description: 'Open Spotify on your laptop or phone',
          duration: 5000
        });
      } else {
        console.error('Playback error:', error);
        toast.error('Playback failed', {
          description: 'Check your Spotify connection'
        });
      }
    } finally {
      setTimeout(() => setIsTransitioning(false), 2000);
    }
  };

  const handlePlayPause = async () => {
    if (deviceStatus === 'error' || deviceStatus === 'inactive') {
      toast.warning('Activate Spotify device', {
        description: 'Play any song in Spotify app first'
      });
      return;
    }

    try {
      if (isPlaying) {
        await axios.post(
          `${API}/spotify/pause`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsPlaying(false);
        toast('⏸️ Paused');
      } else {
        // Check if correct song is loaded
        const stateResponse = await axios.get(`${API}/spotify/playback-state`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const currentSpotifyTrack = stateResponse.data?.item;
        const queuedTrackUri = currentSong?.song?.spotify_uri;
        
        if (!currentSpotifyTrack || currentSpotifyTrack.uri !== queuedTrackUri) {
          // Play the queued song
          await playCurrentSong();
        } else {
          // Resume
          await axios.post(
            `${API}/spotify/resume`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsPlaying(true);
          toast('▶️ Playing');
        }
      }
    } catch (error) {
      console.error('Playback control error:', error);
      toast.error('Control failed', {
        description: 'Check device connection'
      });
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = songDuration > 0 ? (playbackProgress / songDuration) * 100 : 0;

  // Not connected to Spotify
  if (!spotifyToken) {
    return (
      <div className="cyber-card hud-corners p-8 text-center" data-testid="spotify-connect">
        <Music2 className="w-16 h-16 mx-auto mb-4 text-[var(--cyan)]" />
        <h3 className="font-cyber text-2xl font-bold text-white mb-2">
          CONNECT SPOTIFY
        </h3>
        <p className="text-[var(--text-muted)] font-mono text-sm mb-6">
          Link your Spotify Premium to control playback
        </p>
        <button onClick={onSpotifyLogin} className="neon-button h-14 px-8 mx-auto" data-testid="spotify-login-button">
          <span className="flex items-center gap-3">
            <Music2 className="w-5 h-5" />
            INITIALIZE SPOTIFY
          </span>
        </button>
        <p className="text-xs text-[var(--text-muted)] font-mono mt-4 opacity-50">
          Requires Spotify Premium
        </p>
      </div>
    );
  }

  // No song in queue
  if (!currentSong) {
    return (
      <div className="cyber-card p-6 text-center" data-testid="no-song-playing">
        <Music2 className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)] opacity-30" />
        <p className="text-[var(--text-muted)] font-mono text-sm">// QUEUE EMPTY</p>
        <p className="text-[var(--text-muted)] text-xs font-mono mt-1 opacity-50">Awaiting song requests...</p>
      </div>
    );
  }

  // Now playing card
  return (
    <div className="cyber-card breathe-border p-5" data-testid="now-playing-card">
      <div className="flex gap-4 items-center mb-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <img src={currentSong.song.album_art || 'https://via.placeholder.com/80'} alt={currentSong.song.album} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Button onClick={handlePlayPause} disabled={isTransitioning} size="sm"
              className="w-10 h-10 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black p-0 rounded-none disabled:opacity-50"
              data-testid="play-pause-button">
              {isTransitioning ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
            </Button>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {deviceStatus === 'active' ? <CheckCircle className="w-4 h-4 text-green-500" /> : deviceStatus === 'checking' ? <Loader2 className="w-4 h-4 text-[var(--text-muted)] animate-spin" /> : <AlertCircle className="w-4 h-4 text-orange-500" />}
            <span className="font-mono text-[10px] text-[var(--cyan)] uppercase tracking-[0.15em] font-bold">{isPlaying ? 'NOW PLAYING' : 'PAUSED'}</span>
          </div>
          <h3 className="text-xl font-bold text-white truncate">{currentSong.song.name}</h3>
          <p className="text-[var(--text-muted)] text-sm truncate font-mono">{currentSong.song.artist}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-mono opacity-50">REQ: {currentSong.requested_by || 'ANONYMOUS'}</p>
        </div>
        {devices.length > 0 && devices[0].is_active && (
          <div className="text-right hidden sm:block">
            <p className="font-mono text-[10px] text-[var(--text-muted)] mb-1">DEVICE</p>
            <p className="text-sm text-white font-semibold truncate max-w-[150px]">{devices[0].name}</p>
            <p className="font-mono text-[10px] text-[var(--cyan)]">{devices[0].type}</p>
          </div>
        )}
      </div>
      {songDuration > 0 && (
        <div className="space-y-1">
          <div className="relative h-1 bg-white/10 overflow-hidden">
            <div className="absolute h-full bg-[var(--cyan)] transition-all duration-1000" style={{ width: `${progressPercentage}%`, boxShadow: 'var(--glow-cyan)' }} />
          </div>
          <div className="flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
            <span>{formatTime(playbackProgress)}</span>
            <span>{formatTime(songDuration)}</span>
          </div>
        </div>
      )}
      {deviceStatus === 'error' && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-start gap-2 text-orange-500 text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div><p className="font-semibold">NO DEVICE DETECTED</p><p className="text-[var(--text-muted)] mt-1">Open Spotify and play any song to activate</p></div>
          </div>
        </div>
      )}
      {deviceStatus === 'inactive' && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-start gap-2 text-yellow-500 text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div><p className="font-semibold">DEVICE INACTIVE</p><p className="text-[var(--text-muted)] mt-1">Play any song to activate: {devices[0]?.name}</p></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyPlayer;