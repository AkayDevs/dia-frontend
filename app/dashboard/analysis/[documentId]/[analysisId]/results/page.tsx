'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import TableDetectionResults from '@/components/analysis/results/table-detection-results';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { TableDetectionStepResult, DetectedTable } from '@/types/analysis';

export const AnalysisResultsPage = () => {
    const params = useParams();
    const analysisId = params.analysisId as string;

    const {
        currentAnalysis,
        isLoading,
        error,
        fetchAnalysis
    } = useAnalysisStore();

    useEffect(() => {
        if (analysisId) {
            fetchAnalysis(analysisId);
        }
    }, [analysisId, fetchAnalysis]);

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

    if (!currentAnalysis) {
        return (
            <div className="container mx-auto py-6">
                <Alert>
                    <AlertDescription>No analysis results found.</AlertDescription>
                </Alert>
            </div>
        );
    }

    // Find the table detection step result
    const tableDetectionResult = currentAnalysis.step_results.find(
        (result): result is TableDetectionStepResult => result.step_type === 'table_detection'
    );

    if (!tableDetectionResult) {
        return (
            <div className="container mx-auto py-6">
                <Alert>
                    <AlertDescription>No table detection results available for this analysis.</AlertDescription>
                </Alert>
            </div>
        );
    }

    // Transform the backend result format to match the TableDetectionResults component props
    const transformedResult = {
        pageImage: tableDetectionResult.page_image_url,
        boundingBoxes: tableDetectionResult.detected_tables.map((table: DetectedTable) => ({
            id: table.id,
            x: table.bbox.x,
            y: table.bbox.y,
            width: table.bbox.width,
            height: table.bbox.height,
            details: table.metadata || 'No additional details available'
        }))
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Table Detection Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <TableDetectionResults result={transformedResult} />
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalysisResultsPage;
