import { create } from 'zustand';
import { analysisService } from '@/services/analysis.service';
import {
    AnalysisDefinitionInfo,
    AnalysisDefinitionWithStepsAndAlgorithms,
    AlgorithmDefinitionInfo,
    AnalysisMode,
    AnalysisRunConfig
} from '@/types/analysis_configs';
import {
    AnalysisRunInfo,
    AnalysisRunWithResults,
    StepExecutionResultInfo,
    AnalysisRunListParams
} from '@/types/analysis_execution';
import { DocumentType } from '@/types/document';
import {
    TableDetectionResult
} from '@/types/results/table_analysis/table_detection';
import {
    TableStructureResult
} from '@/types/results/table_analysis/table_structure';
import {
    TableDataResult
} from '@/types/results/table_analysis/table_data';

/**
 * Enum for table analysis steps
 */
export enum TableAnalysisStep {
    TABLE_DETECTION = 'table_detection',
    TABLE_STRUCTURE = 'table_structure',
    TABLE_DATA = 'table_data'
}

/**
 * Union type for step results
 */
type StepResult = {
    step_type: TableAnalysisStep;
    result: TableDetectionResult | TableStructureResult | TableDataResult;
};

interface AnalysisState {
    // Analysis definitions and configurations
    analysisDefinitions: AnalysisDefinitionInfo[];
    currentDefinition: AnalysisDefinitionWithStepsAndAlgorithms | null;
    availableAlgorithms: Record<string, AlgorithmDefinitionInfo[]>;

    // Analysis state
    analyses: AnalysisRunWithResults[];
    currentAnalysis: AnalysisRunWithResults | null;
    currentStepResult: StepExecutionResultInfo & StepResult | null;
    isLoading: boolean;
    error: string | null;

    // Methods for analysis definitions
    fetchAnalysisDefinitions: () => Promise<void>;
    fetchAnalysisDefinition: (definitionId: string) => Promise<void>;
    setCurrentDefinition: (definition: AnalysisDefinitionWithStepsAndAlgorithms | null) => void;
    fetchStepAlgorithms: (stepId: string) => Promise<void>;

    // Methods for analysis operations
    startAnalysis: (
        documentId: string,
        analysisCode: string,
        mode?: AnalysisMode,
        config?: AnalysisRunConfig
    ) => Promise<void>;
    fetchDocumentAnalyses: (documentId: string) => Promise<void>;
    fetchUserAnalyses: (params?: AnalysisRunListParams) => Promise<void>;
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

    // Utility methods
    clearError: () => void;
    reset: () => void;
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

    // Analysis definitions methods
    fetchAnalysisDefinitions: async () => {
        try {
            set({ isLoading: true, error: null });
            const definitions = await analysisService.getAnalysisDefinitions();
            set({ analysisDefinitions: definitions, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch analysis definitions',
                isLoading: false
            });
            throw error;
        }
    },

    fetchAnalysisDefinition: async (definitionId: string) => {
        try {
            set({ isLoading: true, error: null });
            const definition = await analysisService.getAnalysisDefinition(definitionId);
            set({
                currentDefinition: definition,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch analysis definition',
                isLoading: false
            });
            throw error;
        }
    },

    setCurrentDefinition: (definition) => set({ currentDefinition: definition }),

    fetchStepAlgorithms: async (stepId: string) => {
        try {
            set({ isLoading: true, error: null });
            const algorithms = await analysisService.getStepAlgorithms(stepId);
            set((state) => ({
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
            throw error;
        }
    },

    // Analysis operations
    startAnalysis: async (documentId: string, analysisCode: string, mode = AnalysisMode.AUTOMATIC, config?) => {
        try {
            set({ isLoading: true, error: null });
            const analysis = await analysisService.startAnalysis(documentId, analysisCode, mode, config);
            // Fetch the complete analysis with results
            const analysisWithResults = await analysisService.getAnalysis(analysis.id);
            set((state) => ({
                analyses: [analysisWithResults, ...state.analyses],
                currentAnalysis: analysisWithResults,
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to start analysis',
                isLoading: false
            });
            throw error;
        }
    },

    fetchDocumentAnalyses: async (documentId: string) => {
        try {
            set({ isLoading: true, error: null });
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
            throw error;
        }
    },

    fetchUserAnalyses: async (params?: AnalysisRunListParams) => {
        try {
            set({ isLoading: true, error: null });
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
            throw error;
        }
    },

    fetchAnalysis: async (analysisId: string) => {
        try {
            set({ isLoading: true, error: null });
            const analysis = await analysisService.getAnalysis(analysisId);

            // Also fetch the analysis definition if not already in state
            const definitionId = analysis.analysis_code;
            let definition = get().analysisDefinitions.find(def => def.code === definitionId);
            if (!definition) {
                definition = await analysisService.getAnalysisDefinition(definitionId);
                set(state => ({
                    analysisDefinitions: [...state.analysisDefinitions, definition!]
                }));
            }

            set({
                currentAnalysis: analysis,
                currentDefinition: definition as AnalysisDefinitionWithStepsAndAlgorithms,
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

    executeStep: async (analysisId: string, stepId: string, algorithmId: string, parameters?) => {
        try {
            set({ isLoading: true, error: null });
            const stepResult = await analysisService.executeStep(analysisId, stepId, algorithmId, parameters);

            // Type guard to ensure proper typing of step results
            const isValidStepResult = (result: any): result is StepResult => {
                return Object.values(TableAnalysisStep).includes(result.step_type);
            };

            if (!isValidStepResult(stepResult)) {
                throw new Error('Invalid step result type');
            }

            set((state) => ({
                currentStepResult: stepResult as StepExecutionResultInfo & StepResult,
                currentAnalysis: state.currentAnalysis ? {
                    ...state.currentAnalysis,
                    step_results: state.currentAnalysis.step_results.map((r: StepExecutionResultInfo) =>
                        r.id === stepId ? stepResult : r
                    )
                } : null,
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to execute step',
                isLoading: false
            });
            throw error;
        }
    },

    updateStepCorrections: async (analysisId: string, stepId: string, corrections: Record<string, any>) => {
        try {
            set({ isLoading: true, error: null });
            const stepResult = await analysisService.updateStepCorrections(analysisId, stepId, corrections);
            set((state) => ({
                currentStepResult: stepResult as StepExecutionResultInfo & StepResult,
                currentAnalysis: state.currentAnalysis ? {
                    ...state.currentAnalysis,
                    step_results: state.currentAnalysis.step_results.map((r: StepExecutionResultInfo) =>
                        r.id === stepId ? stepResult : r
                    )
                } : null,
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update corrections',
                isLoading: false
            });
            throw error;
        }
    },

    // Utility methods
    clearError: () => set({ error: null }),
    reset: () => set({
        analysisDefinitions: [],
        currentDefinition: null,
        availableAlgorithms: {},
        analyses: [],
        currentAnalysis: null,
        currentStepResult: null,
        isLoading: false,
        error: null
    })
})); 