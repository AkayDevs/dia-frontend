'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult, AnalysisResultData } from '@/types/results';
import { AnalysisType } from '@/types/analysis';
import {
    Table as TableIcon,
    FileText,
    FileOutput,
    FileSearch,
    Download,
    Copy,
    Check,
    ExternalLink,
    Edit2,
    Save,
    SplitSquareHorizontal,
    Maximize2,
    Minimize2,
    Grid,
    ArrowLeftRight,
    Eye,
    EyeOff,
    FileDown,
    Trash2,
    Plus
} from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { TableComparison } from './table-comparison';
import { DetectedTable } from '@/types/results';

interface AnalysisResultsProps {
    results: AnalysisResult[];
    documentName: string;
    originalContent?: string; // Original document content for comparison
}

const analysisTypeInfo = {
    table_detection: {
        icon: TableIcon,
        title: 'Table Detection',
        color: 'text-blue-500',
    },
    text_extraction: {
        icon: FileText,
        title: 'Text Extraction',
        color: 'text-green-500',
    },
    text_summarization: {
        icon: FileSearch,
        title: 'Text Summarization',
        color: 'text-purple-500',
    },
    template_conversion: {
        icon: FileOutput,
        title: 'Template Conversion',
        color: 'text-orange-500',
    },
};

function ComparisonView({ original, processed, type }: {
    original: string;
    processed: string;
    type: 'text' | 'table' | 'summary'
}) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(processed);
    const [isSideView, setIsSideView] = useState(true);

    const handleSave = () => {
        setIsEditing(false);
        // Here you would typically save the edited content
        // For now, we just update the local state
    };

    return (
        <div className={`comparison-view ${isFullScreen ? 'fixed inset-0 z-50 bg-background p-6' : 'relative'}`}>
            <div className="flex items-center justify-end gap-2 mb-4">
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

            <div className={`comparison-container ${isSideView ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
                {/* Original Content */}
                <div className="border rounded-lg p-4">
                    <div className="text-sm font-medium mb-2 text-muted-foreground">Original</div>
                    <div className="bg-muted rounded-md p-4 max-h-[500px] overflow-auto">
                        <pre className="text-sm whitespace-pre-wrap">{original}</pre>
                    </div>
                </div>

                {/* Processed Content */}
                <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-muted-foreground">
                            {isEditing ? 'Editing' : 'Processed'}
                        </div>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                                >
                                    <Save className="h-4 w-4" />
                                    Save
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="bg-muted rounded-md p-4 max-h-[500px] overflow-auto">
                        {isEditing ? (
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full h-full min-h-[200px] bg-transparent border-none focus:outline-none resize-none"
                            />
                        ) : (
                            <pre className="text-sm whitespace-pre-wrap">{editedContent}</pre>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TextExtractionResult({ data, originalContent }: {
    data: AnalysisResultData;
    originalContent?: string;
}) {
    const [copied, setCopied] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    const handleCopy = async () => {
        if (data.extractedText) {
            await navigator.clipboard.writeText(data.extractedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Confidence: {(data.confidence || 0) * 100}% | Language: {data.language}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                    >
                        <SplitSquareHorizontal className="h-4 w-4" />
                        {showComparison ? 'Hide Comparison' : 'Compare with Original'}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                </div>
            </div>

            {showComparison && originalContent ? (
                <ComparisonView
                    original={originalContent}
                    processed={data.extractedText || ''}
                    type="text"
                />
            ) : (
                <div className="p-4 bg-muted rounded-lg max-h-96 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap">{data.extractedText}</pre>
                </div>
            )}
        </div>
    );
}

function EnhancedTable({
    data,
    headers,
    isEditing,
    onCellEdit,
    onRowAdd,
    onRowDelete,
    showDiff = false,
    originalData,
    className = ""
}: {
    data: string[][];
    headers: string[];
    isEditing?: boolean;
    onCellEdit?: (row: number, col: number, value: string) => void;
    onRowAdd?: (index: number) => void;
    onRowDelete?: (index: number) => void;
    showDiff?: boolean;
    originalData?: string[][];
    className?: string;
}) {
    const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);

    const handleCellClick = (row: number, col: number) => {
        if (isEditing && onCellEdit) {
            setEditingCell({ row, col });
        }
    };

    const getCellDiffStatus = (rowIndex: number, colIndex: number) => {
        if (!showDiff || !originalData) return 'unchanged';
        const originalCell = originalData[rowIndex]?.[colIndex] || '';
        const currentCell = data[rowIndex]?.[colIndex] || '';

        if (originalCell === currentCell) return 'unchanged';
        if (!originalCell || !currentCell) return 'missing';
        return 'changed';
    };

    return (
        <div className={cn("relative rounded-md border", className)}>
            <Table>
                {headers && (
                    <TableHeader>
                        <TableRow>
                            {headers.map((header, i) => (
                                <TableHead
                                    key={i}
                                    className="font-semibold text-foreground"
                                >
                                    {header}
                                </TableHead>
                            ))}
                            {isEditing && <TableHead className="w-[100px]" />}
                        </TableRow>
                    </TableHeader>
                )}
                <TableBody>
                    {data.map((row, rowIndex) => (
                        <TableRow
                            key={rowIndex}
                            className="group"
                        >
                            {row.map((cell, colIndex) => {
                                const diffStatus = getCellDiffStatus(rowIndex, colIndex);
                                const isEditingThisCell = editingCell?.row === rowIndex && editingCell?.col === colIndex;

                                return (
                                    <TableCell
                                        key={colIndex}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        className={cn(
                                            "transition-colors",
                                            isEditing && "cursor-pointer hover:bg-muted",
                                            diffStatus === 'changed' && "bg-yellow-100 dark:bg-yellow-900/30",
                                            diffStatus === 'missing' && "bg-red-100 dark:bg-red-900/30"
                                        )}
                                    >
                                        {isEditingThisCell ? (
                                            <input
                                                type="text"
                                                value={cell}
                                                onChange={(e) => onCellEdit?.(rowIndex, colIndex, e.target.value)}
                                                onBlur={() => setEditingCell(null)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        setEditingCell(null);
                                                    }
                                                }}
                                                autoFocus
                                                className="w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1"
                                            />
                                        ) : (
                                            <span className="block px-1">{cell}</span>
                                        )}
                                    </TableCell>
                                );
                            })}
                            {isEditing && (
                                <TableCell className="w-[100px] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-1 justify-end">
                                        <button
                                            onClick={() => onRowAdd?.(rowIndex)}
                                            className="p-1 hover:bg-primary/10 rounded"
                                            title="Add row below"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onRowDelete?.(rowIndex)}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                            title="Delete row"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function TableComparisonView({ original, detected, confidence }: {
    original: string;
    detected: {
        rows: number;
        columns: number;
        data: string[][];
        confidence: number;
    };
    confidence: number;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(detected.data);
    const [originalTable] = useState(() => {
        // Parse the original table structure
        const lines = original.split('\n');
        const tableStart = lines.findIndex(line => line.trim().startsWith('|'));
        const tableEnd = lines.slice(tableStart).findIndex(line => !line.trim().startsWith('|')) + tableStart;
        const tableLines = lines.slice(tableStart, tableEnd);

        const headers = tableLines[0]
            .trim()
            .split('|')
            .filter(Boolean)
            .map(header => header.trim());

        const rows = tableLines.slice(2) // Skip header and separator
            .map(row => row
                .trim()
                .split('|')
                .filter(Boolean)
                .map(cell => cell.trim())
            );

        return { headers, rows };
    });
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSideView, setIsSideView] = useState(true);
    const [showDiff, setShowDiff] = useState(false);

    const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
        const newData = [...editedData];
        newData[rowIndex][colIndex] = value;
        setEditedData(newData);
    };

    const addRow = (index: number) => {
        const newRow = Array(editedData[0].length).fill('');
        const newData = [
            ...editedData.slice(0, index + 1),
            newRow,
            ...editedData.slice(index + 1)
        ];
        setEditedData(newData);
    };

    const deleteRow = (index: number) => {
        const newData = editedData.filter((_, i) => i !== index);
        setEditedData(newData);
    };

    const exportAsCSV = () => {
        const headers = originalTable.headers.join(',');
        const rows = editedData.map(row => row.join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table_export.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportAsMarkdown = () => {
        const headers = originalTable.headers.join(' | ');
        const separator = originalTable.headers.map(() => '---').join(' | ');
        const rows = editedData.map(row => row.join(' | ')).join('\n');
        const markdown = `| ${headers} |\n| ${separator} |\n${rows.split('\n').map(row => `| ${row} |`).join('\n')}`;

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table_export.md';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Keep the original content unchanged
    const originalContent = original;

    return (
        <div className={`comparison-view ${isFullScreen ? 'fixed inset-0 z-50 bg-background p-6' : 'relative'}`}>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 rounded-md"
                        >
                            <Save className="h-4 w-4" />
                            Save Changes
                        </button>
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
                            onClick={exportAsCSV}
                            className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-primary hover:text-primary/80"
                            title="Export as CSV"
                        >
                            <FileDown className="h-4 w-4" />
                            CSV
                        </button>
                        <button
                            onClick={exportAsMarkdown}
                            className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-primary hover:text-primary/80"
                            title="Export as Markdown"
                        >
                            <FileDown className="h-4 w-4" />
                            MD
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
                {/* Original Document */}
                <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Original Document</div>
                    <div className="border rounded-lg p-4 bg-muted/50 overflow-auto max-h-[600px]">
                        <pre className="text-sm whitespace-pre-wrap">
                            {originalContent}
                        </pre>
                    </div>
                </div>

                {/* Detected/Edited Table */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground">
                            {isEditing ? 'Editing Table' : 'Detected Table'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Confidence: {(confidence * 100).toFixed(1)}%
                        </div>
                    </div>
                    <EnhancedTable
                        data={editedData}
                        headers={originalTable.headers}
                        isEditing={isEditing}
                        onCellEdit={handleCellEdit}
                        onRowAdd={addRow}
                        onRowDelete={deleteRow}
                        showDiff={showDiff}
                        originalData={originalTable.rows}
                    />
                </div>
            </div>
        </div>
    );
}

function TableDetectionResult({ data, originalContent }: {
    data: AnalysisResultData;
    originalContent?: string;
}) {
    const [showComparison, setShowComparison] = useState(false);

    // Early return if no tables data
    if (!data?.tables || data.tables.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                No tables detected in the document
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.tables.map((table, index) => (
                <div key={index} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            Table {index + 1} ({table.structure.rowCount}×{table.structure.columnCount})
                        </span>
                        <div className="flex items-center gap-2">
                            {originalContent && (
                                <button
                                    onClick={() => setShowComparison(!showComparison)}
                                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                                >
                                    <SplitSquareHorizontal className="h-4 w-4" />
                                    {showComparison ? 'Hide Comparison' : 'Compare with Original'}
                                </button>
                            )}
                            <span className="text-sm text-muted-foreground">
                                Confidence: {(table.confidence * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {showComparison && originalContent ? (
                        <TableComparison
                            original={table}
                            detected={table}
                            onSave={(updatedTable: DetectedTable) => {
                                // Handle save functionality
                                console.log('Table updated:', updatedTable);
                            }}
                        />
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableBody>
                                    {table.rows.map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {row.cells.map((cell, cellIndex) => {
                                                if ('hidden' in cell && cell.hidden) return null;
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
                    )}
                </div>
            ))}
        </div>
    );
}

function TextSummarizationResult({ data }: { data: AnalysisResultData }) {
    if (!data.summary) return null;

    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
                Word Count: {data.summary.wordCount}
            </div>
            <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm">{data.summary.text}</p>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Key Points</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {data.summary.keyPoints.map((point, index) => (
                            <li key={index} className="text-sm">{point}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function TemplateConversionResult({ data }: { data: AnalysisResultData }) {
    if (!data.convertedDocument) return null;

    return (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
                <div className="text-sm font-medium">
                    Converted to {data.convertedDocument.format.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">
                    Size: {(data.convertedDocument.size / 1024 / 1024).toFixed(2)} MB
                </div>
            </div>
            <div className="flex gap-2">
                <a
                    href={data.convertedDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary/80"
                >
                    <ExternalLink className="h-4 w-4" />
                    View
                </a>
                <a
                    href={data.convertedDocument.url}
                    download
                    className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary/80"
                >
                    <Download className="h-4 w-4" />
                    Download
                </a>
            </div>
        </div>
    );
}

export function AnalysisResults({ results, documentName, originalContent }: AnalysisResultsProps) {
    const [selectedType, setSelectedType] = useState<AnalysisType | null>(
        results[0]?.type || null
    );

    // Only show tabs for analyses that were actually performed and have results
    const availableAnalyses = results.filter(result =>
        result.status === 'completed' &&
        result.data && (
            (result.type === 'text_extraction' && result.data.extractedText) ||
            (result.type === 'table_detection' && result.data.tables && result.data.tables.length > 0) ||
            (result.type === 'text_summarization' && result.data.summary) ||
            (result.type === 'template_conversion' && result.data.convertedDocument)
        )
    );

    // Update selected type if current selection is not available
    useEffect(() => {
        if (selectedType && !availableAnalyses.find(r => r.type === selectedType)) {
            setSelectedType(availableAnalyses[0]?.type || null);
        }
    }, [availableAnalyses, selectedType]);

    const selectedResult = availableAnalyses.find(r => r.type === selectedType);

    if (availableAnalyses.length === 0) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                No analysis results available
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {availableAnalyses.map((result) => {
                    const info = analysisTypeInfo[result.type];
                    const Icon = info.icon;
                    const isSelected = selectedType === result.type;

                    return (
                        <button
                            key={result.type}
                            onClick={() => setSelectedType(result.type)}
                            className={`
                                flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                                ${isSelected
                                    ? `border-primary ${info.color}`
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                }
                            `}
                        >
                            <Icon className="h-4 w-4" />
                            {info.title}
                        </button>
                    );
                })}
            </div>

            {selectedResult && (
                <div className="p-6 border rounded-lg">
                    {selectedResult.type === 'text_extraction' && (
                        <TextExtractionResult
                            data={selectedResult.data}
                            originalContent={originalContent}
                        />
                    )}
                    {selectedResult.type === 'table_detection' && (
                        <TableDetectionResult
                            data={selectedResult.data}
                            originalContent={originalContent}
                        />
                    )}
                    {selectedResult.type === 'text_summarization' && (
                        <TextSummarizationResult data={selectedResult.data} />
                    )}
                    {selectedResult.type === 'template_conversion' && (
                        <TemplateConversionResult data={selectedResult.data} />
                    )}
                </div>
            )}
        </div>
    );
} 