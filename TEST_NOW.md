# ✅ Test The Fixes NOW

## Quick Start
```bash
cd /Users/s1/build/vx/vx-rc7/director-video-editor
npm run dev
```

Open: `http://localhost:5173/figma`

---

## 🎯 3-Minute Test

### Step 1: Enter Frame (10 seconds)
- [ ] **Double-click** any frame in board view
- [ ] Frame editor opens with toolbar at top

### Step 2: Test Video (30 seconds)
- [ ] Click **"Video"** button in toolbar
- [ ] Floating panel opens on left with video thumbnails
- [ ] **Click the "+" button** on ANY video
- [ ] **EXPECTED**: Video appears in canvas (middle) AND timeline (bottom)
- [ ] **Click the video** in canvas to select it
- [ ] **EXPECTED**: Properties panel opens on right

### Step 3: Test Image (30 seconds)  
- [ ] Click **"Image"** button in toolbar
- [ ] Gallery shows image thumbnails
- [ ] **Click the "+" button** on ANY image
- [ ] **EXPECTED**: Image appears in canvas AND timeline

### Step 4: Test Audio (30 seconds)
- [ ] Click **"Audio"** button in toolbar
- [ ] **You'll see**: "(API Error)" badge at top
  - ✅ This is **NORMAL** - it's using fallback audio data
- [ ] **You should see**: List of 10+ audio tracks below
- [ ] **Click the "+" button** on ANY audio
- [ ] **EXPECTED**: Audio appears in timeline (bottom)
  - Note: Audio doesn't show in canvas, only timeline - this is correct!

### Step 5: Test Text (20 seconds)
- [ ] Click **"Text"** button in toolbar
- [ ] **Click the "Add Text" button**
- [ ] **EXPECTED**: Text appears in canvas AND timeline

### Step 6: Test Timeline (40 seconds)
- [ ] **Drag** any video/image left or right in timeline
  - EXPECTED: Moves to new time position
- [ ] **Click** any item in timeline to select it
  - EXPECTED: Highlights, properties panel updates
- [ ] **Click trash icon** in timeline header (with item selected)
  - EXPECTED: Item deleted from timeline and canvas

### Step 7: Test Drag & Drop (20 seconds)
- [ ] Click "Video" button
- [ ] **Drag ANY video** from the gallery
- [ ] **Drop onto canvas** (middle area)
- [ ] **EXPECTED**: Video appears in canvas and timeline

---

## ✅ Success Criteria

If ALL these work, the integration is **100% functional**:

✅ Videos add to canvas & timeline via "+" button
✅ Images add to canvas & timeline via "+" button
✅ Audio adds to timeline via "+" button (with "(API Error)" badge)
✅ Text adds to canvas & timeline via "Add Text" button
✅ Drag & drop works from galleries
✅ Items can be moved in timeline
✅ Items can be deleted
✅ Properties panel opens on selection

---

## ⚠️ Expected Behaviors (NOT bugs!)

### Audio Shows "(API Error)"
**This is NORMAL!** 
- Running standalone without authentication
- Falls back to static audio data automatically
- Audio items still work perfectly

### Audio Not in Canvas
**This is CORRECT!**
- Audio is timeline-only (no visual representation)
- Shows as waveform in timeline
- Can adjust volume in properties panel

### First Load Might Be Slow
**This is NORMAL!**
- Loading fonts on first render
- Loading static media data
- Subsequent loads will be faster

---

## 🐛 If Something Doesn't Work

### Videos/Images Not Adding?
**Open browser console (F12) and check for**:
```
useStateManagerEvents StateManager {...}
```
If you don't see this, Timeline didn't initialize properly.

### "Floating Panel Won't Open?"
- Make sure you're **clicking** the toolbar buttons (Video, Image, Audio, Text)
- Panel should slide in from the left
- Check that `isSidebarHovered` state is updating

### "Items Not Appearing?"
1. Check console for JavaScript errors
2. Look for `trackItemsMap` in console
3. Verify StateManager was initialized

### "Properties Panel Not Opening?"
1. **Click the item** in canvas or timeline first to select it
2. Look for highlight/border around selected item
3. Properties panel should slide in from right

---

## 🎯 Quick Console Debug

Open browser console (F12) and run:

```javascript
// Check if Zustand store has items
window.useStore?.getState()

// Look for these properties:
// - trackItemsMap: {} should have items after adding media
// - trackItemIds: [] should list IDs after adding media  
// - activeIds: [] shows currently selected items
```

---

## 📊 What You Should See

### Initial State (Before Adding Media)
```javascript
{
  trackItemsMap: {},
  trackItemIds: [],
  activeIds: [],
  duration: 6000,  // milliseconds
  fps: 30
}
```

### After Adding 1 Video
```javascript
{
  trackItemsMap: {
    "video-id-123": { type: "video", name: "...", ... }
  },
  trackItemIds: ["video-id-123"],
  activeIds: [],  // Empty until you select the video
  duration: 6000
}
```

### After Selecting the Video
```javascript
{
  trackItemsMap: { "video-id-123": {...} },
  trackItemIds: ["video-id-123"],
  activeIds: ["video-id-123"],  // ← Selected!
  duration: 6000
}
```

---

## 🚀 Next Steps After Testing

If everything works:
1. ✅ Integration is complete!
2. ✅ Ready for production use
3. ✅ All original editor features work in frame mode

If something doesn't work:
1. Check console for errors
2. Verify StateManager initialization
3. Check that Timeline component rendered
4. Verify event subscriptions happened

---

## 💡 Pro Tips

- **Refresh page** if something seems stuck
- **Check console** for "useStateManagerEvents" log
- **Audio API error** is expected - ignore it
- **Select items** by clicking before using toolbar buttons (delete, split, etc.)

---

**Ready? Run `npm run dev` and test! 🎉**

Expected result: **All 7 test steps pass ✅**

