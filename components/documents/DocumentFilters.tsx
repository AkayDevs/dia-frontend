import { Dispatch, SetStateAction } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DocumentType } from '@/enums/document';
import { AnalysisStatus } from '@/enums/analysis';
import { Tag } from '@/types/document';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TagIcon } from '@heroicons/react/24/outline';

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

interface DocumentFiltersProps {
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    statusFilter: AnalysisStatus | 'ALL';
    setStatusFilter: Dispatch<SetStateAction<AnalysisStatus | 'ALL'>>;
    typeFilter: DocumentType | 'ALL';
    setTypeFilter: Dispatch<SetStateAction<DocumentType | 'ALL'>>;
    tagFilter: number | 'ALL';
    setTagFilter: Dispatch<SetStateAction<number | 'ALL'>>;
    dateRange: DateRange;
    setDateRange: Dispatch<SetStateAction<DateRange>>;
    tags: Tag[];
    onManageTags: () => void;
}

const calendarStyles = {
    day_today: "bg-muted text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground",
    day_range_start: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md",
    day_range_end: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-r-md",
    day_range_middle: "bg-primary/15 text-foreground hover:bg-primary/20 focus:bg-primary/20 rounded-none",
    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
};

export const DocumentFilters = ({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    tagFilter,
    setTagFilter,
    dateRange,
    setDateRange,
    tags,
    onManageTags
}: DocumentFiltersProps) => {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[300px]"
            />
            <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as AnalysisStatus | 'ALL')}
            >
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value={AnalysisStatus.PENDING}>Ready for Analysis</SelectItem>
                    <SelectItem value={AnalysisStatus.IN_PROGRESS}>Processing</SelectItem>
                    <SelectItem value={AnalysisStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={AnalysisStatus.FAILED}>Failed</SelectItem>
                    <SelectItem value={AnalysisStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
            </Select>
            <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as DocumentType | 'ALL')}
            >
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value={DocumentType.PDF}>PDF</SelectItem>
                    <SelectItem value={DocumentType.DOCX}>DOCX</SelectItem>
                    <SelectItem value={DocumentType.XLSX}>XLSX</SelectItem>
                    <SelectItem value={DocumentType.IMAGE}>Image</SelectItem>
                </SelectContent>
            </Select>
            <Select
                value={tagFilter.toString()}
                onValueChange={(value) => setTagFilter(value === 'ALL' ? 'ALL' : parseInt(value))}
            >
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Tags</SelectItem>
                    {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id.toString()}>
                            {tag.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal md:w-[300px]",
                            !dateRange.from && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Filter by date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                        <h4 className="text-sm font-medium">Select Date Range</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            Choose start and end dates to filter documents
                        </p>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={{
                            from: dateRange.from,
                            to: dateRange.to,
                        }}
                        onSelect={(range) => {
                            setDateRange({
                                from: range?.from,
                                to: range?.to
                            });
                        }}
                        numberOfMonths={2}
                        classNames={calendarStyles}
                    />
                    <div className="border-t p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-muted" />
                                <span>Today</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span>Selected</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-primary/15" />
                                <span>Range</span>
                            </div>
                        </div>
                        {(dateRange.from || dateRange.to) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDateRange({ from: undefined, to: undefined })}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={onManageTags}>
                <TagIcon className="h-4 w-4" />
            </Button>
        </div>
    );
}; 