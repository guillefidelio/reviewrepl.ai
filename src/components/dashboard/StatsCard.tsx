'use client';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  progress?: number;
}

export function StatsCard({ title, value, subtitle, icon, progress }: StatsCardProps) {
  return (
    <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </dt>
              <dd className="text-2xl font-bold text-card-foreground">
                {value}
              </dd>
              {subtitle && (
                <dd className="text-sm text-muted-foreground">
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
        </div>
        
        {progress !== undefined && (
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

