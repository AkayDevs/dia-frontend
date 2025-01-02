'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Document } from '@/types/document';
import { FileIcon, FileTextIcon, ImageIcon, TableIcon, CheckCircle } from 'lucide-react';

interface DocumentPreviewProps {
    document: Document;
}

interface DocumentMetadata {
    pageCount?: number;
    hasTables?: boolean;
    hasImages?: boolean;
    wordCount?: number;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
    const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/v1/documents/${document.id}/metadata`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch metadata');
                }

                const data = await response.json();
                setMetadata(data);
            } catch (error) {
                console.error('Error fetching metadata:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetadata();
    }, [document.id]);

    const getDocumentIcon = () => {
        switch (document.type) {
            case 'pdf':
                return <FileIcon className="h-6 w-6" />;
            case 'docx':
                return <FileTextIcon className="h-6 w-6" />;
            case 'xlsx':
                return <TableIcon className="h-6 w-6" />;
            case 'image':
                return <ImageIcon className="h-6 w-6" />;
            default:
                return <FileIcon className="h-6 w-6" />;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                    {getDocumentIcon()}
                </div>
                <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                        {document.name}
                        <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Uploaded
                        </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {(document.size / 1024 / 1024).toFixed(2)} MB • {document.type.toUpperCase()}
                    </p>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                        </>
                    ) : metadata ? (
                        <>
                            {metadata.pageCount !== undefined && (
                                <div>
                                    <p className="text-sm font-medium">Pages</p>
                                    <p className="text-2xl">{metadata.pageCount}</p>
                                </div>
                            )}
                            {metadata.wordCount !== undefined && (
                                <div>
                                    <p className="text-sm font-medium">Words</p>
                                    <p className="text-2xl">{metadata.wordCount.toLocaleString()}</p>
                                </div>
                            )}
                            {metadata.hasTables !== undefined && (
                                <div>
                                    <p className="text-sm font-medium">Tables</p>
                                    <p className="text-2xl">{metadata.hasTables ? 'Yes' : 'No'}</p>
                                </div>
                            )}
                            {metadata.hasImages !== undefined && (
                                <div>
                                    <p className="text-sm font-medium">Images</p>
                                    <p className="text-2xl">{metadata.hasImages ? 'Yes' : 'No'}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground col-span-2">
                            Metadata not available
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 