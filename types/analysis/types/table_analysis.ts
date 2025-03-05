import { AnalysisRunWithResults } from '../base';

/**
 * Table detection options
 */
export interface TableDetectionOptions {
    detectHeaderRows: boolean;
    detectHeaderColumns: boolean;
    minConfidence: number;
    includeRulings: boolean;
    extractSpans: boolean;
    mergeOverlappingCells: boolean;
}

/**
 * Table extraction options
 */
export interface TableExtractionOptions {
    outputFormat: 'csv' | 'json' | 'excel';
    includeConfidenceScores: boolean;
    includeCoordinates: boolean;
    normalizeWhitespace: boolean;
}

/**
 * Table analysis configuration
 */
export interface TableAnalysisConfig extends BaseAnalysisRun {
    type: 'table_analysis';
    tableOptions: TableDetectionOptions;
    extractionOptions: TableExtractionOptions;
    advancedSettings?: Record<string, any>;
}

/**
 * Table detection step
 */
export interface TableDetectionStep extends BaseStep {
    detectionResults?: {
        tableCount: number;
        tables: Array<{
            id: string;
            pageNumber: number;
            boundingBox: {
                x1: number;
                y1: number;
                x2: number;
                y2: number;
            };
            confidence: number;
        }>;
    };
}

/**
 * Table extraction step
 */
export interface TableExtractionStep extends BaseStep {
    extractionResults?: {
        tables: Array<{
            id: string;
            pageNumber: number;
            rowCount: number;
            columnCount: number;
            hasHeaderRow: boolean;
            hasHeaderColumn: boolean;
        }>;
    };
}

/**
 * Table analysis result
 */
export interface TableAnalysisResult extends BaseAnalysisStepResult {
    type: 'table_analysis';
    tables: Array<{
        id: string;
        pageNumber: number;
        name?: string;
        rowCount: number;
        columnCount: number;
        data: Array<Array<string>>;
        headerRow?: Array<string>;
        headerColumn?: Array<string>;
        boundingBox: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        };
        confidence: number;
        metadata?: Record<string, any>;
    }>;
} 