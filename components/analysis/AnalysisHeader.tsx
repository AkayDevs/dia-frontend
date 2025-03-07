import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface AnalysisHeaderProps {
    activeTab: string;
    onTabChange: (value: string) => void;
    onNewAnalysis: () => void;
    onRefresh: () => void;
}

export const AnalysisHeader = ({
    activeTab,
    onTabChange,
    onNewAnalysis,
    onRefresh
}: AnalysisHeaderProps) => {
    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analysis</h1>
                <p className="text-muted-foreground">
                    Run analyses on your documents to extract insights
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
                <Button onClick={onNewAnalysis}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Analysis
                </Button>
            </div>
        </div>
    );
}; 