import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import {
    Search,
    Filter,
    ChevronRight,
    Calendar,
    Layers,
    FolderOpen,
    AlertCircle,
    FileText,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisEmptyState } from '@/components/analysis';
import { AnalysisOverviewCard } from './AnalysisOverviewCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AnalysisRunWithResults, AnalysisRunWithResultsInfo } from '@/types/analysis/base';
import { Document } from '@/types/document';
import { DocumentType } from '@/enums/document';
import { AnalysisStatus } from '@/enums/analysis';
import {
    ANALYSIS_STATUS_LABELS,
    ANALYSIS_STATUS_COLORS
} from '@/constants/analysis';
import { ANALYSIS_STATUS_ICONS } from '@/constants/icons';

import {
    getAnalysisName
} from '@/constants/analysis/registry';
import { formatDistanceToNow, format } from 'date-fns';
import { getDocumentTypeIcon, DOCUMENT_TYPE_ICONS } from '@/constants/icons';

type ViewMode = 'timeline' | 'document' | 'type';

interface AnalysisRecentTabProps {
    analyses: (AnalysisRunWithResultsInfo | AnalysisRunWithResults)[];
    documentsMap: Map<string, Document>;
    handleRefresh: () => Promise<void>;
    isLoading?: boolean;
}

interface TimelineCardProps {
    analysis: AnalysisRunWithResultsInfo;
    document: Document;
    onViewAnalysis: (analysisId: string) => void;
    onViewDocument: (documentId: string) => void;
}

// Timeline card component for the timeline view
const TimelineCard = ({
    analysis,
    document,
    onViewAnalysis,
    onViewDocument
}: TimelineCardProps) => {
    // Get status icon
    const getStatusIcon = (status: string | undefined) => {
        if (!status) return <AlertCircle className="h-4 w-4 text-gray-400" />;
        return ANALYSIS_STATUS_ICONS[status as keyof typeof ANALYSIS_STATUS_ICONS] ||
            <AlertCircle className="h-4 w-4 text-gray-400" />;
    };

    // Get status label
    const getStatusLabel = (status: string | undefined) => {
        if (!status) return 'Unknown';
        return ANALYSIS_STATUS_LABELS[status as keyof typeof ANALYSIS_STATUS_LABELS] ||
            'Unknown';
    };

    // Get status color class
    const getStatusColorClass = (status: string | undefined) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        return ANALYSIS_STATUS_COLORS[status as keyof typeof ANALYSIS_STATUS_COLORS] ||
            'bg-gray-100 text-gray-800';
    };

    // Get document type icon
    const documentTypeIcon = getDocumentTypeIcon(document.type.toString().toLowerCase());

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                        {documentTypeIcon}
                    </div>
                </div>

                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(analysis.status)}
                        <span className="text-sm font-medium">
                            {analysis.analysis_code
                                ? getAnalysisName(analysis.analysis_code).name
                                : 'Unknown Analysis'}
                        </span>
                        <Badge variant="outline" className={getStatusColorClass(analysis.status)}>
                            {getStatusLabel(analysis.status)}
                        </Badge>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <span className="mr-1.5">{documentTypeIcon}</span>
                        <span className="line-clamp-1">{document.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                        </span>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => onViewDocument(document.id)}
                            >
                                View Document
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => analysis.id && onViewAnalysis(analysis.id)}
                            >
                                View Analysis
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export function AnalysisRecentTab({
    analyses,
    documentsMap,
    handleRefresh,
    isLoading = false,
}: AnalysisRecentTabProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [documentFilter, setDocumentFilter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');

    // Get document types for filtering from the DocumentType enum
    const documentTypes = Object.values(DocumentType);

    // Filter analyses based on search query and document filter
    const filteredAnalyses = analyses.filter(analysis => {
        const document = documentsMap.get(analysis.document_id);
        const matchesDocumentFilter = !documentFilter ||
            (document && document.type.toString() === documentFilter);
        const matchesSearchQuery = !searchQuery ||
            (document && document.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (analysis.analysis_code && analysis.analysis_code.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesDocumentFilter && matchesSearchQuery;
    });

    // Group analyses by document
    const analysesByDocument: Record<string, AnalysisRunWithResultsInfo[]> = {};
    filteredAnalyses.forEach(analysis => {
        if (!analysesByDocument[analysis.document_id]) {
            analysesByDocument[analysis.document_id] = [];
        }
        analysesByDocument[analysis.document_id].push(analysis as AnalysisRunWithResultsInfo);
    });

    // Group analyses by analysis type
    const analysesByType: Record<string, AnalysisRunWithResultsInfo[]> = {};
    filteredAnalyses.forEach(analysis => {
        const type = analysis.analysis_code || 'unknown';
        if (!analysesByType[type]) {
            analysesByType[type] = [];
        }
        analysesByType[type].push(analysis as AnalysisRunWithResultsInfo);
    });

    // Handle navigation to analysis or document
    const handleViewAnalysis = (analysisId: string) => {
        // Check if this is a new analysis request
        if (analysisId.startsWith('new?')) {
            router.push(`/dashboard/analysis/${analysisId}`);
        } else {
            router.push(`/dashboard/analysis/${analysisId}`);
        }
    };

    const handleViewDocument = (documentId: string) => {
        router.push(`/dashboard/documents/${documentId}`);
    };

    // Render skeleton cards for loading state
    const renderSkeletonCards = () => {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex gap-2 mt-4">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render timeline view (all analyses chronologically)
    const renderTimelineView = () => {
        if (filteredAnalyses.length === 0) {
            return (
                <div className="text-center py-8 border rounded-lg bg-muted/20">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No analyses match your filter</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Try changing your search query or document filter
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {filteredAnalyses.map((analysis) => {
                    const document = documentsMap.get(analysis.document_id);
                    if (!document) return null;

                    return (
                        <div key={analysis.id || `analysis-${Math.random()}`} className="h-auto">
                            <TimelineCard
                                analysis={analysis as AnalysisRunWithResultsInfo}
                                document={document}
                                onViewAnalysis={handleViewAnalysis}
                                onViewDocument={handleViewDocument}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render document view (analyses grouped by document)
    const renderDocumentView = () => {
        const documentIds = Object.keys(analysesByDocument);

        if (documentIds.length === 0) {
            return (
                <div className="text-center py-8 border rounded-lg bg-muted/20">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No documents match your filter</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Try changing your search query or document filter
                    </p>
                </div>
            );
        }

        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {documentIds.map((documentId) => {
                    const document = documentsMap.get(documentId);
                    const documentAnalyses = analysesByDocument[documentId] || [];

                    if (!document) return null;

                    return (
                        <div key={documentId} className="h-full">
                            <AnalysisOverviewCard
                                document={document}
                                analyses={documentAnalyses}
                                onViewAnalysis={handleViewAnalysis}
                                onViewDocument={handleViewDocument}
                                variant="modern"
                                groupBy="document"
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render analysis type view (analyses grouped by type)
    const renderAnalysisTypeView = () => {
        const analysisTypes = Object.keys(analysesByType);

        if (analysisTypes.length === 0) {
            return (
                <div className="text-center py-8 border rounded-lg bg-muted/20">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No analysis types match your filter</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Try changing your search query or document filter
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {analysisTypes.map((analysisType) => {
                    const typeAnalyses = analysesByType[analysisType] || [];

                    // Skip if no analyses for this type
                    if (typeAnalyses.length === 0) return null;

                    // Get the first document for this analysis type
                    const firstAnalysis = typeAnalyses[0];
                    const document = documentsMap.get(firstAnalysis.document_id);

                    if (!document) return null;

                    // Get analysis definition name
                    const analysisName = getAnalysisName(analysisType);

                    return (
                        <div key={analysisType} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium flex items-center">
                                    <span className="mr-2">{analysisName.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {typeAnalyses.length} runs
                                    </Badge>
                                </h3>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {typeAnalyses.slice(0, 6).map((analysis) => {
                                    const doc = documentsMap.get(analysis.document_id);
                                    if (!doc) return null;

                                    return (
                                        <div key={analysis.id || `analysis-${Math.random()}`}>
                                            <AnalysisOverviewCard
                                                document={doc}
                                                analyses={[analysis]}
                                                onViewAnalysis={handleViewAnalysis}
                                                onViewDocument={handleViewDocument}
                                                variant="compact"
                                                groupBy="analysis_definition"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {typeAnalyses.length > 6 && (
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs text-muted-foreground"
                                    onClick={() => setSearchQuery(analysisType)}
                                >
                                    View all {typeAnalyses.length} analyses
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render the current view based on viewMode
    const renderCurrentView = () => {
        if (isLoading) {
            return renderSkeletonCards();
        }

        if (analyses.length === 0) {
            return (
                <AnalysisEmptyState
                    title="No analyses found"
                    description="You haven't run any analyses yet. Start a new analysis to extract insights from your documents."
                    actionLabel="Start New Analysis"
                    onAction={() => router.push('/dashboard/analysis/new')}
                    showRefresh
                    onRefresh={handleRefresh}
                />
            );
        }

        switch (viewMode) {
            case 'timeline':
                return renderTimelineView();
            case 'document':
                return renderDocumentView();
            case 'type':
                return renderAnalysisTypeView();
            default:
                return renderTimelineView();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search analyses..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9" disabled={isLoading}>
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                                {documentFilter && (
                                    <Badge variant="secondary" className="ml-2 flex items-center gap-1">
                                        <span className="flex items-center">
                                            {getDocumentTypeIcon(documentFilter.toLowerCase())}
                                        </span>
                                        <span>{documentFilter}</span>
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => setDocumentFilter(null)}>
                                All document types
                            </DropdownMenuItem>
                            <Separator className="my-1" />
                            {documentTypes.map((type) => (
                                <DropdownMenuItem
                                    key={type}
                                    onClick={() => setDocumentFilter(type)}
                                    className="capitalize flex items-center"
                                >
                                    <span className="mr-2">
                                        {getDocumentTypeIcon(type.toLowerCase())}
                                    </span>
                                    <span>{type}</span>
                                    {documentFilter === type && <ChevronRight className="ml-auto h-4 w-4" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* View Selector */}
            <div className="flex justify-center">
                <div className="inline-flex items-center bg-muted/30 p-1 rounded-lg">
                    <Button
                        variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('timeline')}
                        className={`gap-1.5 ${viewMode === 'timeline' ? 'shadow-sm' : 'hover:bg-muted/50'}`}
                    >
                        <Calendar className="h-4 w-4" />
                        <span>Timeline</span>
                    </Button>
                    <Button
                        variant={viewMode === 'document' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('document')}
                        className={`gap-1.5 ${viewMode === 'document' ? 'shadow-sm' : 'hover:bg-muted/50'}`}
                    >
                        <FolderOpen className="h-4 w-4" />
                        <span>By Document</span>
                    </Button>
                    <Button
                        variant={viewMode === 'type' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('type')}
                        className={`gap-1.5 ${viewMode === 'type' ? 'shadow-sm' : 'hover:bg-muted/50'}`}
                    >
                        <Layers className="h-4 w-4" />
                        <span>By Type</span>
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderCurrentView()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
} 