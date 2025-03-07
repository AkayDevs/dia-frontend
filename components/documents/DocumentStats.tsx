import { Document } from '@/types/document';
import { AnalysisStatus } from '@/enums/analysis';
import { DocumentType } from '@/enums/document';
import { Card, CardContent } from '@/components/ui/card';
import {
    DocumentIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface DocumentStatsProps {
    documents: Document[];
    documentAnalysisStatus: Map<string, AnalysisStatus>;
}

export const DocumentStats = ({ documents, documentAnalysisStatus }: DocumentStatsProps) => {
    // Calculate stats
    const totalDocuments = documents.length;
    const analyzedDocuments = documents.filter(doc =>
        documentAnalysisStatus.get(doc.id) === AnalysisStatus.COMPLETED
    ).length;

    const documentsByType = documents.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const recentlyUploaded = documents
        .filter(doc => {
            const uploadDate = new Date(doc.uploaded_at);
            const now = new Date();
            const daysDiff = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= 7;
        })
        .length;

    const stats = [
        {
            title: 'Total Documents',
            value: totalDocuments,
            icon: <DocumentIcon className="h-5 w-5 text-blue-500" />,
            description: 'All documents in your library',
            color: 'bg-blue-50 dark:bg-blue-950/30'
        },
        {
            title: 'Analyzed Documents',
            value: analyzedDocuments,
            icon: <ChartBarIcon className="h-5 w-5 text-green-500" />,
            description: `${Math.round((analyzedDocuments / totalDocuments || 0) * 100)}% of your documents`,
            color: 'bg-green-50 dark:bg-green-950/30'
        },
        {
            title: 'PDF Documents',
            value: documentsByType[DocumentType.PDF] || 0,
            icon: <DocumentTextIcon className="h-5 w-5 text-purple-500" />,
            description: 'PDF files in your library',
            color: 'bg-purple-50 dark:bg-purple-950/30'
        },
        {
            title: 'Recently Uploaded',
            value: recentlyUploaded,
            icon: <ClockIcon className="h-5 w-5 text-amber-500" />,
            description: 'Uploaded in the last 7 days',
            color: 'bg-amber-50 dark:bg-amber-950/30'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index} className="border-none shadow-sm">
                    <CardContent className={`p-6 ${stat.color} rounded-lg`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                            </div>
                            <div className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm">
                                {stat.icon}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}; 