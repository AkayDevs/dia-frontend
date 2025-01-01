import { useState, useRef, useEffect } from 'react';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import {
    Edit2,
    Save,
    SplitSquareHorizontal,
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    FileDown,
    Trash2,
    Plus,
    Grid,
    ArrowLeftRight,
    Unlink,
    ArrowRight,
    ArrowDown,
    TableProperties,
    RowsIcon,
    ColumnsIcon,
    Merge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DetectedTable, TableCell as ITableCell, TableRow as ITableRow } from '@/types/results';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface TableComparisonProps {
    original: DetectedTable;
    detected: DetectedTable;
    onSave?: (table: DetectedTable) => void;
}

interface TableToolbarProps {
    selectedCells: { startRow: number; startCol: number; endRow: number; endCol: number } | null;
    onMerge: () => void;
    onUnmerge: () => void;
    onAddRow: () => void;
    onDeleteRow: () => void;
    onAddColumn: () => void;
    onDeleteColumn: () => void;
}

interface MergedCell extends ITableCell {
    rowSpan: number;
    colSpan: number;
}

function isMergedCell(cell: ITableCell): cell is MergedCell {
    return typeof cell.rowSpan === 'number' &&
        typeof cell.colSpan === 'number' &&
        cell.rowSpan > 1;
}

function TableToolbar({
    selectedCells,
    onMerge,
    onUnmerge,
    onAddRow,
    onDeleteRow,
    onAddColumn,
    onDeleteColumn
}: TableToolbarProps) {
    const hasSelection = selectedCells !== null;
    const isSingleCell = hasSelection &&
        selectedCells.startRow === selectedCells.endRow &&
        selectedCells.startCol === selectedCells.endCol;

    return (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-background shadow-sm">
            <TableProperties className="h-4 w-4 text-muted-foreground" />
            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddRow}
                    className="h-8"
                    title="Add row"
                >
                    <RowsIcon className="h-4 w-4 mr-1" />
                    Add Row
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDeleteRow}
                    className="h-8"
                    disabled={!hasSelection}
                    title="Delete row"
                >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Row
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddColumn}
                    className="h-8"
                    title="Add column"
                >
                    <ColumnsIcon className="h-4 w-4 mr-1" />
                    Add Column
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDeleteColumn}
                    className="h-8"
                    disabled={!hasSelection}
                    title="Delete column"
                >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Column
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMerge}
                    className="h-8"
                    disabled={!hasSelection || isSingleCell}
                    title="Merge selected cells"
                >
                    <Merge className="h-4 w-4 mr-1" />
                    Merge
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUnmerge}
                    className="h-8"
                    disabled={!isSingleCell}
                    title="Unmerge cell"
                >
                    <Unlink className="h-4 w-4 mr-1" />
                    Unmerge
                </Button>
            </div>
        </div>
    );
}

export function TableComparison({ original, detected, onSave }: TableComparisonProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSideView, setIsSideView] = useState(true);
    const [showDiff, setShowDiff] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTable, setEditedTable] = useState<DetectedTable>(JSON.parse(JSON.stringify(detected))); // Deep copy
    const [selectedCells, setSelectedCells] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<{ row: number; col: number } | null>(null);
    const [editingCell, setEditingCell] = useState<{ row: number; col: number; value: string } | null>(null);

    // Handle cell edit
    const handleCellEdit = (rowIndex: number, cellIndex: number, value: string) => {
        const newTable = { ...editedTable };
        newTable.rows[rowIndex].cells[cellIndex].content = value;
        setEditedTable(newTable);
        setEditingCell(null);
    };

    // Handle cell click for editing
    const handleCellClick = (rowIndex: number, cellIndex: number) => {
        if (!isEditing) return;

        const cell = editedTable.rows[rowIndex].cells[cellIndex];
        if (cell.hidden) return;

        setEditingCell({
            row: rowIndex,
            col: cellIndex,
            value: cell.content
        });
        setSelectedCells(null);
        setIsSelecting(false);
        setSelectionStart(null);
    };

    // Handle cell selection for merging
    const handleCellMouseDown = (rowIndex: number, cellIndex: number, event: React.MouseEvent) => {
        if (!isEditing || editingCell) return;
        if (event.button !== 0) return; // Only handle left mouse button

        const cell = editedTable.rows[rowIndex].cells[cellIndex];
        if (cell.hidden) return;

        event.preventDefault(); // Prevent text selection
        setIsSelecting(true);
        setSelectionStart({ row: rowIndex, col: cellIndex });
        setSelectedCells({
            startRow: rowIndex,
            startCol: cellIndex,
            endRow: rowIndex,
            endCol: cellIndex
        });
        setEditingCell(null);
    };

    const handleCellMouseEnter = (rowIndex: number, cellIndex: number) => {
        if (!isSelecting || !selectionStart) return;

        const cell = editedTable.rows[rowIndex].cells[cellIndex];
        if (cell.hidden) return;

        // Check if we can form a valid rectangle
        const startRow = Math.min(selectionStart.row, rowIndex);
        const endRow = Math.max(selectionStart.row, rowIndex);
        const startCol = Math.min(selectionStart.col, cellIndex);
        const endCol = Math.max(selectionStart.col, cellIndex);

        // Check if any cell in the selection is already merged or hidden
        let canSelect = true;
        for (let i = startRow; i <= endRow; i++) {
            // Start of Selection
            for (let j = startCol; j <= endCol; j++) {
                const cell = editedTable.rows[i].cells[j];
                const rowSpan = cell.rowSpan ?? 1;
                const colSpan = cell.colSpan ?? 1;
                if (cell.hidden || rowSpan > 1 || colSpan > 1) {
                    canSelect = false;
                    break;
                }
            }
            if (!canSelect) break;
        }

        if (canSelect) {
            setSelectedCells({
                startRow,
                startCol,
                endRow,
                endCol
            });
        }
    };

    const handleCellMouseUp = () => {
        setIsSelecting(false);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsSelecting(false);
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    // Handle cell merge
    const handleCellMerge = () => {
        if (!selectedCells) return;
        const { startRow, startCol, endRow, endCol } = selectedCells;

        const newTable = { ...editedTable };
        const mergedCell: ITableCell = {
            content: newTable.rows[startRow].cells[startCol].content,
            rowSpan: endRow - startRow + 1,
            colSpan: endCol - startCol + 1,
            confidence: newTable.rows[startRow].cells[startCol].confidence,
        };

        // Update merged cells structure
        if (!newTable.structure.mergedCells) {
            newTable.structure.mergedCells = [];
        }
        newTable.structure.mergedCells.push({ startRow, startCol, endRow, endCol });

        // Update the table cells
        newTable.rows[startRow].cells[startCol] = mergedCell;

        // Hide merged cells
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startCol; j <= endCol; j++) {
                if (i === startRow && j === startCol) continue;
                newTable.rows[i].cells[j] = { ...newTable.rows[i].cells[j], hidden: true };
            }
        }

        setEditedTable(newTable);
        setSelectedCells(null);
    };

    // Handle cell unmerge
    const handleCellUnmerge = (rowIndex: number, cellIndex: number) => {
        const newTable = { ...editedTable };
        const mergedCell = newTable.rows[rowIndex].cells[cellIndex];

        if (!mergedCell.rowSpan || !mergedCell.colSpan) return;

        // Find and remove the merged cell entry from structure
        if (newTable.structure.mergedCells) {
            const mergedCellIndex = newTable.structure.mergedCells.findIndex(
                mc => mc.startRow === rowIndex && mc.startCol === cellIndex
            );
            if (mergedCellIndex !== -1) {
                newTable.structure.mergedCells.splice(mergedCellIndex, 1);
            }
        }

        // Unhide and reset all cells in the merged region
        for (let i = rowIndex; i < rowIndex + mergedCell.rowSpan; i++) {
            for (let j = cellIndex; j < cellIndex + mergedCell.colSpan; j++) {
                newTable.rows[i].cells[j] = {
                    content: i === rowIndex && j === cellIndex ? mergedCell.content : '',
                    confidence: mergedCell.confidence,
                    rowSpan: 1,
                    colSpan: 1,
                    hidden: false
                };
            }
        }

        // Reset the original cell
        newTable.rows[rowIndex].cells[cellIndex] = {
            ...newTable.rows[rowIndex].cells[cellIndex],
            rowSpan: 1,
            colSpan: 1
        };

        setEditedTable(newTable);
        setSelectedCells(null);
    };

    // Row operations
    const addRow = (index: number) => {
        const newTable = { ...editedTable };
        const newRow: ITableRow = {
            cells: Array(newTable.structure.columnCount).fill(null).map(() => ({
                content: '',
                confidence: 1,
            }))
        };

        newTable.rows.splice(index + 1, 0, newRow);
        newTable.structure.rowCount++;

        setEditedTable(newTable);
    };

    const deleteRow = (index: number) => {
        const newTable = { ...editedTable };
        newTable.rows.splice(index, 1);
        newTable.structure.rowCount--;
        setEditedTable(newTable);
    };

    // Column operations
    const addColumn = (index: number) => {
        const newTable = { ...editedTable };
        newTable.rows.forEach(row => {
            row.cells.splice(index + 1, 0, {
                content: '',
                confidence: 1,
            });
        });
        newTable.structure.columnCount++;
        setEditedTable(newTable);
    };

    const deleteColumn = (index: number) => {
        const newTable = { ...editedTable };
        newTable.rows.forEach(row => {
            row.cells.splice(index, 1);
        });
        newTable.structure.columnCount--;
        setEditedTable(newTable);
    };

    // Export functions
    const exportAsHTML = () => {
        let html = '<table border="1">\n';

        editedTable.rows.forEach(row => {
            html += '  <tr>\n';
            row.cells.forEach(cell => {
                if (cell.hidden) return;
                const tag = cell.isHeader ? 'th' : 'td';
                const attrs = [];
                if (cell.rowSpan) attrs.push(`rowspan="${cell.rowSpan}"`);
                if (cell.colSpan) attrs.push(`colspan="${cell.colSpan}"`);
                html += `    <${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>${cell.content}</${tag}>\n`;
            });
            html += '  </tr>\n';
        });

        html += '</table>';

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table_export.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportAsCSV = () => {
        const csv = editedTable.rows.map(row =>
            row.cells.filter(cell => !cell.hidden).map(cell => cell.content).join(',')
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table_export.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={cn("relative overflow-auto", isFullScreen && "fixed inset-0 z-50 bg-background")}>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    onSave?.(editedTable);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 rounded-md"
                            >
                                <Save className="h-4 w-4" />
                                Save Changes
                            </button>
                            <div className="flex items-center gap-1 border-l pl-2">
                                {selectedCells ? (
                                    <button
                                        onClick={handleCellMerge}
                                        className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-primary hover:text-primary/80"
                                        title="Merge selected cells"
                                    >
                                        <Grid className="h-4 w-4" />
                                        Merge Selected
                                    </button>
                                ) : null}
                                <button
                                    onClick={() => addColumn(editedTable.structure.columnCount - 1)}
                                    className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-primary hover:text-primary/80"
                                    title="Add column"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                    Add Column
                                </button>
                                <button
                                    onClick={() => addRow(editedTable.structure.rowCount - 1)}
                                    className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-primary hover:text-primary/80"
                                    title="Add row"
                                >
                                    <ArrowDown className="h-4 w-4" />
                                    Add Row
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 rounded-md"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Table
                        </button>
                    )}
                    <div className="flex items-center gap-1 border-l pl-2">
                        <button
                            onClick={exportAsHTML}
                            className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-primary hover:text-primary/80"
                            title="Export as HTML"
                        >
                            <FileDown className="h-4 w-4" />
                            HTML
                        </button>
                        <button
                            onClick={exportAsCSV}
                            className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-primary hover:text-primary/80"
                            title="Export as CSV"
                        >
                            <FileDown className="h-4 w-4" />
                            CSV
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDiff(!showDiff)}
                        className="p-2 hover:bg-muted rounded-md"
                        title={showDiff ? "Hide differences" : "Show differences"}
                    >
                        {showDiff ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => setIsSideView(!isSideView)}
                        className="p-2 hover:bg-muted rounded-md"
                        title={isSideView ? "Stack view" : "Side by side"}
                    >
                        <SplitSquareHorizontal className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="p-2 hover:bg-muted rounded-md"
                        title={isFullScreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                        {isFullScreen ? (
                            <Minimize2 className="h-4 w-4" />
                        ) : (
                            <Maximize2 className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            <div className={`comparison-container ${isSideView ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
                {/* Original Table */}
                <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Original Table</div>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableBody>
                                {original.rows.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {row.cells.map((cell, cellIndex) => {
                                            if (cell.hidden) return null;
                                            return (
                                                <TableCell
                                                    key={cellIndex}
                                                    rowSpan={cell.rowSpan}
                                                    colSpan={cell.colSpan}
                                                    className={cn(
                                                        "border",
                                                        cell.isHeader && "font-medium bg-muted"
                                                    )}
                                                >
                                                    {cell.content}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Edited Table */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground">
                            {isEditing ? 'Editing Table' : 'Detected Table'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Confidence: {(editedTable.confidence * 100).toFixed(1)}%
                        </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableBody>
                                {editedTable.rows.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {row.cells.map((cell, cellIndex) => {
                                            if (cell.hidden) return null;

                                            const originalCell = original.rows[rowIndex]?.cells[cellIndex];
                                            const diffStatus = showDiff && originalCell
                                                ? cell.content === originalCell.content
                                                    ? 'unchanged'
                                                    : 'changed'
                                                : 'unchanged';

                                            const isSelected = selectedCells &&
                                                rowIndex >= selectedCells.startRow &&
                                                rowIndex <= selectedCells.endRow &&
                                                cellIndex >= selectedCells.startCol &&
                                                cellIndex <= selectedCells.endCol;

                                            return (
                                                <TableCell
                                                    key={cellIndex}
                                                    rowSpan={cell.rowSpan}
                                                    colSpan={cell.colSpan}
                                                    className={cn(
                                                        "border relative transition-all group",
                                                        cell.isHeader && "font-medium bg-muted",
                                                        isEditing && !cell.hidden && "cursor-pointer hover:bg-muted/50",
                                                        diffStatus === 'changed' && "bg-yellow-100 dark:bg-yellow-900/30",
                                                        // Selection styles
                                                        isEditing && selectedCells &&
                                                        rowIndex >= selectedCells.startRow &&
                                                        rowIndex <= selectedCells.endRow &&
                                                        cellIndex >= selectedCells.startCol &&
                                                        cellIndex <= selectedCells.endCol &&
                                                        !cell.hidden &&
                                                        "bg-primary/20 ring-2 ring-primary ring-inset",
                                                        // Editing styles
                                                        editingCell?.row === rowIndex &&
                                                        editingCell?.col === cellIndex &&
                                                        "ring-2 ring-primary ring-inset bg-background",
                                                        // Merged cell styles
                                                        cell.rowSpan && "bg-primary/5"
                                                    )}
                                                >
                                                    <div
                                                        className="flex items-center justify-between gap-2 relative min-h-[2rem]"
                                                        onClick={() => handleCellClick(rowIndex, cellIndex)}
                                                        onMouseDown={(e) => handleCellMouseDown(rowIndex, cellIndex, e)}
                                                        onMouseEnter={() => handleCellMouseEnter(rowIndex, cellIndex)}
                                                        onMouseUp={handleCellMouseUp}
                                                    >
                                                        {editingCell?.row === rowIndex &&
                                                            editingCell?.col === cellIndex ? (
                                                            <input
                                                                type="text"
                                                                value={editingCell.value}
                                                                onChange={(e) => setEditingCell({
                                                                    ...editingCell,
                                                                    value: e.target.value
                                                                })}
                                                                onBlur={() => handleCellEdit(rowIndex, cellIndex, editingCell.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleCellEdit(rowIndex, cellIndex, editingCell.value);
                                                                    } else if (e.key === 'Escape') {
                                                                        setEditingCell(null);
                                                                    }
                                                                }}
                                                                className="w-full bg-transparent border-none focus:outline-none"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span>{cell.content}</span>
                                                        )}
                                                    </div>
                                                    {isEditing &&
                                                        typeof cell.rowSpan === 'number' &&
                                                        cell.rowSpan > 1 && (
                                                            <div className="absolute top-0 right-0 flex items-center gap-1 p-1 bg-background/80 rounded-bl border-l border-b shadow-sm z-10">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleCellUnmerge(rowIndex, cellIndex);
                                                                    }}
                                                                    className="p-1 hover:bg-primary/20 rounded text-primary"
                                                                    title="Unmerge cells"
                                                                >
                                                                    <Unlink className="h-4 w-4" />
                                                                </button>
                                                                <Badge variant="outline" className="text-xs">
                                                                    Merged {cell.rowSpan}×{typeof cell.colSpan === 'number' ? cell.colSpan : 1}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                </TableCell>
                                            );
                                        })}
                                        {isEditing && (
                                            <TableCell className="w-[40px] opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => deleteRow(rowIndex)}
                                                    className="p-1 hover:text-red-500"
                                                    title="Delete row"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
} 