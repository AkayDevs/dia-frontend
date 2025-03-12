import { useState, useRef, useEffect } from 'react';
import { BaseStepComponentProps } from "@/components/analysis/definitions/base";
import { useDocumentStore } from '@/store/useDocumentStore';
import { TableStructureOutput, PageTableStructureResult, TableStructure, Cell } from '@/types/analysis/definitions/table_analysis/table_structure';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ZoomIn,
    ZoomOut,
    Info as InfoIcon,
    Table as TableIcon,
    Grid as GridIcon,
    Download,
    Maximize2,
    Minimize2,
    AlertCircle,
    FileText,
    RefreshCw,
    Calendar,
    Clock,
    BarChart3,
    ArrowRight,
    ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface PageTableStructureVisualizerProps {
    pageResult: PageTableStructureResult;
    imageUrl: string;
    actualWidth: number;
    actualHeight: number;
    processingInfo?: Record<string, any>;
}

const TableStructureVisualizer: React.FC<BaseStepComponentProps> = ({ stepResult, analysisId, analysisType, step, documentId }) => {
    const { fetchDocumentPages, currentPages, isPagesLoading, pagesError } = useDocumentStore();
    const [activeTab, setActiveTab] = useState<string>('1');

    useEffect(() => {
        if (documentId) {
            fetchDocumentPages(documentId);
        }
    }, [documentId, fetchDocumentPages]);


    // Cast stepResult to TableStructureOutput
    const tableStructureResult = stepResult?.result as TableStructureOutput | undefined;

    // Set active tab to the first page with tables when results load
    useEffect(() => {
        if (tableStructureResult?.results && tableStructureResult.results.length > 0) {
            setActiveTab(tableStructureResult.results[0].page_info.page_number.toString());
        }
    }, [tableStructureResult]);

    if (!stepResult) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    No valid table structure result available.
                </AlertDescription>
            </Alert>
        );
    }

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

    if (!tableStructureResult || !tableStructureResult.results || tableStructureResult.results.length === 0) {
        return (
            <Card className="w-full animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TableIcon className="mr-2 h-5 w-5 text-primary" />
                        Table Structure Analysis
                    </CardTitle>
                    <CardDescription>No table structure results detected in this document</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="default" className="border-amber-200 bg-amber-50">
                        <InfoIcon className="h-4 w-4 text-amber-500" />
                        <AlertTitle className="font-medium">No Tables Detected</AlertTitle>
                        <AlertDescription className="mt-2">
                            <p className="mb-2">We couldn't find any table structures in this document.</p>
                            <div className="text-sm text-muted-foreground">
                                You might want to:
                                <ul className="list-disc ml-5 mt-1">
                                    <li>Verify the document contains properly formatted tables</li>
                                    <li>Adjust the analysis sensitivity parameters</li>
                                    <li>Try a different document with clearer table structures</li>
                                </ul>
                            </div>
                            <Button variant="outline" size="sm" className="mt-3">
                                <RefreshCw className="h-3 w-3 mr-2" />
                                Run Analysis Again
                            </Button>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    // If there's an error loading pages, show error message
    if (pagesError || !currentPages || !currentPages.pages || currentPages.pages.length === 0) {
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
    // Format dates for display
    const startedAt = stepResult.started_at ? format(new Date(stepResult.started_at), 'PPpp') : 'N/A';
    const completedAt = stepResult.completed_at ? format(new Date(stepResult.completed_at), 'PPpp') : 'N/A';
    const processingTime = stepResult.started_at && stepResult.completed_at
        ? ((new Date(stepResult.completed_at).getTime() - new Date(stepResult.started_at).getTime()) / 1000).toFixed(2)
        : 'N/A';

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

    // Get the page results
    const pageResults = tableStructureResult.results;

    // Count total tables across all pages
    const totalTables = pageResults.reduce((sum, page) => sum + page.tables.length, 0);

    // Calculate structure statistics
    const totalCells = pageResults.reduce((sum, page) =>
        sum + page.tables.reduce((tableSum, table) =>
            tableSum + (table.cells?.length || 0), 0), 0);

    const pagesWithTables = pageResults.filter(page => page.tables.length > 0).length;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <TableIcon className="mr-2 h-5 w-5 text-primary" />
                            <span>Table Structure Results</span>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                            {tableStructureResult.total_tables_found} tables processed
                        </Badge>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Total pages processed: {tableStructureResult.total_pages_processed} • Structure analysis completed in {processingTime}s
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Key Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-muted-foreground">Tables Detected</div>
                                        <TableIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-2xl font-bold">{totalTables}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Across {pagesWithTables} pages
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-blue-500/5 border-blue-500/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-muted-foreground">Pages Processed</div>
                                        <FileText className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-2xl font-bold">{tableStructureResult.total_pages_processed}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Document analysis complete
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-green-500/5 border-green-500/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-muted-foreground">Processing Time</div>
                                        <Clock className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-2xl font-bold">{processingTime}s</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Total analysis duration
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Separator className="my-4" />

                        {/* Summary Section */}
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

                        <Separator className="my-4" />
                    </div>
                </CardContent>
            </Card>

            <div className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TableIcon className="mr-2 h-5 w-5" />
                            Table Structure Analysis
                        </CardTitle>
                        <CardDescription>
                            {totalTables} {totalTables === 1 ? 'table' : 'tables'} detected across {pageResults.length} {pageResults.length === 1 ? 'page' : 'pages'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

                                                <PageTableStructureVisualizer
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
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const PageTableStructureVisualizer: React.FC<PageTableStructureVisualizerProps> = ({
    pageResult,
    imageUrl,
    actualWidth,
    actualHeight,
    processingInfo
}) => {
    const [selectedTableIndex, setSelectedTableIndex] = useState<number | null>(null);
    const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [showGrid, setShowGrid] = useState<boolean>(true);
    const [fullScreen, setFullScreen] = useState<boolean>(false);
    const [debugMode, setDebugMode] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Calculate aspect ratio first
    const aspectRatio = actualWidth / actualHeight;

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

    // Reset selected cell when table changes
    useEffect(() => {
        setSelectedCellIndex(null);
    }, [selectedTableIndex]);

    // Add window resize handler with debounce
    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newMaxWidth = Math.min(1200, window.innerWidth - (fullScreen ? 32 : 64));
                const newContainerWidth = fullScreen ? window.innerWidth - 32 : newMaxWidth;
                const newContainerHeight = newContainerWidth / aspectRatio;

                if (containerRef.current) {
                    containerRef.current.style.width = `${newContainerWidth}px`;
                    containerRef.current.style.height = `${newContainerHeight}px`;
                }
            }, 150); // Debounce resize events
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, [fullScreen, aspectRatio]);

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

    // Calculate container dimensions with improved responsiveness
    const maxWidth = Math.min(1200, window.innerWidth - (fullScreen ? 32 : 64));
    const containerWidth = fullScreen ? window.innerWidth - 32 : maxWidth;
    const containerHeight = containerWidth / aspectRatio;

    // Zoom in/out handlers
    const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
    const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    const toggleFullScreen = () => setFullScreen(prev => !prev);

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

    // Get the currently selected table
    const selectedTable = selectedTableIndex !== null ? pageResult.tables[selectedTableIndex] : null;

    // Get the currently selected cell
    const selectedCell = selectedTable && selectedCellIndex !== null ? selectedTable.cells[selectedCellIndex] : null;

    // Function to export table data as CSV
    const exportTableAsCSV = (table: TableStructure) => {
        if (!table) return;

        // Create a 2D array to represent the table
        const grid: string[][] = Array(table.num_rows).fill(null).map(() =>
            Array(table.num_cols).fill('')
        );

        // Fill in the grid with cell data
        let rowIndex = 0;
        let colIndex = 0;

        // Sort cells by y1 (top) coordinate to process rows in order
        const sortedCells = [...table.cells].sort((a, b) => a.bbox.y1 - b.bbox.y1);

        // Group cells by rows based on y-coordinate proximity
        const rows: Cell[][] = [];
        let currentRow: Cell[] = [];
        let lastY = -1;

        sortedCells.forEach(cell => {
            if (lastY === -1 || Math.abs(cell.bbox.y1 - lastY) < 20) {
                // Same row
                currentRow.push(cell);
            } else {
                // New row
                if (currentRow.length > 0) {
                    rows.push([...currentRow]);
                }
                currentRow = [cell];
            }
            lastY = cell.bbox.y1;
        });

        // Add the last row
        if (currentRow.length > 0) {
            rows.push(currentRow);
        }

        // Sort each row by x-coordinate
        rows.forEach(row => {
            row.sort((a, b) => a.bbox.x1 - b.bbox.x1);
        });

        // Create CSV content
        const csvContent = rows.map(row =>
            row.map(cell => `"${cell.is_header ? 'Header' : 'Cell'} (${cell.row_span}x${cell.col_span})"`).join(',')
        ).join('\n');

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `table_page${pageResult.page_info.page_number}_table${selectedTableIndex !== null ? selectedTableIndex + 1 : 1}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper function to calculate grid positions for cells
    const calculateGridPositions = (table: TableStructure) => {
        if (!table || !table.cells || table.cells.length === 0) return [];

        const tableWidth = table.bbox.x2 - table.bbox.x1;
        const tableHeight = table.bbox.y2 - table.bbox.y1;
        const gridCellWidth = tableWidth / table.num_cols;
        const gridCellHeight = tableHeight / table.num_rows;

        // First, sort cells by their position (top to bottom, left to right)
        const sortedCells = [...table.cells].sort((a, b) => {
            if (Math.abs(a.bbox.y1 - b.bbox.y1) < gridCellHeight / 2) {
                // If cells are in the same row (approximately), sort by x-coordinate
                return a.bbox.x1 - b.bbox.x1;
            }
            // Otherwise, sort by y-coordinate
            return a.bbox.y1 - b.bbox.y1;
        });

        // Create a 2D grid to track cell occupancy
        const grid: number[][] = Array(table.num_rows).fill(null)
            .map(() => Array(table.num_cols).fill(-1));

        // Map cells to grid positions
        return sortedCells.map((cell, cellIndex) => {
            // Calculate the grid position of this cell
            const relX = cell.bbox.x1 - table.bbox.x1;
            const relY = cell.bbox.y1 - table.bbox.y1;

            // Estimate row and column indices
            let rowStart = Math.max(0, Math.floor(relY / gridCellHeight));
            let colStart = Math.max(0, Math.floor(relX / gridCellWidth));

            // Ensure we don't exceed grid boundaries
            rowStart = Math.min(rowStart, table.num_rows - 1);
            colStart = Math.min(colStart, table.num_cols - 1);

            // Calculate span based on width and height
            const actualCellWidth = cell.bbox.x2 - cell.bbox.x1;
            const actualCellHeight = cell.bbox.y2 - cell.bbox.y1;

            let colSpan = Math.max(1, Math.round(actualCellWidth / gridCellWidth));
            let rowSpan = Math.max(1, Math.round(actualCellHeight / gridCellHeight));

            // Ensure spans don't exceed grid boundaries
            colSpan = Math.min(colSpan, table.num_cols - colStart);
            rowSpan = Math.min(rowSpan, table.num_rows - rowStart);

            // Mark grid cells as occupied by this cell
            for (let r = rowStart; r < rowStart + rowSpan; r++) {
                for (let c = colStart; c < colStart + colSpan; c++) {
                    if (r < table.num_rows && c < table.num_cols) {
                        grid[r][c] = cellIndex;
                    }
                }
            }

            return {
                cell,
                cellIndex,
                gridPosition: {
                    rowStart,
                    colStart,
                    rowSpan,
                    colSpan
                }
            };
        });
    };

    return (
        <div className={cn(
            "w-full max-w-full overflow-hidden transition-all duration-300 ease-in-out",
            fullScreen ? "fixed inset-0 z-50 bg-white/95 backdrop-blur-sm p-4 lg:p-6" : "relative"
        )}>
            <div className="flex flex-col xl:flex-row gap-4 max-w-full">
                {/* Main content area with image and controls */}
                <div className="flex-grow flex flex-col space-y-4 min-w-0">
                    {/* Controls bar */}
                    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border shadow-sm">
                        <div className="flex items-center gap-4 flex-grow min-w-[200px]">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                <div className="text-sm font-medium truncate">
                                    Page {pageResult.page_info.page_number}
                                </div>
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                    {actualWidth}×{actualHeight}px
                                </Badge>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center bg-gray-50 rounded-md p-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={zoomOut}
                                    disabled={zoomLevel <= 0.5}
                                    className="h-8 w-8"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <div className="w-16 text-center text-sm font-medium">
                                    {Math.round(zoomLevel * 100)}%
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={zoomIn}
                                    disabled={zoomLevel >= 3}
                                    className="h-8 w-8"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={showGrid ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setShowGrid(prev => !prev)}
                                    className="h-8 whitespace-nowrap"
                                >
                                    <GridIcon className="h-4 w-4 mr-2" />
                                    {showGrid ? "Hide Grid" : "Show Grid"}
                                </Button>
                                <Button
                                    variant={debugMode ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setDebugMode(prev => !prev)}
                                    className="h-8"
                                >
                                    <InfoIcon className="h-4 w-4 mr-2" />
                                    Debug
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleFullScreen}
                                    className="h-8 whitespace-nowrap"
                                >
                                    {fullScreen ? (
                                        <Minimize2 className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Maximize2 className="h-4 w-4 mr-2" />
                                    )}
                                    {fullScreen ? "Exit" : "Fullscreen"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Image viewer with improved container */}
                    <div className="relative w-full overflow-hidden bg-[#f8fafc] rounded-lg border shadow-inner">
                        <div
                            ref={containerRef}
                            className="relative overflow-auto"
                            style={{
                                width: containerWidth,
                                height: containerHeight,
                                maxWidth: '100%',
                                maxHeight: fullScreen ? 'calc(100vh - 200px)' : '70vh'
                            }}
                        >
                            <div
                                className="transition-transform duration-200 ease-out"
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
                                    className="w-full h-full transition-opacity duration-300"
                                    style={{
                                        objectFit: 'contain',
                                        opacity: imageLoaded ? 1 : 0,
                                        maxWidth: '100%'
                                    }}
                                    onLoad={handleImageLoad}
                                />

                                {/* Tables overlay with improved styling */}
                                {imageLoaded && pageResult.tables.map((table, tableIndex) => {
                                    const { x1, y1, x2, y2 } = table.bbox;
                                    const isSelected = selectedTableIndex === tableIndex;

                                    const scaledX1 = x1 * scaleX;
                                    const scaledY1 = y1 * scaleY;
                                    const scaledWidth = (x2 - x1) * scaleX;
                                    const scaledHeight = (y2 - y1) * scaleY;

                                    return (
                                        <div
                                            key={`table-${tableIndex}`}
                                            className={cn(
                                                "absolute border-2 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg",
                                                isSelected
                                                    ? "border-blue-500 bg-blue-500/10 shadow-blue-500/20"
                                                    : "border-green-500 bg-green-500/5 hover:bg-green-500/10"
                                            )}
                                            style={{
                                                left: `${scaledX1}px`,
                                                top: `${scaledY1}px`,
                                                width: `${scaledWidth}px`,
                                                height: `${scaledHeight}px`,
                                            }}
                                            onClick={() => setSelectedTableIndex(isSelected ? null : tableIndex)}
                                        >
                                            <div className={cn(
                                                "absolute -top-6 left-0 px-3 py-1 text-xs font-medium rounded-t-md transition-all duration-200",
                                                isSelected ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                                            )}>
                                                Table {tableIndex + 1}
                                            </div>

                                            {/* Enhanced cell visualization */}
                                            {isSelected && showGrid && calculateGridPositions(table).map(({ cell, cellIndex, gridPosition }) => {
                                                const { rowStart, colStart, rowSpan, colSpan } = gridPosition;
                                                const isCellSelected = selectedCellIndex === cellIndex;

                                                const tableWidth = x2 - x1;
                                                const tableHeight = y2 - y1;
                                                const gridCellWidth = tableWidth / table.num_cols;
                                                const gridCellHeight = tableHeight / table.num_rows;

                                                const cellX = colStart * gridCellWidth;
                                                const cellY = rowStart * gridCellHeight;
                                                const cellWidth = colSpan * gridCellWidth;
                                                const cellHeight = rowSpan * gridCellHeight;

                                                const scaledCellX = cellX * scaleX;
                                                const scaledCellY = cellY * scaleY;
                                                const scaledCellWidth = cellWidth * scaleX;
                                                const scaledCellHeight = cellHeight * scaleY;

                                                return (
                                                    <div
                                                        key={`cell-${cellIndex}`}
                                                        className={cn(
                                                            "absolute border transition-all duration-200 hover:shadow-md",
                                                            isCellSelected
                                                                ? "border-purple-500 bg-purple-500/20 shadow-purple-500/20"
                                                                : cell.is_header
                                                                    ? "border-amber-500 bg-amber-500/20"
                                                                    : "border-gray-400 bg-white/50",
                                                            debugMode && "border-dashed border-2"
                                                        )}
                                                        style={{
                                                            left: `${scaledCellX}px`,
                                                            top: `${scaledCellY}px`,
                                                            width: `${scaledCellWidth}px`,
                                                            height: `${scaledCellHeight}px`,
                                                            zIndex: isCellSelected ? 10 : 5
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCellIndex(isCellSelected ? null : cellIndex);
                                                        }}
                                                    >
                                                        {cell.is_header && (
                                                            <div className="absolute top-0 left-0 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-br-sm">
                                                                Header
                                                            </div>
                                                        )}
                                                        {(rowSpan > 1 || colSpan > 1) && (
                                                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-tl-sm">
                                                                {rowSpan}×{colSpan}
                                                            </div>
                                                        )}
                                                        {debugMode && (
                                                            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono bg-black/5">
                                                                {cellIndex}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar with table details - now with improved styling */}
                <div className="w-full xl:w-96 flex-shrink-0 overflow-visible">
                    <div className="sticky top-4">
                        <Card className="shadow-lg border-gray-200">
                            <CardHeader className="pb-3 border-b bg-gray-50/50">
                                <CardTitle className="text-lg flex items-center space-x-2">
                                    <TableIcon className="h-5 w-5 text-primary" />
                                    <span>Table Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 max-h-[calc(100vh-300px)] overflow-auto">
                                {selectedTable ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="font-medium text-gray-600">Table:</div>
                                            <div className="font-mono">{selectedTableIndex !== null ? selectedTableIndex + 1 : ''}</div>

                                            <div className="font-medium text-gray-600">Dimensions:</div>
                                            <div className="font-mono">
                                                {selectedTable.num_rows} × {selectedTable.num_cols}
                                            </div>

                                            <div className="font-medium text-gray-600">Cells:</div>
                                            <div className="font-mono">{selectedTable.cells.length}</div>

                                            <div className="font-medium text-gray-600">Headers:</div>
                                            <div className="font-mono">{selectedTable.cells.filter(c => c.is_header).length}</div>

                                            <div className="font-medium text-gray-600">Confidence:</div>
                                            <div className="flex items-center">
                                                <Badge variant={getConfidenceBadgeVariant(selectedTable.confidence.score)}>
                                                    {Math.round(selectedTable.confidence.score * 100)}%
                                                </Badge>
                                            </div>

                                            <div className="font-medium text-gray-600">Position:</div>
                                            <div className="font-mono text-xs">
                                                ({selectedTable.bbox.x1.toFixed(0)}, {selectedTable.bbox.y1.toFixed(0)}) -
                                                ({selectedTable.bbox.x2.toFixed(0)}, {selectedTable.bbox.y2.toFixed(0)})
                                            </div>

                                            <div className="font-medium text-gray-600">Size:</div>
                                            <div className="font-mono">
                                                {Math.round(selectedTable.bbox.x2 - selectedTable.bbox.x1)} ×
                                                {Math.round(selectedTable.bbox.y2 - selectedTable.bbox.y1)} px
                                            </div>
                                        </div>

                                        {selectedCell && (
                                            <div className="border-t pt-4">
                                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                                    <GridIcon className="h-4 w-4 mr-2 text-primary" />
                                                    Selected Cell
                                                </h4>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="font-medium text-gray-600">Type:</div>
                                                    <div>
                                                        {selectedCell.is_header ? (
                                                            <Badge variant="secondary">Header</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Data</Badge>
                                                        )}
                                                    </div>

                                                    <div className="font-medium text-gray-600">Span:</div>
                                                    <div className="font-mono">
                                                        {selectedCell.row_span} × {selectedCell.col_span}
                                                    </div>

                                                    <div className="font-medium text-gray-600">Confidence:</div>
                                                    <div>
                                                        <Badge variant={getConfidenceBadgeVariant(selectedCell.confidence.score)}>
                                                            {Math.round(selectedCell.confidence.score * 100)}%
                                                        </Badge>
                                                    </div>

                                                    <div className="font-medium text-gray-600">Position:</div>
                                                    <div className="font-mono text-xs">
                                                        ({selectedCell.bbox.x1.toFixed(0)}, {selectedCell.bbox.y1.toFixed(0)}) -
                                                        ({selectedCell.bbox.x2.toFixed(0)}, {selectedCell.bbox.y2.toFixed(0)})
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="w-full shadow-sm hover:shadow-md transition-all duration-200"
                                                onClick={() => selectedTable && exportTableAsCSV(selectedTable)}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Export Table Data
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                                        <TableIcon className="h-12 w-12 mb-4 text-gray-300" />
                                        <p className="text-sm">
                                            Select a table to view its details
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Table structure visualization with improved styling */}
            {selectedTable && (
                <Card className="w-full shadow-lg mt-6 border-gray-200">
                    <CardHeader className="pb-3 border-b bg-gray-50/50">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <GridIcon className="h-5 w-5 text-primary" />
                                <span>Table Structure</span>
                            </div>
                            <Badge variant="outline" className="ml-2">
                                {selectedTable.num_rows} × {selectedTable.num_cols}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Visual representation of the detected table structure
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="overflow-auto border rounded-lg max-h-[500px]">
                            <table className="min-w-full divide-y divide-gray-200">
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* Create a grid based on the table dimensions */}
                                    {Array.from({ length: selectedTable.num_rows }).map((_, rowIndex) => (
                                        <tr key={`row-${rowIndex}`} className="divide-x divide-gray-200">
                                            {Array.from({ length: selectedTable.num_cols }).map((_, colIndex) => {
                                                // Get the grid positions for all cells
                                                const cellsWithGridPositions = calculateGridPositions(selectedTable);

                                                // Find a cell that starts at this grid position
                                                const cellWithPosition = cellsWithGridPositions.find(
                                                    ({ gridPosition }) =>
                                                        gridPosition.rowStart === rowIndex &&
                                                        gridPosition.colStart === colIndex
                                                );

                                                // If no cell starts at this position, check if it's covered by a spanning cell
                                                if (!cellWithPosition) {
                                                    // Check if this position is covered by a cell that spans multiple rows/columns
                                                    const coveringCell = cellsWithGridPositions.find(({ gridPosition }) => {
                                                        const rowEnd = gridPosition.rowStart + gridPosition.rowSpan - 1;
                                                        const colEnd = gridPosition.colStart + gridPosition.colSpan - 1;

                                                        return (
                                                            rowIndex >= gridPosition.rowStart &&
                                                            rowIndex <= rowEnd &&
                                                            colIndex >= gridPosition.colStart &&
                                                            colIndex <= colEnd
                                                        );
                                                    });

                                                    // If this position is covered by a spanning cell, don't render anything
                                                    if (coveringCell) {
                                                        return null;
                                                    }

                                                    // Otherwise, render an empty cell
                                                    return (
                                                        <td key={`cell-${rowIndex}-${colIndex}`} className="px-3 py-2 text-sm text-gray-400 text-center">
                                                            -
                                                        </td>
                                                    );
                                                }

                                                // Get the cell and its grid position
                                                const { cell, cellIndex, gridPosition } = cellWithPosition;
                                                const isCellSelected = selectedCellIndex === cellIndex;

                                                return (
                                                    <td
                                                        key={`cell-${rowIndex}-${colIndex}`}
                                                        className={cn(
                                                            "px-3 py-2 text-sm",
                                                            cell.is_header && "bg-amber-50 font-medium",
                                                            isCellSelected && "bg-purple-100",
                                                            (gridPosition.rowSpan > 1 || gridPosition.colSpan > 1) && "border-2 border-blue-200"
                                                        )}
                                                        rowSpan={gridPosition.rowSpan}
                                                        colSpan={gridPosition.colSpan}
                                                        onClick={() => setSelectedCellIndex(isCellSelected ? null : cellIndex)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span>
                                                                {cell.is_header ? 'Header' : 'Cell'} {cellIndex + 1}
                                                            </span>
                                                            {(gridPosition.rowSpan > 1 || gridPosition.colSpan > 1) && (
                                                                <Badge variant="outline" className="ml-1">
                                                                    {gridPosition.rowSpan}×{gridPosition.colSpan}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {debugMode && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Position: ({gridPosition.colStart},{gridPosition.rowStart})
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TableStructureVisualizer;
