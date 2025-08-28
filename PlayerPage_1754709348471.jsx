import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, SkipBack, Play, Pause, SkipForward, Shuffle, Repeat, Heart, List, Volume2, Headphones, ThumbsDown, Zap } from 'lucide-react';
import { usePlayerStore } from '../stores/playerStore';

export function PlayerPage() {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    queue,
    playlistMode,
    playlistName,
    spatialAudio,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    toggleFavorite,
    isFavorited,
    clearPlaylistMode,
    toggleSpatialAudio,
    blockTrack,
    isBlocked
  } = usePlayerStore();

  const [showQueue, setShowQueue] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  // Redirect if no track is playing
  useEffect(() => {
    if (!currentTrack && !playlistMode) {
      navigate('/');
    }
  }, [currentTrack, playlistMode, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    clearPlaylistMode();
    navigate(-1);
  };

  // Get therapeutic label
  const getTherapeuticLabel = () => {
    if (!currentTrack?.therapeutic?.goals || currentTrack.therapeutic.goals.length === 0) {
      return currentTrack?.genre || 'Therapeutic Music';
    }
    const goal = currentTrack.therapeutic.goals[0];
    if (goal.includes('Focus')) return 'Focus Enhancement';
    if (goal.includes('Sleep')) return 'Sleep Support';
    if (goal.includes('Energy')) return 'Energy Boost';
    if (goal.includes('Relax')) return 'Relaxation';
    if (goal.includes('Chill')) return 'Chill';
    if (goal.includes('Pain')) return 'Pain Relief';
    return goal;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed inset-0 bg-navy-900/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <button 
          onClick={handleClose}
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          <ChevronDown size={24} />
        </button>
        <div className="text-center">
          <p className="text-xs text-white/60 uppercase tracking-wider">Playing from</p>
          <p className="text-sm text-white font-medium">{playlistName || 'Your Library'}</p>
        </div>
        <button 
          onClick={() => setShowQueue(!showQueue)}
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          <List size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8 overflow-y-auto">
        {/* Album Art */}
        <div className="w-80 h-80 mb-6 rounded-2xl overflow-hidden shadow-2xl relative flex-shrink-0">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <linearGradient id={`player-grad-${currentTrack.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id={`player-radial-${currentTrack.id}`}>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
              </radialGradient>
            </defs>
            
            {/* Background */}
            <rect width="400" height="400" fill="#0F172A"/>
            
            {/* Animated circles */}
            <g opacity="0.6">
              <circle cx="200" cy="200" r="50" fill="none" stroke="url(#player-grad-${currentTrack.id})" strokeWidth="2">
                <animate attributeName="r" values="50;150;50" dur="8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="200" cy="200" r="80" fill="none" stroke="url(#player-grad-${currentTrack.id})" strokeWidth="2">
                <animate attributeName="r" values="80;180;80" dur="10s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="10s" repeatCount="indefinite"/>
              </circle>
              <circle cx="200" cy="200" r="110" fill="none" stroke="url(#player-grad-${currentTrack.id})" strokeWidth="2">
                <animate attributeName="r" values="110;210;110" dur="12s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="12s" repeatCount="indefinite"/>
              </circle>
            </g>
            
            {/* Center gradient overlay */}
            <rect width="400" height="400" fill="url(#player-radial-${currentTrack.id})" opacity="0.5"/>
          </svg>
        </div>

        {/* Track Info */}
        <div className="text-center mb-6 max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">
            {currentTrack.title || currentTrack.filename || 'Unknown Track'}
          </h1>
          <p className="text-white/60 mb-1">
            {currentTrack.genre || 'Ambient'} • {getTherapeuticLabel()}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-6">
          <div className="relative h-1 bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || 0)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-6 mb-6">
          <button 
            onClick={() => setShuffle(!shuffle)}
            className={`text-white/60 hover:text-white transition-colors ${shuffle ? 'text-blue-400' : ''}`}
          >
            <Shuffle size={20} />
          </button>
          
          <button 
            onClick={playPrevious}
            className="text-white hover:scale-110 transition-transform"
          >
            <SkipBack size={28} />
          </button>
          
          <button 
            onClick={togglePlay}
            className={`w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform ${
              isLoading ? 'animate-pulse' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={28} />
            ) : (
              <Play size={28} className="ml-1" />
            )}
          </button>
          
          <button 
            onClick={playNext}
            className="text-white hover:scale-110 transition-transform"
            disabled={queue.length === 0}
          >
            <SkipForward size={28} />
          </button>
          
          <button 
            onClick={() => setRepeat(!repeat)}
            className={`text-white/60 hover:text-white transition-colors ${repeat ? 'text-blue-400' : ''}`}
          >
            <Repeat size={20} />
          </button>
        </div>

        {/* Secondary Controls - All Action Buttons */}
        <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
          {/* Favorite Button */}
          <button 
            onClick={() => toggleFavorite(currentTrack)}
            className={`p-3 rounded-full transition-all transform hover:scale-110 ${
              isFavorited(currentTrack.id) 
                ? 'text-red-400 bg-red-400/10' 
                : 'text-white/60 hover:text-red-400 hover:bg-red-400/10'
            }`}
            title="Add to Favorites"
          >
            <Heart size={24} fill={isFavorited(currentTrack.id) ? 'currentColor' : 'none'} />
          </button>
          
          {/* Lightning Button - Genre Mismatch Feedback */}
          <button 
            onClick={async () => {
              if (currentTrack) {
                console.log('Genre mismatch reported for:', currentTrack.title);
                try {
                  const response = await fetch(`/api/track/${currentTrack.id}/feedback`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      type: 'genre_mismatch',
                      genre: currentTrack.genre,
                      timestamp: new Date().toISOString()
                    })
                  });
                  if (response.ok) {
                    console.log('✅ Genre mismatch reported');
                  }
                } catch (err) {
                  console.error('Failed to report genre mismatch:', err);
                }
              }
            }}
            className="p-3 rounded-full text-white/60 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all transform hover:scale-110"
            title="Report Genre Mismatch"
          >
            <Zap size={24} />
          </button>
          
          {/* Thumbs Down Button - Block Track */}
          <button 
            onClick={() => {
              if (currentTrack) {
                blockTrack(currentTrack);
                console.log('Track blocked:', currentTrack.title);
                // Skip to next track when blocking
                playNext(true);
              }
            }}
            className={`p-3 rounded-full transition-all transform hover:scale-110 ${
              currentTrack && isBlocked(currentTrack.id) 
                ? 'text-red-600 bg-red-600/10' 
                : 'text-white/60 hover:text-red-600 hover:bg-red-600/10'
            }`}
            title="Block this track"
          >
            <ThumbsDown size={24} fill={currentTrack && isBlocked(currentTrack.id) ? 'currentColor' : 'none'} />
          </button>
          
          {/* Spatial Audio Button */}
          <button 
            onClick={toggleSpatialAudio}
            className={`relative p-3 rounded-full transition-all transform hover:scale-110 ${
              spatialAudio 
                ? 'text-blue-400 bg-blue-400/10' 
                : 'text-white/60 hover:text-blue-400 hover:bg-blue-400/10'
            }`}
            title="Spatial Audio - Enhanced 3D Sound"
          >
            <Headphones size={24} />
            {spatialAudio && (
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>
        
        {/* Volume Control - Separate Row */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Volume2 size={20} className="text-white/60" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 accent-white"
          />
          <span className="text-white/60 text-sm w-10 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-navy-900/95 backdrop-blur-lg rounded-t-3xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Up Next</h2>
            <button 
              onClick={() => setShowQueue(false)}
              className="text-white/60 hover:text-white"
            >
              <ChevronDown size={24} />
            </button>
          </div>
          
          {queue.length === 0 ? (
            <p className="text-white/60 text-center py-8">No tracks in queue</p>
          ) : (
            <div className="space-y-2">
              {queue.map((track, index) => (
                <div 
                  key={`${track.id}-${index}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-white/40 text-sm w-6">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">
                      {track.title || track.filename}
                    </p>
                    <p className="text-white/40 text-xs truncate">
                      {track.artist || 'Neural Positive Music'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}