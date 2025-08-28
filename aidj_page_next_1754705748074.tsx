import React, { useMemo, useState } from 'react';

// ---- Blue, minimal SVGs (placeholders) ----
const IconMoonStars = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3a7.5 7.5 0 1 0 9 9 9 9 0 1 1-9-9z" opacity=".35" />
    <path d="M18 6.5l.6 1.1 1.2.2-.9.9.2 1.2-1.1-.6-1.1.6.2-1.2-.9-.9 1.2-.2L18 6.5z" />
  </svg>
);

const IconWaves = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 15c3 0 3-3 6-3s3 3 6 3 3-3 6-3" />
    <path d="M2 18c3 0 3-3 6-3s3 3 6 3 3-3 6-3" opacity=".5" />
  </svg>
);

const IconBurst = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="1.2" />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * Math.PI) / 6;
      return <line key={i} x1={12 + 0 * Math.cos(a)} y1={12 + 0 * Math.sin(a)} x2={12 + 8 * Math.cos(a)} y2={12 + 8 * Math.sin(a)} />;
    })}
  </svg>
);

const IconSteps = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 18v-4h4v-4h4V6h6" />
  </svg>
);

const IconHeartbeat = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 12h3l2 4 3-8 3 6h4" />
  </svg>
);

// ---- App constants (match your system) ----
const GENRE_CHIPS = [
  'All Music',
  'Focus',
  'Electronic & EDM',
  'Classical, New Age, & Acoustic',
  'World, Samba, & Latin',
  'Rock & Pop',
];

const GOALS = [
  { key: 'focus', label: 'Focus', icon: <IconBurst /> },
  { key: 'relaxation', label: 'Relaxation', icon: <IconWaves /> },
  { key: 'energy', label: 'Energy Boost', icon: <IconBurst /> },
  { key: 'nsdr', label: 'Non-Sleep Deep Rest', icon: <IconMoonStars /> },
  { key: 'pain', label: 'Pain Management', icon: <IconHeartbeat /> },
  { key: 'cardio_hiit', label: 'Cardio & HIIT', icon: <IconSteps /> },
  { key: 'light_exercise', label: 'Light Exercise', icon: <IconSteps /> },
  { key: 'walk_warm_up', label: 'Walk & Warm-Up', icon: <IconSteps /> },
  { key: 'anxiety_reduction', label: 'Anxiety Reduction', icon: <IconWaves /> },
  { key: 'chill', label: 'Chill', icon: <IconWaves /> },
];

export default function AIDJPageNext() {
  const [chip, setChip] = useState(GENRE_CHIPS[0]);
  const [goal, setGoal] = useState('focus');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [sessionName, setSessionName] = useState('');

  const headerNote = useMemo(() => {
    if (chip === 'Focus') return 'Instrumental only • No lyrics';
    if (chip.includes('World')) return 'Spanish, Portuguese, Greek, Ladino, Hebrew';
    if (chip.includes('Electronic')) return 'Modern electronic & uptempo';
    if (chip.includes('Classical')) return 'Acoustic, Classical, New Age';
    return 'Personalized therapeutic selection';
  }, [chip]);

  const startPlayback = (list, name) => {
    // Mock implementation for demo
    setTracks(list);
    setSessionName(name);
    console.log('Starting playback:', name, list);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Mock generation with realistic tracks
      const mockTracks = [
        {
          id: 1,
          title: 'Neural Harmony Flow',
          artist: 'Neural Positive Music',
          displayGenre: 'Therapeutic Ambient',
          genres: ['Ambient', 'Focus']
        },
        {
          id: 2,
          title: 'Cognitive Enhancement Suite',
          artist: 'NeuroTunes AI',
          displayGenre: 'Instrumental Focus',
          genres: ['Classical', 'Focus']
        },
        {
          id: 3,
          title: 'Deep Concentration Protocol',
          artist: 'Therapeutic Soundscapes',
          displayGenre: 'Binaural Focus',
          genres: ['Electronic', 'Focus']
        },
        {
          id: 4,
          title: 'Alpha Wave Induction',
          artist: 'Clinical Music Lab',
          displayGenre: 'Neurofeedback',
          genres: ['Ambient', 'Relaxation']
        }
      ];

      const name = `AI DJ • ${goal}`;
      startPlayback(mockTracks, name);
    } catch (err) {
      console.error(err);
      setTracks([]);
      setSessionName('Unable to generate playlist');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="min-h-screen text-white"
      style={{
        background: 'linear-gradient(to bottom, #0b1221 0%, #070d18 40%, #050a14 100%)'
      }}
    >
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/60 tracking-wide">AI DJ</div>
            <h1 className="text-2xl font-semibold">Let AI create your perfect mix</h1>
            <div className="text-xs text-white/50 mt-1">{headerNote}</div>
          </div>
          <div 
            className="px-3 py-1 rounded-full text-xs font-medium border"
            style={{
              background: 'rgba(56, 97, 251, 0.1)',
              borderColor: 'rgba(56, 97, 251, 0.3)',
              color: 'rgb(147, 197, 253)'
            }}
          >
            Neural Engine
          </div>
        </div>
      </div>

      {/* Genre chips */}
      <div className="max-w-5xl mx-auto px-4 overflow-x-auto py-3">
        <div className="flex gap-2 w-max">
          {GENRE_CHIPS.map((g) => (
            <button
              key={g}
              onClick={() => setChip(g)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all border ${
                chip === g 
                  ? 'bg-blue-600 text-white border-blue-500' 
                  : 'text-white/70 hover:text-white border-white/10 hover:border-white/20'
              }`}
              style={{
                background: chip === g ? 'rgb(37, 99, 235)' : 'rgba(28, 56, 92, 0.12)'
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Goals grid */}
      <div className="max-w-5xl mx-auto px-4 mt-4">
        <div className="text-sm font-medium text-white/80 mb-3">Select your therapeutic goal</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GOALS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGoal(g.key)}
              className={`p-4 text-left transition-all rounded-xl border ${
                goal === g.key 
                  ? 'ring-2 ring-blue-400/70 border-blue-500/30' 
                  : 'border-white/10 hover:border-white/20'
              }`}
              style={{
                background: goal === g.key 
                  ? 'rgba(56, 97, 251, 0.05)' 
                  : 'rgba(28, 56, 92, 0.12)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white/80"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  {g.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{g.label}</div>
                  <div className="text-xs text-white/50">AI-curated</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Generate CTA */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full mt-4 py-4 text-base font-semibold rounded-xl transition-all ${
            isGenerating ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgb(37, 99, 235), rgb(59, 130, 246))',
            color: 'white'
          }}
        >
          {isGenerating ? 'Generating…' : 'Generate Playlist'}
        </button>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 mt-6 pb-28">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-white/80">Suggested Tracks</div>
          {tracks.length > 0 && (
            <button
              className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/30 transition-all"
              onClick={() => startPlayback(tracks, sessionName || 'AI DJ')}
              style={{ background: 'rgba(28, 56, 92, 0.12)' }}
            >
              Play All
            </button>
          )}
        </div>

        {tracks.length === 0 ? (
          <div 
            className="p-4 text-white/60 text-sm rounded-xl border border-white/10"
            style={{ background: 'rgba(28, 56, 92, 0.12)' }}
          >
            {sessionName || 'No playlist generated yet. Choose a goal and tap Generate.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tracks.slice(0, 8).map((t) => (
              <div 
                key={t.id} 
                className="p-4 rounded-xl border border-white/10"
                style={{ background: 'rgba(28, 56, 92, 0.12)' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg" 
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{t.title}</div>
                    <div className="text-xs text-white/50 truncate">
                      {t.artist || 'Neural Positive Music'}
                    </div>
                    <div className="text-[11px] text-white/40">
                      {t.displayGenre || t.genres?.[0] || 'Ambient'}
                    </div>
                  </div>
                  <button
                    className="ml-auto px-3 py-1 text-xs rounded-md border border-white/20 text-white/80 hover:text-white hover:border-white/30 transition-all"
                    onClick={() => startPlayback([t], t.title)}
                    style={{ background: 'rgba(28, 56, 92, 0.12)' }}
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav (blue theme, minimal) */}
      <div 
        className="fixed bottom-0 left-0 right-0 border-t border-white/5"
        style={{ background: 'rgba(7, 13, 24, 0.96)', backdropFilter: 'blur(10px)' }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between py-3 text-[11px] text-white/60">
            {[
              { label: 'Trending' },
              { label: 'Mood' },
              { label: 'AI DJ', active: true },
              { label: 'Emotions' },
              { label: 'Profile' },
            ].map((i) => (
              <div
                key={i.label}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  i.active ? 'text-blue-400' : 'hover:text-white'
                }`}
              >
                <div 
                  className="w-5 h-5 rounded-full" 
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                />
                <div>{i.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}