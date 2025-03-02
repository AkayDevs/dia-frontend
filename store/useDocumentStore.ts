import { create } from 'zustand';
import { documentService } from '@/services/document.service';
import { Document, DocumentListParams, DocumentWithAnalysis, Tag, TagCreate, DocumentUpdate, DocumentPages } from '@/types/document';
import { API_URL } from '@/lib/constants';
import { analysisService } from '@/services/analysis.service';
import { AnalysisRunWithResults } from '@/types/analysis_execution';

interface DocumentState {
    // Document state
    documents: Document[];
    currentDocument: DocumentWithAnalysis | null;
    documentVersions: Document[];
    currentPages: DocumentPages | null;
    isLoading: boolean;
    isPagesLoading: boolean;
    error: string | null;
    pagesError: string | null;
    filters: DocumentListParams;
    lastFetched: number | null;
    isFetching: boolean;

    // Tag state
    tags: Tag[];
    isLoadingTags: boolean;
    tagError: string | null;

    // Document methods
    setFilters: (filters: Partial<DocumentListParams>) => void;
    clearError: () => void;
    clearPagesError: () => void;
    fetchDocuments: (forceRefresh?: boolean) => Promise<void>;
    fetchDocument: (documentId: string, includeAnalyses?: boolean) => Promise<void>;
    uploadDocument: (file: File, tagIds?: number[]) => Promise<Document>;
    uploadDocuments: (files: File[]) => Promise<Document[]>;
    updateDocument: (documentId: string, updates: DocumentUpdate) => Promise<void>;
    deleteDocument: (documentId: string) => Promise<void>;
    fetchDocumentVersions: (documentId: string) => Promise<void>;
    fetchDocumentPages: (documentId: string) => Promise<void>;

    // Tag methods
    fetchTags: (documentId?: string, nameFilter?: string) => Promise<void>;
    createTag: (tag: TagCreate) => Promise<Tag>;
    updateTag: (tagId: number, tag: TagCreate) => Promise<void>;
    deleteTag: (tagId: number) => Promise<void>;
    updateDocumentTags: (documentId: string, tagIds: number[]) => Promise<void>;
    clearTagError: () => void;

    // Utility methods
    reset: () => void;
}

// Helper function to ensure document URLs are absolute
const ensureAbsoluteUrl = (url: string): string => {
    return url.startsWith('http') ? url : `${API_URL}${url}`;
};

// Helper function to process document with full URLs
const processDocument = <T extends Document>(document: T): T => {
    return {
        ...document,
        url: ensureAbsoluteUrl(document.url)
    };
};

const useDocumentStore = create<DocumentState>((set, get) => ({
    // Initial state
    documents: [],
    currentDocument: null,
    documentVersions: [],
    currentPages: null,
    isLoading: false,
    isPagesLoading: false,
    error: null,
    pagesError: null,
    filters: {},
    lastFetched: null,
    isFetching: false,
    tags: [],
    isLoadingTags: false,
    tagError: null,

    // Document methods
    setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
            lastFetched: null // Reset lastFetched to force a refresh
        }));
    },

    clearError: () => set({ error: null }),
    clearPagesError: () => set({ pagesError: null }),

    fetchDocuments: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();

        // Return cached results if available and not forcing refresh
        if (
            !forceRefresh &&
            state.lastFetched &&
            now - state.lastFetched < 60000 && // Cache for 1 minute
            state.documents.length > 0 &&
            !state.isFetching
        ) {
            return;
        }

        if (state.isFetching) return;

        set({ isLoading: true, isFetching: true, error: null });

        try {
            const documents = await documentService.getDocuments(state.filters);
            set({
                documents: documents.map(processDocument),
                lastFetched: now,
                error: null
            });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch documents' });
        } finally {
            set({ isLoading: false, isFetching: false });
        }
    },

    fetchDocument: async (documentId: string, includeAnalyses = true) => {
        set({ isLoading: true, error: null });
        try {
            const document = await documentService.getDocument(documentId);
            let analyses = [] as AnalysisRunWithResults[];
            if (includeAnalyses) {
                analyses = await analysisService.getDocumentAnalyses(documentId);
            }

            const documentWithFullUrl: DocumentWithAnalysis = {
                ...processDocument(document),
                analyses
            };
            set({ currentDocument: documentWithFullUrl });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch document' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    uploadDocument: async (file: File, tagIds?: number[]) => {
        set({ isLoading: true, error: null });
        try {
            const document = await documentService.uploadDocument(file, tagIds);
            const processedDocument = processDocument(document);
            set((state) => ({
                documents: [processedDocument, ...state.documents]
            }));
            return processedDocument;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to upload document' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    uploadDocuments: async (files: File[]) => {
        set({ isLoading: true, error: null });
        try {
            const documents = await documentService.uploadDocuments(files);
            const processedDocuments = documents.map(processDocument);
            set((state) => ({
                documents: [...processedDocuments, ...state.documents]
            }));
            return processedDocuments;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to upload documents' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateDocument: async (documentId: string, updates: DocumentUpdate) => {
        set({ isLoading: true, error: null });
        try {
            const updatedDocument = await documentService.updateDocument(documentId, updates);
            const processedDocument = processDocument(updatedDocument);

            set((state) => ({
                documents: state.documents.map((doc) =>
                    doc.id === documentId ? processedDocument : doc
                ),
                currentDocument: state.currentDocument?.id === documentId
                    ? { ...processedDocument, analyses: state.currentDocument.analyses }
                    : state.currentDocument
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update document' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteDocument: async (documentId: string) => {
        set({ isLoading: true, error: null });
        try {
            await documentService.deleteDocument(documentId);
            set((state) => ({
                documents: state.documents.filter((doc) => doc.id !== documentId),
                currentDocument: state.currentDocument?.id === documentId ? null : state.currentDocument,
                documentVersions: state.documentVersions.filter((doc) => doc.id !== documentId)
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete document' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchDocumentVersions: async (documentId: string) => {
        set({ isLoading: true, error: null });
        try {
            const versions = await documentService.getDocumentVersions(documentId);
            set({ documentVersions: versions.map(processDocument) });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch document versions' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchDocumentPages: async (documentId: string) => {
        set({ isPagesLoading: true, pagesError: null });
        try {
            const pages = await documentService.getDocumentPages(documentId);
            // Process page image URLs
            const processedPages: DocumentPages = {
                ...pages,
                pages: pages.pages.map(page => ({
                    ...page,
                    image_url: ensureAbsoluteUrl(page.image_url)
                }))
            };
            set({ currentPages: processedPages });
        } catch (error) {
            set({
                pagesError: error instanceof Error ? error.message : 'Failed to fetch document pages',
                currentPages: null
            });
            throw error;
        } finally {
            set({ isPagesLoading: false });
        }
    },

    // Tag methods
    fetchTags: async (documentId?: string, nameFilter?: string) => {
        set({ isLoadingTags: true, tagError: null });
        try {
            const tags = await documentService.getTags(documentId, nameFilter);
            set({ tags });
        } catch (error) {
            set({ tagError: error instanceof Error ? error.message : 'Failed to fetch tags' });
            throw error;
        } finally {
            set({ isLoadingTags: false });
        }
    },

    createTag: async (tag: TagCreate) => {
        set({ isLoadingTags: true, tagError: null });
        try {
            const newTag = await documentService.createTag(tag);
            set((state) => ({
                tags: [...state.tags, newTag]
            }));
            return newTag;
        } catch (error) {
            set({ tagError: error instanceof Error ? error.message : 'Failed to create tag' });
            throw error;
        } finally {
            set({ isLoadingTags: false });
        }
    },

    updateTag: async (tagId: number, tag: TagCreate) => {
        set({ isLoadingTags: true, tagError: null });
        try {
            const updatedTag = await documentService.updateTag(tagId, tag);
            set((state) => ({
                tags: state.tags.map((t) => t.id === tagId ? updatedTag : t)
            }));
        } catch (error) {
            set({ tagError: error instanceof Error ? error.message : 'Failed to update tag' });
            throw error;
        } finally {
            set({ isLoadingTags: false });
        }
    },

    deleteTag: async (tagId: number) => {
        set({ isLoadingTags: true, tagError: null });
        try {
            await documentService.deleteTag(tagId);
            set((state) => ({
                tags: state.tags.filter((t) => t.id !== tagId)
            }));
        } catch (error) {
            set({ tagError: error instanceof Error ? error.message : 'Failed to delete tag' });
            throw error;
        } finally {
            set({ isLoadingTags: false });
        }
    },

    updateDocumentTags: async (documentId: string, tagIds: number[]) => {
        set({ isLoadingTags: true, tagError: null });
        try {
            const updatedDocument = await documentService.updateDocumentTags(documentId, tagIds);
            const processedDocument = processDocument(updatedDocument);

            set((state) => ({
                documents: state.documents.map((doc) =>
                    doc.id === documentId ? processedDocument : doc
                ),
                currentDocument: state.currentDocument?.id === documentId
                    ? { ...processedDocument, analyses: state.currentDocument.analyses }
                    : state.currentDocument
            }));
        } catch (error) {
            set({ tagError: error instanceof Error ? error.message : 'Failed to update document tags' });
            throw error;
        } finally {
            set({ isLoadingTags: false });
        }
    },

    clearTagError: () => set({ tagError: null }),

    // Utility methods
    reset: () => set({
        documents: [],
        currentDocument: null,
        documentVersions: [],
        currentPages: null,
        isLoading: false,
        isPagesLoading: false,
        error: null,
        pagesError: null,
        filters: {},
        lastFetched: null,
        isFetching: false,
        tags: [],
        isLoadingTags: false,
        tagError: null
    })
}));

export { useDocumentStore }; 