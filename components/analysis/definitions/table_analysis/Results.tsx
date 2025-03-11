import React, { useState, useEffect } from 'react';
import { BaseResultsProps } from '../base';
import { TableAnalysisStepCode } from '@/enums/analysis';
import {
    isTableDetectionResult,
    isTableStructureResult,
    isTableDataResult
} from '@/types/analysis/registry';
import { TABLE_ANALYSIS_STEPS } from '@/constants/analysis/definitions/table-analysis';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    FileSpreadsheet,
    Image as ImageIcon,
    Table as TableIcon,
    Grid,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Eye,
    EyeOff
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getAnalysisSteps } from '@/constants/analysis';
import { getStepComponent } from '@/components/analysis/registry';
import { StepComponentType } from '../base';

/**
 * Error component for displaying analysis errors
 * Provides a consistent error UI with appropriate messaging
 */
interface ErrorDisplayProps {
    title?: string;
    message?: string;
    suggestion?: string;
    retry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    title = "Error Loading Results",
    message = "An error occurred while processing the table analysis results.",
    suggestion = "Please try again or select a different step.",
    retry
}) => {
    return (
        <div className="space-y-4">
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-medium">{title}</AlertTitle>
                <AlertDescription className="mt-2">
                    <p>{message}</p>
                    <p className="text-sm mt-1">{suggestion}</p>
                </AlertDescription>
            </Alert>

            {retry && (
                <div className="flex justify-start mt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={retry}
                        className="gap-2"
                    >
                        <RotateCw className="h-3.5 w-3.5" />
                        Retry
                    </Button>
                </div>
            )}
        </div>
    );
};


/**
 * Enhanced Table Analysis Results Component
 * Provides step-specific visualization of table analysis results
 */
const TableResults: React.FC<BaseResultsProps> = ({
    analysisId,
    analysisType,
    stepCode,
    stepResult,
    documentId,
    pageNumber = 1,
    showControls = true,
    onExport
}) => {
    // Use provided stepResult directly
    const resultData = stepResult;
    if (!resultData) {
        return <ErrorDisplay title="No Results Available" message="No results found for this step." suggestion="Please try again or select a different step." />;
    }

    // Get step name based on step code
    const stepName = getAnalysisSteps(analysisType).find(step => step.step_code === stepCode)?.name;

    // Handle export if callback is provided
    const handleExport = (format: string) => {
        if (onExport) {
            onExport(format);
        } else {
            // Default export behavior
            alert(`Exporting ${stepName} results as ${format}`);
        }
    };

    // Normalize step code to handle different formats
    const normalizeStepCode = (code: string): TableAnalysisStepCode => {
        // Handle both formats: 'extract' and 'table_analysis.table_detection'
        if (code === 'extract' || code === 'detection' || code.endsWith('table_detection')) {
            return TableAnalysisStepCode.TABLE_DETECTION;
        } else if (code === 'structure' || code === 'extraction' || code.endsWith('table_structure')) {
            return TableAnalysisStepCode.TABLE_STRUCTURE;
        } else if (code === 'data' || code === 'validation' || code.endsWith('table_data')) {
            return TableAnalysisStepCode.TABLE_DATA;
        }

        // Handle fully qualified step codes
        if (code.includes('.')) {
            const parts = code.split('.');
            const lastPart = parts[parts.length - 1];
            return normalizeStepCode(lastPart);
        }

        // Default to table detection if unknown
        return TableAnalysisStepCode.TABLE_DETECTION;
    };

    const normalizedStepCode = normalizeStepCode(stepCode);

    // Get the appropriate step component based on the step code and component type
    const StepVisualizer = getStepComponent(analysisType, normalizedStepCode, StepComponentType.VISUALIZER);

    // Find the step definition
    const step = getAnalysisSteps(analysisType).find(s => s.step_code === normalizedStepCode);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-bold">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                                    {stepName} Results
                                </div>
                            </CardTitle>
                            <CardDescription>
                                Analysis ID: {analysisId} • Step: {stepName}
                            </CardDescription>
                        </div>
                        {showControls && (
                            <div className="flex items-center space-x-2">
                                {normalizedStepCode === TableAnalysisStepCode.TABLE_DATA && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExport('csv')}
                                        title="Download Data"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Render the appropriate component based on the step code */}
                    {step ? (
                        <StepVisualizer
                            analysisId={analysisId}
                            analysisType={analysisType}
                            step={step}
                            // Use type assertion to pass additional props
                            {...{ result: resultData, pageNumber: pageNumber - 1 } as any}
                        />
                    ) : (
                        <div className="p-4 text-center">
                            <p>No visualization available for this step.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TableResults;