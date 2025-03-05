'use client';

import { useState, useEffect } from 'react';
import { getAnalysisComponent } from './registry';
import { StepperProps } from './interfaces';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AnalysisStepperProps extends StepperProps {
    analysisType: string;
}

export function AnalysisStepper({ analysisType, ...props }: AnalysisStepperProps) {
    const [Component, setComponent] = useState<React.ComponentType<StepperProps> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        try {
            const StepperComponent = getAnalysisComponent(analysisType, 'Stepper');
            setComponent(() => StepperComponent);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load stepper component');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [analysisType]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full max-w-md" />
                <div className="flex items-center space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
                <Skeleton className="h-40 w-full" />
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
                    No stepper component available for this analysis type.
                </AlertDescription>
            </Alert>
        );
    }

    return <Component {...props} />;
} 