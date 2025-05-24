'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { DocumentPreview } from '@/components/documents/document-preview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/document';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);

    const handleUploadSuccess = (document: Document) => {
        setUploadedDocument(document);
        toast({
            description: "Document uploaded successfully!",
            duration: 3000,
        });
    };

    const handleUploadError = (error: Error) => {
        toast({
            title: "Upload Failed",
            description: error.message,
            variant: "destructive",
            duration: 5000,
        });
    };

    const handleProceedToAnalysis = () => {
        if (uploadedDocument) {
            router.push(`/dashboard/analysis/${uploadedDocument.id}`);
        }
    };

    return (
        <div>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload your document for analysis
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload</CardTitle>
                            <CardDescription>
                                Select or drag & drop your document
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                onUploadSuccess={handleUploadSuccess}
                                onUploadError={handleUploadError}
                                className="h-[400px]"
                                maxSize={20 * 1024 * 1024} // 20MB
                            />
                        </CardContent>
                    </Card>

                    {uploadedDocument && (
                        <div className="space-y-6">
                            <DocumentPreview document={uploadedDocument} />

                            <Button
                                className="w-full gap-2"
                                size="lg"
                                onClick={handleProceedToAnalysis}
                            >
                                Proceed to Analysis
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 