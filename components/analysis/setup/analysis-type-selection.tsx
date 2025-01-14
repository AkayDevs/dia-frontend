'use client';

import { useEffect } from 'react';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Document } from '@/types/document';
import { AnalysisType } from '@/types/analysis';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    TableCellsIcon,
    DocumentTextIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface AnalysisTypeSelectionProps {
    selectedDocument: Document | null;
    selectedAnalysisType: AnalysisType | null;
    onSelect: (analysisType: AnalysisType) => void;
}

const analysisTypeIcons: Record<string, any> = {
    'table_detection': TableCellsIcon,
    'text_extraction': DocumentTextIcon,
    'template_conversion': DocumentDuplicateIcon,
};

export function AnalysisTypeSelection({
    selectedDocument,
    selectedAnalysisType,
    onSelect,
}: AnalysisTypeSelectionProps) {
    const {
        analysisTypes,
        isLoading,
        error,
        fetchAnalysisTypes,
    } = useAnalysisStore();

    useEffect(() => {
        fetchAnalysisTypes();
    }, [fetchAnalysisTypes]);

    const isAnalysisTypeCompatible = (analysisType: AnalysisType) => {
        if (!selectedDocument) return false;
        return analysisType.supported_document_types.includes(selectedDocument.type);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="w-8 h-8 rounded" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-3 w-[150px]" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-destructive">
                <p>Failed to load analysis types. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-lg font-medium">Select Analysis Type</h2>
                <p className="text-sm text-muted-foreground">
                    Choose the type of analysis you want to perform on your document.
                </p>
            </div>

            <RadioGroup
                value={selectedAnalysisType?.id}
                onValueChange={(value) => {
                    const analysisType = analysisTypes.find(type => type.id === value);
                    if (analysisType) {
                        onSelect(analysisType);
                    }
                }}
            >
                <div className="space-y-3">
                    {analysisTypes.map((analysisType) => {
                        const Icon = analysisTypeIcons[analysisType.name] || DocumentTextIcon;
                        const isCompatible = isAnalysisTypeCompatible(analysisType);

                        return (
                            <Label
                                key={analysisType.id}
                                className={`flex items-start space-x-4 p-4 rounded-lg border cursor-pointer transition-colors ${!isCompatible
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-muted/50'
                                    }`}
                            >
                                <RadioGroupItem
                                    value={analysisType.id}
                                    disabled={!isCompatible}
                                    className="mt-1"
                                />
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center">
                                        <Icon className="w-5 h-5 mr-2 text-muted-foreground" />
                                        <span className="font-medium">
                                            {analysisType.name.split('_').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </span>
                                    </div>
                                    {analysisType.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {analysisType.description}
                                        </p>
                                    )}
                                    {!isCompatible && (
                                        <p className="text-sm text-destructive">
                                            Not compatible with {selectedDocument?.type.toUpperCase()} files
                                        </p>
                                    )}
                                </div>
                            </Label>
                        );
                    })}
                </div>
            </RadioGroup>
        </div>
    );
} 