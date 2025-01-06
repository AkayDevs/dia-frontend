'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
    Eye,
    RotateCw,
    Trash2,
    FileDown,
    Search,
    Filter,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Document, AnalysisStatus, documentService } from '@/services/document.service';
import { analysisService, AnalysisResult, AnalysisType } from '@/services/analysis.service';
import { useAuthStore } from '@/store/useAuthStore';

interface AnalysisHistoryItem {
    id: string;
    document: Document;
    type: AnalysisType;
    status: AnalysisStatus;
    created_at: string;
    results?: Record<string, any>;
}

export default function HistoryPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { logout } = useAuthStore();
    const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<AnalysisStatus | 'ALL'>('ALL');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null);

    useEffect(() => {
        fetchAnalyses();
    }, []);

    const fetchAnalyses = async () => {
        try {
            setIsLoading(true);
            const data = await analysisService.getAnalysisHistory();
            setAnalyses(data);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch analysis history';

            // Handle authentication errors
            if (message.includes('Could not validate credentials') ||
                message.includes('No authentication token found')) {
                logout();
                router.push('/login');
                toast({
                    title: "Session Expired",
                    description: "Please log in again to continue.",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewResults = async (analysis: AnalysisHistoryItem) => {
        router.push(`/dashboard/analysis/${analysis.document.id}/results`);
    };

    const handleRerunAnalysis = async (analysis: AnalysisHistoryItem) => {
        try {
            await analysisService.startAnalysis(
                analysis.document.id,
                analysis.type,
                {}
            );

            toast({
                description: "Analysis restarted successfully",
                duration: 3000,
            });

            fetchAnalyses();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to rerun analysis';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleExportResults = async (analysis: AnalysisHistoryItem) => {
        try {
            const blob = await analysisService.exportAnalysisResults(analysis.document.id, 'pdf');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analysis-${analysis.document.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                description: "Results exported successfully",
                duration: 3000,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to export results';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteAnalysis = (analysis: AnalysisHistoryItem) => {
        setSelectedAnalysis(analysis);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedAnalysis) return;

        try {
            await documentService.deleteDocument(selectedAnalysis.document.id);

            toast({
                description: "Analysis deleted successfully",
                duration: 3000,
            });

            fetchAnalyses();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete analysis';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedAnalysis(null);
        }
    };

    const getStatusIcon = (status: AnalysisStatus) => {
        switch (status) {
            case AnalysisStatus.COMPLETED:
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case AnalysisStatus.PROCESSING:
                return <Clock className="h-4 w-4 text-blue-500" />;
            case AnalysisStatus.FAILED:
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: AnalysisStatus) => {
        switch (status) {
            case AnalysisStatus.COMPLETED:
                return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case AnalysisStatus.PROCESSING:
                return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case AnalysisStatus.FAILED:
                return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
        }
    };

    const filteredAnalyses = analyses.filter(analysis => {
        const matchesSearch = analysis.document.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || analysis.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
                    <p className="text-muted-foreground mt-2">
                        View and manage your document analysis history
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={fetchAnalyses}
                >
                    <RotateCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by document name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 w-full md:w-auto">
                            <Filter className="h-4 w-4" />
                            {statusFilter === 'ALL' ? 'All Status' : statusFilter.toLowerCase()}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem onClick={() => setStatusFilter('ALL')}>
                            All Status
                        </DropdownMenuItem>
                        {Object.values(AnalysisStatus).map((status) => (
                            <DropdownMenuItem
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className="capitalize"
                            >
                                {status.toLowerCase()}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Analysis Records</CardTitle>
                    <CardDescription>
                        View, manage, and export your analysis results
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <RotateCw className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : filteredAnalyses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                    <p className="text-lg font-medium">No analysis records found</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {searchQuery || statusFilter !== 'ALL'
                                            ? 'Try adjusting your search or filters'
                                            : 'Start by analyzing some documents'}
                                    </p>
                                    {!searchQuery && statusFilter === 'ALL' && (
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => router.push('/dashboard/analysis')}
                                        >
                                            Start Analysis
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                filteredAnalyses.map((analysis) => (
                                    <motion.div
                                        key={analysis.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10 mt-1">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">
                                                        {analysis.document.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(analysis.created_at), 'PPpp')}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="mt-2 text-xs capitalize"
                                                    >
                                                        {analysis.type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge
                                                    variant="secondary"
                                                    className={`gap-1 capitalize ${getStatusColor(analysis.status)}`}
                                                >
                                                    {getStatusIcon(analysis.status)}
                                                    {analysis.status.toLowerCase()}
                                                </Badge>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewResults(analysis)}
                                                        title="View Results"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleExportResults(analysis)}
                                                        title="Export Results"
                                                        disabled={analysis.status !== AnalysisStatus.COMPLETED}
                                                    >
                                                        <FileDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRerunAnalysis(analysis)}
                                                        title="Re-run Analysis"
                                                        disabled={analysis.status === AnalysisStatus.PROCESSING}
                                                    >
                                                        <RotateCw className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteAnalysis(analysis)}
                                                        title="Delete Analysis"
                                                        className="text-destructive hover:text-destructive/90"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this analysis? This action cannot be undone
                            and will also delete the associated document.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 