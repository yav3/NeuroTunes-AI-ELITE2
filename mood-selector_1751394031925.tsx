import { Button } from "@/components/ui/button";
import { Smile, Zap, Heart, Flame } from "lucide-react";

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void;
  selectedMood: string | null;
}

const moods = [
  { 
    name: "Calm", 
    value: "calm", 
    icon: Smile, 
    color: "calm-primary" 
  },
  { 
    name: "Energized", 
    value: "energized", 
    icon: Zap, 
    color: "calm-accent" 
  },
  { 
    name: "Focused", 
    value: "focused", 
    icon: Heart, 
    color: "calm-secondary" 
  },
  { 
    name: "Creative", 
    value: "creative", 
    icon: Flame, 
    color: "calm-primary" 
  },
];

export default function MoodSelector({ onMoodSelect, selectedMood }: MoodSelectorProps) {
  return (
    <section className="mb-16">
      <h3 className="text-lg font-light text-foreground mb-8">How are you feeling?</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.value;
          
          return (
            <Button
              key={mood.value}
              variant="ghost"
              onClick={() => onMoodSelect(mood.value)}
              className={`p-8 glass-effect rounded-3xl transition-all text-center group h-auto flex-col space-y-4 hover:bg-calm-surface/50 ${
                isSelected ? 'ring-1 ring-primary/20 bg-calm-primary/5' : ''
              }`}
            >
              <div className={`w-10 h-10 mx-auto bg-${mood.color}/20 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon className={`w-5 h-5 ${mood.color}`} />
              </div>
              <p className="font-light text-foreground text-sm">{mood.name}</p>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
