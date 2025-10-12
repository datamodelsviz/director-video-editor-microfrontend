import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2, FolderOpen } from 'lucide-react';
import { useCompositionStore } from '@/features/editor/store/use-composition-store';
import { generateDefaultWorkspaceName, extractCreativeWord } from '../utils/workspaceName';
import { WorkspaceIcon } from './WorkspaceIcon';

interface LoadDropdownProps {
  onLoad: (composition: any) => Promise<void>;
  onNewProject: () => void;
}

export function LoadDropdown({ onLoad, onNewProject }: LoadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { compositions, isLoading, loadCompositions, loadComposition, currentCompositionName } = useCompositionStore();

  useEffect(() => {
    if (isOpen) {
      console.log('[LoadDropdown] Dropdown opened, loading compositions...');
      loadCompositions();
    }
  }, [isOpen, loadCompositions]);

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
          className="flex h-8 w-8 items-center justify-center border border-border"
          variant="outline"
          size="icon"
          disabled={isLoading}
          title="Open Workspace"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FolderOpen className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
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
              className="flex items-start gap-3 p-3"
            >
              <WorkspaceIcon 
                word={extractCreativeWord(composition.name)} 
                className="flex-shrink-0 mt-0.5"
              />
              <div className="flex flex-col items-start min-w-0 flex-1">
                <div className="font-medium text-sm truncate w-full">{composition.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(composition.updated_at)} • {Math.round(composition.duration / 1000)}s
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
