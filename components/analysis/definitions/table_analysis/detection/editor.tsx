import { BaseStepComponentProps } from "@/components/analysis/definitions/base";
import { TableDetectionOutput, PageTableDetectionResult, TableLocation } from "@/types/analysis/definitions/table_analysis/table_detection";
import { useState, useEffect, useCallback } from "react";
import { useDocumentStore } from "@/store/useDocumentStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Table, FileText, Plus, Trash2, Edit2, Save, AlertCircle, InfoIcon, Move, ZoomIn, ZoomOut, List, Grid, Eye } from "lucide-react";

const TableDetectionEditor: React.FC<BaseStepComponentProps> = ({ stepResult, analysisId, analysisType, step, documentId }) => {
    const [activeTab, setActiveTab] = useState<string>("1");
    const [selectedTableIndex, setSelectedTableIndex] = useState<number | null>(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawingBox, setDrawingBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
    const [viewMode, setViewMode] = useState<"visual" | "list">("visual");
    const { toast } = useToast();
    const { fetchDocumentPages, currentPages, isPagesLoading } = useDocumentStore();

    // Track detected tables separately
    const [detectedTables, setDetectedTables] = useState<{ [pageNumber: string]: TableLocation[] }>({});

    useEffect(() => {
        if (documentId) {
            fetchDocumentPages(documentId);
        }
    }, [documentId, fetchDocumentPages]);

    useEffect(() => {
        // Initialize detected tables from stepResult
        if (stepResult?.result) {
            const detectionResult = stepResult.result as TableDetectionOutput;
            if (detectionResult.results && detectionResult.results.length > 0) {
                const tables: { [pageNumber: string]: TableLocation[] } = {};
                detectionResult.results.forEach(result => {
                    tables[result.page_info.page_number.toString()] = result.tables;
                });
                setDetectedTables(tables);
                setActiveTab(detectionResult.results[0].page_info.page_number.toString());
            }
        }
    }, [stepResult]);

    if (!stepResult || !stepResult.result) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>No table detection result available.</AlertDescription>
            </Alert>
        );
    }

    const detectionResult = stepResult.result as TableDetectionOutput;
    const pageResults = detectionResult.results || [];

    const handleStartDrawing = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawingMode) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - viewPosition.x) / zoomLevel;
        const y = (e.clientY - rect.top - viewPosition.y) / zoomLevel;

        setDrawingBox({ startX: x, startY: y, endX: x, endY: y });
    };

    const handleDrawing = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawingMode || !drawingBox) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - viewPosition.x) / zoomLevel;
        const y = (e.clientY - rect.top - viewPosition.y) / zoomLevel;

        setDrawingBox(prev => prev ? { ...prev, endX: x, endY: y } : null);
    };

    const handleEndDrawing = () => {
        if (!isDrawingMode || !drawingBox) return;

        const imageContainer = document.querySelector('.image-container');
        if (!imageContainer) return;

        const { width, height } = imageContainer.getBoundingClientRect();
        const normalizedBox = {
            x1: Math.min(drawingBox.startX, drawingBox.endX) / (width / zoomLevel),
            y1: Math.min(drawingBox.startY, drawingBox.endY) / (height / zoomLevel),
            x2: Math.max(drawingBox.startX, drawingBox.endX) / (width / zoomLevel),
            y2: Math.max(drawingBox.startY, drawingBox.endY) / (height / zoomLevel),
        };

        // Add new table to the current page
        const newTable: TableLocation = {
            bbox: normalizedBox,
            confidence: { score: 1.0, method: 'manual' }
        };

        setDetectedTables(prev => ({
            ...prev,
            [activeTab]: [...(prev[activeTab] || []), newTable]
        }));

        toast({
            title: "Table Added",
            description: "New table bounding box has been added successfully.",
            variant: "default"
        });

        setDrawingBox(null);
        setIsDrawingMode(false);
    };

    const handleDeleteTable = (pageIndex: number, tableIndex: number) => {
        const pageNumber = pageResults[pageIndex].page_info.page_number.toString();
        setDetectedTables(prev => ({
            ...prev,
            [pageNumber]: prev[pageNumber].filter((_, index) => index !== tableIndex)
        }));
        setSelectedTableIndex(null);
        toast({
            title: "Table Deleted",
            description: "Table bounding box has been removed successfully.",
            variant: "default"
        });
    };

    const handleStartDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDrawingMode) return;

        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        setViewPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleEndDrag = () => {
        setIsDragging(false);
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.1, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    };

    const handleResetView = () => {
        setZoomLevel(1);
        setViewPosition({ x: 0, y: 0 });
    };

    const handleSelectTable = (index: number) => {
        setSelectedTableIndex(index === selectedTableIndex ? null : index);
    };

    return (
        <div className="space-y-6 w-full max-w-full">
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-3 bg-gray-50/50 border-b">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Table className="mr-2 h-5 w-5 text-primary" />
                            <span>Table Detection Editor</span>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                            {detectionResult.total_tables_found} tables detected
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Edit, add, or remove detected tables on document pages
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-6">
                    {isPagesLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-[400px] w-full" />
                            <Skeleton className="h-8 w-[200px]" />
                        </div>
                    ) : !currentPages ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>Failed to load document pages.</AlertDescription>
                        </Alert>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <div className="flex flex-col space-y-4">
                                <TabsList className="flex-wrap h-auto p-1 bg-muted/30">
                                    {pageResults.map((page) => (
                                        <TabsTrigger
                                            key={page.page_info.page_number}
                                            value={page.page_info.page_number.toString()}
                                            className="min-w-[100px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Page {page.page_info.page_number}
                                            <Badge variant="outline" className="ml-2 bg-primary/10 text-xs">
                                                {page.tables.length}
                                            </Badge>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md border">
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant={isDrawingMode ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setIsDrawingMode(!isDrawingMode)}
                                            className="h-8"
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            {isDrawingMode ? "Cancel Drawing" : "Add Table"}
                                        </Button>

                                        <div className="h-6 border-l border-gray-300 mx-1"></div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleZoomIn}
                                            className="h-8 px-2"
                                            disabled={zoomLevel >= 3}
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleZoomOut}
                                            className="h-8 px-2"
                                            disabled={zoomLevel <= 0.5}
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleResetView}
                                            className="h-8"
                                        >
                                            Reset View
                                        </Button>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        {isDrawingMode ? (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                Drawing Mode: Click and drag to create a table
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-gray-50">
                                                Zoom: {Math.round(zoomLevel * 100)}%
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {pageResults.map((pageResult) => {
                                const pageInfo = currentPages.pages.find(
                                    p => p.page_number === pageResult.page_info.page_number
                                );
                                const pageTables = detectedTables[pageResult.page_info.page_number.toString()] || [];

                                return (
                                    <TabsContent
                                        key={`content-${pageResult.page_info.page_number}`}
                                        value={pageResult.page_info.page_number.toString()}
                                        className="mt-4"
                                    >
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                            {/* Visual Editor - Takes up 8 columns */}
                                            <div className="lg:col-span-8">
                                                <Card className="shadow-sm border-gray-200">
                                                    <CardHeader className="pb-3 bg-gray-50/50 border-b">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="text-base flex items-center">
                                                                <FileText className="mr-2 h-5 w-5 text-primary" />
                                                                Page {pageResult.page_info.page_number}
                                                            </CardTitle>
                                                            <div className="text-sm text-muted-foreground">
                                                                {pageTables.length} {pageTables.length === 1 ? 'table' : 'tables'} on this page
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-0 overflow-hidden">
                                                        <div
                                                            className="relative image-container bg-gray-100"
                                                            style={{
                                                                width: '100%',
                                                                height: '70vh',
                                                                overflow: 'hidden',
                                                                cursor: isDrawingMode ? 'crosshair' : isDragging ? 'grabbing' : 'grab'
                                                            }}
                                                            onMouseDown={handleStartDrawing}
                                                            onMouseMove={handleDrawing}
                                                            onMouseUp={handleEndDrawing}
                                                            onMouseLeave={() => {
                                                                setDrawingBox(null);
                                                                setIsDragging(false);
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    transform: `translate(${viewPosition.x}px, ${viewPosition.y}px) scale(${zoomLevel})`,
                                                                    transformOrigin: '0 0',
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                                                }}
                                                            >
                                                                {pageInfo && (
                                                                    <>
                                                                        <img
                                                                            src={pageInfo.image_url}
                                                                            alt={`Page ${pageResult.page_info.page_number}`}
                                                                            className="w-full h-full object-contain"
                                                                        />
                                                                        {pageTables.map((table, index) => {
                                                                            const isSelected = selectedTableIndex === index;
                                                                            return (
                                                                                <div
                                                                                    key={`table-${index}`}
                                                                                    className={cn(
                                                                                        "absolute border-2 transition-all duration-200",
                                                                                        isSelected
                                                                                            ? "border-blue-500 bg-blue-500/20 ring-2 ring-blue-300 ring-opacity-50"
                                                                                            : "border-green-500 bg-green-500/10 hover:bg-green-500/20"
                                                                                    )}
                                                                                    style={{
                                                                                        left: `${table.bbox.x1 * 100}%`,
                                                                                        top: `${table.bbox.y1 * 100}%`,
                                                                                        width: `${(table.bbox.x2 - table.bbox.x1) * 100}%`,
                                                                                        height: `${(table.bbox.y2 - table.bbox.y1) * 100}%`,
                                                                                        cursor: 'pointer'
                                                                                    }}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setSelectedTableIndex(isSelected ? null : index);
                                                                                    }}
                                                                                >
                                                                                    <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 rounded-br">
                                                                                        {index + 1}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        {drawingBox && (
                                                                            <div
                                                                                className="absolute border-2 border-blue-500 bg-blue-500/20"
                                                                                style={{
                                                                                    left: Math.min(drawingBox.startX, drawingBox.endX),
                                                                                    top: Math.min(drawingBox.startY, drawingBox.endY),
                                                                                    width: Math.abs(drawingBox.endX - drawingBox.startX),
                                                                                    height: Math.abs(drawingBox.endY - drawingBox.startY)
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="py-2 px-4 bg-gray-50/50 border-t text-xs text-muted-foreground">
                                                        {isDrawingMode ?
                                                            "Click and drag to draw a table bounding box" :
                                                            "Click on a table to select it, or drag to pan the view"}
                                                    </CardFooter>
                                                </Card>
                                            </div>

                                            {/* Results Panel - Takes up 4 columns */}
                                            <div className="lg:col-span-4 space-y-4">
                                                {/* Table Information Card */}
                                                <Card className="shadow-sm border-gray-200">
                                                    <CardHeader className="pb-3 bg-gray-50/50 border-b">
                                                        <CardTitle className="text-base flex items-center">
                                                            <Table className="h-4 w-4 mr-2" />
                                                            Table Information
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4">
                                                        {selectedTableIndex !== null && pageTables[selectedTableIndex] ? (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h3 className="font-medium mb-2 flex items-center">
                                                                        <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">
                                                                            Table {selectedTableIndex + 1}
                                                                        </Badge>
                                                                    </h3>
                                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                                        <div className="font-medium text-muted-foreground">Confidence:</div>
                                                                        <div>
                                                                            <Badge variant="secondary" className="font-mono">
                                                                                {(pageTables[selectedTableIndex].confidence.score * 100).toFixed(2)}%
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="font-medium text-muted-foreground">Method:</div>
                                                                        <div className="capitalize">{pageTables[selectedTableIndex].confidence.method}</div>
                                                                        <div className="font-medium text-muted-foreground">Position:</div>
                                                                        <div className="font-mono text-xs">
                                                                            x: {(pageTables[selectedTableIndex].bbox.x1 * 100).toFixed(1)}% - {(pageTables[selectedTableIndex].bbox.x2 * 100).toFixed(1)}%<br />
                                                                            y: {(pageTables[selectedTableIndex].bbox.y1 * 100).toFixed(1)}% - {(pageTables[selectedTableIndex].bbox.y2 * 100).toFixed(1)}%
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="pt-2 border-t">
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="w-full"
                                                                        onClick={() => handleDeleteTable(
                                                                            pageResults.findIndex(p => p.page_info.page_number.toString() === activeTab),
                                                                            selectedTableIndex
                                                                        )}
                                                                    >
                                                                        <Trash2 className="mr-1 h-4 w-4" />
                                                                        Delete Table
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6 text-muted-foreground">
                                                                <Table className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                                <p>Select a table to view details</p>
                                                                <p className="text-xs mt-2">Or use the "Add Table" button to create a new one</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                {/* Detected Tables List */}
                                                <Card className="shadow-sm border-gray-200">
                                                    <CardHeader className="pb-3 bg-gray-50/50 border-b">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="text-base flex items-center">
                                                                <Table className="mr-2 h-5 w-5 text-primary" />
                                                                Detected Tables
                                                            </CardTitle>
                                                            <Badge variant="outline" className="bg-primary/10">
                                                                {pageTables.length} tables
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-0">
                                                        {pageTables.length === 0 ? (
                                                            <div className="p-6 text-center text-muted-foreground">
                                                                <Table className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                                <p>No tables detected on this page</p>
                                                                <p className="text-xs mt-2">Use the "Add Table" button to create one</p>
                                                            </div>
                                                        ) : (
                                                            <div className="divide-y max-h-[400px] overflow-y-auto">
                                                                {pageTables.map((table, index) => (
                                                                    <div
                                                                        key={`table-list-${index}`}
                                                                        className={cn(
                                                                            "p-4 flex items-center justify-between hover:bg-muted/20 cursor-pointer transition-colors",
                                                                            selectedTableIndex === index && "bg-primary/5"
                                                                        )}
                                                                        onClick={() => handleSelectTable(index)}
                                                                    >
                                                                        <div className="flex items-center space-x-3">
                                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-8 w-8 flex items-center justify-center p-0 rounded-full">
                                                                                {index + 1}
                                                                            </Badge>
                                                                            <div>
                                                                                <div className="font-medium">Table {index + 1}</div>
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    Method: <span className="capitalize">{table.confidence.method}</span> •
                                                                                    Confidence: <span className="font-mono">{(table.confidence.score * 100).toFixed(1)}%</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteTable(
                                                                                    pageResults.findIndex(p => p.page_info.page_number.toString() === activeTab),
                                                                                    index
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </TabsContent>
                                );
                            })}
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TableDetectionEditor;