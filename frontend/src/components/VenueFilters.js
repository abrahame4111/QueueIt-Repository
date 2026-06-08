import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wine, Zap, Coffee, Beer, Music, Shield, ShieldOff, Check } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PRESET_ICONS = {
  fine_dining: Wine,
  club: Zap,
  cafe: Coffee,
  bar: Beer,
  open: Music,
};

const ENERGY_COLORS = {
  low: '#00f0ff',
  medium: '#FCE300',
  high: '#FF003C',
  any: '#888',
  custom: '#FCE300',
};

const VenueFilters = ({ token }) => {
  const [filters, setFilters] = useState(null);
  const [presets, setPresets] = useState({});
  const [allGenres, setAllGenres] = useState([]);
  const [allMoods, setAllMoods] = useState([]);
  const [saving, setSaving] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, [token]);

  const fetchAll = async () => {
    try {
      const [f, p] = await Promise.all([
        axios.get(`${API}/filters`, { headers }),
        axios.get(`${API}/filters/presets`, { headers }),
      ]);
      setFilters(f.data);
      setPresets(p.data.presets);
      setAllGenres(p.data.all_genres);
      setAllMoods(p.data.all_moods);
      setCustomMode(f.data.preset === 'custom');
    } catch (e) {
      console.error('Failed to fetch filters', e);
    }
  };

  const applyPreset = async (presetKey) => {
    setSaving(true);
    try {
      const res = await axios.put(`${API}/filters`, {
        preset: presetKey,
        mode: filters?.mode || 'open',
      }, { headers });
      setFilters(res.data);
      setCustomMode(false);
      toast.success(`${res.data.label} preset applied`);
    } catch (e) {
      toast.error('Failed to apply preset');
    } finally {
      setSaving(false);
    }
  };

  const toggleMode = async () => {
    const newMode = filters.mode === 'strict' ? 'open' : 'strict';
    setSaving(true);
    try {
      const res = await axios.put(`${API}/filters`, {
        mode: newMode,
        ...(filters.preset !== 'custom' ? { preset: filters.preset } : { genres: filters.genres, moods: filters.moods }),
      }, { headers });
      setFilters(res.data);
      toast.success(newMode === 'strict' ? 'Strict mode ON — songs restricted' : 'Open mode — no restrictions');
    } catch (e) {
      toast.error('Failed to toggle mode');
    } finally {
      setSaving(false);
    }
  };

  const toggleGenre = (genre) => {
    const current = filters.genres || [];
    const updated = current.includes(genre) ? current.filter(g => g !== genre) : [...current, genre];
    saveCustom(updated, filters.moods);
  };

  const toggleMood = (mood) => {
    const current = filters.moods || [];
    const updated = current.includes(mood) ? current.filter(m => m !== mood) : [...current, mood];
    saveCustom(filters.genres, updated);
  };

  const saveCustom = async (genres, moods) => {
    setSaving(true);
    try {
      const res = await axios.put(`${API}/filters`, {
        mode: filters.mode,
        genres,
        moods,
      }, { headers });
      setFilters(res.data);
      setCustomMode(true);
    } catch (e) {
      toast.error('Failed to update filters');
    } finally {
      setSaving(false);
    }
  };

  if (!filters) return null;

  const activePreset = filters.preset || 'open';

  return (
    <div className="space-y-4" data-testid="venue-filters">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {filters.mode === 'strict' ? (
            <Shield className="w-4 h-4 text-[var(--accent)]" />
          ) : (
            <ShieldOff className="w-4 h-4 text-[#888]" />
          )}
          <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
            {filters.mode === 'strict' ? 'STRICT MODE — ONLY ALLOWED GENRES' : 'OPEN MODE — ALL SONGS ALLOWED'}
          </span>
        </div>
        <button
          onClick={toggleMode}
          disabled={saving}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            filters.mode === 'strict' ? 'bg-[var(--accent)]' : 'bg-[#333]'
          }`}
          data-testid="filter-mode-toggle"
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            filters.mode === 'strict' ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Venue Presets */}
      <div data-testid="filter-presets">
        <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2">VENUE PRESET</div>
        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(presets).map(([key, preset]) => {
            const Icon = PRESET_ICONS[key] || Music;
            const isActive = activePreset === key && !customMode;
            return (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                disabled={saving}
                className={`flex flex-col items-center gap-1.5 p-3 border transition-all duration-200 ${
                  isActive
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[#222] hover:border-[#444] bg-transparent'
                }`}
                data-testid={`preset-${key}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : 'text-[#666]'}`} />
                <span className={`font-mono text-[8px] tracking-wider uppercase ${isActive ? 'text-[var(--primary)]' : 'text-[#888]'}`}>
                  {preset.label.split(' ')[0]}
                </span>
                {isActive && <Check className="w-2.5 h-2.5 text-[var(--primary)]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Summary */}
      {activePreset !== 'open' && (
        <div className="border border-[#222] p-3 bg-[#0d0d0d]" data-testid="filter-summary">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cyber text-xs font-bold text-white tracking-wide">
              {customMode ? 'CUSTOM' : filters.label?.toUpperCase()}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: ENERGY_COLORS[filters.energy] || '#888', boxShadow: `0 0 4px ${ENERGY_COLORS[filters.energy] || '#888'}` }} />
              <span className="font-mono text-[9px] text-[#666] uppercase">{filters.energy} energy</span>
            </div>
          </div>
          <div className="font-mono text-[9px] text-[#555]">
            {filters.genres?.length || 0} genres &bull; {filters.moods?.length || 0} moods
            {filters.mode === 'strict' && <span className="text-[var(--accent)] ml-2">ENFORCED</span>}
          </div>
        </div>
      )}

      {/* Genre Chips */}
      <div data-testid="filter-genres">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em]">GENRES</span>
          <button onClick={() => setCustomMode(true)} className="font-mono text-[9px] text-[var(--cyan)] hover:underline">
            CUSTOMIZE
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allGenres.map((genre) => {
            const active = (filters.genres || []).includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                disabled={saving}
                className={`px-2.5 py-1 font-mono text-[9px] tracking-wider uppercase border transition-all ${
                  active
                    ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 text-[var(--cyan)]'
                    : 'border-[#222] text-[#555] hover:border-[#444]'
                }`}
                data-testid={`genre-${genre.replace(/\s/g, '-')}`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mood Chips */}
      <div data-testid="filter-moods">
        <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 block">MOODS</span>
        <div className="flex flex-wrap gap-1.5">
          {allMoods.map((mood) => {
            const active = (filters.moods || []).includes(mood);
            return (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                disabled={saving}
                className={`px-2.5 py-1 font-mono text-[9px] tracking-wider uppercase border transition-all ${
                  active
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[#222] text-[#555] hover:border-[#444]'
                }`}
                data-testid={`mood-${mood.replace(/\s/g, '-')}`}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VenueFilters;
