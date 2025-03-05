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
import { BaseAnalysisRun, BaseAnalysisStepResult, AnalysisStatus } from '@/types/analysis/base';
import { getAnalysisConstants } from '@/constants/analysis/registry';
import { isTableAnalysisConfig, isTextAnalysisConfig, AnalysisDefinitionCode } from '@/types/analysis/registry';
import { TableAnalysisConfig } from '@/types/analysis/types/table';
import { TextAnalysisConfig } from '@/types/analysis/types/text';

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

    // UI state
    isLoading: boolean;
    error: string | null;

    // Derived state (computed from currentAnalysis)
    analysisId: string;
    documentId: string;
    analysisType: string;
    constants: any;

    // Type-specific configurations (derived from currentAnalysis)
    tableConfig: TableAnalysisConfig | null;
    textConfig: TextAnalysisConfig | null;

    // Type guards (derived from analysisType)
    isTableAnalysis: boolean;
    isTextAnalysis: boolean;

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

    // Analysis configuration methods
    updateConfig: (config: Partial<BaseAnalysisRun>) => Promise<void>;

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
    tableConfig: null,
    textConfig: null,
    isTableAnalysis: false,
    isTextAnalysis: false,

    // Methods for analysis definitions
    fetchAnalysisDefinitions: async () => {
        set({ isLoading: true, error: null });
        try {
            // API call would go here
            // const response = await fetch('/api/analysis/definitions');
            // const data = await response.json();
            // set({ analysisDefinitions: data, isLoading: false });

            // Mock data for now
            set({
                analysisDefinitions: [
                    {
                        id: '1',
                        code: AnalysisDefinitionCode.TABLE_ANALYSIS,
                        name: 'Table Analysis',
                        version: '1.0.0',
                        description: 'Detect and extract tables from documents',
                        supported_document_types: [DocumentType.PDF, DocumentType.IMAGE],
                        is_active: true
                    },
                    {
                        id: '2',
                        code: AnalysisDefinitionCode.TEXT_ANALYSIS,
                        name: 'Text Analysis',
                        version: '1.0.0',
                        description: 'Extract and analyze text from documents',
                        supported_document_types: [DocumentType.PDF, DocumentType.TEXT],
                        is_active: true
                    }
                ],
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
            // API call would go here
            // const response = await fetch(`/api/analysis/definitions/${definitionId}`);
            // const data = await response.json();
            // set({ currentDefinition: data, isLoading: false });

            // Mock data for now
            set({
                currentDefinition: {
                    id: definitionId,
                    code: AnalysisDefinitionCode.TABLE_ANALYSIS,
                    name: 'Table Analysis',
                    version: '1.0.0',
                    description: 'Detect and extract tables from documents',
                    supported_document_types: [DocumentType.PDF, DocumentType.IMAGE],
                    is_active: true,
                    steps: [
                        {
                            id: '1',
                            code: TableAnalysisStep.TABLE_DETECTION,
                            name: 'Table Detection',
                            description: 'Detect tables in the document',
                            order: 1
                        },
                        {
                            id: '2',
                            code: TableAnalysisStep.TABLE_STRUCTURE,
                            name: 'Table Structure',
                            description: 'Analyze table structure',
                            order: 2
                        },
                        {
                            id: '3',
                            code: TableAnalysisStep.TABLE_DATA,
                            name: 'Table Data',
                            description: 'Extract data from tables',
                            order: 3
                        }
                    ],
                    algorithms: []
                },
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
            // API call would go here
            // const response = await fetch(`/api/analysis/steps/${stepId}/algorithms`);
            // const data = await response.json();
            // set(state => ({
            //     availableAlgorithms: {
            //         ...state.availableAlgorithms,
            //         [stepId]: data
            //     },
            //     isLoading: false
            // }));

            // Mock data for now
            set(state => ({
                availableAlgorithms: {
                    ...state.availableAlgorithms,
                    [stepId]: [
                        {
                            id: '1',
                            code: 'default_algorithm',
                            name: 'Default Algorithm',
                            description: 'Default algorithm for this step',
                            version: '1.0.0',
                            is_active: true
                        }
                    ]
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

    startAnalysis: async (documentId, analysisCode, mode = AnalysisMode.AUTOMATIC, config = {}) => {
        set({ isLoading: true, error: null });
        try {
            // API call would go here
            // const response = await fetch('/api/analysis', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ documentId, analysisCode, mode, config })
            // });
            // const data = await response.json();
            // set({ currentAnalysis: data, isLoading: false });

            // Mock data for now
            const mockAnalysis = {
                id: `analysis-${Date.now()}`,
                document_id: documentId,
                analysis_code: analysisCode,
                mode,
                status: AnalysisStatus.PENDING,
                config,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                results: []
            };

            set({
                currentAnalysis: mockAnalysis,
                analyses: [...get().analyses, mockAnalysis],
                isLoading: false,
                // Update derived state
                analysisId: mockAnalysis.id,
                documentId: mockAnalysis.document_id,
                analysisType: mockAnalysis.analysis_code,
                isTableAnalysis: mockAnalysis.analysis_code === AnalysisDefinitionCode.TABLE_ANALYSIS,
                isTextAnalysis: mockAnalysis.analysis_code === AnalysisDefinitionCode.TEXT_ANALYSIS,
                constants: getAnalysisConstants(mockAnalysis.analysis_code)
            });

            // Update type-specific configs
            const baseConfig: BaseAnalysisRun = {
                id: mockAnalysis.id,
                documentId: mockAnalysis.document_id,
                type: mockAnalysis.analysis_code,
                createdAt: mockAnalysis.created_at,
                status: mockAnalysis.status as AnalysisStatus
            };

            if (mockAnalysis.analysis_code === AnalysisDefinitionCode.TABLE_ANALYSIS) {
                set({
                    tableConfig: {
                        ...baseConfig,
                        type: AnalysisDefinitionCode.TABLE_ANALYSIS,
                        tableOptions: {
                            detectHeaderRows: true,
                            detectHeaderColumns: true,
                            minConfidence: 80,
                            includeRulings: true,
                            extractSpans: true,
                            mergeOverlappingCells: true
                        },
                        extractionOptions: {
                            outputFormat: 'csv',
                            includeConfidenceScores: true,
                            includeCoordinates: true,
                            normalizeWhitespace: true
                        }
                    } as TableAnalysisConfig,
                    textConfig: null
                });
            } else if (mockAnalysis.analysis_code === AnalysisDefinitionCode.TEXT_ANALYSIS) {
                set({
                    tableConfig: null,
                    textConfig: {
                        ...baseConfig,
                        type: AnalysisDefinitionCode.TEXT_ANALYSIS,
                        extractionOptions: {
                            preserveFormatting: true,
                            extractStructuredContent: true,
                            detectLanguage: true,
                            ocrQuality: 'high',
                            includeConfidenceScores: true
                        },
                        processingOptions: {
                            removeHeadersFooters: true,
                            normalizeWhitespace: true,
                            detectParagraphs: true,
                            detectLists: true,
                            detectTables: true,
                            extractMetadata: true
                        }
                    } as TextAnalysisConfig
                });
            }
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
            // API call would go here
            // const response = await fetch(`/api/documents/${documentId}/analyses`);
            // const data = await response.json();
            // set({ analyses: data, isLoading: false });

            // Mock data for now
            set({
                analyses: [
                    {
                        id: `analysis-${Date.now()}`,
                        document_id: documentId,
                        analysis_code: AnalysisDefinitionCode.TABLE_ANALYSIS,
                        mode: AnalysisMode.AUTOMATIC,
                        status: AnalysisStatus.COMPLETED,
                        config: {},
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        results: []
                    }
                ],
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
            // API call would go here
            // const queryParams = new URLSearchParams();
            // if (params) {
            //     Object.entries(params).forEach(([key, value]) => {
            //         if (value !== undefined) queryParams.append(key, String(value));
            //     });
            // }
            // const response = await fetch(`/api/analyses?${queryParams.toString()}`);
            // const data = await response.json();
            // set({ analyses: data, isLoading: false });

            // Mock data for now
            set({
                analyses: [
                    {
                        id: `analysis-${Date.now()}`,
                        document_id: 'doc-123',
                        analysis_code: AnalysisDefinitionCode.TABLE_ANALYSIS,
                        mode: AnalysisMode.AUTOMATIC,
                        status: AnalysisStatus.COMPLETED,
                        config: {},
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        results: []
                    }
                ],
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
            // API call would go here
            // const response = await fetch(`/api/analyses/${analysisId}`);
            // const data = await response.json();
            // set({ currentAnalysis: data, isLoading: false });

            // Mock data for now
            const mockAnalysis = {
                id: analysisId,
                document_id: get().documentId || 'doc-123',
                analysis_code: AnalysisDefinitionCode.TABLE_ANALYSIS,
                mode: AnalysisMode.AUTOMATIC,
                status: AnalysisStatus.IN_PROGRESS,
                config: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                results: []
            };

            set({
                currentAnalysis: mockAnalysis,
                isLoading: false,
                // Update derived state
                analysisId: mockAnalysis.id,
                documentId: mockAnalysis.document_id,
                analysisType: mockAnalysis.analysis_code,
                isTableAnalysis: mockAnalysis.analysis_code === AnalysisDefinitionCode.TABLE_ANALYSIS,
                isTextAnalysis: mockAnalysis.analysis_code === AnalysisDefinitionCode.TEXT_ANALYSIS,
                constants: getAnalysisConstants(mockAnalysis.analysis_code)
            });

            // Update type-specific configs
            const baseConfig: BaseAnalysisRun = {
                id: mockAnalysis.id,
                documentId: mockAnalysis.document_id,
                type: mockAnalysis.analysis_code,
                createdAt: mockAnalysis.created_at,
                status: mockAnalysis.status as AnalysisStatus
            };

            if (mockAnalysis.analysis_code === AnalysisDefinitionCode.TABLE_ANALYSIS) {
                set({
                    tableConfig: {
                        ...baseConfig,
                        type: AnalysisDefinitionCode.TABLE_ANALYSIS,
                        tableOptions: {
                            detectHeaderRows: true,
                            detectHeaderColumns: true,
                            minConfidence: 80,
                            includeRulings: true,
                            extractSpans: true,
                            mergeOverlappingCells: true
                        },
                        extractionOptions: {
                            outputFormat: 'csv',
                            includeConfidenceScores: true,
                            includeCoordinates: true,
                            normalizeWhitespace: true
                        }
                    } as TableAnalysisConfig,
                    textConfig: null
                });
            } else if (mockAnalysis.analysis_code === AnalysisDefinitionCode.TEXT_ANALYSIS) {
                set({
                    tableConfig: null,
                    textConfig: {
                        ...baseConfig,
                        type: AnalysisDefinitionCode.TEXT_ANALYSIS,
                        extractionOptions: {
                            preserveFormatting: true,
                            extractStructuredContent: true,
                            detectLanguage: true,
                            ocrQuality: 'high',
                            includeConfidenceScores: true
                        },
                        processingOptions: {
                            removeHeadersFooters: true,
                            normalizeWhitespace: true,
                            detectParagraphs: true,
                            detectLists: true,
                            detectTables: true,
                            extractMetadata: true
                        }
                    } as TextAnalysisConfig
                });
            }
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
            // API call would go here
            // const response = await fetch(`/api/analyses/${analysisId}/steps/${stepId}/execute`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ algorithmId, parameters })
            // });
            // const data = await response.json();
            // set({ currentStepResult: data, isLoading: false });

            // Mock data for now
            const mockStepResult = {
                id: `result-${Date.now()}`,
                analysis_id: analysisId,
                step_id: stepId,
                algorithm_id: algorithmId,
                status: 'completed',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                step_type: TableAnalysisStep.TABLE_DETECTION,
                result: {
                    tables: [
                        {
                            id: 'table-1',
                            page_number: 1,
                            bounding_box: { x1: 100, y1: 100, x2: 500, y2: 300 },
                            confidence: 0.95
                        }
                    ]
                }
            };

            set({
                currentStepResult: mockStepResult as any,
                isLoading: false
            });

            // Update the current analysis with the new result
            const { currentAnalysis } = get();
            if (currentAnalysis) {
                const updatedAnalysis = {
                    ...currentAnalysis,
                    results: [...(currentAnalysis.results || []), mockStepResult]
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
            // API call would go here
            // const response = await fetch(`/api/analyses/${analysisId}/steps/${stepId}/corrections`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(corrections)
            // });
            // const data = await response.json();
            // set({ currentStepResult: data, isLoading: false });

            // Mock data for now
            const { currentStepResult } = get();
            if (currentStepResult) {
                const updatedResult = {
                    ...currentStepResult,
                    updated_at: new Date().toISOString(),
                    corrections
                };
                set({
                    currentStepResult: updatedResult,
                    isLoading: false
                });
            } else {
                set({
                    error: 'No step result to update',
                    isLoading: false
                });
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
            // const response = await fetch(`/api/analyses/${analysisId}`, {
            //   method: 'PATCH',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(newConfigData)
            // });
            // const updatedConfig = await response.json();

            // For now, we'll just update the local state
            const baseConfig: BaseAnalysisRun = {
                id: analysisId,
                documentId: currentAnalysis.document_id,
                type: currentAnalysis.analysis_code,
                createdAt: currentAnalysis.created_at,
                status: currentAnalysis.status as AnalysisStatus
            };

            const updatedConfig = { ...baseConfig, ...newConfigData };

            // Update type-specific configs
            if (get().isTableAnalysis) {
                set({
                    tableConfig: { ...get().tableConfig, ...updatedConfig } as TableAnalysisConfig,
                    textConfig: null
                });
            } else if (get().isTextAnalysis) {
                set({
                    tableConfig: null,
                    textConfig: { ...get().textConfig, ...updatedConfig } as TextAnalysisConfig
                });
            }

            // Update the current analysis with the new config
            set({
                currentAnalysis: {
                    ...currentAnalysis,
                    config: { ...currentAnalysis.config, ...newConfigData }
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
        if (id && (!get().currentAnalysis || get().currentAnalysis.id !== id)) {
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
        tableConfig: null,
        textConfig: null,
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