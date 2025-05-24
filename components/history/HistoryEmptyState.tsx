import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HistoryEmptyStateProps {
    hasFilters: boolean;
    onStartAnalysis: () => void;
}

export function HistoryEmptyState({ hasFilters, onStartAnalysis }: HistoryEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No analysis records found</p>
            <p className="text-sm text-muted-foreground mt-1">
                {hasFilters
                    ? 'Try adjusting your search or filters'
                    : 'Start by analyzing some documents'}
            </p>
            {!hasFilters && (
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={onStartAnalysis}
                >
                    Start Analysis
                </Button>
            )}
        </div>
    );
} 