import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, RefreshCw, Beaker } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AnalysisDashboardHeaderProps {
    isLoading: boolean;
    onRefresh: () => Promise<void>;
}

export function AnalysisDashboardHeader({ isLoading, onRefresh }: AnalysisDashboardHeaderProps) {
    const router = useRouter();

    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    {isLoading ? (
                        <>
                            <Skeleton className="h-9 w-64 mb-2" />
                            <Skeleton className="h-5 w-80" />
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold tracking-tight">Analysis Dashboard</h1>
                            <p className="text-muted-foreground mt-1">
                                Extract insights from your documents with powerful analysis tools
                            </p>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="h-9"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/dashboard/analysis/test" passHref>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9"
                            disabled={isLoading}
                        >
                            <Beaker className="h-4 w-4 mr-2" />
                            Test Components
                        </Button>
                    </Link>
                    <Button
                        onClick={() => router.push('/dashboard/analysis/new')}
                        className="h-9 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        disabled={isLoading}
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Analysis
                    </Button>
                </div>
            </div>
        </div>
    );
} 