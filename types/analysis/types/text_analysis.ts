import { BaseAnalysisRun, BaseStep, BaseAnalysisStepResult } from '../base';

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
 * Text analysis configuration
 */
export interface TextAnalysisConfig extends BaseAnalysisRun {
    type: 'text_extraction';
    extractionOptions: TextExtractionOptions;
    processingOptions: TextProcessingOptions;
    advancedSettings?: Record<string, any>;
}

/**
 * Text extraction step
 */
export interface TextExtractionStep extends BaseStep {
    extractionResults?: {
        pageCount: number;
        characterCount: number;
        wordCount: number;
        detectedLanguage?: string;
        confidence?: number;
    };
}

/**
 * Text processing step
 */
export interface TextProcessingStep extends BaseStep {
    processingResults?: {
        paragraphCount: number;
        listCount: number;
        tableCount: number;
        metadata?: Record<string, any>;
    };
}

/**
 * Text content block
 */
export interface TextContentBlock {
    id: string;
    type: 'paragraph' | 'heading' | 'list' | 'list_item' | 'table' | 'image' | 'metadata';
    text: string;
    pageNumber: number;
    boundingBox?: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    confidence?: number;
    metadata?: Record<string, any>;
    children?: TextContentBlock[];
}

/**
 * Text analysis result
 */
export interface TextAnalysisResult extends BaseAnalysisStepResult {
    type: 'text_extraction';
    content: {
        fullText: string;
        blocks: TextContentBlock[];
        language?: string;
        metadata?: Record<string, any>;
    };
} 