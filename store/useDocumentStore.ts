import { create } from 'zustand';
import { documentService } from '@/services/document.service';
import { Document, DocumentListParams, AnalysisStatus } from '@/types/document';

interface DocumentState {
    documents: Document[];
    isLoading: boolean;
    error: string | null;
    filters: DocumentListParams;
    lastFetched: number | null;
    isFetching: boolean;

    // Methods
    setFilters: (filters: Partial<DocumentListParams>) => void;
    clearError: () => void;
    fetchDocuments: (forceRefresh?: boolean) => Promise<void>;
    uploadDocument: (file: File) => Promise<Document>;
    uploadDocuments: (files: File[]) => Promise<Document[]>;
    deleteDocument: (documentId: string) => Promise<void>;
    getProcessingDocuments: () => Document[];
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
    documents: [],
    isLoading: false,
    error: null,
    filters: {},
    lastFetched: null,
    isFetching: false,

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            // Reset lastFetched when filters change to force a new fetch
            lastFetched: null
        }));
    },

    clearError: () => set({ error: null }),

    fetchDocuments: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();
        const CACHE_DURATION = 30000; // 30 seconds cache

        // Return cached data if available and not forced refresh
        if (!forceRefresh &&
            state.lastFetched &&
            now - state.lastFetched < CACHE_DURATION &&
            !state.isFetching) {
            return;
        }

        // Prevent concurrent fetches
        if (state.isFetching) {
            return;
        }

        set({ isLoading: true, isFetching: true, error: null });

        try {
            const response = await documentService.getDocuments(state.filters);
            set({
                documents: response.items,
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
            throw error;
        }
    },

    uploadDocument: async (file: File) => {
        set({ isLoading: true, error: null });
        try {
            const document = await documentService.uploadDocument(file);
            set((state) => ({
                documents: [document, ...state.documents],
                isLoading: false,
                lastFetched: Date.now() // Update lastFetched to reflect new data
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
                lastFetched: Date.now() // Update lastFetched to reflect new data
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

    deleteDocument: async (documentId: string) => {
        set({ isLoading: true, error: null });
        try {
            await documentService.deleteDocument(documentId);
            set((state) => ({
                documents: state.documents.filter(doc => doc.id !== documentId),
                isLoading: false,
                lastFetched: Date.now() // Update lastFetched to reflect new data
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to delete document',
                isLoading: false
            });
            throw error;
        }
    },

    getProcessingDocuments: () => {
        const state = get();
        return state.documents.filter(
            doc => doc.status === AnalysisStatus.PROCESSING ||
                doc.status === AnalysisStatus.PENDING
        );
    }
})); 