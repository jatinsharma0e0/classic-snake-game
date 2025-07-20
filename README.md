# Snake Game - Full Offline Support

A fully offline-capable HTML5 Snake game with jungle theme. After the initial load, the game can be played completely offline.

## 🎮 Features

- **Complete Offline Support**: Play anywhere, anytime after first visit
- **Intelligent Asset Caching**: All images, audio, fonts, and scripts cached locally
- **Automatic Updates**: New versions detected and updated seamlessly
- **Optimized Performance**: WebP images, MP3 audio, efficient caching
- **Progressive Enhancement**: Works with or without Service Worker support

## 🚀 How Offline Support Works

### Service Worker Implementation
The game uses a Service Worker (`service-worker.js`) that:

1. **Caches All Assets**: On first visit, downloads and stores:
   - HTML, CSS, JavaScript files
   - All game images (WebP format, 25 files)
   - All audio files (MP3 format, 10 files) 
   - Font files (TTF format, 2 files)

2. **Offline Detection**: Automatically serves cached content when offline

3. **Update Management**: Detects new versions and prompts for updates

4. **Cache Validation**: Ensures integrity of cached assets

### Cached Assets (37 total)
- **Core Files**: HTML, CSS, JS (7 files)
- **Images**: Sprites, backgrounds, buttons, obstacles (25 files)  
- **Audio**: Background music, sound effects (10 files)
- **Fonts**: Game typography (2 files)

## 📦 Technical Implementation

### Service Worker Features
- **Versioned Caching**: `snake-game-v1.0.0` with version-based invalidation
- **Batch Loading**: Assets cached in batches to prevent browser overload
- **Graceful Fallbacks**: Handles failed requests elegantly
- **Cache Size Management**: Automatic cleanup of old cache versions

### Offline Manager
- **Real-time Status**: Detects online/offline state changes
- **Visual Indicators**: Shows "Playing Offline" badge when disconnected
- **Update Notifications**: Prompts user when new version available
- **Cache Control**: Methods to check status and clear cache if needed

### Integration with Asset Loader
- **Dual Strategy**: Uses both Service Worker caching AND localStorage
- **Asset Validation**: Verifies cached assets before use
- **Smart Loading**: Skips loading screen when assets already cached
- **Performance Optimized**: Minimizes redundant downloads

## 🛠 Development

### Cache Management
```javascript
// Check cache status
await window.offlineManager.getCacheStatus();

// Clear cache (forces re-download)
await window.offlineManager.clearCache();

// Check if offline
window.offlineManager.isOffline();
```

### Updating Cache Version
When deploying new assets:

1. Update `CACHE_NAME` in `service-worker.js`:
   ```javascript
   const CACHE_NAME = 'snake-game-v1.1.0';
   ```

2. Update `CACHE_VERSION` for consistency:
   ```javascript
   const CACHE_VERSION = '1.1.0';
   ```

3. Add any new assets to the appropriate arrays in service worker

### Testing Offline Mode
1. Open Chrome DevTools → Application tab
2. Check "Offline" under Service Workers
3. Refresh page - should load from cache
4. Verify all functionality works offline

## 🔧 Troubleshooting

### Service Worker Issues
- Check DevTools → Application → Service Workers
- Look for registration errors in console
- Clear browser cache if needed

### Cache Problems
- Use DevTools → Application → Storage to inspect cache
- Clear specific caches in DevTools if corrupted
- Check cache size limits (50MB limit implemented)

### Update Problems
- Force refresh (Ctrl+F5) to bypass cache
- Use cache clear function in game settings
- Check console for service worker update messages

## 📊 Performance Benefits

### Size Optimization
- **Images**: WebP format (average 70% smaller than PNG)
- **Audio**: MP3 format (87% smaller than WAV)
- **Total Assets**: ~1.7MB cached locally

### Load Time Benefits
- **First Visit**: Normal download time
- **Subsequent Visits**: Instant loading from cache
- **Offline**: Zero network dependency

### Battery Savings
- No repeated downloads
- Reduced network usage
- Efficient local asset serving

## 🔄 Update Workflow

1. **User visits site**: Service Worker checks for updates
2. **New version detected**: Download happens in background
3. **User notification**: "New version available" appears
4. **User action**: Click "Update" to apply new version
5. **Automatic reload**: Page refreshes with new version

## 🌐 Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support (iOS 11.1+)
- **Fallback**: Works without Service Worker (reduced offline capability)

## 📱 Mobile Optimization

- Touch-friendly offline indicators
- Responsive update notifications
- Efficient cache usage for limited storage
- Battery-conscious background updates

The game provides a seamless offline experience while maintaining optimal performance and user experience across all devices.