// Audio System for Snake Game
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        this.sounds = {};
        this.backgroundMusic = null;
        this.isMuted = false;
        this.masterVolume = 0.7;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.onStartScreen = true; // Track which screen we're on
        
        this.initializeAudio();
        this.createSounds();
    }
    
    async initializeAudio() {
        try {
            // Create audio context after user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }
    
    // Ensure audio context is running (call on first user interaction)
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    // Create cheerful sound effects using Web Audio API
    createSounds() {
        // Button click sound - cheerful pop
        this.sounds.buttonClick = () => this.createClickSound();
        
        // Game start sound - upbeat fanfare
        this.sounds.gameStart = () => this.createGameStartSound();
        
        // Snake movement - subtle whoosh (used sparingly)
        this.sounds.snakeMove = () => this.createMoveSound();
        
        // Eating food - satisfying crunch/munch
        this.sounds.eatFood = () => this.createEatSound();
        
        // Tongue flick - quick whistle/pop
        this.sounds.tongueFlick = () => this.createTongueSound();
        
        // Collision - funny bounce
        this.sounds.collision = () => this.createCollisionSound();
        
        // Hit animation - dramatic thud
        this.sounds.hitImpact = () => this.createHitSound();
        
        // Game over - lighthearted defeat
        this.sounds.gameOver = () => this.createGameOverSound();
    }
    
    // Cheerful button click sound
    createClickSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
        
        oscillator.type = 'sine';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
    
    // Upbeat game start fanfare
    createGameStartSound() {
        if (!this.audioContext) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const duration = 0.15;
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'triangle';
            
            const startTime = this.audioContext.currentTime + (index * duration);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    }
    
    // Subtle movement sound (used occasionally)
    createMoveSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.08);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.1, this.audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
        
        oscillator.type = 'sawtooth';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.08);
    }
    
    // Satisfying eating sound
    createEatSound() {
        if (!this.audioContext) return;
        
        // Create a crunchy eating sound with multiple components
        const frequencies = [400, 600, 800];
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, this.audioContext.currentTime + 0.1);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(freq * 1.5, this.audioContext.currentTime);
            
            const startTime = this.audioContext.currentTime + (index * 0.03);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
            
            oscillator.type = 'square';
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.1);
        });
    }
    
    // Quick tongue flick sound
    createTongueSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
        
        oscillator.type = 'sine';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
    
    // Funny collision sound
    createCollisionSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        oscillator.type = 'sawtooth';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    // Dramatic hit impact sound
    createHitSound() {
        if (!this.audioContext) return;
        
        // Create a more dramatic version of collision
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.6, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.type = 'square';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Lighthearted game over sound
    createGameOverSound() {
        if (!this.audioContext) return;
        
        // Descending musical phrase
        const notes = [523.25, 466.16, 415.30, 369.99]; // C5, Bb4, Ab4, F#4
        const duration = 0.3;
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'triangle';
            
            const startTime = this.audioContext.currentTime + (index * duration * 0.7);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    }
    
    // Create simple background music loop
    createBackgroundMusic() {
        if (!this.audioContext) return null;
        
        const duration = 8; // 8-second loop
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate a simple, calming melody
        const melody = [
            { freq: 261.63, time: 0, duration: 1 },     // C4
            { freq: 329.63, time: 1, duration: 1 },     // E4
            { freq: 392.00, time: 2, duration: 1 },     // G4
            { freq: 329.63, time: 3, duration: 1 },     // E4
            { freq: 293.66, time: 4, duration: 1 },     // D4
            { freq: 261.63, time: 5, duration: 1 },     // C4
            { freq: 246.94, time: 6, duration: 1 },     // B3
            { freq: 261.63, time: 7, duration: 1 },     // C4
        ];
        
        // Fill buffer with melody
        for (let note of melody) {
            const startSample = Math.floor(note.time * this.audioContext.sampleRate);
            const endSample = Math.floor((note.time + note.duration) * this.audioContext.sampleRate);
            
            for (let i = startSample; i < endSample && i < data.length; i++) {
                const t = (i - startSample) / this.audioContext.sampleRate;
                const envelope = Math.sin(Math.PI * t / note.duration); // Simple envelope
                data[i] += Math.sin(2 * Math.PI * note.freq * t) * envelope * 0.1;
            }
        }
        
        return buffer;
    }
    
    // Play background music (only on start screen)
    playBackgroundMusic() {
        if (!this.audioContext || this.isMuted || !this.onStartScreen) return;
        
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
        }
        
        const buffer = this.createBackgroundMusic();
        if (!buffer) return;
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
        source.loop = true;
        source.start();
        
        this.backgroundMusic = source;
    }
    
    // Stop background music
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }
    
    // Play a sound effect
    playSound(soundName) {
        if (!this.audioContext || this.isMuted || !this.sounds[soundName]) return;
        
        try {
            this.sounds[soundName]();
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }
    
    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopBackgroundMusic();
        } else {
            // Only play background music if we're on the start screen
            if (this.onStartScreen) {
                this.playBackgroundMusic();
            }
        }
        
        return this.isMuted;
    }
    
    // Set current screen (to control background music)
    setScreen(isStartScreen) {
        this.onStartScreen = isStartScreen;
        if (!isStartScreen) {
            // Stop background music when not on start screen
            this.stopBackgroundMusic();
        } else if (!this.isMuted) {
            // Play background music when returning to start screen (if not muted)
            this.playBackgroundMusic();
        }
    }
    
    // Set volume levels
    setVolume(type, volume) {
        volume = Math.max(0, Math.min(1, volume));
        
        switch(type) {
            case 'master':
                this.masterVolume = volume;
                break;
            case 'music':
                this.musicVolume = volume;
                if (this.backgroundMusic) {
                    // Restart music with new volume
                    this.playBackgroundMusic();
                }
                break;
            case 'sfx':
                this.sfxVolume = volume;
                break;
        }
    }
}

// Export for use in game
window.AudioManager = AudioManager;