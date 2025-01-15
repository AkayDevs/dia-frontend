'use client';

import { useCallback } from 'react';
import { TableDetectionOutput, BoundingBox, Confidence } from '@/types/results';
import { BaseVisualizer, BaseVisualizerProps } from './base-visualizer';

interface TableDetectionVisualizerProps extends BaseVisualizerProps {
    result: TableDetectionOutput;
    documentId: string;
    corrections?: Record<string, any> | null;
}

export function TableDetectionVisualizer({ result, documentId, corrections }: TableDetectionVisualizerProps) {
    const drawResults = useCallback((
        ctx: CanvasRenderingContext2D,
        drawBoundingBox: (ctx: CanvasRenderingContext2D, bbox: BoundingBox, confidence: Confidence, color: string, label?: string) => void
    ) => {
        result.results.forEach(pageResult => {
            pageResult.tables.forEach((table, index) => {
                drawBoundingBox(
                    ctx,
                    table.bbox,
                    table.confidence,
                    'rgba(0, 255, 0',
                    `Table ${index + 1}`
                );
            });
        });
    }, [result]);

    return (
        <BaseVisualizer
            drawResults={drawResults}
            documentId={documentId}
            corrections={corrections}
        />
    );
} 