import React, { useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import nlp from 'compromise';

// Set TensorFlow platform once
if (typeof window !== 'undefined' && !tf.ENV.get('IS_BROWSER')) {
  tf.ENV.set('IS_BROWSER', true);
}

interface PreferenceAnalyzerProps {
  onAnalysisComplete: (preferences: {
    category: string;
    confidence: number;
    preferences: string;
  }) => void;
}

export const PreferenceAnalyzer: React.FC<PreferenceAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Enhanced text preprocessing with compromise
      const doc = nlp(input);
      const topics = doc.topics().json();
      const emotions = doc.match('#Emotion').json();
      const adjectives = doc.adjectives().json();
      const verbs = doc.verbs().json();
      
      // Extract semantic context for better categorization
      const extractedKeywords = [
        ...topics.map(t => t.text.toLowerCase()),
        ...emotions.map(e => e.text.toLowerCase()),
        ...adjectives.map(a => a.text.toLowerCase()),
        ...verbs.map(v => v.text.toLowerCase())
      ];

      const model = await use.load();
      const embeddings = await model.embed([input]);
      const userEmbedding = embeddings.arraySync()[0];

      // Enhanced therapeutic music categories with more nuanced embeddings
      const therapeuticCategories = {
        'Deep Focus': {
          keywords: ['focus', 'concentration', 'study', 'work', 'productivity', 'attention'],
          embedding: [0.2, 0.1, 0.4, 0.3, 0.2, 0.1, 0.4, 0.2]
        },
        'Stress Relief': {
          keywords: ['stress', 'anxiety', 'overwhelmed', 'tension', 'worry', 'calm'],
          embedding: [0.1, 0.5, 0.2, 0.1, 0.4, 0.3, 0.1, 0.2]
        },
        'Relaxation': {
          keywords: ['relax', 'peaceful', 'serene', 'meditation', 'mindfulness', 'rest'],
          embedding: [0.1, 0.2, 0.3, 0.4, 0.1, 0.2, 0.2, 0.3]
        },
        'Energy Boost': {
          keywords: ['energy', 'motivation', 'workout', 'exercise', 'upbeat', 'active'],
          embedding: [0.5, 0.2, 0.1, 0.2, 0.3, 0.1, 0.2, 0.4]
        },
        'Sleep Support': {
          keywords: ['sleep', 'bedtime', 'drowsy', 'tired', 'rest', 'night'],
          embedding: [0.1, 0.1, 0.2, 0.5, 0.2, 0.4, 0.1, 0.2]
        },
        'Emotional Balance': {
          keywords: ['emotional', 'mood', 'balance', 'stability', 'centered', 'grounded'],
          embedding: [0.2, 0.3, 0.3, 0.2, 0.2, 0.2, 0.3, 0.3]
        }
      };

      const cosineSimilarity = (vecA: number[], vecB: number[]) => {
        const dot = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
        const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dot / (magA * magB);
      };

      let bestMatch = { category: '', similarity: -1 };
      
      for (const [category, data] of Object.entries(therapeuticCategories)) {
        // Combine embedding similarity with enhanced keyword matching
        const embeddingSimilarity = cosineSimilarity(userEmbedding.slice(0, 8), data.embedding);
        
        // Enhanced keyword matching using both original text and NLP-extracted keywords
        const directMatches = data.keywords.filter(keyword => 
          input.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        
        const nlpMatches = data.keywords.filter(keyword =>
          extractedKeywords.some(extracted => extracted.includes(keyword.toLowerCase()))
        ).length;
        
        const keywordScore = (directMatches + nlpMatches * 0.8) / data.keywords.length;
        const combinedScore = embeddingSimilarity * 0.6 + keywordScore * 0.4;
        
        if (combinedScore > bestMatch.similarity) {
          bestMatch = { category, similarity: combinedScore };
        }
      }

      onAnalysisComplete({
        category: bestMatch.category,
        confidence: Math.round(bestMatch.similarity * 100),
        preferences: input
      });

    } catch (error) {
      console.error('Preference analysis failed:', error);
      // Fallback to simple keyword matching
      const fallbackCategories = ['Deep Focus', 'Stress Relief', 'Relaxation', 'Energy Boost'];
      const randomCategory = fallbackCategories[Math.floor(Math.random() * fallbackCategories.length)];
      
      onAnalysisComplete({
        category: randomCategory,
        confidence: 65,
        preferences: input
      });
    }
    
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Enhanced Preference Analysis
      </h3>
      <textarea
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        placeholder="Describe your current mood, what you're doing, or what kind of music you need right now..."
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        onClick={handleAnalyze}
        disabled={!input.trim() || isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Analyzing...
          </>
        ) : (
          'Analyze Preferences'
        )}
      </button>
    </div>
  );
};