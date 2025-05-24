import React from 'react';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HistoryHeaderProps {
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function HistoryHeader({ onRefresh, isRefreshing }: HistoryHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
                <p className="text-muted-foreground mt-2">
                    View and manage your document analysis history
                </p>
            </div>
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onRefresh}
                disabled={isRefreshing}
            >
                <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
        </div>
    );
} 