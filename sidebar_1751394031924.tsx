import { Music, Eye, Heart, List, Plus, MessageCircle, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation } from "wouter";
import type { UserStats } from "@shared/schema";

interface SidebarProps {
  userStats?: UserStats;
}

export default function Sidebar({ userStats }: SidebarProps) {
  const [location] = useLocation();
  const mindfulProgress = userStats ? ((userStats.mindfulMinutes || 0) / 50) * 100 : 48;
  const focusProgress = userStats ? ((userStats.focusSessions || 0) / 5) * 100 : 60;

  const navItems = [
    { path: "/", icon: Eye, label: "Discover" },
    { path: "/library", icon: List, label: "Library" },
    { path: "/journey", icon: TrendingUp, label: "Journey" },
    { path: "/what-i-need", icon: MessageCircle, label: "What I Need" },
    { path: "/wellness-goals", icon: Target, label: "Wellness Goals" },
    { path: "/favorites", icon: Heart, label: "Favorites" },
    { path: "/create", icon: Plus, label: "Create" },
  ];

  return (
    <aside className="w-72 glass-effect hidden lg:block">
      <div className="p-8">
        {/* Minimal Logo */}
        <Link href="/">
          <div className="flex items-center space-x-3 mb-12 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-calm-primary/30 rounded-full flex items-center justify-center">
              <Music className="w-4 h-4 calm-primary" />
            </div>
            <div>
              <h1 className="text-lg font-light text-foreground">Welcony + NeuralPositive</h1>
              <p className="text-xs text-muted-foreground">Wellness Music</p>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-4 mb-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start space-x-3 px-4 py-4 rounded-2xl font-light text-sm transition-all ${
                    isActive 
                      ? 'calm-primary bg-calm-primary/5' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-calm-surface/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Progress */}
        <div className="p-6 bg-calm-surface/30 rounded-3xl">
          <h3 className="font-light text-foreground mb-6 text-sm">Today's journey</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-3">
                <span className="text-muted-foreground">Mindful minutes</span>
                <span className="font-medium calm-primary">
                  {userStats?.mindfulMinutes || 24}
                </span>
              </div>
              <Progress value={mindfulProgress} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-3">
                <span className="text-muted-foreground">Focus sessions</span>
                <span className="font-medium calm-secondary">
                  {userStats?.focusSessions || 3}
                </span>
              </div>
              <Progress value={focusProgress} className="h-1" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
