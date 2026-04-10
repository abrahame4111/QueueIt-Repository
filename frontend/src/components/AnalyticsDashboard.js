import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Users, Music, Clock, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AnalyticsDashboard = ({ token }) => {
  const [overview, setOverview] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ov, ts, hr, dy, rc] = await Promise.all([
        axios.get(`${API}/analytics/overview`, { headers }),
        axios.get(`${API}/analytics/top-songs`, { headers }),
        axios.get(`${API}/analytics/hourly`, { headers }),
        axios.get(`${API}/analytics/daily`, { headers }),
        axios.get(`${API}/analytics/recent`, { headers }),
      ]);
      setOverview(ov.data);
      setTopSongs(ts.data.top_songs);
      setHourly(hr.data.hourly);
      setDaily(dy.data.daily);
      setRecent(rc.data.recent);
    } catch (e) {
      console.error('Analytics fetch failed', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="analytics-loading">
        <div className="text-center font-mono text-[var(--text-muted)]">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse" />
          <p className="text-sm">// LOADING ANALYTICS...</p>
        </div>
      </div>
    );
  }

  const maxHourly = Math.max(...hourly.map(h => h.count), 1);
  const maxDaily = Math.max(...daily.map(d => d.count), 1);
  const maxTopSong = topSongs.length > 0 ? topSongs[0].count : 1;

  const formatHour = (h) => {
    if (h === 0) return '12A';
    if (h < 12) return `${h}A`;
    if (h === 12) return '12P';
    return `${h - 12}P`;
  };

  const formatDate = (d) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase();
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'JUST NOW';
    if (mins < 60) return `${mins}M AGO`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}H AGO`;
    return `${Math.floor(hrs / 24)}D AGO`;
  };

  return (
    <div className="space-y-4" data-testid="analytics-dashboard">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {[
          { label: 'TOTAL REQUESTS', value: overview?.total_requests || 0, icon: TrendingUp, color: 'var(--primary)' },
          { label: 'PLAYED', value: overview?.total_played || 0, icon: Music, color: 'var(--cyan)' },
          { label: 'TODAY', value: overview?.requests_today || 0, icon: Clock, color: '#22c55e' },
          { label: 'UNIQUE GUESTS', value: overview?.unique_requesters || 0, icon: Users, color: 'var(--accent)' },
        ].map((s) => (
          <div key={s.label} className="cyber-card p-3 md:p-4" data-testid={`analytics-stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] uppercase tracking-[0.1em]">{s.label}</span>
            </div>
            <p className="font-cyber text-2xl md:text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top Songs */}
      <div className="cyber-card hud-corners" data-testid="analytics-top-songs">
        <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
          <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
          <span className="font-cyber text-sm font-bold text-white">TOP REQUESTED</span>
          <span className="font-mono text-[10px] text-[var(--text-muted)] ml-1">[{topSongs.length}]</span>
        </div>
        <div className="p-4">
          {topSongs.length === 0 ? (
            <div className="text-center py-8 font-mono text-[var(--text-muted)]">
              <Music className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">// NO DATA YET</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topSongs.map((song, i) => (
                <div key={song.song_id} className="flex items-center gap-3" data-testid={`top-song-${i}`}>
                  <span className="font-mono text-xs font-bold w-5 shrink-0" style={{ color: i < 3 ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <img src={song.album_art || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{song.name}</p>
                    <p className="text-[var(--text-muted)] text-xs truncate font-mono">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 h-1.5 bg-[var(--border)] overflow-hidden hidden sm:block">
                      <div className="h-full bg-[var(--primary)]" style={{ width: `${(song.count / maxTopSong) * 100}%` }} />
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--primary)] w-6 text-right">{song.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hourly Distribution */}
        <div className="cyber-card hud-corners" data-testid="analytics-hourly">
          <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
            <Clock className="w-4 h-4 text-[var(--cyan)]" />
            <span className="font-cyber text-sm font-bold text-white">PEAK HOURS</span>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-[2px] h-24">
              {hourly.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div
                    className="w-full transition-all duration-300"
                    style={{
                      height: `${Math.max((h.count / maxHourly) * 100, h.count > 0 ? 8 : 0)}%`,
                      background: h.count > 0 ? 'var(--cyan)' : 'var(--border)',
                      boxShadow: h.count > 0 ? '0 0 4px var(--cyan)' : 'none',
                      minHeight: h.count > 0 ? '3px' : '1px',
                    }}
                  />
                  {h.count > 0 && (
                    <div className="absolute -top-5 bg-black/90 border border-[var(--cyan)] px-1 py-0.5 font-mono text-[8px] text-[var(--cyan)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {h.count}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-[2px] mt-1">
              {hourly.filter((_, i) => i % 4 === 0).map((h) => (
                <div key={h.hour} className="flex-[4] text-center font-mono text-[8px] text-[var(--text-muted)]">
                  {formatHour(h.hour)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Activity */}
        <div className="cyber-card hud-corners" data-testid="analytics-daily">
          <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
            <BarChart3 className="w-4 h-4 text-[var(--primary)]" />
            <span className="font-cyber text-sm font-bold text-white">LAST 7 DAYS</span>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-2 h-24">
              {daily.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div
                    className="w-full transition-all duration-300"
                    style={{
                      height: `${Math.max((d.count / maxDaily) * 100, d.count > 0 ? 8 : 0)}%`,
                      background: d.count > 0 ? 'var(--primary)' : 'var(--border)',
                      boxShadow: d.count > 0 ? '0 0 4px var(--primary)' : 'none',
                      minHeight: d.count > 0 ? '3px' : '1px',
                    }}
                  />
                  {d.count > 0 && (
                    <div className="absolute -top-5 bg-black/90 border border-[var(--primary)] px-1 py-0.5 font-mono text-[8px] text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {d.count}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              {daily.map((d) => (
                <div key={d.date} className="flex-1 text-center font-mono text-[8px] text-[var(--text-muted)]">
                  {formatDate(d.date)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="cyber-card hud-corners" data-testid="analytics-recent">
        <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
          <Activity className="w-4 h-4 text-[var(--cyan)]" />
          <span className="font-cyber text-sm font-bold text-white">RECENT ACTIVITY</span>
        </div>
        <ScrollArea className="h-[200px] md:h-[250px]">
          {recent.length === 0 ? (
            <div className="text-center py-8 font-mono text-[var(--text-muted)]">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">// NO ACTIVITY YET</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recent.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5" data-testid={`recent-activity-${i}`}>
                  <div
                    className="w-1.5 h-1.5 shrink-0"
                    style={{
                      background: item.action === 'request' ? 'var(--primary)' : item.action === 'play' ? 'var(--cyan)' : 'var(--accent)',
                      boxShadow: `0 0 4px ${item.action === 'request' ? 'var(--primary)' : item.action === 'play' ? 'var(--cyan)' : 'var(--accent)'}`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{item.song_name}</p>
                    <p className="text-[var(--text-muted)] text-[10px] font-mono truncate">
                      {item.action === 'request' ? 'REQUESTED' : 'PLAYED'} by {item.requested_by || 'ANON'}
                    </p>
                  </div>
                  <span className="font-mono text-[9px] text-[var(--text-muted)] shrink-0">{timeAgo(item.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
