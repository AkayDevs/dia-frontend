import { Tag } from '@/types/document';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface DocumentTagsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    tags: Tag[];
    selectedTags: Set<number>;
    onTagsChange: (tagIds: number[]) => Promise<void>;
}

export const DocumentTagsDialog = ({
    isOpen,
    onClose,
    tags,
    selectedTags,
    onTagsChange
}: DocumentTagsDialogProps) => {
    const handleSave = async () => {
        await onTagsChange(Array.from(selectedTags));
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Document Tags</DialogTitle>
                    <DialogDescription>
                        Select or remove tags for this document
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {tags.map((tag) => (
                            <div
                                key={tag.id}
                                className={cn(
                                    "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                                    selectedTags.has(tag.id)
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                )}
                                onClick={() => {
                                    const newSelectedTags = new Set(selectedTags);
                                    if (newSelectedTags.has(tag.id)) {
                                        newSelectedTags.delete(tag.id);
                                    } else {
                                        newSelectedTags.add(tag.id);
                                    }
                                    onTagsChange(Array.from(newSelectedTags));
                                }}
                            >
                                <span>{tag.name}</span>
                                {selectedTags.has(tag.id) ? (
                                    <XMarkIcon className="h-4 w-4" />
                                ) : (
                                    <PlusIcon className="h-4 w-4" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter className="flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={() => onTagsChange([])}
                    >
                        Clear All
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save Changes
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 