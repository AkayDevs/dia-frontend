import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Spreadsheet } from 'react-spreadsheet';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import { Tldraw } from '@tldraw/tldraw';
import { DocumentType } from '@/types/document';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2Icon, SaveIcon } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentEditorProps {
    documentId: string;
    documentType: DocumentType;
    documentUrl: string;
    onSave: (data: any) => Promise<void>;
    onClose: () => void;
}

export function DocumentEditor({
    documentId,
    documentType,
    documentUrl,
    onSave,
    onClose
}: DocumentEditorProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadDocument = async () => {
            try {
                setIsLoading(true);
                // Load document content based on type
                switch (documentType) {
                    case DocumentType.DOCX:
                        // Fetch DOCX content and convert to HTML
                        const response = await fetch(documentUrl);
                        const blob = await response.blob();
                        // You'll need to implement a service to convert DOCX to HTML
                        // const html = await convertDocxToHtml(blob);
                        // setContent(html);
                        break;

                    case DocumentType.XLSX:
                        // Load Excel data
                        // You'll need to implement a service to parse Excel data
                        // const data = await parseExcelFile(documentUrl);
                        // setContent(data);
                        break;

                    case DocumentType.PDF:
                        // PDF is handled directly by react-pdf
                        setContent(documentUrl);
                        break;

                    case DocumentType.IMAGE:
                        // Image is loaded directly
                        setContent(documentUrl);
                        break;
                }
            } catch (error) {
                console.error('Error loading document:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
    }, [documentId, documentType, documentUrl]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await onSave(content);
        } catch (error) {
            console.error('Error saving document:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const renderEditor = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-96">
                    <Loader2Icon className="w-8 h-8 animate-spin" />
                </div>
            );
        }

        switch (documentType) {
            case DocumentType.DOCX:
                return (
                    <Editor
                        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                        initialValue={content}
                        init={{
                            height: 600,
                            menubar: true,
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                            ],
                            toolbar: 'undo redo | blocks | ' +
                                'bold italic forecolor | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'removeformat | help',
                        }}
                        onEditorChange={(newContent) => setContent(newContent)}
                    />
                );

            case DocumentType.XLSX:
                return (
                    <div className="h-[600px] overflow-auto">
                        <Spreadsheet
                            data={content || []}
                            onChange={setContent}
                        />
                    </div>
                );

            case DocumentType.PDF:
                return (
                    <div className="h-[600px] overflow-auto">
                        <PDFDocument
                            file={content}
                            onLoadSuccess={({ numPages }) => {
                                console.log(`Loaded ${numPages} pages`);
                            }}
                        >
                            <Page pageNumber={1} />
                        </PDFDocument>
                    </div>
                );

            case DocumentType.IMAGE:
                return (
                    <div className="h-[600px]">
                        <Tldraw
                            persistenceKey={`image-editor-${documentId}`}
                        >
                            <img
                                src={content}
                                alt="Document"
                                className="max-w-full max-h-full object-contain"
                            />
                        </Tldraw>
                    </div>
                );

            default:
                return <div>Unsupported document type</div>;
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Edit Document</DialogTitle>
                    <DialogDescription>
                        Make changes to your document. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {renderEditor()}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <SaveIcon className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 