'use client';

import { useState } from 'react';
import { BaseEditorProps, TextExtractionData } from './types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Edit2, Save, AlertCircle, FileText, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TextEditor({ analysis, onSave, isEditable = true }: BaseEditorProps) {
    const { toast } = useToast();
    const [editMode, setEditMode] = useState(false);
    const [textData, setTextData] = useState<TextExtractionData>(analysis.results as TextExtractionData);
    const [activeTab, setActiveTab] = useState('full');

    const handleTextChange = (newText: string, pageNumber?: number) => {
        const newData = { ...textData };
        if (pageNumber !== undefined) {
            const pageIndex = newData.pages.findIndex(p => p.pageNumber === pageNumber);
            if (pageIndex !== -1) {
                newData.pages[pageIndex].content = newText;
                // Update the full text as well
                newData.text = newData.pages.map(p => p.content).join('\n\n');
            }
        } else {
            newData.text = newText;
            // Split the text into pages based on double newlines
            const pages = newText.split('\n\n');
            newData.pages = pages.map((content, index) => ({
                pageNumber: index + 1,
                content
            }));
        }
        setTextData(newData);
    };

    const handleSave = async () => {
        if (onSave) {
            await onSave(textData);
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
                        Confidence: {Math.round(textData.confidence * 100)}%
                    </Badge>
                    {textData.confidence < 0.7 && (
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Low confidence extraction. Please review the text carefully.
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(textData.text)}
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
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
                                Edit Text
                            </Button>
                        )
                    )}
                </div>
            </div>

            <Card>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="full" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Full Text
                        </TabsTrigger>
                        <TabsTrigger value="pages" className="gap-2">
                            <FileText className="h-4 w-4" />
                            By Page
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="full">
                        <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                            {editMode ? (
                                <textarea
                                    value={textData.text}
                                    onChange={(e) => handleTextChange(e.target.value)}
                                    className="w-full h-full min-h-[480px] p-2 bg-transparent border-none focus:outline-none resize-none"
                                />
                            ) : (
                                <div className="whitespace-pre-wrap font-mono text-sm">
                                    {textData.text}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="pages">
                        <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                            <div className="space-y-4">
                                {textData.pages.map((page) => (
                                    <div key={page.pageNumber} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium">
                                                Page {page.pageNumber}
                                            </h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(page.content)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {editMode ? (
                                            <textarea
                                                value={page.content}
                                                onChange={(e) => handleTextChange(e.target.value, page.pageNumber)}
                                                className="w-full min-h-[200px] p-2 rounded-md border bg-transparent focus:outline-none resize-none"
                                            />
                                        ) : (
                                            <div className="whitespace-pre-wrap font-mono text-sm p-2 rounded-md bg-muted">
                                                {page.content}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
} 