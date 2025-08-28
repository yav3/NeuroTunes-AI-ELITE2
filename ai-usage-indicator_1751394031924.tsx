import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Clock, Zap } from 'lucide-react';

interface AiUsageStatus {
  usedToday: number;
  limitToday: number;
  canUseAnthropic: boolean;
  resetsAt: string;
}

interface AiUsageIndicatorProps {
  userId: number;
}

export default function AiUsageIndicator({ userId }: AiUsageIndicatorProps) {
  const { data: status } = useQuery<AiUsageStatus>({
    queryKey: ['/api/users', userId, 'ai-status'],
    refetchInterval: 60000 // Refresh every minute
  });

  if (!status) return null;

  const resetTime = new Date(status.resetsAt);
  const timeUntilReset = resetTime.getTime() - Date.now();
  const hoursUntilReset = Math.ceil(timeUntilReset / (1000 * 60 * 60));

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-sm">AI Analysis</span>
            </div>
            <Badge 
              variant={status.canUseAnthropic ? "default" : "secondary"}
              className={status.canUseAnthropic ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
            >
              {status.usedToday}/{status.limitToday} used today
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Resets in {hoursUntilReset}h</span>
          </div>
        </div>
        
        {!status.canUseAnthropic && (
          <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Using smart local analysis (still great results!)
          </div>
        )}
      </CardContent>
    </Card>
  );
}