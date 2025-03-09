import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/use-toast';
import { AnalysisDefinition, AnalysisParameter } from '@/types/analysis/configs';
import { AnalysisRunConfig, AnalysisStepConfig } from '@/types/analysis/base';

interface AlgorithmConfigurationProps {
    currentDefinition: AnalysisDefinition | null;
    analysisConfig: AnalysisRunConfig;
    onConfigChange: (config: AnalysisRunConfig) => void;
}

export function AlgorithmConfiguration({
    currentDefinition,
    analysisConfig,
    onConfigChange
}: AlgorithmConfigurationProps) {
    const { toast } = useToast();
    const [showHelpTips, setShowHelpTips] = useState(true);

    if (!currentDefinition) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-48 rounded-md mb-2" />
                <Skeleton className="h-4 w-64 rounded-md" />
            </div>
        );
    }

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
        onConfigChange({
            ...analysisConfig,
            steps: {
                ...analysisConfig.steps,
                [stepId]: {
                    ...analysisConfig.steps[stepId],
                    algorithm: {
                        code: algorithmCode,
                        version: algorithmVersion,
                        parameters: defaultParameters
                    }
                }
            }
        });
    };

    const handleParameterChange = (stepId: string, paramName: string, value: any) => {
        onConfigChange({
            ...analysisConfig,
            steps: {
                ...analysisConfig.steps,
                [stepId]: {
                    ...analysisConfig.steps[stepId],
                    algorithm: {
                        ...analysisConfig.steps[stepId].algorithm!,
                        parameters: {
                            ...analysisConfig.steps[stepId].algorithm!.parameters,
                            [paramName]: {
                                name: paramName,
                                value
                            }
                        }
                    }
                }
            }
        });
    };

    const handleStepToggle = (stepId: string, enabled: boolean) => {
        onConfigChange({
            ...analysisConfig,
            steps: {
                ...analysisConfig.steps,
                [stepId]: {
                    ...analysisConfig.steps[stepId],
                    enabled
                }
            }
        });
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
        onConfigChange({
            ...analysisConfig,
            steps: {
                ...analysisConfig.steps,
                [stepId]: {
                    ...analysisConfig.steps[stepId],
                    algorithm: {
                        ...analysisConfig.steps[stepId].algorithm!,
                        parameters: defaultParameters
                    }
                }
            }
        });

        toast({
            description: "Default parameters applied",
        });
    };

    const renderParameterInput = (stepId: string, param: AnalysisParameter, stepConfig: AnalysisStepConfig) => {
        const value = stepConfig.algorithm?.parameters?.[param.name]?.value ?? param.default;

        const labelClasses = "text-sm font-medium text-gray-700 flex items-center";
        const requiredBadge = param.required && (
            <Badge variant="outline" className="ml-2 text-xs py-0 h-5 bg-red-50 text-red-600 border-red-200">
                Required
            </Badge>
        );

        const inputWrapperClasses = "mt-2 relative";

        // Format parameter name for display (convert snake_case to Title Case)
        const formatParamName = (name: string) => {
            return name.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        switch (param.type) {
            case 'boolean':
                return (
                    <div className="mb-6 p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`${stepId}-${param.name}`} className={labelClasses}>
                                {formatParamName(param.name)}
                                {requiredBadge}
                            </Label>
                            <Switch
                                id={`${stepId}-${param.name}`}
                                checked={value === true}
                                onCheckedChange={(checked) => handleParameterChange(stepId, param.name, checked)}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                        {param.description && (
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{param.description}</p>
                        )}
                    </div>
                );
            case 'number':
                return (
                    <div className="mb-6">
                        <Label htmlFor={`${stepId}-${param.name}`} className={labelClasses}>
                            {formatParamName(param.name)}
                            {requiredBadge}
                        </Label>
                        {param.description && (
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{param.description}</p>
                        )}
                        <div className={inputWrapperClasses}>
                            <Input
                                id={`${stepId}-${param.name}`}
                                type="number"
                                value={value}
                                onChange={(e) => handleParameterChange(stepId, param.name, parseFloat(e.target.value))}
                                className="h-11 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md shadow-sm"
                                min={param.constraints?.min}
                                max={param.constraints?.max}
                                step={param.constraints?.step || 1}
                            />
                        </div>
                    </div>
                );
            case 'select':
                return (
                    <div className="mb-6">
                        <Label htmlFor={`${stepId}-${param.name}`} className={labelClasses}>
                            {formatParamName(param.name)}
                            {requiredBadge}
                        </Label>
                        {param.description && (
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{param.description}</p>
                        )}
                        <div className={inputWrapperClasses}>
                            <Select
                                value={value}
                                onValueChange={(value) => handleParameterChange(stepId, param.name, value)}
                            >
                                <SelectTrigger id={`${stepId}-${param.name}`} className="h-11 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md shadow-sm">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-200 shadow-md rounded-md">
                                    {param.constraints?.options?.map((option: string) => (
                                        <SelectItem key={option} value={option} className="focus:bg-primary/10 focus:text-primary">
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="mb-6">
                        <Label htmlFor={`${stepId}-${param.name}`} className={labelClasses}>
                            {formatParamName(param.name)}
                            {requiredBadge}
                        </Label>
                        {param.description && (
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{param.description}</p>
                        )}
                        <div className={inputWrapperClasses}>
                            <Input
                                id={`${stepId}-${param.name}`}
                                type="text"
                                value={value}
                                onChange={(e) => handleParameterChange(stepId, param.name, e.target.value)}
                                className="h-11 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md shadow-sm"
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-8">
            {showHelpTips && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-8">
                    <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-800 mb-1.5">Configuration Tips</h3>
                            <ul className="text-sm text-blue-700 space-y-1.5 list-disc pl-5">
                                <li>Each step can be enabled or disabled using the toggle</li>
                                <li>Select the algorithm you want to use for each step</li>
                                <li>Configure the parameters for each algorithm</li>
                                <li>Use "Default Parameters" to reset to recommended values</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
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
                            className={`transition-all duration-200 border-gray-200 ${!stepConfig.enabled ? 'opacity-70 bg-muted/20' : 'hover:shadow-md'}`}
                        >
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2.5 py-1">
                                            Step {index + 1}
                                        </Badge>
                                        <h3 className="font-medium text-gray-800">
                                            {step.name.split('_').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Label htmlFor={`toggle-${step.id}`} className="text-xs text-gray-500 mr-1.5">
                                            {stepConfig.enabled ? 'Enabled' : 'Disabled'}
                                        </Label>
                                        <Switch
                                            id={`toggle-${step.id}`}
                                            checked={stepConfig.enabled}
                                            onCheckedChange={(checked) => handleStepToggle(step.id, checked)}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            {stepConfig.enabled && (
                                <CardContent className="pt-5">
                                    <div className="space-y-6">
                                        <div>
                                            <Label htmlFor={`algorithm-${step.id}`} className="text-sm font-medium text-gray-700 mb-2 block">
                                                Select Algorithm
                                            </Label>
                                            <Select
                                                value={selectedAlgorithmCode}
                                                onValueChange={(value) => {
                                                    const algorithm = step.algorithms.find(a => a.code === value);
                                                    if (algorithm) {
                                                        handleAlgorithmChange(step.id, algorithm.code, algorithm.version);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger id={`algorithm-${step.id}`} className="h-11 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md shadow-sm">
                                                    <SelectValue placeholder="Select algorithm" />
                                                </SelectTrigger>
                                                <SelectContent className="border-gray-200 shadow-md rounded-md">
                                                    {step.algorithms.map(algorithm => (
                                                        <SelectItem
                                                            key={algorithm.code}
                                                            value={algorithm.code}
                                                            className="focus:bg-primary/10 focus:text-primary"
                                                        >
                                                            {algorithm.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {selectedAlgorithm && (
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium text-gray-700">Parameters</h4>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUseDefaultParameters(step.id)}
                                                        className="text-xs h-8 border-gray-200 hover:bg-gray-50"
                                                    >
                                                        Reset to Defaults
                                                    </Button>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                                    {selectedAlgorithm.parameters.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {selectedAlgorithm.parameters.map(param => (
                                                                <div key={param.name}>
                                                                    {renderParameterInput(step.id, param, stepConfig)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No parameters required for this algorithm.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
} 