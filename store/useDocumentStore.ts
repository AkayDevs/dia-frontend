import { create } from 'zustand';
import { Document, AnalysisResult } from '@/types/document';

interface DocumentStore {
    documents: Document[];
    selectedDocument: Document | null;
    analysisResults: AnalysisResult[];
    setDocuments: (documents: Document[]) => void;
    addDocument: (document: Document) => void;
    setSelectedDocument: (document: Document | null) => void;
    updateDocumentStatus: (documentId: string, status: Document['status']) => void;
    setAnalysisResults: (results: AnalysisResult[]) => void;
    addAnalysisResult: (result: AnalysisResult) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
    documents: [],
    selectedDocument: null,
    analysisResults: [],

    setDocuments: (documents) => set({ documents }),

    addDocument: (document) =>
        set((state) => ({
            documents: [...state.documents, document],
        })),

    setSelectedDocument: (document) => set({ selectedDocument: document }),

    updateDocumentStatus: (documentId, status) =>
        set((state) => ({
            documents: state.documents.map((doc) =>
                doc.id === documentId ? { ...doc, status } : doc
            ),
        })),

    setAnalysisResults: (results) => set({ analysisResults: results }),

    addAnalysisResult: (result) =>
        set((state) => ({
            analysisResults: [...state.analysisResults, result],
        })),
})); 