import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    Loader2,
    FileBox,
    FileText,
    Files,
    FileSpreadsheet,
    FileImage,
    FileJson,
    FileCode,
    FilePieChart,
    FileBarChart,
    FileArchive,
    FileQuestion,
    FileX
} from "lucide-react";

export const ANALYSIS_STATUS_ICONS = {
    pending: <Loader2 className="h-4 w-4 animate-spin" />,
    in_progress: <ClockIcon className="h-4 w-4 animate-spin" />,
    completed: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
    failed: <XCircleIcon className="h-4 w-4 text-red-500" />,
    cancelled: <XCircleIcon className="h-4 w-4 text-red-500" />
};

/**
 * Document type icons with distinctive colors
 */
export const DOCUMENT_TYPE_ICONS = {
    // Common document formats
    pdf: <FileText className="h-4 w-4 text-red-500" />,
    docx: <FileBox className="h-4 w-4 text-blue-500" />,
    doc: <FileBox className="h-4 w-4 text-blue-500" />,
    txt: <FileText className="h-4 w-4 text-gray-500" />,
    rtf: <FileText className="h-4 w-4 text-gray-600" />,

    // Spreadsheet formats
    csv: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
    xlsx: <FileSpreadsheet className="h-4 w-4 text-green-600" />,
    xls: <FileSpreadsheet className="h-4 w-4 text-green-600" />,

    // Image formats
    jpg: <FileImage className="h-4 w-4 text-purple-500" />,
    jpeg: <FileImage className="h-4 w-4 text-purple-500" />,
    png: <FileImage className="h-4 w-4 text-purple-600" />,
    gif: <FileImage className="h-4 w-4 text-purple-400" />,

    // Data formats
    json: <FileJson className="h-4 w-4 text-yellow-500" />,
    xml: <FileCode className="h-4 w-4 text-orange-500" />,
    yaml: <FileCode className="h-4 w-4 text-orange-400" />,

    // Analysis formats
    ipynb: <FileBarChart className="h-4 w-4 text-indigo-500" />,
    r: <FilePieChart className="h-4 w-4 text-blue-400" />,
    py: <FileCode className="h-4 w-4 text-blue-400" />,

    // Archive formats
    zip: <FileArchive className="h-4 w-4 text-amber-500" />,
    rar: <FileArchive className="h-4 w-4 text-amber-600" />,

    // Default/unknown
    unknown: <FileQuestion className="h-4 w-4 text-gray-400" />,
    error: <FileX className="h-4 w-4 text-red-400" />
};

/**
 * Get document type icon by file extension
 * @param fileType File extension or document type
 * @returns Icon component for the document type
 */
export function getDocumentTypeIcon(fileType: string | undefined) {
    if (!fileType) return DOCUMENT_TYPE_ICONS.unknown;

    const type = fileType.toLowerCase();
    return DOCUMENT_TYPE_ICONS[type as keyof typeof DOCUMENT_TYPE_ICONS] || DOCUMENT_TYPE_ICONS.unknown;
}
