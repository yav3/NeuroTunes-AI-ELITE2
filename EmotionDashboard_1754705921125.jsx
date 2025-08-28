import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Heart, 
  Brain, 
  Zap, 
  Moon, 
  Shield, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Star
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '../stores/playerStore';

export function EmotionDashboard() {
  const navigate = useNavigate();
  const { stopPlayback } = usePlayerStore();
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all
  const [selectedMetric, setSelectedMetric] = useState('mood'); // mood, energy, progress
  
  // Stop playback when entering dashboard
  useEffect(() => {
    stopPlayback();
  }, []);

  // Fetch emotion tracking data
  const { data: emotionData, isLoading } = useQuery({
    queryKey: ['emotion-tracking', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/emotion-tracking?period=${selectedPeriod}`);
      return response.json();
    },
  });

  // Fetch listening statistics
  const { data: listenStats } = useQuery({
    queryKey: ['listening-stats', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/listening-stats?period=${selectedPeriod}`);
      return response.json();
    },
  });

  const therapeuticGoals = [
    { id: 'focus', label: 'Focus Enhancement', icon: Brain, color: 'blue' },
    { id: 'chill', label: 'Chill', icon: Heart, color: 'green' },
    { id: 'relaxation', label: 'Relaxation', icon: Heart, color: 'purple' },
    { id: 'energy', label: 'Energy Boost', icon: Zap, color: 'yellow' },
    { id: 'sleep', label: 'Sleep Support', icon: Moon, color: 'indigo' },
    { id: 'pain', label: 'Pain Relief', icon: Shield, color: 'red' },
  ];

  const moodColors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    neutral: 'bg-gray-500',
    low: 'bg-orange-500',
    poor: 'bg-red-500'
  };

  const formatPeriod = (period) => {
    switch(period) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
      default: return 'This Week';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-black text-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold mb-2">Emotion Tracking</h1>
        <p className="text-gray-400">Your personalized therapeutic music journey</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {['week', 'month', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {formatPeriod(period)}
            </button>
          ))}
        </div>

        {/* Overall Mood Trend */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp size={20} />
              Mood Trend
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={16} />
              {formatPeriod(selectedPeriod)}
            </div>
          </div>
          
          {emotionData?.moodTrend ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-400">
                  {emotionData.averageMood || 'Good'}
                </span>
                <span className="text-sm text-gray-400">
                  {emotionData.moodTrend.change > 0 ? '+' : ''}{emotionData.moodTrend.change}% vs last period
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                  style={{ width: `${(emotionData.moodScore || 70)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity size={32} className="mx-auto mb-2 opacity-50" />
              <p>Start listening to track your mood</p>
            </div>
          )}
        </div>

        {/* Therapeutic Goals Progress */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Target size={20} />
            Therapeutic Goals Progress
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {therapeuticGoals.map((goal) => {
              const Icon = goal.icon;
              const progress = emotionData?.goalProgress?.[goal.id] || 0;
              const sessions = emotionData?.goalSessions?.[goal.id] || 0;
              
              return (
                <div key={goal.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={`text-${goal.color}-400`} />
                    <span className="font-medium text-sm">{goal.label}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{sessions} sessions</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${goal.color}-500 transition-all`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Listening Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Time Spent */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <BarChart3 size={18} />
              Listening Time
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Hours</span>
                <span className="font-bold">{listenStats?.totalHours || '0'}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Session</span>
                <span className="font-bold">{listenStats?.avgSession || '0'}min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sessions</span>
                <span className="font-bold">{listenStats?.sessions || 0}</span>
              </div>
            </div>
          </div>

          {/* Genre Distribution */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <PieChart size={18} />
              Genre Preferences
            </h3>
            <div className="space-y-2">
              {(listenStats?.genres || []).slice(0, 4).map((genre, index) => (
                <div key={genre.name} className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">{genre.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${genre.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs w-8 text-right">{genre.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Mood Entries */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Activity size={18} />
            Recent Mood Entries
          </h3>
          
          {emotionData?.recentEntries?.length > 0 ? (
            <div className="space-y-3">
              {emotionData.recentEntries.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${moodColors[entry.mood] || 'bg-gray-500'}`} />
                    <div>
                      <p className="font-medium">{entry.track}</p>
                      <p className="text-xs text-gray-400">{entry.goal} • {entry.genre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm capitalize">{entry.mood}</p>
                    <p className="text-xs text-gray-400">{entry.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star size={32} className="mx-auto mb-2 opacity-50" />
              <p>No mood entries yet</p>
              <p className="text-sm">Listen to music and provide feedback to see insights</p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-20">
          <h3 className="text-lg font-semibold mb-3">Personalized Recommendations</h3>
          <div className="space-y-2">
            {emotionData?.recommendations?.length > 0 ? (
              emotionData.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>{rec}</span>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Try Focus Enhancement sessions in the morning</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Classical music shows great results for relaxation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Consider longer sessions for better therapeutic effects</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}