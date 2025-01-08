'use client';

import { useState } from 'react';
import { BaseEditorProps, TemplateData } from './types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Edit2, Save, AlertCircle, Copy, Plus, Trash2, FileStack } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TemplateEditor({ analysis, onSave, isEditable = true }: BaseEditorProps) {
    const { toast } = useToast();
    const [editMode, setEditMode] = useState(false);
    const [templateData, setTemplateData] = useState<TemplateData>(analysis.results as TemplateData);

    const handleFieldChange = (index: number, field: string, value: string) => {
        const newFields = [...templateData.fields];
        newFields[index] = {
            ...newFields[index],
            [field]: value
        };
        setTemplateData(prev => ({
            ...prev,
            fields: newFields
        }));
    };

    const handleAddField = () => {
        setTemplateData(prev => ({
            ...prev,
            fields: [
                ...prev.fields,
                {
                    name: '',
                    value: '',
                    confidence: 1.0
                }
            ]
        }));
    };

    const handleDeleteField = (index: number) => {
        setTemplateData(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        if (onSave) {
            await onSave(templateData);
        }
        setEditMode(false);
    };

    const handleExport = () => {
        const exportData = {
            template: templateData.template,
            fields: templateData.fields.reduce((acc, field) => {
                acc[field.name] = field.value;
                return acc;
            }, {} as Record<string, string>)
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            description: "Template data exported successfully",
            duration: 3000,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                        Confidence: {Math.round(templateData.confidence * 100)}%
                    </Badge>
                    {templateData.confidence < 0.7 && (
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Low confidence conversion. Please review the fields carefully.
                            </TooltipContent>
                        </Tooltip>
                    )}
                    <Badge variant="secondary" className="text-sm">
                        Template: {templateData.template}
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                    >
                        <FileStack className="h-4 w-4 mr-2" />
                        Export JSON
                    </Button>
                    {isEditable && (
                        editMode ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddField}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Field
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSave}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditMode(true)}
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Fields
                            </Button>
                        )
                    )}
                </div>
            </div>

            <Card>
                <ScrollArea className="h-[500px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Field Name</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead className="w-[100px]">Confidence</TableHead>
                                {editMode && <TableHead className="w-[100px]">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templateData.fields.map((field, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {editMode ? (
                                            <Input
                                                value={field.name}
                                                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                                className="w-full"
                                            />
                                        ) : (
                                            <span className="font-medium">{field.name}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editMode ? (
                                            <Input
                                                value={field.value}
                                                onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                                                className="w-full"
                                            />
                                        ) : (
                                            field.value
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                field.confidence >= 0.9
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : field.confidence >= 0.7
                                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            }
                                        >
                                            {Math.round(field.confidence * 100)}%
                                        </Badge>
                                    </TableCell>
                                    {editMode && (
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteField(index)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </Card>
        </div>
    );
} 