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
import { generateDefaultWorkspaceName } from '../utils/workspaceName';

interface LoadDropdownProps {
  onLoad: (composition: any) => Promise<void>;
  onNewProject: () => void;
}

export function LoadDropdown({ onLoad, onNewProject }: LoadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { compositions, isLoading, loadCompositions, loadComposition, currentCompositionName } = useCompositionStore();

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

  // Get display name - show current composition name or "Untitled" as default
  const getDisplayName = () => {
    return currentCompositionName || 'Untitled';
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
          title="Switch Workspace"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {getDisplayName()}
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        {/* Always show Untitled as the first option */}
        <DropdownMenuItem
          onClick={() => {
            onNewProject();
            setIsOpen(false);
          }}
          className="flex flex-col items-start p-3"
        >
          <div className="font-medium text-sm">{generateDefaultWorkspaceName()}</div>
          <div className="text-xs text-muted-foreground">
            New workspace
          </div>
        </DropdownMenuItem>
        
        {/* Show compositions if available */}
        {compositions.length === 0 && !isLoading ? (
          <DropdownMenuItem disabled>
            No saved workspaces
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
