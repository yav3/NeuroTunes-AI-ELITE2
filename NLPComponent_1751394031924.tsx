
import React, { useState } from 'react';
import nlp from 'compromise';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles } from 'lucide-react';

interface NLPResults {
  topics: string[];
  emotions: string[];
  adjectives: string[];
  verbs: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  entities: string[];
  keywords: string[];
}

const NLPComponent: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<NLPResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const doc = nlp(input);
      
      // Extract various linguistic features
      const topics = doc.topics().out('array');
      const emotions = doc.match('#Emotion').out('array');
      const adjectives = doc.adjectives().out('array');
      const verbs = doc.verbs().out('array');
      const entities = doc.people().out('array').concat(doc.places().out('array'));
      
      // Simple sentiment analysis
      const positiveWords = doc.match('#Positive').length;
      const negativeWords = doc.match('#Negative').length;
      const sentiment = positiveWords > negativeWords ? 'positive' : 
                       negativeWords > positiveWords ? 'negative' : 'neutral';
      
      // Extract keywords (nouns and important adjectives)
      const keywords = doc.nouns().out('array')
        .concat(adjectives.slice(0, 5))
        .filter((word, index, arr) => arr.indexOf(word) === index)
        .slice(0, 10);

      setResults({
        topics,
        emotions,
        adjectives,
        verbs,
        sentiment,
        entities,
        keywords
      });
    } catch (error) {
      console.error('NLP Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
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

        {/* Results Section */}
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Topics */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Topics</h3>
              <div className="flex flex-wrap gap-1">
                {results.topics.length > 0 ? (
                  results.topics.map((topic, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No topics found</span>
                )}
              </div>
            </div>

            {/* Emotions */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Emotions</h3>
              <div className="flex flex-wrap gap-1">
                {results.emotions.length > 0 ? (
                  results.emotions.map((emotion, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {emotion}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No emotions detected</span>
                )}
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Keywords</h3>
              <div className="flex flex-wrap gap-1">
                {results.keywords.length > 0 ? (
                  results.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="default" className="text-xs">
                      {keyword}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No keywords found</span>
                )}
              </div>
            </div>

            {/* Sentiment */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Sentiment</h3>
              <Badge className={`text-xs ${getSentimentColor(results.sentiment)}`}>
                {results.sentiment.charAt(0).toUpperCase() + results.sentiment.slice(1)}
              </Badge>
            </div>

            {/* Adjectives */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Adjectives</h3>
              <div className="flex flex-wrap gap-1">
                {results.adjectives.length > 0 ? (
                  results.adjectives.slice(0, 8).map((adj, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {adj}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No adjectives found</span>
                )}
              </div>
            </div>

            {/* Verbs */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Action Words</h3>
              <div className="flex flex-wrap gap-1">
                {results.verbs.length > 0 ? (
                  results.verbs.slice(0, 8).map((verb, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {verb}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No verbs found</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Usage Examples */}
        {!results && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Try these examples:</h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div>• "I'm feeling stressed and need calming music"</div>
              <div>• "Looking for energetic workout music"</div>
              <div>• "Need focus music for studying"</div>
              <div>• "Feeling anxious, want peaceful relaxation"</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NLPComponent;
