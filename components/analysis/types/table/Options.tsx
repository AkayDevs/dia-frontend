'use client';

import { useState, useEffect } from 'react';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { OptionsProps } from '../../interfaces';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';

export function Options({ analysisId, documentId }: OptionsProps) {
    const {
        config: initialConfig,
        tableConfig,
        updateConfig,
        isLoading
    } = useAnalysisStore();

    const [localConfig, setLocalConfig] = useState(tableConfig);
    const [activeTab, setActiveTab] = useState('detection');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (tableConfig) {
            setLocalConfig(tableConfig);
        }
    }, [tableConfig]);

    if (isLoading || !localConfig) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading options...</span>
            </div>
        );
    }

    const handleConfigChange = (path: string, value: any) => {
        const newConfig = { ...localConfig };

        // Handle nested paths like 'tableOptions.detectHeaderRows'
        const parts = path.split('.');
        let current: any = newConfig;

        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = value;
        setLocalConfig(newConfig);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateConfig(localConfig);
        } catch (error) {
            console.error('Failed to save configuration:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Table Analysis Options</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="detection">Detection Options</TabsTrigger>
                        <TabsTrigger value="extraction">Extraction Options</TabsTrigger>
                    </TabsList>

                    <TabsContent value="detection" className="space-y-4">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="detectHeaderRows">Detect Header Rows</Label>
                                <Switch
                                    id="detectHeaderRows"
                                    checked={localConfig.tableOptions.detectHeaderRows}
                                    onCheckedChange={(checked) => handleConfigChange('tableOptions.detectHeaderRows', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="detectHeaderColumns">Detect Header Columns</Label>
                                <Switch
                                    id="detectHeaderColumns"
                                    checked={localConfig.tableOptions.detectHeaderColumns}
                                    onCheckedChange={(checked) => handleConfigChange('tableOptions.detectHeaderColumns', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="minConfidence">Minimum Confidence: {localConfig.tableOptions.minConfidence}%</Label>
                                </div>
                                <Slider
                                    id="minConfidence"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={[localConfig.tableOptions.minConfidence]}
                                    onValueChange={(value) => handleConfigChange('tableOptions.minConfidence', value[0])}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="includeRulings">Include Rulings</Label>
                                <Switch
                                    id="includeRulings"
                                    checked={localConfig.tableOptions.includeRulings}
                                    onCheckedChange={(checked) => handleConfigChange('tableOptions.includeRulings', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="extractSpans">Extract Spans</Label>
                                <Switch
                                    id="extractSpans"
                                    checked={localConfig.tableOptions.extractSpans}
                                    onCheckedChange={(checked) => handleConfigChange('tableOptions.extractSpans', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="mergeOverlappingCells">Merge Overlapping Cells</Label>
                                <Switch
                                    id="mergeOverlappingCells"
                                    checked={localConfig.tableOptions.mergeOverlappingCells}
                                    onCheckedChange={(checked) => handleConfigChange('tableOptions.mergeOverlappingCells', checked)}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="extraction" className="space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="outputFormat">Output Format</Label>
                                <Select
                                    value={localConfig.extractionOptions.outputFormat}
                                    onValueChange={(value) => handleConfigChange('extractionOptions.outputFormat', value)}
                                >
                                    <SelectTrigger id="outputFormat">
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="csv">CSV</SelectItem>
                                        <SelectItem value="json">JSON</SelectItem>
                                        <SelectItem value="excel">Excel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="includeConfidenceScores">Include Confidence Scores</Label>
                                <Switch
                                    id="includeConfidenceScores"
                                    checked={localConfig.extractionOptions.includeConfidenceScores}
                                    onCheckedChange={(checked) => handleConfigChange('extractionOptions.includeConfidenceScores', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="includeCoordinates">Include Coordinates</Label>
                                <Switch
                                    id="includeCoordinates"
                                    checked={localConfig.extractionOptions.includeCoordinates}
                                    onCheckedChange={(checked) => handleConfigChange('extractionOptions.includeCoordinates', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="normalizeWhitespace">Normalize Whitespace</Label>
                                <Switch
                                    id="normalizeWhitespace"
                                    checked={localConfig.extractionOptions.normalizeWhitespace}
                                    onCheckedChange={(checked) => handleConfigChange('extractionOptions.normalizeWhitespace', checked)}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Options
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 