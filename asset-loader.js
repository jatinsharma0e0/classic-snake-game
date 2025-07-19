/**
 * Advanced Asset Preloader System with localStorage Caching
 * Validates cached assets and bypasses loading when possible
 */

class AssetLoader {
    constructor() {
        this.assets = [];
        this.loadedAssets = 0;
        this.totalAssets = 0;
        this.progressCallback = null;
        this.completeCallback = null;
        this.skipLoadingCallback = null;
        
        // Asset validation and caching
        this.cachePrefix = 'snake_game_asset_';
        this.cacheVersion = '1.0.0'; // Increment to invalidate all cached assets
        this.assetStatus = new Map(); // Track asset loading status
        this.validationTimeout = 3000; // Max time for validation
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB cache limit
        
        // Define all assets that need to be preloaded
        this.defineAssets();
    }
    
    defineAssets() {
        // Font assets (highest priority - load first)
        this.fontAssets = [
            'assets/fonts/driftwood.ttf',
            'assets/fonts/Display-Dots-Two-Sans.ttf'
        ];
        
        // Core game assets
        this.coreAssets = [
            'assets/snake-icon.png',
            'assets/start-button.png',
            'assets/wooden-play-button.png',
            'assets/settings-button.png',
            'assets/home-food.png',
            'assets/title-bg.png',
            'assets/jungle-bg.jpg',
            'assets/grass-bg.webp'
        ];
        
        // Obstacle assets
        this.obstacleAssets = [
            'assets/1-block-rock.png',
            'assets/2-blocks-rock.png',
            'assets/4-blocks-rock.png',
            'assets/1-block-obstacle.png'
        ];
        
        // Default greeny skin assets
        this.greenySkinAssets = [
            'assets/skins/greeny/greeny_head.png',
            'assets/skins/greeny/greeny_body_straight.png',
            'assets/skins/greeny/greeny_body_turn.png',
            'assets/skins/greeny/greeny_tail.png',
            'assets/skins/greeny/greeny_food.png',
            'assets/skins/greeny/greeny_dead_head.png'
        ];
        
        // Audio assets - Temporarily disabled due to corrupted files
        this.audioAssets = [
            // 'assets/audio/background_music.mp3',
            // 'assets/audio/button_click.mp3',
            // 'assets/audio/game_start.mp3',
            // 'assets/audio/snake_move.mp3',
            // 'assets/audio/eat_food.mp3',
            // 'assets/audio/tongue_flick.mp3',
            // 'assets/audio/collision.mp3',
            // 'assets/audio/hit_impact.mp3',
            // 'assets/audio/game_over.mp3'
        ];
        
        // Combine all assets (fonts first for priority loading)
        this.assets = [
            ...this.fontAssets,
            ...this.coreAssets,
            ...this.obstacleAssets,
            ...this.greenySkinAssets,
            ...this.audioAssets
        ];
        
        this.totalAssets = this.assets.length;
    }
    
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }
    
    setCompleteCallback(callback) {
        this.completeCallback = callback;
    }
    
    setSkipLoadingCallback(callback) {
        this.skipLoadingCallback = callback;
    }
    
    // Asset validation and caching methods
    getCacheKey(assetPath) {
        return this.cachePrefix + assetPath.replace(/[^a-zA-Z0-9]/g, '_');
    }
    
    getCacheMetaKey(assetPath) {
        return this.getCacheKey(assetPath) + '_meta';
    }
    
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }
    
    getCacheSize() {
        if (!this.isLocalStorageAvailable()) return 0;
        
        let size = 0;
        for (let key in localStorage) {
            if (key.startsWith(this.cachePrefix)) {
                size += localStorage[key].length;
            }
        }
        return size;
    }
    
    cleanupOldCache() {
        if (!this.isLocalStorageAvailable()) return;
        
        // Remove assets from older versions
        const keysToRemove = [];
        for (let key in localStorage) {
            if (key.startsWith(this.cachePrefix)) {
                // Skip meta keys during iteration, handle them with their corresponding data keys
                if (key.endsWith('_meta')) continue;
                
                const assetPath = key.replace(this.cachePrefix, '');
                const meta = this.getCachedAssetMeta(assetPath);
                if (!meta || meta.version !== this.cacheVersion) {
                    keysToRemove.push(key);
                    keysToRemove.push(key + '_meta');
                }
            }
        }
        
        // Remove outdated keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clean up if cache is too large
        if (this.getCacheSize() > this.maxCacheSize) {
            this.clearCache();
        }
    }
    
    clearCache() {
        if (!this.isLocalStorageAvailable()) return;
        
        for (let key in localStorage) {
            if (key.startsWith(this.cachePrefix)) {
                localStorage.removeItem(key);
            }
        }
    }
    
    getCachedAsset(assetPath) {
        if (!this.isLocalStorageAvailable()) return null;
        
        try {
            const cached = localStorage.getItem(this.getCacheKey(assetPath));
            return cached ? JSON.parse(cached) : null;
        } catch(e) {
            return null;
        }
    }
    
    getCachedAssetMeta(assetPath) {
        if (!this.isLocalStorageAvailable()) return null;
        
        try {
            const meta = localStorage.getItem(this.getCacheMetaKey(assetPath));
            return meta ? JSON.parse(meta) : null;
        } catch(e) {
            return null;
        }
    }
    
    setCachedAsset(assetPath, data, type) {
        if (!this.isLocalStorageAvailable()) return false;
        
        try {
            const cacheData = {
                data: data,
                type: type,
                timestamp: Date.now()
            };
            
            const metaData = {
                version: this.cacheVersion,
                size: JSON.stringify(cacheData).length,
                timestamp: Date.now(),
                type: type
            };
            
            const cacheKey = this.getCacheKey(assetPath);
            const metaKey = this.getCacheMetaKey(assetPath);
            
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            localStorage.setItem(metaKey, JSON.stringify(metaData));
            
            // Debug: Verify the data was saved
            const savedCache = localStorage.getItem(cacheKey);
            const savedMeta = localStorage.getItem(metaKey);
            
            if (!savedCache || !savedMeta) {
                console.warn(`Failed to save to localStorage for ${assetPath}: cache=${!!savedCache}, meta=${!!savedMeta}`);
                return false;
            }
            
            console.log(`Successfully saved cache for ${assetPath}: cache size=${savedCache.length}, meta size=${savedMeta.length}`);
            return true;
        } catch(e) {
            console.warn(`Failed to cache asset: ${assetPath}`, e);
            return false;
        }
    }
    
    async validateCachedAssets() {
        console.log('Validating cached assets...');
        
        if (!this.isLocalStorageAvailable()) {
            console.log('localStorage not available, proceeding with full load');
            return false;
        }
        
        this.cleanupOldCache();
        
        let criticalAssetsValid = true;
        let totalValid = 0;
        let totalCritical = 0;
        const validationPromises = [];
        
        for (const assetPath of this.assets) {
            const promise = this.validateSingleAsset(assetPath);
            validationPromises.push(promise);
        }
        
        const results = await Promise.all(validationPromises);
        
        for (let i = 0; i < results.length; i++) {
            const assetPath = this.assets[i];
            const isValid = results[i];
            const isAudio = assetPath.match(/\.(mp3|ogg|wav)$/i);
            
            this.assetStatus.set(assetPath, isValid ? 'cached' : 'needs_download');
            
            if (isValid) {
                totalValid++;
            }
            
            // Only count non-audio assets as critical for validation
            if (!isAudio) {
                totalCritical++;
                if (!isValid) {
                    criticalAssetsValid = false;
                }
            }
        }
        
        const validPercentage = Math.round((totalValid / this.assets.length) * 100);
        const expectedNonAudio = this.assets.length - this.audioAssets.length;
        console.log(`Asset validation complete. Critical assets valid: ${criticalAssetsValid}, Overall: ${totalValid}/${this.assets.length} (${validPercentage}%), Expected non-audio: ${expectedNonAudio}`);
        
        // Debug: Log asset status
        const validAssets = [];
        const invalidAssets = [];
        for (const [path, status] of this.assetStatus) {
            if (status === 'cached') {
                validAssets.push(path);
            } else {
                invalidAssets.push(path);
            }
        }
        console.log(`Valid cached assets: ${validAssets.length}`, validAssets.slice(0, 5));
        console.log(`Invalid/missing assets: ${invalidAssets.length}`, invalidAssets.slice(0, 5));
        
        // Consider cache valid if all critical (non-audio) assets are cached
        // Audio files are optional since they often fail to load anyway
        return criticalAssetsValid && totalValid >= expectedNonAudio;
    }
    
    async validateSingleAsset(assetPath) {
        try {
            const cacheKey = this.getCacheKey(assetPath);
            const metaKey = this.getCacheMetaKey(assetPath);
            
            // Debug: Check if keys exist in localStorage
            const hasCache = localStorage.getItem(cacheKey) !== null;
            const hasMeta = localStorage.getItem(metaKey) !== null;
            
            if (!hasCache || !hasMeta) {
                console.log(`Missing cache for ${assetPath}: cache=${hasCache}, meta=${hasMeta}`);
                return false;
            }
            
            const cachedData = this.getCachedAsset(assetPath);
            const cachedMeta = this.getCachedAssetMeta(assetPath);
            
            if (!cachedData || !cachedMeta) {
                console.log(`Failed to parse cache for ${assetPath}`);
                return false;
            }
            
            // Check version
            if (cachedMeta.version !== this.cacheVersion) {
                console.log(`Version mismatch for ${assetPath}: ${cachedMeta.version} vs ${this.cacheVersion}`);
                return false;
            }
            
            // Check if data is non-empty and correct type
            if (!cachedData.data || !cachedData.type) {
                console.log(`Invalid data for ${assetPath}: data=${!!cachedData.data}, type=${cachedData.type}`);
                return false;
            }
            
            // Validate based on asset type
            if (assetPath.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
                const isValid = cachedData.type === 'image' && 
                               cachedData.data.startsWith('data:image/') &&
                               cachedData.data.length > 100;
                if (!isValid) console.log(`Invalid image cache for ${assetPath}`);
                return isValid;
            } else if (assetPath.match(/\.(mp3|ogg|wav)$/i)) {
                const isValid = cachedData.type === 'audio' && 
                               cachedData.data.startsWith('data:audio/') &&
                               cachedData.data.length > 1000;
                if (!isValid) console.log(`Invalid audio cache for ${assetPath}`);
                return isValid;
            } else if (assetPath.match(/\.(ttf|otf|woff|woff2)$/i)) {
                const isValid = cachedData.type === 'font' && 
                               cachedData.data.startsWith('data:font/') &&
                               cachedData.data.length > 1000;
                if (!isValid) console.log(`Invalid font cache for ${assetPath}`);
                return isValid;
            }
            
            console.log(`Valid cache for ${assetPath}`);
            return true;
        } catch(e) {
            console.warn(`Error validating cached asset: ${assetPath}`, e);
            return false;
        }
    }
    
    updateProgress() {
        const progress = Math.round((this.loadedAssets / this.totalAssets) * 100);
        if (this.progressCallback) {
            this.progressCallback(progress, this.loadedAssets, this.totalAssets);
        }
        
        if (this.loadedAssets >= this.totalAssets) {
            setTimeout(() => {
                if (this.completeCallback) {
                    this.completeCallback();
                }
            }, 500); // Small delay to show 100% completion
        }
    }
    
    async loadAsset(src) {
        // Check if we already have this asset cached and validated
        const assetStatus = this.assetStatus.get(src);
        if (assetStatus === 'cached') {
            const cachedData = this.getCachedAsset(src);
            if (cachedData) {
                this.loadedAssets++;
                this.updateProgress();
                console.log(`Loading from cache: ${src}`);
                return this.createAssetFromCache(src, cachedData);
            }
        }

        // Load from network and cache
        return new Promise((resolve, reject) => {
            if (src.endsWith('.mp3') || src.endsWith('.ogg') || src.endsWith('.wav')) {
                // Load audio asset
                const audio = new Audio();
                audio.addEventListener('canplaythrough', () => {
                    this.cacheAudioAsset(src, audio);
                    this.loadedAssets++;
                    this.updateProgress();
                    resolve(audio);
                });
                audio.addEventListener('error', () => {
                    console.warn(`Failed to load audio: ${src}`);
                    this.loadedAssets++; // Still count as loaded to prevent hanging
                    this.updateProgress();
                    resolve(null);
                });
                audio.src = src;
                audio.load();
            } else if (src.endsWith('.ttf') || src.endsWith('.otf') || src.endsWith('.woff') || src.endsWith('.woff2')) {
                // Load font asset
                const font = new FontFace('PreloadFont', `url(${src})`);
                font.load().then((loadedFont) => {
                    this.cacheFontAsset(src, loadedFont);
                    this.loadedAssets++;
                    this.updateProgress();
                    resolve(loadedFont);
                }).catch(() => {
                    console.warn(`Failed to load font: ${src}`);
                    this.loadedAssets++; // Still count as loaded to prevent hanging
                    this.updateProgress();
                    resolve(null);
                });
            } else {
                // Load image asset
                const img = new Image();
                img.addEventListener('load', () => {
                    this.cacheImageAsset(src, img);
                    this.loadedAssets++;
                    this.updateProgress();
                    resolve(img);
                });
                img.addEventListener('error', () => {
                    console.warn(`Failed to load image: ${src}`);
                    this.loadedAssets++; // Still count as loaded to prevent hanging
                    this.updateProgress();
                    resolve(null);
                });
                img.src = src;
            }
        });
    }
    
    createAssetFromCache(src, cachedData) {
        try {
            if (src.endsWith('.mp3') || src.endsWith('.ogg') || src.endsWith('.wav')) {
                const audio = new Audio();
                audio.src = cachedData.data;
                return audio;
            } else if (src.endsWith('.ttf') || src.endsWith('.otf') || src.endsWith('.woff') || src.endsWith('.woff2')) {
                const font = new FontFace('PreloadFont', cachedData.data);
                return font;
            } else {
                const img = new Image();
                img.src = cachedData.data;
                return img;
            }
        } catch(e) {
            console.warn(`Failed to create asset from cache: ${src}`, e);
            return null;
        }
    }
    
    async cacheImageAsset(src, img) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            ctx.drawImage(img, 0, 0);
            
            // Use appropriate format based on file extension
            let format = 'image/png';
            let quality = 0.9;
            if (src.endsWith('.jpg') || src.endsWith('.jpeg')) {
                format = 'image/jpeg';
            } else if (src.endsWith('.webp')) {
                format = 'image/webp';
            }
            
            const dataUrl = canvas.toDataURL(format, quality);
            this.setCachedAsset(src, dataUrl, 'image');
            console.log(`Successfully cached image: ${src}`);
        } catch(e) {
            console.warn(`Failed to cache image: ${src}`, e);
        }
    }
    
    async cacheFontAsset(src, font) {
        try {
            // For fonts, we'll store the original URL since data URLs for fonts are complex
            const response = await fetch(src);
            const arrayBuffer = await response.arrayBuffer();
            
            // Convert ArrayBuffer to base64 more efficiently
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            
            // Determine MIME type based on file extension
            let mimeType = 'font/truetype';
            if (src.endsWith('.woff')) mimeType = 'font/woff';
            else if (src.endsWith('.woff2')) mimeType = 'font/woff2';
            else if (src.endsWith('.otf')) mimeType = 'font/opentype';
            
            const dataUrl = `data:${mimeType};base64,${base64}`;
            this.setCachedAsset(src, dataUrl, 'font');
            console.log(`Successfully cached font: ${src}`);
        } catch(e) {
            console.warn(`Failed to cache font: ${src}`, e);
        }
    }
    
    async cacheAudioAsset(src, audio) {
        try {
            const response = await fetch(src);
            const arrayBuffer = await response.arrayBuffer();
            
            // Convert ArrayBuffer to base64 more efficiently
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            
            // Determine MIME type
            let mimeType = 'audio/mpeg';
            if (src.endsWith('.ogg')) mimeType = 'audio/ogg';
            else if (src.endsWith('.wav')) mimeType = 'audio/wav';
            
            const dataUrl = `data:${mimeType};base64,${base64}`;
            this.setCachedAsset(src, dataUrl, 'audio');
            console.log(`Successfully cached audio: ${src}`);
        } catch(e) {
            console.warn(`Failed to cache audio: ${src}`, e);
        }
    }
    
    applyCachedBackgrounds() {
        // Apply cached background images immediately to prevent slow loading
        const backgroundAssets = [
            'assets/jungle-bg.jpg',
            'assets/title-bg.png',
            'assets/grass-bg.webp'
        ];
        
        backgroundAssets.forEach(assetPath => {
            const cachedData = this.getCachedAsset(assetPath);
            if (cachedData && cachedData.data) {
                // Apply cached background to elements that use this asset
                if (assetPath === 'assets/jungle-bg.jpg') {
                    const homeScreen = document.getElementById('homeScreen');
                    if (homeScreen) {
                        homeScreen.style.backgroundImage = `url(${cachedData.data})`;
                    }
                } else if (assetPath === 'assets/title-bg.png') {
                    const titleBg = document.querySelector('.title-bg');
                    if (titleBg) {
                        titleBg.style.backgroundImage = `url(${cachedData.data})`;
                    }
                } else if (assetPath === 'assets/grass-bg.webp') {
                    const gameScreen = document.getElementById('gameScreen');
                    if (gameScreen) {
                        gameScreen.style.backgroundImage = `url(${cachedData.data})`;
                    }
                }
                console.log(`Applied cached background: ${assetPath}`);
            }
        });
    }
    
    async loadAllAssets() {
        console.log(`Starting asset loading process...`);
        
        try {
            // Step 1: Validate cached assets first
            const allCached = await Promise.race([
                this.validateCachedAssets(),
                new Promise(resolve => setTimeout(() => resolve(false), this.validationTimeout))
            ]);
            
            if (allCached) {
                console.log('All assets validated from cache, skipping loading screen');
                this.loadedAssets = this.totalAssets;
                this.updateProgress();
                
                // Apply cached backgrounds immediately
                this.applyCachedBackgrounds();
                
                // Skip loading screen and go directly to game
                if (this.skipLoadingCallback) {
                    this.skipLoadingCallback();
                }
                return;
            }
            
            console.log(`Loading ${this.totalAssets} assets...`);
            
            // Step 2: Apply cached background images immediately to prevent slow loading
            this.applyCachedBackgrounds();
            
            // Step 3: Load fonts first (critical for proper text rendering)
            console.log('Loading fonts...');
            const fontPromises = this.fontAssets.map(src => this.loadAsset(src));
            await Promise.all(fontPromises);
            console.log('Fonts loaded successfully!');
            
            // Transition from black overlay to loading screen after fonts load
            this.transitionToLoadingScreen();
            
            // Step 3: Load remaining assets in parallel
            console.log('Loading remaining assets...');
            const otherAssets = [
                ...this.coreAssets,
                ...this.obstacleAssets,
                ...this.greenySkinAssets,
                ...this.audioAssets
            ];
            const otherPromises = otherAssets.map(src => this.loadAsset(src));
            await Promise.all(otherPromises);
            
            console.log('All assets loaded successfully!');
        } catch (error) {
            console.error('Error loading assets:', error);
            // Fallback: continue to loading screen even if validation fails
            this.transitionToLoadingScreen();
        }
    }
    
    transitionToLoadingScreen() {
        const blackOverlay = document.getElementById('blackOverlay');
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (blackOverlay && loadingScreen) {
            // Start fade out of black overlay
            blackOverlay.classList.add('fade-out');
            
            // Show loading screen with slight delay for smooth transition
            setTimeout(() => {
                loadingScreen.classList.add('active');
            }, 200);
            
            // Remove black overlay from DOM after transition completes
            setTimeout(() => {
                blackOverlay.style.display = 'none';
            }, 800);
        }
    }
}

// Initialize the asset loader when script loads
window.assetLoader = new AssetLoader();