'use client';

import { useState } from 'react';
import { BaseEditorProps, TableData } from './types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Edit2, Save, Plus, Trash2, AlertCircle } from 'lucide-react';

const DEFAULT_TABLE_DATA: TableData = {
    headers: ['Column 1'],
    rows: [['No data']]
};

export function TableEditor({ analysis, onSave, isEditable = true }: BaseEditorProps) {
    const [editMode, setEditMode] = useState(false);
    const tableDetectionResult = analysis.result as TableDetectionResult;
    const firstTable = tableDetectionResult?.pages?.[0]?.tables?.[0];
    const confidence = firstTable?.confidence_score || 0;

    const [tableData, setTableData] = useState<TableData>(() => {
        try {
            if (!firstTable || !Array.isArray(firstTable.cells)) {
                console.warn('Invalid table data format, using default');
                return DEFAULT_TABLE_DATA;
            }

            // Convert cells array to headers and rows
            const maxRow = Math.max(...firstTable.cells.map(cell => cell.row_index));
            const maxCol = Math.max(...firstTable.cells.map(cell => cell.col_index));

            // Initialize empty grid
            const grid: string[][] = Array(maxRow + 1).fill(null)
                .map(() => Array(maxCol + 1).fill(''));

            // Fill in the cells
            firstTable.cells.forEach(cell => {
                grid[cell.row_index][cell.col_index] = cell.content;
            });

            // Extract headers and rows
            const headers = grid[0];
            const rows = grid.slice(1);

            return {
                headers,
                rows
            };
        } catch (error) {
            console.warn('Error parsing table data, using default:', error);
            return DEFAULT_TABLE_DATA;
        }
    });
    const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);

    // Check if data is valid
    const isValidData = tableData && Array.isArray(tableData.headers) && Array.isArray(tableData.rows);

    if (!isValidData) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Invalid table data format. Please check the analysis results.
                </AlertDescription>
            </Alert>
        );
    }

    const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
        const newData = { ...tableData };
        if (colIndex === -1) {
            // Editing header
            newData.headers[rowIndex] = value;
        } else {
            newData.rows[rowIndex][colIndex] = value;
        }
        setTableData(newData);
    };

    const handleAddRow = () => {
        const newData = { ...tableData };
        newData.rows.push(new Array(tableData.headers.length).fill(''));
        setTableData(newData);
    };

    const handleAddColumn = () => {
        const newData = { ...tableData };
        newData.headers.push('New Column');
        newData.rows = newData.rows.map(row => [...row, '']);
        setTableData(newData);
    };

    const handleDeleteRow = (index: number) => {
        const newData = { ...tableData };
        newData.rows.splice(index, 1);
        // Ensure at least one row remains
        if (newData.rows.length === 0) {
            newData.rows.push(new Array(tableData.headers.length).fill(''));
        }
        setTableData(newData);
    };

    const handleDeleteColumn = (index: number) => {
        const newData = { ...tableData };
        newData.headers.splice(index, 1);
        newData.rows = newData.rows.map(row => {
            row.splice(index, 1);
            return row;
        });
        // Ensure at least one column remains
        if (newData.headers.length === 0) {
            newData.headers.push('Column 1');
            newData.rows = newData.rows.map(() => ['']);
        }
        setTableData(newData);
    };

    const handleSave = async () => {
        if (onSave) {
            await onSave(tableData);
        }
        setEditMode(false);
    };

    return (
        <Card className="w-full">
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Badge variant="outline">
                        Confidence: {(confidence * 100).toFixed(1)}%
                    </Badge>
                    {confidence < 0.7 && (
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Low confidence detection. Please review the results carefully.
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                {isEditable && (
                    <div className="flex gap-2">
                        {editMode ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddColumn}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Column
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddRow}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Row
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSave}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditMode(true)}
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Table
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <ScrollArea className="h-[500px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {tableData.headers.map((header, index) => (
                                <TableHead key={index} className="min-w-[150px]">
                                    <div className="flex items-center gap-2">
                                        {editMode && editingCell?.row === index && editingCell.col === -1 ? (
                                            <Input
                                                value={header}
                                                onChange={(e) => handleCellEdit(index, -1, e.target.value)}
                                                onBlur={() => setEditingCell(null)}
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                className={editMode ? 'cursor-pointer hover:text-primary' : ''}
                                                onClick={() => editMode && setEditingCell({ row: index, col: -1 })}
                                            >
                                                {header}
                                            </span>
                                        )}
                                        {editMode && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteColumn(index)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <TableCell key={colIndex}>
                                        {editMode && editingCell?.row === rowIndex && editingCell.col === colIndex ? (
                                            <Input
                                                value={cell}
                                                onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                                                onBlur={() => setEditingCell(null)}
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                className={editMode ? 'cursor-pointer hover:text-primary' : ''}
                                                onClick={() => editMode && setEditingCell({ row: rowIndex, col: colIndex })}
                                            >
                                                {cell}
                                            </span>
                                        )}
                                    </TableCell>
                                ))}
                                {editMode && (
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteRow(rowIndex)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </Card>
    );
} 