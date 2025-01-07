import { create } from 'zustand';
import { documentService } from '@/services/document.service';
import {
    Document,
    DocumentWithAnalysis,
    DocumentType,
    AnalysisStatus,
    DocumentListParams,
    DocumentListResponse
} from '@/types/document';
import { useAuthStore } from '@/store/useAuthStore';
import { AUTH_TOKEN_KEY } from '@/lib/constants';

interface DocumentState {
    // Document list state
    documents: Document[];
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;

    // Loading and error states
    isLoading: boolean;
    error: string | null;

    // Filters
    filters: DocumentListParams;

    // Selected document state
    selectedDocument: DocumentWithAnalysis | null;

    // Actions
    setDocuments: (response: DocumentListResponse) => void;
    setSelectedDocument: (document: DocumentWithAnalysis | null) => void;
    setError: (error: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    setFilters: (filters: Partial<DocumentListParams>) => void;
    clearError: () => void;

    // Async actions
    fetchDocuments: () => Promise<void>;
    fetchDocument: (id: string) => Promise<void>;
    uploadDocument: (file: File) => Promise<void>;
    uploadDocuments: (files: File[]) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
    // Initial state
    documents: [],
    total: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    isLoading: false,
    error: null,
    filters: {},
    selectedDocument: null,

    // State setters
    setDocuments: (response: DocumentListResponse) => set({
        documents: response.items,
        total: response.total,
        currentPage: response.page,
        pageSize: response.size,
        totalPages: response.pages
    }),

    setSelectedDocument: (document: DocumentWithAnalysis | null) => set({
        selectedDocument: document
    }),

    setError: (error: string | null) => set({ error }),

    setLoading: (isLoading: boolean) => set({ isLoading }),

    clearError: () => set({ error: null }),

    setFilters: (newFilters: Partial<DocumentListParams>) => set(state => ({
        filters: { ...state.filters, ...newFilters }
    })),

    // Async actions
    fetchDocuments: async () => {
        const { setLoading, setError, setDocuments, filters } = get();
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        if (!token) {
            setError('Not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await documentService.getDocuments(filters);
            setDocuments(response);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch documents';
            setError(message);

            // Handle authentication errors
            if (message.includes('authentication') || message.includes('credentials')) {
                useAuthStore.getState().logout();
            }

            throw error;
        } finally {
            setLoading(false);
        }
    },

    fetchDocument: async (id: string) => {
        const { setLoading, setError, setSelectedDocument } = get();
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        if (!token) {
            setError('Not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const document = await documentService.getDocument(id);
            setSelectedDocument(document);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch document';
            setError(message);

            // Handle authentication errors
            if (message.includes('authentication') || message.includes('credentials')) {
                useAuthStore.getState().logout();
            }

            throw error;
        } finally {
            setLoading(false);
        }
    },

    uploadDocument: async (file: File) => {
        const { setLoading, setError, fetchDocuments } = get();
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        if (!token) {
            setError('Not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await documentService.uploadDocument(file);
            await fetchDocuments(); // Refresh the list after upload
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload document';
            setError(message);

            // Handle authentication errors
            if (message.includes('authentication') || message.includes('credentials')) {
                useAuthStore.getState().logout();
            }

            throw error;
        } finally {
            setLoading(false);
        }
    },

    uploadDocuments: async (files: File[]) => {
        const { setLoading, setError, fetchDocuments } = get();
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        if (!token) {
            setError('Not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await documentService.uploadDocuments(files);
            await fetchDocuments(); // Refresh the list after upload
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload documents';
            setError(message);

            // Handle authentication errors
            if (message.includes('authentication') || message.includes('credentials')) {
                useAuthStore.getState().logout();
            }

            throw error;
        } finally {
            setLoading(false);
        }
    },

    deleteDocument: async (id: string) => {
        const { setLoading, setError, fetchDocuments } = get();
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        if (!token) {
            setError('Not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await documentService.deleteDocument(id);
            await fetchDocuments(); // Refresh the list after deletion
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete document';
            setError(message);

            // Handle authentication errors
            if (message.includes('authentication') || message.includes('credentials')) {
                useAuthStore.getState().logout();
            }

            throw error;
        } finally {
            setLoading(false);
        }
    },
})); 