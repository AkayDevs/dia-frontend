import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer, Image as KonvaImage } from 'react-konva';
import { BaseStepComponentProps } from '@/components/analysis/definitions/base';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, AlertCircle, Save, ZoomIn, ZoomOut, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useToast } from '@/hooks/use-toast';
import { isTableDetectionResult } from "@/types/analysis/registry";
import { TableDetectionOutput, PageTableDetectionResult } from "@/types/analysis/definitions/table_analysis/table_detection";

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
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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

    // Update container size based on available space
    const updateContainerSize = () => {
        if (!containerRef.current || !imageRef.current) return;

        const imageWidth = imageRef.current.naturalWidth || 800;
        const imageHeight = imageRef.current.naturalHeight || 600;
        const aspectRatio = imageWidth / imageHeight;

        // Get parent width (accounting for padding/margins)
        const parentElement = containerRef.current.parentElement;
        const availableWidth = parentElement ? parentElement.clientWidth - 32 : window.innerWidth - 64;

        // Calculate responsive dimensions
        let containerWidth = availableWidth;
        if (window.innerWidth >= 1280) { // xl breakpoint
            containerWidth = Math.min(800, availableWidth);
        } else if (window.innerWidth >= 1024) { // lg breakpoint
            containerWidth = Math.min(700, availableWidth);
        } else if (window.innerWidth >= 768) { // md breakpoint
            containerWidth = Math.min(650, availableWidth);
        }

        const containerHeight = containerWidth / aspectRatio;

        setContainerSize({
            width: containerWidth,
            height: containerHeight
        });
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                updateContainerSize();
            }
        };

        // Initial size calculation
        updateContainerSize();

        // Add resize listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Handle image load
    const handleImageLoad = () => {
        if (imageRef.current) {
            setImageLoaded(true);
            updateContainerSize();
        }
    };

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
    const imageUrl = activePageData?.image_url || '';

    // Calculate display dimensions
    const displayWidth = containerSize.width * zoom;
    const displayHeight = containerSize.height * zoom;

    // Calculate scale factors for bounding boxes
    const actualWidth = activePageData?.width || 800;
    const actualHeight = activePageData?.height || 600;
    const scaleX = displayWidth / actualWidth;
    const scaleY = displayHeight / actualHeight;

    const handleDragEnd = (index: number, e: any) => {
        const newBoxes = [...boxes];
        // Convert from scaled coordinates back to original image coordinates
        newBoxes[index] = {
            ...newBoxes[index],
            x: e.target.x() / scaleX,
            y: e.target.y() / scaleY
        };
        setBoxes(newBoxes);
        setIsDirty(true);
    };

    const handleTransformEnd = (index: number, e: any) => {
        const node = e.target;

        // Get the node's current scale
        const nodeScaleX = node.scaleX();
        const nodeScaleY = node.scaleY();

        // Reset the node's scale to avoid accumulation
        node.scaleX(1);
        node.scaleY(1);

        // Get the node's position and size in stage coordinates
        const nodeX = node.x();
        const nodeY = node.y();
        const nodeWidth = node.width() * nodeScaleX;
        const nodeHeight = node.height() * nodeScaleY;

        // Convert from stage coordinates to original image coordinates
        const originalX = nodeX / scaleX;
        const originalY = nodeY / scaleY;
        const originalWidth = nodeWidth / scaleX;
        const originalHeight = nodeHeight / scaleY;

        // Update the box with the original image coordinates
        const newBoxes = [...boxes];
        newBoxes[index] = {
            ...newBoxes[index],
            x: originalX,
            y: originalY,
            width: Math.max(10 / scaleX, originalWidth),  // Ensure minimum size in original coordinates
            height: Math.max(10 / scaleY, originalHeight)
        };

        setBoxes(newBoxes);
        setIsDirty(true);
    };

    const addNewBox = () => {
        // Add a new box in the center of the visible area
        const centerX = actualWidth / 2;
        const centerY = actualHeight / 2;

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
                    <div className="flex flex-col space-y-2 w-full">
                        <div className="text-sm font-medium px-4 pt-2">
                            {activePageData ? `${activePageData.width}×${activePageData.height}px` : ''}
                        </div>

                        <div
                            ref={containerRef}
                            className="relative overflow-auto"
                            style={{ maxHeight: '60vh' }}
                        >
                            {!imageUrl ? (
                                <div className="flex items-center justify-center h-[400px] bg-gray-100">
                                    <div className="text-center text-gray-500">
                                        <FileText className="h-8 w-8 mx-auto mb-2" />
                                        <p>No image available for this page</p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        width: displayWidth,
                                        height: displayHeight,
                                        position: 'relative'
                                    }}
                                >
                                    <img
                                        ref={imageRef}
                                        src={imageUrl}
                                        alt={`Page ${activePage.page_info.page_number}`}
                                        className="w-full h-full"
                                        style={{ objectFit: 'contain' }}
                                        onLoad={handleImageLoad}
                                    />

                                    {imageLoaded && (
                                        <Stage
                                            width={displayWidth}
                                            height={displayHeight}
                                            style={{ position: 'absolute', top: 0, left: 0 }}
                                        >
                                            <Layer>
                                                {boxes.map((box, index) => {
                                                    // Apply scaling to the box coordinates for display
                                                    const scaledBox = {
                                                        x: box.x * scaleX,
                                                        y: box.y * scaleY,
                                                        width: box.width * scaleX,
                                                        height: box.height * scaleY
                                                    };

                                                    return (
                                                        <Rect
                                                            key={index}
                                                            id={`rect-${index}`}
                                                            x={scaledBox.x}
                                                            y={scaledBox.y}
                                                            width={scaledBox.width}
                                                            height={scaledBox.height}
                                                            stroke={selectedBox === index ? '#2563eb' : '#10b981'}
                                                            strokeWidth={2}
                                                            fill={selectedBox === index ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.05)'}
                                                            draggable
                                                            onDragEnd={(e) => handleDragEnd(index, e)}
                                                            onTransformEnd={(e) => handleTransformEnd(index, e)}
                                                            onClick={() => setSelectedBox(index)}
                                                            onTap={() => setSelectedBox(index)}
                                                        />
                                                    );
                                                })}
                                                <Transformer
                                                    ref={transformerRef}
                                                    boundBoxFunc={(oldBox, newBox) => {
                                                        // Limit minimum size in display coordinates
                                                        if (newBox.width < 10 || newBox.height < 10) {
                                                            return oldBox;
                                                        }

                                                        // Ensure the box stays within the image boundaries
                                                        const maxX = displayWidth;
                                                        const maxY = displayHeight;

                                                        // Check if the box is going outside the image
                                                        if (newBox.x < 0) newBox.x = 0;
                                                        if (newBox.y < 0) newBox.y = 0;
                                                        if (newBox.x + newBox.width > maxX) {
                                                            newBox.width = maxX - newBox.x;
                                                        }
                                                        if (newBox.y + newBox.height > maxY) {
                                                            newBox.height = maxY - newBox.y;
                                                        }

                                                        return newBox;
                                                    }}
                                                    rotateEnabled={false}
                                                    borderStroke="#2563eb"
                                                    anchorStroke="#2563eb"
                                                    anchorFill="#ffffff"
                                                    anchorSize={8}
                                                    anchorCornerRadius={4}
                                                    padding={1}
                                                />
                                            </Layer>
                                        </Stage>
                                    )}
                                </div>
                            )}
                        </div>
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