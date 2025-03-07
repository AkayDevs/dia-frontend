import { Button } from '@/components/ui/button';
import { FolderIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
    isFiltered: boolean;
    filterDescription?: string;
}

export const EmptyState = ({ isFiltered, filterDescription }: EmptyStateProps) => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-muted/30 p-6 rounded-full mb-4">
                <FolderIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>

            <h3 className="text-xl font-semibold mb-2">
                {isFiltered ? 'No matching documents' : 'No documents yet'}
            </h3>

            <p className="text-muted-foreground text-center max-w-md mb-6">
                {isFiltered
                    ? filterDescription || 'Try adjusting your filters to find what you\'re looking for.'
                    : 'Upload your first document to start analyzing and extracting insights.'}
            </p>

            {!isFiltered && (
                <Button
                    onClick={() => router.push('/dashboard/upload')}
                    className="gap-2"
                >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Upload Your First Document
                </Button>
            )}

            {isFiltered && (
                <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/documents')}
                >
                    Clear All Filters
                </Button>
            )}
        </div>
    );
}; 