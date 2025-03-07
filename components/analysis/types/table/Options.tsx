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
import { AnalysisRunConfig } from '@/types/analysis/base';

export function Options({ analysisId, documentId }: OptionsProps) {
    const {
        currentAnalysis,
        updateConfig,
        isLoading
    } = useAnalysisStore();

    // Initialize with default values
    const defaultConfig = {
        steps: {},
        notifications: {
            notify_on_completion: true,
            notify_on_failure: true
        },
        metadata: {
            tableOptions: {
                detectHeaderRows: true,
                detectHeaderColumns: true,
                minConfidence: 80,
                includeRulings: true,
                extractSpans: true,
                mergeOverlappingCells: true
            },
            extractionOptions: {
                outputFormat: 'csv',
                includeConfidenceScores: true,
                includeCoordinates: true,
                normalizeWhitespace: true
            }
        }
    };

    // Get the current config or use default
    const initialConfig = currentAnalysis?.config || defaultConfig;

    // Ensure metadata contains our expected structure
    if (!initialConfig.metadata.tableOptions) {
        initialConfig.metadata.tableOptions = defaultConfig.metadata.tableOptions;
    }

    if (!initialConfig.metadata.extractionOptions) {
        initialConfig.metadata.extractionOptions = defaultConfig.metadata.extractionOptions;
    }

    const [localConfig, setLocalConfig] = useState<AnalysisRunConfig>(initialConfig);
    const [activeTab, setActiveTab] = useState('detection');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentAnalysis?.config) {
            // Ensure the config has our expected structure
            const config = { ...currentAnalysis.config };

            if (!config.metadata.tableOptions) {
                config.metadata.tableOptions = defaultConfig.metadata.tableOptions;
            }

            if (!config.metadata.extractionOptions) {
                config.metadata.extractionOptions = defaultConfig.metadata.extractionOptions;
            }

            setLocalConfig(config);
        }
    }, [currentAnalysis]);

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

        // Handle nested paths like 'metadata.tableOptions.detectHeaderRows'
        const parts = path.split('.');
        let current: any = newConfig;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = value;
        setLocalConfig(newConfig);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateConfig({ config: localConfig });
        } catch (error) {
            console.error('Failed to save configuration:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Get the table options from metadata
    const tableOptions = localConfig.metadata.tableOptions || {};
    const extractionOptions = localConfig.metadata.extractionOptions || {};

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
                                    checked={tableOptions.detectHeaderRows}
                                    onCheckedChange={(checked) => handleConfigChange('metadata.tableOptions.detectHeaderRows', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="detectHeaderColumns">Detect Header Columns</Label>
                                <Switch
                                    id="detectHeaderColumns"
                                    checked={tableOptions.detectHeaderColumns}
                                    onCheckedChange={(checked) => handleConfigChange('metadata.tableOptions.detectHeaderColumns', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="minConfidence">Minimum Confidence: {tableOptions.minConfidence}%</Label>
                                </div>
                                <Slider
                                    id="minConfidence"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={[tableOptions.minConfidence]}
                                    onValueChange={(value) => handleConfigChange('metadata.tableOptions.minConfidence', value[0])}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="includeRulings">Include Rulings</Label>
                                <Switch
                                    id="includeRulings"
                                    checked={tableOptions.includeRulings}
                                    onCheckedChange={(checked) => handleConfigChange('metadata.tableOptions.includeRulings', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="extractSpans">Extract Spans</Label>
                                <Switch
                                    id="extractSpans"
                                    checked={tableOptions.extractSpans}
                                    onCheckedChange={(checked) => handleConfigChange('metadata.tableOptions.extractSpans', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="mergeOverlappingCells">Merge Overlapping Cells</Label>
                                <Switch
                                    id="mergeOverlappingCells"
                                    checked={tableOptions.mergeOverlappingCells}
                                    onCheckedChange={(checked) => handleConfigChange('metadata.tableOptions.mergeOverlappingCells', checked)}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="extraction" className="space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="outputFormat">Output Format</Label>
                                <Select
                                    value={extractionOptions.outputFormat}
                                    onValueChange={(value) => handleConfigChange('metadata.extractionOptions.outputFormat', value)}
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
                                    checked={extractionOptions.includeConfidenceScores}
                                    onCheckedChange={(checked) => handleConfigChange('metadata.extractionOptions.includeConfidenceScores', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="includeCoordinates">Include Coordinates</Label>
                                <Switch
                                    id="includeCoordinates"
                                    checked={extractionOptions.includeCoordinates}
                                    onCheckedChange={(checked) => handleConfigChange('metadata.extractionOptions.includeCoordinates', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="normalizeWhitespace">Normalize Whitespace</Label>
                                <Switch
                                    id="normalizeWhitespace"
                                    checked={extractionOptions.normalizeWhitespace}
                                    onCheckedChange={(checked) => handleConfigChange('metadata.extractionOptions.normalizeWhitespace', checked)}
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