import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableDetectionResult, DetectedTable, PageTableInfo } from '@/types/analysis';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { loadPDF, renderPage } from '@/lib/pdf-utils';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { useAuthStore } from '@/store/useAuthStore';

interface TableComparisonProps {
    documentUrl: string;
    table: DetectedTable;
    pageNumber: number;
}

export function TableComparison({ documentUrl, table, pageNumber }: TableComparisonProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
    const token = useAuthStore(state => state.token);

    useEffect(() => {
        const loadDocument = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Construct full URL using window.location.origin
                const fullUrl = typeof window !== 'undefined'
                    ? `${window.location.origin}${documentUrl}`
                    : documentUrl;

                console.log('Loading document:', {
                    fullUrl,
                    documentUrl,
                    pageNumber,
                    hasToken: !!token,
                    tokenLength: token?.length
                });

                // Load the PDF document with the token in headers
                const pdf = await loadPDF(fullUrl, token || '');
                console.log('PDF loaded successfully:', {
                    numPages: pdf.numPages,
                    fingerprint: pdf.fingerprint,
                    currentPage: pageNumber,
                });
                setPdfDoc(pdf);

                if (pageNumber > pdf.numPages) {
                    throw new Error(`Invalid page number: ${pageNumber}. Document has ${pdf.numPages} pages.`);
                }

                // Render the specific page
                console.log(`Rendering page ${pageNumber}`);
                const pageImage = await renderPage(pdf, pageNumber);
                setImageUrl(pageImage);
                console.log('Page rendered successfully');
            } catch (err) {
                console.error('Error loading document:', {
                    error: err,
                    documentUrl,
                    pageNumber,
                    message: err instanceof Error ? err.message : 'Unknown error',
                    stack: err instanceof Error ? err.stack : undefined
                });
                setError(err instanceof Error ? err.message : 'Failed to load document');
            } finally {
                setIsLoading(false);
            }
        };

        if (documentUrl && token) {
            loadDocument();
        } else if (!token) {
            setError('No authentication token available');
            setIsLoading(false);
        } else {
            setError('No document URL provided');
            setIsLoading(false);
        }

        return () => {
            if (pdfDoc) {
                console.log('Cleaning up PDF document');
                pdfDoc.destroy();
            }
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [documentUrl, pageNumber, token]);

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Original Document with Bounding Box */}
            <Card className="p-4">
                <div className="text-sm font-medium mb-2">Original Document - Page {pageNumber}</div>
                <div className="relative">
                    {isLoading ? (
                        <Skeleton className="w-full aspect-[1/1.4]" />
                    ) : error ? (
                        <div className="w-full aspect-[1/1.4] bg-muted flex items-center justify-center text-muted-foreground">
                            {error}
                        </div>
                    ) : imageUrl ? (
                        <>
                            <img
                                src={imageUrl}
                                alt={`Page ${pageNumber}`}
                                className="w-full h-auto"
                            />
                            <div
                                className="absolute border-2 border-primary"
                                style={{
                                    left: `${table.bbox.x1}%`,
                                    top: `${table.bbox.y1}%`,
                                    width: `${table.bbox.x2 - table.bbox.x1}%`,
                                    height: `${table.bbox.y2 - table.bbox.y1}%`,
                                    backgroundColor: 'rgba(var(--primary) / 0.1)'
                                }}
                            />
                        </>
                    ) : (
                        <div className="w-full aspect-[1/1.4] bg-muted flex items-center justify-center text-muted-foreground">
                            Failed to load image
                        </div>
                    )}
                </div>
            </Card>

            {/* Extracted Table */}
            <Card className="p-4">
                <div className="text-sm font-medium mb-2">Extracted Table</div>
                <ScrollArea className="h-[500px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {table.cells
                                    .filter(cell => cell.row_index === 0)
                                    .sort((a, b) => a.col_index - b.col_index)
                                    .map((cell, index) => (
                                        <TableHead
                                            key={index}
                                            className={cn(
                                                "border min-w-[100px]",
                                                cell.is_header && "bg-muted"
                                            )}
                                        >
                                            {cell.content}
                                        </TableHead>
                                    ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: table.rows - 1 }, (_, i) => i + 1).map(rowIndex => (
                                <TableRow key={rowIndex}>
                                    {table.cells
                                        .filter(cell => cell.row_index === rowIndex)
                                        .sort((a, b) => a.col_index - b.col_index)
                                        .map((cell, index) => (
                                            <TableCell
                                                key={index}
                                                className="border"
                                                rowSpan={cell.row_span}
                                                colSpan={cell.col_span}
                                            >
                                                {cell.content}
                                            </TableCell>
                                        ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </Card>
        </div>
    );
} 