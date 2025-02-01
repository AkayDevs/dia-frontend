'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface AnalysisLayoutProps {
    children: React.ReactNode;
}

function getBreadcrumbs(pathname: string) {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        let label = segment;

        // Handle special cases for analysis path segments
        if (segment === 'analysis') {
            label = 'Analysis';
        } else if (segment === 'results') {
            label = 'Results';
        } else if (segment === 'step') {
            label = 'Step';
        } else {
            // For IDs and other segments, keep them as is but capitalize first letter
            label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        }

        const isLast = index === segments.length - 1;

        return {
            href,
            label,
            isLast
        };
    });

    return breadcrumbs;
}

export default function AnalysisLayout({ children }: AnalysisLayoutProps) {
    const pathname = usePathname();
    const breadcrumbs = getBreadcrumbs(pathname);

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center">
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <BreadcrumbItem key={breadcrumb.href}>
                                {breadcrumb.isLast ? (
                                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                                    </BreadcrumbLink>
                                )}
                                {!breadcrumb.isLast && <BreadcrumbSeparator />}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            {children}
        </div>
    );
}
