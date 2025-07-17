/**
 * Asset Preloader System for Snake Game
 * Preloads all necessary assets before showing the main game
 */

class AssetLoader {
    constructor() {
        this.assets = [];
        this.loadedAssets = 0;
        this.totalAssets = 0;
        this.progressCallback = null;
        this.completeCallback = null;
        
        // Define all assets that need to be preloaded
        this.defineAssets();
    }
    
    defineAssets() {
        // Core game assets
        const coreAssets = [
            'assets/snake-icon.png',
            'assets/start-button.png',
            'assets/wooden-play-button.png',
            'assets/title-bg.png',
            'assets/jungle-bg.jpg',
            'assets/grass-bg.webp',
            'assets/fonts/driftwood.ttf',
            'assets/fonts/Display-Dots-Two-Sans.ttf'
        ];
        
        // Obstacle assets
        const obstacleAssets = [
            'assets/1-block-rock.png',
            'assets/2-blocks-rock.png',
            'assets/4-blocks-rock.png',
            'assets/1-block-obstacle.png'
        ];
        
        // Default greeny skin assets
        const greenySkinAssets = [
            'assets/skins/greeny/greeny_head.png',
            'assets/skins/greeny/greeny_body_straight.png',
            'assets/skins/greeny/greeny_body_turn.png',
            'assets/skins/greeny/greeny_tail.png',
            'assets/skins/greeny/greeny_food.png',
            'assets/skins/greeny/greeny_dead_head.png'
        ];
        
        // Audio assets
        const audioAssets = [
            'assets/audio/background_music.mp3',
            'assets/audio/button_click.mp3',
            'assets/audio/game_start.mp3',
            'assets/audio/snake_move.mp3',
            'assets/audio/eat_food.mp3',
            'assets/audio/tongue_flick.mp3',
            'assets/audio/collision.mp3',
            'assets/audio/hit_impact.mp3',
            'assets/audio/game_over.mp3'
        ];
        
        // Combine all assets
        this.assets = [
            ...coreAssets,
            ...obstacleAssets,
            ...greenySkinAssets,
            ...audioAssets
        ];
        
        this.totalAssets = this.assets.length;
    }
    
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }
    
    setCompleteCallback(callback) {
        this.completeCallback = callback;
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
    
    loadAsset(src) {
        return new Promise((resolve, reject) => {
            if (src.endsWith('.mp3') || src.endsWith('.ogg') || src.endsWith('.wav')) {
                // Load audio asset
                const audio = new Audio();
                audio.addEventListener('canplaythrough', () => {
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
                font.load().then(() => {
                    this.loadedAssets++;
                    this.updateProgress();
                    resolve(font);
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
    
    async loadAllAssets() {
        console.log(`Starting to load ${this.totalAssets} assets...`);
        
        // Load all assets in parallel for maximum performance
        const promises = this.assets.map(src => this.loadAsset(src));
        
        try {
            await Promise.all(promises);
            console.log('All assets loaded successfully!');
        } catch (error) {
            console.error('Error loading assets:', error);
        }
    }
}

// Initialize the asset loader when script loads
window.assetLoader = new AssetLoader();