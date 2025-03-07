import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentList } from '@/components/documents/document-list';
import { Document } from '@/types/document';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface RecentDocumentsProps {
    documents: Document[];
    onDeleteDocument: (documentId: string) => Promise<void>;
    isLoading: boolean;
}

export function RecentDocuments({ documents, onDeleteDocument, isLoading }: RecentDocumentsProps) {
    const router = useRouter();

    return (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <DocumentDuplicateIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold">Recent Documents</h3>
                        <p className="text-sm text-muted-foreground">
                            Your most recently uploaded documents
                        </p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                    />
                </div>
            ) : (
                <DocumentList
                    documents={documents.slice(0, 5)}
                    onDelete={onDeleteDocument}
                    isCompact={true}
                    className="mb-4"
                />
            )}

            <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/dashboard/documents')}
            >
                View All Documents
            </Button>
        </Card>
    );
} 