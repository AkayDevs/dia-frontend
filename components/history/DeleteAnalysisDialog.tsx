import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AnalysisRunWithResults, AnalysisRunWithResultsInfo } from '@/types/analysis/base';

interface DeleteAnalysisDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedAnalysis: AnalysisRunWithResults | AnalysisRunWithResultsInfo | null;
    onConfirmDelete: () => void;
    isDeleting: boolean;
}

export function DeleteAnalysisDialog({
    open,
    onOpenChange,
    selectedAnalysis,
    onConfirmDelete,
    isDeleting
}: DeleteAnalysisDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this analysis? This action cannot be undone
                        and will also delete the associated document.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirmDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 