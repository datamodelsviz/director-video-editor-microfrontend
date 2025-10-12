// Demo script to show command logging in action
import { CommandLogger } from './CommandLogger';
import { dispatchWithLogging } from './DispatchWrapper';

// This is a demo script that shows how the command logging works
// You can run this in the browser console to see the logging in action

export const demoCommandLogging = () => {
  const logger = CommandLogger.getInstance();
  
  console.log('🎬 Starting Command Logging Demo...');
  
  // Simulate some common video editor actions
  const actions = [
    {
      action: 'ADD_VIDEO',
      payload: {
        id: 'video-123',
        src: 'demo-video.mp4',
        duration: 10000,
        metadata: { previewUrl: 'thumb.jpg' }
      },
      component: 'Videos'
    },
    {
      action: 'ADD_IMAGE', 
      payload: {
        id: 'image-456',
        src: 'demo-image.jpg',
        metadata: { previewUrl: 'thumb.jpg' }
      },
      component: 'Images'
    },
    {
      action: 'EDIT_OBJECT',
      payload: {
        'video-123': {
          details: {
            volume: 0.75,
            opacity: 0.8
          }
        }
      },
      component: 'BasicVideo'
    },
    {
      action: 'EDIT_OBJECT',
      payload: {
        'image-456': {
          details: {
            x: 100,
            y: 200,
            rotation: 15
          }
        }
      },
      component: 'BasicImage'
    }
  ];

  // Execute each action with logging
  actions.forEach((actionData, index) => {
    setTimeout(() => {
      console.log(`📝 Executing action ${index + 1}: ${actionData.action}`);
      
      // Simulate the dispatch with logging
      dispatchWithLogging(
        actionData.action,
        actionData.payload,
        undefined,
        'ui',
        actionData.component
      );
      
      // Show current logs
      const logs = logger.getLogs();
      console.log(`📊 Total logs: ${logs.length}`);
      
      if (index === actions.length - 1) {
        // Show final statistics
        const stats = logger.getStats();
        console.log('📈 Final Statistics:', stats);
        console.log('🎉 Demo completed! Check the Command Console in the UI.');
      }
    }, index * 1000); // 1 second delay between actions
  });
};

// Sample commands that can be executed via API or CLI
export const sampleCommands = {
  addVideo: {
    type: 'ADD_VIDEO',
    payload: {
      src: 'sample-video.mp4',
      duration: 5000,
      metadata: { previewUrl: 'sample-thumb.jpg' }
    },
    options: {
      resourceId: 'main',
      scaleMode: 'fit'
    }
  },
  
  updateVolume: {
    type: 'EDIT_OBJECT',
    payload: {
      'item-123': {
        details: {
          volume: 0.5
        }
      }
    }
  },
  
  updateOpacity: {
    type: 'EDIT_OBJECT', 
    payload: {
      'item-123': {
        details: {
          opacity: 0.7
        }
      }
    }
  },
  
  moveItem: {
    type: 'EDIT_OBJECT',
    payload: {
      'item-123': {
        details: {
          x: 150,
          y: 250
        }
      }
    }
  }
};

// CLI-style command execution
export const executeCommand = (commandType: string, payload: any, options?: any) => {
  console.log(`🚀 Executing CLI command: ${commandType}`);
  
  dispatchWithLogging(commandType, payload, options, 'cli', 'CLI');
  
  const logger = CommandLogger.getInstance();
  const logs = logger.getLogs();
  const lastLog = logs[logs.length - 1];
  
  console.log('✅ Command executed:', lastLog);
  return lastLog;
};

// Example usage:
// executeCommand('ADD_VIDEO', sampleCommands.addVideo.payload, sampleCommands.addVideo.options);
// executeCommand('EDIT_OBJECT', sampleCommands.updateVolume.payload);

// Test scrolling with multiple commands
export const testScrolling = () => {
  console.log('🧪 Testing scrolling with multiple commands...');
  
  const testCommands = [
    'add-video test1.mp4 5000',
    'add-video test2.mp4 8000', 
    'add-image photo1.jpg',
    'add-image photo2.jpg',
    'set-volume video-123 75',
    'set-opacity image-456 80',
    'move video-123 100 200',
    'help',
    'clear'
  ];
  
  testCommands.forEach((command, index) => {
    setTimeout(() => {
      console.log(`📝 Executing test command ${index + 1}: ${command}`);
      executeCommand(command.split(' ')[0], command.split(' ').slice(1));
    }, index * 500); // 500ms delay between commands
  });
};
