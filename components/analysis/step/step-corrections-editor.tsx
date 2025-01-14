'use client';

import { useState, useEffect } from 'react';
import { TableDetectionOutput, TableStructureOutput, TableDataOutput } from '@/types/results';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface StepCorrectionsEditorProps {
    stepId: string;
    result: Record<string, any> | null;
    corrections: Record<string, any> | null | undefined;
    onChange: (corrections: Record<string, any>) => void;
}

export function StepCorrectionsEditor({
    stepId,
    result,
    corrections,
    onChange
}: StepCorrectionsEditorProps) {
    const [activeTab, setActiveTab] = useState('tables');

    if (!result) return null;

    const handleTableRemoval = (tableIndex: number, pageIndex: number) => {
        const newCorrections = { ...(corrections || {}) };
        if (!newCorrections.removed_tables) {
            newCorrections.removed_tables = [];
        }

        if (stepId.includes('table_detection')) {
            const output = result as TableDetectionOutput;
            const table = output.results[pageIndex].tables[tableIndex];
            newCorrections.removed_tables.push(table.bbox);
        }

        onChange(newCorrections);
    };

    const handleCellCorrection = (
        tableIndex: number,
        rowIndex: number,
        colIndex: number,
        value: string
    ) => {
        const newCorrections = { ...(corrections || {}) };
        if (!newCorrections.cell_corrections) {
            newCorrections.cell_corrections = {};
        }

        const key = `${tableIndex}-${rowIndex}-${colIndex}`;
        newCorrections.cell_corrections[key] = value;

        onChange(newCorrections);
    };

    const renderTableDetectionEditor = (output: TableDetectionOutput) => (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Detected Tables</h3>
            {output.results.map((pageResult, pageIndex) => (
                <div key={pageIndex} className="space-y-2">
                    <h4 className="font-medium">Page {pageResult.page_info.page_number}</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Table</TableHead>
                                <TableHead>Confidence</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageResult.tables.map((table, tableIndex) => (
                                <TableRow key={tableIndex}>
                                    <TableCell>Table {tableIndex + 1}</TableCell>
                                    <TableCell>
                                        {Math.round(table.confidence.score * 100)}%
                                    </TableCell>
                                    <TableCell>{table.table_type || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleTableRemoval(tableIndex, pageIndex)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ))}
        </div>
    );

    const renderTableStructureEditor = (output: TableStructureOutput) => (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Table Structure</h3>
            {output.results.map((pageResult, pageIndex) => (
                <div key={pageIndex} className="space-y-2">
                    <h4 className="font-medium">Page {pageResult.page_info.page_number}</h4>
                    {pageResult.tables.map((table, tableIndex) => (
                        <div key={tableIndex} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h5 className="font-medium">Table {tableIndex + 1}</h5>
                                <div className="space-x-2">
                                    <Label>Rows: {table.num_rows}</Label>
                                    <Label>Columns: {table.num_cols}</Label>
                                </div>
                            </div>
                            <ScrollArea className="h-[200px]">
                                <div className="grid" style={{
                                    gridTemplateColumns: `repeat(${table.num_cols}, minmax(100px, 1fr))`
                                }}>
                                    {table.cells.map((cell, cellIndex) => (
                                        <div
                                            key={cellIndex}
                                            className={`p-2 border ${cell.is_header ? 'bg-muted' : ''
                                                }`}
                                            style={{
                                                gridColumn: `span ${cell.col_span}`,
                                                gridRow: `span ${cell.row_span}`
                                            }}
                                        >
                                            <Switch
                                                checked={cell.is_header}
                                                onCheckedChange={(checked) => {
                                                    const newCorrections = { ...(corrections || {}) };
                                                    if (!newCorrections.header_corrections) {
                                                        newCorrections.header_corrections = {};
                                                    }
                                                    newCorrections.header_corrections[cellIndex] = checked;
                                                    onChange(newCorrections);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    const renderTableDataEditor = (output: TableDataOutput) => (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Table Data</h3>
            {output.results.map((pageResult, pageIndex) => (
                <div key={pageIndex} className="space-y-2">
                    <h4 className="font-medium">Page {pageResult.page_info.page_number}</h4>
                    {pageResult.tables.map((table, tableIndex) => (
                        <div key={tableIndex} className="space-y-2">
                            <h5 className="font-medium">Table {tableIndex + 1}</h5>
                            <ScrollArea className="h-[300px]">
                                <Table>
                                    <TableBody>
                                        {table.cells.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {row.map((cell, colIndex) => (
                                                    <TableCell
                                                        key={colIndex}
                                                        className={
                                                            cell.confidence.score < 0.8
                                                                ? 'bg-red-100'
                                                                : ''
                                                        }
                                                    >
                                                        <Input
                                                            value={
                                                                (corrections?.cell_corrections?.[
                                                                    `${tableIndex}-${rowIndex}-${colIndex}`
                                                                ]) || cell.text
                                                            }
                                                            onChange={(e) =>
                                                                handleCellCorrection(
                                                                    tableIndex,
                                                                    rowIndex,
                                                                    colIndex,
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            {stepId.includes('table_detection') && renderTableDetectionEditor(result as TableDetectionOutput)}
            {stepId.includes('table_structure') && renderTableStructureEditor(result as TableStructureOutput)}
            {stepId.includes('table_data') && renderTableDataEditor(result as TableDataOutput)}
        </div>
    );
} 