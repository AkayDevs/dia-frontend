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
import {
    DocumentIcon,
    MagnifyingGlassIcon,
    DocumentTextIcon,
    PhotoIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';

interface DocumentSelectionProps {
    selectedDocument: Document | null;
    onSelect: (document: Document) => void;
}

const documentTypeIcons: Record<string, any> = {
    'pdf': DocumentTextIcon,
    'image': PhotoIcon,
    'doc': DocumentIcon,
    'excel': TableCellsIcon,
};

export function DocumentSelection({ selectedDocument, onSelect }: DocumentSelectionProps) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const {
        documents,
        isLoading,
        error,
        fetchDocuments,
        uploadDocument,
        setFilters,
        clearError
    } = useDocumentStore();

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

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
        const Icon = documentTypeIcons[document.type.toLowerCase()] || DocumentIcon;
        const isSelected = selectedDocument?.id === document.id;

        return (
            <Card
                className={`p-4 cursor-pointer transition-all hover:border-primary ${isSelected ? 'border-primary bg-primary/5' : ''
                    }`}
                onClick={() => onSelect(document)}
            >
                <div className="flex items-start space-x-4">
                    <Icon className="w-8 h-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                            {document.name}
                        </p>
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
            <Tabs defaultValue="upload">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload New Document</TabsTrigger>
                    <TabsTrigger value="browse">Browse Documents</TabsTrigger>
                </TabsList>

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

                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                                {filteredDocuments.map((document) => (
                                    <DocumentCard key={document.id} document={document} />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 