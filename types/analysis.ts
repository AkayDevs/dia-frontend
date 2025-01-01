export interface AnalysisConfig {
    documentId: string;
    analysisTypes: AnalysisTypeConfig[];
}

export interface AnalysisTypeConfig {
    type: AnalysisType;
    options: AnalysisOptions;
    enabled: boolean;
}

export type AnalysisType =
    | 'table_detection'
    | 'text_extraction'
    | 'text_summarization'
    | 'template_conversion';

export interface AnalysisOptions {
    // Table Detection Options
    confidenceThreshold?: number;
    minTableSize?: number;

    // Text Extraction Options
    language?: string;
    ocrEnabled?: boolean;

    // Text Summarization Options
    maxLength?: number;
    style?: 'bullet_points' | 'paragraph' | 'structured';

    // Template Conversion Options
    targetFormat?: 'pdf' | 'docx' | 'html';
    preserveStyles?: boolean;
}

export interface AnalysisPreset {
    id: string;
    name: string;
    description: string;
    config: AnalysisTypeConfig[];
}

export type AnalysisStatus =
    | 'queued'
    | 'processing'
    | 'completed'
    | 'failed';

export interface AnalysisProgress {
    status: AnalysisStatus;
    progress: number;
    currentStep?: string;
    error?: string;
} 