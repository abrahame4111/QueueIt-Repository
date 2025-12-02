import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Music, List, Play, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  useEffect(() => {
    fetchPlaylists();
    fetchQueue();
    fetchCurrentSong();
    
    // Poll queue every 5 seconds
    const interval = setInterval(() => {
      fetchQueue();
      fetchCurrentSong();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`${API}/songs/playlists`);
      setPlaylists(response.data.playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const fetchPlaylistTracks = async (playlistId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/songs/playlist/${playlistId}`);
      setPlaylistTracks(response.data.songs);
      setSelectedPlaylist(playlistId);
    } catch (error) {
      toast.error('Failed to load playlist');
      console.error('Error fetching playlist tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchSongs = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/songs/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data.songs);
    } catch (error) {
      toast.error('Search failed');
      console.error('Error searching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${API}/queue`);
      setQueue(response.data.queue);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchCurrentSong = async () => {
    try {
      const response = await axios.get(`${API}/queue/current`);
      setCurrentSong(response.data.current);
    } catch (error) {
      console.error('Error fetching current song:', error);
    }
  };

  const addToQueue = async (song) => {
    try {
      await axios.post(`${API}/queue/add`, {
        song: song,
        requested_by: 'Guest'
      });
      toast.success('Song added to queue!', {
        description: `${song.name} by ${song.artist}`
      });
      fetchQueue();
      fetchCurrentSong();
    } catch (error) {
      toast.error('Failed to add song');
      console.error('Error adding to queue:', error);
    }
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const SongCard = ({ song }) => (
    <div 
      className="song-card group"
      data-testid={`song-card-${song.id}`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Album Art */}
        <div className="w-10 h-10 sm:w-16 sm:h-16 flex-shrink-0">
          <img
            src={song.album_art || 'https://via.placeholder.com/64'}
            alt={song.album}
            className="w-full h-full object-cover rounded"
          />
        </div>
        
        {/* Song Info - takes remaining space minus button width */}
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-white font-semibold text-sm sm:text-base truncate leading-tight">{song.name}</h3>
          <p className="text-neutral-500 text-xs sm:text-sm truncate">{song.artist}</p>
        </div>
        
        {/* ADD Button - fixed width, always visible */}
        <Button
          onClick={() => addToQueue(song)}
          className="neon-button h-8 w-14 sm:h-9 sm:w-auto sm:px-4 text-[10px] sm:text-xs font-bold flex-shrink-0"
          data-testid={`add-to-queue-${song.id}`}
        >
          ADD
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-32">
      {/* Hero Section */}
      <div 
        className="relative h-36 sm:h-48 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,240,255,0.1) 0%, rgba(5,5,5,0.8) 100%), url('https://images.unsplash.com/photo-1706148817964-08251bc8cf8c?crop=entropy&cs=srgb&fm=jpg&q=85')`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white tracking-tighter mb-2">
              HOSTEL <span className="text-primary">BEATS</span>
            </h1>
            <p className="text-neutral-500 uppercase tracking-widest text-xs sm:text-sm">Queue Your Vibe</p>
          </div>
        </div>
      </div>

      {/* Currently Playing */}
      {currentSong && (
        <div className="glass-panel mx-3 sm:mx-4 mt-4 sm:mt-6 p-4 sm:p-6 rounded-xl" data-testid="current-playing">
          <div className="flex items-center gap-2 mb-3">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
            <span className="text-primary uppercase tracking-wider text-xs sm:text-sm font-bold">Now Playing</span>
          </div>
          <div className="flex gap-3 sm:gap-4 items-center">
            <img
              src={currentSong.song.album_art || 'https://via.placeholder.com/80'}
              alt={currentSong.song.album}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-heading font-bold text-white truncate">{currentSong.song.name}</h2>
              <p className="text-neutral-500 text-sm sm:text-base truncate">{currentSong.song.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-3 sm:px-4 mt-4 sm:mt-6 max-w-full overflow-hidden">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-surface border border-white/10">
            <TabsTrigger 
              value="search" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs sm:text-sm py-2 sm:py-3"
              data-testid="tab-search"
            >
              <Search className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">SEARCH</span>
            </TabsTrigger>
            <TabsTrigger 
              value="playlists" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs sm:text-sm py-2 sm:py-3"
              data-testid="tab-playlists"
            >
              <Music className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">PLAYLISTS</span>
            </TabsTrigger>
            <TabsTrigger 
              value="queue" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs sm:text-sm py-2 sm:py-3"
              data-testid="tab-queue"
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">QUEUE</span>
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
              <Input
                type="text"
                placeholder="Search for songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchSongs()}
                className="bg-white/5 border-none text-white placeholder:text-white/30 focus:ring-1 focus:ring-primary rounded-full px-4 sm:px-6 py-4 sm:py-6 text-base sm:text-lg"
                data-testid="search-input"
              />
              <Button
                onClick={searchSongs}
                disabled={loading}
                className="neon-button px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                data-testid="search-button"
              >
                <span className="text-sm sm:text-base">{loading ? 'SEARCHING...' : 'SEARCH'}</span>
              </Button>
            </div>

            <ScrollArea className="h-[400px] sm:h-[500px] w-full">
              <div className="space-y-2 sm:space-y-3 pr-1 max-w-full">
                {searchResults.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
              {searchResults.length === 0 && !loading && (
                <div className="text-center py-12 text-neutral-500">
                  <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm sm:text-base">Search for songs to add to queue</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="mt-4 sm:mt-6">
            {!selectedPlaylist ? (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => fetchPlaylistTracks(playlist.id)}
                    className="song-card cursor-pointer"
                    data-testid={`playlist-${playlist.id}`}
                  >
                    <div className="flex gap-3 sm:gap-4 items-center">
                      <img
                        src={playlist.image}
                        alt={playlist.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-heading font-bold text-white truncate">{playlist.name}</h3>
                        <p className="text-neutral-500 text-xs sm:text-sm truncate">{playlist.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <Button
                  onClick={() => {
                    setSelectedPlaylist(null);
                    setPlaylistTracks([]);
                  }}
                  variant="outline"
                  className="mb-4 border-white/20 text-white hover:bg-white/5 text-sm"
                  data-testid="back-to-playlists"
                >
                  ← Back to Playlists
                </Button>
                <ScrollArea className="h-[400px] sm:h-[500px]">
                  <div className="space-y-2 sm:space-y-3">
                    {playlistTracks.map((song) => (
                      <SongCard key={song.id} song={song} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue" className="mt-4 sm:mt-6">
            <ScrollArea className="h-[400px] sm:h-[500px]">
              <div className="space-y-0">
                {queue.filter(item => item.status === 'queued').map((item, index) => (
                  <div key={item.id} className="queue-item py-3 sm:py-4 px-2 sm:px-0" data-testid={`queue-item-${index}`}>
                    <div className="text-primary font-mono font-bold text-base sm:text-lg w-6 sm:w-8 flex-shrink-0">
                      {index + 1}
                    </div>
                    <img
                      src={item.song.album_art || 'https://via.placeholder.com/48'}
                      alt={item.song.album}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm sm:text-base truncate">{item.song.name}</p>
                      <p className="text-neutral-500 text-xs sm:text-sm truncate">{item.song.artist}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-neutral-500 text-xs flex-shrink-0">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{formatDuration(item.song.duration_ms)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {queue.filter(item => item.status === 'queued').length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                  <List className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm sm:text-base">Queue is empty</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerHome;