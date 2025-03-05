'use client';

import { useState, useEffect } from 'react';
import { getAnalysisComponent } from './registry';
import { ResultsProps } from './interfaces';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AnalysisResultsProps extends ResultsProps {
    analysisType: string;
}

export function AnalysisResults({ analysisType, ...props }: AnalysisResultsProps) {
    const [Component, setComponent] = useState<React.ComponentType<ResultsProps> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        try {
            const ResultsComponent = getAnalysisComponent(analysisType, 'Results');
            setComponent(() => ResultsComponent);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load results component');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [analysisType]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full max-w-md" />
                <Skeleton className="h-60 w-full" />
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
                    No results component available for this analysis type.
                </AlertDescription>
            </Alert>
        );
    }

    return <Component {...props} />;
} 