import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import AutosizeInput from "@/components/ui/autosize-input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import { MenuIcon, ShareIcon, Upload, ProportionsIcon, Save, Plus, ChevronDown } from "lucide-react";
import StateManager from "@designcombo/state";
import { dispatch as emitEvent } from "@designcombo/events";
import { HISTORY_UNDO, HISTORY_REDO, DESIGN_RESIZE } from "@designcombo/state";
import useLayoutStore from "./store/use-layout-store";
import { useDownloadState } from "./store/use-download-state";
import { generateId } from "@designcombo/timeline";
import { IDesign } from "@designcombo/types";
import useStore from "./store/use-store";
import { dispatch } from "@designcombo/events";
import { ADD_AUDIO, ADD_IMAGE, ADD_TEXT, ADD_VIDEO } from "@designcombo/state";
import { SaveModal } from "@/components/SaveModal";
import { LoadDropdown } from "@/components/LoadDropdown";
import { useCompositionStore } from "./store/use-composition-store";

export default function Navbar({
  user,
  stateManager,
  setProjectName,
  projectName,
  showMenuButton = true,
  showShareButton = true,
  showDiscordButton = true,
}: {
  user: null;
  stateManager: StateManager;
  setProjectName: (name: string) => void;
  projectName: string;
  showMenuButton?: boolean;
  showShareButton?: boolean;
  showDiscordButton?: boolean;
}) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const { 
    saveComposition, 
    updateComposition,
    loadComposition, 
    currentComposition, 
    hasUnsavedChanges,
    setCurrentComposition,
    markUnsavedChanges,
    isLoading
  } = useCompositionStore();
  const [title, setTitle] = useState(projectName);

  const handleUndo = () => {
    dispatch(HISTORY_UNDO);
  };

  const handleRedo = () => {
    dispatch(HISTORY_REDO);
  };

  const handleCreateProject = async () => {};

  // Create a debounced function for setting the project name
  const debouncedSetProjectName = useCallback(
    debounce((name: string) => {
      console.log("Debounced setProjectName:", name);
      setProjectName(name);
    }, 2000), // 2 seconds delay
    [],
  );

  // Update the debounced function whenever the title changes
  useEffect(() => {
    debouncedSetProjectName(title);
  }, [title, debouncedSetProjectName]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Handle Save (update existing or create new)
  const handleSave = async () => {
    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };
    
    if (currentComposition) {
      // Update existing composition
      const result = await updateComposition(currentComposition.id, data);
      if (result) {
        console.log('Composition updated successfully:', result);
      }
    } else {
      // No current composition, open Save As modal
      setShowSaveAsModal(true);
    }
  };

  // Handle Save As (always create new)
  const handleSaveAs = async (name: string) => {
    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };
    
    const result = await saveComposition(name, data);
    if (result) {
      setCurrentComposition(result);
      console.log('Composition saved as:', result);
    }
  };

  const handleLoad = async (composition: any) => {
    // Load the saved data and validate timing values
    const payload = composition.design;
    console.log('Loading composition payload:', payload);
    
    // Validate and fix timing values in trackItemsMap
    const validatedTrackItemsMap = { ...payload.trackItemsMap };
    Object.keys(validatedTrackItemsMap).forEach(itemId => {
      const item = validatedTrackItemsMap[itemId];
      console.log(`Validating item ${itemId}:`, item);
      
      if (item && item.display) {
        // Ensure display.from and display.to are valid numbers
        if (typeof item.display.from !== 'number' || isNaN(item.display.from)) {
          console.log(`Fixing display.from for ${itemId}: ${item.display.from} -> 0`);
          item.display.from = 0;
        }
        if (typeof item.display.to !== 'number' || isNaN(item.display.to)) {
          console.log(`Fixing display.to for ${itemId}: ${item.display.to} -> ${item.display.from + 5000}`);
          item.display.to = item.display.from + 5000; // Default 5 seconds
        }
        
        // Ensure trim values are valid if they exist
        if (item.trim) {
          if (typeof item.trim.from !== 'number' || isNaN(item.trim.from)) {
            console.log(`Fixing trim.from for ${itemId}: ${item.trim.from} -> 0`);
            item.trim.from = 0;
          }
          if (typeof item.trim.to !== 'number' || isNaN(item.trim.to)) {
            console.log(`Fixing trim.to for ${itemId}: ${item.trim.to} -> ${item.duration || 5000}`);
            item.trim.to = item.duration || 5000;
          }
        }
        
        // Ensure duration is valid
        if (typeof item.duration !== 'number' || isNaN(item.duration)) {
          console.log(`Fixing duration for ${itemId}: ${item.duration} -> ${item.display.to - item.display.from}`);
          item.duration = item.display.to - item.display.from;
        }
      }
    });
    
    console.log('Validated trackItemsMap:', validatedTrackItemsMap);
    
    // Update StateManager first
    stateManager.updateState({
      size: payload.size || { width: 1080, height: 1920 },
      fps: payload.fps || 30,
      duration: payload.duration || 5000,
      background: payload.background || { type: 'color', value: 'transparent' },
      scale: payload.scale || { index: 7, unit: 300, zoom: 0.0033333333333333335, segments: 5 },
      tracks: payload.tracks || [],
      trackItemIds: payload.trackItemIds || [],
      trackItemsMap: validatedTrackItemsMap,
      transitionIds: payload.transitionIds || [],
      transitionsMap: payload.transitionsMap || {},
      structure: payload.structure || [],
      activeIds: payload.activeIds || [],
    });
    
    // Update Zustand store with the validated data
    const { setState } = useStore.getState();
    setState({
      size: payload.size || { width: 1080, height: 1920 },
      fps: payload.fps || 30,
      duration: payload.duration || 5000,
      background: payload.background || { type: 'color', value: 'transparent' },
      scale: payload.scale || { index: 7, unit: 300, zoom: 0.0033333333333333335, segments: 5 },
      tracks: payload.tracks || [],
      trackItemIds: payload.trackItemIds || [],
      trackItemsMap: validatedTrackItemsMap,
      transitionIds: payload.transitionIds || [],
      transitionsMap: payload.transitionsMap || {},
      structure: payload.structure || [],
      activeIds: payload.activeIds || [],
      scroll: { left: 0, top: 0 },
    });

    // Set current composition and mark as clean
    setCurrentComposition(composition);

    // Add items through the event API so CanvasTimeline reflects them
    await new Promise(resolve => setTimeout(resolve, 100));
    
    for (let i = 0; i < payload.trackItemIds.length; i++) {
      const itemId = payload.trackItemIds[i];
      const item = validatedTrackItemsMap[itemId] as any;
      if (!item) continue;
      
      const base = {
        id: item.id,
        type: item.type,
        details: item.details,
        metadata: item.metadata,
        trim: item.trim,
        display: item.display,
        playbackRate: item.playbackRate,
        duration: item.duration,
        name: item.name,
      } as any;

      if (item.type === "video") {
        emitEvent(ADD_VIDEO, { payload: base, options: { resourceId: "main", scaleMode: "fit" } });
      } else if (item.type === "audio") {
        const audioPayload = {
          id: item.id,
          type: item.type,
          name: item.name,
          display: item.display,
          trim: item.trim,
          playbackRate: item.playbackRate,
          duration: item.duration,
          details: item.details,
          metadata: item.metadata,
        };
        emitEvent(ADD_AUDIO, { payload: audioPayload, options: {} });
      } else if (item.type === "image") {
        emitEvent(ADD_IMAGE, { payload: base, options: { resourceId: "image", scaleMode: "fit" } });
      } else if (item.type === "text") {
        const textPayload = {
          id: item.id,
          type: item.type,
          display: item.display,
          details: item.details,
          name: item.name,
        };
        emitEvent(ADD_TEXT, { payload: textPayload, options: {} });
      }
      
      if (i < payload.trackItemIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    // Force timeline refresh
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.dispatchEvent(new Event('resize'));
      }
    }, 200);
  };

  const handleNewProject = () => {
    // Reset project name
    setProjectName('Untitled');
    
    // Clear current composition from store
    setCurrentComposition(null);
    
    // Clear StateManager state first
    stateManager.updateState({
      size: { width: 1080, height: 1920 },
      fps: 30,
      duration: 5000,
      background: { type: 'color', value: 'transparent' },
      scale: { index: 7, unit: 300, zoom: 0.0033333333333333335, segments: 5 },
      tracks: [],
      trackItemIds: [],
      trackItemsMap: {},
      transitionIds: [],
      transitionsMap: {},
      structure: [],
      activeIds: [],
    });
    
    // Reset the Zustand store to initial state
    const { setState } = useStore.getState();
    setState({
      size: { width: 1080, height: 1920 },
      fps: 30,
      duration: 5000,
      background: { type: 'color', value: 'transparent' },
      scale: { index: 7, unit: 300, zoom: 0.0033333333333333335, segments: 5 },
      tracks: [],
      trackItemIds: [],
      trackItemsMap: {},
      transitionIds: [],
      transitionsMap: {},
      structure: [],
      activeIds: [],
      scroll: { left: 0, top: 0 },
    });
    
    // Force timeline refresh
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.dispatchEvent(new Event('resize'));
      }
    }, 200);
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 320px",
        }}
        className="bg-sidebar pointer-events-none flex h-[58px] items-center px-2"
      >


      <div className="flex items-center gap-2">
        {showMenuButton && (
          <div className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-md text-zinc-200">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="hover:bg-background-subtle flex h-8 w-8 items-center justify-center">
                  <MenuIcon className="h-5 w-5" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-[300] w-56 p-2" align="start">
                <DropdownMenuItem
                  onClick={handleCreateProject}
                  className="cursor-pointer text-muted-foreground"
                >
                  New project
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-muted-foreground">
                  My projects
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCreateProject}
                  className="cursor-pointer text-muted-foreground"
                >
                  Duplicate project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center px-1.5">
          {/* ResizeVideo moved to timeline header */}
        </div>
        
        {/* Undo/Redo buttons - hidden for now */}
        {/* <div className="bg-sidebar pointer-events-auto flex h-12 items-center gap-1 rounded-md px-2">
          <Button
            onClick={handleUndo}
            className="text-muted-foreground hover:text-zinc-200 transition-colors"
            variant="ghost"
            size="icon"
          >
            <Icons.undo width={18} />
          </Button>
          <Button
            onClick={handleRedo}
            className="text-muted-foreground hover:text-zinc-200 transition-colors"
            variant="ghost"
            size="icon"
          >
            <Icons.redo width={18} />
          </Button>
        </div> */}
      </div>

      {/* Center section - Load Dropdown with Save and Plus buttons */}
      <div className="flex h-14 items-center justify-center">
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center gap-2 rounded-md px-2.5">
          <LoadDropdown onLoad={handleLoad} onNewProject={handleNewProject} />
          <Button
            onClick={handleNewProject}
            className="flex h-8 w-8 items-center justify-center border border-border"
            variant="outline"
            size="icon"
            title="New Project"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {/* Save dropdown - icon only with dropdown options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={!hasUnsavedChanges && currentComposition}
                className="flex h-8 w-8 items-center justify-center border border-border"
                variant="outline"
                size="icon"
                title={currentComposition ? 'Save' : 'Save As'}
              >
                <Save className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleSave}
                disabled={!hasUnsavedChanges && currentComposition}
                className="cursor-pointer"
              >
                <Save className="mr-2 h-4 w-4" />
                {currentComposition ? 'Save' : 'Save As'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowSaveAsModal(true)}
                className="cursor-pointer"
              >
                <Save className="mr-2 h-4 w-4" />
                Save As...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right section - Other buttons */}
      <div className="flex h-14 items-center justify-end gap-2">
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center gap-2 rounded-md px-2.5">
          {showShareButton && (
            <Button
              className="flex h-8 gap-1 border border-border"
              variant="outline"
            >
              <ShareIcon width={18} /> Share
            </Button>
          )}
          <ExportButton stateManager={stateManager} />
          
          {showDiscordButton && (
            <Button
              className="flex h-8 gap-1 border border-border"
              variant="default"
              onClick={() => {
                window.open("https://discord.gg/jrZs3wZyM5", "_blank");
              }}
            >
              Discord
            </Button>
          )}
        </div>
      </div>
      </div>
      
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        isLoading={isLoading}
      />

      <SaveModal
        isOpen={showSaveAsModal}
        onClose={() => setShowSaveAsModal(false)}
        onSave={handleSaveAs}
        isLoading={isLoading}
        title="Save As"
        placeholder="Enter new composition name"
      />
    </>
  );
}

const ExportButton = ({ stateManager }: { stateManager: StateManager }) => {
  const { actions, exporting } = useDownloadState();

  // Debug: Log the exporting state
  console.log('ExportButton render - exporting state:', exporting);

  const handleExport = () => {
    console.log('ExportButton clicked - starting export');
    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };

    console.log('🔍 StateManager.getState():', stateManager.getState());
    console.log('🔍 StateManager trackItemsMap:', (stateManager.getState() as any).trackItemsMap);
    
    // Log a specific audio item if it exists
    const trackItems = (stateManager.getState() as any).trackItemsMap || {};
    const audioItems = Object.entries(trackItems).filter(([id, item]: [string, any]) => item?.type === 'audio');
    if (audioItems.length > 0) {
      const [audioId, audioItem] = audioItems[0];
      const typedAudioItem = audioItem as any;
      console.log(`🔍 Sample audio item ${audioId}:`, {
        item: audioItem,
        hasTrim: !!typedAudioItem?.trim,
        trim: typedAudioItem?.trim,
        hasPlaybackRate: typedAudioItem?.playbackRate !== undefined,
        playbackRate: typedAudioItem?.playbackRate,
        keys: Object.keys(audioItem || {}),
        enumerableKeys: Object.getOwnPropertyNames(audioItem || {}),
        prototype: Object.getPrototypeOf(audioItem),
        isClassInstance: audioItem?.constructor?.name !== 'Object',
      });
    }

    actions.setState({ payload: data });
    actions.startExport();
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      className="flex h-8 gap-1 border border-border transition-all duration-200"
      variant="outline"
      style={{
        backgroundColor: exporting 
          ? 'rgba(156, 163, 175, 0.8)' // gray-400/80 when disabled
          : 'rgba(255, 255, 255, 0.9)', // white/90
        color: exporting ? 'white' : 'black',
        borderColor: exporting 
          ? 'rgb(156, 163, 175)' // gray-400 when disabled
          : 'rgb(255, 255, 255)',
        cursor: exporting ? 'not-allowed' : 'pointer'
      }}
      onMouseEnter={(e) => {
        if (!exporting) {
          e.currentTarget.style.backgroundColor = 'rgb(255, 255, 255)'; // white
        }
      }}
      onMouseLeave={(e) => {
        if (!exporting) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // white/90
        }
      }}
    >
      {exporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          RENDERING...
        </>
      ) : (
        <>
          <Upload width={18} /> RENDER
        </>
      )}
    </Button>
  );
};


interface ResizeOptionProps {
  label: string;
  icon: string;
  value: ResizeValue;
  description: string;
}

interface ResizeValue {
  width: number;
  height: number;
  name: string;
}

const RESIZE_OPTIONS: ResizeOptionProps[] = [
  {
    label: "16:9",
    icon: "landscape",
    description: "YouTube ads",
    value: {
      width: 1920,
      height: 1080,
      name: "16:9",
    },
  },
  {
    label: "9:16",
    icon: "portrait",
    description: "TikTok, YouTube Shorts",
    value: {
      width: 1080,
      height: 1920,
      name: "9:16",
    },
  },
  {
    label: "1:1",
    icon: "square",
    description: "Instagram, Facebook posts",
    value: {
      width: 1080,
      height: 1080,
      name: "1:1",
    },
  },
];

const ResizeVideo = () => {
  const [open, setOpen] = useState(false);
  
  const handleResize = (options: ResizeValue) => {
    dispatch(DESIGN_RESIZE, {
      payload: {
        ...options,
      },
    });
    // Close the popover after selection
    setOpen(false);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="z-10 gap-2 border border-border" variant="outline">
          <ProportionsIcon className="h-4 w-4" />
          <div>Resize</div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[250] w-60 px-2.5 py-3">
        <div className="text-sm">
          {RESIZE_OPTIONS.map((option, index) => (
            <ResizeOption
              key={index}
              label={option.label}
              icon={option.icon}
              value={option.value}
              handleResize={handleResize}
              description={option.description}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ResizeOption = ({
  label,
  icon,
  value,
  description,
  handleResize,
}: ResizeOptionProps & { handleResize: (payload: ResizeValue) => void }) => {
  const Icon = Icons[icon as "text"];
  return (
    <div
      onClick={() => handleResize(value)}
      className="flex cursor-pointer items-center rounded-md p-2 hover:bg-zinc-50/10"
    >
      <div className="w-8 text-muted-foreground">
        <Icon size={20} />
      </div>
      <div>
        <div>{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
};


