export interface Document {
    id: string;
    name: string;
    type: DocumentType;
    status: AnalysisStatus;
    uploadedAt: string;
    size: number;
    url: string;
}

export type DocumentType = 'pdf' | 'docx' | 'xlsx' | 'image';

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalysisResult {
    id: string;
    documentId: string;
    type: AnalysisType;
    result: any; // This will be typed based on specific analysis types
    createdAt: string;
}

export type AnalysisType = 'table_detection' | 'text_extraction' | 'text_summarization' | 'template_conversion';

export interface AnalysisParameters {
    type: AnalysisType;
    options: {
        [key: string]: any;
    };
} 