import { Card } from '@/components/ui/card';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ErrorDisplayProps {
    error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
    return (
        <Card className="p-6 bg-destructive/10 border-destructive/20">
            <div className="flex items-center gap-3 text-destructive">
                <ExclamationCircleIcon className="w-5 h-5" />
                <p>{error}</p>
            </div>
        </Card>
    );
} 