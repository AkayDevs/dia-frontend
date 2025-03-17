import { useState, useEffect, useCallback } from 'react';
import { BaseStepComponentProps } from "@/components/analysis/definitions/base";
import { useDocumentStore } from '@/store/useDocumentStore';
import { TableDataOutput, PageTableDataResult, TableData, CellContent } from '@/types/analysis/definitions/table_analysis/table_data';
import { DocumentPage } from '@/types/document';
import { useToast } from '@/hooks/use-toast';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Button
} from '@/components/ui/button';
import {
    Input
} from '@/components/ui/input';
import {
    Badge
} from '@/components/ui/badge';
import {
    Separator
} from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
    Alert,
    AlertTitle,
    AlertDescription
} from '@/components/ui/alert';
import {
    Table as TableIcon,
    FileText,
    Save,
    Plus,
    Trash2,
    Edit,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    RotateCw,
    CheckCircle2,
    XCircle,
    Database,
    Download,
    ArrowDownToLine
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Define a type for the editable cell
interface EditableCellProps {
    value: string;
    rowIndex: number;
    colIndex: number;
    isHeader: boolean;
    onChange: (rowIndex: number, colIndex: number, value: string) => void;
}

// Editable cell component
const EditableCell: React.FC<EditableCellProps> = ({ value, rowIndex, colIndex, isHeader, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [cellValue, setCellValue] = useState(value);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        onChange(rowIndex, colIndex, cellValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            onChange(rowIndex, colIndex, cellValue);
        } else if (e.key === 'Escape') {
            setCellValue(value);
            setIsEditing(false);
        }
    };

    useEffect(() => {
        setCellValue(value);
    }, [value]);

    return (
        <>
            {isEditing ? (
                <Input
                    value={cellValue}
                    onChange={(e) => setCellValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "w-full p-1 text-sm",
                        isHeader ? "font-medium" : ""
                    )}
                    autoFocus
                />
            ) : (
                <div
                    className={cn(
                        "w-full h-full min-h-[32px] p-1 cursor-pointer hover:bg-gray-100 rounded",
                        isHeader ? "font-medium" : ""
                    )}
                    onDoubleClick={handleDoubleClick}
                >
                    {cellValue || <span className="text-gray-400 italic">Empty</span>}
                </div>
            )}
        </>
    );
};

const TableDataEditor: React.FC<BaseStepComponentProps> = ({ analysisId, documentId, analysisType, step, stepResult }) => {
    const { toast } = useToast();
    const { fetchDocumentPages, currentPages, isPagesLoading } = useDocumentStore();

    // State for the current page and table
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [activeTableIndex, setActiveTableIndex] = useState(0);

    // State for the edited table data
    const [editedData, setEditedData] = useState<PageTableDataResult[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // State for UI dialogs
    const [showAddRowDialog, setShowAddRowDialog] = useState(false);
    const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);
    const [showDeleteRowDialog, setShowDeleteRowDialog] = useState(false);
    const [showDeleteColumnDialog, setShowDeleteColumnDialog] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<number | null>(null);
    const [columnToDelete, setColumnToDelete] = useState<number | null>(null);

    // Initialize data from step result
    useEffect(() => {
        if (stepResult && stepResult.result) {
            const dataResult = stepResult.result as TableDataOutput;
            if (dataResult.results && dataResult.results.length > 0) {
                // Deep clone the data to avoid mutating the original
                setEditedData(JSON.parse(JSON.stringify(dataResult.results)));
            }
        }
    }, [stepResult]);

    // Fetch document pages
    useEffect(() => {
        if (documentId) {
            fetchDocumentPages(documentId);
        }
    }, [documentId, fetchDocumentPages]);

    // Get current page and table
    const currentPage = editedData[activePageIndex] || null;
    const currentTable = currentPage?.tables[activeTableIndex] || null;

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

    // Handle cell value change
    const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
        if (!currentPage || !currentTable) return;

        setEditedData(prevData => {
            const newData = [...prevData];
            const newPage = { ...newData[activePageIndex] };
            const newTable = { ...newPage.tables[activeTableIndex] };

            // Create a deep copy of the cells
            const newCells = [...newTable.cells.map(row => [...row])];

            // Update the cell
            if (newCells[rowIndex] && newCells[rowIndex][colIndex]) {
                newCells[rowIndex][colIndex] = {
                    ...newCells[rowIndex][colIndex],
                    text: value
                };
            }

            newTable.cells = newCells;
            newPage.tables[activeTableIndex] = newTable;
            newData[activePageIndex] = newPage;

            return newData;
        });

        setIsDirty(true);
    }, [activePageIndex, activeTableIndex, currentPage, currentTable]);

    // Add a new row
    const addRow = useCallback((position: 'start' | 'end') => {
        if (!currentPage || !currentTable) return;

        setEditedData(prevData => {
            const newData = [...prevData];
            const newPage = { ...newData[activePageIndex] };
            const newTable = { ...newPage.tables[activeTableIndex] };

            // Create a deep copy of the cells
            const newCells = [...newTable.cells.map(row => [...row])];

            // Create a new empty row with the same number of columns
            const columnsCount = newCells[0]?.length || 0;
            const newRow: CellContent[] = Array(columnsCount).fill(null).map(() => ({
                text: '',
                confidence: { score: 0.5, method: 'manual' },
                data_type: 'text',
                normalized_value: null
            }));

            // Add the new row at the beginning or end
            if (position === 'start') {
                newCells.unshift(newRow);
            } else {
                newCells.push(newRow);
            }

            newTable.cells = newCells;
            newPage.tables[activeTableIndex] = newTable;
            newData[activePageIndex] = newPage;

            return newData;
        });

        setIsDirty(true);
        setShowAddRowDialog(false);
    }, [activePageIndex, activeTableIndex, currentPage, currentTable]);

    // Add a new column
    const addColumn = useCallback((position: 'start' | 'end') => {
        if (!currentPage || !currentTable) return;

        setEditedData(prevData => {
            const newData = [...prevData];
            const newPage = { ...newData[activePageIndex] };
            const newTable = { ...newPage.tables[activeTableIndex] };

            // Create a deep copy of the cells
            const newCells = [...newTable.cells.map(row => [...row])];

            // Add a new column to each row
            newCells.forEach(row => {
                const newCell: CellContent = {
                    text: '',
                    confidence: { score: 0.5, method: 'manual' },
                    data_type: 'text',
                    normalized_value: null
                };

                if (position === 'start') {
                    row.unshift(newCell);
                } else {
                    row.push(newCell);
                }
            });

            newTable.cells = newCells;
            newPage.tables[activeTableIndex] = newTable;
            newData[activePageIndex] = newPage;

            return newData;
        });

        setIsDirty(true);
        setShowAddColumnDialog(false);
    }, [activePageIndex, activeTableIndex, currentPage, currentTable]);

    // Delete a row
    const deleteRow = useCallback((rowIndex: number) => {
        if (!currentPage || !currentTable || rowIndex === null) return;

        setEditedData(prevData => {
            const newData = [...prevData];
            const newPage = { ...newData[activePageIndex] };
            const newTable = { ...newPage.tables[activeTableIndex] };

            // Create a deep copy of the cells
            const newCells = [...newTable.cells.map(row => [...row])];

            // Remove the row
            if (newCells.length > 1) { // Ensure we don't delete the last row
                newCells.splice(rowIndex, 1);
            }

            newTable.cells = newCells;
            newPage.tables[activeTableIndex] = newTable;
            newData[activePageIndex] = newPage;

            return newData;
        });

        setIsDirty(true);
        setShowDeleteRowDialog(false);
        setRowToDelete(null);
    }, [activePageIndex, activeTableIndex, currentPage, currentTable]);

    // Delete a column
    const deleteColumn = useCallback((colIndex: number) => {
        if (!currentPage || !currentTable || colIndex === null) return;

        setEditedData(prevData => {
            const newData = [...prevData];
            const newPage = { ...newData[activePageIndex] };
            const newTable = { ...newPage.tables[activeTableIndex] };

            // Create a deep copy of the cells
            const newCells = [...newTable.cells.map(row => [...row])];

            // Remove the column from each row
            if (newCells[0].length > 1) { // Ensure we don't delete the last column
                newCells.forEach(row => {
                    row.splice(colIndex, 1);
                });
            }

            newTable.cells = newCells;
            newPage.tables[activeTableIndex] = newTable;
            newData[activePageIndex] = newPage;

            return newData;
        });

        setIsDirty(true);
        setShowDeleteColumnDialog(false);
        setColumnToDelete(null);
    }, [activePageIndex, activeTableIndex, currentPage, currentTable]);

    // Save changes
    const saveChanges = useCallback(async () => {
        if (!isDirty) return;

        setIsSaving(true);

        try {
            // Here you would implement the API call to save the changes
            // For example:
            // await api.saveTableData(analysisId, stepResult.id, editedData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast({
                title: "Changes saved",
                description: "Your table data changes have been saved successfully.",
                variant: "default"
            });

            setIsDirty(false);
        } catch (error) {
            console.error("Error saving changes:", error);
            toast({
                title: "Error saving changes",
                description: "There was an error saving your changes. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    }, [analysisId, editedData, isDirty, toast]);

    // Function to convert table data to CSV
    const exportTableAsCSV = useCallback(() => {
        if (!currentTable) return;

        // Convert table cells to CSV format
        let csvContent = '';

        // Add header row (using Column 1, Column 2, etc.)
        const headerRow = currentTable.cells[0].map((_, colIndex) => `Column ${colIndex + 1}`);
        csvContent += headerRow.join(',') + '\n';

        // Add data rows
        currentTable.cells.forEach(row => {
            const rowData = row.map(cell => {
                // Escape quotes and wrap text in quotes if it contains commas or quotes
                const text = cell.text || '';
                const escaped = text.replace(/"/g, '""');
                return text.includes(',') || text.includes('"') || text.includes('\n')
                    ? `"${escaped}"`
                    : escaped;
            });
            csvContent += rowData.join(',') + '\n';
        });

        // Create a blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `table_${currentPage?.page_info.page_number}_${activeTableIndex + 1}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [currentTable, currentPage, activeTableIndex]);

    // Function to convert table data to XLSX
    const exportTableAsXLSX = useCallback(async () => {
        if (!currentTable) return;

        try {
            // Dynamically import xlsx library
            const XLSX = await import('xlsx');

            // Prepare worksheet data
            const wsData = currentTable.cells.map(row =>
                row.map(cell => cell.text || '')
            );

            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, `Table ${activeTableIndex + 1}`);

            // Generate and download file
            XLSX.writeFile(wb, `table_${currentPage?.page_info.page_number}_${activeTableIndex + 1}.xlsx`);
        } catch (error) {
            console.error('Error exporting to XLSX:', error);
            toast({
                title: "Export failed",
                description: "Failed to export as XLSX. Falling back to CSV export.",
                variant: "destructive"
            });
            exportTableAsCSV();
        }
    }, [currentTable, currentPage, activeTableIndex, exportTableAsCSV, toast]);

    // If no data is available
    if (!currentPage || !currentTable) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No data available</AlertTitle>
                <AlertDescription>
                    No table data is available for editing. Please ensure that table data has been extracted.
                </AlertDescription>
            </Alert>
        );
    }

    // If pages are loading
    if (isPagesLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <RotateCw className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading document pages...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <TableIcon className="mr-2 h-5 w-5 text-primary" />
                            <span>Table Data Editor</span>
                        </div>
                        <Badge variant={isDirty ? "destructive" : "secondary"} className="ml-2">
                            {isDirty ? "Unsaved Changes" : "No Changes"}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Edit table data for page {currentPage.page_info.page_number}. Double-click on any cell to edit its content.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Page and Table Selection */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Page {currentPage.page_info.page_number}</span>
                                <Badge variant="outline" className="text-xs">
                                    {currentPage.tables.length} tables
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
                                    disabled={activePageIndex === 0}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Prev Page
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActivePageIndex(Math.min(editedData.length - 1, activePageIndex + 1))}
                                    disabled={activePageIndex === editedData.length - 1}
                                >
                                    Next Page
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>

                                <Select
                                    value={activeTableIndex.toString()}
                                    onValueChange={(value) => setActiveTableIndex(parseInt(value))}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select table" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentPage.tables.map((_, index) => (
                                            <SelectItem key={index} value={index.toString()}>
                                                Table {index + 1}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        {/* Table Preview */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <Database className="h-4 w-4 mr-2 text-primary" />
                                <h3 className="text-sm font-medium">Table {activeTableIndex + 1} Data</h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <ArrowDownToLine className="h-3.5 w-3.5 mr-1" />
                                            Download
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={exportTableAsCSV}>
                                            Download as CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={exportTableAsXLSX}>
                                            Download as Excel (XLSX)
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Dialog open={showAddRowDialog} onOpenChange={setShowAddRowDialog}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Plus className="h-3.5 w-3.5 mr-1" />
                                            Add Row
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Row</DialogTitle>
                                            <DialogDescription>
                                                Choose where to add the new row in the table.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-center gap-4 py-4">
                                            <Button onClick={() => addRow('start')}>
                                                Add at Beginning
                                            </Button>
                                            <Button onClick={() => addRow('end')}>
                                                Add at End
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={showAddColumnDialog} onOpenChange={setShowAddColumnDialog}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Plus className="h-3.5 w-3.5 mr-1" />
                                            Add Column
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Column</DialogTitle>
                                            <DialogDescription>
                                                Choose where to add the new column in the table.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-center gap-4 py-4">
                                            <Button onClick={() => addColumn('start')}>
                                                Add at Beginning
                                            </Button>
                                            <Button onClick={() => addColumn('end')}>
                                                Add at End
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Editable Table */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {/* Row actions column */}
                                            <TableHead className="w-10 bg-gray-50"></TableHead>

                                            {/* Table headers */}
                                            {currentTable.cells[0]?.map((_, colIndex) => (
                                                <TableHead key={colIndex} className="bg-gray-50 min-w-[120px]">
                                                    <div className="flex items-center justify-between">
                                                        <EditableCell
                                                            value={`Column ${colIndex + 1}`}
                                                            rowIndex={-1}
                                                            colIndex={colIndex}
                                                            isHeader={true}
                                                            onChange={(_, colIndex, value) => {
                                                                // Here you would update the column header
                                                                // This is just a placeholder as the actual data model
                                                                // doesn't seem to have separate header storage
                                                                console.log(`Updated column ${colIndex} header to: ${value}`);
                                                            }}
                                                        />

                                                        <AlertDialog open={showDeleteColumnDialog && columnToDelete === colIndex} onOpenChange={(open) => {
                                                            setShowDeleteColumnDialog(open);
                                                            if (!open) setColumnToDelete(null);
                                                        }}>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 opacity-50 hover:opacity-100"
                                                                    onClick={() => {
                                                                        setColumnToDelete(colIndex);
                                                                        setShowDeleteColumnDialog(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Column</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete column {colIndex + 1}? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteColumn(colIndex)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentTable.cells.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {/* Row actions */}
                                                <TableCell className="w-10 bg-gray-50">
                                                    <AlertDialog open={showDeleteRowDialog && rowToDelete === rowIndex} onOpenChange={(open) => {
                                                        setShowDeleteRowDialog(open);
                                                        if (!open) setRowToDelete(null);
                                                    }}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 opacity-50 hover:opacity-100"
                                                                onClick={() => {
                                                                    setRowToDelete(rowIndex);
                                                                    setShowDeleteRowDialog(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Row</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete row {rowIndex + 1}? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteRow(rowIndex)}>
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>

                                                {/* Row cells */}
                                                {row.map((cell, colIndex) => (
                                                    <TableCell key={colIndex} className="min-w-[120px]">
                                                        <EditableCell
                                                            value={cell.text}
                                                            rowIndex={rowIndex}
                                                            colIndex={colIndex}
                                                            isHeader={false}
                                                            onChange={handleCellChange}
                                                        />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            {currentTable.cells.length} rows × {currentTable.cells[0]?.length || 0} columns
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                        Double-click on any cell to edit its content
                    </div>
                    <Button
                        onClick={saveChanges}
                        disabled={!isDirty || isSaving}
                        className="gap-2"
                    >
                        {isSaving ? (
                            <RotateCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Document Preview Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        <span>Document Preview</span>
                    </CardTitle>
                    <CardDescription>
                        Preview of page {currentPage.page_info.page_number} with table {activeTableIndex + 1} highlighted
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center border rounded-lg overflow-hidden bg-gray-50 p-4">
                        {pageMap.get(currentPage.page_info.page_number)?.url ? (
                            <div className="relative">
                                <img
                                    src={pageMap.get(currentPage.page_info.page_number)?.url}
                                    alt={`Page ${currentPage.page_info.page_number}`}
                                    className="max-h-[500px] object-contain"
                                />

                                {/* Highlight the current table */}
                                <div
                                    className="absolute border-2 border-primary bg-primary/10"
                                    style={{
                                        left: `${currentTable.bbox.x1 / (pageMap.get(currentPage.page_info.page_number)?.width || 1) * 100}%`,
                                        top: `${currentTable.bbox.y1 / (pageMap.get(currentPage.page_info.page_number)?.height || 1) * 100}%`,
                                        width: `${(currentTable.bbox.x2 - currentTable.bbox.x1) / (pageMap.get(currentPage.page_info.page_number)?.width || 1) * 100}%`,
                                        height: `${(currentTable.bbox.y2 - currentTable.bbox.y1) / (pageMap.get(currentPage.page_info.page_number)?.height || 1) * 100}%`,
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mr-4 opacity-20" />
                                <span>No preview available</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TableDataEditor;