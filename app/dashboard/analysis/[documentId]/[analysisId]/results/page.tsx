'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { TableAnalysisStepEnum } from '@/lib/enums';
import { findStepType } from '@/lib/utils/analysis';
import { getDocumentPageUrls } from '@/lib/utils/document';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TableDetectionResults from '@/components/analysis/results/table-detection-results';
import TableStructureResults from '@/components/analysis/results/table-structure-results';
import TableDataResults from '@/components/analysis/results/table-data-results';
import { TableDetectionOutput } from '@/types/results/table-detection';
import { TableStructureOutput } from '@/types/results/table-recognition';
import { TableDataOutput } from '@/types/results/table-data-extraction';

export const AnalysisResultsPage = () => {
    const params = useParams();
    const analysisId = params.analysisId as string;

    const {
        currentAnalysis,
        currentAnalysisType,
        isLoading: isLoadingAnalysis,
        error: analysisError,
        fetchAnalysis
    } = useAnalysisStore();

    const {
        currentDocument,
        currentPages,
        isLoading: isLoadingDocument,
        isPagesLoading,
        error: documentError,
        pagesError,
        fetchDocument,
        fetchDocumentPages
    } = useDocumentStore();

    useEffect(() => {
        if (analysisId) {
            fetchAnalysis(analysisId);
        }
    }, [analysisId, fetchAnalysis]);

    useEffect(() => {
        if (currentAnalysis?.document_id) {
            fetchDocument(currentAnalysis.document_id);
            fetchDocumentPages(currentAnalysis.document_id);
        }
    }, [currentAnalysis?.document_id, fetchDocument, fetchDocumentPages]);

    const isLoading = isLoadingAnalysis || isLoadingDocument || isPagesLoading;
    const error = analysisError || documentError || pagesError;

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-[200px]" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[400px] w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!currentAnalysis || !currentAnalysisType || !currentDocument || !currentPages) {
        return (
            <div className="container mx-auto py-6">
                <Alert>
                    <AlertDescription>No analysis results found.</AlertDescription>
                </Alert>
            </div>
        );
    }

    // Get page URLs for the document
    const pageUrls = getDocumentPageUrls(currentDocument, currentPages.pages);

    // Get results for each step
    const tableDetectionResult = currentAnalysis.step_results.find(
        result => findStepType(result.step_id, currentAnalysisType) === TableAnalysisStepEnum.TABLE_DETECTION
    )?.result as TableDetectionOutput | undefined;

    const tableStructureResult = currentAnalysis.step_results.find(
        result => findStepType(result.step_id, currentAnalysisType) === TableAnalysisStepEnum.TABLE_STRUCTURE_RECOGNITION
    )?.result as TableStructureOutput | undefined;

    const tableDataResult = currentAnalysis.step_results.find(
        result => findStepType(result.step_id, currentAnalysisType) === TableAnalysisStepEnum.TABLE_DATA_EXTRACTION
    )?.result as TableDataOutput | undefined;

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="detection" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="detection" disabled={!tableDetectionResult}>
                                Table Detection
                            </TabsTrigger>
                            <TabsTrigger value="structure" disabled={!tableStructureResult}>
                                Table Structure
                            </TabsTrigger>
                            <TabsTrigger value="data" disabled={!tableDataResult}>
                                Table Data
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="detection">
                            {tableDetectionResult ? (
                                <TableDetectionResults
                                    result={tableDetectionResult}
                                    pageUrls={pageUrls}
                                />
                            ) : (
                                <Alert>
                                    <AlertDescription>No table detection results available.</AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>

                        <TabsContent value="structure">
                            {tableStructureResult ? (
                                <TableStructureResults
                                    result={tableStructureResult}
                                    pageUrls={pageUrls}
                                />
                            ) : (
                                <Alert>
                                    <AlertDescription>No table structure results available.</AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>

                        <TabsContent value="data">
                            {tableDataResult ? (
                                <TableDataResults
                                    result={tableDataResult}
                                    pageUrls={pageUrls}
                                />
                            ) : (
                                <Alert>
                                    <AlertDescription>No table data results available.</AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalysisResultsPage;
