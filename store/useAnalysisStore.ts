import { create } from 'zustand';
import { analysisService } from '@/services/analysis.service';
import {
    AnalysisDefinitionInfo,
    AnalysisDefinition,
    AnalysisStepInfo,
    AnalysisAlgorithmInfo
} from '@/types/analysis/configs';
import {
    AnalysisRunInfo,
    AnalysisRunWithResults,
    StepResultResponse,
    AnalysisRunConfig,
    AnalysisRunWithResultsInfo
} from '@/types/analysis/base';
import { DocumentType } from '@/enums/document';
import {
    AnalysisDefinitionCode,
    TableAnalysisStepCode,
    AnalysisStatus,
    AnalysisMode
} from '@/enums/analysis';
import { getAnalysisConstants } from '@/constants/analysis/registry';
import {
    TableDetectionOutput,
    TableStructureOutput,
    TableDataOutput
} from '@/types/analysis/definitions/table_analysis';

/**
 * Union type for step results
 */
type StepResult = {
    step_code: TableAnalysisStepCode;
    result: TableDetectionOutput | TableStructureOutput | TableDataOutput;
};

interface AnalysisState {
    // Analysis definitions and configurations
    analysisDefinitions: AnalysisDefinitionInfo[];
    currentDefinition: AnalysisDefinition | null;
    availableAlgorithms: Record<string, AnalysisAlgorithmInfo[]>;

    // Analysis state
    analyses: Record<string, AnalysisRunWithResultsInfo | AnalysisRunWithResults>;
    currentAnalysis: AnalysisRunWithResults | null;
    currentStepResult: StepResultResponse & StepResult | null;

    // Cache control
    lastFetchTimestamps: Record<string, number>;

    // UI state
    isLoading: boolean;
    error: string | null;

    // Derived state (computed from currentAnalysis)
    analysisId: string;
    documentId: string;
    analysisType: string;
    constants: any;

    // Type guards (derived from analysisType)
    isTableAnalysis: boolean;
    isTextAnalysis: boolean;

    // Methods for analysis definitions
    fetchAnalysisDefinitions: () => Promise<void>;
    fetchAnalysisDefinition: (definitionCode: string) => Promise<void>;
    setCurrentDefinition: (definition: AnalysisDefinition | null) => void;
    fetchStepAlgorithms: (stepCode: string) => Promise<void>;

    // Methods for analysis operations
    startAnalysis: (
        documentId: string,
        analysisCode: string,
        mode?: AnalysisMode,
        config?: AnalysisRunConfig
    ) => Promise<void>;
    fetchDocumentAnalyses: (documentId: string, forceRefresh?: boolean) => Promise<void>;
    fetchUserAnalyses: (params?: any, forceRefresh?: boolean) => Promise<void>;
    fetchAnalysis: (analysisId: string, forceRefresh?: boolean) => Promise<void>;
    getAnalysisResult: (analysisId: string) => Promise<StepResultResponse | null>;
    executeStep: (
        analysisId: string,
        stepId: string,
        algorithmId: string,
        parameters?: Record<string, any>
    ) => Promise<void>;
    updateStepCorrections: (
        analysisId: string,
        stepId: string,
        corrections: Record<string, any>
    ) => Promise<void>;

    // Analysis configuration methods
    updateConfig: (config: Partial<AnalysisRunInfo>) => Promise<void>;

    // Navigation and selection methods
    setAnalysisId: (id: string) => void;
    setDocumentId: (id: string) => void;

    // Utility methods
    clearError: () => void;
    reset: () => void;
    refreshData: () => Promise<void>;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
    // Initial state
    analysisDefinitions: [],
    currentDefinition: null,
    availableAlgorithms: {},
    analyses: {},
    currentAnalysis: null,
    currentStepResult: null,
    lastFetchTimestamps: {},
    isLoading: false,
    error: null,

    // Derived state with default values
    analysisId: '',
    documentId: '',
    analysisType: '',
    constants: null,
    isTableAnalysis: false,
    isTextAnalysis: false,

    // Methods for analysis definitions
    fetchAnalysisDefinitions: async () => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to fetch definitions
            const definitions = await analysisService.getAnalysisDefinitions();
            set({
                analysisDefinitions: definitions,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch analysis definitions',
                isLoading: false
            });
        }
    },

    fetchAnalysisDefinition: async (definitionCode: string) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to fetch a specific definition
            const definition = await analysisService.getAnalysisDefinition(definitionCode);

            // Ensure each step has the algorithms property
            if (definition.steps) {
                definition.steps = definition.steps.map(step => {
                    if (!step.algorithms) {
                        return {
                            ...step,
                            algorithms: []
                        };
                    }
                    return step;
                });
            }

            set({
                currentDefinition: definition,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch analysis definition',
                isLoading: false
            });
        }
    },

    setCurrentDefinition: (definition) => {
        set({ currentDefinition: definition });
    },

    fetchStepAlgorithms: async (stepCode: string) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to fetch algorithms for a step
            const algorithms = await analysisService.getStepAlgorithms(stepCode);
            set(state => ({
                availableAlgorithms: {
                    ...state.availableAlgorithms,
                    [stepCode]: algorithms
                },
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch step algorithms',
                isLoading: false
            });
        }
    },

    startAnalysis: async (documentId, analysisCode, mode = AnalysisMode.AUTOMATIC, config: AnalysisRunConfig | undefined = undefined) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to start a new analysis

            const analysis = await analysisService.startAnalysis(documentId, analysisCode, mode, config);

            // Since the startAnalysis endpoint might not return the full AnalysisRunWithResults,
            // we need to fetch the complete analysis
            const fullAnalysis = await analysisService.getAnalysis(analysis.id || '');

            set({
                currentAnalysis: fullAnalysis,
                analyses: {
                    ...get().analyses,
                    [fullAnalysis.id || '']: fullAnalysis
                },
                isLoading: false,
                // Update derived state
                analysisId: fullAnalysis.id || '',
                documentId: fullAnalysis.document_id,
                analysisType: fullAnalysis.analysis_code,
                isTableAnalysis: fullAnalysis.analysis_code === AnalysisDefinitionCode.TABLE_ANALYSIS,
                isTextAnalysis: fullAnalysis.analysis_code === AnalysisDefinitionCode.TEXT_ANALYSIS,
                constants: getAnalysisConstants(fullAnalysis.analysis_code)
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to start analysis',
                isLoading: false
            });
        }
    },

    fetchDocumentAnalyses: async (documentId, forceRefresh = false) => {
        const state = get();
        const now = Date.now();
        const cacheKey = `document_${documentId}`;
        const lastFetchTime = state.lastFetchTimestamps[cacheKey] || 0;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

        // Check if we can use cached data
        if (!forceRefresh && now - lastFetchTime < CACHE_DURATION) {
            // Data is fresh enough, return existing analyses for this document
            const documentAnalyses = Object.values(state.analyses)
                .filter(analysis => analysis.document_id === documentId);

            if (documentAnalyses.length > 0) {
                // We have cached analyses for this document
                return;
            }
        }

        // Need to fetch fresh data
        set({ isLoading: true, error: null });

        try {
            // Use the analysis service to fetch analyses for a document
            const analyses = await analysisService.getDocumentAnalyses(documentId);

            // Convert array to record and merge with existing analyses
            const analysesRecord = { ...state.analyses };

            // Add or update analyses in the record
            analyses.forEach(analysis => {
                if (analysis.id) {
                    analysesRecord[analysis.id] = analysis;
                }
            });

            set({
                analyses: analysesRecord,
                lastFetchTimestamps: {
                    ...state.lastFetchTimestamps,
                    [cacheKey]: now
                },
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch document analyses',
                isLoading: false
            });
        }
    },

    fetchUserAnalyses: async (params, forceRefresh = false) => {
        const state = get();
        const now = Date.now();
        const cacheKey = 'user_analyses';
        const lastFetchTime = state.lastFetchTimestamps[cacheKey] || 0;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

        // Check if we can use cached data
        if (!forceRefresh && now - lastFetchTime < CACHE_DURATION) {
            // Data is fresh enough and we have analyses
            if (Object.keys(state.analyses).length > 0) {
                return;
            }
        }

        // Need to fetch fresh data
        set({ isLoading: true, error: null });

        try {
            // Use the analysis service to fetch all analyses for the user
            const analyses = await analysisService.getUserAnalyses(params);

            // Convert array to record
            const analysesRecord: Record<string, AnalysisRunWithResultsInfo> = {};
            analyses.forEach(analysis => {
                if (analysis.id) {
                    analysesRecord[analysis.id] = analysis;
                }
            });

            set({
                analyses: analysesRecord,
                lastFetchTimestamps: {
                    ...state.lastFetchTimestamps,
                    [cacheKey]: now
                },
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch user analyses',
                isLoading: false
            });
        }
    },

    fetchAnalysis: async (analysisId, forceRefresh = false) => {
        const state = get();
        const now = Date.now();
        const cacheKey = `analysis_${analysisId}`;
        const lastFetchTime = state.lastFetchTimestamps[cacheKey] || 0;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

        // Check if we can use cached data
        if (!forceRefresh && now - lastFetchTime < CACHE_DURATION) {
            // Check if the analysis is already in our record
            const cachedAnalysis = state.analyses[analysisId];
            if (cachedAnalysis) {
                // Check if the cached analysis is of type AnalysisRunWithResults
                // We can determine this by checking if the step_results contains items with 'result' property
                // which is present in StepResultResponse but not in StepResultInfo
                const isAnalysisRunWithResults =
                    Array.isArray(cachedAnalysis.step_results) &&
                    (cachedAnalysis.step_results.length === 0 ||
                        'result' in (cachedAnalysis.step_results[0] || {}));

                // Only use the cached data if it's AnalysisRunWithResults
                if (isAnalysisRunWithResults && state.currentAnalysis?.id !== analysisId) {
                    // Only update if it's not already the current analysis
                    set({
                        currentAnalysis: cachedAnalysis as AnalysisRunWithResults,
                        // Update derived state
                        analysisId: cachedAnalysis.id || '',
                        documentId: cachedAnalysis.document_id,
                        analysisType: cachedAnalysis.analysis_code,
                        isTableAnalysis: cachedAnalysis.analysis_code === AnalysisDefinitionCode.TABLE_ANALYSIS,
                        isTextAnalysis: cachedAnalysis.analysis_code === AnalysisDefinitionCode.TEXT_ANALYSIS,
                        constants: getAnalysisConstants(cachedAnalysis.analysis_code)
                    });
                    return;
                }
            }
        }

        // Need to fetch fresh data
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to fetch a specific analysis
            const analysis = await analysisService.getAnalysis(analysisId);

            // Update the analyses record with this analysis
            const updatedAnalyses = { ...state.analyses };
            if (analysis.id) {
                updatedAnalyses[analysis.id] = analysis;
            }

            set({
                currentAnalysis: analysis,
                analyses: updatedAnalyses,
                lastFetchTimestamps: {
                    ...state.lastFetchTimestamps,
                    [cacheKey]: now
                },
                isLoading: false,
                // Update derived state
                analysisId: analysis.id || '',
                documentId: analysis.document_id,
                analysisType: analysis.analysis_code,
                isTableAnalysis: analysis.analysis_code === AnalysisDefinitionCode.TABLE_ANALYSIS,
                isTextAnalysis: analysis.analysis_code === AnalysisDefinitionCode.TEXT_ANALYSIS,
                constants: getAnalysisConstants(analysis.analysis_code)
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch analysis',
                isLoading: false
            });
        }
    },

    getAnalysisResult: async (analysisId) => {
        try {
            const analysis = await analysisService.getAnalysis(analysisId);
            if (!analysis) {
                return null;
            }

            // Since 'results' might not be directly on AnalysisRunWithResults,
            // we'll check for step results or return a default result
            // This is a workaround until the proper type is defined
            const analysisWithResults = analysis as any;
            if (analysisWithResults.results && analysisWithResults.results.length > 0) {
                return analysisWithResults.results[analysisWithResults.results.length - 1];
            }

            // If no results array, check if there's a current step result
            if (analysisWithResults.current_step_result) {
                return analysisWithResults.current_step_result;
            }

            // Create a basic result object if nothing else is available
            return {
                id: analysisId,
                analysis_id: analysisId,
                step_id: '',
                status: analysis.status,
                created_at: analysis.created_at,
                result: {}
            };
        } catch (error) {
            console.error('Error getting analysis result:', error);
            return null;
        }
    },

    executeStep: async (analysisId, stepId, algorithmId, parameters = {}) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to execute a step
            const result = await analysisService.executeStep(analysisId, stepId, algorithmId, parameters);

            // Create a combined result with the step code for type safety
            const stepResult: StepResultResponse & StepResult = {
                ...result,
                step_code: result.step_code as TableAnalysisStepCode,
                result: result.result as any
            };

            set({
                currentStepResult: stepResult,
                isLoading: false
            });

            // Update the current analysis with the new result
            const { currentAnalysis } = get();
            if (currentAnalysis) {
                const updatedAnalysis = {
                    ...currentAnalysis,
                    step_results: [...(currentAnalysis.step_results || []), stepResult]
                };
                set({ currentAnalysis: updatedAnalysis });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to execute step',
                isLoading: false
            });
        }
    },

    updateStepCorrections: async (analysisId, stepId, corrections) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to update step corrections
            const result = await analysisService.updateStepCorrections(analysisId, stepId, corrections);

            // Create a combined result with the step code for type safety
            const stepResult: StepResultResponse & StepResult = {
                ...result,
                step_code: result.step_code as TableAnalysisStepCode,
                result: result.result as any
            };

            set({
                currentStepResult: stepResult,
                isLoading: false
            });

            // Update the current analysis with the updated result
            const { currentAnalysis } = get();
            if (currentAnalysis) {
                const stepResults = currentAnalysis.step_results.map(sr =>
                    sr.id === stepResult.id ? stepResult : sr
                );

                const updatedAnalysis = {
                    ...currentAnalysis,
                    step_results: stepResults
                };

                set({ currentAnalysis: updatedAnalysis });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update step corrections',
                isLoading: false
            });
        }
    },

    // Analysis configuration methods
    updateConfig: async (newConfigData) => {
        try {
            const { analysisId, currentAnalysis } = get();
            if (!currentAnalysis) {
                throw new Error('No current analysis');
            }

            // In a real app, you would call your API here
            // For now, we'll just update the local state
            // In the future, this should call an API endpoint to update the analysis config

            // Update the current analysis with the new config
            set({
                currentAnalysis: {
                    ...currentAnalysis,
                    ...newConfigData
                }
            });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update configuration' });
        }
    },

    // Navigation and selection methods
    setAnalysisId: (id) => {
        set({ analysisId: id });
        // Fetch the analysis if it's not already loaded
        const currentAnalysis = get().currentAnalysis;
        if (id && (!currentAnalysis || currentAnalysis.id !== id)) {
            get().fetchAnalysis(id, false); // Use cache by default
        }
    },

    setDocumentId: (id) => {
        set({ documentId: id });
    },

    // Utility methods
    clearError: () => set({ error: null }),

    reset: () => set({
        currentDefinition: null,
        currentAnalysis: null,
        currentStepResult: null,
        isLoading: false,
        error: null,
        analysisId: '',
        documentId: '',
        analysisType: '',
        constants: null,
        isTableAnalysis: false,
        isTextAnalysis: false
    }),

    refreshData: async () => {
        const state = get();

        try {
            // Force refresh all data
            await Promise.all([
                state.fetchAnalysisDefinitions(),
                state.fetchUserAnalyses(undefined, true)
            ]);

            // If we have a current analysis, refresh it too
            if (state.analysisId) {
                await state.fetchAnalysis(state.analysisId, true); // Force refresh the current analysis
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to refresh data',
            });
        }
    }
}));