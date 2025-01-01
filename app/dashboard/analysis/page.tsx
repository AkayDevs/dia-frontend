'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
    FileText,
    Upload,
    Table as TableIcon,
    FileSearch,
    FileStack,
    Clock,
    CheckCircle,
    XCircle,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { Document } from '@/types/document';
import { UploadHandler } from '@/components/ui/upload-handler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

interface AnalysisParameters {
    available_types: string[];
    parameters: {
        [key: string]: {
            [key: string]: {
                type: string;
                min?: number;
                max?: number;
                default: any;
                options?: string[];
            };
        };
    };
}

export default function AnalysisPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
    const [parameters, setParameters] = useState<AnalysisParameters | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('upload');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Fetch documents
                const docsResponse = await fetch(`${API_URL}${API_VERSION}/documents/list`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Fetch analysis parameters
                const paramsResponse = await fetch(`${API_URL}${API_VERSION}/documents/parameters`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Fetch recent analyses
                const analysesResponse = await fetch(`${API_URL}${API_VERSION}/documents/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!docsResponse.ok || !paramsResponse.ok || !analysesResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [docsData, paramsData, analysesData] = await Promise.all([
                    docsResponse.json(),
                    paramsResponse.json(),
                    analysesResponse.json()
                ]);

                setDocuments(docsData);
                setParameters(paramsData);
                setRecentAnalyses(analysesData);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch data. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toast]);

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

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Analysis</h1>
                        <p className="text-muted-foreground mt-2">
                            Upload and analyze your documents with AI
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="upload" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Upload
                        </TabsTrigger>
                        <TabsTrigger value="recent" className="gap-2">
                            <FileStack className="h-4 w-4" />
                            Recent
                        </TabsTrigger>
                        <TabsTrigger value="capabilities" className="gap-2">
                            <FileSearch className="h-4 w-4" />
                            Capabilities
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Document</CardTitle>
                                <CardDescription>
                                    Upload a document to start the analysis process
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {uploadError && (
                                    <Alert variant="destructive" className="mb-6">
                                        <AlertDescription>{uploadError}</AlertDescription>
                                    </Alert>
                                )}
                                <UploadHandler
                                    onSuccess={() => setUploadError(null)}
                                    onError={(error) => setUploadError(error.message)}
                                    className="h-[300px]"
                                />
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TableIcon className="h-5 w-5" />
                                        Table Detection
                                    </CardTitle>
                                    <CardDescription>
                                        Automatically detect and extract tables from documents
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium mb-1">Accuracy</div>
                                                <Progress value={95} className="h-2" />
                                            </div>
                                            <div className="text-sm font-medium">95%</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium mb-1">Speed</div>
                                                <Progress value={85} className="h-2" />
                                            </div>
                                            <div className="text-sm font-medium">85%</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileSearch className="h-5 w-5" />
                                        Text Extraction
                                    </CardTitle>
                                    <CardDescription>
                                        Extract and process text with high accuracy
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium mb-1">Accuracy</div>
                                                <Progress value={98} className="h-2" />
                                            </div>
                                            <div className="text-sm font-medium">98%</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium mb-1">Speed</div>
                                                <Progress value={90} className="h-2" />
                                            </div>
                                            <div className="text-sm font-medium">90%</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="recent">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Analyses</CardTitle>
                                <CardDescription>
                                    View and manage your recent document analyses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px] pr-4">
                                    <div className="space-y-4">
                                        {isLoading ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                Loading analyses...
                                            </div>
                                        ) : recentAnalyses.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No recent analyses found
                                            </div>
                                        ) : (
                                            recentAnalyses.map((analysis) => (
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
                                                                <h3 className="font-medium">{analysis.document.name}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {format(new Date(analysis.createdAt), 'MMM d, yyyy')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Badge variant="secondary" className="gap-1">
                                                                {getStatusIcon(analysis.status)}
                                                                {analysis.status}
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => router.push(`/dashboard/analysis/${analysis.document.id}`)}
                                                            >
                                                                <ArrowRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="capabilities">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analysis Capabilities</CardTitle>
                                <CardDescription>
                                    Available analysis types and their parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {parameters ? (
                                    <div className="space-y-6">
                                        {parameters.available_types.map((type) => (
                                            <div key={type} className="space-y-4">
                                                <h3 className="text-lg font-semibold capitalize">
                                                    {type.replace('_', ' ')}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {Object.entries(parameters.parameters[type] || {}).map(([param, config]) => (
                                                        <div key={param} className="p-4 rounded-lg border bg-card">
                                                            <h4 className="font-medium capitalize mb-2">
                                                                {param.replace('_', ' ')}
                                                            </h4>
                                                            <div className="text-sm text-muted-foreground space-y-1">
                                                                <p>Type: {config.type}</p>
                                                                {config.min !== undefined && (
                                                                    <p>Min: {config.min}</p>
                                                                )}
                                                                {config.max !== undefined && (
                                                                    <p>Max: {config.max}</p>
                                                                )}
                                                                <p>Default: {config.default.toString()}</p>
                                                                {config.options && (
                                                                    <p>Options: {config.options.join(', ')}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Separator className="my-6" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Loading capabilities...
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
} 