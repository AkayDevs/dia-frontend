import { useMemo } from 'react';
import { Document, DocumentWithAnalysis } from '@/types/document';
import { AnalysisRunWithResults, StepResultResponse } from '@/types/analysis/base';
import { AnalysisDefinitionInfo } from '@/types/analysis/configs';
import { AnalysisStatus, AnalysisDefinitionCode } from '@/enums/analysis';

/**
 * Represents an ongoing analysis for the dashboard
 */
export interface OngoingAnalysis {
    documentName: string;
    displayName: string;
    startedAt: string;
}

/**
 * Extends AnalysisRunWithResults to include a user-friendly display name
 */
export interface DashboardAnalysis extends AnalysisRunWithResults {
    // User-friendly display name of the analysis
    displayName: string;
}

/**
 * Analysis type statistics
 */
export interface AnalysisTypeStats {
    displayName: string;
    code: string;
    count: number;
    documentCount: number;
}

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
    // Document stats
    totalDocuments: number;
    analyzedDocuments: number;
    failedAnalyses: number;

    // Analysis stats
    totalAnalyses: number;
    analysisSuccessRate: number;
    ongoingAnalyses: {
        count: number;
        items: OngoingAnalysis[];
    };
    mostUsedAnalysisType: AnalysisTypeStats;
    analysisTypes: AnalysisTypeStats[];
    averageAnalysisTime: number; // in minutes
    analyses: DashboardAnalysis[];
}

/**
 * Initial empty stats
 */
export const initialStats: DashboardStats = {
    totalDocuments: 0,
    analyzedDocuments: 0,
    failedAnalyses: 0,
    totalAnalyses: 0,
    analysisSuccessRate: 0,
    ongoingAnalyses: {
        count: 0,
        items: []
    },
    mostUsedAnalysisType: {
        displayName: '',
        code: '',
        count: 0,
        documentCount: 0
    },
    analysisTypes: [],
    averageAnalysisTime: 0,
    analyses: []
};

/**
 * Converts an analysis code to a user-friendly display name
 * Example: "table_analysis" -> "Table Analysis"
 */
function getDisplayNameFromCode(code: string): string {
    return code
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Hook to calculate dashboard statistics from documents and analyses
 */
export function useDashboardStats(
    documents: Document[],
    analyses: AnalysisRunWithResults[],
    analysisDefinitions: AnalysisDefinitionInfo[]
): DashboardStats {
    return useMemo((): DashboardStats => {
        if (!Array.isArray(documents) || !Array.isArray(analyses)) {
            return initialStats;
        }

        // Initialize stats with document count
        const stats: DashboardStats = {
            ...initialStats,
            totalDocuments: documents.length
        };

        // Track unique document-analysis combinations
        const analyzedDocumentMap = new Map<string, Set<string>>();
        const analysisTypeMap = new Map<string, AnalysisTypeStats & { successCount: number }>();

        // Process all analyses
        analyses.forEach(analysis => {
            const { document_id, analysis_code, status } = analysis;

            // Find the analysis definition
            const analysisDefinition = analysisDefinitions?.find(def => def.code === analysis_code);
            const displayName = analysisDefinition?.name || getDisplayNameFromCode(analysis_code);

            // Add to analyses array with display name
            stats.analyses.push({
                ...analysis,
                displayName
            });

            // Track analysis type statistics
            if (!analysisTypeMap.has(analysis_code)) {
                analysisTypeMap.set(analysis_code, {
                    displayName,
                    code: analysis_code,
                    count: 0,
                    documentCount: 0,
                    successCount: 0
                });
            }

            const typeStats = analysisTypeMap.get(analysis_code)!;
            typeStats.count++;

            // Track unique document-analysis combinations
            if (!analyzedDocumentMap.has(document_id)) {
                analyzedDocumentMap.set(document_id, new Set());
            }

            const documentAnalyses = analyzedDocumentMap.get(document_id)!;

            // Only count each document once per analysis type
            if (!documentAnalyses.has(analysis_code) && status === AnalysisStatus.COMPLETED) {
                documentAnalyses.add(analysis_code);
                typeStats.documentCount++;
            }

            // Track success rate
            if (status === AnalysisStatus.COMPLETED) {
                typeStats.successCount++;
            }

            // Track ongoing analyses
            if (status === AnalysisStatus.PENDING || status === AnalysisStatus.IN_PROGRESS) {
                const document = documents.find(doc => doc.id === document_id);
                if (document) {
                    stats.ongoingAnalyses.items.push({
                        documentName: document.name,
                        displayName,
                        startedAt: analysis.started_at || analysis.created_at
                    });
                }
            }
        });

        // Update ongoing analyses count
        stats.ongoingAnalyses.count = analyses.filter(
            a => a.status === AnalysisStatus.PENDING || a.status === AnalysisStatus.IN_PROGRESS
        ).length;

        // Calculate total unique analyzed documents
        stats.analyzedDocuments = Array.from(analyzedDocumentMap.values())
            .filter(set => set.size > 0)
            .length;

        // Calculate failed analyses
        stats.failedAnalyses = analyses.filter(a => a.status === AnalysisStatus.FAILED).length;

        // Calculate total analyses
        stats.totalAnalyses = analyses.length;

        // Convert analysis type map to array and find most used type
        stats.analysisTypes = Array.from(analysisTypeMap.values()).map(typeStats => ({
            displayName: typeStats.displayName,
            code: typeStats.code,
            count: typeStats.count,
            documentCount: typeStats.documentCount
        }));

        if (stats.analysisTypes.length > 0) {
            // Find most used analysis type by document count
            stats.mostUsedAnalysisType = stats.analysisTypes.reduce((prev, current) =>
                current.documentCount > prev.documentCount ? current : prev,
                { displayName: '', code: '', count: 0, documentCount: 0 } as AnalysisTypeStats
            );
        }

        // Calculate success rate across all analyses
        const successfulAnalyses = analyses.filter(a => a.status === AnalysisStatus.COMPLETED).length;
        if (stats.totalAnalyses > 0) {
            stats.analysisSuccessRate = (successfulAnalyses / stats.totalAnalyses) * 100;
        }

        // Calculate average duration for completed analyses
        const completedAnalyses = analyses.filter(a =>
            a.status === AnalysisStatus.COMPLETED &&
            a.completed_at &&
            a.started_at
        );

        if (completedAnalyses.length > 0) {
            const totalDuration = completedAnalyses.reduce((total, analysis) => {
                // Use started_at if available, otherwise fall back to created_at
                const startTime = new Date(analysis.started_at || analysis.created_at).getTime();
                const endTime = new Date(analysis.completed_at!).getTime();
                return total + ((endTime - startTime) / (1000 * 60)); // Convert to minutes
            }, 0);
            stats.averageAnalysisTime = totalDuration / completedAnalyses.length;
        }

        return stats;
    }, [documents, analyses, analysisDefinitions]);
} 