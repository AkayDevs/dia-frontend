import { Button } from '@/components/ui/button';
import { ChartBarIcon, TrashIcon } from '@heroicons/react/24/outline';

interface BatchActionsProps {
    selectedCount: number;
    onAnalyze: () => void;
    onDelete: () => void;
}

export const BatchActions = ({ selectedCount, onAnalyze, onDelete }: BatchActionsProps) => {
    if (selectedCount === 0) return null;

    return (
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
                {selectedCount} document{selectedCount > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAnalyze}
                >
                    <ChartBarIcon className="w-4 h-4 mr-2" />
                    Analyze Selected
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Selected
                </Button>
            </div>
        </div>
    );
}; 