import { FileText, FileStack, Table as TableIcon } from 'lucide-react';

interface AnalysisTypeIconProps {
    type: string;
    className?: string;
}

export const AnalysisTypeIcon = ({ type, className = "h-5 w-5" }: AnalysisTypeIconProps) => {
    const icons: Record<string, JSX.Element> = {
        'table_analysis': <TableIcon className={className} />,
        'text_analysis': <FileText className={className} />,
        'template_conversion': <FileStack className={className} />
    };
    return icons[type] || <FileText className={className} />;
}; 