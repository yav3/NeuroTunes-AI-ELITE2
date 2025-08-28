import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Smile, Zap, Brain, Heart, CloudRain, Music, Activity, Dumbbell, Coffee, Moon, Sun, Target, Headphones, Star, Cloud, Circle } from 'lucide-react';
import { TrackCard } from '../components/TrackCard';
import { trackAPI } from '../lib/api';
import { usePlayerStore } from '../stores/playerStore';

export function HomePage() {
  const navigate = useNavigate();
  const { playPlaylist, stopPlayback } = usePlayerStore();
  const [greeting, setGreeting] = useState('');
  const [filters, setFilters] = useState({ goal: null, genre: null });
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Get current greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Fetch tracks based on filters
  const { data: tracks, isLoading, error } = useQuery({
    queryKey: ['tracks', filters.goal, filters.genre],
    queryFn: async () => {
      try {
        const response = await trackAPI.getAll();
        console.log('API Response:', response);
        
        // Handle different response structures
        const allTracks = Array.isArray(response) ? response : response?.tracks || [];
        console.log('Extracted tracks:', allTracks.length);
        
        if (!allTracks || allTracks.length === 0) return [];
        
        let filteredTracks = allTracks;
      
      // Filter by therapeutic goal
      if (filters.goal) {
        const goalMap = {
          'focus': ['Focus Enhancement', 'focus', 'concentration'],
          'sleep': ['Sleep Support', 'sleep', 'relaxation'],
          'energy': ['Energy Boost', 'energy', 'motivation'],
          'chill': ['Chill', 'relaxation', 'calm'],
          'pain': ['Pain Relief', 'pain management', 'therapeutic'],
          'nsdr': ['NSDR', 'meditation', 'mindfulness']
        };
        
        const goalKeywords = goalMap[filters.goal] || [];
        filteredTracks = filteredTracks.filter(t => 
          goalKeywords.some(keyword => 
            t.therapeutic?.goals?.some(g => g.toLowerCase().includes(keyword.toLowerCase())) ||
            t.tags?.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())) ||
            t.genre?.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }
      
      // Filter by genre - more precise filtering
      if (filters.genre) {
        if (filters.genre === 'classical') {
          filteredTracks = filteredTracks.filter(t => 
            t.genre?.toLowerCase().includes('classical') ||
            t.genre?.toLowerCase().includes('acoustic') ||
            t.genre?.toLowerCase().includes('orchestral')
          );
        } else if (filters.genre === 'electronic') {
          filteredTracks = filteredTracks.filter(t => 
            t.genre?.toLowerCase().includes('electronic') ||
            t.genre?.toLowerCase().includes('edm') ||
            t.genre?.toLowerCase().includes('techno') ||
            t.genre?.toLowerCase().includes('house')
          );
        } else if (filters.genre === 'rock-pop') {
          filteredTracks = filteredTracks.filter(t => 
            t.genre?.toLowerCase().includes('rock') ||
            t.genre?.toLowerCase().includes('pop') ||
            t.genre?.toLowerCase().includes('indie')
          );
        } else if (filters.genre === 'ambient') {
          filteredTracks = filteredTracks.filter(t => 
            t.genre?.toLowerCase().includes('ambient') ||
            t.genre?.toLowerCase().includes('new age') ||
            t.genre?.toLowerCase().includes('nature')
          );
        } else if (filters.genre === 'jazz') {
          filteredTracks = filteredTracks.filter(t => 
            t.genre?.toLowerCase().includes('jazz') ||
            t.genre?.toLowerCase().includes('blues') ||
            t.genre?.toLowerCase().includes('soul')
          );
        }
      }
      
      console.log('Returning tracks:', filteredTracks.length);
      return filteredTracks.slice(0, 50);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      return [];
    }
  },
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000,
  retry: 2,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  onError: (error) => {
    console.error('Query error:', error);
  },
  enabled: true,
  refetchOnWindowFocus: false,
  keepPreviousData: true,
  placeholderData: (previousData) => {
    if (previousData) {
      return previousData;
    }
  },
});

  // Mood cards configuration - Step 1 (matching user's reference)
  const moodCards = [
    { icon: Sun, label: 'Happy', emoji: '😊', goal: 'mood_boost' },
    { icon: Zap, label: 'Stressed', emoji: '😣', goal: 'calm' },
    { icon: CloudRain, label: 'Sad', emoji: '😢', goal: 'emotional_reset' },
    { icon: Heart, label: 'Anxious', emoji: '😬', goal: 'calm' },
    { icon: Zap, label: 'Angry', emoji: '😡', goal: 'emotional_reset' }
  ];

  // Therapeutic goal cards - Step 2 (matching user's reference)
  const goalCards = [
    { icon: Target, label: 'Pain Management', goal: 'pain' },
    { icon: Brain, label: 'Focus', goal: 'focus' },
    { icon: Zap, label: 'Energy Boost', goal: 'energy' },
    { icon: Heart, label: 'Emotional Reset', goal: 'emotional_reset' },
    { icon: CloudRain, label: 'Calm Down', goal: 'calm' },
    { icon: Star, label: 'Mood Boost', goal: 'mood_boost' }
  ];

  // Genre cards - Step 3 (only genres that exist in catalog)
  const genreCards = [
    { icon: Headphones, label: 'Electronic, EDM, Rock, & Pop', genre: 'electronic' },
    { icon: Music, label: 'Classical', genre: 'classical' },
    { icon: CloudRain, label: 'Ambient', genre: 'ambient' },
    { icon: Music, label: 'Jazz', genre: 'jazz' }
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.label);
    setCurrentStep(2);
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    setCurrentStep(3);
  };

  const handleGenreSelect = async (genre) => {
    setSelectedGenre(genre);
    
    // Stop current playback
    stopPlayback();
    
    try {
      // Call the session mood endpoint with VAD scoring
      const response = await fetch('/api/session/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          goal: selectedGoal.goal,
          genre: genre.genre
        })
      });
      
      const data = await response.json();
      
      if (data.tracks && data.tracks.length > 0) {
        // Store in localStorage for persistence
        localStorage.setItem('moodPlaylist', JSON.stringify(data.tracks));
        localStorage.setItem('currentMood', selectedMood);
        localStorage.setItem('currentGoal', selectedGoal.goal);
        localStorage.setItem('currentGenre', genre.genre);
        
        // Play the playlist and navigate to Now Playing
        playPlaylist(data.tracks, `${selectedMood} - ${selectedGoal.label} - ${genre.label}`);
        navigate('/now-playing');
      } else {
        // Fallback to basic filtering
        const fallbackTracks = tracks || [];
        const shuffled = [...fallbackTracks].sort(() => Math.random() - 0.5).slice(0, 30);
        
        localStorage.setItem('moodPlaylist', JSON.stringify(shuffled));
        localStorage.setItem('currentMood', selectedMood);
        localStorage.setItem('currentGoal', selectedGoal.goal);
        localStorage.setItem('currentGenre', genre.genre);
        
        playPlaylist(shuffled, `${selectedMood} - ${selectedGoal.label} - ${genre.label}`);
        navigate('/now-playing');
      }
    } catch (error) {
      console.error('Error creating mood playlist:', error);
      // Use fallback tracks
      const fallbackTracks = tracks || [];
      const shuffled = [...fallbackTracks].sort(() => Math.random() - 0.5).slice(0, 30);
      playPlaylist(shuffled, `${selectedMood} - ${selectedGoal.label} - ${genre.label}`);
      navigate('/now-playing');
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedMood(null);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedGoal(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{greeting}</h1>
          <p className="text-gray-400">
            {currentStep === 1 && "How are you feeling?"}
            {currentStep === 2 && "What's your goal?"}
            {currentStep === 3 && "Choose your music style"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-white' : 'bg-gray-600'}`} />
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-white' : 'bg-gray-600'}`} />
            <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-white' : 'bg-gray-600'}`} />
            <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-white' : 'bg-gray-600'}`} />
            <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-white' : 'bg-gray-600'}`} />
          </div>
        </div>

        {/* Back Button */}
        {currentStep > 1 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 1: Mood Selection */}
        {currentStep === 1 && (
          <div className="flex space-x-3 overflow-x-auto p-2">
            {moodCards.map((mood) => {
              const isActive = selectedMood === mood.label;
              return (
                <button
                  key={mood.label}
                  onClick={() => handleMoodSelect(mood)}
                  className={`flex-shrink-0 min-w-[120px] h-28 p-3 rounded-xl border-2 ${
                    isActive 
                      ? 'bg-blue-600 border-white text-white' 
                      : 'bg-gray-900 border-gray-600 text-gray-200'
                  }`}
                >
                  <div className="text-2xl">{mood.emoji}</div>
                  <div className="text-sm font-semibold mt-2">{mood.label}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Goal Selection */}
        {currentStep === 2 && (
          <div className="flex space-x-3 overflow-x-auto p-2">
            {goalCards.map((goal) => {
              const isActive = selectedGoal?.label === goal.label;
              return (
                <button
                  key={goal.label}
                  onClick={() => handleGoalSelect(goal)}
                  className={`flex-shrink-0 min-w-[120px] h-28 p-3 rounded-xl border-2 ${
                    isActive 
                      ? 'bg-blue-600 border-white text-white' 
                      : 'bg-gray-900 border-gray-600 text-gray-200'
                  }`}
                >
                  <div className="text-sm font-semibold mt-2 text-center">{goal.label}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: Genre Selection */}
        {currentStep === 3 && (
          <div className="flex space-x-3 overflow-x-auto p-2">
            {genreCards.map((genre) => {
              const isActive = selectedGenre?.label === genre.label;
              return (
                <button
                  key={genre.label}
                  onClick={() => handleGenreSelect(genre)}
                  className={`flex-shrink-0 min-w-[120px] h-28 p-3 rounded-xl border-2 ${
                    isActive 
                      ? 'bg-blue-600 border-white text-white' 
                      : 'bg-gray-900 border-gray-600 text-gray-200'
                  }`}
                >
                  <div className="text-sm font-semibold mt-2 text-center">{genre.label}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}