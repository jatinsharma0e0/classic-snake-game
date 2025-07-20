/**
 * Service Worker & Cache Cleanup Utility
 * Comprehensive tool for managing service workers and clearing caches
 */

class ServiceWorkerCleanupUtility {
    constructor() {
        this.isDebugMode = false;
        this.logPrefix = '[SW-Cleanup]';
        this.cleanupResults = {
            serviceWorkersFound: 0,
            serviceWorkersUnregistered: 0,
            cachesFound: 0,
            cachesDeleted: 0,
            errors: []
        };
    }

    /**
     * Main cleanup function - performs complete cleanup
     */
    async performFullCleanup() {
        console.log(`${this.logPrefix} Starting comprehensive cleanup...`);
        this.resetResults();

        try {
            // Step 1: Handle Service Workers
            await this.cleanupServiceWorkers();
            
            // Step 2: Clear all caches
            await this.clearAllCaches();
            
            // Step 3: Verify cleanup
            await this.verifyCleanup();
            
            // Step 4: Show results
            this.displayResults();
            
            return this.cleanupResults;
        } catch (error) {
            console.error(`${this.logPrefix} Cleanup failed:`, error);
            this.cleanupResults.errors.push(error.message);
            return this.cleanupResults;
        }
    }

    /**
     * Reset cleanup results
     */
    resetResults() {
        this.cleanupResults = {
            serviceWorkersFound: 0,
            serviceWorkersUnregistered: 0,
            cachesFound: 0,
            cachesDeleted: 0,
            errors: []
        };
    }

    /**
     * Detect and cleanup all service workers
     */
    async cleanupServiceWorkers() {
        if (!('serviceWorker' in navigator)) {
            console.warn(`${this.logPrefix} Service Workers not supported in this browser`);
            return;
        }

        console.log(`${this.logPrefix} Detecting service workers...`);
        
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            this.cleanupResults.serviceWorkersFound = registrations.length;
            
            if (registrations.length === 0) {
                console.log(`${this.logPrefix} No service workers found`);
                return;
            }

            console.log(`${this.logPrefix} Found ${registrations.length} service worker(s)`);

            // Process each registration
            for (const registration of registrations) {
                await this.handleServiceWorkerRegistration(registration);
            }

        } catch (error) {
            console.error(`${this.logPrefix} Error getting service worker registrations:`, error);
            this.cleanupResults.errors.push(`SW Detection: ${error.message}`);
        }
    }

    /**
     * Handle individual service worker registration
     */
    async handleServiceWorkerRegistration(registration) {
        const scope = registration.scope;
        const scriptURL = registration.active ? registration.active.scriptURL : 'Unknown';
        
        console.log(`${this.logPrefix} Processing SW - Scope: ${scope}, Script: ${scriptURL}`);

        try {
            // Send FORCE_STOP message to active worker
            if (registration.active) {
                console.log(`${this.logPrefix} Sending FORCE_STOP message to active worker`);
                registration.active.postMessage({ 
                    type: 'FORCE_STOP',
                    timestamp: Date.now()
                });
                
                // Wait a moment for the worker to process the message
                await this.delay(500);
            }

            // Send FORCE_STOP to installing worker if exists
            if (registration.installing) {
                console.log(`${this.logPrefix} Sending FORCE_STOP message to installing worker`);
                registration.installing.postMessage({ 
                    type: 'FORCE_STOP',
                    timestamp: Date.now()
                });
            }

            // Send FORCE_STOP to waiting worker if exists
            if (registration.waiting) {
                console.log(`${this.logPrefix} Sending FORCE_STOP message to waiting worker`);
                registration.waiting.postMessage({ 
                    type: 'FORCE_STOP',
                    timestamp: Date.now()
                });
            }

            // Unregister the service worker
            const unregistered = await registration.unregister();
            
            if (unregistered) {
                console.log(`${this.logPrefix} Successfully unregistered SW: ${scope}`);
                this.cleanupResults.serviceWorkersUnregistered++;
            } else {
                console.warn(`${this.logPrefix} Failed to unregister SW: ${scope}`);
                this.cleanupResults.errors.push(`Failed to unregister: ${scope}`);
            }

        } catch (error) {
            console.error(`${this.logPrefix} Error handling SW registration:`, error);
            this.cleanupResults.errors.push(`SW Unregister: ${error.message}`);
        }
    }

    /**
     * Clear all cache storage
     */
    async clearAllCaches() {
        if (!('caches' in window)) {
            console.warn(`${this.logPrefix} Cache API not supported in this browser`);
            return;
        }

        console.log(`${this.logPrefix} Clearing all caches...`);

        try {
            const cacheNames = await caches.keys();
            this.cleanupResults.cachesFound = cacheNames.length;

            if (cacheNames.length === 0) {
                console.log(`${this.logPrefix} No caches found`);
                return;
            }

            console.log(`${this.logPrefix} Found ${cacheNames.length} cache(s):`, cacheNames);

            // Delete each cache
            const deletePromises = cacheNames.map(async (cacheName) => {
                try {
                    const deleted = await caches.delete(cacheName);
                    if (deleted) {
                        console.log(`${this.logPrefix} Deleted cache: ${cacheName}`);
                        this.cleanupResults.cachesDeleted++;
                    } else {
                        console.warn(`${this.logPrefix} Failed to delete cache: ${cacheName}`);
                        this.cleanupResults.errors.push(`Cache delete failed: ${cacheName}`);
                    }
                } catch (error) {
                    console.error(`${this.logPrefix} Error deleting cache ${cacheName}:`, error);
                    this.cleanupResults.errors.push(`Cache delete error: ${cacheName} - ${error.message}`);
                }
            });

            await Promise.all(deletePromises);

        } catch (error) {
            console.error(`${this.logPrefix} Error clearing caches:`, error);
            this.cleanupResults.errors.push(`Cache clearing: ${error.message}`);
        }
    }

    /**
     * Verify that cleanup was successful
     */
    async verifyCleanup() {
        console.log(`${this.logPrefix} Verifying cleanup...`);

        // Verify no service workers remain
        if ('serviceWorker' in navigator) {
            try {
                const remainingRegistrations = await navigator.serviceWorker.getRegistrations();
                if (remainingRegistrations.length > 0) {
                    console.warn(`${this.logPrefix} Warning: ${remainingRegistrations.length} service worker(s) still registered`);
                    remainingRegistrations.forEach(reg => {
                        console.warn(`${this.logPrefix} Remaining SW: ${reg.scope}`);
                    });
                } else {
                    console.log(`${this.logPrefix} ✅ No service workers remain`);
                }
            } catch (error) {
                console.error(`${this.logPrefix} Error verifying service workers:`, error);
            }
        }

        // Verify no caches remain
        if ('caches' in window) {
            try {
                const remainingCaches = await caches.keys();
                if (remainingCaches.length > 0) {
                    console.warn(`${this.logPrefix} Warning: ${remainingCaches.length} cache(s) still exist:`, remainingCaches);
                } else {
                    console.log(`${this.logPrefix} ✅ No caches remain`);
                }
            } catch (error) {
                console.error(`${this.logPrefix} Error verifying caches:`, error);
            }
        }
    }

    /**
     * Display cleanup results summary
     */
    displayResults() {
        console.log(`${this.logPrefix} === CLEANUP SUMMARY ===`);
        console.log(`${this.logPrefix} Service Workers Found: ${this.cleanupResults.serviceWorkersFound}`);
        console.log(`${this.logPrefix} Service Workers Unregistered: ${this.cleanupResults.serviceWorkersUnregistered}`);
        console.log(`${this.logPrefix} Caches Found: ${this.cleanupResults.cachesFound}`);
        console.log(`${this.logPrefix} Caches Deleted: ${this.cleanupResults.cachesDeleted}`);
        
        if (this.cleanupResults.errors.length > 0) {
            console.warn(`${this.logPrefix} Errors (${this.cleanupResults.errors.length}):`);
            this.cleanupResults.errors.forEach(error => {
                console.warn(`${this.logPrefix} - ${error}`);
            });
        } else {
            console.log(`${this.logPrefix} ✅ No errors during cleanup`);
        }
        
        console.log(`${this.logPrefix} === END SUMMARY ===`);
    }

    /**
     * Quick status check without cleanup
     */
    async getStatus() {
        const status = {
            serviceWorkers: 0,
            caches: 0,
            isSupported: true
        };

        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                status.serviceWorkers = registrations.length;
            } else {
                status.isSupported = false;
            }

            if ('caches' in window) {
                const cacheNames = await caches.keys();
                status.caches = cacheNames.length;
            }
        } catch (error) {
            console.error(`${this.logPrefix} Error getting status:`, error);
        }

        return status;
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear localStorage cache from asset loader
     */
    clearLocalStorageCache() {
        console.log(`${this.logPrefix} Clearing localStorage cache...`);
        
        let cleared = 0;
        const cachePrefix = 'snake_game_asset_';
        
        try {
            for (let key in localStorage) {
                if (key.startsWith(cachePrefix)) {
                    localStorage.removeItem(key);
                    cleared++;
                }
            }
            
            console.log(`${this.logPrefix} Cleared ${cleared} localStorage cache entries`);
            return cleared;
        } catch (error) {
            console.error(`${this.logPrefix} Error clearing localStorage:`, error);
            return 0;
        }
    }

    /**
     * Perform complete cleanup including localStorage
     */
    async performCompleteCleanup() {
        console.log(`${this.logPrefix} Starting COMPLETE cleanup (includes localStorage)...`);
        
        const results = await this.performFullCleanup();
        const localStorageCleared = this.clearLocalStorageCache();
        
        results.localStorageCleared = localStorageCleared;
        
        console.log(`${this.logPrefix} Complete cleanup finished. Consider refreshing the page.`);
        return results;
    }
}

// Global utility instance
window.swCleanup = new ServiceWorkerCleanupUtility();

// Convenience functions for console use
window.cleanServiceWorkers = () => window.swCleanup.performFullCleanup();
window.cleanEverything = () => window.swCleanup.performCompleteCleanup();
window.swStatus = () => window.swCleanup.getStatus();

// Auto-log available functions
console.log('🧹 SW Cleanup Utility loaded. Available functions:');
console.log('  - cleanServiceWorkers() - Clean SW and caches');
console.log('  - cleanEverything() - Clean SW, caches, and localStorage');
console.log('  - swStatus() - Check current status');
console.log('  - window.swCleanup - Full utility instance');