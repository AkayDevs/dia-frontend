import { create } from 'zustand';

export interface AnalysisType {
    id: string;
    name: string;
    description: string;
    parameters: Record<string, any>;
}

export interface AnalysisConfig {
    documentId: string;
    analysisTypes: AnalysisType[];
    parameters: Record<string, any>;
}

interface AnalysisStore {
    currentConfig: AnalysisConfig | null;
    setCurrentConfig: (config: AnalysisConfig) => void;
    resetConfig: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
    currentConfig: null,
    setCurrentConfig: (config) => set({ currentConfig: config }),
    resetConfig: () => set({ currentConfig: null }),
})); 