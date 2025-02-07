/**
 * Supported document types
 */
import { Analysis } from './analysis';

export enum DocumentType {
    PDF = 'pdf',
    DOCX = 'docx',
    XLSX = 'xlsx',
    IMAGE = 'image'
}

/**
 * Document analysis status
 */
export enum AnalysisStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

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
    analyses: Analysis[];
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
    file?: File;
}

/**
 * Base response type
 */
export interface BaseResponse {
    message: string;
} 