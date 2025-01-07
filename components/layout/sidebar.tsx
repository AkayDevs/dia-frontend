'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { AnalysisStatus } from '@/types/document';
import {
    DocumentIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    UserIcon,
    Bars3Icon,
    DocumentTextIcon,
    ClockIcon,
    ChevronRightIcon,
    DocumentDuplicateIcon,
    DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    description?: string;
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: DocumentIcon,
        description: 'Overview and quick actions'
    },
    {
        title: 'Documents',
        href: '/dashboard/documents',
        icon: DocumentTextIcon,
        description: 'Manage your documents'
    },
    {
        title: 'Analysis',
        href: '/dashboard/analysis',
        icon: ChartBarIcon,
        description: 'Analyze documents'
    },
    {
        title: 'Batch Processing',
        href: '/dashboard/batch',
        icon: DocumentDuplicateIcon,
        description: 'Process multiple documents'
    },
    {
        title: 'History',
        href: '/dashboard/history',
        icon: ClockIcon,
        description: 'View analysis history'
    },
    {
        title: 'Templates',
        href: '/dashboard/templates',
        icon: DocumentMagnifyingGlassIcon,
        description: 'Manage analysis templates'
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Cog6ToothIcon,
        description: 'Configure your preferences'
    }
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const { user, logout } = useAuthStore();
    const { documents = [], fetchDocuments, setFilters } = useDocumentStore();
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [processingCount, setProcessingCount] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchProcessingDocuments = async () => {
            try {
                // Only fetch if we don't have documents or if they're stale
                if (!documents.length) {
                    setFilters({ status: AnalysisStatus.PROCESSING });
                    await fetchDocuments();
                }

                // Use existing documents if available
                const processingDocs = documents.filter(
                    doc => doc.status === AnalysisStatus.PROCESSING || doc.status === AnalysisStatus.PENDING
                );
                setProcessingCount(processingDocs.length);
            } catch (error) {
                console.error('Error fetching processing documents:', error);
                // Handle rate limiting specifically
                if (error instanceof Error && error.message.includes('Too many requests')) {
                    toast({
                        title: "Rate Limited",
                        description: "Please wait a moment before refreshing",
                        variant: "destructive",
                    });
                    return;
                }
                // Handle authentication errors
                if (error instanceof Error &&
                    (error.message.includes('Could not validate credentials') ||
                        error.message.includes('No authentication token found'))) {
                    handleLogout();
                }
                setProcessingCount(0);
            }
        };

        if (isMounted) {
            fetchProcessingDocuments();
            // Refresh processing count every 2 minutes instead of 30 seconds
            const interval = setInterval(fetchProcessingDocuments, 120000);
            return () => clearInterval(interval);
        }
    }, [isMounted, documents.length]); // Only depend on documents.length instead of entire documents array

    const handleLogout = async () => {
        try {
            logout();
            toast({
                description: "Logged out successfully",
                duration: 2000,
            });
            router.push('/login');
        } catch (error) {
            toast({
                title: "Logout Failed",
                description: "Please try again",
                variant: "destructive",
            });
        }
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm">
                        <ChartBarIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">DIA Platform</h2>
                        <p className="text-xs text-muted-foreground">Document Intelligence Analysis</p>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 h-[calc(100vh-5rem)] w-full">
                <div className="space-y-1 p-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium
                                    transition-all duration-200 ease-in-out
                                    hover:bg-muted/80 hover:shadow-sm
                                    ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }
                                `}
                                onClick={() => setIsOpen(false)}
                            >
                                <div className={`
                                    p-1 rounded-md transition-colors duration-200
                                    ${isActive ? 'bg-primary-foreground/10' : 'bg-background/50 group-hover:bg-background'}
                                `}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div>{item.title}</div>
                                    {item.description && (
                                        <div className="text-xs text-muted-foreground/70 font-normal">
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                                {(item.title === 'Documents' || item.title === 'Analysis') && processingCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-auto px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/15"
                                    >
                                        {processingCount}
                                    </Badge>
                                )}
                                {isActive && (
                                    <ChevronRightIcon className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="sticky bottom-0 z-20 mt-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-muted">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">{user?.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="hover:bg-destructive/10 hover:text-destructive"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Bars3Icon className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-30 h-screen w-72 border-r bg-background",
            className
        )}>
            <SidebarContent />
        </aside>
    );
} 