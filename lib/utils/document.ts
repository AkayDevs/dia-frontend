import { Document } from '@/types/document';
import { API_URL, API_VERSION } from '@/lib/constants';

/**
 * Convert document URL to absolute URL
 */
export const getDocumentUrl = (document: Document): string => {
    if (document.url.startsWith('http')) {
        return document.url;
    }
    return `${API_URL}${document.url}`;
};

/**
 * Get page image URLs for a document
 */
export const getDocumentPageUrls = (document: Document, pages?: { image_url: string }[]): string[] => {
    if (pages) {
        return pages.map(page => `${API_URL}${page.image_url}`);
    }

    // Fallback to the old method if pages are not provided
    const baseUrl = `${API_URL}${API_VERSION}/documents/${document.id}/pages`;
    const numPages = document.metadata?.num_pages || 1;
    return Array.from({ length: numPages }, (_, i) => `${baseUrl}/${i + 1}`);
}; 