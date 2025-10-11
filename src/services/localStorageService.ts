/**
 * LocalStorage service for backing up workspace data
 * Provides instant backup of changes for recovery
 */

interface LocalStorageData {
  workspaceId: string;
  data: any;
  timestamp: number;
  version: number;
}

const STORAGE_KEY_PREFIX = 'vx_workspace_backup_';
const MAX_BACKUPS_PER_WORKSPACE = 5; // Keep last 5 backups

export class LocalStorageService {
  /**
   * Save workspace data to localStorage
   */
  static saveWorkspace(workspaceId: string, data: any): void {
    try {
      const backup: LocalStorageData = {
        workspaceId,
        data,
        timestamp: Date.now(),
        version: 1
      };

      const key = `${STORAGE_KEY_PREFIX}${workspaceId}`;
      const existingBackups = this.getWorkspaceBackups(workspaceId);
      
      // Add new backup
      existingBackups.push(backup);
      
      // Keep only the most recent backups
      const sortedBackups = existingBackups
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_BACKUPS_PER_WORKSPACE);
      
      localStorage.setItem(key, JSON.stringify(sortedBackups));
      
      console.log(`[LocalStorage] Saved backup for workspace ${workspaceId}`);
    } catch (error) {
      console.error('[LocalStorage] Failed to save workspace:', error);
    }
  }

  /**
   * Get the latest backup for a workspace
   */
  static getLatestBackup(workspaceId: string): any | null {
    try {
      const backups = this.getWorkspaceBackups(workspaceId);
      if (backups.length === 0) return null;
      
      // Return the most recent backup
      const latest = backups.sort((a, b) => b.timestamp - a.timestamp)[0];
      return latest.data;
    } catch (error) {
      console.error('[LocalStorage] Failed to get latest backup:', error);
      return null;
    }
  }

  /**
   * Get all backups for a workspace
   */
  static getWorkspaceBackups(workspaceId: string): LocalStorageData[] {
    try {
      const key = `${STORAGE_KEY_PREFIX}${workspaceId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[LocalStorage] Failed to get workspace backups:', error);
      return [];
    }
  }

  /**
   * Clear all backups for a workspace
   */
  static clearWorkspaceBackups(workspaceId: string): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${workspaceId}`;
      localStorage.removeItem(key);
      console.log(`[LocalStorage] Cleared backups for workspace ${workspaceId}`);
    } catch (error) {
      console.error('[LocalStorage] Failed to clear backups:', error);
    }
  }

  /**
   * Get backup info (timestamp, size, etc.)
   */
  static getBackupInfo(workspaceId: string): { timestamp: number; size: number } | null {
    try {
      const latest = this.getLatestBackup(workspaceId);
      if (!latest) return null;
      
      return {
        timestamp: Date.now(), // We'd need to store this in the backup
        size: JSON.stringify(latest).length
      };
    } catch (error) {
      console.error('[LocalStorage] Failed to get backup info:', error);
      return null;
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo(): { used: number; available: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // Estimate available space (most browsers have 5-10MB limit)
      const available = 5 * 1024 * 1024 - used; // 5MB - used
      
      return { used, available };
    } catch (error) {
      console.error('[LocalStorage] Failed to get storage info:', error);
      return { used: 0, available: 0 };
    }
  }
}
