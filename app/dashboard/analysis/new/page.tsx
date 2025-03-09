'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Steps } from '@/components/ui/steps';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentSelection } from '@/components/analysis/setup/document-selection';
import { AnalysisTypeSelection } from '@/components/analysis/setup/analysis-type-selection';
import { ModeSelection } from '@/components/analysis/setup/mode-selection';
import { useToast } from '@/hooks/use-toast';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Document } from '@/types/document';
import { AnalysisDefinition, AnalysisParameter } from '@/types/analysis/configs';
import { AnalysisRunConfig, AnalysisStepConfig } from '@/types/analysis/base';
import { AnalysisMode } from '@/enums/analysis';
import { motion } from 'framer-motion';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    InformationCircleIcon,
    LightBulbIcon,
    PlayIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

// Define the steps for the setup process
const setupSteps = [
    { id: 'document', title: 'Document Selection', icon: DocumentTextIcon, description: 'Select the document you want to analyze' },
    { id: 'analysis-type', title: 'Analysis Type', icon: Cog6ToothIcon, description: 'Choose the type of analysis to perform' },
    { id: 'algorithm', title: 'Algorithm Configuration', icon: LightBulbIcon, description: 'Configure the algorithms and parameters' },
    { id: 'mode', title: 'Mode Selection', icon: PlayIcon, description: 'Choose between automatic or step-by-step processing' },
    { id: 'review', title: 'Review & Start', icon: CheckCircleIcon, description: 'Review your configuration and start the analysis' }
];

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
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
    const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisDefinition | null>(null);
    const [selectedMode, setSelectedMode] = useState<'automatic' | 'step_by_step' | null>(null);
    const [analysisConfig, setAnalysisConfig] = useState<AnalysisRunConfig>({
        steps: {},
        notifications: {
            notify_on_completion: true,
            notify_on_failure: true
        },
        metadata: {}
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHelpTips, setShowHelpTips] = useState(true);

    const {
        currentDefinition,
        fetchAnalysisDefinition,
        fetchStepAlgorithms,
        availableAlgorithms,
        startAnalysis,
        isLoading
    } = useAnalysisStore();

    // Fetch analysis definition when selected
    useEffect(() => {
        if (selectedAnalysisType?.id) {
            fetchAnalysisDefinition(selectedAnalysisType.id);
        }
    }, [selectedAnalysisType, fetchAnalysisDefinition]);

    // Initialize config when analysis definition changes
    useEffect(() => {
        if (currentDefinition?.steps) {
            // Create initial config with default values
            const initialStepsConfig: Record<string, AnalysisStepConfig> = {};

            currentDefinition.steps.forEach(step => {
                // Default to first algorithm if available
                const defaultAlgorithm = step.algorithms[0];

                if (defaultAlgorithm) {
                    // Fetch algorithms for this step
                    fetchStepAlgorithms(step.id);

                    // Create default parameters
                    const defaultParameters: Record<string, any> = {};
                    defaultAlgorithm.parameters.forEach(param => {
                        defaultParameters[param.name] = param.default;
                    });

                    initialStepsConfig[step.id] = {
                        enabled: true,
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
                steps: initialStepsConfig
            }));
        }
    }, [currentDefinition, fetchStepAlgorithms]);

    // Update completed steps when data changes
    useEffect(() => {
        const newCompletedSteps = { ...completedSteps };

        // Document step
        newCompletedSteps['document'] = !!selectedDocument;

        // Analysis type step
        newCompletedSteps['analysis-type'] = !!selectedAnalysisType;

        // Algorithm step
        if (currentDefinition?.steps) {
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
                return selectedAlgorithm.parameters.every(param => {
                    if (!param.required) return true;
                    const paramValue = stepConfig.algorithm?.parameters?.[param.name]?.value;
                    return paramValue !== undefined && paramValue !== null && paramValue !== '';
                });
            });

            newCompletedSteps['algorithm'] = allRequiredParamsSet;
        } else {
            newCompletedSteps['algorithm'] = false;
        }

        // Mode step
        newCompletedSteps['mode'] = !!selectedMode;

        // Review step is always considered complete
        newCompletedSteps['review'] = true;

        setCompletedSteps(newCompletedSteps);
    }, [selectedDocument, selectedAnalysisType, selectedMode, analysisConfig, currentDefinition]);

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

    const handleStepChange = (stepId: string) => {
        if (canNavigateTo(stepId)) {
            setActiveStep(stepId);
        } else {
            toast({
                title: "Complete previous steps",
                description: "Please complete all previous steps before proceeding.",
                variant: "destructive"
            });
        }
    };

    const handleNext = () => {
        const currentIndex = setupSteps.findIndex(step => step.id === activeStep);
        if (currentIndex < setupSteps.length - 1) {
            const nextStep = setupSteps[currentIndex + 1];
            if (canNavigateTo(nextStep.id)) {
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
                return renderAlgorithmConfiguration();
            case 'mode':
                return (
                    <ModeSelection
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />
                );
            case 'review':
                return renderReviewStep();
            default:
                return null;
        }
    };

    const renderAlgorithmConfiguration = () => {
        if (!currentDefinition || !currentDefinition.steps || currentDefinition.steps.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-[400px]">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-48 mt-4" />
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Configure Analysis Algorithms</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHelpTips(!showHelpTips)}
                            className="text-xs flex items-center gap-1.5"
                        >
                            <InformationCircleIcon className="h-4 w-4" />
                            {showHelpTips ? 'Hide Tips' : 'Show Tips'}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Customize how each step of the analysis process will be performed.
                    </p>

                    {showHelpTips && (
                        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700 flex items-start space-x-2.5">
                            <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">Tips for configuration:</p>
                                <ul className="list-disc pl-5 space-y-1 text-blue-600 text-xs">
                                    <li>Toggle steps on/off using the switches</li>
                                    <li>Each step can use different algorithms with unique parameters</li>
                                    <li>Required parameters are marked with an asterisk (*)</li>
                                    <li>Use "Default Parameters" to reset to recommended values</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {currentDefinition.steps.map((step, index) => {
                        const stepConfig = analysisConfig.steps[step.id] || {
                            enabled: true,
                            algorithm: undefined
                        };

                        const selectedAlgorithmCode = stepConfig.algorithm?.code;
                        const selectedAlgorithm = step.algorithms.find(
                            algo => algo.code === selectedAlgorithmCode
                        );

                        return (
                            <Card
                                key={step.id}
                                className={`transition-all duration-200 ${!stepConfig.enabled ? 'opacity-70 bg-muted/20' : 'hover:shadow-md'}`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                                Step {index + 1}
                                            </Badge>
                                            <h3 className="font-medium">
                                                {step.name.split('_').map(word =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`toggle-${step.id}`} className="text-xs text-muted-foreground mr-1">
                                                {stepConfig.enabled ? 'Enabled' : 'Disabled'}
                                            </Label>
                                            <Switch
                                                id={`toggle-${step.id}`}
                                                checked={stepConfig.enabled}
                                                onCheckedChange={(checked) => handleStepToggle(step.id, checked)}
                                            />
                                        </div>
                                    </div>
                                </CardHeader>

                                {stepConfig.enabled ? (
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Algorithm Selection</Label>
                                                <Select
                                                    value={selectedAlgorithmCode}
                                                    onValueChange={(value) => {
                                                        const algorithm = step.algorithms.find(a => a.code === value);
                                                        if (algorithm) {
                                                            handleAlgorithmChange(step.id, algorithm.code, algorithm.version);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select algorithm" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {step.algorithms.map((algorithm) => (
                                                            <SelectItem key={algorithm.code} value={algorithm.code}>
                                                                {algorithm.name.split('_').map(word =>
                                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                                ).join(' ')}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {selectedAlgorithm && (
                                                <>
                                                    {selectedAlgorithm.description && (
                                                        <div className="bg-muted/30 p-3 rounded-md text-sm border border-muted">
                                                            <div className="flex items-start">
                                                                <InformationCircleIcon className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                                                                <p className="text-muted-foreground">
                                                                    {selectedAlgorithm.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-sm font-medium">Parameters</h4>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleUseDefaultParameters(step.id)}
                                                            className="text-xs"
                                                        >
                                                            <LightBulbIcon className="h-3.5 w-3.5 mr-1.5" />
                                                            Reset to Defaults
                                                        </Button>
                                                    </div>

                                                    {selectedAlgorithm.parameters.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            This algorithm has no configurable parameters.
                                                        </p>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {selectedAlgorithm.parameters.map((param) => (
                                                                <div key={param.name} className="space-y-1.5 bg-muted/10 p-3 rounded-md border border-muted/50">
                                                                    <Label className="text-sm flex items-center">
                                                                        {param.name.split('_').map(word =>
                                                                            word.charAt(0).toUpperCase() + word.slice(1)
                                                                        ).join(' ')}
                                                                        {param.required && <span className="text-destructive ml-1 font-medium">*</span>}
                                                                    </Label>

                                                                    {renderParameterInput(step.id, param, stepConfig)}

                                                                    {param.description && (
                                                                        <p className="text-xs text-muted-foreground mt-1.5">
                                                                            {param.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                ) : (
                                    <CardContent>
                                        <div className="py-2 text-sm text-muted-foreground flex items-center">
                                            <XMarkIcon className="h-4 w-4 mr-2 text-muted-foreground/70" />
                                            This step is disabled and will be skipped during analysis.
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderParameterInput = (stepId: string, param: AnalysisParameter, stepConfig: AnalysisStepConfig) => {
        const value = stepConfig.algorithm?.parameters?.[param.name]?.value ?? param.default;

        switch (param.type.toLowerCase()) {
            case 'number':
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleParameterChange(stepId, param.name, parseFloat(e.target.value))}
                        className="h-9 mt-1"
                    />
                );
            case 'boolean':
                return (
                    <div className="flex items-center h-9 mt-1">
                        <Switch
                            checked={value}
                            onCheckedChange={(checked) => handleParameterChange(stepId, param.name, checked)}
                        />
                        <span className="ml-2 text-sm">{value ? 'Enabled' : 'Disabled'}</span>
                    </div>
                );
            case 'select':
                return (
                    <Select
                        value={value}
                        onValueChange={(value) => handleParameterChange(stepId, param.name, value)}
                    >
                        <SelectTrigger className="h-9 mt-1">
                            <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                            {param.constraints?.options?.map((option: string) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            default:
                return (
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleParameterChange(stepId, param.name, e.target.value)}
                        className="h-9 mt-1"
                    />
                );
        }
    };

    const renderReviewStep = () => {
        return (
            <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Review Configuration</h3>

                    {/* Document */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Document</h4>
                        <div className="bg-white rounded-md border p-4">
                            {selectedDocument ? (
                                <div className="flex items-start">
                                    <DocumentTextIcon className="h-5 w-5 text-primary mr-3 mt-0.5" />
                                    <div>
                                        <p className="font-medium">{selectedDocument.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedDocument.metadata?.num_pages || 'Unknown'} pages • {selectedDocument.type} • {formatFileSize(selectedDocument.size)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No document selected</p>
                            )}
                        </div>
                    </div>

                    {/* Analysis Type */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Analysis Type</h4>
                        <div className="bg-white rounded-md border p-4">
                            {selectedAnalysisType ? (
                                <div className="flex items-start">
                                    <Cog6ToothIcon className="h-5 w-5 text-primary mr-3 mt-0.5" />
                                    <div>
                                        <p className="font-medium">{selectedAnalysisType.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedAnalysisType.description}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No analysis type selected</p>
                            )}
                        </div>
                    </div>

                    {/* Algorithm Configuration */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Algorithm Configuration</h4>
                        <div className="bg-white rounded-md border p-4 space-y-4">
                            {currentDefinition?.steps.map(step => {
                                const stepConfig = analysisConfig.steps[step.id];
                                if (!stepConfig) return null;

                                const algorithm = step.algorithms.find(
                                    algo => algo.code === stepConfig.algorithm?.code
                                );

                                return (
                                    <div key={step.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <Badge variant={stepConfig.enabled ? "default" : "outline"} className="mr-2">
                                                    {stepConfig.enabled ? "Enabled" : "Disabled"}
                                                </Badge>
                                                <h5 className="font-medium">{step.name}</h5>
                                            </div>
                                        </div>

                                        {stepConfig.enabled && (
                                            <div className="pl-4 border-l-2 border-muted space-y-2">
                                                <p className="text-sm">
                                                    <span className="text-muted-foreground">Algorithm:</span>{" "}
                                                    {algorithm?.name || "None selected"}
                                                </p>

                                                {algorithm && Object.keys(stepConfig.algorithm?.parameters || {}).length > 0 && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Parameters:</p>
                                                        <ul className="text-sm pl-4 space-y-1">
                                                            {Object.entries(stepConfig.algorithm?.parameters || {}).map(([key, param]: [string, any]) => (
                                                                <li key={key}>
                                                                    <span className="font-medium">{key}:</span>{" "}
                                                                    {param.value !== undefined ? String(param.value) : "Not set"}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mode */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Processing Mode</h4>
                        <div className="bg-white rounded-md border p-4">
                            {selectedMode ? (
                                <div className="flex items-start">
                                    <PlayIcon className="h-5 w-5 text-primary mr-3 mt-0.5" />
                                    <div>
                                        <p className="font-medium">
                                            {selectedMode === 'automatic' ? 'Automatic Processing' : 'Step-by-Step Processing'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedMode === 'automatic'
                                                ? 'The analysis will run automatically without intervention.'
                                                : 'You will control each step of the analysis process.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No mode selected</p>
                            )}
                        </div>
                    </div>

                    {/* Start Info */}
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                            Once you start the analysis, you'll be redirected to the analysis dashboard where you can monitor progress
                            {selectedMode === 'step_by_step' ? ' and control each step of the process.' : '.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const handleAlgorithmChange = (stepId: string, algorithmCode: string, algorithmVersion: string) => {
        // Find the algorithm to get default parameters
        const step = currentDefinition?.steps.find(s => s.id === stepId);
        const algorithm = step?.algorithms.find(a => a.code === algorithmCode);

        if (!algorithm) return;

        // Create default parameters
        const defaultParameters: Record<string, any> = {};
        algorithm.parameters.forEach(param => {
            defaultParameters[param.name] = {
                name: param.name,
                value: param.default
            };
        });

        // Update config
        setAnalysisConfig(prev => ({
            ...prev,
            steps: {
                ...prev.steps,
                [stepId]: {
                    ...prev.steps[stepId],
                    algorithm: {
                        code: algorithmCode,
                        version: algorithmVersion,
                        parameters: defaultParameters
                    }
                }
            }
        }));
    };

    const handleParameterChange = (stepId: string, paramName: string, value: any) => {
        setAnalysisConfig(prev => ({
            ...prev,
            steps: {
                ...prev.steps,
                [stepId]: {
                    ...prev.steps[stepId],
                    algorithm: {
                        ...prev.steps[stepId].algorithm!,
                        parameters: {
                            ...prev.steps[stepId].algorithm!.parameters,
                            [paramName]: {
                                name: paramName,
                                value
                            }
                        }
                    }
                }
            }
        }));
    };

    const handleStepToggle = (stepId: string, enabled: boolean) => {
        setAnalysisConfig(prev => ({
            ...prev,
            steps: {
                ...prev.steps,
                [stepId]: {
                    ...prev.steps[stepId],
                    enabled
                }
            }
        }));
    };

    const handleUseDefaultParameters = (stepId: string) => {
        const step = currentDefinition?.steps.find(s => s.id === stepId);
        const algorithmCode = analysisConfig.steps[stepId]?.algorithm?.code;
        const algorithm = step?.algorithms.find(a => a.code === algorithmCode);

        if (!algorithm) return;

        // Create default parameters
        const defaultParameters: Record<string, any> = {};
        algorithm.parameters.forEach(param => {
            defaultParameters[param.name] = {
                name: param.name,
                value: param.default
            };
        });

        // Update config
        setAnalysisConfig(prev => ({
            ...prev,
            steps: {
                ...prev.steps,
                [stepId]: {
                    ...prev.steps[stepId],
                    algorithm: {
                        ...prev.steps[stepId].algorithm!,
                        parameters: defaultParameters
                    }
                }
            }
        }));

        toast({
            description: "Default parameters applied",
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8 max-w-7xl"
        >
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">New Analysis</h1>
                        <p className="text-gray-500 mt-1">Configure and run a document analysis</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/analysis')}
                        className="flex items-center"
                    >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Cancel
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Progress Tracker */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
                        <h2 className="text-lg font-semibold mb-4">Analysis Setup</h2>
                        <nav className="space-y-2">
                            {setupSteps.map((step, index) => {
                                const isActive = activeStep === step.id;
                                const isCompleted = completedSteps[step.id];
                                const canNavigate = canNavigateTo(step.id);

                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => handleStepChange(step.id)}
                                        disabled={!canNavigate && !isActive}
                                        className={`w-full flex items-start p-3 rounded-lg text-left transition-all ${isActive
                                                ? 'bg-primary/10 border-l-4 border-primary'
                                                : isCompleted
                                                    ? 'hover:bg-gray-50 border-l-4 border-green-500'
                                                    : canNavigate
                                                        ? 'hover:bg-gray-50 border-l-4 border-transparent'
                                                        : 'opacity-50 cursor-not-allowed border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center h-8 w-8 rounded-full mr-3 flex-shrink-0 ${isActive
                                                ? 'bg-primary text-white'
                                                : isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            {isCompleted && !isActive ? (
                                                <CheckCircleIcon className="h-5 w-5" />
                                            ) : (
                                                <span>{index + 1}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className={`font-medium block ${isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-gray-700'
                                                }`}>
                                                {step.title}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-0.5 block">
                                                {step.description}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>

                        {activeStep === 'review' && (
                            <div className="mt-8">
                                <Button
                                    onClick={handleStartAnalysis}
                                    disabled={isStartDisabled() || isSubmitting}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <PlayIcon className="h-4 w-4 mr-1.5" />
                                            Start Analysis
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9">
                    <Card className="shadow-sm border overflow-hidden">
                        <CardHeader className="bg-gray-50 border-b px-6 py-4">
                            <div className="flex items-center">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${activeStep === 'review' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                                    }`}>
                                    {(() => {
                                        const step = setupSteps.find(s => s.id === activeStep);
                                        if (step) {
                                            const Icon = step.icon;
                                            return <Icon className="h-5 w-5" />;
                                        }
                                        return null;
                                    })()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {setupSteps.find(s => s.id === activeStep)?.title}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {setupSteps.find(s => s.id === activeStep)?.description}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6">
                            <div className="min-h-[500px]">
                                <motion.div
                                    key={activeStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {renderStepContent()}
                                </motion.div>
                            </div>
                        </CardContent>

                        <div className="px-6 py-4 bg-gray-50 border-t">
                            <div className="flex justify-between items-center">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="flex items-center"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
                                    {activeStep === 'document' ? 'Cancel' : 'Back'}
                                </Button>

                                {activeStep !== 'review' ? (
                                    <Button
                                        onClick={handleNext}
                                        disabled={!completedSteps[activeStep]}
                                        className="flex items-center"
                                    >
                                        Next
                                        <ArrowRightIcon className="h-4 w-4 ml-1.5" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleStartAnalysis}
                                        disabled={isStartDisabled() || isSubmitting}
                                        className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <PlayIcon className="h-4 w-4 mr-1.5" />
                                                Start Analysis
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
} 