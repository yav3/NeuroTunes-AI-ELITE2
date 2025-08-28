import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Brain, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import AiUsageIndicator from './ai-usage-indicator';

interface MoodSuggestion {
  trackId: number;
  title: string;
  artist: string;
  currentMood: string | null;
  suggestedMood: string;
  confidence: number;
  wellnessCategories: string[];
  needsUpdate: boolean;
}

interface MoodSuggestionsResponse {
  suggestions: MoodSuggestion[];
  needingUpdates: number;
}

interface MoodAnalysis {
  primaryMood: string;
  secondaryMoods: string[];
  confidence: number;
  wellnessCategories: string[];
  energyLevel: number;
  valenceLevel: number;
}

interface AnalysisResult {
  trackId: number;
  analysis: MoodAnalysis;
  suggestions: {
    mood: string;
    tags: string[];
    energy: number;
    valence: number;
  };
}

export default function MoodTagger() {
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const userId = 1; // Get from auth context in real app

  const { data: suggestions, isLoading } = useQuery<MoodSuggestionsResponse>({
    queryKey: ['/api/mood-suggestions'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const analyzeSingleMutation = useMutation({
    mutationFn: async (trackId: number) => {
      const response = await fetch(`/api/tracks/${trackId}/analyze-mood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood-suggestions'] });
    }
  });

  const analyzeBatchMutation = useMutation({
    mutationFn: async (trackIds: number[]) => {
      const response = await fetch('/api/analyze-mood-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood-suggestions'] });
      setSelectedTracks([]);
    }
  });

  const handleAnalyzeTrack = (trackId: number) => {
    analyzeSingleMutation.mutate(trackId);
  };

  const handleBatchAnalyze = () => {
    if (selectedTracks.length > 0) {
      analyzeBatchMutation.mutate(selectedTracks);
    }
  };

  const toggleTrackSelection = (trackId: number) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getMoodIcon = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'calming':
      case 'peaceful':
        return '🌸';
      case 'energetic':
      case 'upbeat':
        return '⚡';
      case 'focused':
      case 'concentrated':
        return '🎯';
      case 'soothing':
      case 'gentle':
        return '🌙';
      default:
        return '🎵';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Mood Tagger
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered mood analysis and tag suggestions for your music library
          </p>
        </div>
      </div>

      <AiUsageIndicator userId={userId} />
      
      <div>
        {selectedTracks.length > 0 && (
          <Button 
            onClick={handleBatchAnalyze}
            disabled={analyzeBatchMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {analyzeBatchMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Analyze {selectedTracks.length} Tracks
          </Button>
        )}
      </div>

      {suggestions?.suggestions && (
        <div className="grid gap-4">
          {suggestions.suggestions.map((suggestion: MoodSuggestion) => (
            <Card key={suggestion.trackId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTracks.includes(suggestion.trackId)}
                      onChange={() => toggleTrackSelection(suggestion.trackId)}
                      className="rounded border-gray-300"
                    />
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getMoodIcon(suggestion.suggestedMood)}
                        {suggestion.title}
                      </CardTitle>
                      <CardDescription>{suggestion.artist}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getConfidenceColor(suggestion.confidence)}>
                      {Math.round(suggestion.confidence * 100)}% confident
                    </Badge>
                    {suggestion.needsUpdate && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Needs Update
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Current Mood:</span>
                      <Badge variant="outline" className="ml-2">
                        {suggestion.currentMood || 'None'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">AI Suggested:</span>
                      <Badge className="ml-2 bg-purple-100 text-purple-800">
                        {suggestion.suggestedMood}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Wellness Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {suggestion.wellnessCategories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleAnalyzeTrack(suggestion.trackId)}
                      disabled={analyzeSingleMutation.isPending}
                      variant="outline"
                    >
                      {analyzeSingleMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Brain className="h-4 w-4 mr-2" />
                      )}
                      Re-analyze
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {suggestions?.needingUpdates > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  {suggestions.needingUpdates} tracks have mood tag suggestions
                </p>
                <p className="text-sm text-orange-600">
                  Review AI suggestions to improve your music library's wellness categorization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}