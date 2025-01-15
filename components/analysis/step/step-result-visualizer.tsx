'use client';

import { TableDetectionOutput, TableStructureOutput, TableDataOutput, StepOutput } from '@/types/results';
import { TableDetectionVisualizer } from './visualizers/table-detection-visualizer';
import { TableStructureVisualizer } from './visualizers/table-structure-visualizer';
import { TableDataVisualizer } from './visualizers/table-data-visualizer';

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
    console.log('stepId', stepId);
    // Select the appropriate visualizer based on step type
    if (stepName.includes('Table Detection')) {
        console.log('result', result);

        return (
            <TableDetectionVisualizer
                result={result as TableDetectionOutput}
                documentId={documentId}
                corrections={corrections}
            />
        );
    }

    if (stepName.includes('Table Structure')) {
        return (
            <TableStructureVisualizer
                result={result as TableStructureOutput}
                documentId={documentId}
                corrections={corrections}
            />
        );
    }

    if (stepName.includes('Table Data')) {
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