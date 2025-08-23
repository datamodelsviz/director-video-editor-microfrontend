# Iframe App Implementation Changes

## Overview
This document outlines all the specific changes needed in the React Video Editor Pro codebase (`/Users/mayur/workspace/react-video-editor-pro`) to implement the MVP iframe-to-primary-app API communication solution with simple API testing functionality.

**Scope**: Simple API testing to verify communication works, not complex workspace integration (that will come in future iterations).

## 📁 Current Codebase Structure Analysis

### **Project Type**: React + Vite + TypeScript
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand + DesignCombo State Manager
- **UI Components**: Radix UI + Tailwind CSS
- **Architecture**: Feature-based folder structure

### **Key Components Identified**:
- **Main Entry**: `src/main.tsx` → `src/app.tsx` → `src/features/editor/editor.tsx`
- **State Management**: Zustand stores in `src/features/editor/store/`
- **UI Components**: Navbar, timeline, scene components
- **Export Functionality**: Already exists in navbar with download/export features
- **Integration Target**: Simple API testing for MVP, workspace features for future iterations

---

## 🔧 Required Changes

**Note**: This MVP focuses on simple API testing to verify communication works. Complex workspace integration will be added in future iterations.

### **1. Create Communication Service**

#### **File**: `src/services/parentCommunication.ts`
**Purpose**: Handle communication with parent app via postMessage

**New File Content**:
```typescript
class ParentCommunication {
  private authToken: string | null = null;
  private isReady = false;

  constructor() {
    this.setupMessageListener();
    this.requestAuthToken();
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.origin !== 'http://localhost:3003') return;
      
      if (event.data.type === 'HERE_IS_TOKEN') {
        this.authToken = event.data.token;
        this.isReady = true;
        console.log('Auth token received from parent');
      }
    });
  }

  private requestAuthToken() {
    window.parent.postMessage({
      type: 'NEED_AUTH_TOKEN'
    }, 'http://localhost:3003');
  }

  isReadyForAPI(): boolean {
    return this.isReady && !!this.authToken;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }
}

export const parentComm = new ParentCommunication();
```

#### **File**: `src/services/api.ts`
**Purpose**: Make API calls to primary app with auth token

**New File Content**:
```typescript
import { parentComm } from './parentCommunication';

export const callPrimaryAppAPI = async (
  endpoint: string, 
  data?: any, 
  method: string = 'POST'
) => {
  if (!parentComm.isReadyForAPI()) {
    throw new Error('Not ready for API calls - waiting for auth token');
  }

  const token = parentComm.getAuthToken();
  
  try {
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: data ? JSON.stringify(data) : 'undefined'
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};
```

### **2. Update Main App Component**

#### **File**: `src/app.tsx`
**Changes**: Initialize communication service when app starts

**Modified Content**:
```typescript
import { useEffect } from "react";
import Editor from "./features/editor";
import useDataState from "./features/editor/store/use-data-state";
import { getCompactFontData } from "./features/editor/utils/fonts";
import { FONTS } from "./features/editor/data/fonts";
// Add this import
import "./services/parentCommunication";

export default function App() {
  const { setCompactFonts, setFonts } = useDataState();

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  return <Editor />;
}
```

### **3. Add Simple API Test Functionality**

#### **File**: `src/features/editor/navbar.tsx`
**Changes**: Add simple API test button to verify communication works

**New Function to Add**:
```typescript
// Add this function inside the Navbar component
const handleTestAPI = async () => {
  try {
    // Test with a simple GET API - user info endpoint
    const result = await callPrimaryAppAPI('/api/auth/me', null, 'GET');
    
    console.log('API test successful:', result);
    // Show success message to user
    alert(`✅ API Test Successful!\nUser: ${result.name}\nEmail: ${result.email}`);
    
  } catch (error) {
    console.error('API test failed:', error);
    // Show error message to user
    alert(`❌ API Test Failed: ${error.message}`);
  }
};
```

**New Button to Add**:
```typescript
// Add this button in the navbar alongside Export button
<Button
  onClick={handleTestAPI}
  className="flex h-8 gap-1 border border-border"
  variant="outline"
  style={{
    backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500/80
    color: 'white',
    borderColor: 'rgb(59, 130, 246)'
  }}
>
  <TestIcon width={18} /> Test API
</Button>
```

### **4. Add Test Icon Component**

#### **File**: `src/components/shared/icons.tsx`
**Changes**: Add Test icon to existing icons

**Add to existing icons**:
```typescript
// Add this to your existing Icons object
test: (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12l2 2 4-4" />
    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </svg>
),
```

### **5. Create Simple API Test Hook**

#### **File**: `src/features/editor/hooks/use-api-test.ts`
**Purpose**: Simple API testing functionality

**New File Content**:
```typescript
import { callPrimaryAppAPI } from '@/services/api';

export const useAPITest = () => {
  const testUserInfo = async () => {
    try {
      const result = await callPrimaryAppAPI('/api/auth/me', null, 'GET');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const testHealthCheck = async () => {
    try {
      const result = await callPrimaryAppAPI('/api/remotion/health', null, 'GET');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const testRootEndpoint = async () => {
    try {
      const result = await callPrimaryAppAPI('/', null, 'GET');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    testUserInfo,
    testHealthCheck,
    testRootEndpoint
  };
};
```

### **6. Update Export Modal (Optional)**

#### **File**: `src/features/editor/download-progress-modal.tsx`
**Changes**: Add API test option to existing export modal (optional for first iteration)

**Add to existing modal** (optional):
```typescript
// Add this button alongside existing export options (optional for MVP)
<Button
  onClick={handleTestAPI}
  className="mt-2 w-full"
  variant="outline"
  style={{
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgb(59, 130, 246)',
    color: 'rgb(59, 130, 246)'
  }}
>
  <TestIcon width={16} className="mr-2" />
  Test API Connection
</Button>
```

### **7. Add Error Handling Components**

#### **File**: `src/components/ui/notification.tsx`
**Purpose**: Show success/error messages to user (optional for MVP, can use simple alerts instead)

**New File Content**:
```typescript
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Notification = ({ message, type, duration = 5000, onClose }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 z-[9999] ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="ml-2 hover:bg-white/20 rounded p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
};
```

---

## 📁 New File Structure

```
src/
├── services/
│   ├── parentCommunication.ts    ← NEW
│   └── api.ts                   ← NEW
├── features/
│   └── editor/
│       ├── hooks/
│       │   └── use-api-test.ts  ← NEW
│       └── navbar.tsx           ← MODIFIED
├── components/
│   ├── ui/
│   │   └── notification.tsx     ← NEW
│   └── shared/
│       └── icons.tsx            ← MODIFIED
└── app.tsx                      ← MODIFIED
```

---

## 🔄 Integration Points

### **1. Existing Export Flow**
- **Current**: Export to MP4/JSON files
- **New**: API testing alongside export
- **Integration**: Add API test button to navbar

### **2. API Communication**
- **Current**: No external API calls
- **New**: Basic API communication with primary app
- **Integration**: Test simple GET endpoints

### **3. User Experience**
- **Current**: Standalone video editor
- **New**: Basic integration testing capability
- **Integration**: Simple API test functionality

---

## 🎯 Simple APIs for Testing

### **1. User Info Endpoint**
- **URL**: `/api/auth/me`
- **Method**: GET
- **Purpose**: Get current user information
- **Response**: User object with name, email, etc.
- **Complexity**: Very simple - just returns user data

### **2. Health Check Endpoint**
- **URL**: `/api/remotion/health`
- **Method**: GET
- **Purpose**: Check service health status
- **Response**: Health status object
- **Complexity**: Very simple - no parameters needed

### **3. Root Endpoint**
- **URL**: `/`
- **Method**: GET
- **Purpose**: Basic API status
- **Response**: Simple message object
- **Complexity**: Simplest possible - just confirms API is running

### **Why These APIs?**
- **No Complex Data**: Simple GET requests with no body
- **Always Available**: These endpoints are always accessible
- **Good for Testing**: Perfect for verifying basic communication
- **Fast Response**: Quick responses for immediate feedback

---

## 🧪 Testing Requirements

### **1. Communication Testing**
- [ ] Iframe requests auth token on load
- [ ] Parent app sends token successfully
- [ ] Token is stored and accessible

### **2. API Integration Testing**
- [ ] Test user info endpoint (`/api/auth/me`) works
- [ ] Test health check endpoint (`/api/remotion/health`) works
- [ ] Test root endpoint (`/`) works
- [ ] Error handling works correctly

### **3. UI Integration Testing**
- [ ] Test API button appears in navbar
- [ ] API test button works correctly
- [ ] Success/error messages display
- [ ] No console errors

---

## 🚀 Implementation Order

### **Phase 1: Core Communication (1 hour)**
1. Create `parentCommunication.ts` service
2. Create `api.ts` service
3. Update `app.tsx` to initialize communication

### **Phase 2: API Testing (1 hour)**
1. Create `use-api-test.ts` hook
2. Add test API functionality to navbar
3. Test basic API calls

### **Phase 3: UI Enhancement (30 minutes)**
1. Add test icon to icons
2. Test button functionality
3. Optional: Add notification component (can use simple alerts for MVP)

### **Phase 4: Testing & Polish (30 minutes)**
1. Test all functionality
2. Fix any issues
3. Verify communication works end-to-end

---

## 🔄 Future Iterations (Not in MVP)

### **Iteration 2: Workspace Integration**
- Add workspace save/load functionality
- Integrate with complex workspace APIs
- Add project synchronization

### **Iteration 3: Advanced Features**
- Real-time workspace updates
- Project templates and sharing
- Advanced error handling and retry logic

---

## 🐛 Potential Issues & Solutions

### **1. CORS Issues**
**Problem**: Iframe can't call primary app APIs
**Solution**: Ensure primary app allows requests from localhost:5173

### **2. Token Timing**
**Problem**: API calls made before token received
**Solution**: Check `isReadyForAPI()` before making calls

### **3. API Response Handling**
**Problem**: API calls fail or return unexpected data
**Solution**: Use proper error handling and validate responses

### **4. Communication Timing**
**Problem**: Messages sent before iframe is ready
**Solution**: Wait for iframe load event before sending messages

---

## 📝 Summary

This MVP implementation adds:
- **Communication Layer**: postMessage communication with parent app
- **API Integration**: Direct API calls to primary app with auth
- **Simple Testing**: Test basic API endpoints to verify integration works
- **Enhanced UI**: Test button with simple feedback (alerts for MVP)
- **Error Handling**: Basic error handling for communication failures

The changes are minimal and focused, maintaining the existing architecture while adding the necessary functionality for MVP API integration testing. This provides a solid foundation for future workspace integration features.

---

## 🎯 MVP Success Criteria

- [ ] Iframe can request and receive auth token from parent app
- [ ] Iframe can successfully call simple GET APIs on primary app
- [ ] User gets immediate feedback on API test results
- [ ] No console errors during communication
- [ ] Ready for future workspace integration features
