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
    AnalysisRunConfig
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
    isTableDetectionResult,
    isTableStructureResult,
    isTableDataResult,
} from '@/types/analysis/registry';
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
    analyses: AnalysisRunWithResults[];
    currentAnalysis: AnalysisRunWithResults | null;
    currentStepResult: StepResultResponse & StepResult | null;

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
    fetchAnalysisDefinition: (definitionId: string) => Promise<void>;
    setCurrentDefinition: (definition: AnalysisDefinition | null) => void;
    fetchStepAlgorithms: (stepId: string) => Promise<void>;

    // Methods for analysis operations
    startAnalysis: (
        documentId: string,
        analysisCode: string,
        mode?: AnalysisMode,
        config?: AnalysisRunConfig
    ) => Promise<void>;
    fetchDocumentAnalyses: (documentId: string) => Promise<void>;
    fetchUserAnalyses: (params?: any) => Promise<void>;
    fetchAnalysis: (analysisId: string) => Promise<void>;
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
    analyses: [],
    currentAnalysis: null,
    currentStepResult: null,
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

    fetchAnalysisDefinition: async (definitionId: string) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to fetch a specific definition
            const definition = await analysisService.getAnalysisDefinition(definitionId);

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

    fetchStepAlgorithms: async (stepId: string) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to fetch algorithms for a step
            const algorithms = await analysisService.getStepAlgorithms(stepId);
            set(state => ({
                availableAlgorithms: {
                    ...state.availableAlgorithms,
                    [stepId]: algorithms
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

    startAnalysis: async (documentId, analysisCode, mode = AnalysisMode.AUTOMATIC, config = {
        steps: {},
        notifications: {
            notify_on_completion: true,
            notify_on_failure: true
        },
        metadata: {}
    }) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to start a new analysis
            const analysis = await analysisService.startAnalysis(documentId, analysisCode, mode, config);

            // Since the startAnalysis endpoint might not return the full AnalysisRunWithResults,
            // we need to fetch the complete analysis
            const fullAnalysis = await analysisService.getAnalysis(analysis.id || '');

            set({
                currentAnalysis: fullAnalysis,
                analyses: [...get().analyses, fullAnalysis],
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

    fetchDocumentAnalyses: async (documentId) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to fetch analyses for a document
            const analyses = await analysisService.getDocumentAnalyses(documentId);
            set({
                analyses,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch document analyses',
                isLoading: false
            });
        }
    },

    fetchUserAnalyses: async (params) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to fetch user analyses
            const analyses = await analysisService.getUserAnalyses(params);
            set({
                analyses,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch user analyses',
                isLoading: false
            });
        }
    },

    fetchAnalysis: async (analysisId) => {
        set({ isLoading: true, error: null });
        try {
            // Use the analysis service to fetch a specific analysis
            const analysis = await analysisService.getAnalysis(analysisId);
            set({
                currentAnalysis: analysis,
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
            get().fetchAnalysis(id);
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
        const { analysisId } = get();
        if (!analysisId) {
            set({ error: 'Missing analysis ID' });
            return;
        }

        await get().fetchAnalysis(analysisId);
    }
})); 