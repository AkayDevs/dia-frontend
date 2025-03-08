import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecentAnalysisCard, AnalysisEmptyState } from '@/components/analysis';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AnalysisRunWithResults } from '@/types/analysis/base';

interface AnalysisRecentTabProps {
    documents: any[];
    analysesByDocument: Record<string, AnalysisRunWithResults[]>;
    documentsWithAnalyses: any[];
    handleRefresh: () => Promise<void>;
    isLoading?: boolean;
}

export function AnalysisRecentTab({
    documents,
    analysesByDocument,
    documentsWithAnalyses,
    handleRefresh,
    isLoading = false,
}: AnalysisRecentTabProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [documentFilter, setDocumentFilter] = useState<string | null>(null);

    // Get document types for filtering
    const documentTypes = Array.from(new Set(documents.map(doc => doc.type.toString())));

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

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9" disabled={isLoading}>
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                            {documentFilter && <Badge variant="secondary" className="ml-2">{documentFilter}</Badge>}
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
                                className="capitalize"
                            >
                                {type}
                                {documentFilter === type && <ChevronRight className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {isLoading ? (
                renderSkeletonCards()
            ) : documentsWithAnalyses.length > 0 ? (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {documentsWithAnalyses
                            .filter(doc => !documentFilter || doc.type.toString() === documentFilter)
                            .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((document, index) => (
                                <motion.div
                                    key={document.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <RecentAnalysisCard
                                        document={document}
                                        analyses={analysesByDocument[document.id]}
                                        onViewAnalysis={(analysisId) => router.push(`/dashboard/analysis/${analysisId}`)}
                                        onViewDocument={(documentId) => router.push(`/dashboard/documents/${documentId}`)}
                                    />
                                </motion.div>
                            ))}
                    </motion.div>
                </AnimatePresence>
            ) : (
                <AnalysisEmptyState
                    title="No analyses found"
                    description="You haven't run any analyses yet. Start a new analysis to extract insights from your documents."
                    actionLabel="Start New Analysis"
                    onAction={() => router.push('/dashboard/analysis/new')}
                    showRefresh
                    onRefresh={handleRefresh}
                />
            )}
        </div>
    );
} 