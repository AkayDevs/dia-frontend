import { AnalysisResponse } from '@/types/analysis';

export interface BaseEditorProps {
    analysis: AnalysisResponse;
    onSave?: (updatedResults: any) => Promise<void>;
    isEditable?: boolean;
}

export interface TableData {
    headers: string[];
    rows: string[][];
}

export interface TextExtractionData {
    text: string;
    confidence: number;
    pages: {
        pageNumber: number;
        content: string;
    }[];
}

export interface SummarizationData {
    originalText: string;
    summary: string;
    keyPoints: string[];
    confidence: number;
}

export interface TemplateData {
    fields: {
        name: string;
        value: string;
        confidence: number;
        boundingBox?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }[];
    template: string;
    confidence: number;
} 