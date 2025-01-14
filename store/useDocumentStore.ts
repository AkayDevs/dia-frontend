import { create } from 'zustand';
import { documentService } from '@/services/document.service';
import { Document, DocumentListParams, DocumentWithAnalysis, Tag, TagCreate, DocumentUpdate } from '@/types/document';

interface DocumentState {
    // Document state
    documents: Document[];
    currentDocument: DocumentWithAnalysis | null;
    documentVersions: Document[];
    isLoading: boolean;
    error: string | null;
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
    fetchDocuments: (forceRefresh?: boolean) => Promise<void>;
    fetchDocument: (documentId: string) => Promise<void>;
    uploadDocument: (file: File, tagIds?: number[]) => Promise<Document>;
    uploadDocuments: (files: File[]) => Promise<Document[]>;
    updateDocument: (documentId: string, updates: DocumentUpdate) => Promise<void>;
    deleteDocument: (documentId: string) => Promise<void>;
    fetchDocumentVersions: (documentId: string) => Promise<void>;

    // Tag methods
    fetchTags: (documentId?: string, nameFilter?: string) => Promise<void>;
    createTag: (tag: TagCreate) => Promise<Tag>;
    updateTag: (tagId: number, tag: TagCreate) => Promise<void>;
    deleteTag: (tagId: number) => Promise<void>;
    updateDocumentTags: (documentId: string, tagIds: number[]) => Promise<void>;
    clearTagError: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
    // Initial state
    documents: [],
    currentDocument: null,
    documentVersions: [],
    isLoading: false,
    error: null,
    filters: {},
    lastFetched: null,
    isFetching: false,
    tags: [],
    isLoadingTags: false,
    tagError: null,

    // Document methods
    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            lastFetched: null
        }));
    },

    clearError: () => set({ error: null }),

    fetchDocuments: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();
        const CACHE_DURATION = 30000; // 30 seconds cache

        if (!forceRefresh &&
            state.lastFetched &&
            now - state.lastFetched < CACHE_DURATION &&
            !state.isFetching) {
            return;
        }

        if (state.isFetching) {
            return;
        }

        set({ isLoading: true, isFetching: true, error: null });

        try {
            const response = await documentService.getDocuments(state.filters);
            set({
                documents: response,
                lastFetched: now,
                isLoading: false,
                isFetching: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch documents',
                isLoading: false,
                isFetching: false
            });
        }
    },

    fetchDocument: async (documentId: string) => {
        set({ isLoading: true, error: null });
        try {
            const document = await documentService.getDocument(documentId);
            set({
                currentDocument: document,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch document',
                isLoading: false
            });
        }
    },

    uploadDocument: async (file: File, tagIds?: number[]) => {
        set({ isLoading: true, error: null });
        try {
            const document = await documentService.uploadDocument(file, tagIds);
            set((state) => ({
                documents: [document, ...state.documents],
                isLoading: false,
                lastFetched: Date.now()
            }));
            return document;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to upload document',
                isLoading: false
            });
            throw error;
        }
    },

    uploadDocuments: async (files: File[]) => {
        set({ isLoading: true, error: null });
        try {
            const documents = await documentService.uploadDocuments(files);
            set((state) => ({
                documents: [...documents, ...state.documents],
                isLoading: false,
                lastFetched: Date.now()
            }));
            return documents;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to upload documents',
                isLoading: false
            });
            throw error;
        }
    },

    updateDocument: async (documentId: string, updates: DocumentUpdate) => {
        set({ isLoading: true, error: null });
        try {
            const updatedDoc = await documentService.updateDocument(documentId, updates);
            set((state) => ({
                documents: state.documents.map(doc =>
                    doc.id === documentId ? updatedDoc : doc
                ),
                currentDocument: state.currentDocument?.id === documentId ?
                    { ...state.currentDocument, ...updatedDoc } :
                    state.currentDocument,
                isLoading: false,
                lastFetched: Date.now()
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update document',
                isLoading: false
            });
            throw error;
        }
    },

    deleteDocument: async (documentId: string) => {
        set({ isLoading: true, error: null });
        try {
            await documentService.deleteDocument(documentId);
            set((state) => ({
                documents: state.documents.filter(doc => doc.id !== documentId),
                currentDocument: state.currentDocument?.id === documentId ? null : state.currentDocument,
                isLoading: false,
                lastFetched: Date.now()
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to delete document',
                isLoading: false
            });
            throw error;
        }
    },

    fetchDocumentVersions: async (documentId: string) => {
        set({ isLoading: true, error: null });
        try {
            const versions = await documentService.getDocumentVersions(documentId);
            set({
                documentVersions: versions,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch document versions',
                isLoading: false
            });
            throw error;
        }
    },

    // Tag methods
    fetchTags: async (documentId?: string, nameFilter?: string) => {
        set({ isLoadingTags: true, tagError: null });
        try {
            const tags = await documentService.getTags(documentId, nameFilter);
            set({
                tags,
                isLoadingTags: false
            });
        } catch (error) {
            set({
                tagError: error instanceof Error ? error.message : 'Failed to fetch tags',
                isLoadingTags: false
            });
            throw error;
        }
    },

    createTag: async (tag: TagCreate) => {
        set({ isLoadingTags: true, tagError: null });
        try {
            const newTag = await documentService.createTag(tag);
            set((state) => ({
                tags: [...state.tags, newTag],
                isLoadingTags: false
            }));
            return newTag;
        } catch (error) {
            set({
                tagError: error instanceof Error ? error.message : 'Failed to create tag',
                isLoadingTags: false
            });
            throw error;
        }
    },

    updateTag: async (tagId: number, tag: TagCreate) => {
        set({ isLoadingTags: true, tagError: null });
        try {
            const updatedTag = await documentService.updateTag(tagId, tag);
            set((state) => ({
                tags: state.tags.map(t => t.id === tagId ? updatedTag : t),
                isLoadingTags: false
            }));
        } catch (error) {
            set({
                tagError: error instanceof Error ? error.message : 'Failed to update tag',
                isLoadingTags: false
            });
            throw error;
        }
    },

    deleteTag: async (tagId: number) => {
        set({ isLoadingTags: true, tagError: null });
        try {
            await documentService.deleteTag(tagId);
            set((state) => ({
                tags: state.tags.filter(t => t.id !== tagId),
                isLoadingTags: false
            }));
        } catch (error) {
            set({
                tagError: error instanceof Error ? error.message : 'Failed to delete tag',
                isLoadingTags: false
            });
            throw error;
        }
    },

    updateDocumentTags: async (documentId: string, tagIds: number[]) => {
        set({ isLoading: true, error: null });
        try {
            const updatedDoc = await documentService.updateDocumentTags(documentId, tagIds);
            set((state) => ({
                documents: state.documents.map(doc =>
                    doc.id === documentId ? updatedDoc : doc
                ),
                currentDocument: state.currentDocument?.id === documentId ?
                    { ...state.currentDocument, ...updatedDoc } :
                    state.currentDocument,
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update document tags',
                isLoading: false
            });
            throw error;
        }
    },

    clearTagError: () => set({ tagError: null })
})); 