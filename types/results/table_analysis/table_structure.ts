import { BoundingBox, Confidence, PageInfo, ValidationUtils } from './shared';

/**
 * Standard cell information
 */
export interface Cell {
    /** Cell bounding box */
    bbox: BoundingBox;
    /** Number of rows this cell spans */
    row_span: number;
    /** Number of columns this cell spans */
    col_span: number;
    /** Whether this cell is a header */
    is_header: boolean;
    /** Cell detection confidence */
    confidence: Confidence;
}

/**
 * Standard table structure information
 */
export interface TableStructure {
    /** Table bounding box */
    bbox: BoundingBox;
    /** List of cells in the table */
    cells: Cell[];
    /** Number of rows in the table */
    num_rows: number;
    /** Number of columns in the table */
    num_cols: number;
    /** Table structure detection confidence */
    confidence: Confidence;
}

/**
 * Results for a single page of table structure recognition
 */
export interface PageTableStructureResult {
    /** Information about the processed page */
    page_info: PageInfo;
    /** List of table structures on this page */
    tables: TableStructure[];
    /** Additional processing information for this page */
    processing_info: Record<string, any>;
}

/**
 * Schema for table structure results across all pages
 */
export interface TableStructureResult {
    /** Schema information */
    schema_info: {
        name: string;
        description: string;
        version: string;
    };
    /** List of table structure results for each page */
    results: PageTableStructureResult[];
    /** Total number of pages processed */
    total_pages_processed: number;
    /** Total number of tables processed across all pages */
    total_tables_processed: number;
    /** Additional metadata about the structure recognition process */
    metadata: Record<string, any>;
}

/**
 * Validation utilities for table structure types
 */
export const TableStructureValidation = {
    /**
     * Validate a cell
     * @returns true if valid, throws error if invalid
     */
    validateCell: (cell: Cell): boolean => {
        ValidationUtils.validateBoundingBox(cell.bbox);
        ValidationUtils.validateConfidence(cell.confidence);
        if (cell.row_span < 1) throw new Error("row_span must be greater than or equal to 1");
        if (cell.col_span < 1) throw new Error("col_span must be greater than or equal to 1");
        return true;
    },

    /**
     * Validate a table structure
     * @returns true if valid, throws error if invalid
     */
    validateTableStructure: (table: TableStructure): boolean => {
        ValidationUtils.validateBoundingBox(table.bbox);
        ValidationUtils.validateConfidence(table.confidence);
        if (table.num_rows < 1) throw new Error("num_rows must be greater than or equal to 1");
        if (table.num_cols < 1) throw new Error("num_cols must be greater than or equal to 1");
        table.cells.forEach(cell => TableStructureValidation.validateCell(cell));
        return true;
    }
};

/**
 * Helper functions for working with table structures
 */
export const TableStructureUtils = {
    /**
     * Get all header cells from a table
     */
    getHeaderCells: (table: TableStructure): Cell[] => {
        return table.cells.filter(cell => cell.is_header);
    },

    /**
     * Get cells at a specific row index
     */
    getCellsInRow: (table: TableStructure, rowIndex: number): Cell[] => {
        return table.cells.filter(cell => {
            const cellBox = cell.bbox;
            // Calculate approximate row position based on table bbox
            const rowHeight = (table.bbox.y2 - table.bbox.y1) / table.num_rows;
            const cellRowStart = Math.round((cellBox.y1 - table.bbox.y1) / rowHeight);
            const cellRowEnd = cellRowStart + cell.row_span;
            return cellRowStart <= rowIndex && rowIndex < cellRowEnd;
        });
    },

    /**
     * Get cells at a specific column index
     */
    getCellsInColumn: (table: TableStructure, colIndex: number): Cell[] => {
        return table.cells.filter(cell => {
            const cellBox = cell.bbox;
            // Calculate approximate column position based on table bbox
            const colWidth = (table.bbox.x2 - table.bbox.x1) / table.num_cols;
            const cellColStart = Math.round((cellBox.x1 - table.bbox.x1) / colWidth);
            const cellColEnd = cellColStart + cell.col_span;
            return cellColStart <= colIndex && colIndex < cellColEnd;
        });
    },

    /**
     * Get average confidence score for a table
     */
    getAverageConfidence: (table: TableStructure): number => {
        const scores = table.cells.map(cell => cell.confidence.score);
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    },

    /**
     * Convert table structure to a 2D array representation
     */
    toGrid: (table: TableStructure): (Cell | null)[][] => {
        const grid: (Cell | null)[][] = Array(table.num_rows)
            .fill(null)
            .map(() => Array(table.num_cols).fill(null));

        table.cells.forEach(cell => {
            const rowHeight = (table.bbox.y2 - table.bbox.y1) / table.num_rows;
            const colWidth = (table.bbox.x2 - table.bbox.x1) / table.num_cols;

            const rowStart = Math.round((cell.bbox.y1 - table.bbox.y1) / rowHeight);
            const colStart = Math.round((cell.bbox.x1 - table.bbox.x1) / colWidth);

            for (let i = 0; i < cell.row_span; i++) {
                for (let j = 0; j < cell.col_span; j++) {
                    if (rowStart + i < table.num_rows && colStart + j < table.num_cols) {
                        grid[rowStart + i][colStart + j] = cell;
                    }
                }
            }
        });

        return grid;
    }
};
