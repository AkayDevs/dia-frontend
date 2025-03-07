import { Button } from '@/components/ui/button';
import { ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface AnalysisEmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    showRefresh?: boolean;
    onRefresh?: () => void;
}

export const AnalysisEmptyState = ({
    title,
    description,
    actionLabel,
    onAction,
    showRefresh = false,
    onRefresh
}: AnalysisEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-muted/30 p-6 rounded-full mb-4">
                <ChartBarIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>

            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-md mb-6">{description}</p>

            <div className="flex gap-3">
                {actionLabel && onAction && (
                    <Button onClick={onAction}>
                        {actionLabel}
                    </Button>
                )}

                {showRefresh && onRefresh && (
                    <Button variant="outline" onClick={onRefresh}>
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                )}
            </div>
        </div>
    );
}; 