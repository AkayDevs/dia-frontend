import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TagIcon } from '@heroicons/react/24/outline';
import { Tag } from '@/types/document';

interface DocumentTagsSectionProps {
    tags: Tag[];
    onManageTags: () => void;
}

export const DocumentTagsSection = ({
    tags,
    onManageTags
}: DocumentTagsSectionProps) => {
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                <Button variant="outline" size="sm" onClick={onManageTags}>
                    <TagIcon className="w-4 h-4 mr-2" />
                    Manage Tags
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                        {tag.name}
                    </Badge>
                ))}
                {tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">No tags added</p>
                )}
            </div>
        </Card>
    );
}; 