# Service Worker & Cache Cleanup Utility - Instructions

## Overview
The Snake Game now includes a comprehensive cleanup utility for managing Service Workers and browser caches. This is essential for development, testing, and deployment scenarios.

## 🔧 Quick Access Methods

### 1. Developer Console (Always Available)
```javascript
// Check current status
await swStatus()

// Clean Service Workers and caches only
await cleanServiceWorkers()

// Complete cleanup (includes localStorage)
await cleanEverything()

// Direct access to utility
window.swCleanup.performFullCleanup()
```

### 2. Developer Panel (Dev Mode Only)
1. Press `Ctrl+Shift+D` to toggle development mode
2. Developer panel appears automatically
3. Use the UI buttons for cleanup operations

### 3. Manual Inspection
```javascript
// Check Service Worker registrations
navigator.serviceWorker.getRegistrations()

// Check cache storage
caches.keys()

// Check localStorage cache entries
Object.keys(localStorage).filter(key => key.startsWith('snake_game_asset_'))
```

## 🧹 Cleanup Operations

### Service Worker & Cache Cleanup
- **What it does**: Removes service workers and cache storage
- **Use when**: Testing new versions, debugging cache issues
- **Command**: `cleanServiceWorkers()` or use "Clean SW & Caches" button

### Complete Cleanup
- **What it does**: Removes service workers, cache storage, AND localStorage
- **Use when**: Full reset needed, major version changes
- **Command**: `cleanEverything()` or use "Clean Everything" button
- **⚠️ Warning**: This removes ALL locally stored game data

### Status Check
- **What it does**: Shows current Service Worker and cache status
- **Use when**: Verifying cleanup or checking current state
- **Command**: `swStatus()` or use "SW Status" button

## 🚀 Development Workflow

### Testing New Versions
1. Make code changes
2. Run `cleanServiceWorkers()` in console
3. Hard refresh page (Ctrl+F5)
4. Verify new version loads

### Debugging Cache Issues
1. Check status: `swStatus()`
2. Clean if needed: `cleanServiceWorkers()`
3. Monitor console for detailed logs
4. Refresh and test

### Complete Reset
1. Run `cleanEverything()`
2. Confirm in dialog
3. Hard refresh page
4. Game will re-download all assets

## 📊 Understanding the Logs

### Service Worker Logs
```
[SW-Cleanup] Found 1 service worker(s)
[SW-Cleanup] Processing SW - Scope: https://domain.com/, Script: https://domain.com/service-worker.js
[SW-Cleanup] Sending FORCE_STOP message to active worker
[SW-Cleanup] Successfully unregistered SW: https://domain.com/
```

### Cache Logs
```
[SW-Cleanup] Found 1 cache(s): ["snake-game-v1.0.0"]
[SW-Cleanup] Deleted cache: snake-game-v1.0.0
```

### Verification Logs
```
[SW-Cleanup] ✅ No service workers remain
[SW-Cleanup] ✅ No caches remain
```

## 🔍 Troubleshooting

### Service Worker Won't Unregister
1. Check if SW is responding to FORCE_STOP messages
2. Try hard refresh (Ctrl+F5)
3. Use DevTools → Application → Service Workers → Unregister

### Cache Won't Clear
1. Check browser storage quota
2. Try incognito mode
3. Clear browser data manually

### localStorage Issues
1. Check if storage quota exceeded
2. Use `localStorage.clear()` for complete reset
3. Check console for storage errors

### Page Not Updating
1. Ensure cache is actually cleared
2. Check if new Service Worker is installing
3. Use hard refresh (Ctrl+F5)

## 🛡️ Safety Features

### Production Protection
- Cleanup only works in same origin
- HTTPS or localhost required for Service Workers
- Confirmation dialogs for destructive operations

### Error Handling
- Graceful failure if Service Workers not supported
- Individual asset cleanup if batch fails
- Detailed error logging for debugging

### Recovery
- Game continues working if cleanup fails
- Assets re-download automatically if cache corrupted
- No permanent damage to user data

## 📱 Mobile Considerations

### Touch Interface
- Developer panel optimized for touch
- Responsive design for small screens
- Gesture-friendly button sizes

### Storage Limits
- Mobile browsers have stricter storage quotas
- Cleanup helps manage storage usage
- Automatic cache size monitoring

## 🔄 Integration with Game Systems

### Asset Loader Integration
- Cleanup works with both Service Worker and localStorage caching
- Asset loader detects cleared cache and re-downloads
- Seamless transition between cached and fresh assets

### Offline Manager Integration
- Cleanup removes offline capabilities temporarily
- Game automatically re-establishes offline support
- User notifications for cache status changes

### Dev Toggle Integration
- Cleanup panel only available in development mode
- Keyboard shortcut (Ctrl+Shift+D) provides quick access
- Visual feedback for all operations

This utility ensures reliable development and deployment of the Snake Game while maintaining optimal performance and user experience.