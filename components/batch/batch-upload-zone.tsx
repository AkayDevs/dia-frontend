import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { DocumentType } from '@/enums/document';

interface BatchUploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    acceptedFileTypes?: DocumentType[];
    disabled?: boolean;
}

export const BatchUploadZone = ({
    onFilesSelected,
    acceptedFileTypes = [DocumentType.PDF, DocumentType.DOCX, DocumentType.XLSX, DocumentType.IMAGE],
    disabled = false
}: BatchUploadZoneProps) => {
    // Generate accepted file extensions string for the input
    const getAcceptString = useCallback(() => {
        const typeMap: Record<DocumentType, string> = {
            [DocumentType.PDF]: '.pdf',
            [DocumentType.DOCX]: '.docx,.doc',
            [DocumentType.XLSX]: '.xlsx,.xls',
            [DocumentType.IMAGE]: '.png,.jpg,.jpeg',
            [DocumentType.UNKNOWN]: ''
        };

        return acceptedFileTypes
            .map(type => typeMap[type])
            .filter(Boolean)
            .join(',');
    }, [acceptedFileTypes]);

    // Handle file selection from input
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            onFilesSelected(files);
            // Reset input value to allow selecting the same file again
            event.target.value = '';
        }
    }, [onFilesSelected, disabled]);

    // Handle file drop
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (disabled) return;

        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) {
            onFilesSelected(files);
        }
    }, [onFilesSelected, disabled]);

    // Prevent default behavior for drag events
    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    }, []);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-accent/5 cursor-pointer'
                }`}
        >
            <input
                type="file"
                id="batch-file-upload"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept={getAcceptString()}
                disabled={disabled}
            />
            <label
                htmlFor="batch-file-upload"
                className={`flex flex-col items-center gap-2 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
            >
                <Upload className={`h-8 w-8 ${disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
                <p className={disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'}>
                    {disabled
                        ? 'Upload in progress...'
                        : 'Click to upload or drag and drop files here'}
                </p>
                <p className="text-xs text-muted-foreground/70">
                    Accepted file types: {acceptedFileTypes.join(', ')}
                </p>
            </label>
        </div>
    );
}; 