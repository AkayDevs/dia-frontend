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
                        <Badge variant="outline" className="ml-2">
                            {detectionResult.total_tables_found} tables detected
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Detected tables across {detectionResult.total_pages_processed} pages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Processing Information</div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                                <div className="text-muted-foreground">Algorithm:</div>
                                <div>{stepResult.algorithm_code}</div>

                                <div className="text-muted-foreground">Status:</div>
                                <div>
                                    <Badge variant={stepResult.status === 'completed' ? 'outline' : 'secondary'}>
                                        {stepResult.status}
                                    </Badge>
                                </div>

                                <div className="text-muted-foreground">Processing Time:</div>
                                <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {processingTime} seconds
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium">Timing</div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                                <div className="text-muted-foreground">Started:</div>
                                <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {startedAt}
                                </div>

                                <div className="text-muted-foreground">Completed:</div>
                                <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {completedAt}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium">Document Information</div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                                <div className="text-muted-foreground">Document ID:</div>
                                <div className="truncate">{documentId}</div>

                                <div className="text-muted-foreground">Analysis ID:</div>
                                <div className="truncate">{analysisId}</div>

                                <div className="text-muted-foreground">Analysis Type:</div>
                                <div>{analysisType}</div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-4" />

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
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <TabsList className="mb-4 flex flex-wrap">
                                {pageResults.map((pageResult) => (
                                    <TabsTrigger
                                        key={`page-${pageResult.page_info.page_number}`}
                                        value={pageResult.page_info.page_number.toString()}
                                        className="flex items-center gap-2"
                                    >
                                        Page {pageResult.page_info.page_number}
                                        {pageResult.tables.length > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {pageResult.tables.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {pageResults.map((pageResult) => {
                                const pageInfo = pageMap.get(pageResult.page_info.page_number);
                                return (
                                    <TabsContent
                                        key={`content-${pageResult.page_info.page_number}`}
                                        value={pageResult.page_info.page_number.toString()}
                                        className="relative"
                                    >
                                        <PageTableVisualizer
                                            pageResult={pageResult}
                                            imageUrl={pageInfo?.url || ''}
                                            actualWidth={pageInfo?.width || pageResult.page_info.width}
                                            actualHeight={pageInfo?.height || pageResult.page_info.height}
                                            processingInfo={pageResult.processing_info}
                                        />
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

    // State to track if image is loaded and its natural dimensions
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number }>({
        width: actualWidth,
        height: actualHeight
    });

    // Handle image load to get actual dimensions
    const handleImageLoad = () => {
        if (imageRef.current) {
            setImageDimensions({
                width: imageRef.current.naturalWidth,
                height: imageRef.current.naturalHeight
            });
            setImageLoaded(true);
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

    // Calculate container dimensions
    const aspectRatio = actualWidth / actualHeight;
    const maxWidth = Math.min(800, window.innerWidth - 64); // Responsive max width
    const containerWidth = maxWidth;
    const containerHeight = containerWidth / aspectRatio;

    // Zoom in/out handlers
    const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
    const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

    // Calculate the actual display dimensions after zoom
    const displayWidth = containerWidth * zoomLevel;
    const displayHeight = containerHeight * zoomLevel;

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
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Image container with zoom controls */}
                <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">
                            Page {pageResult.page_info.page_number} • {actualWidth}×{actualHeight}px
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={zoomOut}
                                disabled={zoomLevel <= 0.5}
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={zoomIn}
                                disabled={zoomLevel >= 3}
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div
                        ref={containerRef}
                        className="relative border rounded-md overflow-auto bg-gray-50"
                        style={{
                            width: containerWidth,
                            height: containerHeight,
                            maxWidth: '100%'
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
                <div className="flex-1 min-w-[300px] space-y-4">
                    {/* Table information card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                <Table className="inline-block mr-2 h-5 w-5" />
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
                                            <div>
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
                        <CardHeader>
                            <CardTitle className="text-lg">Page Processing Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-2">
                                {Object.entries(processingInfo).length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(processingInfo).map(([key, value]) => (
                                            <React.Fragment key={key}>
                                                <div className="font-medium">{key}:</div>
                                                <div>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</div>
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