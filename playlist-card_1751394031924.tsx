import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { PlaylistWithTracks } from "@shared/schema";

interface PlaylistCardProps {
  playlist: PlaylistWithTracks;
  onPlay: (track: any) => void;
}

export default function PlaylistCard({ playlist, onPlay }: PlaylistCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  const handlePlayFirstTrack = () => {
    if (playlist.tracks.length > 0) {
      const firstTrack = { ...playlist.tracks[0], playlist };
      onPlay(firstTrack);
    }
  };

  return (
    <div className="glass-effect rounded-3xl overflow-hidden cursor-pointer group minimal-shadow hover:shadow-xl transition-all duration-500">
      <div className="relative">
        <img 
          src={playlist.coverUrl || "/placeholder-playlist.jpg"} 
          alt={`${playlist.name} cover`}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <Button
          onClick={handlePlayFirstTrack}
          className="absolute inset-0 m-auto w-16 h-16 bg-calm-primary/80 hover:bg-calm-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-xl backdrop-blur-sm"
        >
          <Play className="w-6 h-6 ml-1" />
        </Button>
      </div>
      <div className="p-8">
        <h4 className="font-light text-foreground mb-3 text-lg">{playlist.name}</h4>
        <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed">{playlist.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {playlist.trackCount} tracks • {formatDuration(playlist.totalDuration)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayFirstTrack}
            className="w-8 h-8 bg-calm-primary/20 text-calm-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-calm-primary/30"
          >
            <Play className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
