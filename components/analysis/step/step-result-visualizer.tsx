'use client';

import { useEffect, useRef, useState } from 'react';
import { TableDetectionOutput, TableStructureOutput, TableDataOutput } from '@/types/results';
import { Card } from '@/components/ui/card';

interface StepResultVisualizerProps {
    stepId: string;
    result: Record<string, any> | null;
    corrections?: Record<string, any> | null | undefined;
}

export function StepResultVisualizer({
    stepId,
    result,
    corrections
}: StepResultVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scale, setScale] = useState(1);
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!result) return;

        // Load and draw the document image
        const img = new Image();
        img.src = result.document_url; // Assuming the backend provides the document URL
        img.onload = () => {
            setImage(img);
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // Set canvas size to match image
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image
                ctx.drawImage(img, 0, 0);

                // Draw results based on step type
                if (stepId.includes('table_detection')) {
                    drawTableDetectionResults(ctx, result as TableDetectionOutput);
                } else if (stepId.includes('table_structure')) {
                    drawTableStructureResults(ctx, result as TableStructureOutput);
                } else if (stepId.includes('table_data')) {
                    drawTableDataResults(ctx, result as TableDataOutput);
                }

                // Draw corrections if any
                if (corrections) {
                    drawCorrections(ctx, corrections);
                }
            }
        };
    }, [result, corrections, stepId]);

    const drawTableDetectionResults = (
        ctx: CanvasRenderingContext2D,
        result: TableDetectionOutput
    ) => {
        result.results.forEach(pageResult => {
            pageResult.tables.forEach(table => {
                const { bbox, confidence } = table;

                // Draw bounding box
                ctx.strokeStyle = `rgba(0, 255, 0, ${confidence.score})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);

                // Draw confidence score
                ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
                ctx.font = '12px sans-serif';
                ctx.fillText(
                    `${Math.round(confidence.score * 100)}%`,
                    bbox.x1,
                    bbox.y1 - 5
                );
            });
        });
    };

    const drawTableStructureResults = (
        ctx: CanvasRenderingContext2D,
        result: TableStructureOutput
    ) => {
        result.results.forEach(pageResult => {
            pageResult.tables.forEach(table => {
                // Draw table outline
                ctx.strokeStyle = 'rgba(0, 0, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    table.bbox.x1,
                    table.bbox.y1,
                    table.bbox.x2 - table.bbox.x1,
                    table.bbox.y2 - table.bbox.y1
                );

                // Draw cells
                table.cells.forEach(cell => {
                    ctx.strokeStyle = cell.is_header
                        ? 'rgba(255, 0, 0, 0.8)'
                        : 'rgba(0, 255, 0, 0.8)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(
                        cell.bbox.x1,
                        cell.bbox.y1,
                        cell.bbox.x2 - cell.bbox.x1,
                        cell.bbox.y2 - cell.bbox.y1
                    );
                });
            });
        });
    };

    const drawTableDataResults = (
        ctx: CanvasRenderingContext2D,
        result: TableDataOutput
    ) => {
        result.results.forEach(pageResult => {
            pageResult.tables.forEach(table => {
                // Draw table outline
                ctx.strokeStyle = 'rgba(0, 0, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    table.bbox.x1,
                    table.bbox.y1,
                    table.bbox.x2 - table.bbox.x1,
                    table.bbox.y2 - table.bbox.y1
                );

                // Highlight cells with low confidence
                table.cells.forEach((row, rowIndex) => {
                    row.forEach((cell, colIndex) => {
                        if (cell.confidence.score < 0.8) {
                            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                            // Calculate cell position based on table structure
                            // This is a simplified version - you'll need to adjust based on your data
                            const cellWidth = (table.bbox.x2 - table.bbox.x1) / row.length;
                            const cellHeight = (table.bbox.y2 - table.bbox.y1) / table.cells.length;
                            ctx.fillRect(
                                table.bbox.x1 + colIndex * cellWidth,
                                table.bbox.y1 + rowIndex * cellHeight,
                                cellWidth,
                                cellHeight
                            );
                        }
                    });
                });
            });
        });
    };

    const drawCorrections = (
        ctx: CanvasRenderingContext2D,
        corrections: Record<string, any>
    ) => {
        // Draw corrections based on the correction type
        // This will depend on your correction data structure
        // Example:
        if (corrections.removed_tables) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.lineWidth = 2;
            corrections.removed_tables.forEach((bbox: any) => {
                ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);
                ctx.beginPath();
                ctx.moveTo(bbox.x1, bbox.y1);
                ctx.lineTo(bbox.x2, bbox.y2);
                ctx.moveTo(bbox.x2, bbox.y1);
                ctx.lineTo(bbox.x1, bbox.y2);
                ctx.stroke();
            });
        }
    };

    return (
        <div className="relative w-full h-full min-h-[500px] overflow-auto">
            <canvas
                ref={canvasRef}
                className="border rounded-lg"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left'
                }}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                    onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
                    className="p-2 bg-background/80 rounded-full shadow-lg"
                >
                    -
                </button>
                <button
                    onClick={() => setScale(s => Math.min(2, s + 0.1))}
                    className="p-2 bg-background/80 rounded-full shadow-lg"
                >
                    +
                </button>
            </div>
        </div>
    );
} 