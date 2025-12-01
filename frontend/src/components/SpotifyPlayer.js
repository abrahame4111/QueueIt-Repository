import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SpotifyPlayer = ({ currentSong, onSongEnd, clientId }) => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const playerCheckInterval = useRef(null);

  useEffect(() => {
    if (!clientId) return;

    // Load Spotify Web Playback SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
      if (playerCheckInterval.current) {
        clearInterval(playerCheckInterval.current);
      }
    };
  }, [clientId]);

  const initializePlayer = () => {
    // For demo purposes, create a mock player
    // In production, this would use actual Spotify OAuth token
    const mockPlayer = {
      connect: () => {
        console.log('Mock player connected');
        setIsReady(true);
        setDeviceId('mock-device-id');
        return Promise.resolve(true);
      },
      disconnect: () => console.log('Mock player disconnected'),
      addListener: (event, callback) => {
        console.log(`Added listener for ${event}`);
      },
      togglePlay: () => {
        setIsPlaying(!isPlaying);
        return Promise.resolve();
      },
      pause: () => {
        setIsPlaying(false);
        return Promise.resolve();
      },
      resume: () => {
        setIsPlaying(true);
        return Promise.resolve();
      },
      setVolume: (vol) => {
        setVolume(vol * 100);
        return Promise.resolve();
      },
      getCurrentState: () => {
        return Promise.resolve({
          position: currentPosition,
          duration: duration,
          paused: !isPlaying
        });
      }
    };

    setPlayer(mockPlayer);
    mockPlayer.connect();
  };

  useEffect(() => {
    if (currentSong && isReady && player) {
      // In production, this would play the song via Spotify
      setDuration(currentSong.song.duration_ms);
      setCurrentPosition(0);
      setIsPlaying(true);
      
      // Simulate playback progress
      playerCheckInterval.current = setInterval(() => {
        setCurrentPosition(prev => {
          const next = prev + 1000;
          if (next >= currentSong.song.duration_ms) {
            clearInterval(playerCheckInterval.current);
            onSongEnd && onSongEnd();
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (playerCheckInterval.current) {
        clearInterval(playerCheckInterval.current);
      }
    };
  }, [currentSong, isReady]);

  const handlePlayPause = async () => {
    if (!player) return;
    
    try {
      if (isPlaying) {
        await player.pause();
      } else {
        await player.resume();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
      toast.error('Playback control failed');
    }
  };

  const handleVolumeChange = async (value) => {
    if (!player) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    
    try {
      await player.setVolume(newVolume / 100);
    } catch (error) {
      console.error('Volume error:', error);
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(50);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentPosition / duration) * 100 : 0;

  if (!isReady) {
    return (
      <div className="glass-panel p-6 rounded-xl" data-testid="spotify-player-loading">
        <div className="text-center text-neutral-500">
          <div className="animate-pulse">Initializing Spotify Player...</div>
          <p className="text-xs mt-2">Note: Full playback requires Spotify Premium</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-xl space-y-4" data-testid="spotify-player">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-neutral-500 uppercase tracking-wider">
            Spotify Player {isPlaying ? 'Playing' : 'Paused'}
          </span>
        </div>
        {deviceId && (
          <span className="text-xs text-neutral-500 font-mono">Device: {deviceId}</span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-primary transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-500 font-mono">
          <span>{formatTime(currentPosition)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePlayPause}
            size="lg"
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary/80 text-black"
            data-testid="play-pause-button"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6" fill="currentColor" />
            )}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <Button
            onClick={handleMuteToggle}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            data-testid="mute-button"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
            data-testid="volume-slider"
          />
          <span className="text-xs text-neutral-500 font-mono w-10 text-right">
            {Math.round(volume)}%
          </span>
        </div>
      </div>

      <div className="text-xs text-neutral-500 text-center pt-2 border-t border-white/10">
        💡 This is a demo player. Connect your Spotify Premium account for actual playback.
      </div>
    </div>
  );
};

export default SpotifyPlayer;
