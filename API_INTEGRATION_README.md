# API Integration - MVP Implementation

## Overview
This document describes the MVP implementation of API integration between the React Video Editor Pro iframe and the primary application.

## 🚀 New Features Added

### 1. Parent Communication Service
- **File**: `src/services/parentCommunication.ts`
- **Purpose**: Handles communication with parent app via postMessage
- **Features**:
  - Requests auth token from parent app on initialization
  - Listens for token responses
  - Provides ready state checking for API calls

### 2. API Service
- **File**: `src/services/api.ts`
- **Purpose**: Makes authenticated API calls to primary app
- **Features**:
  - Automatic auth token inclusion
  - Error handling for failed requests
  - Support for different HTTP methods

### 3. API Testing Hook
- **File**: `src/features/editor/hooks/use-api-test.ts`
- **Purpose**: Provides simple API testing functionality
- **Endpoints Tested**:
  - `/api/auth/me` - User information
  - `/api/remotion/health` - Health check
  - `/` - Root endpoint

### 4. Enhanced UI Components
- **Test Icon**: Added to `src/components/shared/icons.tsx`
- **Notification Component**: `src/components/ui/notification.tsx`
- **API Test Button**: Added to navbar with blue styling

## 🔧 How It Works

### Communication Flow
1. **Initialization**: App starts and initializes parent communication service
2. **Token Request**: Service requests auth token from parent app
3. **Token Reception**: Listens for token response via postMessage
4. **API Readiness**: Service indicates when ready for API calls
5. **API Testing**: User can test API connection via navbar button

### API Testing
- Click the blue "Test API" button in the navbar
- Tests the `/api/auth/me` endpoint by default
- Shows success/error notifications
- Logs results to console for debugging

## 🎯 Testing Endpoints

### Simple GET APIs for MVP
1. **User Info**: `/api/auth/me` - Returns user data
2. **Health Check**: `/api/remotion/health` - Service status
3. **Root Endpoint**: `/` - Basic API status

## 🚦 Usage

### For Users
1. Open the video editor
2. Look for the blue "Test API" button in the top-right navbar
3. Click to test API connectivity
4. View results in notifications and console

### For Developers
1. **Testing Communication**:
   ```typescript
   import { parentComm } from '@/services/parentCommunication';
   
   if (parentComm.isReadyForAPI()) {
     console.log('Ready for API calls');
   }
   ```

2. **Making API Calls**:
   ```typescript
   import { callPrimaryAppAPI } from '@/services/api';
   
   const result = await callPrimaryAppAPI('/api/auth/me', null, 'GET');
   ```

3. **Using the Hook**:
   ```typescript
   import { useAPITest } from '@/features/editor/hooks/use-api-test';
   
   const { testUserInfo, testHealthCheck } = useAPITest();
   ```

## 🔒 Security

- **Origin Validation**: Only accepts messages from `http://localhost:3003`
- **Token Management**: Auth tokens are stored securely in memory
- **CORS Handling**: API calls include proper authorization headers

## 🐛 Troubleshooting

### Common Issues
1. **"Not ready for API calls"**: Wait for auth token from parent app
2. **CORS errors**: Ensure primary app allows requests from localhost:5173
3. **Token timing**: API calls made before token received

### Debug Steps
1. Check browser console for communication logs
2. Verify parent app is running on localhost:3003
3. Ensure primary app API is accessible on localhost:8000

## 🔮 Future Enhancements

### Next Iterations
- **Workspace Integration**: Save/load projects via API
- **Real-time Updates**: Live project synchronization
- **Advanced Error Handling**: Retry logic and fallback mechanisms

### Current MVP Scope
- ✅ Basic communication setup
- ✅ Simple API testing
- ✅ User feedback via notifications
- ✅ Error handling and logging

## 📁 File Structure

```
src/
├── services/
│   ├── parentCommunication.ts    ← NEW: Parent app communication
│   └── api.ts                   ← NEW: API service
├── features/
│   └── editor/
│       ├── hooks/
│       │   └── use-api-test.ts  ← NEW: API testing hook
│       └── navbar.tsx           ← MODIFIED: Added test button
├── components/
│   ├── ui/
│   │   └── notification.tsx     ← NEW: User notifications
│   └── shared/
│       └── icons.tsx            ← MODIFIED: Added test icon
└── app.tsx                      ← MODIFIED: Initialize communication
```

## 🎉 Success Criteria Met

- [x] Iframe can request and receive auth token from parent app
- [x] Iframe can successfully call simple GET APIs on primary app
- [x] User gets immediate feedback on API test results
- [x] No console errors during communication
- [x] Ready for future workspace integration features

## 🚀 Getting Started

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the app** in your browser at `http://localhost:5173`

3. **Test the API integration** by clicking the "Test API" button

4. **Check the console** for communication logs and API responses

---

**Note**: This MVP focuses on simple API testing to verify communication works. Complex workspace integration will be added in future iterations.
