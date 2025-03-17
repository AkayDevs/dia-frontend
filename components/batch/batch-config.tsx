import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Settings,
    Info,
    AlertCircle,
    CheckCircle,
    RotateCw,
    FileText
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnalysisDefinitionInfo } from '@/types/analysis/configs';
import { AnalysisMode } from '@/enums/analysis';
import { Document } from '@/types/document';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDocumentStore } from '@/store/useDocumentStore';

interface BatchConfigProps {
    analysisDefinitions: AnalysisDefinitionInfo[];
    selectedAnalysisId: string;
    isLoading: boolean;
    onAnalysisChange: (analysisId: string) => void;
    onStartProcessing: () => void;
    onDocumentsSelected: (documents: Document[]) => void;
    selectedDocuments: Document[];
    disabled?: boolean;
}

export const BatchConfig = ({
    analysisDefinitions,
    selectedAnalysisId,
    isLoading,
    onAnalysisChange,
    onStartProcessing,
    onDocumentsSelected,
    selectedDocuments = [],
    disabled = false
}: BatchConfigProps) => {
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(AnalysisMode.AUTOMATIC);
    const [notifyOnCompletion, setNotifyOnCompletion] = useState<boolean>(true);
    const { documents, fetchDocuments, isLoading: isDocumentsLoading } = useDocumentStore();

    // Fetch documents on mount
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Get the selected analysis definition
    const selectedDefinition = analysisDefinitions.find(def => def.id === selectedAnalysisId);

    // Handle document selection
    const toggleDocumentSelection = (document: Document) => {
        if (selectedDocuments.some(doc => doc.id === document.id)) {
            onDocumentsSelected(selectedDocuments.filter(doc => doc.id !== document.id));
        } else {
            onDocumentsSelected([...selectedDocuments, document]);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-primary" />
                    <span>Batch Processing Configuration</span>
                </CardTitle>
                <CardDescription>
                    Configure the analysis settings for all documents in the batch
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Analysis Type Selection */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="analysis-type" className="text-sm font-medium">
                            Analysis Type
                        </Label>
                        {selectedDefinition && (
                            <Badge variant="outline" className="text-xs">
                                {selectedDefinition.supported_document_types.length} document types
                            </Badge>
                        )}
                    </div>
                    <Select
                        value={selectedAnalysisId}
                        onValueChange={onAnalysisChange}
                        disabled={disabled || isLoading}
                    >
                        <SelectTrigger id="analysis-type" className="w-full">
                            <SelectValue placeholder="Select analysis type" />
                        </SelectTrigger>
                        <SelectContent key="analysis-definitions-content">
                            {analysisDefinitions.map((definition) => (
                                <SelectItem key={definition.code} value={definition.id}>
                                    {definition.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedDefinition && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {selectedDefinition.description}
                        </p>
                    )}
                </div>

                <Separator />

                {/* Analysis Mode */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium">Processing Options</h3>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="analysis-mode" className="text-sm">
                                Automatic Processing
                            </Label>
                            <TooltipProvider key="automatic-processing-tooltip">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Automatic mode processes all steps without user intervention</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Switch
                            id="analysis-mode"
                            checked={analysisMode === AnalysisMode.AUTOMATIC}
                            onCheckedChange={(checked) =>
                                setAnalysisMode(checked ? AnalysisMode.AUTOMATIC : AnalysisMode.STEP_BY_STEP)
                            }
                            disabled={disabled || isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="notify-completion" className="text-sm">
                                Notify on Completion
                            </Label>
                            <TooltipProvider key="notify-completion-tooltip">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Receive a notification when batch processing is complete</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Switch
                            id="notify-completion"
                            checked={notifyOnCompletion}
                            onCheckedChange={setNotifyOnCompletion}
                            disabled={disabled || isLoading}
                        />
                    </div>
                </div>

                <Separator />

                {/* Existing Documents Selection */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Select Existing Documents</h3>
                        {selectedDocuments.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                                {selectedDocuments.length} selected
                            </Badge>
                        )}
                    </div>

                    <ScrollArea className="h-[200px] border rounded-md p-2">
                        {isDocumentsLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-muted-foreground">Loading documents...</p>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <FileText className="h-8 w-8 mb-2 opacity-30" />
                                <p className="text-sm">No documents available</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {documents.map((document) => (
                                    <div
                                        key={document.id}
                                        className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded-md cursor-pointer"
                                        onClick={() => toggleDocumentSelection(document)}
                                    >
                                        <Checkbox
                                            id={`doc-${document.id}`}
                                            checked={selectedDocuments.some(doc => doc.id === document.id)}
                                            onCheckedChange={() => toggleDocumentSelection(document)}
                                        />
                                        <div className="flex-1 overflow-hidden">
                                            <Label
                                                htmlFor={`doc-${document.id}`}
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                {document.name}
                                            </Label>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {new Date(document.uploaded_at).toLocaleDateString()} • {(document.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {!selectedAnalysisId && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <p>Please select an analysis type to continue</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                    {selectedDefinition ? (
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Ready to process</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span>Configuration required</span>
                        </div>
                    )}
                </div>
                <Button
                    onClick={onStartProcessing}
                    disabled={disabled || isLoading || !selectedAnalysisId}
                >
                    {isLoading ? (
                        <>
                            <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Start Processing'
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}; 