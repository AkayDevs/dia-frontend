import { ReactElement } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
    TableIcon,
    FileSearch,
    RefreshCw,
    Download,
    XCircle,
    Clock,
    CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnalysisResult, AnalysisType, AnalysisStatus } from '@/services/analysis.service';

interface AnalysisResultWithTables {
    tables: Array<{
        page_number: number;
        confidence: number;
    }>;
}

interface AnalysisResultWithText {
    text: string;
}

interface AnalysisResultCardProps {
    analysis: AnalysisResult;
    documentName?: string;
    analysisTypeName?: string;
}

export function AnalysisResultCard({ analysis, documentName, analysisTypeName }: AnalysisResultCardProps) {
    const renderResult = (): ReactElement | null => {
        if (!analysis.result) return null;

        switch (analysis.analysis_type) {
            case AnalysisType.TABLE_DETECTION: {
                const result = analysis.result as AnalysisResultWithTables;
                if (!result.tables) return null;
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Detected Tables</h4>
                            <Badge variant="outline">{result.tables.length} tables found</Badge>
                        </div>
                        {result.tables.map((table, index) => (
                            <Card key={index} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">Table {index + 1}</h5>
                                    <Badge variant="secondary">
                                        Page {table.page_number}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Confidence: {(table.confidence * 100).toFixed(1)}%
                                </p>
                            </Card>
                        ))}
                    </div>
                );
            }

            case AnalysisType.TEXT_EXTRACTION: {
                const result = analysis.result as AnalysisResultWithText;
                if (!result.text || !documentName) return null;
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Extracted Text</h4>
                            <Button variant="outline" size="sm" onClick={() => {
                                const blob = new Blob([result.text], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const link = window.document.createElement('a');
                                link.href = url;
                                link.download = `${documentName}_text.txt`;
                                window.document.body.appendChild(link);
                                link.click();
                                window.document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                            }}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Text
                            </Button>
                        </div>
                        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                            <pre className="text-sm whitespace-pre-wrap">{result.text}</pre>
                        </ScrollArea>
                    </div>
                );
            }

            default:
                return (
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(analysis.result, null, 2)}
                    </pre>
                );
        }
    };

    const getStatusBadge = (status: AnalysisStatus): ReactElement => {
        const variants: Record<AnalysisStatus, { color: string; icon: ReactElement }> = {
            [AnalysisStatus.COMPLETED]: {
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                icon: <CheckCircle className="w-3 h-3 mr-1" />
            },
            [AnalysisStatus.PROCESSING]: {
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                icon: <Clock className="w-3 h-3 mr-1 animate-spin" />
            },
            [AnalysisStatus.FAILED]: {
                color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                icon: <XCircle className="w-3 h-3 mr-1" />
            },
            [AnalysisStatus.PENDING]: {
                color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                icon: <Clock className="w-3 h-3 mr-1" />
            }
        };

        const { color, icon } = variants[status];
        return (
            <Badge variant="secondary" className={`gap-1 ${color}`}>
                {icon}
                {status.toLowerCase()}
            </Badge>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                {analysis.analysis_type === AnalysisType.TABLE_DETECTION ? (
                                    <TableIcon className="h-5 w-5 text-primary" />
                                ) : (
                                    <FileSearch className="h-5 w-5 text-primary" />
                                )}
                                {analysisTypeName || analysis.analysis_type}
                            </CardTitle>
                            <CardDescription>
                                Started {format(new Date(analysis.created_at), 'MMM d, yyyy HH:mm')}
                            </CardDescription>
                        </div>
                        {getStatusBadge(analysis.status)}
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {analysis.status === AnalysisStatus.COMPLETED ? (
                        renderResult()
                    ) : analysis.status === AnalysisStatus.FAILED ? (
                        <Alert variant="destructive">
                            <AlertDescription>{analysis.error || 'Analysis failed'}</AlertDescription>
                        </Alert>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground mt-4">Analysis in progress...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
} 