import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer, Image as KonvaImage } from 'react-konva';
import { BaseStepComponentProps } from '@/components/analysis/definitions/base';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, AlertCircle, Save, ZoomIn, ZoomOut, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useToast } from '@/hooks/use-toast';
import { isTableDetectionResult } from "@/types/analysis/registry";
import { TableDetectionOutput, PageTableDetectionResult } from "@/types/analysis/definitions/table_analysis/table_detection";

// Custom hook to load images
function useImage(url: string | undefined | null): [HTMLImageElement | null] {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!url) {
            setImage(null);
            return;
        }

        const img = new window.Image();
        img.src = url;
        img.crossOrigin = 'Anonymous';

        const onLoad = () => {
            setImage(img);
        };

        img.addEventListener('load', onLoad);

        return () => {
            img.removeEventListener('load', onLoad);
        };
    }, [url]);

    return [image];
}

// Interface to match the table bbox structure from the API
interface TableBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

// Interface for our Konva rectangles
interface KonvaBox {
    x: number;
    y: number;
    width: number;
    height: number;
    id?: string;
}

const TableDetectionEditor: React.FC<BaseStepComponentProps> = ({ analysisId, documentId, analysisType, step, stepResult }) => {
    const { currentPages, fetchDocumentPages, isPagesLoading, pagesError } = useDocumentStore();
    const { toast } = useToast();
    const [zoom, setZoom] = useState(1);
    const [isDirty, setIsDirty] = useState(false);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [selectedBox, setSelectedBox] = useState<number | null>(null);
    const [boxes, setBoxes] = useState<KonvaBox[]>([]);
    const transformerRef = useRef<any>(null);

    // Get the image URL safely
    const getImageUrl = () => {
        if (!stepResult || !isTableDetectionResult(stepResult)) return null;

        const detectionResult = stepResult.result as TableDetectionOutput;
        const pages = detectionResult.results || [];

        if (pages.length === 0 || activePageIndex >= pages.length) return null;

        const activePage = pages[activePageIndex];
        const pageDataMap = new Map(
            (currentPages?.pages || []).map((page: any) => [page.page_number, page])
        );
        const activePageData = pageDataMap.get(activePage?.page_info?.page_number);

        return activePageData?.image_url || null;
    };

    // Use the image hook at the top level
    const [backgroundImage] = useImage(getImageUrl());

    useEffect(() => {
        if (documentId) {
            fetchDocumentPages(documentId);
        }
    }, [documentId, fetchDocumentPages]);

    // Initialize boxes when step result or active page changes
    useEffect(() => {
        if (!stepResult || !isTableDetectionResult(stepResult)) {
            return;
        }

        const detectionResult = stepResult.result as TableDetectionOutput;
        const pages = detectionResult.results || [];

        if (pages.length === 0 || activePageIndex >= pages.length) {
            return;
        }

        const activePage = pages[activePageIndex];
        const newBoxes = activePage.tables
            ? activePage.tables.map(tableToKonvaBox)
            : [];

        setBoxes(newBoxes);
        setSelectedBox(null);
        setIsDirty(false);
    }, [stepResult, activePageIndex]);

    // Update transformer when selectedBox changes
    useEffect(() => {
        const transformer = transformerRef.current;
        if (selectedBox !== null && transformer) {
            const stage = transformer.getStage();
            const selectedNode = stage.findOne(`#rect-${selectedBox}`);
            if (selectedNode) {
                transformer.nodes([selectedNode]);
                transformer.getLayer().batchDraw();
            }
        } else if (transformer) {
            transformer.nodes([]);
            transformer.getLayer().batchDraw();
        }
    }, [selectedBox, boxes]);

    // Convert API table boxes to Konva boxes for the canvas
    const tableToKonvaBox = (table: any): KonvaBox => {
        const bbox = table.bbox as TableBox;
        return {
            x: bbox.x1,
            y: bbox.y1,
            width: bbox.x2 - bbox.x1,
            height: bbox.y2 - bbox.y1,
            id: table.id
        };
    };

    // Convert Konva box back to API table box format
    const konvaToTableBox = (box: KonvaBox): TableBox => {
        return {
            x1: box.x,
            y1: box.y,
            x2: box.x + box.width,
            y2: box.y + box.height
        };
    };

    // Loading state
    if (isPagesLoading) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Loading</AlertTitle>
                <AlertDescription>
                    Loading document pages...
                </AlertDescription>
            </Alert>
        );
    }

    // Error state
    if (pagesError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Error loading document pages: {pagesError}
                </AlertDescription>
            </Alert>
        );
    }

    // Validate step result
    if (!stepResult || !isTableDetectionResult(stepResult)) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Invalid Data</AlertTitle>
                <AlertDescription>
                    No valid table detection result available for editing.
                </AlertDescription>
            </Alert>
        );
    }

    const detectionResult = stepResult.result as TableDetectionOutput;
    const pages = detectionResult.results || [];

    if (pages.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data</AlertTitle>
                <AlertDescription>
                    No page results available for editing.
                </AlertDescription>
            </Alert>
        );
    }

    const activePage = pages[activePageIndex];

    // Create a map of document pages by page number
    const pageDataMap = new Map(
        (currentPages?.pages || []).map((page: any) => [page.page_number, page])
    );
    const activePageData = pageDataMap.get(activePage.page_info.page_number);

    // Scaling: scale the stage to a maximum width of 800px while preserving aspect ratio
    const maxWidth = 800;
    const stageScale = activePageData && activePageData.width
        ? Math.min(maxWidth / activePageData.width, 1) * zoom
        : zoom;

    const stageWidth = activePageData
        ? Math.min(activePageData.width, maxWidth)
        : 800;

    const stageHeight = activePageData
        ? activePageData.height * (stageWidth / activePageData.width)
        : 600;

    const handleDragEnd = (index: number, e: any) => {
        const newBoxes = [...boxes];
        newBoxes[index] = {
            ...newBoxes[index],
            x: e.target.x(),
            y: e.target.y()
        };
        setBoxes(newBoxes);
        setIsDirty(true);
    };

    const handleTransformEnd = (index: number, e: any) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale to avoid accumulation
        node.scaleX(1);
        node.scaleY(1);

        const newBoxes = [...boxes];
        newBoxes[index] = {
            ...newBoxes[index],
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY)
        };

        setBoxes(newBoxes);
        setIsDirty(true);
    };

    const addNewBox = () => {
        // Add a new box in the center of the visible area
        const centerX = stageWidth / (2 * stageScale);
        const centerY = stageHeight / (2 * stageScale);

        const newBox: KonvaBox = {
            x: centerX - 50,
            y: centerY - 25,
            width: 100,
            height: 50
        };

        setBoxes([...boxes, newBox]);
        setSelectedBox(boxes.length);
        setIsDirty(true);
    };

    const deleteSelectedBox = () => {
        if (selectedBox === null) return;

        const newBoxes = boxes.filter((_, idx) => idx !== selectedBox);
        setBoxes(newBoxes);
        setSelectedBox(null);
        setIsDirty(true);
    };

    const saveChanges = () => {
        // Here you would implement the API call to save the changes
        // For now, we'll just show a toast notification
        toast({
            title: "Changes Saved",
            description: `Updated ${boxes.length} tables on page ${activePage.page_info.page_number}`,
        });
        setIsDirty(false);
    };

    const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
    const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => setZoom(1);

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Table className="mr-2 h-5 w-5 text-primary" />
                    Edit Table Detection Results
                </CardTitle>
                <CardDescription>
                    Add, modify, or delete table bounding boxes for page {activePage.page_info.page_number}
                </CardDescription>
                <Separator className="my-2" />
            </CardHeader>
            <CardContent>
                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            Page {activePage.page_info.page_number} of {pages.length}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            {boxes.length} tables
                        </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-r-none"
                                onClick={zoomOut}
                                disabled={zoom <= 0.5}
                                title="Zoom out"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <div className="px-2 text-xs font-medium border-l border-r h-8 flex items-center">
                                {Math.round(zoom * 100)}%
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-l-none"
                                onClick={zoomIn}
                                disabled={zoom >= 3}
                                title="Zoom in"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActivePageIndex(Math.max(activePageIndex - 1, 0))}
                            disabled={activePageIndex === 0}
                        >
                            Previous Page
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActivePageIndex(Math.min(activePageIndex + 1, pages.length - 1))}
                            disabled={activePageIndex === pages.length - 1}
                        >
                            Next Page
                        </Button>
                    </div>
                </div>

                {/* Editing tools */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <Button variant="secondary" size="sm" onClick={addNewBox}>
                        Add Table
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={deleteSelectedBox}
                        disabled={selectedBox === null}
                        className="gap-1"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Selected
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={saveChanges}
                        disabled={!isDirty}
                        className="gap-1 ml-auto"
                    >
                        <Save className="h-3.5 w-3.5" />
                        Save Changes
                    </Button>
                </div>

                {/* Canvas */}
                <div className="border rounded-md overflow-hidden bg-gray-50">
                    <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
                        <Stage
                            width={stageWidth}
                            height={stageHeight}
                            scale={{ x: stageScale, y: stageScale }}
                        >
                            <Layer>
                                {backgroundImage && (
                                    <KonvaImage
                                        image={backgroundImage}
                                        width={activePageData?.width || stageWidth}
                                        height={activePageData?.height || stageHeight}
                                    />
                                )}
                                {boxes.map((box, index) => (
                                    <Rect
                                        key={index}
                                        id={`rect-${index}`}
                                        x={box.x}
                                        y={box.y}
                                        width={box.width}
                                        height={box.height}
                                        stroke={selectedBox === index ? '#2563eb' : '#10b981'}
                                        strokeWidth={2}
                                        fill={selectedBox === index ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.05)'}
                                        draggable
                                        onDragEnd={(e) => handleDragEnd(index, e)}
                                        onTransformEnd={(e) => handleTransformEnd(index, e)}
                                        onClick={() => setSelectedBox(index)}
                                        onTap={() => setSelectedBox(index)}
                                    />
                                ))}
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        // Limit minimum size
                                        if (newBox.width < 10 || newBox.height < 10) {
                                            return oldBox;
                                        }
                                        return newBox;
                                    }}
                                    rotateEnabled={false}
                                    borderStroke="#2563eb"
                                    anchorStroke="#2563eb"
                                    anchorFill="#ffffff"
                                />
                            </Layer>
                        </Stage>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 text-xs text-muted-foreground">
                    <p>Click on a table to select it. Drag to move, or use the handles to resize.</p>
                    {isDirty && (
                        <p className="text-amber-600 mt-1">You have unsaved changes. Click "Save Changes" to apply them.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TableDetectionEditor;