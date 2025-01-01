'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AnalysisResults } from '@/components/analysis/analysis-results';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';

// Mock original content for development
const mockOriginalContent = `Sample Document Content

This is the original content of the document that will be used for comparison with the processed results. It contains various elements that can be analyzed:

1. Text content for extraction
2. Tables for detection
3. Long paragraphs for summarization

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| More 1   | More 2   | More 3   |

The document continues with more content that can be processed and analyzed using our various analysis tools.`;

// Create mock results based on selected analysis types
const createMockResults = (documentId: string, selectedAnalysisTypes: string[]) => {
    const allResults = {
        text_extraction: {
            id: '1',
            documentId,
            type: 'text_extraction',
            status: 'completed',
            data: {
                extractedText: 'This is a sample extracted text from the document. It demonstrates the text extraction capabilities.',
                confidence: 0.95,
                language: 'en'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        table_detection: {
            id: '2',
            documentId,
            type: 'table_detection',
            status: 'completed',
            data: {
                tables: [
                    {
                        rows: [
                            {
                                cells: [
                                    { content: 'Header 1', isHeader: true, confidence: 0.95 },
                                    { content: 'Header 2', isHeader: true, confidence: 0.95 },
                                    { content: 'Header 3', isHeader: true, confidence: 0.95 }
                                ],
                                isHeader: true
                            },
                            {
                                cells: [
                                    { content: 'Data 1', confidence: 0.92 },
                                    {
                                        content: 'Merged Cell',
                                        rowSpan: 2,
                                        colSpan: 2,
                                        confidence: 0.90
                                    }
                                ]
                            },
                            {
                                cells: [
                                    { content: 'Data 4', confidence: 0.92 },
                                    { hidden: true },
                                    { hidden: true }
                                ]
                            }
                        ],
                        confidence: 0.92,
                        location: { x: 100, y: 200, width: 300, height: 150 },
                        structure: {
                            rowCount: 3,
                            columnCount: 3,
                            headerRows: [0],
                            mergedCells: [
                                { startRow: 1, startCol: 1, endRow: 2, endCol: 2 }
                            ]
                        }
                    }
                ]
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        text_summarization: {
            id: '3',
            documentId,
            type: 'text_summarization',
            status: 'completed',
            data: {
                summary: {
                    text: 'This is a summarized version of the document content, highlighting the key points and main ideas.',
                    keyPoints: [
                        'First key point from the document',
                        'Second important insight',
                        'Third major takeaway'
                    ],
                    wordCount: 150
                }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        template_conversion: {
            id: '4',
            documentId,
            type: 'template_conversion',
            status: 'completed',
            data: {
                convertedDocument: {
                    url: '#',
                    format: 'pdf',
                    size: 1024 * 1024 * 2.5 // 2.5 MB
                }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    };

    // Only return results for selected analysis types
    return selectedAnalysisTypes.map(type => allResults[type]);
};

export default function ResultsPage({
    params,
}: {
    params: Promise<{ documentId: string }>;
}) {
    const router = useRouter();
    const { documents } = useDocumentStore();
    const { currentConfig } = useAnalysisStore();
    const { documentId } = use(params);

    // Find the document
    const document = documents.find(doc => doc.id === documentId);

    // If document not found, redirect to dashboard
    if (!document) {
        router.push('/dashboard');
        return null;
    }

    // Get selected analysis types from the current configuration
    const selectedAnalysisTypes = currentConfig?.analysisTypes
        .filter(type => type.enabled)
        .map(type => type.type) || [];

    // Get mock results only for selected analyses
    const results = createMockResults(documentId, selectedAnalysisTypes);
    const originalContent = mockOriginalContent;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Analysis Results</h1>
                        <p className="text-muted-foreground mt-2">
                            View and export analysis results
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/analysis')}
                        className="px-4 py-2 text-sm text-primary hover:text-primary/80"
                    >
                        Analyze Another Document
                    </button>
                </div>

                <AnalysisResults
                    results={results}
                    documentName={document.name}
                    originalContent={originalContent}
                />
            </div>
        </DashboardLayout>
    );
} 