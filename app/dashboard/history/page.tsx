import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, RotateCw, Trash2, FileDown } from "lucide-react";
import { format } from "date-fns";

// Mock data - replace with actual API call
const mockAnalyses = [
    {
        id: "1",
        documentName: "Financial Report Q4 2023.pdf",
        analysisTypes: ["Text Extraction", "Table Detection"],
        timestamp: new Date("2024-01-15T10:30:00"),
        status: "completed"
    },
    {
        id: "2",
        documentName: "Meeting Minutes Jan 2024.docx",
        analysisTypes: ["Text Extraction"],
        timestamp: new Date("2024-01-14T15:45:00"),
        status: "completed"
    }
];

export default function HistoryPage() {
    const handleViewResults = (id: string) => {
        // Navigate to results page
        window.location.href = `/dashboard/results/${id}`;
    };

    const handleRerunAnalysis = (id: string) => {
        // Implement rerun logic
        console.log("Rerunning analysis:", id);
    };

    const handleDeleteAnalysis = (id: string) => {
        // Implement delete logic
        console.log("Deleting analysis:", id);
    };

    const handleExportResults = (id: string) => {
        // Navigate to export page
        window.location.href = `/dashboard/export/${id}`;
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Analysis History</h1>
                </div>

                <div className="grid gap-4">
                    {mockAnalyses.map((analysis) => (
                        <Card key={analysis.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-medium">{analysis.documentName}</h3>
                                    <div className="text-sm text-muted-foreground">
                                        {analysis.analysisTypes.join(", ")}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {format(analysis.timestamp, "PPpp")}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleViewResults(analysis.id)}
                                        title="View Results"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleExportResults(analysis.id)}
                                        title="Export Results"
                                    >
                                        <FileDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRerunAnalysis(analysis.id)}
                                        title="Re-run Analysis"
                                    >
                                        <RotateCw className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteAnalysis(analysis.id)}
                                        title="Delete Analysis"
                                        className="text-destructive hover:text-destructive/90"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
} 