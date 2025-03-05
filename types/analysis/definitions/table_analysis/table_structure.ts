import { BoundingBox, Confidence, PageInfo, BaseStepOutput } from "./shared";

/**
 * Cell
 */
export interface Cell {
    bbox: BoundingBox;
    row_span: number;
    col_span: number;
    is_header: boolean;
    confidence: Confidence;
}

/**
 * Table structure
 */
export interface TableStructure {
    bbox: BoundingBox;
    cells: Cell[];
    num_rows: number;
    num_cols: number;
    confidence: Confidence;
}

/**
 * Page table structure result
 */
export interface PageTableStructureResult {
    page_info: PageInfo;
    tables: TableStructure[];
    processing_info: Record<string, any>;
}

/**
 * Table structure output
 */
export interface TableStructureOutput extends BaseStepOutput {
    results: PageTableStructureResult[];
}