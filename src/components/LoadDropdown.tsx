import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useCompositionStore } from '@/features/editor/store/use-composition-store';

interface LoadDropdownProps {
  onLoad: (composition: any) => Promise<void>;
}

export function LoadDropdown({ onLoad }: LoadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { compositions, isLoading, loadCompositions, loadComposition } = useCompositionStore();

  useEffect(() => {
    if (isOpen && compositions.length === 0) {
      loadCompositions();
    }
  }, [isOpen, compositions.length, loadCompositions]);

  const handleLoad = async (compositionId: string) => {
    const composition = await loadComposition(compositionId);
    if (composition) {
      await onLoad(composition);
      setIsOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex h-8 gap-1 border border-border"
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Load
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        {compositions.length === 0 && !isLoading ? (
          <DropdownMenuItem disabled>
            No compositions found
          </DropdownMenuItem>
        ) : (
          compositions.map((composition) => (
            <DropdownMenuItem
              key={composition.id}
              onClick={() => handleLoad(composition.id)}
              className="flex flex-col items-start p-3"
            >
              <div className="font-medium text-sm">{composition.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(composition.updated_at)} • {Math.round(composition.duration / 1000)}s
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
