import { DocumentType } from '@/enums/document';
import {
    DocumentIcon,
    DocumentTextIcon,
    DocumentChartBarIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';

interface DocumentTypeIconProps {
    type: DocumentType;
    className?: string;
}

export const DocumentTypeIcon = ({ type, className = "h-5 w-5" }: DocumentTypeIconProps) => {
    const icons = {
        [DocumentType.PDF]: <DocumentIcon className={`${className} text-blue-500`} />,
        [DocumentType.DOCX]: <DocumentTextIcon className={`${className} text-indigo-500`} />,
        [DocumentType.XLSX]: <DocumentChartBarIcon className={`${className} text-green-500`} />,
        [DocumentType.IMAGE]: <PhotoIcon className={`${className} text-purple-500`} />,
        [DocumentType.UNKNOWN]: <DocumentIcon className={`${className} text-gray-500`} />
    };
    return icons[type];
}; 