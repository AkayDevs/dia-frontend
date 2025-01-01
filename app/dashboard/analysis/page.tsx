'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useDocumentStore } from '@/store/useDocumentStore';
import { FileUpload } from '@/components/ui/file-upload';
import { Document } from '@/types/document';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AnalysisPage() {
    const router = useRouter();
    const { documents } = useDocumentStore();
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleUploadSuccess = (document: Document) => {
        setUploadError(null);
        router.push(`/dashboard/analysis/${document.id}`);
    };

    const handleUploadError = (error: Error) => {
        setUploadError(error.message);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Analysis</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload a document to start analysis
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
                        {uploadError && (
                            <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                                {uploadError}
                            </div>
                        )}
                        <FileUpload
                            onUploadSuccess={handleUploadSuccess}
                            onUploadError={handleUploadError}
                            className="h-[300px]"
                        />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
                        <div className="space-y-4">
                            {documents.slice(0, 5).map((doc) => (
                                <button
                                    key={doc.id}
                                    onClick={() => router.push(`/dashboard/analysis/${doc.id}`)}
                                    className="w-full p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">{doc.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
} 