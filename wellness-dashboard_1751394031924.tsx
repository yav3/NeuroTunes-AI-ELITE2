import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Brain, 
  Heart,
  Zap,
  Moon,
  Sun,
  Activity
} from "lucide-react";
import type { UserStats, UserPreferences } from "@shared/schema";

interface WellnessDashboardProps {
  userStats?: UserStats;
}

export default function WellnessDashboard({ userStats }: WellnessDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Fetch user preferences
  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ['/api/users', 1, 'preferences'],
  });

  const wellnessGoals = [
    {
      title: "Daily Mindfulness",
      current: userStats?.mindfulMinutes || 24,
      target: 30,
      unit: "minutes",
      icon: Brain,
      color: "calm-primary"
    },
    {
      title: "Focus Sessions",
      current: userStats?.focusSessions || 3,
      target: 5,
      unit: "sessions",
      icon: Target,
      color: "calm-secondary"
    },
    {
      title: "Tracks Played",
      current: userStats?.tracksPlayed || 12,
      target: 20,
      unit: "tracks",
      icon: Activity,
      color: "calm-accent"
    }
  ];

  const moodInsights = [
    { mood: "Calm", percentage: 45, sessions: 8 },
    { mood: "Focused", percentage: 30, sessions: 5 },
    { mood: "Energized", percentage: 15, sessions: 3 },
    { mood: "Creative", percentage: 10, sessions: 2 }
  ];

  const weeklyProgress = [
    { day: "Mon", minutes: 25 },
    { day: "Tue", minutes: 30 },
    { day: "Wed", minutes: 20 },
    { day: "Thu", minutes: 35 },
    { day: "Fri", minutes: 28 },
    { day: "Sat", minutes: 40 },
    { day: "Sun", minutes: 24 }
  ];

  return (
    <div className="flex-1 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-foreground mb-2">Wellness Dashboard</h1>
        <p className="text-muted-foreground">Track your mindfulness journey</p>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wellnessGoals.map((goal, index) => {
          const Icon = goal.icon;
          const percentage = (goal.current / goal.target) * 100;
          
          return (
            <Card key={index} className="glass-effect border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-light text-foreground">{goal.title}</CardTitle>
                  <Icon className={`w-5 h-5 ${goal.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-light text-foreground">
                    {goal.current} <span className="text-sm text-muted-foreground">/ {goal.target} {goal.unit}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {percentage >= 100 ? "Goal achieved!" : `${Math.round(percentage)}% complete`}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="glass-effect rounded-2xl p-1 mb-8">
          <TabsTrigger value="insights" className="rounded-xl">Insights</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-xl">Calendar</TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-xl">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Progress */}
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle className="font-light text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 calm-primary" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyProgress.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{day.day}</span>
                      <div className="flex items-center space-x-3 flex-1 mx-4">
                        <Progress value={(day.minutes / 40) * 100} className="h-2" />
                        <span className="text-sm font-mono text-foreground min-w-[3rem]">{day.minutes}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mood Insights */}
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle className="font-light text-foreground flex items-center gap-2">
                  <Heart className="w-5 h-5 calm-secondary" />
                  Mood Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodInsights.map((insight, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{insight.mood}</span>
                        <span className="text-muted-foreground">{insight.sessions} sessions</span>
                      </div>
                      <Progress value={insight.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle className="font-light text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 calm-accent" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-calm-surface/30 rounded-2xl">
                  <div className="w-10 h-10 bg-calm-primary/20 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 calm-primary" />
                  </div>
                  <div>
                    <p className="font-light text-foreground">7-Day Streak</p>
                    <p className="text-xs text-muted-foreground">Daily mindfulness</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-calm-surface/30 rounded-2xl">
                  <div className="w-10 h-10 bg-calm-secondary/20 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 calm-secondary" />
                  </div>
                  <div>
                    <p className="font-light text-foreground">Focus Master</p>
                    <p className="text-xs text-muted-foreground">50+ focus sessions</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-calm-surface/30 rounded-2xl">
                  <div className="w-10 h-10 bg-calm-accent/20 rounded-full flex items-center justify-center">
                    <Moon className="w-5 h-5 calm-accent" />
                  </div>
                  <div>
                    <p className="font-light text-foreground">Night Owl</p>
                    <p className="text-xs text-muted-foreground">Evening sessions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle className="font-light text-foreground">Mindfulness Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="space-y-6">
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle className="font-light text-foreground">Wellness Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-light text-foreground mb-3">Preferred Moods</h4>
                  <div className="flex flex-wrap gap-2">
                    {preferences?.preferredMoods?.map((mood, index) => (
                      <span key={index} className="px-3 py-1 bg-calm-primary/20 text-calm-primary rounded-full text-sm">
                        {mood}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-light text-foreground mb-3">Wellness Goals</h4>
                  <div className="flex flex-wrap gap-2">
                    {preferences?.wellnessGoals?.map((goal, index) => (
                      <span key={index} className="px-3 py-1 bg-calm-secondary/20 text-calm-secondary rounded-full text-sm">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-light text-foreground mb-3">Preferred Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {preferences?.preferredGenres?.map((genre, index) => (
                      <span key={index} className="px-3 py-1 bg-calm-accent/20 text-calm-accent rounded-full text-sm">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}