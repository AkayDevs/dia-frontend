'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Document } from '@/types/document';
import { AnalysisDefinition } from '@/types/analysis/configs';
import { AnalysisRunConfig, AnalysisStepConfig } from '@/types/analysis/base';
import { AnalysisMode } from '@/enums/analysis';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Import modular components
import { AnalysisStepSidebar } from '@/components/analysis/new/AnalysisStepSidebar';
import { AnalysisStepContent } from '@/components/analysis/new/AnalysisStepContent';
import { DocumentSelection } from '@/components/analysis/new/document-selection';
import { AnalysisTypeSelection } from '@/components/analysis/new/analysis-type-selection';
import { AlgorithmConfiguration } from '@/components/analysis/new/AlgorithmConfiguration';
import { ModeSelection } from '@/components/analysis/new/mode-selection';
import { ReviewStep } from '@/components/analysis/new/ReviewStep';

// Define the steps for the setup process
export const setupSteps = [
    { id: 'document', title: 'Document Selection', icon: 'DocumentText', description: 'Select the document you want to analyze' },
    { id: 'analysis-type', title: 'Analysis Type', icon: 'Cog6Tooth', description: 'Choose the type of analysis to perform' },
    { id: 'algorithm', title: 'Algorithm Configuration', icon: 'LightBulb', description: 'Configure the algorithms and parameters' },
    { id: 'mode', title: 'Mode Selection', icon: 'Play', description: 'Choose between automatic or step-by-step processing' },
    { id: 'review', title: 'Review & Start', icon: 'CheckCircle', description: 'Review your configuration and start the analysis' }
];

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function AnalysisSetupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [activeStep, setActiveStep] = useState('document');
    const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
        document: false,
        'analysis-type': false,
        algorithm: false,
        mode: false,
        review: false
    });
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisDefinition | null>(null);
    const [analysisConfig, setAnalysisConfig] = useState<AnalysisRunConfig>({
        steps: {} as Record<string, AnalysisStepConfig>,
        notifications: {
            notify_on_completion: true,
            notify_on_failure: true
        },
        metadata: {}
    });
    const [selectedMode, setSelectedMode] = useState<'automatic' | 'step_by_step' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        currentDefinition,
        fetchAnalysisDefinition,
        fetchStepAlgorithms,
        startAnalysis,
        isLoading
    } = useAnalysisStore();

    // Fetch analysis definition when selected
    useEffect(() => {
        if (selectedAnalysisType?.id) {
            fetchAnalysisDefinition(selectedAnalysisType.id);
        }
    }, [selectedAnalysisType, fetchAnalysisDefinition]);

    // Initialize empty step configs when analysis definition changes
    useEffect(() => {
        if (currentDefinition?.steps) {
            // Create initial config with empty values
            const initialStepsConfig: Record<string, AnalysisStepConfig> = {};

            currentDefinition.steps.forEach(step => {
                // Just initialize with enabled flag, no algorithm selection yet
                initialStepsConfig[step.id] = {
                    enabled: true,
                    algorithm: undefined
                };

                // Fetch algorithms for this step
                fetchStepAlgorithms(step.id);
            });

            setAnalysisConfig(prev => ({
                ...prev,
                steps: initialStepsConfig
            }));
        }
    }, [currentDefinition, fetchStepAlgorithms]);

    // Update completed steps when data changes
    useEffect(() => {

        const newCompletedSteps = {
            review: false,
            document: !!selectedDocument,
            'analysis-type': !!selectedAnalysisType,
            mode: !!selectedMode,
            algorithm: false
        };

        if (currentDefinition?.steps && currentDefinition.steps.length > 0) {
            const allRequiredParamsSet = currentDefinition.steps.every(step => {
                const stepConfig = analysisConfig.steps[step.id];
                if (!stepConfig?.enabled) return true; // Skip disabled steps

                // If no algorithm is selected, mark as incomplete
                if (!stepConfig.algorithm) return false;

                // Get the selected algorithm
                const selectedAlgorithm = step.algorithms.find(
                    algo => algo.code === stepConfig.algorithm?.code
                );

                if (!selectedAlgorithm) return false;

                // Check required parameters
                return selectedAlgorithm.parameters?.every(param => {
                    if (!param.required) return true;
                    const paramValue = stepConfig.algorithm?.parameters?.[param.name]?.value;
                    return paramValue !== undefined && paramValue !== null && paramValue !== '';
                }) ?? true; // If no parameters, consider it complete
            });

            newCompletedSteps.algorithm = allRequiredParamsSet;
        }

        // Only update state if values have changed to avoid infinite loops
        if (JSON.stringify(completedSteps) !== JSON.stringify(newCompletedSteps)) {
            setCompletedSteps(newCompletedSteps);
        }
    }, [selectedDocument, selectedAnalysisType, selectedMode, analysisConfig, currentDefinition, completedSteps]);

    const handleStartAnalysis = async () => {
        if (!selectedDocument || !selectedAnalysisType || !selectedMode) {
            toast({
                title: "Missing information",
                description: "Please complete all required fields before starting the analysis.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await startAnalysis(
                selectedDocument.id,
                selectedAnalysisType.code,
                selectedMode === 'automatic' ? AnalysisMode.AUTOMATIC : AnalysisMode.STEP_BY_STEP,
                analysisConfig
            );

            toast({
                title: "Analysis started",
                description: "Your analysis has been started successfully.",
            });

            // Navigate to the document analysis page
            router.push(`/dashboard/analysis/document/${selectedDocument.id}`);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to start analysis",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const canNavigateTo = (stepId: string) => {
        // Find the index of the target step
        const targetIndex = setupSteps.findIndex(step => step.id === stepId);

        // Check if all previous steps are completed
        for (let i = 0; i < targetIndex; i++) {
            if (!completedSteps[setupSteps[i].id]) {
                return false;
            }
        }

        return true;
    };

    // Add a new function to initialize default parameters for all algorithms
    const initializeDefaultParameters = () => {
        if (!currentDefinition?.steps) return;

        const updatedStepsConfig = { ...analysisConfig.steps };

        currentDefinition.steps.forEach(step => {
            // Skip if already configured
            if (updatedStepsConfig[step.id]?.algorithm?.parameters) return;

            // Default to first algorithm if available
            const defaultAlgorithm = step.algorithms[0];

            if (defaultAlgorithm) {
                // Create empty parameters object
                const defaultParameters: Record<string, any> = {};

                updatedStepsConfig[step.id] = {
                    ...updatedStepsConfig[step.id],
                    algorithm: {
                        code: defaultAlgorithm.code,
                        version: defaultAlgorithm.version,
                        parameters: defaultParameters
                    }
                };
            }
        });

        setAnalysisConfig(prev => ({
            ...prev,
            steps: updatedStepsConfig
        }));
    };

    // Modify handleStepChange to initialize parameters when entering algorithm step
    const handleStepChange = (stepId: string) => {
        if (canNavigateTo(stepId)) {
            // If moving to algorithm step, initialize default algorithms without parameters
            if (stepId === 'algorithm' && activeStep !== 'algorithm') {
                initializeDefaultParameters();
            }

            setActiveStep(stepId);
        } else {
            toast({
                title: "Complete previous steps",
                description: "Please complete all previous steps before proceeding.",
                variant: "destructive"
            });
        }
    };

    // Also modify handleNext to do the same
    const handleNext = () => {
        const currentIndex = setupSteps.findIndex(step => step.id === activeStep);
        if (currentIndex < setupSteps.length - 1) {
            const nextStep = setupSteps[currentIndex + 1];
            if (canNavigateTo(nextStep.id)) {
                // If moving to algorithm step, initialize default algorithms without parameters
                if (nextStep.id === 'algorithm' && activeStep !== 'algorithm') {
                    initializeDefaultParameters();
                }

                setActiveStep(nextStep.id);
            }
        }
    };

    const handleBack = () => {
        const currentIndex = setupSteps.findIndex(step => step.id === activeStep);
        if (currentIndex > 0) {
            setActiveStep(setupSteps[currentIndex - 1].id);
        } else {
            router.push('/dashboard/analysis');
        }
    };

    const isStartDisabled = () => {
        return !selectedDocument || !selectedAnalysisType || !selectedMode;
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 'document':
                return (
                    <DocumentSelection
                        selectedDocument={selectedDocument}
                        onSelect={setSelectedDocument}
                    />
                );
            case 'analysis-type':
                return (
                    <AnalysisTypeSelection
                        selectedDocument={selectedDocument}
                        selectedAnalysisType={selectedAnalysisType}
                        onSelect={(analysisType) => setSelectedAnalysisType(analysisType as AnalysisDefinition)}
                    />
                );
            case 'algorithm':
                return (
                    <AlgorithmConfiguration
                        currentDefinition={currentDefinition}
                        analysisConfig={analysisConfig}
                        onConfigChange={setAnalysisConfig}
                    />
                );
            case 'mode':
                return (
                    <ModeSelection
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />
                );
            case 'review':
                return (
                    <ReviewStep
                        selectedDocument={selectedDocument}
                        selectedAnalysisType={selectedAnalysisType}
                        selectedMode={selectedMode}
                        analysisConfig={analysisConfig}
                        currentDefinition={currentDefinition}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-6 py-10 max-w-7xl"
        >
            <div className="mb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">New Analysis</h1>
                        <p className="text-gray-500 mt-2.5 text-lg font-normal">Configure and run a document analysis</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/analysis')}
                        className="flex items-center hover:bg-red-500 transition-colors"
                    >
                        <XMarkIcon className="h-4 w-4 mr-1.5" />
                        Cancel
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Progress Tracker Sidebar */}
                <div className="lg:col-span-1">
                    <AnalysisStepSidebar
                        steps={setupSteps}
                        activeStep={activeStep}
                        completedSteps={completedSteps}
                        canNavigateTo={canNavigateTo}
                        onStepChange={handleStepChange}
                        onStartAnalysis={handleStartAnalysis}
                        isStartDisabled={isStartDisabled()}
                        isSubmitting={isSubmitting}
                    />
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                    <AnalysisStepContent
                        steps={setupSteps}
                        activeStep={activeStep}
                        completedSteps={completedSteps}
                        onNext={handleNext}
                        onBack={handleBack}
                        onStartAnalysis={handleStartAnalysis}
                        isStartDisabled={isStartDisabled()}
                        isSubmitting={isSubmitting}
                    >
                        {renderStepContent()}
                    </AnalysisStepContent>
                </div>
            </div>
        </motion.div>
    );
} 