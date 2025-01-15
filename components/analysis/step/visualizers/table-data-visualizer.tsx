'use client';

import { useCallback } from 'react';
import { TableDataOutput, BoundingBox, Confidence } from '@/types/results';
import { BaseVisualizer, BaseVisualizerProps } from './base-visualizer';

interface TableDataVisualizerProps extends BaseVisualizerProps {
    result: TableDataOutput;
    documentId: string;
    corrections?: Record<string, any> | null;
}

export function TableDataVisualizer({ result, documentId, corrections }: TableDataVisualizerProps) {
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

                // Highlight cells with low confidence
                table.cells.forEach((row, rowIndex) => {
                    row.forEach((cell, colIndex) => {
                        if (cell.confidence.score < 0.8) {
                            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                            const cellWidth = table.bbox.x2 - table.bbox.x1;
                            const cellHeight = (table.bbox.y2 - table.bbox.y1) / table.cells.length;
                            const x = table.bbox.x1 + (cellWidth / row.length) * colIndex;
                            const y = table.bbox.y1 + cellHeight * rowIndex;

                            ctx.fillRect(
                                x,
                                y,
                                cellWidth / row.length,
                                cellHeight
                            );

                            // Draw cell text
                            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                            ctx.font = '10px sans-serif';
                            ctx.fillText(
                                cell.text,
                                x + 2,
                                y + 12
                            );
                        }
                    });
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