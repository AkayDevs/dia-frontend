'use client';

import { useDocumentStore } from '@/store/useDocumentStore';
import { FileIcon, FileTextIcon, ImageIcon, TableIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document, DocumentType } from '@/types/document';

const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
        case 'pdf':
            return FileIcon;
        case 'docx':
            return FileTextIcon;
        case 'xlsx':
            return TableIcon;
        case 'image':
            return ImageIcon;
        default:
            return FileIcon;
    }
};

const getStatusColor = (status: Document['status']) => {
    switch (status) {
        case 'completed':
            return 'text-green-500';
        case 'processing':
            return 'text-blue-500';
        case 'failed':
            return 'text-red-500';
        default:
            return 'text-yellow-500';
    }
};

export function DocumentList() {
    const { documents } = useDocumentStore();

    if (documents.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No documents uploaded yet
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {documents.map((doc) => {
                const Icon = getDocumentIcon(doc.type);
                const statusColor = getStatusColor(doc.status);
                const uploadedAt = formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true });

                return (
                    <div
                        key={doc.id}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{doc.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB • Uploaded {uploadedAt}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`text-sm font-medium capitalize ${statusColor}`}>
                                {doc.status}
                            </span>
                            <button
                                className="text-sm text-primary hover:underline"
                                onClick={() => window.open(doc.url, '_blank')}
                            >
                                View
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
} 