import { useState, useEffect, useRef } from 'react';
import { BaseStepComponentProps } from "@/components/analysis/definitions/base";
import { useDocumentStore } from '@/store/useDocumentStore';
import { TableDataOutput, PageTableDataResult, TableData, CellContent } from '@/types/analysis/definitions/table_analysis/table_data';
import { DocumentPage } from '@/types/document';
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Alert,
    AlertTitle,
    AlertDescription
} from '@/components/ui/alert';
import {
    Button
} from '@/components/ui/button';
import {
    Badge
} from '@/components/ui/badge';
import {
    Skeleton
} from '@/components/ui/skeleton';
import {
    ZoomIn,
    ZoomOut,
    Info as InfoIcon,
    Table as TableIcon,
    FileText,
    RefreshCw,
    Calendar,
    Clock,
    Download,
    AlertCircle,
    Database,
    CheckCircle2,
    XCircle,
    ArrowDownToLine
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const TableDataVisualizer: React.FC<BaseStepComponentProps> = ({ stepResult, analysisId, analysisType, step, documentId }) => {
    const [activeTab, setActiveTab] = useState<string>("1");
    const { fetchDocumentPages, currentPages, isPagesLoading, pagesError } = useDocumentStore();

    // Fetch document pages when document ID is available
    useEffect(() => {
        if (documentId) {
            fetchDocumentPages(documentId);
        }
    }, [documentId, fetchDocumentPages]);

    if (!stepResult) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    No valid table data result available.
                </AlertDescription>
            </Alert>
        );
    }

    const dataResult = stepResult.result as TableDataOutput;

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
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-24 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Map page numbers to their image URLs
    const pageMap = new Map(
        currentPages?.pages?.map((page: DocumentPage) => [
            page.page_number,
            {
                url: page.image_url,
                width: page.width,
                height: page.height
            }
        ]) || []
    );

    // Get page results
    const pageResults = dataResult.results || [];

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Database className="mr-2 h-5 w-5 text-primary" />
                            <span>Table Data Extraction Results</span>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                            {pageResults.reduce((acc, page) => acc + page.tables.length, 0)} tables processed
                        </Badge>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Total pages processed: {dataResult.total_pages_processed} • Data extraction completed in {processingTime}s
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Key Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-muted-foreground">Tables Processed</div>
                                        <TableIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-2xl font-bold">
                                            {pageResults.reduce((acc, page) => acc + page.tables.length, 0)}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Across {dataResult.total_pages_processed} pages
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-green-500/5 border-green-500/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-muted-foreground">Success Rate</div>
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-2xl font-bold">
                                            {Math.round((pageResults.reduce((acc, page) =>
                                                acc + page.tables.filter(t => t.confidence.score > 0.5).length, 0) /
                                                pageResults.reduce((acc, page) => acc + page.tables.length, 0)) * 100)}%
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {pageResults.reduce((acc, page) =>
                                                acc + page.tables.filter(t => t.confidence.score > 0.5).length, 0)} successful extractions
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-blue-500/5 border-blue-500/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-muted-foreground">Processing Time</div>
                                        <Clock className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-2xl font-bold">{processingTime}s</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Total extraction duration
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Separator className="my-4" />

                        {/* Document Information */}
                        <div className="mb-4">
                            <div className="text-sm font-medium mb-2 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-primary" />
                                Document Information
                            </div>
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
                    </div>
                </CardContent>
            </Card>

            {/* Table Data Results */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TableIcon className="mr-2 h-5 w-5 text-primary" />
                        <span>Extracted Table Data</span>
                    </CardTitle>
                    <CardDescription>
                        View extracted data from detected tables
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Page Navigation */}
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
                                        className="mt-0"
                                    >
                                        <PageTableDataVisualizer
                                            pageResult={pageResult}
                                            imageUrl={pageInfo?.url || ''}
                                            actualWidth={pageInfo?.width || 0}
                                            actualHeight={pageInfo?.height || 0}
                                        />
                                    </TabsContent>
                                );
                            })}
                        </Tabs>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

interface PageTableDataVisualizerProps {
    pageResult: PageTableDataResult;
    imageUrl: string;
    actualWidth: number;
    actualHeight: number;
}

const PageTableDataVisualizer: React.FC<PageTableDataVisualizerProps> = ({
    pageResult,
    imageUrl,
    actualWidth,
    actualHeight
}) => {
    const [selectedTableIndex, setSelectedTableIndex] = useState<number | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);

    // Calculate container dimensions
    const aspectRatio = actualWidth / actualHeight;
    const maxWidth = Math.min(800, window.innerWidth - 64);
    const containerWidth = maxWidth;
    const containerHeight = containerWidth / aspectRatio;

    // Zoom handlers
    const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
    const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    const resetZoom = () => setZoomLevel(1);

    // Calculate display dimensions
    const displayWidth = containerWidth * zoomLevel;
    const displayHeight = containerHeight * zoomLevel;

    // Scale factors for bounding boxes
    const scaleX = displayWidth / actualWidth;
    const scaleY = displayHeight / actualHeight;

    return (
        <div className="bg-card rounded-lg border p-4">
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Left column - Image viewer */}
                <div className="w-full xl:w-1/2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-medium">Page {pageResult.page_info.page_number}</h3>
                            <Badge variant="secondary">
                                {pageResult.tables.length} {pageResult.tables.length === 1 ? 'table' : 'tables'}
                            </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={zoomOut}
                                disabled={zoomLevel <= 0.5}
                                className="h-8 w-8"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetZoom}
                                className="px-2 h-8"
                            >
                                {Math.round(zoomLevel * 100)}%
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={zoomIn}
                                disabled={zoomLevel >= 3}
                                className="h-8 w-8"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div
                        ref={containerRef}
                        className="relative border rounded-lg overflow-auto bg-gray-50 shadow-inner"
                        style={{
                            height: containerHeight,
                            maxHeight: '70vh'
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
                                src={imageUrl}
                                alt={`Page ${pageResult.page_info.page_number}`}
                                className="w-full h-full transition-opacity duration-300"
                                style={{ objectFit: 'contain', opacity: imageLoaded ? 1 : 0 }}
                                onLoad={() => setImageLoaded(true)}
                            />

                            {imageLoaded && pageResult.tables.map((table, index) => {
                                const isSelected = selectedTableIndex === index;
                                const { bbox } = table;

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
                                            left: `${bbox.x1 * scaleX}px`,
                                            top: `${bbox.y1 * scaleY}px`,
                                            width: `${(bbox.x2 - bbox.x1) * scaleX}px`,
                                            height: `${(bbox.y2 - bbox.y1) * scaleY}px`,
                                        }}
                                        onClick={() => setSelectedTableIndex(isSelected ? null : index)}
                                    >
                                        <div className={cn(
                                            "absolute -top-6 left-0 px-3 py-1 text-xs font-medium rounded-t-md",
                                            isSelected ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                                        )}>
                                            Table {index + 1}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right column - Extracted data */}
                <div className="w-full xl:w-1/2 space-y-4">
                    {selectedTableIndex !== null ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Database className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-medium">Table {selectedTableIndex + 1} Data</h3>
                                </div>
                                <Button variant="outline" size="sm">
                                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b">
                                                {pageResult.tables[selectedTableIndex].cells[0]?.map((_, colIndex: number) => (
                                                    <th key={colIndex} className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                                                        Column {colIndex + 1}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pageResult.tables[selectedTableIndex].cells.map((row: CellContent[], rowIndex: number) => (
                                                <tr key={rowIndex} className="border-b last:border-0">
                                                    {row.map((cell: CellContent, cellIndex: number) => (
                                                        <td key={cellIndex} className="px-4 py-2 text-sm">
                                                            {cell.text}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                {pageResult.tables[selectedTableIndex].cells.length} rows × {pageResult.tables[selectedTableIndex].cells[0]?.length || 0} columns
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <TableIcon className="h-12 w-12 mb-4 text-gray-300" />
                            <p className="text-sm">
                                Select a table to view extracted data
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TableDataVisualizer;
