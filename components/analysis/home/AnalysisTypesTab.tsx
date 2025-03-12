import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search,
    PlusCircle,
    AlertCircle,
    Info,
    FileText,
    Hourglass,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Layers,
    Code,
    Settings,
    X,
    Check,
    ChevronLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AnalysisDefinitionInfo, AnalysisStepInfo, AnalysisAlgorithmInfo } from '@/types/analysis/configs';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAnalysisIcon } from '@/constants/analysis/registry';

// Temporary component until the actual AnalysisTypeIcon is fixed
const AnalysisTypeIcon = ({ type, className }: { type: string, className?: string }) => {
    // Map analysis types to appropriate icons based on name
    if (type.toLowerCase().includes('document')) return <FileText className={className} />;
    if (type.toLowerCase().includes('process')) return <Hourglass className={className} />;
    // Default icon
    return <Info className={className} />;
};

interface AnalysisTypesTabProps {
    analysisDefinitions: AnalysisDefinitionInfo[];
    isLoading?: boolean;
}

export function AnalysisTypesTab({
    analysisDefinitions,
    isLoading = false
}: AnalysisTypesTabProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const detailsRef = useRef<HTMLDivElement>(null);

    // Analysis store
    const {
        fetchAnalysisDefinition,
        fetchStepAlgorithms,
        currentDefinition,
        availableAlgorithms,
        isLoading: isStoreLoading
    } = useAnalysisStore();

    // Load detailed information when an analysis type is selected
    useEffect(() => {
        if (selectedAnalysisType) {
            fetchAnalysisDefinition(selectedAnalysisType);
        }
    }, [selectedAnalysisType, fetchAnalysisDefinition]);

    // Load algorithms for each step when definition changes
    useEffect(() => {
        if (currentDefinition?.steps) {
            currentDefinition.steps.forEach(step => {
                fetchStepAlgorithms(`${currentDefinition.code}.${step.code}`);
            });
        }
    }, [currentDefinition, fetchStepAlgorithms]);

    // Scroll to details when they become visible
    useEffect(() => {
        if (showDetails && detailsRef.current) {
            detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [showDetails]);

    // Handle selecting an analysis type
    const handleSelectAnalysisType = (code: string) => {
        if (selectedAnalysisType === code && showDetails) {
            // If clicking the same card again, close the details
            setShowDetails(false);
            setTimeout(() => setSelectedAnalysisType(null), 300);
        } else {
            // If clicking a different card, show its details
            setSelectedAnalysisType(code);
            setShowDetails(true);
        }
    };

    // Render skeleton cards for loading state
    const renderSkeletonCards = () => {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <Card key={index} className="overflow-hidden border-border/40 shadow-sm">
                        <div className="bg-gradient-to-r from-primary/20 to-primary/10 h-1.5 w-full" />
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

                            <Separator className="my-4 bg-border/30" />

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

    // Format name from snake_case to Title Case
    const formatName = (name: string) => {
        return name.split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Render detailed analysis information
    const renderDetailView = () => {
        if (!currentDefinition) return null;

        return (
            <div
                ref={detailsRef}
                className={cn(
                    "col-span-full lg:col-span-2 transition-all duration-300 overflow-hidden",
                    showDetails ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <Card className="border-primary/30 shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/80 to-primary/60 h-1.5 w-full" />
                    <div className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-start sm:items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-muted/50 hover:bg-muted/70 flex-shrink-0 mt-0.5 sm:mt-0"
                                    onClick={() => {
                                        setShowDetails(false);
                                        setTimeout(() => setSelectedAnalysisType(null), 300);
                                    }}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                                    <div dangerouslySetInnerHTML={{ __html: getAnalysisIcon(currentDefinition.code)?.icon || '' }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg font-medium truncate">{formatName(currentDefinition.name)}</h2>
                                    <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                                        {currentDefinition.description || "No description available"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-auto sm:ml-0">
                                <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 whitespace-nowrap">
                                    v{currentDefinition.version}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-secondary/5 border-secondary/20 whitespace-nowrap">
                                    {currentDefinition.code}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <div className="text-xs font-medium text-muted-foreground mr-2 whitespace-nowrap">Supported documents:</div>
                            <div className="flex flex-wrap gap-1.5 flex-1">
                                {currentDefinition.supported_document_types.map((docType: string) => (
                                    <Badge
                                        key={docType}
                                        variant="secondary"
                                        className="capitalize text-[10px] bg-secondary/30"
                                    >
                                        {docType.toString().toLowerCase()}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Separator className="bg-border/30 my-4" />

                        <div className="max-h-[600px] overflow-auto pr-2">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium flex items-center mb-3">
                                        <Layers className="h-4 w-4 mr-2 text-primary/70" />
                                        Analysis Pipeline
                                    </h3>

                                    <Accordion type="single" collapsible className="w-full">
                                        {currentDefinition.steps && currentDefinition.steps.map((step, index) => {
                                            const stepAlgorithms = availableAlgorithms[`${currentDefinition.code}.${step.code}`] || [];

                                            return (
                                                <AccordionItem
                                                    key={step.code}
                                                    value={step.code}
                                                    className="border border-border/30 rounded-md mb-3 overflow-hidden"
                                                >
                                                    <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 hover:no-underline">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3">
                                                                {index + 1}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-sm font-medium">{formatName(step.name)}</p>
                                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                                    {step.description || "No description available"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-4 pb-4 pt-1">
                                                        <div className="pl-9 space-y-4">

                                                            {stepAlgorithms.length > 0 ? (
                                                                <div className="space-y-3">
                                                                    <h4 className="text-xs font-medium flex items-center">
                                                                        <Code className="h-3.5 w-3.5 mr-1.5 text-blue-500/80" />
                                                                        Available Algorithms
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {stepAlgorithms.map((algo) => (
                                                                            <div
                                                                                key={algo.code}
                                                                                className="border border-border/30 rounded-md p-3 bg-card/30 hover:border-border/50 transition-all"
                                                                            >
                                                                                <div className="flex items-start justify-between">
                                                                                    <div>
                                                                                        <p className="text-xs font-medium">{formatName(algo.name)}</p>
                                                                                        <p className="text-[10px] text-muted-foreground mt-1">
                                                                                            {algo.description || "No description available"}
                                                                                        </p>
                                                                                    </div>
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="text-[10px] bg-secondary/5 border-secondary/20"
                                                                                    >
                                                                                        v{algo.version}
                                                                                    </Badge>
                                                                                </div>

                                                                                {algo.supported_document_types && algo.supported_document_types.length > 0 && (
                                                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                                                        {algo.supported_document_types.map((docType: string) => (
                                                                                            <Badge
                                                                                                key={docType}
                                                                                                variant="secondary"
                                                                                                className="capitalize text-[9px] bg-secondary/20 px-1.5 py-0"
                                                                                            >
                                                                                                {docType.toString().toLowerCase()}
                                                                                            </Badge>
                                                                                        ))}
                                                                                    </div>
                                                                                )}

                                                                                <div className="flex items-center mt-2 text-[10px] text-muted-foreground">
                                                                                    <div className="flex items-center mr-3">
                                                                                        <Settings className="h-3 w-3 mr-1" />
                                                                                        <span>Code: {algo.code}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center">
                                                                                        {algo.is_active ? (
                                                                                            <>
                                                                                                <Check className="h-3 w-3 mr-1 text-green-500/80" />
                                                                                                <span>Active</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <X className="h-3 w-3 mr-1 text-red-500/80" />
                                                                                                <span>Inactive</span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-muted-foreground italic bg-muted/20 p-2 rounded-md">
                                                                    No algorithms available for this step
                                                                </div>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card/30 p-4 rounded-lg border border-border/30">
                <div className="flex flex-col space-y-2 w-full sm:w-auto">
                    <h2 className="text-sm font-medium text-primary/90">Analysis Types</h2>
                    <p className="text-xs text-muted-foreground max-w-md">
                        Select an analysis type to process your documents with our specialized algorithms.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search analysis types..."
                            className="pl-9 border-border/50 bg-background/80 h-9 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>
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
                        .map((analysisType, index) => (
                            <Card
                                key={analysisType.id || `analysis-type-${index}`}
                                className={cn(
                                    "overflow-hidden border-border/40 transition-all duration-200 hover:shadow-md hover:border-border/60 cursor-pointer",
                                    selectedAnalysisType === analysisType.code && "ring-1 ring-primary/50 border-primary/30"
                                )}
                                onClick={() => handleSelectAnalysisType(analysisType.code)}
                            >
                                <div className="bg-gradient-to-r from-primary/80 to-primary/60 h-1.5 w-full" />
                                <div className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-base font-medium text-foreground/90">
                                                {formatName(analysisType.name)}
                                            </h3>
                                            {analysisType.description && (
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {analysisType.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="bg-primary/10 p-2 rounded-md">
                                            <div dangerouslySetInnerHTML={{ __html: getAnalysisIcon(analysisType.code)?.icon || '' }} />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex items-center text-xs font-medium text-muted-foreground mb-2">
                                            <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-500/80" />
                                            Supported Document Types
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analysisType.supported_document_types.map((docType: string) => (
                                                <Badge
                                                    key={docType}
                                                    variant="secondary"
                                                    className="capitalize text-[10px] bg-secondary/30 hover:bg-secondary/40"
                                                >
                                                    {docType.toString().toLowerCase()}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="my-4 bg-border/30" />

                                    <div className="flex justify-between items-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-primary/80 hover:text-primary hover:bg-primary/5 -ml-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectAnalysisType(analysisType.code);
                                            }}
                                        >
                                            <Info className="h-3.5 w-3.5 mr-1.5" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}

                    {renderDetailView()}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 border border-dashed border-border/40 rounded-lg bg-muted/10">
                    <div className="bg-muted/20 p-3 rounded-full">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-base font-medium text-foreground/90">No Analysis Types Available</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            There are currently no analysis types configured in the system. Please contact your administrator.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="mt-2 border-border/50"
                        onClick={() => router.push('/dashboard')}
                    >
                        Return to Dashboard
                    </Button>
                </div>
            )}
        </div>
    );
} 