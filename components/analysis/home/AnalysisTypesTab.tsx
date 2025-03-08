import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Hourglass } from 'lucide-react';
import { AnalysisTypeIcon } from '@/components/analysis';
import { AnalysisStepInfo } from '@/types/analysis/configs';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalysisTypesTabProps {
    analysisDefinitions: any[];
    isLoading?: boolean;
}

export function AnalysisTypesTab({
    analysisDefinitions,
    isLoading = false
}: AnalysisTypesTabProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null);

    // Render skeleton cards for loading state
    const renderSkeletonCards = () => {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                        <div className="bg-gradient-to-r from-primary/20 to-primary/10 h-2 w-full" />
                        <div className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <Skeleton className="h-6 w-40 mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-md" />
                            </div>

                            <div className="mt-4">
                                <Skeleton className="h-5 w-48 mb-2" />
                                <div className="flex flex-wrap gap-2">
                                    {[...Array(3)].map((_, badgeIndex) => (
                                        <Skeleton key={badgeIndex} className="h-6 w-16 rounded-full" />
                                    ))}
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div>
                                <Skeleton className="h-5 w-32 mb-3" />
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, stepIndex) => (
                                        <div key={stepIndex} className="flex items-start">
                                            <Skeleton className="h-6 w-6 rounded-full mr-2" />
                                            <div className="flex-1">
                                                <Skeleton className="h-5 w-32 mb-1" />
                                                <Skeleton className="h-4 w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end">
                                <Skeleton className="h-9 w-36" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search analysis types..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <Button
                    onClick={() => router.push('/dashboard/analysis/new')}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    disabled={isLoading}
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Start Analysis Wizard
                </Button>
            </div>

            {isLoading ? (
                renderSkeletonCards()
            ) : analysisDefinitions.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {analysisDefinitions
                        .filter(def =>
                            def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (def.description && def.description.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((analysisType) => (
                            <Card key={analysisType.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className="bg-gradient-to-r from-primary/90 to-primary/70 h-2 w-full" />
                                <div className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {analysisType.name.split('_')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')}
                                            </h3>
                                            {analysisType.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {analysisType.description}
                                                </p>
                                            )}
                                        </div>
                                        <AnalysisTypeIcon type={analysisType.name} className="h-10 w-10 text-primary/70" />
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                                            <FileText className="h-4 w-4 mr-1.5" />
                                            Supported Document Types
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisType.supported_document_types.map((docType: string) => (
                                                <Badge key={docType} variant="secondary" className="capitalize">
                                                    {docType.toString().toLowerCase()}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div>
                                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-3">
                                            <Hourglass className="h-4 w-4 mr-1.5" />
                                            Analysis Steps
                                        </div>
                                        <div className="space-y-3">
                                            {(analysisType as any)?.steps && (analysisType as any).steps.length > 0 ? (
                                                (analysisType as any).steps.map((step: AnalysisStepInfo, index: number) => (
                                                    <div key={step.id} className="flex items-start">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-2 mt-0.5">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {step.name.split('_')
                                                                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                                                    .join(' ')}
                                                            </p>
                                                            {step.description && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {step.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-muted-foreground italic">
                                                    Step information not available
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5 flex justify-end">
                                        <Button
                                            onClick={() => {
                                                setSelectedAnalysisType(analysisType.id);
                                                router.push(`/dashboard/analysis/new?type=${analysisType.id}`);
                                            }}
                                            className="bg-primary/90 hover:bg-primary"
                                        >
                                            <PlusCircle className="h-4 w-4 mr-1.5" />
                                            Use This Analysis
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 border rounded-lg bg-muted/20">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-medium">No Analysis Types Available</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            There are currently no analysis types configured in the system. Please contact your administrator.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
} 