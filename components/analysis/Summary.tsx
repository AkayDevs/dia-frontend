'use client';

import { useState, useEffect } from 'react';
import { getAnalysisComponent } from './registry';
import { SummaryProps } from './interfaces';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AnalysisSummaryProps extends SummaryProps {
  analysisType: string;
}

export function AnalysisSummary({ analysisType, ...props }: AnalysisSummaryProps) {
  const [Component, setComponent] = useState<React.ComponentType<SummaryProps> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const SummaryComponent = getAnalysisComponent(analysisType, 'Summary');
      setComponent(() => SummaryComponent);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load summary component');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [analysisType]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full max-w-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!Component) {
    return (
      <Alert>
        <AlertDescription>
          No summary component available for this analysis type.
        </AlertDescription>
      </Alert>
    );
  }
  
  return <Component {...props} />;
} 