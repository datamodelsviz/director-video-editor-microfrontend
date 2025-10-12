# Director Video Editor - CLI Commands

## Overview
The Director Video Editor now includes a built-in CLI (Command Line Interface) that allows you to control the editor programmatically. You can access the CLI through the Command Console in the editor.

## Accessing the CLI
1. Open the Director Video Editor
2. Click the **Terminal icon** (🖥️) in the navbar to open the Command Console
3. Scroll down to the **CLI Commands** section
4. Type commands in the input field and press Enter or click the Play button

## Available Commands

### 1. Media Commands

#### `add-video [src] [duration]`
Adds a video to the timeline.

**Parameters:**
- `src` (optional): Video source URL/path (default: "sample-video.mp4")
- `duration` (optional): Video duration in milliseconds (default: 5000)

**Examples:**
```bash
add-video
add-video my-video.mp4
add-video my-video.mp4 10000
```

#### `add-image [src]`
Adds an image to the timeline.

**Parameters:**
- `src` (optional): Image source URL/path (default: "sample-image.jpg")

**Examples:**
```bash
add-image
add-image my-photo.jpg
```

### 2. Property Commands

#### `set-volume <item-id> <volume>`
Sets the volume of a specific item.

**Parameters:**
- `item-id`: The ID of the item to modify
- `volume`: Volume level (0-100)

**Examples:**
```bash
set-volume video-123 75
set-volume audio-456 50
```

#### `set-opacity <item-id> <opacity>`
Sets the opacity of a specific item.

**Parameters:**
- `item-id`: The ID of the item to modify
- `opacity`: Opacity level (0-100)

**Examples:**
```bash
set-opacity video-123 80
set-opacity image-789 60
```

#### `move <item-id> <x> <y>`
Moves an item to a specific position.

**Parameters:**
- `item-id`: The ID of the item to move
- `x`: X coordinate position
- `y`: Y coordinate position

**Examples:**
```bash
move video-123 100 200
move image-789 50 150
```

### 3. Utility Commands

#### `clear`
Clears all command logs from the console.

**Example:**
```bash
clear
```

#### `help`
Shows available commands and their usage.

**Example:**
```bash
help
```

## Command History
- Use **↑** (Up Arrow) to navigate to previous commands
- Use **↓** (Down Arrow) to navigate to next commands
- Command history is maintained during your session

## Getting Item IDs
To use property commands like `set-volume`, `set-opacity`, or `move`, you need the item ID. You can find item IDs by:

1. **From the Command Console**: Look at the logs when items are added - they show the generated IDs
2. **From the UI**: Select an item and check the Command Console logs
3. **From the browser console**: Items are logged with their IDs when created

## Sample Workflow

Here's a typical workflow using CLI commands:

```bash
# 1. Add some media
add-video sample-video.mp4 10000
add-image sample-image.jpg

# 2. Check the logs to see the generated IDs
# (Look for entries like "video-1234567890" and "image-1234567890")

# 3. Adjust properties
set-volume video-1234567890 75
set-opacity image-1234567890 80
move video-1234567890 100 200

# 4. Clear logs when done
clear
```

## Error Handling
- Invalid commands will show error messages in the console
- Missing or invalid parameters will display usage instructions
- All errors are logged with the `CLI_ERROR` action type

## Integration with UI
- CLI commands are logged alongside UI actions
- You can filter logs by source (UI/API/CLI) to see only CLI commands
- All commands execute the same underlying actions as the UI

## Future Enhancements
The CLI system is designed to be extensible. Future versions may include:
- Batch command execution
- Script files
- More property commands (rotation, scale, etc.)
- Timeline manipulation commands
- Export commands

## Tips
1. **Start with `help`** to see all available commands
2. **Use command history** to quickly repeat commands
3. **Check logs** to see the results of your commands
4. **Combine CLI and UI** - you can use both interfaces together
5. **Export logs** to save your command history for later reference
