'use client';

import { useCallback } from 'react';
import { TableStructureOutput, BoundingBox, Confidence } from '@/types/results';
import { BaseVisualizer, BaseVisualizerProps } from './base-visualizer';

interface TableStructureVisualizerProps extends BaseVisualizerProps {
    result: TableStructureOutput;
    documentId: string;
    corrections?: Record<string, any> | null;
}

export function TableStructureVisualizer({ result, documentId, corrections }: TableStructureVisualizerProps) {
    const drawResults = useCallback((
        ctx: CanvasRenderingContext2D,
        drawBoundingBox: (ctx: CanvasRenderingContext2D, bbox: BoundingBox, confidence: Confidence, color: string, label?: string) => void
    ) => {
        result.results.forEach(pageResult => {
            pageResult.tables.forEach((table, tableIndex) => {
                // Draw table outline
                drawBoundingBox(
                    ctx,
                    table.bbox,
                    table.confidence,
                    'rgba(0, 0, 255',
                    `Table ${tableIndex + 1}`
                );

                // Draw cells
                table.cells.forEach(cell => {
                    const color = cell.is_header ? 'rgba(255, 0, 0' : 'rgba(0, 255, 0';
                    drawBoundingBox(ctx, cell.bbox, cell.confidence, color);
                });
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