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
import { MenuIcon, ShareIcon, Upload, ProportionsIcon } from "lucide-react";
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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
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
          <LoadButton stateManager={stateManager} />
          
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

const LoadButton = ({ stateManager }: { stateManager: StateManager }) => {
  const { setState } = useStore();

  const handleLoad = () => {
    const payload = {
      id: "Uk7lxLDnhIxPzh",
      size: {
        width: 1080,
        height: 1920,
      },
      fps: 30,
      tracks: [
        {
          id: "Rgnly8KFjDjtV8Ff_cIVB",
          accepts: [
            "text",
            "image",
            "video",
            "audio",
            "composition",
            "caption",
            "template",
            "customTrack",
            "customTrack2",
            "illustration",
            "custom",
            "main",
            "shape",
            "linealAudioBars",
            "radialAudioBars",
            "progressFrame",
            "progressBar",
            "rect",
          ],
          type: "video",
          items: ["K27bTuyxlmMNtjn"],
          magnetic: false,
          static: false,
        },
      ],
      trackItemIds: ["K27bTuyxlmMNtjn"],
      trackItemsMap: {
        K27bTuyxlmMNtjn: {
          id: "K27bTuyxlmMNtjn",
          details: {
            width: 360,
            height: 640,
            opacity: 100,
            src: "https://cdn.designcombo.dev/videos/Happiness%20shouldn%E2%80%99t%20depend.mp4",
            volume: 1,
            borderRadius: 0,
            borderWidth: 0,
            borderColor: "#000000",
            boxShadow: {
              color: "#000000",
              x: 0,
              y: 0,
              blur: 0,
            },
            top: "640px",
            left: "360px",
            transform: "scale(3)",
            blur: 0,
            brightness: 100,
            flipX: false,
            flipY: false,
            rotate: "0deg",
            visibility: "visible",
          },
          metadata: {
            previewUrl:
              "https://cdn.designcombo.dev/thumbnails/Happiness-shouldnt-depend.png",
          },
          trim: {
            from: 0,
            to: 23870.113,
          },
          type: "video",
          name: "video",
          playbackRate: 1,
          display: {
            from: 0,
            to: 23870.113,
          },
          duration: 23870.113,
          isMain: false,
        },
      },
      transitionIds: [],
      transitionsMap: {},
      scale: {
        index: 7,
        unit: 300,
        zoom: 0.0033333333333333335,
        segments: 5,
      },
      duration: 23870.113,
      activeIds: [],
      structure: [],
      background: {
        type: "color",
        value: "transparent",
      },
    } as const;

    // 1) Update Zustand store (player/scene rely on this)
    setState({
      size: payload.size,
      fps: payload.fps,
      duration: payload.duration,
      background: payload.background,
      scale: payload.scale,
      tracks: payload.tracks as any,
      trackItemIds: payload.trackItemIds as any,
      trackItemsMap: payload.trackItemsMap as any,
      transitionIds: payload.transitionIds as any,
      transitionsMap: payload.transitionsMap as any,
      structure: payload.structure as any,
      activeIds: payload.activeIds as any,
      scroll: { left: 0, top: 0 },
    });

    // 2) Also add items through the event API so CanvasTimeline reflects them
    Object.values(payload.trackItemsMap as any).forEach((item: any) => {
      const base = {
        id: item.id,
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
        emitEvent(ADD_AUDIO, { payload: base });
      } else if (item.type === "image") {
        emitEvent(ADD_IMAGE, { payload: base, options: { resourceId: "image", scaleMode: "fit" } });
      } else if (item.type === "text") {
        emitEvent(ADD_TEXT, { payload: base });
      }
    });
  };

  return (
    <Button
      onClick={handleLoad}
      className="flex h-8 gap-1 border border-border"
      variant="outline"
    >
      Load
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


