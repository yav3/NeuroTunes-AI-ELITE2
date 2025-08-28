import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  Heart,
  List
} from "lucide-react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import type { TrackWithPlaylist } from "@shared/schema";

interface MusicPlayerProps {
  track: TrackWithPlaylist;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function MusicPlayer({ 
  track, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious 
}: MusicPlayerProps) {
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const {
    currentTime,
    duration,
    progress,
    formatTime,
    seek,
    isLoading,
    error
  } = useAudioPlayer(track.audioUrl, isPlaying);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    setIsMuted(value[0] === 0);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  return (
    <div data-testid="music-player" className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border/20 p-6 shadow-2xl">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between">
          
          {/* Current Track */}
          <div className="flex items-center space-x-6 flex-1 min-w-0">
            <img 
              src={track.coverUrl || "/placeholder-album.jpg"} 
              alt={`${track.title} cover`}
              className="w-16 h-16 rounded-2xl object-cover shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-light text-foreground truncate">{track.title}</h4>
              <p className="text-sm text-muted-foreground truncate">
                {error ? 'Audio unavailable' : isLoading ? 'Loading...' : track.artist}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorited(!isFavorited)}
              className={`transition-colors rounded-full ${
                isFavorited ? 'text-red-400 hover:text-red-500' : 'text-muted-foreground hover:text-calm-primary'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center space-y-4 flex-1 max-w-md">
            <div className="flex items-center space-x-8">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onPrevious}
                className="text-muted-foreground hover:text-foreground rounded-full"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                data-testid="play-pause-button"
                onClick={onPlayPause}
                disabled={error || isLoading}
                className="w-14 h-14 bg-calm-primary hover:bg-calm-primary/90 text-white rounded-full shadow-lg transition-all disabled:opacity-50"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onNext}
                className="text-muted-foreground hover:text-foreground rounded-full"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
                <Repeat className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-4 w-full">
              <span className="text-xs text-muted-foreground font-mono min-w-[40px]">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground font-mono min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center space-x-6 flex-1 justify-end">
            <div className="flex items-center space-x-3 lg:flex hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMute}
                className="text-muted-foreground hover:text-foreground rounded-full"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <div className="w-24">
                <Slider
                  value={isMuted ? [0] : volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export { MusicPlayer };
