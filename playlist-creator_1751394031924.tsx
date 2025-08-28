import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Wand2, Music, Sparkles } from "lucide-react";
import type { PlaylistWithTracks } from "@shared/schema";

interface PlaylistCreatorProps {
  onPlaylistCreated: (playlist: PlaylistWithTracks) => void;
}

export default function PlaylistCreator({ onPlaylistCreated }: PlaylistCreatorProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const queryClient = useQueryClient();

  const moods = [
    { name: "Calm", value: "calm", description: "Peaceful and relaxing" },
    { name: "Focused", value: "focused", description: "Deep concentration" },
    { name: "Energized", value: "energized", description: "Uplifting and motivating" },
    { name: "Creative", value: "creative", description: "Inspiring and artistic" }
  ];

  const createPlaylistMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; mood?: string }) => {
      return apiRequest(`/api/users/1/playlists`, {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          mood: data.mood,
          userId: 1,
          isGenerated: false
        })
      });
    },
    onSuccess: (playlist) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', 1, 'playlists'] });
      onPlaylistCreated(playlist);
      setName("");
      setDescription("");
      setSelectedMood(null);
    }
  });

  const generatePlaylistMutation = useMutation({
    mutationFn: async (mood: string) => {
      return apiRequest(`/api/users/1/playlists/generate`, {
        method: 'POST',
        body: JSON.stringify({ mood })
      });
    },
    onSuccess: (playlist) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', 1, 'playlists'] });
      onPlaylistCreated(playlist);
    }
  });

  const handleCreatePlaylist = () => {
    if (!name.trim()) return;
    
    createPlaylistMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      mood: selectedMood
    });
  };

  const handleGeneratePlaylist = (mood: string) => {
    setIsGenerating(true);
    generatePlaylistMutation.mutate(mood, {
      onSettled: () => setIsGenerating(false)
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="font-light text-foreground flex items-center gap-2">
            <Music className="w-5 h-5 calm-primary" />
            Create New Playlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="glass-effect rounded-2xl p-1 mb-6">
              <TabsTrigger value="manual" className="rounded-xl">Manual</TabsTrigger>
              <TabsTrigger value="ai" className="rounded-xl">AI Generated</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-light text-foreground mb-2">
                    Playlist Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Peaceful Playlist"
                    className="glass-effect border-0 rounded-2xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-foreground mb-2">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your playlist..."
                    className="glass-effect border-0 rounded-2xl resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-foreground mb-3">
                    Mood (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {moods.map((mood) => (
                      <Button
                        key={mood.value}
                        variant="ghost"
                        onClick={() => setSelectedMood(selectedMood === mood.value ? null : mood.value)}
                        className={`p-4 glass-effect rounded-2xl text-left h-auto flex-col items-start space-y-1 ${
                          selectedMood === mood.value ? 'ring-1 ring-primary/20 bg-calm-primary/5' : ''
                        }`}
                      >
                        <span className="font-light text-foreground">{mood.name}</span>
                        <span className="text-xs text-muted-foreground">{mood.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCreatePlaylist}
                  disabled={!name.trim() || createPlaylistMutation.isPending}
                  className="w-full bg-calm-primary hover:bg-calm-primary/90 text-white rounded-2xl h-12"
                >
                  {createPlaylistMutation.isPending ? (
                    "Creating..."
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Playlist
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <div className="text-center py-6">
                <Sparkles className="w-12 h-12 calm-primary mx-auto mb-4" />
                <h3 className="font-light text-foreground mb-2">AI-Powered Playlist Generation</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Let our AI create a personalized playlist based on your mood and preferences
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {moods.map((mood) => (
                  <Card key={mood.value} className="glass-effect border-0">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <Badge variant="outline" className="bg-calm-surface/30 border-0">
                          {mood.name}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{mood.description}</p>
                        <Button
                          onClick={() => handleGeneratePlaylist(mood.value)}
                          disabled={isGenerating || generatePlaylistMutation.isPending}
                          className="w-full bg-calm-primary/10 text-calm-primary hover:bg-calm-primary hover:text-white rounded-2xl"
                        >
                          {isGenerating || generatePlaylistMutation.isPending ? (
                            "Generating..."
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}