import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import type { TrackWithPlaylist } from "@shared/schema";

interface TrackItemProps {
  track: TrackWithPlaylist;
  onPlay: () => void;
  isPlaying?: boolean;
  showAlbum?: boolean;
}

export default function TrackItem({ track, onPlay, isPlaying = false, showAlbum = true }: TrackItemProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-6 p-6 glass-effect rounded-2xl hover:bg-calm-surface/30 transition-all cursor-pointer group">
      <img 
        src={track.coverUrl || "/placeholder-track.jpg"} 
        alt={`${track.title} cover`}
        className="w-14 h-14 rounded-xl object-cover"
      />
      <div className="flex-1 min-w-0">
        <h5 className="font-light text-foreground truncate">{track.title}</h5>
        <p className="text-sm text-muted-foreground truncate mt-1">
          {track.artist}
          {showAlbum && track.album && ` • ${track.album}`}
          {track.playlist && ` • ${track.playlist.name}`}
        </p>
      </div>
      <span className="text-xs text-muted-foreground font-mono">
        {formatDuration(track.duration)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPlay}
        className={`w-10 h-10 transition-all rounded-full ${
          isPlaying 
            ? 'text-calm-primary opacity-100 bg-calm-primary/10' 
            : 'text-muted-foreground hover:text-calm-primary opacity-0 group-hover:opacity-100 hover:bg-calm-primary/5'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>
    </div>
  );
}
