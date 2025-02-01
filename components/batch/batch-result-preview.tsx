'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Analysis, AnalysisTypeEnum, TableAnalysisStepEnum } from '@/types/analysis';
import { Document } from '@/types/document';
import { TableDetectionVisualizer } from '@/components/analysis/step/visualizers/table-detection-visualizer';
import { TableStructureVisualizer } from '@/components/analysis/step/visualizers/table-structure-visualizer';
import { TableDataVisualizer } from '@/components/analysis/step/visualizers/table-data-visualizer';

interface BatchResultPreviewProps {
    document: Document;
    analysis: Analysis;
    onClose: () => void;
}

export function BatchResultPreview({ document, analysis, onClose }: BatchResultPreviewProps) {
    const [currentPage, setCurrentPage] = useState(1);

    // Get the latest step result for visualization
    const latestStep = analysis.step_results[analysis.step_results.length - 1];

    if (!latestStep || !latestStep.result) {
        return null;
    }

    // Get total pages from the result
    const totalPages = latestStep.result.total_pages_processed || 1;

    // Handle page navigation
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // Select the appropriate visualizer based on step type
    const renderVisualizer = () => {
        switch (latestStep.step_id) {
            case TableAnalysisStepEnum.TABLE_DETECTION:
                return (
                    <TableDetectionVisualizer
                        result={latestStep.result}
                        documentId={document.id}
                        corrections={latestStep.user_corrections}
                        currentPage={currentPage}
                    />
                );
            case TableAnalysisStepEnum.TABLE_STRUCTURE_RECOGNITION:
                return (
                    <TableStructureVisualizer
                        result={latestStep.result}
                        documentId={document.id}
                        corrections={latestStep.user_corrections}
                        currentPage={currentPage}
                    />
                );
            case TableAnalysisStepEnum.TABLE_DATA_EXTRACTION:
                return (
                    <TableDataVisualizer
                        result={latestStep.result}
                        documentId={document.id}
                        corrections={latestStep.user_corrections}
                        currentPage={currentPage}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{document.name}</h3>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="h-[600px]">
                    <div className="relative w-full h-full">
                        {renderVisualizer()}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
} 