import { Algorithm, Parameter } from '@/types/analysis';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

interface AlgorithmConfigProps {
    stepId: string;
    stepName: string;
    algorithms: Algorithm[];
    onConfigChange: (config: {
        algorithm_id: string;
        parameters: Record<string, any>;
    }) => void;
}

export function AlgorithmConfig({
    stepId,
    stepName,
    algorithms,
    onConfigChange,
}: AlgorithmConfigProps) {
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(
        algorithms.length > 0 ? algorithms[0] : null
    );
    const [parameters, setParameters] = useState<Record<string, any>>({});

    const handleAlgorithmChange = (algorithmId: string) => {
        const algorithm = algorithms.find((a) => a.id === algorithmId) || null;
        setSelectedAlgorithm(algorithm);
        const defaultParams = algorithm?.parameters.reduce((acc, param) => {
            acc[param.name] = param.default;
            return acc;
        }, {} as Record<string, any>) || {};
        setParameters(defaultParams);
        onConfigChange({
            algorithm_id: algorithmId,
            parameters: defaultParams,
        });
    };

    const handleParameterChange = (param: Parameter, value: any) => {
        const newParameters = { ...parameters, [param.name]: value };
        setParameters(newParameters);
        if (selectedAlgorithm) {
            onConfigChange({
                algorithm_id: selectedAlgorithm.id,
                parameters: newParameters,
            });
        }
    };

    const renderParameterInput = (param: Parameter) => {
        switch (param.type) {
            case 'number':
                return (
                    <Input
                        type="number"
                        value={parameters[param.name] ?? param.default ?? ''}
                        min={param.min_value}
                        max={param.max_value}
                        onChange={(e) =>
                            handleParameterChange(param, parseFloat(e.target.value))
                        }
                    />
                );
            case 'boolean':
                return (
                    <Switch
                        checked={parameters[param.name] ?? param.default ?? false}
                        onCheckedChange={(checked) =>
                            handleParameterChange(param, checked)
                        }
                    />
                );
            case 'select':
                return (
                    <Select
                        value={parameters[param.name] ?? param.default ?? ''}
                        onValueChange={(value) =>
                            handleParameterChange(param, value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {param.allowed_values?.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            default:
                return (
                    <Input
                        type="text"
                        value={parameters[param.name] ?? param.default ?? ''}
                        onChange={(e) =>
                            handleParameterChange(param, e.target.value)
                        }
                    />
                );
        }
    };

    if (!selectedAlgorithm) return null;

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg font-medium">
                    {stepName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Algorithm</Label>
                        <Select
                            value={selectedAlgorithm.id}
                            onValueChange={handleAlgorithmChange}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {algorithms.map((algorithm) => (
                                    <SelectItem
                                        key={algorithm.id}
                                        value={algorithm.id}
                                    >
                                        {algorithm.name} (v{algorithm.version})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedAlgorithm.description && (
                        <p className="text-sm text-muted-foreground">
                            {selectedAlgorithm.description}
                        </p>
                    )}

                    <div className="space-y-4">
                        {selectedAlgorithm.parameters.map((param) => (
                            <div key={param.name} className="space-y-2">
                                <Label>
                                    {param.name}
                                    {param.required && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </Label>
                                {renderParameterInput(param)}
                                {param.description && (
                                    <p className="text-xs text-muted-foreground">
                                        {param.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}