import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentList } from '@/components/documents/document-list';
import { Document } from '@/types/document';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecentDocumentsProps {
    documents: Document[];
    onDeleteDocument: (documentId: string) => Promise<void>;
    isLoading: boolean;
    className?: string;
}

export function RecentDocuments({ documents, onDeleteDocument, isLoading, className = '' }: RecentDocumentsProps) {
    const router = useRouter();

    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <div className="p-6 pb-4 border-b">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <DocumentDuplicateIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold">Recent Documents</h3>
                        <p className="text-sm text-muted-foreground">
                            Your most recently uploaded documents
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 py-4">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center h-[250px]">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                        />
                    </div>
                ) : (
                    <ScrollArea className="h-[250px] w-full pr-4">
                        <DocumentList
                            documents={documents.slice(0, 5)}
                            onDelete={onDeleteDocument}
                            isCompact={true}
                            isLoading={isLoading}
                        />
                    </ScrollArea>
                )}
            </div>

            <div className="p-6 pt-4 mt-auto border-t">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/dashboard/documents')}
                >
                    View All Documents
                </Button>
            </div>
        </Card>
    );
} 