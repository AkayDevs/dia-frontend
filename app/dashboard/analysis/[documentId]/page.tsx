'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AnalysisWizard } from '@/components/analysis/analysis-wizard';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { use } from 'react';

export default function AnalysisPage({
    params,
}: {
    params: Promise<{ documentId: string }>;
}) {
    const router = useRouter();
    const { documents } = useDocumentStore();
    const { setCurrentConfig } = useAnalysisStore();
    const { documentId } = use(params);
    const [document, setDocument] = useState<Document | null>(null);

    // Find the document
    useEffect(() => {
        const doc = documents.find(doc => doc.id === documentId);
        setDocument(doc);
        if (doc) {
            setCurrentConfig({
                documentId: doc.id,
                analysisTypes: []
            });
        }
    }, [documentId, documents, setCurrentConfig]);

    useEffect(() => {
        // If document not found after fetch, redirect to dashboard
        if (document === null) {
            return;
        }

        if (!document) {
            router.push('/dashboard');
        }
    }, [document, router]);

    // If document not found, redirect to dashboard
    if (!document) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Analyze Document</h1>
                    <p className="text-muted-foreground mt-2">
                        Configure analysis options for {document.name}
                    </p>
                </div>

                <div className="mt-8">
                    <AnalysisWizard documentId={document.id} />
                </div>
            </div>
        </DashboardLayout>
    );
} 