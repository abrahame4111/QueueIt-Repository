import { useState, useEffect } from 'react';
import { Play, Pause, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SpotifyPlayer = ({ currentSong, token, spotifyToken, onSpotifyLogin, onPlayNext }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (spotifyToken) {
      fetchDevices();
      // Poll playback state every 2 seconds
      const interval = setInterval(() => {
        checkPlaybackState();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [spotifyToken]);

  useEffect(() => {
    if (currentSong && spotifyToken && devices.length > 0) {
      playCurrentSong();
    }
  }, [currentSong?.id, spotifyToken]);

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${API}/spotify/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevices(response.data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const checkPlaybackState = async () => {
    try {
      const response = await axios.get(`${API}/spotify/playback-state`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const state = response.data;
      
      // Update playing state
      if (state.is_playing !== undefined) {
        setIsPlaying(state.is_playing);
      }
      
      // Check if song ended (progress >= duration or not playing and no item)
      if (state.item) {
        const progress = state.progress_ms || 0;
        const duration = state.item.duration_ms || 0;
        
        // If within 2 seconds of end, skip to next
        if (duration > 0 && progress >= duration - 2000) {
          console.log('Song ending, advancing to next...');
          if (onPlayNext) {
            onPlayNext();
          }
        }
      } else if (!state.is_playing && currentSong) {
        // Playback stopped but we have a song queued - might have ended
        console.log('Playback stopped, checking if song ended...');
      }
    } catch (error) {
      console.error('Error checking playback state:', error);
    }
  };

  const playCurrentSong = async () => {
    if (!currentSong) return;

    try {
      await axios.post(
        `${API}/spotify/play`,
        { track_uri: currentSong.song.spotify_uri },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsPlaying(true);
      toast.success('Now playing on Spotify');
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('No active Spotify device found. Please open Spotify on your laptop or phone.');
      } else {
        console.error('Playback error:', error);
        toast.error('Failed to start playback');
      }
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await axios.post(
          `${API}/spotify/pause`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsPlaying(false);
      } else {
        await axios.post(
          `${API}/spotify/resume`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback control error:', error);
      toast.error('Playback control failed');
    }
  };

  if (!spotifyToken) {
    return (
      <div className="bg-surface border border-primary/30 rounded-xl p-8 text-center" data-testid="spotify-connect">
        <Music2 className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-2xl font-heading font-bold text-white mb-2">
          Connect to Spotify
        </h3>
        <p className="text-neutral-500 mb-6">
          Login with your Spotify Premium account to control playback on your laptop or Bluetooth speaker.
        </p>
        <Button
          onClick={onSpotifyLogin}
          className="neon-button h-14 px-8"
          data-testid="spotify-login-button"
        >
          <span className="flex items-center gap-3">
            <Music2 className="w-5 h-5" />
            LOGIN WITH SPOTIFY
          </span>
        </Button>
        <p className="text-xs text-neutral-600 mt-4">
          Requires Spotify Premium for playback control
        </p>
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div className="bg-surface border border-white/10 rounded-xl p-6 text-center" data-testid="no-song-playing">
        <p className="text-neutral-500">No song in queue. Waiting for requests...</p>
      </div>
    );
  }

  return (
    <div className="song-card" data-testid="now-playing-card">
      <div className="flex gap-4 items-center">
        <div className="relative w-20 h-20 flex-shrink-0">
          <img
            src={currentSong.song.album_art || 'https://via.placeholder.com/80'}
            alt={currentSong.song.album}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
            <Button
              onClick={handlePlayPause}
              size="sm"
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/80 text-black p-0"
              data-testid="play-pause-button"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary uppercase tracking-wider font-bold">NOW PLAYING</span>
          </div>
          <h3 className="text-xl font-heading font-bold text-white truncate">
            {currentSong.song.name}
          </h3>
          <p className="text-neutral-500 truncate">{currentSong.song.artist}</p>
          <p className="text-xs text-neutral-600 mt-1">
            Requested by {currentSong.requested_by || 'Guest'}
          </p>
        </div>

        {devices.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-neutral-500 mb-1">Playing on</p>
            <p className="text-sm text-white font-semibold">{devices[0].name}</p>
            <p className="text-xs text-primary">{devices[0].type}</p>
          </div>
        )}
      </div>

      {devices.length === 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-orange-500 text-center">
            ⚠️ No active Spotify device detected. Please open Spotify on your laptop or phone.
          </p>
        </div>
      )}
    </div>
  );
};

export default SpotifyPlayer;