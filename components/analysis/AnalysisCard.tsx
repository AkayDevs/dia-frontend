import { AnalysisDefinitionInfo } from '@/types/analysis/configs';
import { DocumentType } from '@/enums/document';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnalysisTypeIcon } from './AnalysisTypeIcon';
import { CheckIcon } from '@heroicons/react/24/outline';

interface AnalysisCardProps {
    analysisType: AnalysisDefinitionInfo;
    onSelect?: () => void;
    selected?: boolean;
    disabled?: boolean;
}

export const AnalysisCard = ({ analysisType, onSelect, selected, disabled }: AnalysisCardProps) => {
    const formattedName = analysisType.name.split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <Card
            className={`overflow-hidden transition-all hover:shadow-md ${selected
                ? 'border-primary ring-1 ring-primary'
                : disabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-muted/50 cursor-pointer'
                }`}
            onClick={disabled ? undefined : onSelect}
        >
            <CardHeader className="border-b bg-muted/30 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <AnalysisTypeIcon type={analysisType.code} className="text-primary" />
                        {formattedName}
                    </CardTitle>
                    {selected && (
                        <Badge variant="default" className="ml-2">
                            <CheckIcon className="h-3 w-3 mr-1" />
                            Selected
                        </Badge>
                    )}
                </div>
                <CardDescription>
                    {analysisType.description || `Run ${formattedName} on your document`}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-3">
                    <div>
                        <h4 className="text-sm font-medium mb-1">Supported Document Types</h4>
                        <div className="flex flex-wrap gap-1">
                            {analysisType.supported_document_types.map((type) => (
                                <Badge key={type} variant="outline" className="capitalize">
                                    {type}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 pt-3 flex justify-end">
                <Button
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={disabled ? undefined : onSelect}
                    disabled={disabled}
                >
                    {selected ? "Selected" : "Select"}
                </Button>
            </CardFooter>
        </Card>
    );
}; 