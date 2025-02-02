import { create } from 'zustand';
import { analysisService } from '@/services/analysis.service';
import {
    AnalysisType,
    Analysis,
    AnalysisRequest,
    AnalysisStepResult,
    StepExecutionRequest,
    AnalysisListParams
} from '@/types/analysis';
import { Algorithm } from '@/types/algorithm';
import {
    TableAnalysisStepEnum,
    TextAnalysisStepEnum,
    TemplateConversionStepEnum
} from '@/lib/enums';
import {
    TableDetectionOutput,
    TableDetectionResult
} from '@/types/results/table-detection';
import {
    TableStructureOutput,
    TableStructureResult
} from '@/types/results/table-recognition';
import {
    TableDataOutput,
    TableDataResult
} from '@/types/results/table-data-extraction';

type StepResult =
    | { step_type: TableAnalysisStepEnum.TABLE_DETECTION; result: TableDetectionOutput }
    | { step_type: TableAnalysisStepEnum.TABLE_STRUCTURE_RECOGNITION; result: TableStructureOutput }
    | { step_type: TableAnalysisStepEnum.TABLE_DATA_EXTRACTION; result: TableDataOutput };

interface AnalysisState {
    // Analysis types and configurations
    analysisTypes: AnalysisType[];
    currentAnalysisType: AnalysisType | null;
    availableAlgorithms: Record<string, Algorithm[]>;

    // Analysis state
    analyses: Analysis[];
    currentAnalysis: Analysis | null;
    currentStepResult: AnalysisStepResult & StepResult | null;
    isLoading: boolean;
    error: string | null;

    // Methods for analysis types
    fetchAnalysisTypes: () => Promise<void>;
    fetchAnalysisType: (analysisTypeId: string) => Promise<void>;
    setCurrentAnalysisType: (analysisType: AnalysisType | null) => void;
    fetchStepAlgorithms: (stepId: string) => Promise<void>;

    // Methods for analysis operations
    startAnalysis: (documentId: string, request: AnalysisRequest) => Promise<void>;
    fetchDocumentAnalyses: (documentId: string) => Promise<void>;
    fetchUserAnalyses: (params?: AnalysisListParams) => Promise<void>;
    fetchAnalysis: (analysisId: string) => Promise<void>;
    executeStep: (analysisId: string, stepId: string, request: StepExecutionRequest) => Promise<void>;
    updateStepCorrections: (analysisId: string, stepId: string, corrections: Record<string, any>) => Promise<void>;

    // Utility methods
    clearError: () => void;
    reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
    // Initial state
    analysisTypes: [],
    currentAnalysisType: null,
    availableAlgorithms: {},
    analyses: [],
    currentAnalysis: null,
    currentStepResult: null,
    isLoading: false,
    error: null,

    // Analysis types methods
    fetchAnalysisTypes: async () => {
        try {
            set({ isLoading: true, error: null });
            const types = await analysisService.getAnalysisTypes();
            set({ analysisTypes: types, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch analysis types',
                isLoading: false
            });
            throw error;
        }
    },

    fetchAnalysisType: async (analysisTypeId: string) => {
        try {
            set({ isLoading: true, error: null });
            const analysisType = await analysisService.getAnalysisType(analysisTypeId);
            set({
                currentAnalysisType: analysisType,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch analysis type',
                isLoading: false
            });
            throw error;
        }
    },

    setCurrentAnalysisType: (analysisType) => set({ currentAnalysisType: analysisType }),

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
    startAnalysis: async (documentId: string, request: AnalysisRequest) => {
        try {
            set({ isLoading: true, error: null });
            const analysis = await analysisService.startAnalysis(documentId, request);
            set((state) => ({
                analyses: [analysis, ...state.analyses],
                currentAnalysis: analysis,
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

    fetchUserAnalyses: async (params?: AnalysisListParams) => {
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

            // Also fetch the analysis type if not already in state
            let analysisType = get().analysisTypes.find(type => type.id === analysis.analysis_type_id);
            if (!analysisType) {
                analysisType = await analysisService.getAnalysisType(analysis.analysis_type_id);
                set(state => ({
                    analysisTypes: [...state.analysisTypes, analysisType!]
                }));
            }

            set({
                currentAnalysis: analysis,
                currentAnalysisType: analysisType,
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

    executeStep: async (analysisId: string, stepId: string, request: StepExecutionRequest) => {
        try {
            set({ isLoading: true, error: null });
            const stepResult = await analysisService.executeStep(analysisId, stepId, request);

            // Type guard to ensure proper typing of step results
            const isValidStepResult = (result: any): result is StepResult => {
                return result.step_type in TableAnalysisStepEnum ||
                    result.step_type in TextAnalysisStepEnum ||
                    result.step_type in TemplateConversionStepEnum;
            };

            if (!isValidStepResult(stepResult)) {
                throw new Error('Invalid step result type');
            }

            set((state) => ({
                currentStepResult: stepResult,
                currentAnalysis: state.currentAnalysis ? {
                    ...state.currentAnalysis,
                    step_results: state.currentAnalysis.step_results.map(r =>
                        r.step_id === stepId ? stepResult : r
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
                currentStepResult: stepResult as AnalysisStepResult & StepResult,
                currentAnalysis: state.currentAnalysis ? {
                    ...state.currentAnalysis,
                    step_results: state.currentAnalysis.step_results.map(r =>
                        r.step_id === stepId ? stepResult : r
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
        analysisTypes: [],
        currentAnalysisType: null,
        availableAlgorithms: {},
        analyses: [],
        currentAnalysis: null,
        currentStepResult: null,
        isLoading: false,
        error: null
    })
})); 