import { Button } from '@/components/ui/button';
import { ArrowUpTrayIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentsHeaderProps {
    totalDocuments: number;
    onManageTags: () => void;
}

export const DocumentsHeader = ({ totalDocuments, onManageTags }: DocumentsHeaderProps) => {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <div className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                        {totalDocuments}
                    </div>
                </div>
                <p className="text-muted-foreground mt-1">
                    Manage and analyze your document library
                </p>
            </div>

            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Cog6ToothIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onManageTags}>
                            Manage Tags
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                            Document Settings
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    onClick={() => router.push('/dashboard/upload')}
                    className="gap-2"
                >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Upload
                </Button>
            </div>
        </div>
    );
}; 