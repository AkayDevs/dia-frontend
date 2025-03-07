import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Tag } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface TagManagementProps {
    isOpen: boolean;
    onClose: () => void;
    tags: Tag[];
    onCreateTag: (name: string) => Promise<void>;
    onDeleteTag: (tagId: number) => Promise<void>;
}

export const TagManagement = ({
    isOpen,
    onClose,
    tags,
    onCreateTag,
    onDeleteTag
}: TagManagementProps) => {
    const [newTagName, setNewTagName] = useState('');

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        await onCreateTag(newTagName.trim());
        setNewTagName('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Tags</DialogTitle>
                    <DialogDescription>
                        Create and manage tags for your documents.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="New tag name..."
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                        />
                        <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                            <PlusIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {tags.map((tag) => (
                            <div
                                key={tag.id}
                                className="flex items-center justify-between p-2 bg-muted rounded-md"
                            >
                                <div className="flex items-center gap-2">
                                    <span>{tag.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        Created {formatDistanceToNow(new Date(tag.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => onDeleteTag(tag.id)}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 