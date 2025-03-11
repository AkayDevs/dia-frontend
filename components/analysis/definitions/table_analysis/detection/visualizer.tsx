import React, { useState, useEffect, useRef } from 'react';
import { BaseStepComponentProps } from "@/components/analysis/definitions/base";
import { isTableDetectionResult } from "@/types/analysis/registry";
import { TableDetectionOutput, PageTableDetectionResult } from "@/types/analysis/definitions/table_analysis/table_detection";
import { useDocumentStore } from "@/store/useDocumentStore";
import { DocumentPage } from "@/types/document";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircle, Table, ZoomIn, ZoomOut, Download, Clock, Calendar, FileText, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const TableDetectionVisualizer: React.FC<BaseStepComponentProps> = ({ stepResult, analysisId, analysisType, step, documentId }) => {
    const [activeTab, setActiveTab] = useState<string>("1");
    const { fetchDocumentPages, currentPages, isPagesLoading, pagesError } = useDocumentStore();

    // Fetch document pages when document ID is available
    useEffect(() => {
        if (documentId) {
            fetchDocumentPages(documentId);
        }
    }, [documentId, fetchDocumentPages]);

    // Set initial active tab to the first page with tables
    // This needs to be called unconditionally to maintain hook order
    useEffect(() => {
        if (stepResult && isTableDetectionResult(stepResult)) {
            const detectionResult = stepResult.result as TableDetectionOutput;
            const pageResults = detectionResult.results || [];

            if (pageResults.length > 0) {
                const firstPageWithTables = pageResults.find(page => page.tables.length > 0);
                if (firstPageWithTables) {
                    setActiveTab(firstPageWithTables.page_info.page_number.toString());
                } else {
                    setActiveTab(pageResults[0].page_info.page_number.toString());
                }
            }
        }
    }, [stepResult]);

    // Check if the step result is a table detection result
    if (!stepResult || !isTableDetectionResult(stepResult)) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    No valid table detection result available.
                </AlertDescription>
            </Alert>
        );
    }

    const detectionResult = stepResult.result as TableDetectionOutput;

    // Format dates for display
    const startedAt = stepResult.started_at ? format(new Date(stepResult.started_at), 'PPpp') : 'N/A';
    const completedAt = stepResult.completed_at ? format(new Date(stepResult.completed_at), 'PPpp') : 'N/A';
    const processingTime = stepResult.started_at && stepResult.completed_at
        ? ((new Date(stepResult.completed_at).getTime() - new Date(stepResult.started_at).getTime()) / 1000).toFixed(2)
        : 'N/A';

    // If pages are loading, show skeleton
    if (isPagesLoading) {
        return (
            <div className="space-y-4">
                {/* Summary Card Skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Page Visualization Card Skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" /> {/* Tabs skeleton */}
                            <Skeleton className="h-[400px] w-full" /> {/* Page content skeleton */}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If there's an error loading pages, show error message
    if (pagesError) {
        return (
            <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unable to load document pages</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">{pagesError}</p>
                    <p className="text-sm text-muted-foreground">
                        Please try refreshing the page or contact support if this issue persists.
                    </p>
                </AlertDescription>
            </Alert>
        );
    }

    // If no pages are available, show message
    if (!currentPages || !currentPages.pages || currentPages.pages.length === 0) {
        return (
            <Alert variant="default" className="animate-in fade-in-50">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Document Pages Unavailable</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">We couldn't retrieve any pages for this document.</p>
                    <div className="text-sm text-muted-foreground">
                        This could be due to one of the following reasons:
                    </div>
                    <ul className="list-disc ml-5 mt-1 text-sm text-muted-foreground">
                        <li>The document may have been deleted or moved</li>
                        <li>The document processing may still be in progress</li>
                        <li>There might be permission issues accessing this content</li>
                    </ul>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Refresh Page
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    // Map page numbers to their image URLs and page dimensions
    const pageMap = new Map(
        currentPages.pages.map((page: DocumentPage) => [
            page.page_number,
            {
                url: page.image_url,
                width: page.width,
                height: page.height
            }
        ])
    );

    // Get page results or empty array if not available
    const pageResults = detectionResult.results || [];

    return (
        <div className="space-y-4">
            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Table Detection Results</span>
                        <Badge variant="secondary" className="ml-2">
                            {detectionResult.total_tables_found} tables detected
                        </Badge>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Total pages processed: {detectionResult.total_pages_processed}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">

                        <Separator className="my-2" />

                        {/* Table Detection Statistics */}
                        <div className="mb-4">
                            <div className="text-sm font-medium mb-2">Detection Statistics</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>Tables Detected</span>
                                        <span className="font-medium">
                                            {detectionResult.total_tables_found}
                                        </span>
                                    </div>
                                    <Progress
                                        value={detectionResult.total_tables_found > 0 ? 100 : 0}
                                        className={`h-2 ${detectionResult.total_tables_found > 0 ? 'bg-green-100' : 'bg-gray-100'}`}
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        {detectionResult.total_tables_found > 0
                                            ? `Average ${(detectionResult.total_tables_found /
                                                (detectionResult.total_pages_processed || 1)).toFixed(1)} tables per page with tables`
                                            : 'No tables detected'}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>Pages Processed</span>
                                        <span className="font-medium">{detectionResult.total_pages_processed}</span>
                                    </div>
                                    <Progress value={100} className="h-2" />
                                    <div className="text-xs text-muted-foreground">
                                        {detectionResult.total_pages_processed} pages analyzed
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>Pages with Tables</span>
                                        <span className="font-medium">
                                            {detectionResult.total_tables_found}
                                        </span>
                                    </div>
                                    <Progress
                                        value={detectionResult.total_tables_found > 0
                                            ? (detectionResult.total_tables_found / detectionResult.total_pages_processed) * 100
                                            : 0
                                        }
                                        className="h-2"
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        {detectionResult.total_pages_processed > 0
                                            ? `${Math.round((detectionResult.total_tables_found / detectionResult.total_pages_processed) * 100)}% of pages contain tables`
                                            : 'No pages analyzed'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="mb-4">
                            <div className="text-sm font-medium mb-2">Document Information</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Processing Information */}
                                <div className="space-y-2 p-3 bg-card rounded-lg border">
                                    <div className="flex items-center text-sm font-medium mb-1">
                                        <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                                        Processing Details
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
                                        <div className="text-muted-foreground">Algorithm:</div>
                                        <div className="font-medium">{stepResult.algorithm_code}</div>

                                        <div className="text-muted-foreground">Status:</div>
                                        <div>
                                            <Badge variant={stepResult.status === 'completed' ? 'outline' : 'secondary'}>
                                                {stepResult.status}
                                            </Badge>
                                        </div>

                                        <div className="text-muted-foreground">Duration:</div>
                                        <div className="flex items-center font-medium">
                                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                            {processingTime}s
                                        </div>
                                    </div>
                                </div>

                                {/* Timing Information */}
                                <div className="space-y-2 p-3 bg-card rounded-lg border">
                                    <div className="flex items-center text-sm font-medium mb-1">
                                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                                        Timing
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
                                        <div className="text-muted-foreground">Started:</div>
                                        <div className="font-medium">{startedAt}</div>

                                        <div className="text-muted-foreground">Completed:</div>
                                        <div className="font-medium">{completedAt}</div>
                                    </div>
                                </div>

                                {/* Document Details */}
                                <div className="space-y-2 p-3 bg-card rounded-lg border">
                                    <div className="flex items-center text-sm font-medium mb-1">
                                        <FileText className="h-4 w-4 mr-2 text-primary" />
                                        Document Details
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
                                        <div className="text-muted-foreground">Document:</div>
                                        <div className="truncate font-mono text-xs">{documentId}</div>

                                        <div className="text-muted-foreground">Analysis:</div>
                                        <div className="truncate font-mono text-xs">{analysisId}</div>

                                        <div className="text-muted-foreground">Type:</div>
                                        <div>
                                            <Badge variant="outline">{analysisType}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4" />
                    </div>
                </CardContent>
            </Card>

            {/* Page Visualization Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Page Visualization</CardTitle>
                    <CardDescription>
                        View detected tables on document pages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {detectionResult.total_tables_found === 0 ? (
                        <Alert>
                            <InfoIcon className="h-4 w-4" />
                            <AlertTitle>No tables detected</AlertTitle>
                            <AlertDescription>
                                No tables were detected in this document.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-6">
                            {/* Page Navigation Bar */}
                            <div className="flex flex-col space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-sm font-medium">Document Pages</h3>
                                        <Badge variant="outline" className="text-xs">
                                            {pageResults.length} pages
                                        </Badge>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const currentIndex = pageResults.findIndex(
                                                    p => p.page_info.page_number.toString() === activeTab
                                                );
                                                if (currentIndex > 0) {
                                                    setActiveTab(pageResults[currentIndex - 1].page_info.page_number.toString());
                                                }
                                            }}
                                            disabled={pageResults.findIndex(p => p.page_info.page_number.toString() === activeTab) <= 0}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const currentIndex = pageResults.findIndex(
                                                    p => p.page_info.page_number.toString() === activeTab
                                                );
                                                if (currentIndex < pageResults.length - 1) {
                                                    setActiveTab(pageResults[currentIndex + 1].page_info.page_number.toString());
                                                }
                                            }}
                                            disabled={pageResults.findIndex(p => p.page_info.page_number.toString() === activeTab) >= pageResults.length - 1}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>

                                {/* Page Thumbnails */}
                                <div className="relative">
                                    <div className="flex pt-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                        {pageResults.map((pageResult) => {
                                            const pageInfo = pageMap.get(pageResult.page_info.page_number);
                                            const isActive = activeTab === pageResult.page_info.page_number.toString();
                                            const hasTables = pageResult.tables.length > 0;

                                            return (
                                                <div
                                                    key={`thumb-${pageResult.page_info.page_number}`}
                                                    className={cn(
                                                        "flex-shrink-0 cursor-pointer mx-1 transition-all duration-200 relative",
                                                        isActive ? "opacity-100 scale-100" : "opacity-70 scale-95 hover:opacity-90 hover:scale-98"
                                                    )}
                                                    onClick={() => setActiveTab(pageResult.page_info.page_number.toString())}
                                                >
                                                    <div className={cn(
                                                        "w-24 h-32 border-2 rounded-md overflow-hidden flex items-center justify-center bg-gray-50",
                                                        isActive ? "border-primary shadow-md" : "border-gray-200",
                                                        hasTables ? "ring-2 ring-green-200 ring-opacity-50" : ""
                                                    )}>
                                                        {pageInfo?.url ? (
                                                            <img
                                                                src={pageInfo.url}
                                                                alt={`Page ${pageResult.page_info.page_number} thumbnail`}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <FileText className="h-6 w-6 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className={cn(
                                                        "absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium",
                                                        isActive ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
                                                    )}>
                                                        {pageResult.page_info.page_number}
                                                    </div>
                                                    {hasTables && (
                                                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                                                            {pageResult.tables.length}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Page Content */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                {pageResults.map((pageResult) => {
                                    const pageInfo = pageMap.get(pageResult.page_info.page_number);
                                    return (
                                        <TabsContent
                                            key={`content-${pageResult.page_info.page_number}`}
                                            value={pageResult.page_info.page_number.toString()}
                                            className="relative mt-0"
                                        >
                                            <div className="bg-card rounded-lg border p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                        <h3 className="text-lg font-medium">Page {pageResult.page_info.page_number}</h3>
                                                        {pageResult.tables.length > 0 ? (
                                                            <Badge variant="secondary">
                                                                {pageResult.tables.length} {pageResult.tables.length === 1 ? 'table' : 'tables'} detected
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-gray-500">
                                                                No tables
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {pageInfo ? `${pageInfo.width} × ${pageInfo.height} px` : ''}
                                                    </div>
                                                </div>

                                                <PageTableVisualizer
                                                    pageResult={pageResult}
                                                    imageUrl={pageInfo?.url || ''}
                                                    actualWidth={pageInfo?.width || pageResult.page_info.width}
                                                    actualHeight={pageInfo?.height || pageResult.page_info.height}
                                                    processingInfo={pageResult.processing_info}
                                                />
                                            </div>
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

interface PageTableVisualizerProps {
    pageResult: PageTableDetectionResult;
    imageUrl: string;
    actualWidth: number;
    actualHeight: number;
    processingInfo: Record<string, any>;
}

const PageTableVisualizer: React.FC<PageTableVisualizerProps> = ({
    pageResult,
    imageUrl,
    actualWidth,
    actualHeight,
    processingInfo
}) => {
    const [selectedTableIndex, setSelectedTableIndex] = useState<number | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // State to track if image is loaded and its natural dimensions
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number }>({
        width: actualWidth,
        height: actualHeight
    });

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

    // Update container size based on available space
    const updateContainerSize = () => {
        if (!containerRef.current) return;

        const aspectRatio = actualWidth / actualHeight;

        // Get parent width (accounting for padding/margins)
        const parentElement = containerRef.current.parentElement;
        const availableWidth = parentElement ? parentElement.clientWidth - 32 : window.innerWidth - 64;

        // Calculate responsive dimensions
        // For small screens, use full width
        // For medium screens, cap at 700px
        // For large screens, cap at 800px
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

    // Handle image load to get actual dimensions
    const handleImageLoad = () => {
        if (imageRef.current) {
            setImageDimensions({
                width: imageRef.current.naturalWidth,
                height: imageRef.current.naturalHeight
            });
            setImageLoaded(true);

            // Update container size after image loads
            updateContainerSize();
        }
    };

    if (!imageUrl) {
        return (
            <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Image not available</AlertTitle>
                <AlertDescription>
                    The image for page {pageResult.page_info.page_number} could not be loaded.
                </AlertDescription>
            </Alert>
        );
    }

    // Zoom in/out handlers
    const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
    const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    const resetZoom = () => setZoomLevel(1);

    // Calculate the actual display dimensions after zoom
    const displayWidth = containerSize.width * zoomLevel;
    const displayHeight = containerSize.height * zoomLevel;

    // Calculate scale factors for bounding boxes
    // Use the ratio between the displayed image size and the original page dimensions
    const scaleX = displayWidth / actualWidth;
    const scaleY = displayHeight / actualHeight;

    // Function to determine confidence badge variant
    const getConfidenceBadgeVariant = (score: number): "default" | "destructive" | "secondary" | "outline" => {
        if (score > 0.8) return "outline"; // High confidence
        if (score > 0.5) return "secondary"; // Medium confidence
        return "destructive"; // Low confidence
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col xl:flex-row gap-4">
                {/* Image container with zoom controls */}
                <div className="flex flex-col space-y-2 w-full xl:max-w-[65%]">
                    <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                        <div className="text-sm font-medium">
                            Page {pageResult.page_info.page_number} • {actualWidth}×{actualHeight}px
                        </div>
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={zoomOut}
                                disabled={zoomLevel <= 0.5}
                                title="Zoom out"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetZoom}
                                className="px-2"
                                title="Reset zoom"
                            >
                                {Math.round(zoomLevel * 100)}%
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={zoomIn}
                                disabled={zoomLevel >= 3}
                                title="Zoom in"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div
                        ref={containerRef}
                        className="relative border rounded-md overflow-auto bg-gray-50 w-full"
                        style={{
                            height: containerSize.height || 400, // Fallback height
                            maxHeight: '70vh' // Prevent excessive height on large screens
                        }}
                    >
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
                                alt={`Page ${pageResult.page_info.page_number}`}
                                className="w-full h-full"
                                style={{ objectFit: 'contain' }}
                                onLoad={handleImageLoad}
                            />

                            {/* Only render bounding boxes after image is loaded */}
                            {imageLoaded && pageResult.tables.map((table, index) => {
                                const { x1, y1, x2, y2 } = table.bbox;
                                const isSelected = selectedTableIndex === index;

                                // Scale coordinates to match the displayed image size
                                const scaledX1 = x1 * scaleX;
                                const scaledY1 = y1 * scaleY;
                                const scaledWidth = (x2 - x1) * scaleX;
                                const scaledHeight = (y2 - y1) * scaleY;

                                return (
                                    <div
                                        key={`table-${index}`}
                                        className={cn(
                                            "absolute border-2 cursor-pointer transition-all duration-200",
                                            isSelected
                                                ? "border-blue-500 bg-blue-500/20"
                                                : "border-green-500 bg-green-500/10 hover:bg-green-500/20"
                                        )}
                                        style={{
                                            left: `${scaledX1}px`,
                                            top: `${scaledY1}px`,
                                            width: `${scaledWidth}px`,
                                            height: `${scaledHeight}px`,
                                        }}
                                        onClick={() => setSelectedTableIndex(isSelected ? null : index)}
                                    >
                                        <div className={cn(
                                            "absolute top-0 left-0 px-2 py-1 text-xs font-medium",
                                            isSelected ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                                        )}>
                                            Table {index + 1}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                        Scroll to pan, use zoom controls to resize
                    </div>
                </div>

                {/* Information panel */}
                <div className="w-full xl:w-[35%] space-y-4">
                    {/* Table information card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center">
                                <Table className="h-4 w-4 mr-2" />
                                Table Information
                            </CardTitle>
                            <CardDescription>
                                {pageResult.tables.length === 0
                                    ? "No tables detected on this page"
                                    : `${pageResult.tables.length} tables detected on this page`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedTableIndex !== null ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-2">Table {selectedTableIndex + 1}</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="font-medium">Confidence:</div>
                                            <div>
                                                <Badge variant={getConfidenceBadgeVariant(pageResult.tables[selectedTableIndex].confidence.score)}>
                                                    {(pageResult.tables[selectedTableIndex].confidence.score * 100).toFixed(2)}%
                                                </Badge>
                                            </div>

                                            <div className="font-medium">Method:</div>
                                            <div>{pageResult.tables[selectedTableIndex].confidence.method}</div>

                                            {pageResult.tables[selectedTableIndex].table_type && (
                                                <>
                                                    <div className="font-medium">Type:</div>
                                                    <div>{pageResult.tables[selectedTableIndex].table_type}</div>
                                                </>
                                            )}

                                            <div className="font-medium">Position:</div>
                                            <div className="text-xs">
                                                ({pageResult.tables[selectedTableIndex].bbox.x1.toFixed(0)},
                                                {pageResult.tables[selectedTableIndex].bbox.y1.toFixed(0)}) -
                                                ({pageResult.tables[selectedTableIndex].bbox.x2.toFixed(0)},
                                                {pageResult.tables[selectedTableIndex].bbox.y2.toFixed(0)})
                                            </div>

                                            <div className="font-medium">Dimensions:</div>
                                            <div>
                                                {Math.round(pageResult.tables[selectedTableIndex].bbox.x2 - pageResult.tables[selectedTableIndex].bbox.x1)}
                                                ×
                                                {Math.round(pageResult.tables[selectedTableIndex].bbox.y2 - pageResult.tables[selectedTableIndex].bbox.y1)}
                                                px
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Extract Table Data
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 py-4 text-center">
                                    Click on a table to view its details
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Page processing information */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Processing Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-2">
                                {Object.entries(processingInfo).length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(processingInfo).map(([key, value]) => (
                                            <React.Fragment key={key}>
                                                <div className="font-medium">{key}:</div>
                                                <div className="truncate" title={typeof value === 'object' ? JSON.stringify(value) : String(value)}>
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground">No processing information available</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TableDetectionVisualizer;