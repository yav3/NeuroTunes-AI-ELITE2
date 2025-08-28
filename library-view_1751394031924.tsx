import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrackItem from "./track-item";
import PlaylistCard from "./playlist-card";
import { Search, Grid, List as ListIcon, Filter } from "lucide-react";
import type { Track, PlaylistWithTracks, TrackWithPlaylist } from "@shared/schema";

interface LibraryViewProps {
  onPlayTrack: (track: TrackWithPlaylist) => void;
  currentTrack: TrackWithPlaylist | null;
  isPlaying: boolean;
}

export default function LibraryView({ onPlayTrack, currentTrack, isPlaying }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Fetch all tracks
  const { data: tracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ['/api/tracks'],
  });

  // Fetch all playlists
  const { data: playlists = [], isLoading: playlistsLoading } = useQuery<PlaylistWithTracks[]>({
    queryKey: ['/api/users', 1, 'playlists'],
  });

  // Filter tracks
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = !searchQuery || 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = !selectedGenre || track.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  // Get unique genres
  const genres = [...new Set(tracks.map(track => track.genre).filter(Boolean))];

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-foreground mb-2">Your Library</h1>
        <p className="text-muted-foreground">Discover your personal collection</p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search your music..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 glass-effect border-0 rounded-2xl w-80"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <select
            value={selectedGenre || ""}
            onChange={(e) => setSelectedGenre(e.target.value || null)}
            className="px-4 py-3 glass-effect border-0 rounded-2xl text-sm bg-transparent"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode('grid')}
            className={`rounded-full ${viewMode === 'grid' ? 'bg-calm-primary/10 text-calm-primary' : 'text-muted-foreground'}`}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode('list')}
            className={`rounded-full ${viewMode === 'list' ? 'bg-calm-primary/10 text-calm-primary' : 'text-muted-foreground'}`}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="tracks" className="w-full">
        <TabsList className="glass-effect rounded-2xl p-1 mb-8">
          <TabsTrigger value="tracks" className="rounded-xl">Tracks</TabsTrigger>
          <TabsTrigger value="playlists" className="rounded-xl">Playlists</TabsTrigger>
          <TabsTrigger value="albums" className="rounded-xl">Albums</TabsTrigger>
        </TabsList>

        <TabsContent value="tracks">
          {tracksLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-calm-surface/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-3">
              {filteredTracks.map((track) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  onPlay={() => onPlayTrack(track)}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredTracks.map((track) => (
                <div key={track.id} className="glass-effect rounded-2xl p-4 group cursor-pointer hover:bg-calm-surface/30 transition-all">
                  <img
                    src={track.coverUrl || "/placeholder-track.jpg"}
                    alt={track.title}
                    className="w-full aspect-square rounded-xl object-cover mb-4"
                  />
                  <h4 className="font-light text-foreground truncate">{track.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  <Button
                    onClick={() => onPlayTrack(track)}
                    className="w-full mt-3 bg-calm-primary/10 text-calm-primary hover:bg-calm-primary hover:text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                  >
                    Play
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="playlists">
          {playlistsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-calm-surface/50 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onPlay={onPlayTrack}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="albums">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Albums view coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}