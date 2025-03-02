import React, { useState, useEffect } from 'react';
import { TableDataOutput } from '@/types/results/table-data-extraction';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Table as TableIcon,
    Database,
    BarChart,
    FileType,
    CheckCircle2,
    AlertTriangle,
    Info
} from 'lucide-react';
import { BoundingBoxUtils } from '@/types/results/table_analysis/shared';

interface TableDataResultsProps {
    result: TableDataOutput;
    pageUrls: string[];
}

const TableDataResults: React.FC<TableDataResultsProps> = ({ result, pageUrls }) => {
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);

    // Reset selected table when result changes or component unmounts
    useEffect(() => {
        setSelectedTable(null);
        setSelectedPageIndex(0);
        return () => {
            setSelectedTable(null);
            setSelectedPageIndex(0);
        };
    }, [result]);

    const getConfidenceColor = (score: number) => {
        if (score >= 0.8) return 'text-green-500';
        if (score >= 0.6) return 'text-yellow-500';
        return 'text-red-500';
    };

    const renderTableOverlay = (
        table: typeof result.results[0]['tables'][0],
        tableIndex: number,
        pageResult: typeof result.results[0],
        pageIndex: number
    ) => {
        const percentageBox = BoundingBoxUtils.toPercentages(table.bbox, pageResult.page_info);
        const isSelected = selectedTable === tableIndex && selectedPageIndex === pageIndex;

        return (
            <div
                key={tableIndex}
                onClick={() => {
                    setSelectedTable(tableIndex);
                    setSelectedPageIndex(pageIndex);
                }}
                className="hover:bg-blue-500/20 transform hover:scale-[1.01] transition-all duration-200"
                style={{
                    position: 'absolute',
                    left: `${percentageBox.x1}%`,
                    top: `${percentageBox.y1}%`,
                    width: `${percentageBox.x2 - percentageBox.x1}%`,
                    height: `${percentageBox.y2 - percentageBox.y1}%`,
                    border: isSelected ? '2px solid red' : '2px solid blue',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                }}
            />
        );
    };

    const renderTableData = (pageResult: typeof result.results[0], tableIndex: number) => {
        const table = pageResult.tables[tableIndex];

        return (
            <div className="h-full flex flex-col">
                {/* Header Section - Fixed */}
                <div className="space-y-6 mb-4">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TableIcon className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-lg">
                                    Table {tableIndex + 1}
                                </h3>
                            </div>
                            <Badge variant={table.confidence.score >= 0.8 ? "default" : "secondary"}>
                                Page {pageResult.page_info.page_number}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Extracted data from table on page {pageResult.page_info.page_number}
                        </p>
                    </div>

                    <Separator />

                    {/* Confidence Score */}
                    <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Extraction Confidence
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${getConfidenceColor(table.confidence.score)}`}>
                                {(table.confidence.score * 100).toFixed(1)}%
                            </span>
                            {table.confidence.score >= 0.8 ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Extraction method: {table.confidence.method}
                        </p>
                    </div>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="flex-1 -mx-4 px-4">
                    <div className="space-y-6">
                        {/* Table Data */}
                        <div className="space-y-4">
                            <h4 className="font-medium flex items-center gap-2 sticky top-0 bg-background py-2">
                                <Database className="h-4 w-4" />
                                Extracted Data
                            </h4>
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background">
                                            <TableRow>
                                                {table.cells[0].map((_, colIndex) => (
                                                    <TableHead
                                                        key={colIndex}
                                                        className="text-center whitespace-nowrap px-4"
                                                    >
                                                        Column {colIndex + 1}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {table.cells.map((row, rowIndex) => (
                                                <TableRow key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <TableCell
                                                            key={cellIndex}
                                                            className="relative group align-top px-4"
                                                        >
                                                            <div className="space-y-1 min-w-[120px]">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <span className="font-medium break-words">{cell.text}</span>
                                                                    {cell.data_type && (
                                                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                                                            {cell.data_type}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className={`text-xs ${getConfidenceColor(cell.confidence.score)}`}>
                                                                    Confidence: {(cell.confidence.score * 100).toFixed(1)}%
                                                                </div>
                                                                {cell.normalized_value && (
                                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        <Info className="h-3 w-3 flex-shrink-0" />
                                                                        <span className="break-words">
                                                                            Normalized: {cell.normalized_value}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                        {/* Table Stats */}
                        <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2">
                                <FileType className="h-4 w-4" />
                                Data Statistics
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="border rounded-lg p-3 space-y-1">
                                    <div className="text-sm text-muted-foreground">Total Cells</div>
                                    <div className="text-2xl font-bold">
                                        {table.cells.reduce((acc, row) => acc + row.length, 0)}
                                    </div>
                                </div>
                                <div className="border rounded-lg p-3 space-y-1">
                                    <div className="text-sm text-muted-foreground">Rows</div>
                                    <div className="text-2xl font-bold">{table.cells.length}</div>
                                </div>
                                <div className="border rounded-lg p-3 space-y-1">
                                    <div className="text-sm text-muted-foreground">Columns</div>
                                    <div className="text-2xl font-bold">{table.cells[0]?.length || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {result.results.map((pageResult, pageIndex) => (
                <Card key={pageIndex}>
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left column: Document page with table boxes */}
                            <div className="w-full lg:w-[45%] xl:w-[40%] flex-shrink-0">
                                <div className="relative" style={{ width: '100%', paddingBottom: '141.4%' }}>
                                    <img
                                        src={pageUrls[pageResult.page_info.page_number - 1]}
                                        alt={`Page ${pageResult.page_info.page_number}`}
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                    {pageResult.tables.map((table, tableIndex) =>
                                        renderTableOverlay(table, tableIndex, pageResult, pageIndex)
                                    )}
                                </div>
                            </div>

                            {/* Right column: Selected table data */}
                            <div className="w-full lg:flex-1 border rounded-lg p-4 min-h-[600px] lg:min-h-0 lg:h-[800px]">
                                {selectedTable !== null && selectedPageIndex === pageIndex ? (
                                    renderTableData(pageResult, selectedTable)
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
                                        <Database className="h-12 w-12 text-muted-foreground/50" />
                                        <h3 className="font-medium text-muted-foreground">
                                            Select a table to view extracted data
                                        </h3>
                                        <p className="text-sm text-muted-foreground/70">
                                            Click on any highlighted area to see the extracted table data
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default TableDataResults; 