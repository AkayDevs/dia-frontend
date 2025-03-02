import { BoundingBox, Confidence, PageInfo, ValidationUtils } from './shared';

/**
 * Standard cell content information
 */
export interface CellContent {
    /** Raw text content */
    text: string;
    /** Extraction confidence */
    confidence: Confidence;
    /** Detected data type (e.g., 'text', 'number', 'date') */
    data_type?: string;
    /** Normalized value if applicable */
    normalized_value?: any;
}

/**
 * Standard table data information
 */
export interface TableData {
    /** Table bounding box */
    bbox: BoundingBox;
    /** 2D array representing the table content */
    cells: CellContent[][];
    /** Table data extraction confidence */
    confidence: Confidence;
}

/**
 * Results for a single page of table data extraction
 */
export interface PageTableDataResult {
    /** Information about the processed page */
    page_info: PageInfo;
    /** List of table data on this page */
    tables: TableData[];
    /** Additional processing information for this page */
    processing_info: Record<string, any>;
}

/**
 * Schema for table data results across all pages
 */
export interface TableDataResult {
    /** Schema information */
    schema_info: {
        name: string;
        description: string;
        version: string;
    };
    /** List of table data results for each page */
    results: PageTableDataResult[];
    /** Total number of pages processed */
    total_pages_processed: number;
    /** Total number of tables processed across all pages */
    total_tables_processed: number;
    /** Additional metadata about the data extraction process */
    metadata: Record<string, any>;
}

/**
 * Validation utilities for table data types
 */
export const TableDataValidation = {
    /**
     * Validate cell content
     * @returns true if valid, throws error if invalid
     */
    validateCellContent: (cell: CellContent): boolean => {
        ValidationUtils.validateConfidence(cell.confidence);
        if (cell.text === undefined) throw new Error("Cell text is required");
        return true;
    },

    /**
     * Validate table data
     * @returns true if valid, throws error if invalid
     */
    validateTableData: (table: TableData): boolean => {
        ValidationUtils.validateBoundingBox(table.bbox);
        ValidationUtils.validateConfidence(table.confidence);
        if (!table.cells.length) throw new Error("Table must have at least one row");
        if (!table.cells[0].length) throw new Error("Table must have at least one column");

        // Validate all cells
        table.cells.forEach(row =>
            row.forEach(cell => TableDataValidation.validateCellContent(cell))
        );

        // Validate rectangular shape
        const firstRowLength = table.cells[0].length;
        if (!table.cells.every(row => row.length === firstRowLength)) {
            throw new Error("All rows must have the same number of columns");
        }

        return true;
    }
};

/**
 * Helper functions for working with table data
 */
export const TableDataUtils = {
    /**
     * Get table dimensions
     */
    getDimensions: (table: TableData): { rows: number; cols: number } => {
        return {
            rows: table.cells.length,
            cols: table.cells[0]?.length || 0
        };
    },

    /**
     * Convert table to CSV string
     */
    toCSV: (table: TableData, delimiter: string = ','): string => {
        return table.cells
            .map(row =>
                row.map(cell => {
                    // Escape quotes and wrap in quotes if contains delimiter or newline
                    const text = cell.text.replace(/"/g, '""');
                    return text.includes(delimiter) || text.includes('\n') || text.includes('"')
                        ? `"${text}"`
                        : text;
                }).join(delimiter)
            )
            .join('\n');
    },

    /**
     * Get all cells of a specific data type
     */
    getCellsByType: (table: TableData, dataType: string): CellContent[] => {
        return table.cells.flat().filter(cell => cell.data_type === dataType);
    },

    /**
     * Get average confidence score for a table
     */
    getAverageConfidence: (table: TableData): number => {
        const scores = table.cells.flat().map(cell => cell.confidence.score);
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    },

    /**
     * Convert table data to array of objects using first row as headers
     */
    toObjectArray: (table: TableData): Record<string, any>[] => {
        if (table.cells.length < 2) return [];

        const headers = table.cells[0].map(cell => cell.text);
        return table.cells.slice(1).map(row => {
            const obj: Record<string, any> = {};
            row.forEach((cell, index) => {
                if (index < headers.length) {
                    obj[headers[index]] = cell.normalized_value ?? cell.text;
                }
            });
            return obj;
        });
    },

    /**
     * Get a specific cell by row and column index
     */
    getCell: (table: TableData, row: number, col: number): CellContent | null => {
        return table.cells[row]?.[col] ?? null;
    },

    /**
     * Check if all cells in the table have a specific data type
     */
    hasUniformDataType: (table: TableData, dataType: string): boolean => {
        return table.cells.every(row =>
            row.every(cell => cell.data_type === dataType)
        );
    }
};
