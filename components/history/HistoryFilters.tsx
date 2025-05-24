import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnalysisStatus } from '@/enums/analysis';

interface HistoryFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: AnalysisStatus | 'ALL';
    onStatusFilterChange: (status: AnalysisStatus | 'ALL') => void;
}

export function HistoryFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
}: HistoryFiltersProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search by document name..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 w-full md:w-auto">
                        <Filter className="h-4 w-4" />
                        {statusFilter === 'ALL' ? 'All Status' : statusFilter.toLowerCase()}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem onClick={() => onStatusFilterChange('ALL')}>
                        All Status
                    </DropdownMenuItem>
                    {Object.values(AnalysisStatus).map((status) => (
                        <DropdownMenuItem
                            key={status}
                            onClick={() => onStatusFilterChange(status)}
                            className="capitalize"
                        >
                            {status.toLowerCase()}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
} 