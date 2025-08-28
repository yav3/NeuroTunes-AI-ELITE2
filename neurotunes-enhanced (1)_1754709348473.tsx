import React, { useState, useEffect } from 'react';

// Inline SVG icon components for better React Native compatibility
const HomeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const BotIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="m12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

const PlayIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
);

const PauseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </svg>
);

const PlayCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10,8 16,12 10,16"/>
  </svg>
);

const ActivityIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
  </svg>
);

const BookOpenIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const SkipBackIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="19,20 9,12 19,4"/>
    <line x1="5" y1="19" x2="5" y2="5"/>
  </svg>
);

const SkipForwardIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="5,4 15,12 5,20"/>
    <line x1="19" y1="5" x2="19" y2="19"/>
  </svg>
);

const Volume2Icon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
    <path d="m19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

const HeartIcon = ({ className = "w-6 h-6", filled = false }) => (
  <svg 
    className={className} 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    strokeWidth="2" 
    viewBox="0 0 24 24"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const HeadphonesIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);

const BrainIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A4.5 4.5 0 0 0 12 20.5a4.5 4.5 0 0 0 5.96-.21 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5"/>
    <path d="M8 12h.01"/>
    <path d="M16 12h.01"/>
    <path d="M12 16h.01"/>
  </svg>
);

const ZapIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
  </svg>
);

const SunIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const TrendingUpIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
    <polyline points="17,6 23,6 23,12"/>
  </svg>
);

const BarChart3Icon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const CalendarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ClockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const SparklesIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

const ChevronRightIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

const ShuffleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="16,3 21,3 21,8"/>
    <line x1="4" y1="20" x2="21" y2="3"/>
    <polyline points="21,16 21,21 16,21"/>
    <line x1="15" y1="15" x2="21" y2="21"/>
    <line x1="4" y1="4" x2="9" y2="9"/>
  </svg>
);

const RepeatIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="17,1 21,5 17,9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7,23 3,19 7,15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const MicIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const Share2Icon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const SettingsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const PlusIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// Enhanced data structures matching your app's style
const TABS = [
  { name: 'Mood', icon: HomeIcon },
  { name: 'AI DJ', icon: BotIcon },
  { name: 'Now Playing', icon: PlayCircleIcon },
  { name: 'Journey', icon: ActivityIcon },
  { name: 'User Manual', icon: BookOpenIcon }
];

const moods = [
  { value: 'very-low', label: 'Very Low - Need significant support', color: '#ff4444' },
  { value: 'low', label: 'Low', color: '#ff8c42' },
  { value: 'neutral', label: 'Neutral', color: '#ffd700' },
  { value: 'high', label: 'High', color: '#4caf50' },
  { value: 'very-high', label: 'Very High - Energized', color: '#2196f3' }
];

const goals = [
  { id: 'focus', name: 'Focus Enhancement', icon: BrainIcon },
  { id: 'pain', name: 'Pain Management', icon: HeartIcon },
  { id: 'anxiety', name: 'Anxiety Reduction', icon: ZapIcon },
  { id: 'mood', name: 'Mood Boost', icon: SunIcon },
  { id: 'sleep', name: 'Sleep Support', icon: MoonIcon },
  { id: 'chill', name: 'Chill', icon: MoonIcon }
];

const genres = [
  'Focus',
  'Classical, New Age, & Acoustic',
  'Electronic, Rock, & Pop'
];

// Sample data
const journeyData = [
  { day: 'Wed', sessions: 1, duration: 20 },
  { day: 'Thu', sessions: 2, duration: 45 },
  { day: 'Fri', sessions: 3, duration: 65 },
  { day: 'Sat', sessions: 4, duration: 85 },
  { day: 'Sun', sessions: 5, duration: 95 },
  { day: 'Mon', sessions: 3, duration: 70 }
];

const favorites = [
  { id: 1, name: 'A Duet for Strings in NY Jazz', genre: 'Electronic, Rock, & Pop', mood: 'upbeat' },
  { id: 2, name: 'Morning Focus Flow', genre: 'Classical, New Age, & Acoustic', duration: '45 min' },
  { id: 3, name: 'Evening Calm', genre: 'Focus', duration: '30 min' }
];

// Apple-style components
const CustomSelect = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white appearance-none focus:border-blue-500/50 focus:outline-none backdrop-blur-sm font-normal"
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 1rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em'
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option, index) => (
        <option key={index} value={typeof option === 'string' ? option : option.value}>
          {typeof option === 'string' ? option : option.label}
        </option>
      ))}
    </select>
  </div>
);

const IconButton = ({ icon: Icon, active = false, onClick, size = 'w-6 h-6', className = '' }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-full transition-all duration-300 ${
      active 
        ? 'bg-white/20 text-white scale-110 shadow-lg' 
        : 'text-white/60 hover:text-white hover:bg-white/10 hover:scale-105'
    } ${className}`}
  >
    <Icon className={size} />
  </button>
);

const ProgressBar = ({ current, total, className = '' }) => (
  <div className={`h-1 bg-white/20 rounded-full overflow-hidden ${className}`}>
    <div 
      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300 rounded-full"
      style={{ width: `${(current / total) * 100}%` }}
    />
  </div>
);

// New enhanced components
const SessionProgress = ({ isPlaying }) => (
  <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-4 backdrop-blur-sm">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium text-white text-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          Session Progress
        </h4>
        <p className="text-xs text-white/60 font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          {isPlaying ? 'Focus improvement detected' : 'Paused'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUpIcon className="w-4 h-4 text-green-400" />
        <span className="text-green-400 font-medium text-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          +42%
        </span>
      </div>
    </div>
  </div>
);

const QuickStats = () => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 backdrop-blur-sm text-center">
      <CalendarIcon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
      <div className="text-2xl font-medium text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
        12
      </div>
      <div className="text-xs text-white/60 font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
        Days Active
      </div>
    </div>
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 backdrop-blur-sm text-center">
      <ClockIcon className="w-6 h-6 text-green-400 mx-auto mb-2" />
      <div className="text-2xl font-medium text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
        8.5h
      </div>
      <div className="text-xs text-white/60 font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
        Total Time
      </div>
    </div>
  </div>
);

// Main App Component
const NeuroTunesAppV2 = () => {
  const [activeTab, setActiveTab] = useState('Mood');
  const [spatialEnabled, setSpatialEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [selectedGoal, setSelectedGoal] = useState('focus');
  const [selectedGenre, setSelectedGenre] = useState(genres[0]);
  const [currentTime, setCurrentTime] = useState(63);
  const [totalTime] = useState(225);
  const [volume, setVolume] = useState(70);
  const [lightningMode, setLightningMode] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Therapeutic Focus 042',
    artist: 'NeuroTunes Collection',
    genre: 'Binaural Beats • Focus Enhancement'
  });

  // Simulate progress
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentTime(prev => prev < totalTime ? prev + 1 : prev);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, totalTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMoodTab = () => (
    <div className="space-y-8 w-full max-w-sm mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-xl font-medium text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
          Welcome Back!
        </h2>
        <p className="text-white/60 text-base font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          Please pick your session
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
            How do you feel?
          </h3>
          <CustomSelect
            value={selectedMood}
            onChange={setSelectedMood}
            options={moods}
            placeholder="Select your current mood..."
          />
        </div>

        <div>
          <h3 className="text-lg font-normal text-white/80 mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
            Therapeutic Goal
          </h3>
          <CustomSelect
            value={selectedGoal}
            onChange={setSelectedGoal}
            options={goals.map(g => ({ value: g.id, label: g.name }))}
          />
        </div>

        <div>
          <h3 className="text-lg font-normal text-white/80 mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
            Music Genre
          </h3>
          <CustomSelect
            value={selectedGenre}
            onChange={setSelectedGenre}
            options={genres}
          />
        </div>

        {lightningMode && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <ZapIcon className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium text-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                  Lightning Mode
                </p>
                <p className="text-yellow-300/70 text-xs font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                  Only unheard tracks (>90% completion to mark as heard)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lightning Mode Toggle */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ZapIcon className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white font-medium text-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                  Lightning Mode
                </p>
                <p className="text-white/60 text-xs font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                  Only unheard tracks (>90% completion to mark as heard)
                </p>
              </div>
            </div>
            <button
              onClick={() => setLightningMode(!lightningMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                lightningMode ? 'bg-yellow-400' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                lightningMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        <button 
          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-2xl font-medium text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setActiveTab('Now Playing')}
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
        >
          Start Music Session
        </button>
      </div>
    </div>
  );

  const renderNowPlaying = () => (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto space-y-8">
      {/* Album Art */}
      <div className="relative">
        <div
          className="w-72 h-72 rounded-2xl shadow-lg relative overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at center, #ff6b6b 10%, #4ecdc4 30%, #45b7d1 50%, #96ceb4 70%, #ffecd2 90%)
            `
          }}
        >
          {/* Dynamic glassmorphism shapes that respond to music */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating glassmorphism circles */}
            <div 
              className={`absolute w-24 h-24 rounded-full backdrop-blur-md bg-white/20 border border-white/30 transition-all duration-1000 ${
                isPlaying ? 'animate-pulse' : ''
              }`}
              style={{
                top: '20%',
                left: '15%',
                transform: isPlaying ? 'scale(1.1) translate(10px, -5px)' : 'scale(1)',
              }}
            />
            <div 
              className={`absolute w-16 h-16 rounded-full backdrop-blur-md bg-white/15 border border-white/25 transition-all duration-1500 ${
                isPlaying ? 'animate-pulse' : ''
              }`}
              style={{
                top: '60%',
                right: '20%',
                transform: isPlaying ? 'scale(1.2) translate(-8px, 12px)' : 'scale(1)',
                animationDelay: '0.5s'
              }}
            />
            <div 
              className={`absolute w-20 h-20 rounded-full backdrop-blur-sm bg-white/25 border border-white/35 transition-all duration-2000 ${
                isPlaying ? 'animate-pulse' : ''
              }`}
              style={{
                bottom: '25%',
                left: '60%',
                transform: isPlaying ? 'scale(0.9) translate(15px, -10px)' : 'scale(1)',
                animationDelay: '1s'
              }}
            />
            
            {/* Central dynamic gradient overlay */}
            <div 
              className="absolute inset-8 rounded-xl backdrop-blur-sm bg-gradient-to-br from-white/10 to-transparent border border-white/20"
              style={{
                background: isPlaying 
                  ? `radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255, 107, 107, 0.1) 60%, transparent 100%)`
                  : `radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 100%)`,
                transition: 'all 2s ease-in-out'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Track Info */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-medium text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
          {currentTrack.title}
        </h3>
        <p className="text-white/60 text-base font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          {currentTrack.genre}
        </p>
      </div>

      {/* Progress */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm text-white/40" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalTime)}</span>
        </div>
        <ProgressBar current={currentTime} total={totalTime} />
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-8">
        <IconButton icon={SkipBackIcon} />
        <IconButton 
          icon={isPlaying ? PauseIcon : PlayIcon} 
          active={true}
          onClick={() => setIsPlaying(!isPlaying)}
          size="w-8 h-8"
          className="p-4"
        />
        <IconButton icon={SkipForwardIcon} />
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Volume2Icon className="w-5 h-5 text-white/60" />
          <div className="w-16 h-1 bg-white/20 rounded-full">
            <div 
              className="h-full bg-white rounded-full"
              style={{ width: `${volume}%` }}
            />
          </div>
        </div>
        
        <button
          onClick={() => setSpatialEnabled(!spatialEnabled)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            spatialEnabled 
              ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' 
              : 'text-white/40 border border-white/20'
          }`}
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
        >
          <HeadphonesIcon className="w-4 h-4" />
          Spatial Audio
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-3 rounded-full transition-all duration-300 ${
              isFavorited 
                ? 'bg-red-500/20 text-red-400 scale-110 shadow-lg' 
                : 'text-white/60 hover:text-white hover:bg-white/10 hover:scale-105'
            }`}
          >
            <HeartIcon className="w-5 h-5" filled={isFavorited} />
          </button>
        </div>
      </div>

      {/* Session Progress */}
      <SessionProgress isPlaying={isPlaying} />
    </div>
  );

  const renderAIDJ = () => (
    <div className="space-y-8 w-full max-w-sm mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-medium text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
          AI DJ
        </h2>
        <p className="text-white/60 text-base font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          Use favorites & our AI technology to create your own playlists
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
            How do you feel?
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {['Low', 'Neutral', 'High'].map((mood) => (
              <button
                key={mood}
                className={`py-3 px-3 rounded-2xl border-2 font-medium text-sm transition-all duration-300 ${
                  mood === 'Neutral'
                    ? 'border-white bg-white text-black'
                    : 'border-gray-600/50 text-white/70 hover:border-gray-500/50 bg-gray-800/30'
                }`}
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-normal text-white mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
            Pick a Favorite
          </h3>
          {favorites.length > 0 ? (
            <CustomSelect
              value=""
              onChange={() => {}}
              options={favorites.map(f => ({ value: f.id, label: f.name }))}
              placeholder="Select a favorite track..."
            />
          ) : (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 text-center">
              <p className="text-white/60 font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                No favorites found. Add some tracks to favorites first!
              </p>
            </div>
          )}
        </div>

        <button 
          className="w-full bg-white text-black py-3 rounded-2xl font-medium text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
        >
          Generate Therapeutic Session
        </button>
      </div>
    </div>
  );

  const renderJourney = () => (
    <div className="space-y-8 w-full max-w-sm mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-medium text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
          Your Journey
        </h2>
        <p className="text-white/60 text-base font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          Track your therapeutic progress
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Weekly Progress Chart */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-medium text-white mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
          Weekly Progress
        </h3>
        <div className="flex items-end justify-between gap-3 h-32">
          {journeyData.map((day, index) => (
            <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t-lg transition-all duration-500"
                style={{ 
                  height: `${(day.duration / 100) * 100}%`,
                  minHeight: '8px'
                }}
              />
              <span className="text-xs text-white/60 font-medium" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Analysis */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
          Goal Analysis
        </h3>
        <p className="text-white/60 text-center py-8 font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          Start listening to see your goal analysis
        </p>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
          AI Recommendations
        </h3>
        
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h4 className="text-blue-400 font-medium mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
              Optimal Listening Time
            </h4>
            <p className="text-white/70 text-sm font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
              You're most active during Afternoon. Consider scheduling your sessions then for better results.
            </p>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h4 className="text-blue-400 font-medium mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
              Favorite Genre
            </h4>
            <p className="text-white/70 text-sm font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
              Focus music seems to resonate with you. We'll prioritize similar tracks.
            </p>
          </div>
        </div>
      </div>

      {/* Listening Patterns */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-medium text-white mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
          Listening Patterns
        </h3>
        <p className="text-white/60 text-center py-4 font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          More insights coming soon...
        </p>
      </div>
    </div>
  );

  const renderManual = () => (
    <div className="space-y-8 w-full max-w-sm mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-medium text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
          User Manual
        </h2>
        <p className="text-white/60 text-base font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          Learn how to use NeuroTunes AI+ effectively
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            title: "Getting Started",
            icon: HomeIcon,
            content: "Set your mood and therapeutic goals. Our AI customizes your experience based on these inputs."
          },
          {
            title: "Mood Tracking",
            icon: HeartIcon,
            content: "Regular mood tracking helps our AI understand your patterns for more effective sessions."
          },
          {
            title: "Therapeutic Goals",
            icon: BrainIcon,
            content: "Each goal uses specific frequencies and musical elements proven through neuroscience research."
          },
          {
            title: "AI DJ Features",
            icon: BotIcon,
            content: "The AI learns from your preferences to create increasingly personalized therapeutic sessions."
          },
          {
            title: "Progress Analytics",
            icon: TrendingUpIcon,
            content: "Monitor your journey through detailed analytics showing trends and effectiveness patterns."
          },
          {
            title: "Spatial Audio",
            icon: HeadphonesIcon,
            content: "Enable spatial audio for immersive 3D soundscapes that enhance therapeutic effects."
          }
        ].map((section, index) => (
          <div key={index} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <section.icon className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-white mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                  {section.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm text-center">
        <h3 className="font-medium text-white mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
          Need More Help?
        </h3>
        <div className="space-y-3">
          <button className="w-full py-3 px-4 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-xl text-sm hover:bg-blue-500/30 transition-colors font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
            Contact Support
          </button>
          <button className="w-full py-3 px-4 bg-gray-700/50 border border-gray-600/30 text-white/70 rounded-xl text-sm hover:bg-gray-700/70 transition-colors font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
            Video Tutorials
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Mood': return renderMoodTab();
      case 'AI DJ': return renderAIDJ();
      case 'Now Playing': return renderNowPlaying();
      case 'Journey': return renderJourney();
      case 'User Manual': return renderManual();
      default: return renderNowPlaying();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      {/* Header - Only show on Mood page */}
      {activeTab === 'Mood' ? (
        <header className="p-8 text-center border-b border-white/10">
          <h1 className="text-6xl font-medium text-white mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
            NeuroTunes AI+
          </h1>
        </header>
      ) : null}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto px-4 pb-24 ${activeTab === 'Mood' ? 'py-8' : 'pt-8 pb-8'}`}>
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-black/90 backdrop-blur-md border-t border-white/10 z-50">
        <div className="flex justify-around items-center py-2">
          {TABS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setActiveTab(name)}
              className={`flex flex-col items-center text-xs py-3 px-3 rounded-xl transition-all duration-300 ${
                activeTab === name 
                  ? 'text-white bg-white/10 transform scale-105' 
                  : 'text-white/40 hover:text-white/70'
              }`}
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="font-normal">{name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default NeuroTunesAppV2;