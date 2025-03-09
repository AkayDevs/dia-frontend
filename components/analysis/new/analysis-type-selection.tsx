'use client';

import { useEffect } from 'react';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Document } from '@/types/document';
import { AnalysisDefinition, AnalysisDefinitionInfo } from '@/types/analysis/configs';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentType } from '@/enums/document';
import { getAnalysisIcon } from '@/constants/analysis/registry';

interface AnalysisTypeSelectionProps {
    selectedDocument: Document | null;
    selectedAnalysisType: AnalysisDefinition | null;
    onSelect: (analysisType: AnalysisDefinition) => void;
}

export function AnalysisTypeSelection({
    selectedDocument,
    selectedAnalysisType,
    onSelect,
}: AnalysisTypeSelectionProps) {
    const {
        analysisDefinitions,
        isLoading,
        error,
        fetchAnalysisDefinitions,
    } = useAnalysisStore();

    useEffect(() => {
        fetchAnalysisDefinitions();
    }, [fetchAnalysisDefinitions]);

    const isAnalysisTypeCompatible = (analysisType: AnalysisDefinitionInfo): boolean => {
        if (!selectedDocument) return false;
        return analysisType.supported_document_types.includes(selectedDocument.type as DocumentType);
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

            <ScrollArea className="h-[400px] pr-4">
                <RadioGroup
                    value={selectedAnalysisType?.id}
                    onValueChange={(value) => {
                        const analysisType = analysisDefinitions.find((type: AnalysisDefinitionInfo) => type.id === value);
                        if (analysisType) {
                            onSelect(analysisType as AnalysisDefinition);
                        }
                    }}
                >
                    <div className="space-y-3">
                        {analysisDefinitions.map((analysisType: AnalysisDefinitionInfo) => {
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
                                            <div dangerouslySetInnerHTML={{
                                                __html: getAnalysisIcon(analysisType.code)?.icon || ''
                                            }} className="w-5 h-5 mr-2 text-muted-foreground" />
                                            <span className="font-medium">
                                                {analysisType.name.split('_').map((word: string) =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </span>
                                        </div>
                                        {analysisType.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {analysisType.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {analysisType.supported_document_types.map((type: DocumentType) => (
                                                <span
                                                    key={type}
                                                    className={`text-xs px-2 py-0.5 rounded-full ${selectedDocument?.type === type
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-muted text-muted-foreground'
                                                        }`}
                                                >
                                                    {type.toString().toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                        {!isCompatible && (
                                            <p className="text-sm text-destructive mt-2">
                                                Not compatible with {selectedDocument?.type.toString().toUpperCase()} files
                                            </p>
                                        )}
                                    </div>
                                </Label>
                            );
                        })}
                    </div>
                </RadioGroup>
            </ScrollArea>
        </div>
    );
} 