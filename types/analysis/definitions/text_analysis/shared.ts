/**
 * Text extraction options
 */
export interface TextExtractionOptions {
    preserveFormatting: boolean;
    extractStructuredContent: boolean;
    detectLanguage: boolean;
    ocrQuality: 'low' | 'medium' | 'high';
    includeConfidenceScores: boolean;
}

/**
 * Text processing options
 */
export interface TextProcessingOptions {
    removeHeadersFooters: boolean;
    normalizeWhitespace: boolean;
    detectParagraphs: boolean;
    detectLists: boolean;
    detectTables: boolean;
    extractMetadata: boolean;
}

/**
 * Text extraction result
 */
export interface TextExtractionResult {
    text: string;
    language?: string;
    confidence?: number;
    metadata?: Record<string, any>;
    pages?: TextPage[];
}

/**
 * Text page
 */
export interface TextPage {
    pageNumber: number;
    text: string;
    elements: TextElement[];
}

/**
 * Text element
 */
export interface TextElement {
    type: 'paragraph' | 'heading' | 'list' | 'table' | 'image' | 'other';
    text: string;
    confidence?: number;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    metadata?: Record<string, any>;
}
