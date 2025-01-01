'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
    FileText,
    MoreVertical,
    Upload,
    Search,
    Filter,
    Download,
    Trash2,
    ExternalLink,
    PlayCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { UploadHandler } from '@/components/ui/upload-handler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

interface Document {
    id: number;
    name: string;
    type: string;
    size: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    uploadedAt: string;
    url: string;
}

export default function DocumentsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/documents/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch documents');
            }

            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch documents. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleAnalyze = async (documentId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/documents/${documentId}/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    types: ['text_extraction', 'table_detection']
                })
            });

            if (!response.ok) {
                throw new Error('Failed to start analysis');
            }

            toast({
                description: "Analysis started successfully",
                duration: 3000,
            });

            router.push(`/dashboard/analysis/${documentId}`);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to start analysis. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (documentId: number) => {
        // Add delete functionality when backend endpoint is available
        toast({
            description: "Delete functionality coming soon",
            duration: 3000,
        });
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || doc.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'processing':
                return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'failed':
                return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage and analyze your documents
                        </p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Upload className="h-4 w-4" />
                                Upload Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Upload Document</DialogTitle>
                                <DialogDescription>
                                    Upload a document for analysis. Supported formats: PDF, DOCX, XLSX, Images
                                </DialogDescription>
                            </DialogHeader>
                            <UploadHandler
                                onSuccess={() => setUploadError(null)}
                                onError={(error) => setUploadError(error.message)}
                                refreshDocuments={fetchDocuments}
                                redirectToAnalysis={false}
                                className="h-[300px]"
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                                All
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                                Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('processing')}>
                                Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                                Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('failed')}>
                                Failed
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ScrollArea className="rounded-lg border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Loading documents...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredDocuments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No documents found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDocuments.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    {doc.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(doc.status)}>
                                                    {doc.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="uppercase text-xs">
                                                {doc.type}
                                            </TableCell>
                                            <TableCell>
                                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleAnalyze(doc.id)}
                                                            className="gap-2"
                                                        >
                                                            <PlayCircle className="h-4 w-4" />
                                                            Analyze
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => window.open(doc.url, '_blank')}
                                                            className="gap-2"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => window.open(doc.url)}
                                                            className="gap-2"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Download
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="gap-2 text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </motion.div>
            </div>
        </DashboardLayout>
    );
} 