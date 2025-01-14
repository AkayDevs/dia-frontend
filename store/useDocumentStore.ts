import { create } from 'zustand';
import { documentService } from '@/services/document.service';
import { Document, DocumentListParams, DocumentWithAnalysis, Tag, TagCreate, DocumentUpdate } from '@/types/document';
import { API_URL } from '@/lib/constants';

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

const useDocumentStore = create<DocumentState>((set, get) => ({
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
    setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
            lastFetched: null // Reset lastFetched to force a refresh
        }));
    },

    clearError: () => set({ error: null }),

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

        set({ isLoading: true, isFetching: true });

        try {
            const documents = await documentService.getDocuments(state.filters);
            // Add API URL to document URLs
            const documentsWithFullUrls = documents.map(doc => ({
                ...doc,
                url: doc.url.startsWith('http') ? doc.url : `${API_URL}${doc.url}`
            }));
            set({
                documents: documentsWithFullUrls,
                lastFetched: now,
                error: null
            });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch documents' });
        } finally {
            set({ isLoading: false, isFetching: false });
        }
    },

    fetchDocument: async (documentId: string) => {
        set({ isLoading: true });
        try {
            const document = await documentService.getDocument(documentId);
            // Add API URL to document URL and ensure it's a DocumentWithAnalysis
            const documentWithFullUrl: DocumentWithAnalysis = {
                ...document,
                url: document.url.startsWith('http') ? document.url : `${API_URL}${document.url}`,
                analyses: []
            };
            set({ currentDocument: documentWithFullUrl, error: null });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch document' });
        } finally {
            set({ isLoading: false });
        }
    },

    uploadDocument: async (file: File, tagIds?: number[]) => {
        set({ isLoading: true });
        try {
            const document = await documentService.uploadDocument(file, tagIds);
            // Add API URL to document URL
            const documentWithFullUrl = {
                ...document,
                url: document.url.startsWith('http') ? document.url : `${API_URL}${document.url}`
            };
            set((state) => ({
                documents: [documentWithFullUrl, ...state.documents],
                error: null
            }));
            return documentWithFullUrl;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to upload document' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    uploadDocuments: async (files: File[]) => {
        set({ isLoading: true });
        try {
            const documents = await documentService.uploadDocuments(files);
            // Add API URL to document URLs
            const documentsWithFullUrls = documents.map(doc => ({
                ...doc,
                url: doc.url.startsWith('http') ? doc.url : `${API_URL}${doc.url}`
            }));
            set((state) => ({
                documents: [...documentsWithFullUrls, ...state.documents],
                error: null
            }));
            return documentsWithFullUrls;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to upload documents' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateDocument: async (documentId: string, updates: DocumentUpdate) => {
        set({ isLoading: true });
        try {
            const updatedDocument = await documentService.updateDocument(documentId, updates);
            // Add API URL to document URL and ensure it's a DocumentWithAnalysis when needed
            const documentWithFullUrl = {
                ...updatedDocument,
                url: updatedDocument.url.startsWith('http') ? updatedDocument.url : `${API_URL}${updatedDocument.url}`,
            };
            set((state) => ({
                documents: state.documents.map((doc) =>
                    doc.id === documentId ? documentWithFullUrl : doc
                ),
                currentDocument: state.currentDocument?.id === documentId
                    ? { ...documentWithFullUrl, analyses: state.currentDocument.analyses }
                    : state.currentDocument,
                error: null
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update document' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteDocument: async (documentId: string) => {
        set({ isLoading: true });
        try {
            await documentService.deleteDocument(documentId);
            set((state) => ({
                documents: state.documents.filter((doc) => doc.id !== documentId),
                currentDocument: state.currentDocument?.id === documentId
                    ? null
                    : state.currentDocument,
                error: null
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete document' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchDocumentVersions: async (documentId: string) => {
        set({ isLoading: true });
        try {
            const versions = await documentService.getDocumentVersions(documentId);
            // Add API URL to document URLs
            const versionsWithFullUrls = versions.map(version => ({
                ...version,
                url: version.url.startsWith('http') ? version.url : `${API_URL}${version.url}`
            }));
            set({ documentVersions: versionsWithFullUrls, error: null });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch document versions' });
        } finally {
            set({ isLoading: false });
        }
    },

    // Tag methods
    fetchTags: async (documentId?: string, nameFilter?: string) => {
        set({ isLoadingTags: true });
        try {
            const tags = await documentService.getTags(documentId, nameFilter);
            set({ tags, tagError: null });
        } catch (error) {
            set({ tagError: error instanceof Error ? error.message : 'Failed to fetch tags' });
        } finally {
            set({ isLoadingTags: false });
        }
    },

    createTag: async (tag: TagCreate) => {
        set({ isLoadingTags: true });
        try {
            const newTag = await documentService.createTag(tag);
            set((state) => ({
                tags: [...state.tags, newTag],
                tagError: null
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
        set({ isLoadingTags: true });
        try {
            await documentService.updateTag(tagId, tag);
            set((state) => ({
                tags: state.tags.map((t) =>
                    t.id === tagId ? { ...t, ...tag } : t
                ),
                tagError: null
            }));
        } catch (error) {
            set({ tagError: error instanceof Error ? error.message : 'Failed to update tag' });
            throw error;
        } finally {
            set({ isLoadingTags: false });
        }
    },

    deleteTag: async (tagId: number) => {
        set({ isLoadingTags: true });
        try {
            await documentService.deleteTag(tagId);
            set((state) => ({
                tags: state.tags.filter((t) => t.id !== tagId),
                tagError: null
            }));
        } catch (error) {
            set({ tagError: error instanceof Error ? error.message : 'Failed to delete tag' });
            throw error;
        } finally {
            set({ isLoadingTags: false });
        }
    },

    updateDocumentTags: async (documentId: string, tagIds: number[]) => {
        set({ isLoadingTags: true });
        try {
            await documentService.updateDocumentTags(documentId, tagIds);
            const document = await documentService.getDocument(documentId);
            // Add API URL to document URL and ensure it's a DocumentWithAnalysis when needed
            const documentWithFullUrl = {
                ...document,
                url: document.url.startsWith('http') ? document.url : `${API_URL}${document.url}`,
            };
            set((state) => ({
                documents: state.documents.map((doc) =>
                    doc.id === documentId ? documentWithFullUrl : doc
                ),
                currentDocument: state.currentDocument?.id === documentId
                    ? { ...documentWithFullUrl, analyses: state.currentDocument.analyses }
                    : state.currentDocument,
                tagError: null
            }));
        } catch (error) {
            set({ tagError: error instanceof Error ? error.message : 'Failed to update document tags' });
            throw error;
        } finally {
            set({ isLoadingTags: false });
        }
    },

    clearTagError: () => set({ tagError: null })
}));

export { useDocumentStore }; 