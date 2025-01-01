import { create } from 'zustand';
import {
    AnalysisConfig,
    AnalysisTypeConfig,
    AnalysisProgress,
    AnalysisPreset
} from '@/types/analysis';

interface AnalysisStore {
    // Current analysis configuration
    currentConfig: AnalysisConfig | null;
    selectedPreset: AnalysisPreset | null;
    progress: AnalysisProgress | null;

    // Available presets
    presets: AnalysisPreset[];

    // Actions
    setCurrentConfig: (config: AnalysisConfig | null) => void;
    updateAnalysisType: (type: AnalysisTypeConfig) => void;
    toggleAnalysisType: (type: string, enabled: boolean) => void;
    setSelectedPreset: (preset: AnalysisPreset | null) => void;
    setProgress: (progress: AnalysisProgress | null) => void;

    // Analysis actions
    startAnalysis: (documentId: string) => Promise<void>;
    cancelAnalysis: () => Promise<void>;
}

// Default presets
const defaultPresets: AnalysisPreset[] = [
    {
        id: 'quick-scan',
        name: 'Quick Scan',
        description: 'Fast analysis focusing on basic text and table extraction. Best for simple documents that need quick processing.',
        config: [
            {
                type: 'text_extraction',
                enabled: true,
                options: {
                    ocrEnabled: true,
                    language: 'en'
                }
            },
            {
                type: 'table_detection',
                enabled: true,
                options: {
                    confidenceThreshold: 0.8
                }
            }
        ]
    },
    {
        id: 'full-analysis',
        name: 'Full Analysis',
        description: 'Comprehensive analysis including text extraction, table detection, summarization, and template conversion. Best for complex documents that need detailed processing.',
        config: [
            {
                type: 'text_extraction',
                enabled: true,
                options: {
                    ocrEnabled: true,
                    language: 'en'
                }
            },
            {
                type: 'table_detection',
                enabled: true,
                options: {
                    confidenceThreshold: 0.8,
                    minTableSize: 3
                }
            },
            {
                type: 'text_summarization',
                enabled: true,
                options: {
                    maxLength: 500,
                    style: 'structured'
                }
            },
            {
                type: 'template_conversion',
                enabled: true,
                options: {
                    targetFormat: 'pdf',
                    preserveStyles: true
                }
            }
        ]
    }
];

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
    currentConfig: null,
    selectedPreset: null,
    progress: null,
    presets: defaultPresets,

    setCurrentConfig: (config) => set({ currentConfig: config }),

    updateAnalysisType: (updatedType) => set((state) => {
        if (!state.currentConfig) return state;

        const updatedTypes = state.currentConfig.analysisTypes.map((type) =>
            type.type === updatedType.type ? updatedType : type
        );

        return {
            currentConfig: {
                ...state.currentConfig,
                analysisTypes: updatedTypes
            }
        };
    }),

    toggleAnalysisType: (type, enabled) => set((state) => {
        if (!state.currentConfig) return state;

        const updatedTypes = state.currentConfig.analysisTypes.map((t) =>
            t.type === type ? { ...t, enabled } : t
        );

        return {
            currentConfig: {
                ...state.currentConfig,
                analysisTypes: updatedTypes
            }
        };
    }),

    setSelectedPreset: (preset) => {
        const { currentConfig } = get();
        set({
            selectedPreset: preset,
            currentConfig: preset && currentConfig ? {
                ...currentConfig,
                analysisTypes: preset.config
            } : currentConfig
        });
    },

    setProgress: (progress) => set({ progress }),

    startAnalysis: async (documentId) => {
        const { currentConfig } = get();
        if (!currentConfig) throw new Error('No analysis configuration');

        try {
            set({ progress: { status: 'queued', progress: 0 } });

            // TODO: Replace with actual API call
            // Simulated API call for development
            await new Promise(resolve => setTimeout(resolve, 1000));

            set({
                progress: {
                    status: 'processing',
                    progress: 0,
                    currentStep: 'Initializing analysis...'
                }
            });

            // Simulate progress updates
            for (let i = 0; i <= 100; i += 20) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                set({
                    progress: {
                        status: 'processing',
                        progress: i,
                        currentStep: `Processing document... ${i}%`
                    }
                });
            }

            set({
                progress: {
                    status: 'completed',
                    progress: 100
                }
            });
        } catch (error) {
            set({
                progress: {
                    status: 'failed',
                    progress: 0,
                    error: error instanceof Error ? error.message : 'Analysis failed'
                }
            });
            throw error;
        }
    },

    cancelAnalysis: async () => {
        // TODO: Replace with actual API call
        set({ progress: null });
    }
})); 