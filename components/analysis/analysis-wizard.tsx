'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { AnalysisType, AnalysisTypeConfig } from '@/types/analysis';
import {
    Table,
    FileText,
    FileOutput,
    FileSearch,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const analysisTypeInfo = {
    table_detection: {
        icon: Table,
        title: 'Table Detection',
        description: 'Detect and extract tables from documents',
    },
    text_extraction: {
        icon: FileText,
        title: 'Text Extraction',
        description: 'Extract and process text content',
    },
    text_summarization: {
        icon: FileSearch,
        title: 'Text Summarization',
        description: 'Generate concise summaries of document content',
    },
    template_conversion: {
        icon: FileOutput,
        title: 'Template Conversion',
        description: 'Convert documents to standardized templates',
    },
};

export function AnalysisWizard({ documentId }: { documentId: string }) {
    const [step, setStep] = useState(0);
    const {
        presets,
        currentConfig,
        selectedPreset,
        progress,
        setSelectedPreset,
        toggleAnalysisType,
        startAnalysis
    } = useAnalysisStore();
    const router = useRouter();

    // Handle preset selection
    const handlePresetSelect = (preset: typeof presets[0]) => {
        setSelectedPreset(preset);
        setStep(1);
    };

    // Handle analysis type toggle
    const handleTypeToggle = (type: AnalysisType) => {
        if (!currentConfig) return;
        const isEnabled = currentConfig.analysisTypes.find(t => t.type === type)?.enabled;
        toggleAnalysisType(type, !isEnabled);
    };

    // Get available analysis types based on selected preset
    const getAvailableAnalysisTypes = () => {
        if (!selectedPreset) return [];
        return selectedPreset.config.map(config => config.type);
    };

    // Start the analysis process
    const handleStartAnalysis = async () => {
        try {
            await startAnalysis(documentId);
            // After analysis is complete, redirect to results page
            router.push(`/dashboard/analysis/${documentId}/results`);
        } catch (error) {
            console.error('Analysis failed:', error);
        }
    };

    // Render progress state
    if (progress) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                {progress.status === 'processing' && (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                )}
                {progress.status === 'completed' && (
                    <Check className="w-8 h-8 text-green-500" />
                )}
                <p className="text-lg font-medium">
                    {progress.status === 'processing' ? progress.currentStep : 'Analysis completed!'}
                </p>
                {progress.status === 'processing' && (
                    <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress.progress}%` }}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Step indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                            1
                        </span>
                        <div className="mx-4 h-px w-16 bg-border" />
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                            2
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Step {step + 1} of 2
                    </p>
                </div>
            </div>

            {step === 0 ? (
                // Step 1: Choose preset
                <div className="space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Choose Analysis Preset</h2>
                        <p className="text-muted-foreground">
                            Select a preset or customize your analysis options
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {presets.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => handlePresetSelect(preset)}
                                className={`p-6 text-left rounded-lg border transition-colors ${selectedPreset?.id === preset.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium">{preset.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {preset.description}
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                            {preset.config.map((config) => {
                                                const Icon = analysisTypeInfo[config.type].icon;
                                                return (
                                                    <div
                                                        key={config.type}
                                                        className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
                                                    >
                                                        <Icon className="h-3 w-3" />
                                                        {analysisTypeInfo[config.type].title}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // Step 2: Customize options
                <div className="space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Customize Analysis</h2>
                        <p className="text-muted-foreground">
                            Configure the selected analysis types
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {selectedPreset && selectedPreset.config.map(({ type }) => {
                            const info = analysisTypeInfo[type];
                            const Icon = info.icon;
                            const isEnabled = currentConfig?.analysisTypes.find(
                                t => t.type === type
                            )?.enabled;

                            return (
                                <button
                                    key={type}
                                    onClick={() => handleTypeToggle(type)}
                                    className={`p-6 text-left rounded-lg border transition-colors ${isEnabled
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{info.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {info.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
                {step === 1 ? (
                    <button
                        onClick={() => setStep(0)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Presets
                    </button>
                ) : (
                    <div />
                )}

                {step === 1 && (
                    <button
                        onClick={handleStartAnalysis}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Start Analysis
                    </button>
                )}
            </div>
        </div>
    );
} 