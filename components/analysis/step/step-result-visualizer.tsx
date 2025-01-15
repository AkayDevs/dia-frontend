'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { TableDetectionOutput, TableStructureOutput, TableDataOutput, StepOutput, BoundingBox, Confidence } from '@/types/results';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/store/useDocumentStore';

interface StepResultVisualizerProps {
    stepId: string;
    result: StepOutput | null;
    corrections?: Record<string, any> | null;
    documentId: string;
}

interface VisualizationState {
    scale: number;
    isLoading: boolean;
    error: string | null;
}

export function StepResultVisualizer({
    stepId,
    result,
    corrections,
    documentId
}: StepResultVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [state, setState] = useState<VisualizationState>({
        scale: 1,
        isLoading: true,
        error: null
    });

    const { currentDocument, fetchDocument } = useDocumentStore();

    // Fetch document if not already loaded
    useEffect(() => {
        if (!currentDocument && documentId) {
            fetchDocument(documentId);
        }
    }, [currentDocument, documentId, fetchDocument]);

    // Helper function to draw bounding box with confidence
    const drawBoundingBox = useCallback((
        ctx: CanvasRenderingContext2D,
        bbox: BoundingBox,
        confidence: Confidence,
        color: string,
        label?: string
    ) => {
        const alpha = Math.max(0.3, confidence.score);
        ctx.strokeStyle = color.replace(')', `, ${alpha})`);
        ctx.lineWidth = 2;
        ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);

        if (label) {
            ctx.fillStyle = color.replace(')', ', 0.8)');
            ctx.font = '12px sans-serif';
            ctx.fillText(
                `${label} (${Math.round(confidence.score * 100)}%)`,
                bbox.x1,
                bbox.y1 - 5
            );
        }
    }, []);

    // Draw table detection results
    const drawTableDetectionResults = useCallback((
        ctx: CanvasRenderingContext2D,
        result: TableDetectionOutput
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
    }, [drawBoundingBox]);

    // Draw table structure results
    const drawTableStructureResults = useCallback((
        ctx: CanvasRenderingContext2D,
        result: TableStructureOutput
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
    }, [drawBoundingBox]);

    // Draw table data results
    const drawTableDataResults = useCallback((
        ctx: CanvasRenderingContext2D,
        result: TableDataOutput
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
    }, [drawBoundingBox]);

    // Draw corrections
    const drawCorrections = useCallback((
        ctx: CanvasRenderingContext2D,
        corrections: Record<string, any>
    ) => {
        if (corrections.removed_tables) {
            corrections.removed_tables.forEach((bbox: BoundingBox) => {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);

                // Draw X mark
                ctx.beginPath();
                ctx.moveTo(bbox.x1, bbox.y1);
                ctx.lineTo(bbox.x2, bbox.y2);
                ctx.moveTo(bbox.x2, bbox.y1);
                ctx.lineTo(bbox.x1, bbox.y2);
                ctx.stroke();
            });
        }

        if (corrections.modified_tables) {
            corrections.modified_tables.forEach((table: any) => {
                ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)'; // Orange for modifications
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    table.bbox.x1,
                    table.bbox.y1,
                    table.bbox.x2 - table.bbox.x1,
                    table.bbox.y2 - table.bbox.y1
                );
            });
        }
    }, []);

    // Main rendering effect
    useEffect(() => {
        if (!result || !currentDocument || !canvasRef.current) {
            setState(prev => ({ ...prev, isLoading: !currentDocument }));
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Canvas context not available'
            }));
            return;
        }

        // Load and draw the document image
        const img = new Image();
        img.src = currentDocument.url;

        img.onload = () => {
            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw image
            ctx.drawImage(img, 0, 0);

            try {
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

                setState(prev => ({ ...prev, isLoading: false, error: null }));
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Error drawing results'
                }));
            }
        };

        img.onerror = () => {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to load document image'
            }));
        };
    }, [result, corrections, stepId, currentDocument, drawTableDetectionResults, drawTableStructureResults, drawTableDataResults, drawCorrections]);

    const handleZoom = useCallback((delta: number) => {
        setState(prev => ({
            ...prev,
            scale: Math.max(0.1, Math.min(2, prev.scale + delta))
        }));
    }, []);

    if (state.isLoading) {
        return <Skeleton className="w-full h-[500px] rounded-lg" />;
    }

    if (state.error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[500px] overflow-auto">
            <canvas
                ref={canvasRef}
                className="border rounded-lg"
                style={{
                    transform: `scale(${state.scale})`,
                    transformOrigin: 'top left'
                }}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                    onClick={() => handleZoom(-0.1)}
                    className="p-2 bg-background/80 rounded-full shadow-lg hover:bg-background/90 transition-colors"
                    aria-label="Zoom out"
                >
                    -
                </button>
                <button
                    onClick={() => handleZoom(0.1)}
                    className="p-2 bg-background/80 rounded-full shadow-lg hover:bg-background/90 transition-colors"
                    aria-label="Zoom in"
                >
                    +
                </button>
            </div>
        </div>
    );
} 