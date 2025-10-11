import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateDefaultWorkspaceName } from '../utils/workspaceName';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  isLoading?: boolean;
  title?: string;
  placeholder?: string;
}

export function SaveModal({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading = false,
  title = "Save Workspace",
  placeholder = generateDefaultWorkspaceName()
}: SaveModalProps) {
  const [name, setName] = useState(generateDefaultWorkspaceName());

  // Reset name to new default when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(generateDefaultWorkspaceName());
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (name.trim()) {
      await onSave(name.trim());
      setName('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter a name for your video workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
