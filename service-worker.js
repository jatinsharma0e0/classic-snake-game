/**
 * Snake Game Service Worker - Full Offline Support
 * Caches all game assets for offline gameplay
 */

const CACHE_NAME = 'snake-game-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Define all assets to cache for offline support
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/game.js',
    '/audio.js',
    '/asset-loader.js',
    '/dev-toggle.js'
];

const FONT_ASSETS = [
    '/assets/fonts/driftwood.ttf',
    '/assets/fonts/display_dots_two_sans.ttf'
];

const IMAGE_ASSETS = [
    '/assets/snake/snake_icon.webp',
    '/assets/backgrounds/log.webp',
    '/assets/buttons/play_wooden.webp',
    '/assets/buttons/play_default.webp',
    '/assets/buttons/settings.webp',
    '/assets/backgrounds/title_screen_bg.webp',
    '/assets/backgrounds/jungle.webp',
    '/assets/backgrounds/grass_01.webp',
    '/assets/backgrounds/grass_02.webp',
    '/assets/backgrounds/grass_03.webp',
    '/assets/backgrounds/game_over_board.webp',
    '/assets/obstacles/rock_1_block.webp',
    '/assets/obstacles/rock_2_blocks.webp',
    '/assets/obstacles/rock_4_blocks.webp',
    '/assets/obstacles/rock_1_block_alt.webp',
    '/assets/snake/skins/greeny/head.webp',
    '/assets/snake/skins/greeny/body_straight.webp',
    '/assets/snake/skins/greeny/body_turn.webp',
    '/assets/snake/skins/greeny/tail.webp',
    '/assets/snake/skins/greeny/food.webp',
    '/assets/snake/skins/greeny/dead_head.webp',
    '/assets/snake/sprites/greeny/greeny_spritesheet.webp',
    '/assets/buttons/home_food_icon.webp',
    '/assets/buttons/home_stone.webp',
    '/assets/buttons/retry_stone.webp'
];

const AUDIO_ASSETS = [
    '/assets/audio/jungle_snake_background_music.mp3',
    '/assets/audio/jungle_snake_button_click.mp3',
    '/assets/audio/jungle_snake_game_start.mp3',
    '/assets/audio/jungle_snake_snake_move.mp3',
    '/assets/audio/jungle_snake_eat_food.mp3',
    '/assets/audio/jungle_snake_tongue_flick.mp3',
    '/assets/audio/jungle_snake_collision.mp3',
    '/assets/audio/jungle_snake_hit_impact.mp3',
    '/assets/audio/jungle_snake_game_over.mp3',
    '/assets/audio/jungle_snake_hover.mp3'
];

// Combine all assets for caching
const ASSETS_TO_CACHE = [
    ...CORE_ASSETS,
    ...FONT_ASSETS,
    ...IMAGE_ASSETS,
    ...AUDIO_ASSETS
];

// Install event - cache all assets
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching app shell and assets');
                console.log(`[ServiceWorker] Caching ${ASSETS_TO_CACHE.length} total assets`);
                
                // Cache assets in batches to avoid overwhelming the browser
                return cacheAssetsInBatches(cache, ASSETS_TO_CACHE, 10);
            })
            .then(() => {
                console.log('[ServiceWorker] All assets cached successfully');
                // Force the waiting service worker to become the active service worker
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[ServiceWorker] Failed to cache assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Delete old caches that don't match current version
                            return cacheName.startsWith('snake-game-') && cacheName !== CACHE_NAME;
                        })
                        .map(cacheName => {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Cache cleanup complete');
                // Ensure the service worker takes control immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache when offline, network when online
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests that aren't assets
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached response if available
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Otherwise, fetch from network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone the response for caching
                        const responseToCache = networkResponse.clone();
                        
                        // Cache the new response for future use
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed and no cache available
                        // For HTML requests, return a fallback page
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // For other requests, just fail
                        return new Response('Offline - Asset not available', {
                            status: 404,
                            statusText: 'Offline'
                        });
                    });
            })
    );
});

// Helper function to cache assets in batches
async function cacheAssetsInBatches(cache, assets, batchSize) {
    const batches = [];
    
    // Split assets into batches
    for (let i = 0; i < assets.length; i += batchSize) {
        batches.push(assets.slice(i, i + batchSize));
    }
    
    // Cache each batch sequentially
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`[ServiceWorker] Caching batch ${i + 1}/${batches.length} (${batch.length} assets)`);
        
        try {
            await cache.addAll(batch);
            console.log(`[ServiceWorker] Batch ${i + 1} cached successfully`);
        } catch (error) {
            console.warn(`[ServiceWorker] Some assets in batch ${i + 1} failed to cache:`, error);
            
            // Try to cache assets individually in this batch
            for (const asset of batch) {
                try {
                    await cache.add(asset);
                } catch (assetError) {
                    console.warn(`[ServiceWorker] Failed to cache individual asset: ${asset}`, assetError);
                }
            }
        }
    }
}

// Message handler for cache updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_STATUS') {
        // Send cache status back to client
        caches.open(CACHE_NAME)
            .then(cache => cache.keys())
            .then(keys => {
                event.ports[0].postMessage({
                    type: 'CACHE_STATUS',
                    cached: keys.length,
                    total: ASSETS_TO_CACHE.length,
                    version: CACHE_VERSION
                });
            });
    }
});

// Handle updates - notify clients when new version is available
self.addEventListener('controllerchange', () => {
    // Send message to all clients that SW has been updated
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'SW_UPDATED',
                message: 'New version available! Refresh to update.'
            });
        });
    });
});