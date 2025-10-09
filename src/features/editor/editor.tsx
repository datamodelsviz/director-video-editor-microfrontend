"use client";
import Timeline from "./timeline";
import useStore from "./store/use-store";
import Navbar from "./navbar";
import useTimelineEvents from "./hooks/use-timeline-events";
import Scene from "./scene";
import StateManager from "@designcombo/state";
import { useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { getCompactFontData, loadFonts } from "./utils/fonts";
import { SECONDARY_FONT, SECONDARY_FONT_URL } from "./constants/constants";
import MenuList from "./menu-list";
import { MenuItem } from "./menu-item";
import CropModal from "./crop-modal/crop-modal";
import useDataState from "./store/use-data-state";
import { FONTS } from "./data/fonts";
import FloatingControl from "./control-item/floating-controls/floating-control";
import useLayoutStore from "./store/use-layout-store";
import { useCompositionStore } from "./store/use-composition-store";
import { RightDrawer } from "./components";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { dispatch as emitEvent } from "@designcombo/events";
import { ADD_AUDIO, ADD_IMAGE, ADD_TEXT, ADD_VIDEO } from "@designcombo/state";
import { parentComm } from "../../services/parentCommunication";

const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});

const Editor = () => {
  const [projectName, setProjectName] = useState<string>("Untitled video");
  const timelinePanelRef = useRef<ImperativePanelHandle>(null);
  const { timeline, playerRef } = useStore();
  const { isSidebarHovered, setIsSidebarHovered } = useLayoutStore();
  const { loadComposition, setCurrentComposition, isLoading, error } = useCompositionStore();

  // Debug: Log current URL and parsed parameters
  useEffect(() => {
    console.log('=== EDITOR INITIALIZATION ===');
    console.log('Current URL:', window.location.href);
    console.log('Search params:', window.location.search);
    const urlParams = new URLSearchParams(window.location.search);
    const compositionId = urlParams.get('composition');
    console.log('Parsed composition ID:', compositionId);
    console.log('API readiness:', parentComm.isReadyForAPI());
    console.log('================================');
  }, []);

  // Handle composition loading - same logic as navbar
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

  useTimelineEvents();
  useKeyboardShortcuts();
  
  // Debug composition store state
  useEffect(() => {
    console.log('Composition store state changed:', { isLoading, error });
  }, [isLoading, error]);
  
  // Debug hover state changes
  useEffect(() => {
    console.log('Hover state changed:', isSidebarHovered);
  }, [isSidebarHovered]);

  // Handle click outside to hide panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside the sidebar and outside the floating panel
      if (!target.closest('.sidebar-container') && !target.closest('.floating-panel')) {
        setIsSidebarHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsSidebarHovered]);

  const { setCompactFonts, setFonts } = useDataState();

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  useEffect(() => {
    loadFonts([
      {
        name: SECONDARY_FONT,
        url: SECONDARY_FONT_URL,
      },
    ]);
  }, []);

  useEffect(() => {
    const screenHeight = window.innerHeight;
    const desiredHeight = 300;
    const percentage = (desiredHeight / screenHeight) * 100;
    timelinePanelRef.current?.resize(percentage);
  }, []);

  // Add unsaved changes warning
  const { hasUnsavedChanges } = useCompositionStore();
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-load composition from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const compositionId = urlParams.get('composition');
    
    if (!compositionId) {
      return;
    }
    
    console.log('Found composition ID in URL:', compositionId);
    let hasLoaded = false;
    
    const waitForAPIAndLoad = async () => {
      if (hasLoaded) {
        console.log('Composition already loaded, skipping');
        return;
      }
      
      // Wait for API to be ready
      let attempts = 0;
      const maxAttempts = 50; // 10 seconds max wait
      
      while (!parentComm.isReadyForAPI() && attempts < maxAttempts) {
        console.log(`Waiting for API readiness... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }
      
      if (!parentComm.isReadyForAPI()) {
        console.error('API not ready after 10 seconds, cannot load composition from URL');
        return;
      }
      
      console.log('API is ready, loading composition from URL:', compositionId);
      console.log('Auth token available:', !!parentComm.getAuthToken());
      
      try {
        console.log('Calling loadComposition...');
        const composition = await loadComposition(compositionId);
        console.log('loadComposition result:', composition);
        
        if (composition) {
          hasLoaded = true;
          console.log('Successfully loaded composition from URL:', composition.name);
          setProjectName(composition.name);
          console.log('Calling handleLoad...');
          // Load the composition data into the editor
          await handleLoad(composition);
          console.log('Composition loaded and applied to editor');
        } else {
          console.error('Failed to load composition from URL - composition is null/undefined:', compositionId);
        }
      } catch (error) {
        console.error('Error loading composition from URL:', error);
        console.error('Error details:', error);
      }
    };
    
    // Start the loading process with a small delay
    const timeoutId = setTimeout(waitForAPIAndLoad, 500);
    return () => {
      hasLoaded = true; // Mark as loaded on cleanup
      clearTimeout(timeoutId);
    };
  }, []); // Empty deps - only run once on mount

  const handleTimelineResize = () => {
    const timelineContainer = document.getElementById("timeline-container");
    if (!timelineContainer) return;

    timeline?.resize(
      {
        height: timelineContainer.clientHeight - 90,
        width: timelineContainer.clientWidth - 40,
      },
      {
        force: true,
      },
    );
  };

  useEffect(() => {
    const onResize = () => handleTimelineResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [timeline]);

  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar
        projectName={projectName}
        user={null}
        stateManager={stateManager}
        setProjectName={setProjectName}
        showMenuButton={false}
        showShareButton={false}
        showDiscordButton={false}
        onLoadComposition={handleLoad}
      />
      <div className="flex flex-1">
        <ResizablePanelGroup style={{ flex: 1 }} direction="vertical">
          <ResizablePanel className="relative" defaultSize={70}>
            <FloatingControl />
            <div className="flex h-full flex-1">
              <div className="sidebar-container bg-sidebar flex flex-none">
                <MenuList />
              </div>
              
              {/* Floating panel - appears on click of sidebar icons */}
              <div className="relative">
                <div className={`floating-panel fixed left-16 top-[58px] z-[9999] transition-all duration-200 ${
                  isSidebarHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}>
                  <div className="bg-zinc-900 border border-border/80 rounded-lg shadow-xl min-w-[280px] max-w-[320px] h-[calc(100vh-80px)] overflow-hidden">
                    <div className="h-full overflow-y-auto">
                      <MenuItem />
                    </div>
                  </div>
                </div>
              </div>
              
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <CropModal />
                <Scene stateManager={stateManager} />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            className="min-h-[50px]"
            ref={timelinePanelRef}
            defaultSize={30}
            onResize={handleTimelineResize}
          >
            {playerRef && <Timeline stateManager={stateManager} />}
          </ResizablePanel>
        </ResizablePanelGroup>
        
        {/* Right Drawer - appears when needed */}
        <RightDrawer />
      </div>
    </div>
  );
};

export default Editor;
