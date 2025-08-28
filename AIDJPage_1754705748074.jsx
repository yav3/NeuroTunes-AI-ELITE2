import React, { useState, useEffect } from 'react';
import { Radio, Zap, Moon, Brain, Heart as HeartIcon, Play, Heart, ChevronLeft, SkipBack, SkipForward, Pause } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { aiDJAPI, trackAPI } from '../lib/api';
import { TrackCard } from '../components/TrackCard';
import { usePlayerStore } from '../stores/playerStore';

export function AIDJPage() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const { 
    addToQueue, 
    playPlaylist, 
    favorites, 
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    toggleFavorite,
    isFavorite,
    currentTime,
    duration
  } = usePlayerStore();

  const moods = [
    { id: 'focus', label: 'Focus', icon: Brain, gradient: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800' },
    { id: 'chill', label: 'Chill', icon: HeartIcon, gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-teal-700' },
    { id: 'sleep', label: 'Sleep', icon: Moon, gradient: 'bg-gradient-to-br from-blue-800 via-indigo-700 to-purple-800' },
    { id: 'energy', label: 'Energy', icon: Zap, gradient: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600' }
  ];

  // Format time helper
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate playlist mutation
  const generateMutation = useMutation({
    mutationFn: async (mood) => {
      try {
        const response = await aiDJAPI.generatePlaylist({ 
          mood,
          duration: 60,
          intensity: 'medium' 
        });
        console.log('AI DJ Response:', response);
        // The API client already returns response.data, so we just need to return the response
        return response;
      } catch (error) {
        console.error('AI DJ Generation Error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('AI DJ Success:', data);
      // The API returns { tracks: [...], totalDuration: ..., mood: ..., intensity: ... }
      if (data && data.tracks && data.tracks.length > 0) {
        console.log('Setting playlist with', data.tracks.length, 'tracks');
        setPlaylist(data.tracks);
        // Add all tracks to queue
        data.tracks.forEach(track => addToQueue(track));
        console.log('Playlist set successfully, first track:', data.tracks[0]);
      } else {
        console.warn('AI DJ returned no tracks or invalid data:', data);
      }
    },
    onError: (error) => {
      console.error('AI DJ Mutation Error:', error);
    }
  });



  const handleGeneratePlaylist = () => {
    if (selectedMood) {
      generateMutation.mutate(selectedMood);
    }
  };

  const handlePlayAll = (tracks, title) => {
    if (tracks && tracks.length > 0) {
      playPlaylist(tracks, title);
      setIsFullscreenMode(true);
    }
  };

  // Monitor when track starts playing to enter fullscreen mode
  useEffect(() => {
    if (currentTrack && isPlaying && playlist.length > 0) {
      setIsFullscreenMode(true);
    }
  }, [currentTrack, isPlaying, playlist.length]);

  // Fullscreen player mode
  if (isFullscreenMode && currentTrack) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8">
        {/* Back button */}
        <button
          onClick={() => setIsFullscreenMode(false)}
          className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>

        {/* Album art bubble with gradient effect */}
        <div className="relative mb-8">
          <div 
            className="w-80 h-80 rounded-full overflow-hidden shadow-2xl animate-pulse-slow"
            style={{
              background: `linear-gradient(135deg, 
                rgba(56, 97, 251, 0.3) 0%, 
                rgba(139, 92, 246, 0.3) 50%, 
                rgba(236, 72, 153, 0.3) 100%)`,
              animation: 'float 6s ease-in-out infinite'
            }}
          >
            <div className="w-full h-full flex items-center justify-center backdrop-blur-xl">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-60 animate-spin-slow" />
                <div className="text-white/80 text-lg font-medium">
                  {currentTrack.genre || 'Music'} • {(() => {
                    // Check therapeutic applications
                    if (currentTrack.therapeutic_applications?.length > 0) {
                      const app = currentTrack.therapeutic_applications[0];
                      if (app === 'focus') return 'Focus';
                      if (app === 'sleep') return 'Sleep';
                      if (app === 'energy') return 'Energy';
                      if (app === 'relaxation') return 'Relaxation';
                      return app.charAt(0).toUpperCase() + app.slice(1);
                    }
                    // Use therapeutic_use or default
                    return currentTrack.therapeutic_use || 'Therapeutic';
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Track info */}
        <div className="text-center mb-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentTrack.title}
          </h2>
          <p className="text-white/60">
            {currentTrack.artist || 'Various Artists'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>{formatTime(currentTime || 0)}</span>
            <span>{formatTime(duration || currentTrack?.duration || 240)}</span>
          </div>
          <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-white rounded-full transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={playPrevious}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <SkipBack size={24} className="text-white" />
          </button>

          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-all"
          >
            {isPlaying ? (
              <Pause size={32} className="text-white" />
            ) : (
              <Play size={32} className="text-white" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <SkipForward size={24} className="text-white" />
          </button>
        </div>

        {/* Favorite button */}
        <button
          onClick={() => toggleFavorite(currentTrack)}
          className="mt-8 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
        >
          <Heart 
            size={24} 
            className={isFavorite(currentTrack.id) ? 'text-red-500 fill-red-500' : 'text-white'}
          />
        </button>

        {/* Add CSS animation */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-40">
      <div className="mb-6 text-center">
        <Radio size={48} className="mx-auto text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">AI DJ</h1>
        <p className="text-white/60">Let AI create your perfect playlist</p>
      </div>

      {/* Toggle between AI DJ and Favorites */}
      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={() => setShowFavorites(false)}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            !showFavorites 
              ? 'bg-blue-600 text-white' 
              : 'bg-white/10 text-white/70 hover:text-white'
          }`}
        >
          <Radio size={20} className="inline mr-2" />
          AI Playlist
        </button>
        <button
          onClick={() => setShowFavorites(true)}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            showFavorites 
              ? 'bg-pink-600 text-white' 
              : 'bg-white/10 text-white/70 hover:text-white'
          }`}
        >
          <Heart size={20} className="inline mr-2" />
          My Favorites ({favorites.length})
        </button>
      </div>

      {/* Genre Filters - Only show when not viewing favorites */}
      {!showFavorites && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setSelectedGenre('all')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
            selectedGenre === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'text-white/70 hover:text-white'
          }`}
          style={{
            background: selectedGenre === 'all' 
              ? '' 
              : 'rgba(28, 56, 92, 0.12)',
            border: '1px solid rgba(56, 97, 251, 0.12)'
          }}
        >
          All Music
        </button>
        <button
          onClick={() => setSelectedGenre('focus')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
            selectedGenre === 'focus' 
              ? 'bg-blue-600 text-white' 
              : 'text-white/70 hover:text-white'
          }`}
          style={{
            background: selectedGenre === 'focus' 
              ? '' 
              : 'rgba(28, 56, 92, 0.12)',
            border: '1px solid rgba(56, 97, 251, 0.12)'
          }}
        >
          Focus
        </button>
        <button
          onClick={() => setSelectedGenre('electronic')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
            selectedGenre === 'electronic' 
              ? 'bg-blue-600 text-white' 
              : 'text-white/70 hover:text-white'
          }`}
          style={{
            background: selectedGenre === 'electronic' 
              ? '' 
              : 'rgba(28, 56, 92, 0.12)',
            border: '1px solid rgba(56, 97, 251, 0.12)'
          }}
        >
          Electronic & EDM
        </button>
        <button
          onClick={() => setSelectedGenre('classical')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
            selectedGenre === 'classical' 
              ? 'bg-blue-600 text-white' 
              : 'text-white/70 hover:text-white'
          }`}
          style={{
            background: selectedGenre === 'classical' 
              ? '' 
              : 'rgba(28, 56, 92, 0.12)',
            border: '1px solid rgba(56, 97, 251, 0.12)'
          }}
        >
          Classical, New Age, & Acoustic
        </button>
      </div>
      )}

      {/* Mood Selection - Only show when not viewing favorites */}
      {!showFavorites && (
        <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Select Your Mood</h2>
        <div className="grid grid-cols-2 gap-3">
          {moods.map(({ id, label, icon: Icon, gradient }) => (
            <button
              key={id}
              onClick={() => setSelectedMood(id)}
              className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${gradient} ${
                selectedMood === id ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              <Icon size={32} className="text-blue-400/60" />
              <span className="text-white font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Generate Button - Only show when not viewing favorites */}
      {!showFavorites && (
        <button
          onClick={handleGeneratePlaylist}
          disabled={!selectedMood || generateMutation.isPending}
          className="btn-primary w-full mb-8 disabled:opacity-50"
        >
          {generateMutation.isPending ? 'Generating...' : 'Generate Playlist'}
        </button>
      )}

      {/* Show Favorites or Generated Playlist */}
      {showFavorites ? (
        <div>
          {favorites.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  My Favorites
                </h2>
                <button
                  onClick={() => {
                    handlePlayAll(favorites, 'My Favorites');
                  }}
                  className="btn-primary flex items-center gap-2 px-4 py-2"
                >
                  <Play size={16} />
                  Play All
                </button>
              </div>
              <div className="space-y-2">
                {favorites.map((track) => (
                  <TrackCard key={track.id} track={track} allTracks={favorites} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart size={48} className="mx-auto text-white/30 mb-4" />
              <p className="text-white/60 mb-2">No favorites yet</p>
              <p className="text-white/40 text-sm">Tap the heart icon on any track to add it to favorites</p>
            </div>
          )}
        </div>
      ) : playlist.length > 0 && (
        <div className="text-center py-8">
          <button
            onClick={() => {
              handlePlayAll(playlist, 'AI DJ Session');
            }}
            className="btn-primary flex items-center gap-2 px-8 py-4 mx-auto text-lg"
          >
            <Play size={20} />
            Play AI Playlist
          </button>
          <p className="text-white/60 mt-4">
            Generated {playlist.length} tracks based on your mood
          </p>
        </div>
      )}

      {/* Error State */}
      {generateMutation.isError && (
        <div className="p-4 rounded-2xl mb-4" style={{
          background: 'rgba(220, 38, 38, 0.08)',
          border: '1px solid rgba(220, 38, 38, 0.15)'
        }}>
          <p className="text-red-400 text-sm">
            Unable to generate playlist. Showing suggested tracks instead.
          </p>
        </div>
      )}
    </div>
  );
}