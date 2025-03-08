'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnalysisStatus } from '@/enums/analysis';
import { AnalysisStepInfo } from '@/types/analysis/configs';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
    AnalysisDashboardHeader,
    AnalysisMetricsContainer,
    AnalysisRecentTab,
    AnalysisTypesTab,
} from '@/components/analysis/home';

// Interfaces for algorithm accuracy data
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

interface AnalysisStep {
    id: string;
    name: string;
}

export default function AnalysisPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('recent');
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const {
        documents,
        fetchDocuments,
        isLoading: isLoadingDocuments
    } = useDocumentStore();

    const {
        analysisDefinitions,
        analyses,
        fetchAnalysisDefinitions,
        fetchUserAnalyses,
        isLoading: isLoadingAnalyses
    } = useAnalysisStore();

    // Convert analyses record to array for easier use in the UI
    const analysesArray = useMemo(() => Object.values(analyses), [analyses]);

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            setInitialLoading(true);
            try {
                await Promise.all([
                    fetchDocuments(),
                    fetchAnalysisDefinitions(),
                    fetchUserAnalyses()
                ]);
            } catch (error) {
                console.error('Error loading analysis data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load analysis data',
                    variant: 'destructive'
                });
            } finally {
                setInitialLoading(false);
            }
        };

        loadData();
    }, [fetchDocuments, fetchAnalysisDefinitions, fetchUserAnalyses, toast]);

    // Group analyses by document
    const analysesByDocument = useMemo(() => {
        return analysesArray.reduce<Record<string, any[]>>((acc, analysis) => {
            if (!acc[analysis.document_id]) {
                acc[analysis.document_id] = [];
            }
            acc[analysis.document_id].push(analysis);
            return acc;
        }, {});
    }, [analysesArray]);

    // Filter documents that have analyses
    const documentsWithAnalyses = useMemo(() => {
        return documents.filter(doc =>
            analysesByDocument[doc.id] && analysesByDocument[doc.id].length > 0
        );
    }, [documents, analysesByDocument]);

    // Handle refresh
    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchDocuments(true),
                fetchAnalysisDefinitions(),
                fetchUserAnalyses(undefined, true) // Force refresh analyses
            ]);
            toast({
                title: 'Updated',
                description: 'Data refreshed successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to refresh data',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Placeholder data for algorithm accuracy metrics
    const getAlgorithmAccuracyData = (analysisTypeId: string | null): StepAccuracyData[] => {
        if (!analysisTypeId) return [];

        // Find the selected analysis definition
        const selectedDefinition = analysisDefinitions.find(def => def.id === analysisTypeId);
        if (!selectedDefinition) return [];

        // Create placeholder steps since AnalysisDefinitionInfo might not have steps
        const placeholderSteps: AnalysisStep[] = [
            { id: 'step1', name: 'text_extraction' },
            { id: 'step2', name: 'entity_recognition' },
            { id: 'step3', name: 'data_validation' }
        ];

        // Generate placeholder accuracy data for each step
        return placeholderSteps.map((step: AnalysisStep) => ({
            stepId: step.id,
            stepName: step.name,
            algorithms: [
                {
                    name: `${step.name} Algorithm 1`,
                    accuracy: Math.round(70 + Math.random() * 25), // Random accuracy between 70-95%
                    userCorrections: Math.round(Math.random() * 100),
                    confidence: Math.round(65 + Math.random() * 30),
                },
                {
                    name: `${step.name} Algorithm 2`,
                    accuracy: Math.round(70 + Math.random() * 25),
                    userCorrections: Math.round(Math.random() * 100),
                    confidence: Math.round(65 + Math.random() * 30),
                }
            ]
        }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 pb-10"
        >
            {/* Header */}
            <AnalysisDashboardHeader
                isLoading={isLoading || initialLoading}
                onRefresh={handleRefresh}
            />

            {/* Metrics Section */}
            <AnalysisMetricsContainer
                documents={documents}
                analysesArray={analysesArray}
                analysisDefinitions={analysisDefinitions}
                getAlgorithmAccuracyData={getAlgorithmAccuracyData}
                isLoading={isLoading || initialLoading}
            />

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="bg-card rounded-lg shadow-sm border p-1">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="recent" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            Recent Analyses
                        </TabsTrigger>
                        <TabsTrigger value="new" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            Available Analysis
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Recent Analyses Tab */}
                <TabsContent value="recent">
                    <AnalysisRecentTab
                        documents={documents}
                        analysesByDocument={analysesByDocument}
                        documentsWithAnalyses={documentsWithAnalyses}
                        handleRefresh={handleRefresh}
                        isLoading={isLoading || initialLoading}
                    />
                </TabsContent>

                {/* New Analysis Tab */}
                <TabsContent value="new">
                    <AnalysisTypesTab
                        analysisDefinitions={analysisDefinitions}
                        isLoading={isLoading || initialLoading}
                    />
                </TabsContent>
            </Tabs>
        </motion.div>
    );
} 