import { AnalysisTypeEnum } from './analysis';

/**
 * Standard bounding box representation
 */
export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/**
 * Standard confidence score representation
 */
export interface Confidence {
    score: number;
    method: string;
}

/**
 * Standard page information
 */
export interface PageInfo {
    page_number: number;
    width: number;
    height: number;
}

/**
 * Table Detection Results
 */
export interface TableLocation {
    bbox: BoundingBox;
    confidence: Confidence;
    table_type?: string;
}

export interface TableDetectionResult {
    page_info: PageInfo;
    tables: TableLocation[];
    processing_info: Record<string, any>;
}

export interface TableDetectionOutput {
    total_pages_processed: number;
    total_tables_found: number;
    results: TableDetectionResult[];
    metadata: Record<string, any>;
}

/**
 * Table Structure Results
 */
export interface Cell {
    bbox: BoundingBox;
    row_span: number;
    col_span: number;
    is_header: boolean;
    confidence: Confidence;
}

export interface TableStructure {
    bbox: BoundingBox;
    cells: Cell[];
    num_rows: number;
    num_cols: number;
    confidence: Confidence;
}

export interface TableStructureResult {
    page_info: PageInfo;
    tables: TableStructure[];
    processing_info: Record<string, any>;
}

export interface TableStructureOutput {
    total_pages_processed: number;
    total_tables_processed: number;
    results: TableStructureResult[];
    metadata: Record<string, any>;
}

/**
 * Table Data Results
 */
export interface CellContent {
    text: string;
    confidence: Confidence;
    data_type?: string;
    normalized_value?: any;
}

export interface TableData {
    bbox: BoundingBox;
    cells: CellContent[][];
    confidence: Confidence;
}

export interface TableDataResult {
    page_info: PageInfo;
    tables: TableData[];
    processing_info: Record<string, any>;
}

export interface TableDataOutput {
    total_pages_processed: number;
    total_tables_processed: number;
    results: TableDataResult[];
    metadata: Record<string, any>;
}

/**
 * Step output mapping
 */
export type StepOutputType = {
    table_detection: TableDetectionOutput;
    table_structure_recognition: TableStructureOutput;
    table_data_extraction: TableDataOutput;
};

export const STEP_OUTPUT_SCHEMAS: Record<keyof StepOutputType, any> = {
    table_detection: 'TableDetectionOutput',
    table_structure_recognition: 'TableStructureOutput',
    table_data_extraction: 'TableDataOutput'
} as const;

/**
 * Type helper for step outputs
 */
export type StepOutput = StepOutputType[keyof StepOutputType]; 