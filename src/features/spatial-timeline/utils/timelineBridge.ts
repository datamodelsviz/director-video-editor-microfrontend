import { Scene, TimelineElement } from '../SpatialTimeline';
import { ITrack, ITrackItem } from '@designcombo/types';

/**
 * Bridge between existing timeline system and spatial scenes
 */
export class TimelineBridge {
  /**
   * Convert existing timeline tracks to spatial scenes
   */
  static tracksToScenes(tracks: ITrack[]): Scene[] {
    const scenes: Scene[] = [];
    
    // Group track items by time ranges to create scenes
    const timeRanges = this.extractTimeRanges(tracks);
    
    timeRanges.forEach((timeRange, index) => {
      const sceneElements: TimelineElement[] = [];
      
      // Find all track items that fall within this time range
      tracks.forEach(track => {
        track.items.forEach(item => {
          if (this.itemInTimeRange(item, timeRange)) {
            sceneElements.push(this.trackItemToElement(item, track.type));
          }
        });
      });
      
      if (sceneElements.length > 0) {
        scenes.push({
          id: `scene-${index + 1}`,
          name: `Scene ${index + 1}`,
          startTime: timeRange.start,
          duration: timeRange.end - timeRange.start,
          position: { x: 50 + (index * 350), y: 50 },
          size: { width: 300, height: 200 },
          elements: sceneElements
        });
      }
    });
    
    return scenes;
  }
  
  /**
   * Convert spatial scenes back to timeline tracks
   */
  static scenesToTracks(scenes: Scene[]): ITrack[] {
    const tracks: { [type: string]: ITrack } = {};
    
    scenes.forEach(scene => {
      scene.elements.forEach(element => {
        if (!tracks[element.type]) {
          tracks[element.type] = {
            id: `track-${element.type}`,
            type: element.type,
            items: []
          };
        }
        
        tracks[element.type].items.push(this.elementToTrackItem(element, scene.startTime));
      });
    });
    
    return Object.values(tracks);
  }
  
  /**
   * Extract time ranges from tracks to determine scene boundaries
   */
  private static extractTimeRanges(tracks: ITrack[]): Array<{ start: number; end: number }> {
    const timePoints: number[] = [];
    
    tracks.forEach(track => {
      track.items.forEach(item => {
        timePoints.push(item.start);
        timePoints.push(item.start + item.duration);
      });
    });
    
    // Sort and create ranges
    const sortedPoints = [...new Set(timePoints)].sort((a, b) => a - b);
    const ranges: Array<{ start: number; end: number }> = [];
    
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      ranges.push({
        start: sortedPoints[i],
        end: sortedPoints[i + 1]
      });
    }
    
    return ranges;
  }
  
  /**
   * Check if a track item falls within a time range
   */
  private static itemInTimeRange(item: ITrackItem, timeRange: { start: number; end: number }): boolean {
    const itemEnd = item.start + item.duration;
    return (item.start >= timeRange.start && item.start < timeRange.end) ||
           (itemEnd > timeRange.start && itemEnd <= timeRange.end) ||
           (item.start <= timeRange.start && itemEnd >= timeRange.end);
  }
  
  /**
   * Convert track item to spatial element
   */
  private static trackItemToElement(item: ITrackItem, trackType: string): TimelineElement {
    return {
      id: item.id,
      type: trackType as 'video' | 'audio' | 'text' | 'image',
      name: item.name || `${trackType}-${item.id}`,
      duration: item.duration,
      startTime: item.start,
      endTime: item.start + item.duration,
      layer: this.getLayerFromTrackType(trackType),
      metadata: item
    };
  }
  
  /**
   * Convert spatial element to track item
   */
  private static elementToTrackItem(element: TimelineElement, sceneStartTime: number): ITrackItem {
    return {
      id: element.id,
      name: element.name,
      start: element.startTime,
      duration: element.duration,
      // Add other required ITrackItem properties
      ...element.metadata
    } as ITrackItem;
  }
  
  /**
   * Get layer number from track type
   */
  private static getLayerFromTrackType(trackType: string): number {
    switch (trackType) {
      case 'video': return 1;
      case 'audio': return 2;
      case 'image': return 3;
      case 'text': return 4;
      default: return 1;
    }
  }
}
