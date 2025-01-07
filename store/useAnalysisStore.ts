import { create } from 'zustand';
import { analysisService } from '@/services/analysis.service';
import {
    AnalysisType,
    AnalysisConfig,
    AnalysisRequest,
    AnalysisResponse,
    AnalysisListParams,
    AnalysisProgress,
    AnalysisStatus
} from '@/types/analysis';

interface AnalysisState {
    // Analysis configurations
    availableTypes: AnalysisConfig[];
    currentConfig: AnalysisConfig | null;

    // Analysis tasks state
    analyses: AnalysisResponse[];
    currentAnalysis: AnalysisResponse | null;
    isLoading: boolean;
    error: string | null;
    filters: AnalysisListParams;
    lastFetched: number | null;
    isFetching: boolean;

    // Analysis progress tracking
    processingAnalyses: Map<string, AnalysisProgress>;

    // Methods for configuration
    setCurrentConfig: (config: AnalysisConfig | null) => void;
    loadAvailableTypes: () => Promise<void>;

    // Methods for analysis operations
    startAnalysis: (documentId: string, request: AnalysisRequest) => Promise<AnalysisResponse>;
    cancelAnalysis: (analysisId: string) => Promise<void>;
    retryAnalysis: (analysisId: string) => Promise<void>;

    // Methods for fetching and managing analyses
    fetchAnalyses: (forceRefresh?: boolean) => Promise<void>;
    fetchAnalysis: (analysisId: string) => Promise<void>;
    setFilters: (filters: Partial<AnalysisListParams>) => void;
    clearError: () => void;

    // Methods for progress tracking
    updateAnalysisProgress: (analysisId: string, progress: AnalysisProgress) => void;
    clearAnalysisProgress: (analysisId: string) => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
    // Initial state
    availableTypes: [],
    currentConfig: null,
    analyses: [],
    currentAnalysis: null,
    isLoading: false,
    error: null,
    filters: {},
    lastFetched: null,
    isFetching: false,
    processingAnalyses: new Map(),

    // Configuration methods
    setCurrentConfig: (config) => set({ currentConfig: config }),

    loadAvailableTypes: async () => {
        try {
            set({ isLoading: true, error: null });
            const types = await analysisService.getAvailableTypes();
            set({ availableTypes: types, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load analysis types',
                isLoading: false
            });
            throw error;
        }
    },

    // Analysis operations
    startAnalysis: async (documentId: string, request: AnalysisRequest) => {
        try {
            set({ isLoading: true, error: null });
            const analysis = await analysisService.startAnalysis(documentId, request);

            // Update analyses list and track progress
            set((state) => ({
                analyses: [analysis, ...state.analyses],
                processingAnalyses: new Map(state.processingAnalyses).set(analysis.id, {
                    status: analysis.status,
                    progress: 0
                }),
                isLoading: false,
                lastFetched: Date.now()
            }));

            return analysis;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to start analysis',
                isLoading: false
            });
            throw error;
        }
    },

    cancelAnalysis: async (analysisId: string) => {
        try {
            set({ isLoading: true, error: null });
            await analysisService.cancelAnalysis(analysisId);

            // Update analysis status in the list
            set((state) => ({
                analyses: state.analyses.map(analysis =>
                    analysis.id === analysisId
                        ? { ...analysis, status: AnalysisStatus.FAILED }
                        : analysis
                ),
                processingAnalyses: (() => {
                    const newMap = new Map(state.processingAnalyses);
                    newMap.delete(analysisId);
                    return newMap;
                })(),
                isLoading: false,
                lastFetched: Date.now()
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to cancel analysis',
                isLoading: false
            });
            throw error;
        }
    },

    retryAnalysis: async (analysisId: string) => {
        try {
            set({ isLoading: true, error: null });
            const analysis = await analysisService.retryAnalysis(analysisId);

            // Update analysis in the list
            set((state) => ({
                analyses: state.analyses.map(a => a.id === analysisId ? analysis : a),
                processingAnalyses: new Map(state.processingAnalyses).set(analysis.id, {
                    status: AnalysisStatus.PENDING,
                    progress: 0
                }),
                isLoading: false,
                lastFetched: Date.now()
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to retry analysis',
                isLoading: false
            });
            throw error;
        }
    },

    // Fetching and managing analyses
    fetchAnalyses: async (forceRefresh = false) => {
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
            const response = await analysisService.getAnalyses(state.filters);
            set({
                analyses: response,
                lastFetched: now,
                isLoading: false,
                isFetching: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch analyses',
                isLoading: false,
                isFetching: false
            });
            throw error;
        }
    },

    fetchAnalysis: async (analysisId: string) => {
        try {
            set({ isLoading: true, error: null });
            const analysis = await analysisService.getAnalysis(analysisId);
            set({
                currentAnalysis: analysis,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch analysis',
                isLoading: false
            });
            throw error;
        }
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            lastFetched: null // Reset lastFetched when filters change
        }));
    },

    clearError: () => set({ error: null }),

    // Progress tracking methods
    updateAnalysisProgress: (analysisId: string, progress: AnalysisProgress) => {
        set((state) => ({
            processingAnalyses: new Map(state.processingAnalyses).set(analysisId, progress),
            analyses: state.analyses.map(analysis =>
                analysis.id === analysisId
                    ? { ...analysis, status: progress.status, progress: progress.progress }
                    : analysis
            )
        }));
    },

    clearAnalysisProgress: (analysisId: string) => {
        set((state) => {
            const newMap = new Map(state.processingAnalyses);
            newMap.delete(analysisId);
            return { processingAnalyses: newMap };
        });
    }
})); 