'use client';

import { useState, useEffect } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { Document } from '@/types/document';
import { UploadHandler } from '@/components/ui/upload-handler';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { getDocumentTypeIcon } from '@/constants/icons';
import { Loader2 } from 'lucide-react';
interface DocumentSelectionProps {
    selectedDocument: Document | null;
    onSelect: (document: Document) => void;
}

export function DocumentSelection({ selectedDocument, onSelect }: DocumentSelectionProps) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const {
        documents,
        fetchDocuments,
        uploadDocument,
        isLoading,
    } = useDocumentStore();

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments, documents]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-4 w-4 animate-spin" />
            </div>
        );
    }

    const handleUploadSuccess = async (file: File) => {
        try {
            const document = await uploadDocument(file);
            onSelect(document);
            toast({
                title: 'Success',
                description: 'Document uploaded successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to upload document',
                variant: 'destructive',
            });
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const DocumentCard = ({ document }: { document: Document }) => {
        const Icon = getDocumentTypeIcon(document.type);
        const isSelected = selectedDocument?.id === document.id;

        return (
            <Card
                className={`p-4 cursor-pointer transition-all hover:shadow-sm ${isSelected ? 'border-primary shadow-sm' : 'hover:border-primary/50'}`}
                onClick={() => onSelect(document)}
            >
                <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-md ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                        {Icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground truncate">
                                {document.name}
                            </p>
                            {isSelected && (
                                <CheckCircleIcon className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                                {document.type.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-lg font-medium">Select Document</h2>
                <p className="text-sm text-muted-foreground">
                    Choose a document to analyze or upload a new one.
                </p>
            </div>

            <Tabs defaultValue="browse">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="browse">Browse Documents</TabsTrigger>
                    <TabsTrigger value="upload">Upload New Document</TabsTrigger>
                </TabsList>

                <TabsContent value="browse" className="mt-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <ScrollArea className="h-[400px]">
                            <div className="space-y-3 pr-4">
                                {filteredDocuments.length > 0 ? (
                                    filteredDocuments.map((document, index) => (
                                        <motion.div
                                            key={document.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <DocumentCard document={document} />
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No documents found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </TabsContent>

                <TabsContent value="upload" className="mt-6">
                    <UploadHandler
                        onSuccess={handleUploadSuccess}
                        accept={{
                            'application/pdf': ['.pdf'],
                            'image/*': ['.png', '.jpg', '.jpeg'],
                            'application/msword': ['.doc', '.docx'],
                            'application/vnd.ms-excel': ['.xls', '.xlsx'],
                        }}
                        maxSize={10 * 1024 * 1024} // 10MB
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
} 