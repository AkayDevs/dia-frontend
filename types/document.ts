/**
 * Supported document types
 */
import { AnalysisRunWithResults } from '@/types/analysis/base';
import { DocumentType } from '@/enums/document';

/**
 * Tag interface
 */
export interface Tag {
    id: number;
    name: string;
    created_at: string;
}

/**
 * Tag creation interface
 */
export interface TagCreate {
    name: string;
}

/**
 * Document metadata interface
 */
export interface DocumentMetadata {
    wordCount?: number;
    pageCount?: number;
    characterCount?: number;
    summary?: string;
    num_pages?: number;
}

/**
 * Document page interface
 */
export interface DocumentPage {
    page_number: number;
    width: number;
    height: number;
    image_url: string;
}

/**
 * Document pages response interface
 */
export interface DocumentPages {
    total_pages: number;
    pages: DocumentPage[];
}

/**
 * Base document interface
 */
export interface DocumentBase {
    name: string;
    type: DocumentType;
    size: number;
    url: string;
}

/**
 * Document creation interface
 */
export interface DocumentCreate extends DocumentBase {
    tag_ids?: number[];
    previous_version_id?: string;
}

/**
 * Document response interface
 */
export interface Document extends DocumentBase {
    id: string;
    uploaded_at: string;
    updated_at?: string;
    user_id: string;
    tags: Tag[];
    previous_version_id?: string;
    is_archived: boolean;
    archived_at?: string;
    retention_until?: string;
    metadata?: DocumentMetadata;
}

/**
 * Document with analysis results
 */
export interface DocumentWithAnalysis extends Document {
    analyses: AnalysisRunWithResults[];
}

/**
 * Query parameters for document list
 */
export interface DocumentListParams {
    tag_id?: number;
    doc_type?: DocumentType;
    skip?: number;
    limit?: number;
}

/**
 * Document update parameters
 */
export interface DocumentUpdate {
    name?: string;
    tag_ids?: number[];
}

/**
 * Base response type
 */
export interface BaseResponse {
    message: string;
} 