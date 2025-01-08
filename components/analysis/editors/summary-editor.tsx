'use client';

import { useState } from 'react';
import { BaseEditorProps, SummarizationData } from './types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Edit2, Save, AlertCircle, Copy, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SummaryEditor({ analysis, onSave, isEditable = true }: BaseEditorProps) {
    const { toast } = useToast();
    const [editMode, setEditMode] = useState(false);
    const [summaryData, setSummaryData] = useState<SummarizationData>(analysis.results as SummarizationData);

    const handleSummaryChange = (newSummary: string) => {
        setSummaryData(prev => ({
            ...prev,
            summary: newSummary
        }));
    };

    const handleKeyPointChange = (index: number, newPoint: string) => {
        const newKeyPoints = [...summaryData.keyPoints];
        newKeyPoints[index] = newPoint;
        setSummaryData(prev => ({
            ...prev,
            keyPoints: newKeyPoints
        }));
    };

    const handleAddKeyPoint = () => {
        setSummaryData(prev => ({
            ...prev,
            keyPoints: [...prev.keyPoints, '']
        }));
    };

    const handleDeleteKeyPoint = (index: number) => {
        setSummaryData(prev => ({
            ...prev,
            keyPoints: prev.keyPoints.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        if (onSave) {
            await onSave(summaryData);
        }
        setEditMode(false);
    };

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                description: "Text copied to clipboard",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to copy text",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                        Confidence: {Math.round(summaryData.confidence * 100)}%
                    </Badge>
                    {summaryData.confidence < 0.7 && (
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Low confidence summarization. Please review the content carefully.
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(summaryData.summary)}
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Summary
                    </Button>
                    {isEditable && (
                        editMode ? (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleSave}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditMode(true)}
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Summary
                            </Button>
                        )
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Original Text</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(summaryData.originalText)}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                        <div className="whitespace-pre-wrap font-mono text-sm">
                            {summaryData.originalText}
                        </div>
                    </ScrollArea>
                </Card>

                <div className="space-y-6">
                    <Card className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Summary</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(summaryData.summary)}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                            {editMode ? (
                                <textarea
                                    value={summaryData.summary}
                                    onChange={(e) => handleSummaryChange(e.target.value)}
                                    className="w-full h-full min-h-[180px] p-2 bg-transparent border-none focus:outline-none resize-none"
                                />
                            ) : (
                                <div className="whitespace-pre-wrap font-mono text-sm">
                                    {summaryData.summary}
                                </div>
                            )}
                        </ScrollArea>
                    </Card>

                    <Card className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Key Points</h3>
                            {editMode && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddKeyPoint}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Point
                                </Button>
                            )}
                        </div>
                        <ScrollArea className="h-[150px] w-full rounded-md border p-4">
                            <div className="space-y-2">
                                {summaryData.keyPoints.map((point, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <div className="mt-1.5">•</div>
                                        {editMode ? (
                                            <div className="flex-1 flex items-center gap-2">
                                                <textarea
                                                    value={point}
                                                    onChange={(e) => handleKeyPointChange(index, e.target.value)}
                                                    className="flex-1 p-2 rounded-md border bg-transparent focus:outline-none resize-none"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteKeyPoint(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex-1">{point}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
            </div>
        </div>
    );
} 