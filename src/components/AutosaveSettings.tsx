import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, Clock, Database, Wifi } from 'lucide-react';

interface AutosaveSettingsProps {
  autosave: any;
  onClose: () => void;
}

export const AutosaveSettings: React.FC<AutosaveSettingsProps> = ({ autosave, onClose }) => {
  if (!autosave) return null;

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="bg-sidebar border border-border rounded-lg p-4 space-y-4 min-w-80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <h3 className="font-medium">Autosave Settings</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Enable/Disable Autosave */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="autosave-enabled">Enable Autosave</Label>
          <p className="text-xs text-muted-foreground">
            Automatically save your work
          </p>
        </div>
        <Toggle
          pressed={autosave.autosaveEnabled}
          onPressedChange={autosave.toggleAutosave}
          aria-label="Enable Autosave"
        />
      </div>

      {/* Status Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-blue-400" />
          <span>Last Backend Save:</span>
          <span className="text-muted-foreground">
            {formatTimeAgo(autosave.lastAutosaveAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4 text-green-400" />
          <span>Last Local Backup:</span>
          <span className="text-muted-foreground">
            {formatTimeAgo(autosave.lastLocalBackupAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Wifi className="h-4 w-4 text-gray-400" />
          <span>Local Storage:</span>
          <span className="text-muted-foreground">
            {autosave.isLocalStorageAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {autosave.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
          <p className="text-sm text-red-400">
            <strong>Error:</strong> {autosave.error}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={autosave.clearError}
            className="mt-2 text-red-400 hover:text-red-300"
          >
            Clear Error
          </Button>
        </div>
      )}

      {/* Manual Save Button */}
      <div className="pt-2 border-t border-border">
        <Button 
          onClick={autosave.triggerAutosave}
          disabled={autosave.isAutosaving}
          className="w-full"
          variant="outline"
        >
          {autosave.isAutosaving ? 'Saving...' : 'Save Now'}
        </Button>
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Changes are backed up locally every time you edit</p>
        <p>• Backend saves happen every 30-60 seconds</p>
        <p>• Your work is protected even if the browser crashes</p>
      </div>
    </div>
  );
};
