/**
 * Offline Manager - Handles Service Worker registration and offline status
 */

class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.updateAvailable = false;
        this.showOfflineIndicator = false;
        
        this.init();
    }
    
    init() {
        // Register Service Worker
        this.registerServiceWorker();
        
        // Listen for online/offline events
        this.setupOnlineOfflineListeners();
        
        // Setup UI indicators
        this.setupOfflineIndicator();
        
        // Listen for SW updates
        this.setupUpdateListener();
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                console.log('[OfflineManager] Registering Service Worker...');
                
                this.swRegistration = await navigator.serviceWorker.register('/service-worker.js');
                
                console.log('[OfflineManager] Service Worker registered successfully');
                
                // Listen for updates
                this.swRegistration.addEventListener('updatefound', () => {
                    const newWorker = this.swRegistration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            this.updateAvailable = true;
                            this.showUpdateNotification();
                        }
                    });
                });
                
                // Check for existing SW updates
                if (this.swRegistration.waiting) {
                    this.updateAvailable = true;
                    this.showUpdateNotification();
                }
                
                // Get cache status
                this.getCacheStatus();
                
            } catch (error) {
                console.error('[OfflineManager] Service Worker registration failed:', error);
            }
        } else {
            console.warn('[OfflineManager] Service Workers not supported');
        }
    }
    
    setupOnlineOfflineListeners() {
        window.addEventListener('online', () => {
            console.log('[OfflineManager] Back online');
            this.isOnline = true;
            this.hideOfflineIndicator();
        });
        
        window.addEventListener('offline', () => {
            console.log('[OfflineManager] Gone offline');
            this.isOnline = false;
            this.showOfflineIndicator();
        });
        
        // Initial status
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }
    
    setupOfflineIndicator() {
        // Create offline indicator if it doesn't exist
        if (!document.getElementById('offlineIndicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'offlineIndicator';
            indicator.className = 'offline-indicator hidden';
            indicator.innerHTML = `
                <div class="offline-content">
                    <span class="offline-icon">📱</span>
                    <span class="offline-text">Playing Offline</span>
                </div>
            `;
            document.body.appendChild(indicator);
        }
    }
    
    showOfflineIndicator() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            indicator.classList.remove('hidden');
            this.showOfflineIndicator = true;
        }
    }
    
    hideOfflineIndicator() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            indicator.classList.add('hidden');
            this.showOfflineIndicator = false;
        }
    }
    
    setupUpdateListener() {
        // Listen for SW messages
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data && event.data.type === 'SW_UPDATED') {
                this.showUpdateNotification();
            }
        });
    }
    
    showUpdateNotification() {
        // Create update notification if it doesn't exist
        let notification = document.getElementById('updateNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'updateNotification';
            notification.className = 'update-notification';
            notification.innerHTML = `
                <div class="update-content">
                    <span class="update-icon">🔄</span>
                    <span class="update-text">New version available!</span>
                    <button id="updateBtn" class="update-btn">Update</button>
                    <button id="dismissUpdateBtn" class="dismiss-btn">×</button>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Setup update button
            document.getElementById('updateBtn').addEventListener('click', () => {
                this.applyUpdate();
            });
            
            // Setup dismiss button
            document.getElementById('dismissUpdateBtn').addEventListener('click', () => {
                notification.classList.add('hidden');
            });
        }
        
        notification.classList.remove('hidden');
    }
    
    async applyUpdate() {
        if (this.swRegistration && this.swRegistration.waiting) {
            // Tell the waiting SW to skip waiting and become active
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Reload the page to use the new SW
            window.location.reload();
        }
    }
    
    async getCacheStatus() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            return new Promise((resolve) => {
                const messageChannel = new MessageChannel();
                
                messageChannel.port1.onmessage = (event) => {
                    if (event.data && event.data.type === 'CACHE_STATUS') {
                        console.log(`[OfflineManager] Cache Status: ${event.data.cached}/${event.data.total} assets cached (v${event.data.version})`);
                        resolve(event.data);
                    }
                };
                
                navigator.serviceWorker.controller.postMessage(
                    { type: 'GET_CACHE_STATUS' },
                    [messageChannel.port2]
                );
            });
        }
        return null;
    }
    
    // Public methods for game integration
    isOffline() {
        return !this.isOnline;
    }
    
    isCacheReady() {
        return !!navigator.serviceWorker.controller;
    }
    
    async clearCache() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            const snakeCaches = cacheNames.filter(name => name.startsWith('snake-game-'));
            
            await Promise.all(snakeCaches.map(name => caches.delete(name)));
            console.log('[OfflineManager] Cache cleared');
            
            // Reload to re-cache
            window.location.reload();
        }
    }
}

// Initialize offline manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.offlineManager = new OfflineManager();
});

// Export for other modules
window.OfflineManager = OfflineManager;