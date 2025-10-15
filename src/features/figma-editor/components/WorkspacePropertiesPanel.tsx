import React, { useState } from 'react';
import { Project } from '../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface WorkspacePropertiesPanelProps {
  project: Project;
  onProjectUpdate: (updates: Partial<Project>) => void;
}

export const WorkspacePropertiesPanel: React.FC<WorkspacePropertiesPanelProps> = ({
  project,
  onProjectUpdate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  const handleDefaultSizeChange = (field: 'w' | 'h', value: number) => {
    onProjectUpdate({
      workspace: {
        ...project.workspace,
        defaultSize: {
          ...project.workspace.defaultSize,
          [field]: value
        }
      }
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    onProjectUpdate({
      workspace: {
        ...project.workspace,
        backgroundColor: color
      }
    });
  };

  const handleGridColorChange = (color: string) => {
    onProjectUpdate({
      workspace: {
        ...project.workspace,
        gridColor: color
      }
    });
  };

  const handlePresetSelect = (preset: { name: string; w: number; h: number }) => {
    handleDefaultSizeChange('w', preset.w);
    handleDefaultSizeChange('h', preset.h);
    setShowPresetDropdown(false);
  };

  const presets = [
    { name: 'HD (1920×1080)', w: 1920, h: 1080 },
    { name: '4K (3840×2160)', w: 3840, h: 2160 },
    { name: 'Square (1080×1080)', w: 1080, h: 1080 },
    { name: 'Mobile (1080×1920)', w: 1080, h: 1920 },
    { name: 'Instagram Story (1080×1920)', w: 1080, h: 1920 },
    { name: 'Instagram Post (1080×1080)', w: 1080, h: 1080 },
    { name: 'YouTube Thumbnail (1280×720)', w: 1280, h: 720 },
    { name: 'Facebook Cover (1200×630)', w: 1200, h: 630 },
    { name: 'Twitter Header (1500×500)', w: 1500, h: 500 },
    { name: 'LinkedIn Post (1200×627)', w: 1200, h: 627 },
    { name: 'TikTok (1080×1920)', w: 1080, h: 1920 },
    { name: 'Pinterest Pin (1000×1500)', w: 1000, h: 1500 }
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showPresetDropdown) {
        setShowPresetDropdown(false);
      }
    };

    if (showPresetDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPresetDropdown]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-8)',
          padding: 'var(--space-8)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'var(--fs-12)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          textAlign: 'left',
          width: '100%',
          borderRadius: 'var(--radius-sm)',
          transition: 'background var(--dur-1) var(--ease-standard)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elev-1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Board Properties
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', paddingLeft: 'var(--space-20)' }}>
          {/* Default Frame Size with Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Default Frame Size
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontSize: 'var(--fs-10)', color: 'var(--text-tertiary)' }}>Width</label>
                <input
                  type="number"
                  value={project.workspace.defaultSize.w}
                  onChange={(e) => handleDefaultSizeChange('w', parseInt(e.target.value) || 1920)}
                  style={{
                    width: 80,
                    padding: 'var(--space-6) var(--space-8)',
                    fontSize: 'var(--fs-12)',
                    background: 'var(--bg-elev-1)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div style={{ fontSize: 'var(--fs-12)', color: 'var(--text-tertiary)', marginTop: 'var(--space-16)' }}>×</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontSize: 'var(--fs-10)', color: 'var(--text-tertiary)' }}>Height</label>
                <input
                  type="number"
                  value={project.workspace.defaultSize.h}
                  onChange={(e) => handleDefaultSizeChange('h', parseInt(e.target.value) || 1080)}
                  style={{
                    width: 80,
                    padding: 'var(--space-6) var(--space-8)',
                    fontSize: 'var(--fs-12)',
                    background: 'var(--bg-elev-1)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                  style={{
                    padding: 'var(--space-6) var(--space-8)',
                    background: 'var(--bg-elev-1)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 'var(--fs-11)',
                    color: 'var(--text-primary)',
                    marginTop: 'var(--space-16)',
                    minWidth: 120
                  }}
                >
                  Presets ▼
                </button>
                {showPresetDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-elev-2)',
                      border: '1px solid var(--stroke)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      zIndex: 100,
                      maxHeight: 200,
                      overflowY: 'auto'
                    }}
                  >
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset)}
                        style={{
                          width: '100%',
                          padding: 'var(--space-8) var(--space-12)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 'var(--fs-11)',
                          color: 'var(--text-primary)',
                          textAlign: 'left',
                          transition: 'background var(--dur-1) var(--ease-standard)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elev-1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Canvas Background
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <input
                type="color"
                value={project.workspace.backgroundColor}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                style={{
                  width: 40,
                  height: 32,
                  border: '1px solid var(--stroke)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: 'none'
                }}
              />
              <input
                type="text"
                value={project.workspace.backgroundColor}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                style={{
                  flex: 1,
                  padding: 'var(--space-6) var(--space-8)',
                  fontSize: 'var(--fs-12)',
                  background: 'var(--bg-elev-1)',
                  border: '1px solid var(--stroke)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace'
                }}
                placeholder="#000000"
              />
            </div>
            <div style={{ fontSize: 'var(--fs-10)', color: 'var(--text-tertiary)', marginTop: 'var(--space-4)' }}>
              Background color of the canvas area
            </div>
          </div>

          {/* Grid Color */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Grid Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <input
                type="color"
                value={project.workspace.gridColor}
                onChange={(e) => handleGridColorChange(e.target.value)}
                style={{
                  width: 40,
                  height: 32,
                  border: '1px solid var(--stroke)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: 'none'
                }}
              />
              <input
                type="text"
                value={project.workspace.gridColor}
                onChange={(e) => handleGridColorChange(e.target.value)}
                style={{
                  flex: 1,
                  padding: 'var(--space-6) var(--space-8)',
                  fontSize: 'var(--fs-12)',
                  background: 'var(--bg-elev-1)',
                  border: '1px solid var(--stroke)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace'
                }}
                placeholder="#333333"
              />
            </div>
            <div style={{ fontSize: 'var(--fs-10)', color: 'var(--text-tertiary)', marginTop: 'var(--space-4)' }}>
              Color of grid dots and lines
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
