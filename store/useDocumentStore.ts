import { create } from 'zustand';
import { Document, DocumentType } from '@/types/document';

interface DocumentStore {
    documents: Document[];
    selectedDocument: Document | null;
    setDocuments: (documents: Document[]) => void;
    addDocument: (document: Document) => void;
    setSelectedDocument: (document: Document | null) => void;
    updateDocumentStatus: (documentId: string, status: Document['status']) => void;
}

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function to create a mock document
export const createMockDocument = (file: File): Document => {
    const now = new Date().toISOString();
    const type = getDocumentType(file);

    return {
        id: generateId(),
        name: file.name,
        type,
        status: 'pending',
        uploadedAt: now,
        size: file.size,
        url: URL.createObjectURL(file), // Create a temporary URL for development
    };
};

// Helper function to determine document type
const getDocumentType = (file: File): DocumentType => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'pdf';
        case 'doc':
        case 'docx':
            return 'docx';
        case 'xls':
        case 'xlsx':
            return 'xlsx';
        case 'png':
        case 'jpg':
        case 'jpeg':
            return 'image';
        default:
            throw new Error('Unsupported file type');
    }
};

export const useDocumentStore = create<DocumentStore>((set) => ({
    documents: [],
    selectedDocument: null,

    setDocuments: (documents) => set({ documents }),

    addDocument: (document) =>
        set((state) => ({
            documents: [document, ...state.documents],
        })),

    setSelectedDocument: (document) => set({ selectedDocument: document }),

    updateDocumentStatus: (documentId, status) =>
        set((state) => ({
            documents: state.documents.map((doc) =>
                doc.id === documentId ? { ...doc, status } : doc
            ),
        })),
})); 