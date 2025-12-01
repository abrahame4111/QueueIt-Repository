// This is a reference implementation showing what the player looks like when connected
// The actual SpotifyPlayer.js component handles both connected and disconnected states

import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SpotifyPlayerConnected = ({ currentSong }) => {
  return (
    <div className="song-card">
      <div className="flex gap-4 items-center">
        <div className="relative w-20 h-20 flex-shrink-0">
          <img
            src={currentSong.song.album_art}
            alt={currentSong.song.album}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
            <Button
              size="sm"
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/80 text-black p-0"
            >
              <Pause className="w-5 h-5" fill="currentColor" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary uppercase tracking-wider font-bold">
              NOW PLAYING
            </span>
          </div>
          <h3 className="text-xl font-heading font-bold text-white truncate">
            {currentSong.song.name}
          </h3>
          <p className="text-neutral-500 truncate">{currentSong.song.artist}</p>
          <p className="text-xs text-neutral-600 mt-1">
            Requested by {currentSong.requested_by}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-neutral-500 mb-1">Playing on</p>
          <p className="text-sm text-white font-semibold">MacBook Pro</p>
          <p className="text-xs text-primary">Computer</p>
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayerConnected;
