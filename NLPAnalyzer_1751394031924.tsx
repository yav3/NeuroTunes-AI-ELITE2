
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, AlertCircle } from 'lucide-react';

interface AnalysisResults {
  text: string;
  analysis: {
    sentiment: string;
    confidence: number;
    mood: string;
    moodScores: Record<string, number>;
    topics: string[];
    emotions: string[];
    wordCount: number;
    keyPhrases: string[];
  };
  suggestions: {
    recommendedActivity: string;
    musicMood: string;
    wellnessCategory: string;
  };
  timestamp: string;
}

const NLPAnalyzer: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('Sending NLP request:', { text: input });
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('NLP response received:', data);
      
      setResults(data);
    } catch (error) {
      console.error('NLP Analysis Error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      stress: 'bg-orange-100 text-orange-800',
      focus: 'bg-blue-100 text-blue-800',
      energy: 'bg-yellow-100 text-yellow-800',
      sleep: 'bg-purple-100 text-purple-800',
      meditation: 'bg-indigo-100 text-indigo-800'
    };
    return moodColors[mood] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Advanced NLP Text Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to analyze (e.g., 'I'm feeling stressed and need calming music')"
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <Button 
            onClick={handleAnalyze}
            disabled={!input.trim() || isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700">Error: {error}</span>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-4">
            {/* Sentiment & Mood */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Sentiment</h3>
                <Badge className={getSentimentColor(results.analysis.sentiment)}>
                  {results.analysis.sentiment}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  Confidence: {(results.analysis.confidence * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Detected Mood</h3>
                <Badge className={getMoodColor(results.analysis.mood)}>
                  {results.analysis.mood}
                </Badge>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Word Count</h3>
                <span className="text-lg font-mono">{results.analysis.wordCount}</span>
              </div>
            </div>

            {/* Topics & Emotions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Key Topics</h3>
                <div className="flex flex-wrap gap-1">
                  {results.analysis.topics.length > 0 ? (
                    results.analysis.topics.map((topic, index) => (
                      <Badge key={index} variant="outline">
                        {topic}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No topics detected</span>
                  )}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Emotions</h3>
                <div className="flex flex-wrap gap-1">
                  {results.analysis.emotions.length > 0 ? (
                    results.analysis.emotions.map((emotion, index) => (
                      <Badge key={index} variant="secondary">
                        {emotion}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No emotions detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mood Scores */}
            {Object.keys(results.analysis.moodScores).length > 0 && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Mood Analysis Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(results.analysis.moodScores).map(([mood, score]) => (
                    <div key={mood} className="flex items-center justify-between">
                      <span className="capitalize">{mood}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(score * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          {(score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div className="p-4 border rounded-lg bg-blue-50">
              <h3 className="font-semibold mb-2">AI Suggestions</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Recommended Activity:</strong> {results.suggestions.recommendedActivity}</p>
                <p><strong>Music Mood:</strong> {results.suggestions.musicMood}</p>
                <p><strong>Wellness Category:</strong> {results.suggestions.wellnessCategory}</p>
              </div>
            </div>

            {/* Debug Info */}
            <details className="p-4 border rounded-lg">
              <summary className="cursor-pointer font-semibold">Debug Information</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NLPAnalyzer;
