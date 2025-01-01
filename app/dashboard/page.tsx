'use client';

import { FileUpload } from '@/components/ui/file-upload';
import { DocumentList } from '@/components/documents/document-list';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BarChart, FileText, Clock, CheckCircle } from 'lucide-react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { Document } from '@/types/document';

function StatsCard({
    title,
    value,
    icon: Icon
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
}) {
    return (
        <div className="p-6 rounded-xl border bg-card">
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-semibold mt-1">{value}</h3>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { documents } = useDocumentStore();

    const stats = {
        total: documents.length,
        processing: documents.filter(d => d.status === 'processing').length,
        completed: documents.filter(d => d.status === 'completed').length,
        analyzed: documents.reduce((acc, doc) =>
            doc.status === 'completed' ? acc + 1 : acc, 0
        ),
    };

    const handleUploadSuccess = (document: Document) => {
        console.log('Document uploaded:', document);
    };

    const handleUploadError = (error: Error) => {
        console.error('Upload error:', error);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload and analyze your documents
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Documents"
                        value={stats.total}
                        icon={FileText}
                    />
                    <StatsCard
                        title="Processing"
                        value={stats.processing}
                        icon={Clock}
                    />
                    <StatsCard
                        title="Completed"
                        value={stats.completed}
                        icon={CheckCircle}
                    />
                    <StatsCard
                        title="Total Analyzed"
                        value={stats.analyzed}
                        icon={BarChart}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
                        <FileUpload
                            onUploadSuccess={handleUploadSuccess}
                            onUploadError={handleUploadError}
                            className="h-[300px]"
                        />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
                        <DocumentList />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
} 