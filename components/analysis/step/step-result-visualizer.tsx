'use client';

import { TableDetectionOutput, TableStructureOutput, TableDataOutput, StepOutput } from '@/types/results';
import { TableDetectionVisualizer } from './visualizers/table-detection-visualizer';
import { TableStructureVisualizer } from './visualizers/table-structure-visualizer';
import { TableDataVisualizer } from './visualizers/table-data-visualizer';
import { TableAnalysisStepEnum } from '@/types/analysis';

interface StepResultVisualizerProps {
    stepId: string;
    result: StepOutput | null;
    corrections?: Record<string, any> | null;
    documentId: string;
    stepName: string;
}

export function StepResultVisualizer({
    stepId,
    result,
    corrections,
    documentId,
    stepName
}: StepResultVisualizerProps) {
    if (!result) return null;
    console.log('Step Name', stepName);
    // Select the appropriate visualizer based on step type
    if (stepName === TableAnalysisStepEnum.TABLE_DETECTION) {
        return (
            <TableDetectionVisualizer
                result={result as TableDetectionOutput}
                documentId={documentId}
                corrections={corrections}
            />
        );
    }

    if (stepName === TableAnalysisStepEnum.TABLE_STRUCTURE_RECOGNITION) {
        return (
            <TableStructureVisualizer
                result={result as TableStructureOutput}
                documentId={documentId}
                corrections={corrections}
            />
        );
    }

    if (stepName === TableAnalysisStepEnum.TABLE_DATA_EXTRACTION) {
        return (
            <TableDataVisualizer
                result={result as TableDataOutput}
                documentId={documentId}
                corrections={corrections}
            />
        );
    }

    return null;
} 