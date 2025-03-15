import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AnalysisEmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    showRefresh?: boolean;
    onRefresh?: () => Promise<void>;
}

export const AnalysisEmptyState: React.FC<AnalysisEmptyStateProps> = ({
    title,
    description,
    actionLabel,
    onAction,
    showRefresh = false,
    onRefresh
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
            <div className="flex gap-3">
                {actionLabel && onAction && (
                    <Button onClick={onAction}>{actionLabel}</Button>
                )}
                {showRefresh && onRefresh && (
                    <Button variant="outline" onClick={onRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                )}
            </div>
        </div>
    );
}; 