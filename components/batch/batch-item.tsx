import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';
import { AnalysisRunWithResults } from '@/types/analysis/base';
import { AnalysisStatus } from '@/enums/analysis';

export interface BatchItemStatus {
    status: 'pending' | 'uploading' | 'uploaded' | 'analyzing' | 'completed' | 'failed';
    progress: number;
    error?: string;
}

export interface BatchItem {
    id: string;
    file: File;
    document?: Document;
    analysis?: AnalysisRunWithResults;
    status: BatchItemStatus['status'];
    progress: number;
    error?: string;
}

interface BatchItemProps {
    item: BatchItem;
    isSelected: boolean;
    isProcessing: boolean;
    onSelect: (item: BatchItem) => void;
    onRemove: (id: string) => void;
}

export const BatchItem = ({
    item,
    isSelected,
    isProcessing,
    onSelect,
    onRemove
}: BatchItemProps) => {
    // Get status badge styling
    const getStatusBadge = (status: BatchItemStatus['status']) => {
        switch (status) {
            case 'completed':
                return {
                    icon: <CheckCircle className="h-4 w-4" />,
                    className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                };
            case 'failed':
                return {
                    icon: <XCircle className="h-4 w-4" />,
                    className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                };
            case 'analyzing':
            case 'uploading':
                return {
                    icon: <Clock className="h-4 w-4" />,
                    className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                };
            default:
                return {
                    icon: <Clock className="h-4 w-4" />,
                    className: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                };
        }
    };

    const statusBadge = getStatusBadge(item.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn(
                "p-4 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors",
                isSelected && "bg-accent"
            )}
            onClick={() => onSelect(item)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                        <p className="font-medium">{item.document?.name || item.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {((item.document?.size || item.file.size) / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge
                        variant="secondary"
                        className={cn(
                            'gap-1 capitalize',
                            statusBadge.className
                        )}
                    >
                        {statusBadge.icon}
                        {item.status}
                    </Badge>
                    {!isProcessing && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(item.id);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            {item.progress > 0 && item.progress < 100 && (
                <Progress value={item.progress} className="mt-2" />
            )}
            {item.error && (
                <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <p>{item.error}</p>
                </div>
            )}
        </motion.div>
    );
}; 