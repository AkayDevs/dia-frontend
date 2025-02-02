import React, { useState, useEffect } from 'react';
import { TableDetectionOutput } from '@/types/results/table-detection';
import { Card, CardContent } from '@/components/ui/card';
import { BoundingBox, BoundingBoxUtils } from '@/types/results/shared';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import {
    Table as TableIcon,
    Maximize2,
    BarChart,
    FileType,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';

interface TableDetectionResultsProps {
    result: TableDetectionOutput;
    pageUrls: string[];
}

const TableDetectionResults: React.FC<TableDetectionResultsProps> = ({
    result,
    pageUrls,
}) => {
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

    const renderTableDetails = (pageResult: typeof result.results[0], tableIndex: number) => {
        const table = pageResult.tables[tableIndex];
        const displayBox = BoundingBoxUtils.toDisplayFormat(table.bbox);

        return (
            <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
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
                            Details for the selected table on page {pageResult.page_info.page_number}
                        </p>
                    </div>

                    <Separator />

                    {/* Confidence Score */}
                    <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Confidence Score
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
                            Detection method: {table.confidence.method}
                        </p>
                    </div>

                    <Separator />

                    {/* Table Properties */}
                    <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                            <FileType className="h-4 w-4" />
                            Table Properties
                        </h4>
                        <Table>
                            <TableBody>
                                {table.table_type && (
                                    <TableRow>
                                        <TableCell className="font-medium">Type</TableCell>
                                        <TableCell>{table.table_type}</TableCell>
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell className="font-medium">Position</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Maximize2 className="h-4 w-4" />
                                                <span className="text-sm">
                                                    {displayBox.width.toFixed(0)}px × {displayBox.height.toFixed(0)}px
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                at ({displayBox.x.toFixed(0)}, {displayBox.y.toFixed(0)})
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Additional Metadata if available */}
                    {table.metadata && Object.keys(table.metadata).length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h4 className="font-medium">Additional Metadata</h4>
                                <Table>
                                    <TableBody>
                                        {Object.entries(table.metadata).map(([key, value]) => (
                                            <TableRow key={key}>
                                                <TableCell className="font-medium">
                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                </TableCell>
                                                <TableCell>{String(value)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>
        );
    };

    return (
        <div className="space-y-4">
            {result.results.map((pageResult, pageIndex) => (
                <Card key={pageIndex}>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Left column: Document page with bounding boxes */}
                            <div className="flex-1 relative">
                                <div className="relative" style={{ width: '100%', paddingBottom: '141.4%' }}>
                                    <img
                                        src={pageUrls[pageResult.page_info.page_number - 1]}
                                        alt={`Page ${pageResult.page_info.page_number}`}
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                    {pageResult.tables.map((table, tableIndex) => {
                                        const displayBox = BoundingBoxUtils.toDisplayFormat(table.bbox);
                                        const percentageBox = BoundingBoxUtils.toPercentages(table.bbox, pageResult.page_info);

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
                                                    border: selectedTable === tableIndex && selectedPageIndex === pageIndex
                                                        ? '2px solid red'
                                                        : '2px solid blue',
                                                    cursor: 'pointer',
                                                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right column: Selected table details */}
                            <div className="flex-1 border rounded-lg p-4">
                                {selectedTable !== null && selectedPageIndex === pageIndex ? (
                                    renderTableDetails(pageResult, selectedTable)
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
                                        <TableIcon className="h-12 w-12 text-muted-foreground/50" />
                                        <h3 className="font-medium text-muted-foreground">
                                            Select a table to view details
                                        </h3>
                                        <p className="text-sm text-muted-foreground/70">
                                            Click on any highlighted area to see detailed information
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

export default TableDetectionResults; 