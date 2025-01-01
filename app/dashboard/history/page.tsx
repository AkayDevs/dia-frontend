'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

interface Analysis {
    id: string;
    document: {
        id: string;
        name: string;
    };
    types: string[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: string;
    results?: any;
}

export default function HistoryPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

    useEffect(() => {
        fetchAnalyses();
    }, []);

    const fetchAnalyses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/documents/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analysis history');
            }

            const data = await response.json();
            setAnalyses(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch analysis history. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewResults = async (analysis: Analysis) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/documents/results/${analysis.document.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analysis results');
            }

            router.push(`/dashboard/results/${analysis.document.id}`);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch analysis results. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleRerunAnalysis = async (analysis: Analysis) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/documents/${analysis.document.id}/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    types: analysis.types
                })
            });

            if (!response.ok) {
                throw new Error('Failed to rerun analysis');
            }

            toast({
                description: "Analysis restarted successfully",
                duration: 3000,
            });

            fetchAnalyses();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to rerun analysis. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleExportResults = async (analysis: Analysis) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/documents/export`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    document_ids: [analysis.document.id],
                    format: 'pdf'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to export results');
            }

            const blob = await response.blob();
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
            toast({
                title: "Error",
                description: "Failed to export results. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteAnalysis = async (analysis: Analysis) => {
        setSelectedAnalysis(analysis);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedAnalysis) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/documents/${selectedAnalysis.document.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete analysis');
            }

            toast({
                description: "Analysis deleted successfully",
                duration: 3000,
            });

            fetchAnalyses();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete analysis. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedAnalysis(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'processing':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'processing':
                return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'failed':
                return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
        }
    };

    const filteredAnalyses = analyses.filter(analysis => {
        const matchesSearch = analysis.document.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || analysis.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
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

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search analyses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                                All
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                                Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('processing')}>
                                Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                                Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('failed')}>
                                Failed
                            </DropdownMenuItem>
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
                                    <div className="text-center py-8 text-muted-foreground">
                                        Loading analysis history...
                                    </div>
                                ) : filteredAnalyses.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No analysis records found
                                    </div>
                                ) : (
                                    filteredAnalyses.map((analysis) => (
                                        <motion.div
                                            key={analysis.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <h3 className="font-medium">
                                                            {analysis.document.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(new Date(analysis.createdAt), 'PPpp')}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {analysis.types.map((type) => (
                                                                <Badge
                                                                    key={type}
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {type.replace('_', ' ')}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`gap-1 ${getStatusColor(analysis.status)}`}
                                                    >
                                                        {getStatusIcon(analysis.status)}
                                                        {analysis.status}
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
                                                            disabled={analysis.status !== 'completed'}
                                                        >
                                                            <FileDown className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRerunAnalysis(analysis)}
                                                            title="Re-run Analysis"
                                                            disabled={analysis.status === 'processing'}
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
                                Are you sure you want to delete this analysis? This action cannot be undone.
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
        </DashboardLayout>
    );
} 