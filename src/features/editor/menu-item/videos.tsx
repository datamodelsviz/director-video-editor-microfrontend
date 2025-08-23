import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VIDEOS } from "../data/video";
import { dispatch } from "@designcombo/events";
import { ADD_VIDEO } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { IVideo } from "@designcombo/types";
import React, { useState } from "react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import { useVideosData } from "../data/use-videos-data";
import { Plus } from "lucide-react";

// Skeleton loader component for video cards
const VideoCardSkeleton = () => (
  <div className="w-full aspect-square bg-muted rounded-md animate-pulse">
    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 rounded-md flex items-center justify-center">
      <div className="w-6 h-6 bg-muted-foreground/20 rounded-full animate-pulse"></div>
    </div>
  </div>
);

export const Videos = () => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();
  const { videos, loading, error } = useVideosData();

  const handleAddVideo = (payload: Partial<IVideo>) => {
    // payload.details.src = "https://cdn.designcombo.dev/videos/timer-20s.mp4";
    dispatch(ADD_VIDEO, {
      payload,
      options: {
        resourceId: "main",
        scaleMode: "fit",
      },
    });
  };

  // Show skeleton loaders while API is loading
  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
          Videos
          <span className="ml-2 text-xs text-zinc-400">(Loading...)</span>
        </div>
        <ScrollArea>
          <div className="masonry-sm px-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <VideoCardSkeleton key={index} />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Videos
        {error && (
          <span className="ml-2 text-xs text-red-400">(API Error)</span>
        )}
      </div>
      <ScrollArea>
        <div className="masonry-sm px-4">
          {videos.map((video, index) => {
            return (
              <VideoItem
                key={index}
                video={video}
                shouldDisplayPreview={!isDraggingOverTimeline}
                handleAddImage={handleAddVideo}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

const VideoItem = ({
  handleAddImage,
  video,
  shouldDisplayPreview,
}: {
  handleAddImage: (payload: Partial<IVideo>) => void;
  video: Partial<IVideo>;
  shouldDisplayPreview: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const style = React.useMemo(
    () => ({
      backgroundImage: `url(${video.preview})`,
      backgroundSize: "cover",
      width: "80px",
      height: "80px",
    }),
    [video.preview],
  );

  const handleVideoAdd = async (payload: Partial<IVideo>) => {
    if (isAdding) return; // Prevent multiple clicks
    
    setIsAdding(true);
    try {
      // Simulate a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 400));
      handleAddImage(payload);
    } finally {
      // Keep loading state for a bit longer to show completion
      setTimeout(() => setIsAdding(false), 600);
    }
  };

  return (
    <Draggable
      data={{
        ...video,
        metadata: {
          previewUrl: video.preview,
        },
      }}
      renderCustomPreview={<div style={style} className="draggable" />}
      shouldDisplayPreview={shouldDisplayPreview}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() =>
          handleVideoAdd({
            id: generateId(),
            details: {
              src: video.details!.src,
            },
            metadata: {
              previewUrl: video.preview,
            },
          } as any)
        }
        className={`relative flex w-full aspect-square items-center justify-center overflow-hidden bg-background rounded-md cursor-pointer transition-all duration-300 ${
          isAdding ? 'opacity-80 scale-98 animate-pulse' : ''
        }`}
      >
        <img
          draggable={false}
          src={video.preview}
          className="h-full w-full rounded-md object-cover"
          alt="video preview"
        />
        
        {/* Plus Icon Overlay */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
            isHovered && !isAdding ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Plus className="w-8 h-8 text-white/70 drop-shadow-lg" />
        </div>

        {/* Loading Overlay */}
        {isAdding && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-md flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </Draggable>
  );
};
