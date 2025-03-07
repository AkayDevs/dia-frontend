import { useMemo } from 'react';
import { Document, DocumentWithAnalysis } from '@/types/document';
import { AnalysisRunWithResults } from '@/types/analysis/base';
import { AnalysisDefinitionInfo } from '@/types/analysis/configs';
import { AnalysisStatus } from '@/enums/analysis';

export interface OngoingAnalysis {
    documentName: string;
    type: string;
    startedAt: string;
}

export interface DashboardAnalysis extends AnalysisRunWithResults {
    type: string;
}

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
    mostUsedAnalysisType: {
        type: string;
        count: number;
    };
    averageAnalysisTime: number;
    analyses: DashboardAnalysis[];
}

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
        type: '',
        count: 0
    },
    averageAnalysisTime: 0,
    analyses: []
};

export function useDashboardStats(
    documents: Document[],
    analyses: AnalysisRunWithResults[],
    analysisDefinitions: AnalysisDefinitionInfo[]
): DashboardStats {
    return useMemo((): DashboardStats => {
        if (!Array.isArray(documents) || !Array.isArray(analyses)) {
            return initialStats;
        }

        const typedDocuments = documents as Array<DocumentWithAnalysis>;

        // Calculate document-related stats
        const docStats = typedDocuments.reduce((stats, doc) => {
            stats.totalDocuments += 1;
            if (doc.analyses?.some(a => a.status === AnalysisStatus.COMPLETED)) {
                stats.analyzedDocuments += 1;
            }
            if (doc.analyses?.some(a => a.status === AnalysisStatus.FAILED)) {
                stats.failedAnalyses += 1;
            }
            return stats;
        }, { ...initialStats });

        // Calculate analysis-related stats
        const analysisStats = analyses.reduce((stats, analysis) => {
            stats.totalAnalyses += 1;
            const analysisDefinition = analysisDefinitions?.find(def => def.code === analysis.analysis_code);

            // Add analysis with type information
            if (analysisDefinition) {
                stats.analyses.push({
                    ...analysis,
                    type: analysisDefinition.name
                });
            }

            // Calculate success rate
            if (analysis.status === AnalysisStatus.COMPLETED) {
                stats.analysisSuccessRate += 1;
            } else if (analysis.status === AnalysisStatus.FAILED) {
                stats.failedAnalyses += 1;
            }

            // Track ongoing analyses
            if (analysis.status === AnalysisStatus.IN_PROGRESS) {
                const document = typedDocuments.find(doc => doc.id === analysis.document_id);
                if (document && analysisDefinition) {
                    stats.ongoingAnalyses.items.push({
                        documentName: document.name,
                        type: analysisDefinition.name,
                        startedAt: analysis.created_at
                    });
                }
            }

            // Update ongoing analyses count to match the actual in-progress analyses
            stats.ongoingAnalyses.count = analyses.filter(a => a.status === AnalysisStatus.IN_PROGRESS).length;

            // Track analysis types usage
            if (analysisDefinition) {
                const currentTypeCount = analyses.filter(a => a.analysis_code === analysis.analysis_code).length;
                if (currentTypeCount > stats.mostUsedAnalysisType.count) {
                    stats.mostUsedAnalysisType = {
                        type: analysisDefinition.name,
                        count: currentTypeCount
                    };
                }
            }

            return stats;
        }, docStats);

        // Calculate average duration for completed analyses
        const completedAnalyses = analyses.filter(a =>
            a.status === AnalysisStatus.COMPLETED &&
            a.completed_at &&
            a.created_at
        );

        if (completedAnalyses.length > 0) {
            const totalDuration = completedAnalyses.reduce((total, analysis) => {
                const startTime = new Date(analysis.created_at).getTime();
                const endTime = new Date(analysis.completed_at!).getTime();
                return total + ((endTime - startTime) / (1000 * 60)); // Convert to minutes
            }, 0);
            analysisStats.averageAnalysisTime = totalDuration / completedAnalyses.length;
        }

        // Finalize success rate calculation
        if (analysisStats.totalAnalyses > 0) {
            analysisStats.analysisSuccessRate = (analysisStats.analysisSuccessRate / analysisStats.totalAnalyses) * 100;
        }

        return analysisStats;
    }, [documents, analyses, analysisDefinitions]);
} 