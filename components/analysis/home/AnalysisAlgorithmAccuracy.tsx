import { CheckCircle2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AlgorithmMetric {
    name: string;
    accuracy: number;
    userCorrections: number;
    confidence: number;
}

interface StepAccuracyData {
    stepId: string;
    stepName: string;
    algorithms: AlgorithmMetric[];
}

interface AnalysisAlgorithmAccuracyProps {
    analysisDefinitions: any[];
    selectedMetricAnalysisType: string | null;
    setSelectedMetricAnalysisType: (value: string | null) => void;
    getAlgorithmAccuracyData: (analysisTypeId: string | null) => StepAccuracyData[];
}

export function AnalysisAlgorithmAccuracy({
    analysisDefinitions,
    selectedMetricAnalysisType,
    setSelectedMetricAnalysisType,
    getAlgorithmAccuracyData,
}: AnalysisAlgorithmAccuracyProps) {
    return (
        <div className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                <div className="flex items-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-xs text-muted-foreground flex items-center">
                                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                    <span>Select analysis type</span>
                                    <div className="ml-1 rounded-full bg-muted w-4 h-4 inline-flex items-center justify-center text-xs cursor-help">?</div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>Accuracy metrics are based on user corrections and feedback. Higher percentages indicate better algorithm performance.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="w-full sm:w-64">
                    <Select
                        value={selectedMetricAnalysisType || ""}
                        onValueChange={(value) => setSelectedMetricAnalysisType(value || null)}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select analysis type" />
                        </SelectTrigger>
                        <SelectContent>
                            {analysisDefinitions.map(def => (
                                <SelectItem key={def.id} value={def.id} className="text-xs">
                                    {def.name.split('_')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedMetricAnalysisType ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {getAlgorithmAccuracyData(selectedMetricAnalysisType).map((stepData: StepAccuracyData, index: number) => (
                        <div key={stepData.stepId || index} className="border rounded-md p-2">
                            <h4 className="text-xs font-medium mb-2 capitalize">
                                {stepData.stepName.split('_').join(' ')}
                            </h4>
                            <div className="space-y-2">
                                {stepData.algorithms.map((algo: AlgorithmMetric, algoIndex: number) => (
                                    <div key={algoIndex} className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground text-[11px]">{algo.name}</span>
                                            <span className="font-medium text-[11px]">{algo.accuracy}% accuracy</span>
                                        </div>
                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${algo.accuracy >= 90 ? 'bg-green-500' :
                                                    algo.accuracy >= 80 ? 'bg-emerald-500' :
                                                        algo.accuracy >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${algo.accuracy}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                            <span>{algo.userCorrections} corrections</span>
                                            <span>{algo.confidence}% confidence</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-muted-foreground text-sm border rounded-md">
                    <p>Select an analysis type to view algorithm accuracy metrics</p>
                </div>
            )}
        </div>
    );
} 