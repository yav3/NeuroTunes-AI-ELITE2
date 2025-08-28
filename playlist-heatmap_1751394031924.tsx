import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import type { PlaylistWithTracks, Track } from "@shared/schema";

interface PlaylistHeatmapProps {
  playlist: PlaylistWithTracks;
  currentTrack?: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface EmotionalPoint {
  trackIndex: number;
  trackId: number;
  title: string;
  artist: string;
  valence: number; // 0-1 (negative to positive)
  energy: number;  // 0-1 (low to high energy)
  mood: string | null;
  duration: number;
  timestamp: number; // Cumulative time in playlist
}

const moodColors = {
  calm: '#06b6d4', // cyan
  focus: '#3b82f6', // blue
  energetic: '#f59e0b', // amber
  peaceful: '#10b981', // emerald
  uplifting: '#f97316', // orange
  meditative: '#8b5cf6', // violet
  happy: '#eab308', // yellow
  relaxing: '#14b8a6', // teal
  motivational: '#ef4444', // red
  contemplative: '#6366f1', // indigo
};

function getIntensityColor(valence: number, energy: number): string {
  // Create heat map based on valence (x-axis) and energy (y-axis)
  const hue = valence * 120; // 0 (red) to 120 (green)
  const saturation = 70 + (energy * 30); // 70% to 100%
  const lightness = 45 + (energy * 25); // 45% to 70%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function PlaylistHeatmap({
  playlist,
  currentTrack,
  isPlaying,
  onTrackSelect,
  onPlayPause,
  onNext,
  onPrevious
}: PlaylistHeatmapProps) {
  const [selectedTrack, setSelectedTrack] = useState<EmotionalPoint | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Transform playlist data into emotional journey points
  const emotionalJourney = useMemo(() => {
    let cumulativeTime = 0;
    
    return playlist.tracks.map((track, index) => {
      const point: EmotionalPoint = {
        trackIndex: index,
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        valence: track.valence || 0.5,
        energy: track.energy || 0.5,
        mood: track.mood,
        duration: track.duration,
        timestamp: cumulativeTime
      };
      
      cumulativeTime += track.duration;
      return point;
    });
  }, [playlist.tracks]);

  // Animation effect for current playing track
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setAnimationProgress(prev => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Calculate journey statistics
  const journeyStats = useMemo(() => {
    if (emotionalJourney.length === 0) return null;
    
    const avgValence = emotionalJourney.reduce((sum, point) => sum + point.valence, 0) / emotionalJourney.length;
    const avgEnergy = emotionalJourney.reduce((sum, point) => sum + point.energy, 0) / emotionalJourney.length;
    const totalDuration = emotionalJourney[emotionalJourney.length - 1]?.timestamp + emotionalJourney[emotionalJourney.length - 1]?.duration || 0;
    
    const moodDistribution = emotionalJourney.reduce((acc, point) => {
      if (point.mood) {
        acc[point.mood] = (acc[point.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const dominantMood = Object.entries(moodDistribution).sort(([,a], [,b]) => b - a)[0]?.[0];
    
    return {
      avgValence,
      avgEnergy,
      totalDuration,
      dominantMood,
      moodDistribution
    };
  }, [emotionalJourney]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionalState = (valence: number, energy: number) => {
    if (valence > 0.6 && energy > 0.6) return "Energetic & Positive";
    if (valence > 0.6 && energy < 0.4) return "Calm & Content";
    if (valence < 0.4 && energy > 0.6) return "Intense & Driven";
    if (valence < 0.4 && energy < 0.4) return "Melancholic & Reflective";
    return "Balanced & Neutral";
  };

  return (
    <div className="space-y-6">
      {/* Simplified Heat Map */}
      <div className="glass-effect rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{playlist.name}</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onPrevious} className="bg-white/10 border-white/20 text-white">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onPlayPause} className="bg-white/10 border-white/20 text-white">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onNext} className="bg-white/10 border-white/20 text-white">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Simplified Heat Map Visualization */}
        <div className="relative w-full h-64 bg-black/20 rounded-lg p-4">
          {/* Track points */}
          {emotionalJourney.map((point, index) => {
            const isCurrentTrack = currentTrack?.id === point.trackId;
            
            return (
              <button
                key={point.trackId}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 hover:scale-125 ${
                  isCurrentTrack ? 'animate-pulse scale-150' : ''
                }`}
                style={{
                  left: `${point.valence * 100}%`,
                  top: `${(1 - point.energy) * 100}%`,
                  backgroundColor: getIntensityColor(point.valence, point.energy),
                  width: isCurrentTrack ? '16px' : '12px',
                  height: isCurrentTrack ? '16px' : '12px',
                  boxShadow: isCurrentTrack ? '0 0 20px rgba(59, 130, 246, 0.6)' : '0 2px 4px rgba(0,0,0,0.3)'
                }}
                onClick={() => {
                  setSelectedTrack(point);
                  onTrackSelect(playlist.tracks[index]);
                }}
              >
                <span className="sr-only">{point.title} by {point.artist}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Track Info */}
        {selectedTrack && (
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold text-white">{selectedTrack.title}</h4>
            <p className="text-white/70">{selectedTrack.artist}</p>
            <div className="mt-2 text-sm text-white/60">
              Track {selectedTrack.trackIndex + 1} • {getEmotionalState(selectedTrack.valence, selectedTrack.energy)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}