import React, { useState, useEffect } from 'react';

// Main App Component that integrates both Mood Playlisting and AI DJ
const NeuralPositiveApp = () => {
  const [currentView, setCurrentView] = useState('mood');
  const [userProfile, setUserProfile] = useState({
    name: 'Guest User',
    email: 'neurotunes@therapeutic.ai',
    favorites: 0,
    played: 0,
    available: 4800,
    listeningStats: {
      dailyAverage: 45,
      weeklySessions: 12,
      preferredTime: 'Evening'
    },
    cognitivePatterns: {
      alphaWaves: 75,
      betaWaves: 90,
      thetaWaves: 60
    }
  });

  const [currentlyPlaying, setCurrentlyPlaying] = useState({
    title: "Calm Reflection",
    artist: "Neural Positive Music",
    genre: "Contemporary Classical",
    isPlaying: false,
    isAIGenerated: true
  });

  // API Integration Functions
  const fetchMoodRecommendations = async (goal, mood = 3) => {
    try {
      const response = await fetch('/api/session/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, mood, limit: 20 })
      });
      const data = await response.json();
      return data.tracks || [];
    } catch (error) {
      console.error('Error fetching mood recommendations:', error);
      return [];
    }
  };

  const generateAIPlaylist = async (personality, duration, goal) => {
    try {
      const response = await fetch('/api/ai-dj/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          personality, 
          duration, 
          goal,
          userId: 'user_123',
          cognitivePatterns: userProfile.cognitivePatterns
        })
      });
      const data = await response.json();
      return data.tracks || [];
    } catch (error) {
      console.error('Error generating AI playlist:', error);
      return [];
    }
  };

  // Navigation Component
  const BottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/30 z-50">
      <div className="flex justify-around py-3">
        {[
          { icon: '🔥', label: 'Trending', id: 'trending' },
          { icon: '😊', label: 'Mood', id: 'mood' },
          { icon: '🎧', label: 'AI DJ', id: 'ai-dj' },
          { icon: '📊', label: 'Emotions', id: 'emotions' },
          { icon: '👤', label: 'Profile', id: 'profile' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              currentView === item.id ? 'text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Now Playing Mini Player (Global)
  const NowPlayingMini = () => (
    <div className="fixed top-4 left-4 right-4 z-40">
      <div className="bg-gradient-to-r from-slate-700/90 to-slate-600/90 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs text-slate-300 mb-1 tracking-wider">NOW PLAYING</div>
            <h4 className="font-semibold text-sm">{currentlyPlaying.title}</h4>
            <p className="text-xs text-slate-400">{currentlyPlaying.genre}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentlyPlaying(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
              className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-slate-800"
            >
              {currentlyPlaying.isPlaying ? '⏸️' : '▶️'}
            </button>
            {currentlyPlaying.isAIGenerated && (
              <div className="w-8 h-8 bg-purple-600/80 rounded-full flex items-center justify-center text-xs">
                AI
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Mood Playlisting View
  const MoodView = () => {
    const [currentMood, setCurrentMood] = useState(3);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    const therapeuticGoals = [
      { 
        id: 'focus', 
        title: 'Focus', 
        subtitle: 'Enhance concentration', 
        icon: (
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-gradient-radial from-blue-400 via-blue-500 to-blue-600 rounded-full"></div>
            <div className="absolute inset-1 bg-gradient-radial from-transparent to-blue-800 rounded-full"></div>
          </div>
        ),
        gradient: 'from-blue-900/80 via-blue-800/60 to-blue-700/40'
      },
      { 
        id: 'chill', 
        title: 'Chill', 
        subtitle: 'Relax and unwind', 
        icon: (
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-500 rounded-lg opacity-80"></div>
            <div className="absolute inset-2 bg-blue-800/60 rounded"></div>
          </div>
        ),
        gradient: 'from-blue-800/70 via-blue-700/50 to-blue-600/30'
      },
      { 
        id: 'energy', 
        title: 'Energy', 
        subtitle: 'Power up', 
        icon: (
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-0.5 h-3 bg-gradient-to-t from-yellow-500 to-yellow-300"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: 'bottom center',
                    transform: `translate(-50%, -100%) rotate(${i * 45}deg)`
                  }}
                />
              ))}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        ),
        gradient: 'from-blue-900/80 via-yellow-900/20 to-blue-800/60'
      },
      { 
        id: 'sleep', 
        title: 'Sleep', 
        subtitle: 'Peaceful night', 
        icon: (
          <div className="w-8 h-8 relative">
            <div className="absolute top-1 left-1 w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full transform rotate-12"></div>
            <div className="absolute top-2 left-3 w-1 h-1 bg-blue-200 rounded-full"></div>
            <div className="absolute top-3 left-5 w-0.5 h-0.5 bg-blue-300 rounded-full"></div>
          </div>
        ),
        gradient: 'from-blue-950/90 via-blue-900/70 to-blue-800/50'
      }
    ];

    const handleGoalSelect = async (goal) => {
      setSelectedGoal(goal);
      setLoading(true);
      const tracks = await fetchMoodRecommendations(goal.id, currentMood);
      setRecommendations(tracks);
      setLoading(false);
      
      if (tracks.length > 0) {
        setCurrentlyPlaying({
          title: tracks[0].title,
          artist: tracks[0].artist,
          genre: tracks[0].displayGenre,
          isPlaying: true,
          isAIGenerated: false
        });
      }
    };

    return (
      <div className="pt-24 pb-24 px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-light mb-2">How are you feeling?</h1>
          <p className="text-slate-400 text-sm">Select your current mood and therapeutic goal</p>
        </div>

        {/* Mood Scale */}
        <div className="mb-8">
          <div className="bg-blue-950/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-800/20">
            <h3 className="text-lg font-medium mb-4 text-white">Mood Scale</h3>
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  onClick={() => setCurrentMood(mood)}
                  className={`w-12 h-12 rounded-full border transition-all ${
                    currentMood === mood
                      ? 'bg-blue-600/80 border-blue-400 scale-110 shadow-lg shadow-blue-500/20'
                      : 'bg-blue-900/60 border-blue-700/60 hover:border-blue-600/80 hover:bg-blue-800/60'
                  }`}
                >
                  <span className="text-sm font-medium text-white">{mood}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-blue-300">
              <span>Low</span>
              <span>Neutral</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Therapeutic Goals */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-white flex items-center">
            <div className="mr-2 w-5 h-5 relative">
              <div className="w-5 h-5 border-2 border-blue-400 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-300 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full"></div>
            </div>
            Your Therapeutic Goals
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {therapeuticGoals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleGoalSelect(goal)}
                disabled={loading}
                className={`relative overflow-hidden rounded-2xl p-6 transition-all transform hover:scale-[1.02] disabled:opacity-50 ${
                  selectedGoal?.id === goal.id ? 'ring-1 ring-blue-400/60 shadow-lg shadow-blue-500/20' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${goal.gradient} backdrop-blur-sm`}></div>
                <div className="relative">
                  <div className="mb-3 flex justify-center">{goal.icon}</div>
                  <h4 className="font-medium text-lg mb-1 text-white">{goal.title}</h4>
                  <p className="text-sm text-blue-100">{goal.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-300">Finding perfect tracks for you...</p>
          </div>
        )}

        {recommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-white">Recommended for You</h3>
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((track, index) => (
                <div key={index} className="bg-blue-950/60 backdrop-blur-xl rounded-xl p-4 border border-blue-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{track.title}</h4>
                      <p className="text-sm text-blue-200">{track.artist}</p>
                      <div className="flex gap-2 mt-2">
                        {track.genres?.map((genre, i) => (
                          <span key={i} className="text-xs bg-blue-600/40 text-blue-200 px-2 py-1 rounded-full border border-blue-500/30">
                            {genre}
                          </span>
                        ))}
                        {track.isFocus && (
                          <span className="text-xs bg-yellow-600/30 text-yellow-200 px-2 py-1 rounded-full border border-yellow-500/30">
                            Focus
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="w-10 h-10 bg-blue-700/60 rounded-full flex items-center justify-center hover:bg-blue-600/70 transition-colors border border-blue-600/40">
                      <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // AI DJ View
  const AIDJView = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPersonality, setAiPersonality] = useState('adaptive');
    const [generatedPlaylist, setGeneratedPlaylist] = useState([]);

    const aiPersonalities = [
      { 
        id: 'adaptive', 
        name: 'Adaptive', 
        description: 'Learns from patterns', 
        icon: (
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg opacity-80"></div>
            <div className="absolute inset-1 bg-blue-900/60 rounded-sm"></div>
            <div className="absolute top-2 left-2 w-3 h-0.5 bg-blue-200 rounded-full"></div>
            <div className="absolute top-3 left-2 w-2 h-0.5 bg-blue-300 rounded-full"></div>
            <div className="absolute top-4 left-2 w-1.5 h-0.5 bg-blue-400 rounded-full"></div>
            <div className="absolute top-2 right-2 w-1 h-1 bg-blue-200 rounded-full"></div>
          </div>
        )
      },
      { 
        id: 'therapeutic', 
        name: 'Therapeutic', 
        description: 'Clinical focus', 
        icon: (
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-500 rounded-lg opacity-80"></div>
            <div className="absolute inset-1 bg-blue-900/60 rounded-sm"></div>
            <div className="absolute top-2 left-2 w-3 h-0.5 bg-white/90 rounded-full"></div>
            <div className="absolute top-3.5 left-2.5 w-2 h-0.5 bg-white/90 rounded-full"></div>
            <div className="absolute top-2 right-2 w-1 h-2 bg-white/70 rounded-full"></div>
          </div>
        )
      },
      { 
        id: 'creative', 
        name: 'Creative', 
        description: 'Experimental', 
        icon: (
          <div className="w-8 h-8 relative">
            <div className="absolute top-1 left-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg transform rotate-12 opacity-80"></div>
            <div className="absolute top-2 left-2 w-3 h-3 bg-blue-900/80 rounded-sm transform -rotate-6"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-400 rounded-full"></div>
            <div className="absolute bottom-1 left-2 w-0.5 h-0.5 bg-blue-300 rounded-full"></div>
          </div>
        )
      },
      { 
        id: 'focused', 
        name: 'Focused', 
        description: 'Goal-oriented', 
        icon: (
          <div className="w-8 h-8 relative flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-400 rounded-full"></div>
            <div className="absolute w-3 h-3 border border-blue-300 rounded-full"></div>
            <div className="absolute w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
          </div>
        )
      }
    ];

    const handleGenerate = async (goal, duration) => {
      setIsGenerating(true);
      const playlist = await generateAIPlaylist(aiPersonality, duration, goal);
      setGeneratedPlaylist(playlist);
      setIsGenerating(false);
      
      if (playlist.length > 0) {
        setCurrentlyPlaying({
          title: playlist[0].title,
          artist: playlist[0].artist,
          genre: playlist[0].displayGenre,
          isPlaying: true,
          isAIGenerated: true
        });
      }
    };

    const CognitiveWaveBar = ({ label, percentage, color }) => (
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-blue-200">{label}</span>
          <span className="text-sm font-medium text-white">{percentage}%</span>
        </div>
        <div className="w-full bg-blue-900/60 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all duration-1000 ${color}`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );

    return (
      <div className="pt-24 pb-24 px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-light flex items-center mb-2">
            <div className="mr-3 w-8 h-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg opacity-90"></div>
              <div className="absolute inset-1 bg-blue-900/80 rounded-sm"></div>
              <div className="absolute top-2 left-2 w-3 h-0.5 bg-blue-200 rounded-full"></div>
              <div className="absolute top-3 left-2 w-2.5 h-0.5 bg-blue-300 rounded-full"></div>
              <div className="absolute top-4 left-2 w-2 h-0.5 bg-blue-400 rounded-full"></div>
              <div className="absolute top-2 right-2 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
            </div>
            AI DJ
          </h1>
          <p className="text-blue-300 text-sm">Neural network-powered music curation</p>
        </div>

        {/* AI Status */}
        <div className="mb-6">
          <div className="bg-blue-950/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-800/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-white">Neural Network Status</h3>
                <p className="text-sm text-blue-300">Learning • {userProfile.available} tracks analyzed</p>
              </div>
              <div className="w-12 h-12 bg-blue-700/60 rounded-full flex items-center justify-center border border-blue-600/40">
                <div className="w-6 h-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-500 rounded-lg opacity-90"></div>
                  <div className="absolute inset-1 bg-blue-900/60 rounded-sm"></div>
                  <div className="absolute top-1 left-1 w-3 h-0.5 bg-blue-200 rounded-full"></div>
                  <div className="absolute top-2 left-1 w-2.5 h-0.5 bg-blue-300 rounded-full"></div>
                  <div className="absolute top-3 left-1 w-2 h-0.5 bg-blue-400 rounded-full"></div>
                  <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1 right-1 w-1 h-1 bg-blue-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Personality */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-white">AI Personality</h3>
          <div className="grid grid-cols-2 gap-3">
            {aiPersonalities.map((personality) => (
              <button
                key={personality.id}
                onClick={() => setAiPersonality(personality.id)}
                className={`p-4 rounded-xl border transition-all ${
                  aiPersonality === personality.id
                    ? 'bg-blue-700/60 border-blue-500/80 shadow-lg shadow-blue-500/20'
                    : 'bg-blue-900/40 border-blue-700/40 hover:border-blue-600/60 hover:bg-blue-800/50'
                }`}
              >
                <div className="mb-3">{personality.icon}</div>
                <div className="text-sm font-medium text-white">{personality.name}</div>
                <div className="text-xs text-blue-200 mt-1">{personality.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cognitive Patterns */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-white">Cognitive Patterns</h3>
          <div className="bg-blue-950/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-800/20">
            <CognitiveWaveBar 
              label="Alpha Waves" 
              percentage={userProfile.cognitivePatterns.alphaWaves} 
              color="bg-gradient-to-r from-blue-500 to-blue-400" 
            />
            <CognitiveWaveBar 
              label="Beta Waves" 
              percentage={userProfile.cognitivePatterns.betaWaves} 
              color="bg-gradient-to-r from-blue-400 to-blue-300" 
            />
            <CognitiveWaveBar 
              label="Theta Waves" 
              percentage={userProfile.cognitivePatterns.thetaWaves} 
              color="bg-gradient-to-r from-blue-600 to-blue-500" 
            />
          </div>
        </div>

        {/* Generation Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-white">Generate AI Mix</h3>
          <div className="space-y-3">
            <button
              onClick={() => handleGenerate('focus', 30)}
              disabled={isGenerating}
              className="w-full p-4 bg-blue-700/60 rounded-xl hover:bg-blue-600/70 transition-all disabled:opacity-50 border border-blue-600/40 shadow-lg"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating...
                </div>
              ) : (
                <>
                  <div className="font-medium text-white">Smart Focus Mix</div>
                  <div className="text-xs text-blue-200">AI-optimized for concentration</div>
                </>
              )}
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleGenerate('relaxation', 45)}
                disabled={isGenerating}
                className="p-3 bg-blue-800/50 rounded-xl hover:bg-blue-700/60 transition-all disabled:opacity-50 border border-blue-700/30"
              >
                <div className="text-sm font-medium text-white">Relax</div>
                <div className="text-xs text-blue-200">45 min</div>
              </button>
              <button
                onClick={() => handleGenerate('energy', 30)}
                disabled={isGenerating}
                className="p-3 bg-blue-800/50 rounded-xl hover:bg-blue-700/60 transition-all disabled:opacity-50 border border-blue-700/30"
              >
                <div className="text-sm font-medium text-white">Energize</div>
                <div className="text-xs text-blue-200">30 min</div>
              </button>
            </div>
          </div>
        </div>

        {/* Generated Playlist */}
        {generatedPlaylist.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-white">AI Generated Mix</h3>
            <div className="space-y-3">
              {generatedPlaylist.slice(0, 5).map((track, index) => (
                <div key={index} className="bg-blue-950/60 backdrop-blur-xl rounded-xl p-4 border border-blue-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-xs bg-blue-600/60 text-white px-2 py-1 rounded-full mr-2 border border-blue-500/40">
                          AI Generated
                        </span>
                        {track.therapeuticScore && (
                          <span className="text-xs text-blue-300">
                            {track.therapeuticScore}% match
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-white">{track.title}</h4>
                      <p className="text-sm text-blue-200">{track.artist}</p>
                      {track.cognitiveMatch && (
                        <p className="text-xs text-blue-300 mt-1">{track.cognitiveMatch}</p>
                      )}
                    </div>
                    <button className="w-10 h-10 bg-blue-700/60 rounded-full flex items-center justify-center hover:bg-blue-600/70 transition-colors border border-blue-600/40">
                      <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Profile View
  const ProfileView = () => (
    <div className="pt-24 pb-24 px-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-2xl mr-4 shadow-lg">
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-700 rounded-full"></div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">{userProfile.name}</h2>
            <p className="text-blue-300 text-sm">{userProfile.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <div className="text-2xl font-light text-white">{userProfile.favorites}</div>
          <div className="text-xs text-blue-300">Favorites</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-light text-white">{userProfile.played}</div>
          <div className="text-xs text-blue-300">Played</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-light text-white">{userProfile.available}</div>
          <div className="text-xs text-blue-300">Available</div>
        </div>
      </div>

      {/* Listening Stats */}
      <div className="bg-blue-950/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-800/30">
        <h3 className="text-lg font-medium mb-4 text-white flex items-center">
          <div className="mr-2 w-5 h-5 relative">
            <div className="absolute bottom-0 left-0 w-1 h-2 bg-blue-400 rounded-full"></div>
            <div className="absolute bottom-0 left-1.5 w-1 h-3 bg-blue-400 rounded-full"></div>
            <div className="absolute bottom-0 left-3 w-1 h-4 bg-blue-400 rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-1 h-2.5 bg-blue-300 rounded-full"></div>
          </div>
          Listening Stats
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-blue-200">Daily Average</span>
            <span className="font-medium text-white">{userProfile.listeningStats.dailyAverage} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Weekly Sessions</span>
            <span className="font-medium text-white">{userProfile.listeningStats.weeklySessions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Preferred Time</span>
            <span className="font-medium text-white">{userProfile.listeningStats.preferredTime}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Simple placeholder for other views
  const PlaceholderView = ({ title, iconComponent }) => (
    <div className="pt-24 pb-24 px-6 text-center">
      <div className="mb-4">{iconComponent}</div>
      <h2 className="text-2xl font-light mb-2 text-white">{title}</h2>
      <p className="text-blue-300">Coming soon...</p>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'mood':
        return <MoodView />;
      case 'ai-dj':
        return <AIDJView />;
      case 'profile':
        return <ProfileView />;
      case 'trending':
        return (
          <PlaceholderView 
            title="Trending" 
            iconComponent={
              <div className="w-16 h-16 mx-auto relative">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className={`absolute bg-blue-400 rounded-full transition-all ${
                      i === 0 ? 'left-2 w-2 h-6 bottom-0' : 
                      i === 1 ? 'left-5 w-2 h-8 bottom-0' : 
                      i === 2 ? 'left-8 w-2 h-10 bottom-0' :
                      'left-11 w-2 h-7 bottom-0'
                    }`}
                  />
                ))}
                <div className="absolute top-0 left-6 w-4 h-1 bg-blue-300 rounded-full opacity-60"></div>
              </div>
            }
          />
        );
      case 'emotions':
        return (
          <PlaceholderView 
            title="Emotions" 
            iconComponent={
              <div className="w-16 h-16 mx-auto relative bg-blue-900/40 rounded-2xl p-4">
                <div className="absolute bottom-2 left-2 w-1 h-4 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-2 left-4 w-1 h-6 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-2 left-6 w-1 h-8 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-2 left-8 w-1 h-5 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-2 left-10 w-1 h-7 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-2 right-2 w-1 h-3 bg-blue-300 rounded-full"></div>
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-300 rounded-full"></div>
              </div>
            }
          />
        );
      default:
        return <MoodView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <NowPlayingMini />
      {renderCurrentView()}
      <BottomNavigation />
    </div>
  );
};

export default NeuralPositiveApp;