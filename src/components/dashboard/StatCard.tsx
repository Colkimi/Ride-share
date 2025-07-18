import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, changeType, icon, className }: StatCardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "text-xs mt-1",
            changeType === 'increase' ? "text-green-600" : "text-red-600"
          )}>
            {changeType === 'increase' ? '↑' : '↓'} {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
