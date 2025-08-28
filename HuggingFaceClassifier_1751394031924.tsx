
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';

interface ClassificationResult {
  label: string;
  score: number;
}

interface HuggingFaceResults {
  text: string;
  primaryClassification: ClassificationResult;
  allClassifications: ClassificationResult[];
  timestamp: string;
}

const HuggingFaceClassifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<HuggingFaceResults | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClassify = async () => {
    if (!input.trim()) return;
    
    setIsClassifying(true);
    setError(null);
    
    try {
      console.log('Sending HuggingFace classification request:', { text: input });
      
      const response = await fetch('/api/classify', {
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
      console.log('HuggingFace classification response:', data);
      
      setResults(data);
    } catch (error) {
      console.error('HuggingFace Classification Error:', error);
      setError(error instanceof Error ? error.message : 'Classification failed');
    } finally {
      setIsClassifying(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      focus: 'bg-blue-100 text-blue-800',
      relax: 'bg-green-100 text-green-800',
      energize: 'bg-orange-100 text-orange-800',
      sleep: 'bg-purple-100 text-purple-800',
      meditate: 'bg-indigo-100 text-indigo-800',
      uplift: 'bg-pink-100 text-pink-800'
    };
    return colors[label] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          HuggingFace Zero-Shot Classification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to classify (e.g., 'I need to concentrate for work')"
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleClassify()}
          />
          <Button 
            onClick={handleClassify}
            disabled={!input.trim() || isClassifying}
            className="flex items-center gap-2"
          >
            {isClassifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Classifying...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Classify
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
            {/* Primary Classification */}
            <div className="p-4 border rounded-lg bg-blue-50">
              <h3 className="font-semibold mb-2">Primary Classification</h3>
              <div className="flex items-center gap-4">
                <Badge className={getLabelColor(results.primaryClassification.label)}>
                  {results.primaryClassification.label}
                </Badge>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <Progress 
                    value={results.primaryClassification.score * 100} 
                    className="flex-1 max-w-32"
                  />
                  <span className="text-sm font-mono">
                    {(results.primaryClassification.score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* All Classifications */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">All Classification Scores</h3>
              <div className="space-y-2">
                {results.allClassifications.map((classification, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={getLabelColor(classification.label)}
                    >
                      {classification.label}
                    </Badge>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <Progress 
                        value={classification.score * 100} 
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-12">
                        {(classification.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Info */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">Model Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Model:</strong> DistilBERT (Zero-Shot Classification)</p>
                <p><strong>Provider:</strong> Hugging Face Transformers</p>
                <p><strong>Runtime:</strong> Browser-based inference</p>
                <p><strong>Processed:</strong> {new Date(results.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Examples */}
        {!results && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Try these examples:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• "I need to concentrate for work"</div>
              <div>• "Feeling stressed and overwhelmed"</div>
              <div>• "Want to pump up for the gym"</div>
              <div>• "Time to wind down and sleep"</div>
              <div>• "Need some peaceful meditation"</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HuggingFaceClassifier;
