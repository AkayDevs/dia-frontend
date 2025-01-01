import { AnalysisType } from './analysis';

export interface TableCell {
    content: string;
    confidence: number;
    rowSpan?: number;
    colSpan?: number;
    isHeader?: boolean;
    hidden?: boolean;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface TableRow {
    cells: TableCell[];
    isHeader?: boolean;
}

export interface DetectedTable {
    rows: TableRow[];
    confidence: number;
    location: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    structure: {
        rowCount: number;
        columnCount: number;
        headerRows?: number[];
        mergedCells?: {
            startRow: number;
            startCol: number;
            endRow: number;
            endCol: number;
        }[];
    };
}

export interface AnalysisResultData {
    // Text Extraction Results
    extractedText?: string;
    confidence?: number;
    language?: string;

    // Table Detection Results
    tables?: DetectedTable[];

    // Text Summarization Results
    summary?: {
        text: string;
        keyPoints: string[];
        wordCount: number;
    };

    // Template Conversion Results
    convertedDocument?: {
        url: string;
        format: string;
        size: number;
    };
}

export interface AnalysisResult {
    id: string;
    documentId: string;
    type: AnalysisType;
    status: 'completed' | 'failed';
    data: AnalysisResultData;
    error?: string;
    createdAt: string;
    updatedAt: string;
} 