import React, { useState, useEffect } from 'react';
import { TableStructureOutput, TableStructure, Cell } from '@/types/results/table-recognition';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import {
    Table as TableIcon,
    Grid,
    BarChart,
    Rows,
    Columns,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Eye,
    Table2,
    Rows as RowsIcon,
    Columns as ColumnsIcon,
    Grid as GridIcon
} from 'lucide-react';
import { BoundingBoxUtils } from '@/types/results/shared';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface TableStructureResultsProps {
    result: TableStructureOutput;
    pageUrls: string[];
}

type StructureView = 'table' | 'cells' | 'rows' | 'columns' | 'all';

const TableStructureResults: React.FC<TableStructureResultsProps> = ({ result, pageUrls }) => {
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
    const [structureView, setStructureView] = useState<StructureView[]>(['table']);

    // Reset selected table when result changes or component unmounts
    useEffect(() => {
        setSelectedTable(null);
        setSelectedPageIndex(0);
        setStructureView(['table']);
        return () => {
            setSelectedTable(null);
            setSelectedPageIndex(0);
            setStructureView(['table']);
        };
    }, [result]);

    const getConfidenceColor = (score: number) => {
        if (score >= 0.8) return 'text-green-500';
        if (score >= 0.6) return 'text-yellow-500';
        return 'text-red-500';
    };

    const renderTableOverlay = (
        table: TableStructure,
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
            >
                {/* Show cells */}
                {(structureView.includes('cells') || structureView.includes('all')) && (
                    <>
                        {table.cells.map((cell, cellIndex) => {
                            const cellBox = BoundingBoxUtils.toPercentages(cell.bbox, pageResult.page_info);
                            const relativeBox = {
                                x1: ((cellBox.x1 - percentageBox.x1) / (percentageBox.x2 - percentageBox.x1)) * 100,
                                y1: ((cellBox.y1 - percentageBox.y1) / (percentageBox.y2 - percentageBox.y1)) * 100,
                                x2: ((cellBox.x2 - percentageBox.x1) / (percentageBox.x2 - percentageBox.x1)) * 100,
                                y2: ((cellBox.y2 - percentageBox.y1) / (percentageBox.y2 - percentageBox.y1)) * 100,
                            };

                            return (
                                <div
                                    key={cellIndex}
                                    style={{
                                        position: 'absolute',
                                        left: `${relativeBox.x1}%`,
                                        top: `${relativeBox.y1}%`,
                                        width: `${relativeBox.x2 - relativeBox.x1}%`,
                                        height: `${relativeBox.y2 - relativeBox.y1}%`,
                                        border: '1px solid rgba(74, 222, 128, 0.5)',
                                        backgroundColor: cell.is_header ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0.1)',
                                    }}
                                />
                            );
                        })}
                    </>
                )}

                {/* Show rows */}
                {(structureView.includes('rows') || structureView.includes('all')) && (
                    <div className="absolute inset-0 flex flex-col">
                        {Array.from({ length: table.num_rows }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    borderBottom: '1px solid rgba(234, 179, 8, 0.5)',
                                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Show columns */}
                {(structureView.includes('columns') || structureView.includes('all')) && (
                    <div className="absolute inset-0 flex flex-row">
                        {Array.from({ length: table.num_cols }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    borderRight: '1px solid rgba(147, 51, 234, 0.5)',
                                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderStructureDetails = (pageResult: typeof result.results[0], tableIndex: number) => {
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
                            Structure details for table on page {pageResult.page_info.page_number}
                        </p>
                    </div>

                    <Separator />

                    {/* Confidence Score */}
                    <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Recognition Confidence
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
                            Recognition method: {table.confidence.method}
                        </p>
                    </div>

                    <Separator />

                    {/* View Controls */}
                    <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Controls
                        </h4>
                        <ToggleGroup
                            type="multiple"
                            value={structureView}
                            onValueChange={(value) => {
                                if (value.length > 0) setStructureView(value as StructureView[]);
                            }}
                        >
                            <ToggleGroupItem value="table" aria-label="Toggle table">
                                <Table2 className="h-4 w-4" />
                                <span className="ml-2">Table</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="cells" aria-label="Toggle cells">
                                <GridIcon className="h-4 w-4" />
                                <span className="ml-2">Cells</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="rows" aria-label="Toggle rows">
                                <RowsIcon className="h-4 w-4" />
                                <span className="ml-2">Rows</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="columns" aria-label="Toggle columns">
                                <ColumnsIcon className="h-4 w-4" />
                                <span className="ml-2">Columns</span>
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <Separator />

                    {/* Table Structure */}
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <Grid className="h-4 w-4" />
                            Table Structure
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 p-3 border rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Rows className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Rows</span>
                                </div>
                                <p className="text-2xl font-bold">{table.num_rows}</p>
                            </div>
                            <div className="space-y-2 p-3 border rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Columns className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Columns</span>
                                </div>
                                <p className="text-2xl font-bold">{table.num_cols}</p>
                            </div>
                        </div>

                        {/* Cell Structure Preview */}
                        <div className="border rounded-lg p-3 space-y-2">
                            <h5 className="font-medium text-sm">Structure Preview</h5>
                            <div className="relative border rounded overflow-hidden"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${table.num_cols}, minmax(30px, 1fr))`,
                                    gap: '1px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                    padding: '1px',
                                }}
                            >
                                {table.cells.map((cell, cellIndex) => {
                                    // Calculate the grid position based on the cell's bbox
                                    const cellStyle = {
                                        gridColumn: `span ${cell.col_span}`,
                                        gridRow: `span ${cell.row_span}`,
                                    };

                                    return (
                                        <div
                                            key={cellIndex}
                                            className={`
                                                p-1 min-h-[30px] flex items-center justify-center
                                                ${cell.is_header ? 'bg-primary/20 font-medium' : 'bg-card'}
                                                ${getConfidenceColor(cell.confidence.score)}
                                                border border-border/50 rounded-sm
                                                text-xs
                                            `}
                                            style={cellStyle}
                                            title={`Cell ${cellIndex + 1}
Confidence: ${(cell.confidence.score * 100).toFixed(1)}%
Spans: ${cell.row_span}×${cell.col_span}
${cell.is_header ? 'Header Cell' : 'Data Cell'}`}
                                        >
                                            {cell.row_span > 1 || cell.col_span > 1 ? (
                                                <span className="opacity-50">
                                                    {cell.row_span}×{cell.col_span}
                                                </span>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-primary/20 rounded-sm" />
                                    <span>Header Cell</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-card border border-border/50 rounded-sm" />
                                    <span>Data Cell</span>
                                </div>
                            </div>
                        </div>

                        {/* Table Properties */}
                        <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2">
                                <Grid className="h-4 w-4" />
                                Table Properties
                            </h4>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Header Cells</TableCell>
                                        <TableCell>{table.cells.filter(cell => cell.is_header).length}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Data Cells</TableCell>
                                        <TableCell>{table.cells.filter(cell => !cell.is_header).length}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Merged Cells</TableCell>
                                        <TableCell>{table.cells.filter(cell => cell.row_span > 1 || cell.col_span > 1).length}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Additional Metadata if available */}
                    {table.metadata && Object.keys(table.metadata).length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h4 className="font-medium">Additional Information</h4>
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
                            {/* Left column: Document page with structure boxes */}
                            <div className="flex-1 relative">
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

                            {/* Right column: Selected table structure details */}
                            <div className="flex-1 border rounded-lg p-4">
                                {selectedTable !== null && selectedPageIndex === pageIndex ? (
                                    renderStructureDetails(pageResult, selectedTable)
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
                                        <Grid className="h-12 w-12 text-muted-foreground/50" />
                                        <h3 className="font-medium text-muted-foreground">
                                            Select a table to view structure details
                                        </h3>
                                        <p className="text-sm text-muted-foreground/70">
                                            Click on any highlighted area to see detailed structure information
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

export default TableStructureResults; 