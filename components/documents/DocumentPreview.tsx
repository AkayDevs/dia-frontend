import { Button } from '@/components/ui/button';
import { DocumentType } from '@/enums/document';
import {
    DocumentIcon,
    DocumentTextIcon,
    DocumentChartBarIcon
} from '@heroicons/react/24/outline';

interface DocumentPreviewProps {
    url: string;
    name: string;
    type: DocumentType;
}

export const DocumentPreview = ({ url, name, type }: DocumentPreviewProps) => {
    const previewContainerClass = "h-full flex items-center justify-center p-4 bg-muted/50 rounded-lg";

    switch (type) {
        case DocumentType.PDF:
            return (
                <div className={previewContainerClass}>
                    <object
                        data={`${url}#toolbar=0`}
                        type="application/pdf"
                        className="w-full h-full rounded-lg"
                    >
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <DocumentIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">PDF preview not available</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => window.open(url, '_blank')}
                                >
                                    Open PDF
                                </Button>
                            </div>
                        </div>
                    </object>
                </div>
            );

        case DocumentType.IMAGE:
            return (
                <div className={previewContainerClass}>
                    <img
                        src={url}
                        alt={name}
                        className="max-w-full max-h-full object-contain rounded-lg"
                        loading="lazy"
                    />
                </div>
            );

        case DocumentType.DOCX:
            return (
                <div className={previewContainerClass}>
                    <div className="text-center">
                        <DocumentTextIcon className="h-16 w-16 text-indigo-500 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Word document preview</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open(url, '_blank')}
                        >
                            Open Document
                        </Button>
                    </div>
                </div>
            );

        case DocumentType.XLSX:
            return (
                <div className={previewContainerClass}>
                    <div className="text-center">
                        <DocumentChartBarIcon className="h-16 w-16 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Excel file preview</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open(url, '_blank')}
                        >
                            Open Spreadsheet
                        </Button>
                    </div>
                </div>
            );

        default:
            return (
                <div className={previewContainerClass}>
                    <div className="text-center">
                        <DocumentIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Preview not available</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open(url, '_blank')}
                        >
                            Open File
                        </Button>
                    </div>
                </div>
            );
    }
}; 