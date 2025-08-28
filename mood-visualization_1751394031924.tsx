import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Palette, Volume2, Heart, Brain, Zap } from 'lucide-react';

interface MoodData {
  energy: number; // 0-100
  valence: number; // 0-100 (negative to positive)
  arousal: number; // 0-100 (calm to excited)
  dominance: number; // 0-100 (submissive to dominant)
  tempo: number; // BPM
  mood: string;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  particle: string;
}

const MOOD_PALETTES: Record<string, ColorPalette> = {
  calm: {
    primary: '#4A90E2',
    secondary: '#7BB3F0',
    accent: '#A8D0F7',
    background: 'rgba(74, 144, 226, 0.1)',
    particle: '#B8E0FF'
  },
  energetic: {
    primary: '#FF6B35',
    secondary: '#FF8E53',
    accent: '#FFB088',
    background: 'rgba(255, 107, 53, 0.1)',
    particle: '#FFD4C4'
  },
  peaceful: {
    primary: '#50C878',
    secondary: '#7ED899',
    accent: '#A8E6BA',
    background: 'rgba(80, 200, 120, 0.1)',
    particle: '#C8F2D4'
  },
  melancholy: {
    primary: '#6B73FF',
    secondary: '#8B93FF',
    accent: '#ABB3FF',
    background: 'rgba(107, 115, 255, 0.1)',
    particle: '#D0D3FF'
  },
  intense: {
    primary: '#E74C3C',
    secondary: '#F1948A',
    accent: '#F8C8C4',
    background: 'rgba(231, 76, 60, 0.1)',
    particle: '#FADBD8'
  },
  mysterious: {
    primary: '#8E44AD',
    secondary: '#A569BD',
    accent: '#BB8FCE',
    background: 'rgba(142, 68, 173, 0.1)',
    particle: '#D7BDE2'
  },
  uplifting: {
    primary: '#F39C12',
    secondary: '#F8C471',
    accent: '#FCF3CF',
    background: 'rgba(243, 156, 18, 0.1)',
    particle: '#FEF9E7'
  },
  default: {
    primary: '#34495E',
    secondary: '#5D6D7E',
    accent: '#85929E',
    background: 'rgba(52, 73, 94, 0.1)',
    particle: '#D5DBDB'
  }
};

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

export function MoodVisualization() {
  const [currentMood, setCurrentMood] = useState<MoodData>({
    energy: 50,
    valence: 50,
    arousal: 50,
    dominance: 50,
    tempo: 120,
    mood: 'calm'
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<string>('calm');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Generate particles based on mood data
  const generateParticles = (moodData: MoodData, palette: ColorPalette) => {
    const particleCount = Math.floor((moodData.energy / 100) * 50) + 20;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `particle-${i}`,
        x: Math.random() * 800,
        y: Math.random() * 400,
        size: Math.random() * (moodData.energy / 100) * 8 + 2,
        speedX: (Math.random() - 0.5) * (moodData.arousal / 100) * 4,
        speedY: (Math.random() - 0.5) * (moodData.energy / 100) * 3,
        opacity: Math.random() * 0.8 + 0.2,
        color: palette.particle
      });
    }

    setParticles(newParticles);
  };

  // Animate particles
  const animateParticles = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setParticles(prevParticles => 
      prevParticles.map(particle => {
        // Update particle position
        let newX = particle.x + particle.speedX;
        let newY = particle.y + particle.speedY;

        // Bounce off walls
        if (newX <= 0 || newX >= canvas.width) {
          particle.speedX *= -0.8;
          newX = Math.max(0, Math.min(canvas.width, newX));
        }
        if (newY <= 0 || newY >= canvas.height) {
          particle.speedY *= -0.8;
          newY = Math.max(0, Math.min(canvas.height, newY));
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(newX, newY, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        return {
          ...particle,
          x: newX,
          y: newY
        };
      })
    );

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animateParticles);
    }
  };

  // Update mood based on music data
  const updateMoodFromTrack = (trackData: any) => {
    const newMood: MoodData = {
      energy: trackData.energy || 50,
      valence: trackData.valence || 50,
      arousal: Math.min(100, (trackData.tempo || 120) / 2),
      dominance: trackData.dominance || 50,
      tempo: trackData.tempo || 120,
      mood: trackData.mood || 'calm'
    };

    setCurrentMood(newMood);
    setSelectedPalette(newMood.mood in MOOD_PALETTES ? newMood.mood : 'default');
  };

  // Get color palette for current mood
  const getCurrentPalette = (): ColorPalette => {
    return MOOD_PALETTES[selectedPalette] || MOOD_PALETTES.default;
  };

  // Start/stop visualization
  const toggleVisualization = () => {
    setIsPlaying(!isPlaying);
  };

  // Update particles when mood or palette changes
  useEffect(() => {
    const palette = getCurrentPalette();
    generateParticles(currentMood, palette);
  }, [currentMood, selectedPalette]);

  // Start animation when playing
  useEffect(() => {
    if (isPlaying) {
      animateParticles();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const palette = getCurrentPalette();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Main Visualization Canvas */}
      <Card className="relative overflow-hidden" style={{ backgroundColor: palette.background }}>
        <CardContent className="p-0">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-96 border rounded-lg"
              style={{ background: `linear-gradient(135deg, ${palette.background}, ${palette.secondary}20)` }}
            />
            
            {/* Overlay Controls */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Button
                onClick={toggleVisualization}
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                className="backdrop-blur-md bg-white/20"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isPlaying ? 'Pause' : 'Play'} Visualization
              </Button>
            </div>

            {/* Mood Indicator */}
            <div className="absolute top-4 right-4">
              <Badge 
                variant="secondary" 
                className="backdrop-blur-md bg-white/20"
                style={{ color: palette.primary }}
              >
                {currentMood.mood.charAt(0).toUpperCase() + currentMood.mood.slice(1)}
              </Badge>
            </div>

            {/* Central Mood Ring */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: currentMood.tempo / 60,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div
                className="w-32 h-32 rounded-full border-4 flex items-center justify-center backdrop-blur-md"
                style={{
                  borderColor: palette.primary,
                  backgroundColor: palette.background
                }}
              >
                <Heart 
                  className="w-8 h-8" 
                  style={{ color: palette.primary }}
                />
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Mood Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Sliders */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Mood Parameters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" />
                  Energy: {currentMood.energy}%
                </label>
                <Slider
                  value={[currentMood.energy]}
                  onValueChange={([value]) => 
                    setCurrentMood(prev => ({ ...prev, energy: value }))
                  }
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4" />
                  Positivity: {currentMood.valence}%
                </label>
                <Slider
                  value={[currentMood.valence]}
                  onValueChange={([value]) => 
                    setCurrentMood(prev => ({ ...prev, valence: value }))
                  }
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4" />
                  Arousal: {currentMood.arousal}%
                </label>
                <Slider
                  value={[currentMood.arousal]}
                  onValueChange={([value]) => 
                    setCurrentMood(prev => ({ ...prev, arousal: value }))
                  }
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tempo: {currentMood.tempo} BPM
                </label>
                <Slider
                  value={[currentMood.tempo]}
                  onValueChange={([value]) => 
                    setCurrentMood(prev => ({ ...prev, tempo: value }))
                  }
                  min={60}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette Selector */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5" />
              Color Palettes
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(MOOD_PALETTES).map(([moodName, palette]) => (
                <motion.button
                  key={moodName}
                  onClick={() => setSelectedPalette(moodName)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPalette === moodName 
                      ? 'border-primary scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: palette.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: palette.accent }}
                    />
                  </div>
                  <span className="text-sm font-medium capitalize">
                    {moodName}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Current Palette Preview */}
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: palette.background }}>
              <h4 className="text-sm font-medium mb-2">Current Palette</h4>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: palette.primary }}
                  title="Primary"
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: palette.secondary }}
                  title="Secondary"
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: palette.accent }}
                  title="Accent"
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: palette.particle }}
                  title="Particle"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Stats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Mood Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: palette.primary + '20' }}
              >
                <Zap className="w-6 h-6" style={{ color: palette.primary }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: palette.primary }}>
                {currentMood.energy}%
              </div>
              <div className="text-sm text-muted-foreground">Energy</div>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: palette.secondary + '20' }}
              >
                <Heart className="w-6 h-6" style={{ color: palette.secondary }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: palette.secondary }}>
                {currentMood.valence}%
              </div>
              <div className="text-sm text-muted-foreground">Positivity</div>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: palette.accent + '20' }}
              >
                <Volume2 className="w-6 h-6" style={{ color: palette.accent }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: palette.accent }}>
                {currentMood.arousal}%
              </div>
              <div className="text-sm text-muted-foreground">Arousal</div>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: palette.primary + '20' }}
              >
                <Brain className="w-6 h-6" style={{ color: palette.primary }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: palette.primary }}>
                {currentMood.tempo}
              </div>
              <div className="text-sm text-muted-foreground">BPM</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}