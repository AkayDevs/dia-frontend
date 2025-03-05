'use client';

import { useState, useEffect } from 'react';
import { getAnalysisComponent } from './registry';
import { OptionsProps } from './interfaces';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AnalysisOptionsProps extends OptionsProps {
  analysisType: string;
}

export function AnalysisOptions({ analysisType, ...props }: AnalysisOptionsProps) {
  const [Component, setComponent] = useState<React.ComponentType<OptionsProps> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const OptionsComponent = getAnalysisComponent(analysisType, 'Options');
      setComponent(() => OptionsComponent);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load options component');
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
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
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
          No options component available for this analysis type.
        </AlertDescription>
      </Alert>
    );
  }
  
  return <Component {...props} />;
} 