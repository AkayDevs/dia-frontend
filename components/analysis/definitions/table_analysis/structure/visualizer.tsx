import { useState, useRef, useEffect } from 'react';
import { BaseStepComponentProps } from "@/components/analysis/definitions/base";
import { useDocumentStore } from '@/store/useDocumentStore';
import { TableStructureOutput, PageTableStructureResult, TableStructure, Cell } from '@/types/analysis/definitions/table_analysis/table_structure';
import { DocumentPage } from '@/types/document';
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
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

    // Cast stepResult to TableStructureOutput
    const tableStructureResult = stepResult?.result as TableStructureOutput | undefined;

    useEffect(() => {
        if (documentId) {
            fetchDocumentPages(documentId);
        }
    }, [documentId, fetchDocumentPages]);

    // Set active tab to the first page with tables when results load
    useEffect(() => {
        if (tableStructureResult?.results && tableStructureResult.results.length > 0) {
            setActiveTab(tableStructureResult.results[0].page_info.page_number.toString());
        }
    }, [tableStructureResult]);

    if (!stepResult) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Table Structure Analysis</CardTitle>
                    <CardDescription>Loading table structure analysis results...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-[400px] w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!tableStructureResult || !tableStructureResult.results || tableStructureResult.results.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Table Structure Analysis</CardTitle>
                    <CardDescription>No table structure results available</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>No tables found</AlertTitle>
                        <AlertDescription>
                            No table structures were detected in this document. Please check if the document contains tables or try adjusting the analysis parameters.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    // If pages are loading, show skeleton
    if (isPagesLoading) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Table Structure Analysis</CardTitle>
                        <CardDescription>Loading document pages...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[600px] w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If there's an error loading pages, show error message
    if (pagesError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading document pages</AlertTitle>
                <AlertDescription>{pagesError}</AlertDescription>
            </Alert>
        );
    }

    // If no pages are available, show message
    if (!currentPages || !currentPages.pages || currentPages.pages.length === 0) {
        return (
            <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>No document pages available</AlertTitle>
                <AlertDescription>
                    The document pages could not be loaded. Please check if the document exists.
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

    // Get the page results
    const pageResults = tableStructureResult.results;

    // Count total tables across all pages
    const totalTables = pageResults.reduce((sum, page) => sum + page.tables.length, 0);

    return (
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
                        <TabsList className="mb-4 flex flex-wrap">
                            {pageResults.map((pageResult) => (
                                <TabsTrigger
                                    key={`tab-${pageResult.page_info.page_number}`}
                                    value={pageResult.page_info.page_number.toString()}
                                    className="flex items-center"
                                >
                                    Page {pageResult.page_info.page_number}
                                    {pageResult.tables.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
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
                                    <PageTableStructureVisualizer
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
                </CardContent>
            </Card>
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
    const containerWidth = fullScreen ? window.innerWidth - 64 : maxWidth;
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

        return table.cells.map(cell => {
            // Calculate the grid position of this cell
            const relX = cell.bbox.x1 - table.bbox.x1;
            const relY = cell.bbox.y1 - table.bbox.y1;

            // Estimate row and column indices
            const colStart = Math.max(0, Math.floor(relX / gridCellWidth));
            const rowStart = Math.max(0, Math.floor(relY / gridCellHeight));

            // Calculate span based on width and height
            const actualCellWidth = cell.bbox.x2 - cell.bbox.x1;
            const actualCellHeight = cell.bbox.y2 - cell.bbox.y1;

            const colSpan = Math.max(1, Math.round(actualCellWidth / gridCellWidth));
            const rowSpan = Math.max(1, Math.round(actualCellHeight / gridCellHeight));

            return {
                cell,
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
        <div className={cn("space-y-4", fullScreen && "fixed inset-0 z-50 bg-white p-6")}>
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Image container with zoom controls */}
                <div className="flex flex-col space-y-2 flex-grow">
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
                                title="Zoom out"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={zoomIn}
                                disabled={zoomLevel >= 3}
                                title="Zoom in"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowGrid(prev => !prev)}
                                title={showGrid ? "Hide grid" : "Show grid"}
                            >
                                <GridIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleFullScreen}
                                title={fullScreen ? "Exit full screen" : "Full screen"}
                            >
                                {fullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant={debugMode ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setDebugMode(prev => !prev)}
                                title="Toggle debug mode"
                                className="ml-2"
                            >
                                Debug
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

                            {/* Only render tables and cells after image is loaded */}
                            {imageLoaded && pageResult.tables.map((table, tableIndex) => {
                                const { x1, y1, x2, y2 } = table.bbox;
                                const isSelected = selectedTableIndex === tableIndex;

                                // Scale coordinates to match the displayed image size
                                const scaledX1 = x1 * scaleX;
                                const scaledY1 = y1 * scaleY;
                                const scaledWidth = (x2 - x1) * scaleX;
                                const scaledHeight = (y2 - y1) * scaleY;

                                return (
                                    <div
                                        key={`table-${tableIndex}`}
                                        className={cn(
                                            "absolute border-2 cursor-pointer transition-all duration-200",
                                            isSelected
                                                ? "border-blue-500 bg-blue-500/10"
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
                                        {/* Table label */}
                                        <div className={cn(
                                            "absolute top-0 left-0 transform -translate-y-full px-2 py-1 text-xs font-medium rounded-t-sm",
                                            isSelected ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                                        )}>
                                            Table {tableIndex + 1}
                                        </div>

                                        {/* Only show cells for the selected table */}
                                        {isSelected && showGrid && table.cells.map((cell, cellIndex) => {
                                            const { x1: cellX1, y1: cellY1, x2: cellX2, y2: cellY2 } = cell.bbox;
                                            const isCellSelected = selectedCellIndex === cellIndex;

                                            // Calculate cell position relative to the table
                                            // This ensures cells are positioned correctly within the table boundaries
                                            const relativeX = cellX1 - x1;
                                            const relativeY = cellY1 - y1;
                                            const cellWidth = cellX2 - cellX1;
                                            const cellHeight = cellY2 - cellY1;

                                            // Scale cell coordinates
                                            const scaledRelativeX = relativeX * scaleX;
                                            const scaledRelativeY = relativeY * scaleY;
                                            const scaledCellWidth = cellWidth * scaleX;
                                            const scaledCellHeight = cellHeight * scaleY;

                                            return (
                                                <div
                                                    key={`cell-${cellIndex}`}
                                                    className={cn(
                                                        "absolute border transition-all duration-200",
                                                        isCellSelected
                                                            ? "border-purple-500 bg-purple-500/20"
                                                            : cell.is_header
                                                                ? "border-amber-500 bg-amber-500/20"
                                                                : "border-gray-400 bg-white/50",
                                                        debugMode && "border-dashed border-2"
                                                    )}
                                                    style={{
                                                        left: `${scaledRelativeX}px`,
                                                        top: `${scaledRelativeY}px`,
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
                                                        <div className="absolute top-0 left-0 bg-amber-500 text-white text-xs px-1 rounded-br-sm">
                                                            H
                                                        </div>
                                                    )}
                                                    {(cell.row_span > 1 || cell.col_span > 1) && (
                                                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-tl-sm">
                                                            {cell.row_span}×{cell.col_span}
                                                        </div>
                                                    )}
                                                    {debugMode && (
                                                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-700 font-mono">
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

                {/* Table and cell details */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Table Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedTable ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="font-medium">Table:</div>
                                        <div>{selectedTableIndex !== null ? selectedTableIndex + 1 : ''}</div>

                                        <div className="font-medium">Dimensions:</div>
                                        <div>
                                            {selectedTable.num_rows} × {selectedTable.num_cols} cells
                                        </div>

                                        <div className="font-medium">Cells:</div>
                                        <div>{selectedTable.cells.length}</div>

                                        <div className="font-medium">Headers:</div>
                                        <div>{selectedTable.cells.filter(c => c.is_header).length}</div>

                                        <div className="font-medium">Confidence:</div>
                                        <div className="flex items-center">
                                            <Badge variant={getConfidenceBadgeVariant(selectedTable.confidence.score)}>
                                                {Math.round(selectedTable.confidence.score * 100)}%
                                            </Badge>
                                        </div>

                                        <div className="font-medium">Position:</div>
                                        <div className="text-xs">
                                            ({selectedTable.bbox.x1.toFixed(0)}, {selectedTable.bbox.y1.toFixed(0)}) -
                                            ({selectedTable.bbox.x2.toFixed(0)}, {selectedTable.bbox.y2.toFixed(0)})
                                        </div>

                                        <div className="font-medium">Size:</div>
                                        <div>
                                            {Math.round(selectedTable.bbox.x2 - selectedTable.bbox.x1)} ×
                                            {Math.round(selectedTable.bbox.y2 - selectedTable.bbox.y1)} px
                                        </div>
                                    </div>

                                    {selectedCell && (
                                        <>
                                            <div className="border-t pt-3">
                                                <h4 className="font-medium mb-2">Selected Cell</h4>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="font-medium">Type:</div>
                                                    <div>
                                                        {selectedCell.is_header ? (
                                                            <Badge variant="secondary">Header</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Data</Badge>
                                                        )}
                                                    </div>

                                                    <div className="font-medium">Span:</div>
                                                    <div>
                                                        {selectedCell.row_span} × {selectedCell.col_span}
                                                    </div>

                                                    <div className="font-medium">Confidence:</div>
                                                    <div>
                                                        <Badge variant={getConfidenceBadgeVariant(selectedCell.confidence.score)}>
                                                            {Math.round(selectedCell.confidence.score * 100)}%
                                                        </Badge>
                                                    </div>

                                                    <div className="font-medium">Position:</div>
                                                    <div className="text-xs">
                                                        ({selectedCell.bbox.x1.toFixed(0)}, {selectedCell.bbox.y1.toFixed(0)}) -
                                                        ({selectedCell.bbox.x2.toFixed(0)}, {selectedCell.bbox.y2.toFixed(0)})
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => selectedTable && exportTableAsCSV(selectedTable)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Table Data
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
                </div>
            </div>

            {/* Table structure visualization */}
            {selectedTable && (
                <Card className="w-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Table Structure</CardTitle>
                        <CardDescription>
                            Visual representation of the table structure with {selectedTable.num_rows} rows and {selectedTable.num_cols} columns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto border rounded-md">
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
                                                const { cell, gridPosition } = cellWithPosition;
                                                const cellIndex = selectedTable.cells.indexOf(cell);
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
