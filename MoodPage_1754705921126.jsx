import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, Heart, Moon, Zap, Smile, Music, ChevronLeft } from 'lucide-react';
import { usePlayerStore } from '../stores/playerStore';
import { useState, useEffect } from 'react';

export function MoodPage() {
  const navigate = useNavigate();
  const { playPlaylist, stopPlayback } = usePlayerStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [step, setStep] = useState(1);
  
  // Stop playback when entering mood selection
  useEffect(() => {
    stopPlayback();
  }, []);
  
  // Fetch tracks for mood-based recommendations
  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['tracks', 'mood'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/tracks');
        const data = await response.json();
        const allTracks = data.tracks || data || [];
        return allTracks;
      } catch (err) {
        console.error('Error fetching tracks:', err);
        return [];
      }
    },
  });
  
  // Generate playlist based on mood and genre selection
  const generatePlaylist = async () => {
    if (!tracks || tracks.length === 0) {
      console.warn('No tracks available');
      return;
    }

    setIsGenerating(true);
    try {
      // Map mood to appropriate parameters
      const moodMap = {
        'Focus': { mood: 'focused', goal: 'Focus Enhancement', energy: 'medium' },
        'Chill': { mood: 'calm', goal: 'Chill', energy: 'low' },
        'Sleep': { mood: 'calm', goal: 'Sleep Support', energy: 'low' },
        'Energy': { mood: 'energized', goal: 'Energy Boost', energy: 'high' },
        'Happy': { mood: 'happy', goal: 'Chill', energy: 'medium' },
        'Discover': { mood: 'neutral', goal: 'Focus Enhancement', energy: 'medium' }
      };
      
      const moodConfig = moodMap[selectedMood] || { mood: 'neutral', goal: 'Focus Enhancement', energy: 'medium' };
      
      // Stop any current playback first (but we'll auto-play the new one)
      stopPlayback();
      
      // Call the mood playlist endpoint with selections
      const response = await fetch('/api/playlist/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: moodConfig.mood,
          energy: moodConfig.energy,
          goal: moodConfig.goal,
          genre: selectedGenre || 'All'
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.playlist && data.playlist.length > 0) {
        const sessionName = `${selectedMood} - ${selectedGenre || 'All Genres'}`;
        
        // Small delay to ensure stop completes before starting new playlist
        setTimeout(() => {
          playPlaylist(data.playlist, sessionName);
          navigate('/player'); // Navigate to bigger music player
        }, 100);
      } else {
        // Fallback: use random tracks
        const randomStart = Math.floor(Math.random() * Math.max(0, tracks.length - 20));
        const fallbackPlaylist = tracks.slice(randomStart, randomStart + 20);
        
        setTimeout(() => {
          playPlaylist(fallbackPlaylist, `${selectedMood} Session`);
          navigate('/player'); // Navigate to bigger music player
        }, 100);
      }
    } catch (error) {
      console.error('Error starting mood playlist:', error);
      // Fallback: use random tracks
      const randomStart = Math.floor(Math.random() * Math.max(0, tracks.length - 20));
      const fallbackPlaylist = tracks.slice(randomStart, randomStart + 20);
      
      setTimeout(() => {
        playPlaylist(fallbackPlaylist, 'Music Session');
        navigate('/player'); // Navigate to bigger music player
      }, 100);
    } finally {
      setIsGenerating(false);
    }
  };

  // Mood cards configuration - matching the screenshot exactly
  const moodCards = [
    { 
      icon: Brain, 
      label: 'Focus',
      subtitle: 'Deep concentration',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      icon: Heart, 
      label: 'Chill',
      subtitle: 'Relaxed vibes',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      icon: Moon, 
      label: 'Sleep',
      subtitle: 'Peaceful rest',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    { 
      icon: Zap, 
      label: 'Energy',
      subtitle: 'Power up',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    { 
      icon: Smile, 
      label: 'Happy',
      subtitle: 'Feel good music',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    { 
      icon: Music, 
      label: 'Discover',
      subtitle: 'Something new',
      gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)'
    }
  ];
  
  // Genre options
  const genres = [
    'All',
    'Electronic, EDM, Rock, & Pop',
    'Classical',
    'Ambient',
    'Jazz',
    'Nature Sounds',
    'Instrumental',
    'World Music',
    'Acoustic'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading music library...</div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Generating your perfect playlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 pb-40">
      {/* Step 1: Select Mood */}
      {step === 1 && (
        <>
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Mood Music</h1>
            <p className="text-sm md:text-base text-gray-400">Select your vibe and start listening instantly</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {moodCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.label}
                    onClick={() => {
                      setSelectedMood(card.label);
                      setStep(2);
                    }}
                    className="relative p-8 rounded-2xl text-white overflow-hidden transition-all hover:scale-105 active:scale-95 group"
                    style={{
                      background: card.gradient,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <Icon size={40} className="mb-4 text-white" strokeWidth={1.5} />
                      <h3 className="font-bold text-xl mb-1">{card.label}</h3>
                      <p className="text-sm opacity-90">{card.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Step 2: Select Genre */}
      {step === 2 && (
        <>
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => setStep(1)}
              className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft size={20} className="mr-1" />
              Back
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Choose Genre</h1>
            <p className="text-sm md:text-base text-gray-400">
              {selectedMood} mood selected • Pick your preferred genre
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 gap-3">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenre(genre);
                    generatePlaylist();
                  }}
                  className="p-4 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 text-white text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{genre}</span>
                    <ChevronLeft size={20} className="rotate-180 text-gray-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}