// Audio System for Snake Game - Performance Optimized
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        this.sounds = {};
        this.backgroundMusic = null;
        this.isMuted = false;
        this.autoPlayAttempted = false;
        
        // Audio settings with defaults (matching UI image)
        this.settings = {
            masterVolume: 100,   // 100% master volume
            musicVolume: 40,     // 40% music volume  
            sfxVolume: 7,        // 7% sound effects volume
            uiSounds: true,      // UI click sounds enabled
            vibration: false     // Vibration disabled by default
        };
        
        // Store default settings for reset functionality
        this.defaultSettings = {
            masterVolume: 100,
            musicVolume: 40,
            sfxVolume: 7,
            uiSounds: true,
            vibration: false
        };
        
        // Load settings from localStorage
        this.loadSettings();
        
        this.onStartScreen = true; // Track which screen we're on
        
        // Performance optimizations
        this.soundCooldowns = new Map();
        this.maxConcurrentSounds = 6; // Limit for mobile performance
        this.activeSources = [];
        this.audioPool = new Map(); // Reuse audio nodes
        this.lastPlayTime = new Map(); // Prevent audio spam
        this.audioProcessingPaused = false; // Pause audio processing when not needed
        
        this.initializeAudio();
        this.createSounds();
        this.initializeSettingsUI();
        this.setupAutoPlay();
        this.addHoverSounds();
    }
    
    async initializeAudio() {
        try {
            // Create audio context - will be suspended until user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (error) {
            // Silently fail if audio not supported
            this.isInitialized = false;
        }
    }
    
    // Ensure audio context is running (call on first user interaction)
    async resumeAudioContext() {
        try {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            return Promise.resolve();
        } catch (error) {
            // Silently handle resume failures - browser restrictions
            return Promise.resolve();
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
        
        // Hover sound - subtle UI feedback
        this.sounds.hover = () => this.createHoverSound();
    }
    
    // Cheerful button click sound
    createClickSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.15;
        const sampleRate = this.audioContext.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 800 + (400 * t / duration); // Frequency sweep from 800 to 1200Hz
            const envelope = Math.exp(-t * 6); // Exponential decay
            const signal = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
            
            leftData[i] = signal;
            rightData[i] = signal;
        }
        
        return buffer;
    }
    
    // Upbeat game start fanfare
    createGameStartSound() {
        if (!this.audioContext) return null;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const noteDuration = 0.15;
        const totalDuration = notes.length * noteDuration;
        const sampleRate = this.audioContext.sampleRate;
        const length = Math.floor(totalDuration * sampleRate);
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);
        
        notes.forEach((freq, index) => {
            const startSample = Math.floor(index * noteDuration * sampleRate);
            const endSample = Math.floor((index + 1) * noteDuration * sampleRate);
            
            for (let i = startSample; i < endSample && i < length; i++) {
                const t = (i - startSample) / sampleRate;
                const envelope = Math.exp(-t * 4) * (1 - Math.exp(-t * 20)); // Attack + decay
                const signal = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
                
                leftData[i] += signal;
                rightData[i] += signal;
            }
        });
        
        return buffer;
    }
    
    // Subtle movement sound (used occasionally)
    createMoveSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.08;
        const sampleRate = this.audioContext.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 200 - (50 * t / duration); // Frequency sweep from 200 to 150Hz
            const envelope = Math.exp(-t * 12); // Quick decay
            
            // Sawtooth wave approximation
            const sawtooth = 2 * (freq * t - Math.floor(freq * t + 0.5));
            const signal = sawtooth * envelope * 0.1;
            
            leftData[i] = signal;
            rightData[i] = signal;
        }
        
        return buffer;
    }
    
    // Satisfying eating sound
    createEatSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);
        
        // Create a crunchy eating sound with multiple frequency components
        const frequencies = [400, 600, 800];
        
        frequencies.forEach((freq, index) => {
            const startSample = Math.floor(index * 0.03 * sampleRate);
            const componentDuration = 0.1;
            const endSample = Math.floor((index * 0.03 + componentDuration) * sampleRate);
            
            for (let i = startSample; i < endSample && i < length; i++) {
                const t = (i - startSample) / sampleRate;
                const freqSweep = freq * (1 - 0.5 * t / componentDuration); // Frequency drops by half
                const envelope = Math.exp(-t * 10); // Quick decay
                
                // Square wave approximation
                const square = Math.sign(Math.sin(2 * Math.PI * freqSweep * t));
                const signal = square * envelope * 0.3;
                
                leftData[i] += signal;
                rightData[i] += signal;
            }
        });
        
        return buffer;
    }
    
    // Quick tongue flick sound
    createTongueSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.05;
        const sampleRate = this.audioContext.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 1200 * Math.exp(-t * 8); // Exponential frequency drop from 1200 to ~800Hz
            const envelope = Math.exp(-t * 20); // Very quick decay
            const signal = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
            
            leftData[i] = signal;
            rightData[i] = signal;
        }
        
        return buffer;
    }
    
    // Funny collision sound
    createCollisionSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 200 - (100 * t / duration); // Linear frequency drop from 200 to 100Hz
            const envelope = Math.exp(-t * 5); // Medium decay
            
            // Sawtooth wave approximation
            const sawtooth = 2 * (freq * t - Math.floor(freq * t + 0.5));
            const signal = sawtooth * envelope * 0.4;
            
            leftData[i] = signal;
            rightData[i] = signal;
        }
        
        return buffer;
    }
    
    // Dramatic hit impact sound
    createHitSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 150 * Math.exp(-t * 3.5); // Exponential frequency drop from 150 to ~50Hz
            const envelope = Math.exp(-t * 3.3); // Slower decay for dramatic effect
            
            // Square wave approximation
            const square = Math.sign(Math.sin(2 * Math.PI * freq * t));
            const signal = square * envelope * 0.6;
            
            leftData[i] = signal;
            rightData[i] = signal;
        }
        
        return buffer;
    }
    
    // Lighthearted game over sound
    createGameOverSound() {
        if (!this.audioContext) return null;
        
        // Descending musical phrase
        const notes = [523.25, 466.16, 415.30, 369.99]; // C5, Bb4, Ab4, F#4
        const noteDuration = 0.3;
        const noteSpacing = 0.21; // 70% overlap
        const totalDuration = notes.length * noteSpacing + noteDuration;
        const sampleRate = this.audioContext.sampleRate;
        const length = Math.floor(totalDuration * sampleRate);
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);
        
        notes.forEach((freq, index) => {
            const startSample = Math.floor(index * noteSpacing * sampleRate);
            const endSample = Math.floor((index * noteSpacing + noteDuration) * sampleRate);
            
            for (let i = startSample; i < endSample && i < length; i++) {
                const t = (i - startSample) / sampleRate;
                const envelope = Math.exp(-t * 3) * (1 - Math.exp(-t * 15)); // Attack + decay
                
                // Triangle wave approximation
                const trianglePhase = (freq * t) % 1;
                const triangle = trianglePhase < 0.5 ? 4 * trianglePhase - 1 : 3 - 4 * trianglePhase;
                const signal = triangle * envelope * 0.3;
                
                leftData[i] += signal;
                rightData[i] += signal;
            }
        });
        
        return buffer;
    }
    
    // Subtle hover sound - gentle UI feedback
    createHoverSound() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.15; // Very short, subtle
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);
        
        // Generate the hover sound manually
        for (let i = 0; i < leftData.length; i++) {
            const t = i / sampleRate;
            
            // Main tone - gentle chime at 800Hz
            const baseFreq = 800;
            const mainEnvelope = Math.exp(-t * 12.5); // Quick decay
            const mainTone = Math.sin(2 * Math.PI * baseFreq * t) * mainEnvelope * 0.15;
            
            // Harmonic tone - starts at 0.03s for sparkle effect
            const harmonicFreq = baseFreq * 1.5; // Perfect fifth
            const harmonicEnvelope = t >= 0.03 ? Math.exp(-(t - 0.03) * 20) : 0;
            const harmonicTone = Math.sin(2 * Math.PI * harmonicFreq * t) * harmonicEnvelope * 0.08;
            
            // Add tiny shimmer
            const shimmer = Math.sin(t * Math.PI * 12000) * 0.02 * Math.exp(-t * 20);
            
            // Combine all components
            let signal = 0;
            if (t < 0.08) signal += mainTone; // Main tone only for first 0.08s
            if (t >= 0.03 && t < 0.08) signal += harmonicTone; // Harmonic for 0.03-0.08s
            signal += shimmer;
            
            leftData[i] = signal;
            rightData[i] = signal;
        }
        
        return buffer;
    }
    
    // Create whimsical cartoon-style background music
    createBackgroundMusic() {
        if (!this.audioContext) return null;
        
        const duration = 32; // 32-second loop for variety
        const buffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);
        
        // Whimsical melody in C major with cartoon-like progression
        const mainMelody = [
            // First phrase - bouncy and cheerful
            { freq: 523.25, time: 0, duration: 0.5, instrument: 'marimba' },    // C5
            { freq: 587.33, time: 0.5, duration: 0.5, instrument: 'marimba' },  // D5
            { freq: 659.25, time: 1, duration: 1, instrument: 'marimba' },      // E5
            { freq: 523.25, time: 2, duration: 0.5, instrument: 'marimba' },    // C5
            { freq: 698.46, time: 2.5, duration: 1.5, instrument: 'marimba' },  // F5
            
            // Second phrase - playful skip
            { freq: 659.25, time: 4, duration: 0.5, instrument: 'xylophone' },  // E5
            { freq: 587.33, time: 4.5, duration: 0.5, instrument: 'xylophone' }, // D5
            { freq: 523.25, time: 5, duration: 1, instrument: 'xylophone' },    // C5
            { freq: 783.99, time: 6, duration: 0.5, instrument: 'xylophone' },  // G5
            { freq: 698.46, time: 6.5, duration: 1.5, instrument: 'xylophone' }, // F5
            
            // Third phrase - gentle descent
            { freq: 659.25, time: 8, duration: 0.75, instrument: 'marimba' },   // E5
            { freq: 587.33, time: 8.75, duration: 0.75, instrument: 'marimba' }, // D5
            { freq: 523.25, time: 9.5, duration: 0.5, instrument: 'marimba' },  // C5
            { freq: 493.88, time: 10, duration: 1, instrument: 'marimba' },     // B4
            { freq: 523.25, time: 11, duration: 1, instrument: 'marimba' },     // C5
            
            // Fourth phrase - uplifting conclusion
            { freq: 659.25, time: 12, duration: 0.5, instrument: 'bell' },      // E5
            { freq: 783.99, time: 12.5, duration: 0.5, instrument: 'bell' },    // G5
            { freq: 1046.5, time: 13, duration: 1, instrument: 'bell' },        // C6
            { freq: 783.99, time: 14, duration: 0.5, instrument: 'bell' },      // G5
            { freq: 659.25, time: 14.5, duration: 1.5, instrument: 'bell' },    // E5
            
            // Repeat with variations (16-32 seconds)
            { freq: 523.25, time: 16, duration: 0.5, instrument: 'pizzicato' }, // C5
            { freq: 659.25, time: 16.5, duration: 0.5, instrument: 'pizzicato' }, // E5
            { freq: 783.99, time: 17, duration: 1, instrument: 'pizzicato' },   // G5
            { freq: 698.46, time: 18, duration: 0.5, instrument: 'pizzicato' }, // F5
            { freq: 659.25, time: 18.5, duration: 1.5, instrument: 'pizzicato' }, // E5
            
            { freq: 587.33, time: 20, duration: 0.5, instrument: 'flute' },     // D5
            { freq: 523.25, time: 20.5, duration: 0.5, instrument: 'flute' },   // C5
            { freq: 493.88, time: 21, duration: 1, instrument: 'flute' },       // B4
            { freq: 523.25, time: 22, duration: 0.5, instrument: 'flute' },     // C5
            { freq: 587.33, time: 22.5, duration: 1.5, instrument: 'flute' },   // D5
            
            // Gentle ending
            { freq: 659.25, time: 24, duration: 1, instrument: 'marimba' },     // E5
            { freq: 587.33, time: 25, duration: 1, instrument: 'marimba' },     // D5
            { freq: 523.25, time: 26, duration: 2, instrument: 'marimba' },     // C5
            { freq: 392.00, time: 28, duration: 1, instrument: 'bass' },        // G4
            { freq: 261.63, time: 29, duration: 3, instrument: 'bass' },        // C4
        ];
        
        // Bass line for harmonic support
        const bassLine = [
            { freq: 130.81, time: 0, duration: 2 },    // C3
            { freq: 146.83, time: 2, duration: 2 },    // D3
            { freq: 164.81, time: 4, duration: 2 },    // E3
            { freq: 174.61, time: 6, duration: 2 },    // F3
            { freq: 196.00, time: 8, duration: 2 },    // G3
            { freq: 174.61, time: 10, duration: 2 },   // F3
            { freq: 164.81, time: 12, duration: 2 },   // E3
            { freq: 130.81, time: 14, duration: 2 },   // C3
            // Repeat for second half
            { freq: 130.81, time: 16, duration: 2 },   // C3
            { freq: 146.83, time: 18, duration: 2 },   // D3
            { freq: 164.81, time: 20, duration: 2 },   // E3
            { freq: 174.61, time: 22, duration: 2 },   // F3
            { freq: 196.00, time: 24, duration: 2 },   // G3
            { freq: 174.61, time: 26, duration: 2 },   // F3
            { freq: 164.81, time: 28, duration: 2 },   // E3
            { freq: 130.81, time: 30, duration: 2 },   // C3
        ];
        
        // Generate main melody with different instrument timbres
        for (let note of mainMelody) {
            this.addNoteToBuffer(leftData, rightData, note, this.audioContext.sampleRate);
        }
        
        // Add bass line
        for (let note of bassLine) {
            const bassNote = { ...note, instrument: 'bass', freq: note.freq };
            this.addNoteToBuffer(leftData, rightData, bassNote, this.audioContext.sampleRate, 0.3);
        }
        
        // Add subtle percussion rhythm
        for (let i = 0; i < duration; i += 0.5) {
            if (i % 2 === 0) { // On beats
                this.addPercussion(leftData, rightData, i, this.audioContext.sampleRate, 'soft');
            }
        }
        
        return buffer;
    }
    
    // Helper function to add notes with different instrument timbres
    addNoteToBuffer(leftData, rightData, note, sampleRate, volumeMultiplier = 1) {
        const startSample = Math.floor(note.time * sampleRate);
        const endSample = Math.floor((note.time + note.duration) * sampleRate);
        const volume = 0.08 * volumeMultiplier;
        
        for (let i = startSample; i < endSample && i < leftData.length; i++) {
            const t = (i - startSample) / sampleRate;
            const envelope = this.createEnvelope(t, note.duration);
            let signal = 0;
            
            switch (note.instrument) {
                case 'marimba':
                    // Warm, woody marimba sound
                    signal = Math.sin(2 * Math.PI * note.freq * t) * 0.6 +
                            Math.sin(2 * Math.PI * note.freq * 2 * t) * 0.2 +
                            Math.sin(2 * Math.PI * note.freq * 3 * t) * 0.1;
                    signal *= Math.exp(-t * 3); // Quick decay
                    break;
                    
                case 'xylophone':
                    // Bright, metallic xylophone
                    signal = Math.sin(2 * Math.PI * note.freq * t) * 0.5 +
                            Math.sin(2 * Math.PI * note.freq * 4 * t) * 0.3 +
                            Math.sin(2 * Math.PI * note.freq * 6 * t) * 0.2;
                    signal *= Math.exp(-t * 5); // Very quick decay
                    break;
                    
                case 'bell':
                    // Clear, ringing bell sound
                    signal = Math.sin(2 * Math.PI * note.freq * t) * 0.7 +
                            Math.sin(2 * Math.PI * note.freq * 2.1 * t) * 0.3;
                    signal *= Math.exp(-t * 1.5); // Medium decay
                    break;
                    
                case 'pizzicato':
                    // Plucked string sound
                    signal = Math.sin(2 * Math.PI * note.freq * t) * 0.8 +
                            Math.sin(2 * Math.PI * note.freq * 2 * t) * 0.1;
                    signal *= Math.exp(-t * 4); // Quick decay with slight sustain
                    break;
                    
                case 'flute':
                    // Soft, breathy flute
                    signal = Math.sin(2 * Math.PI * note.freq * t) * 0.9 +
                            Math.sin(2 * Math.PI * note.freq * 3 * t) * 0.1;
                    // Add breath noise
                    signal += (Math.random() - 0.5) * 0.02;
                    break;
                    
                case 'bass':
                    // Deep, warm bass
                    signal = Math.sin(2 * Math.PI * note.freq * t) * 0.8 +
                            Math.sin(2 * Math.PI * note.freq * 2 * t) * 0.2;
                    signal *= Math.exp(-t * 0.5); // Long sustain
                    break;
            }
            
            signal *= envelope * volume;
            
            // Stereo spread
            const pan = (note.instrument === 'bass') ? 0 : (Math.sin(note.freq / 100) * 0.3);
            leftData[i] += signal * (1 - pan * 0.5);
            rightData[i] += signal * (1 + pan * 0.5);
        }
    }
    
    // Create envelope for natural sound decay
    createEnvelope(t, duration) {
        const attackTime = Math.min(0.05, duration * 0.1);
        const releaseTime = Math.min(0.3, duration * 0.4);
        
        if (t < attackTime) {
            return t / attackTime; // Attack
        } else if (t < duration - releaseTime) {
            return 1; // Sustain
        } else {
            return (duration - t) / releaseTime; // Release
        }
    }
    
    // Add subtle percussion
    addPercussion(leftData, rightData, time, sampleRate, type) {
        const startSample = Math.floor(time * sampleRate);
        const duration = 0.1;
        const endSample = Math.floor((time + duration) * sampleRate);
        
        for (let i = startSample; i < endSample && i < leftData.length; i++) {
            const t = (i - startSample) / sampleRate;
            const envelope = Math.exp(-t * 20);
            
            let signal = 0;
            if (type === 'soft') {
                // Soft brush or shaker sound
                signal = (Math.random() - 0.5) * envelope * 0.02;
            }
            
            leftData[i] += signal;
            rightData[i] += signal;
        }
    }
    
    // Play background music (only on start screen)
    playBackgroundMusic() {
        if (!this.audioContext || this.isMuted || !this.onStartScreen) return;
        
        // Don't restart if already playing
        if (this.backgroundMusic && this.backgroundMusic.playbackState !== 'finished') {
            return;
        }
        
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.stop();
            } catch (e) {
                // Music was already stopped
            }
        }
        
        const buffer = this.createBackgroundMusic();
        if (!buffer) return;
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(this.getEffectiveVolume('music'), this.audioContext.currentTime);
        source.loop = true;
        source.start();
        
        this.backgroundMusic = source;
        this.backgroundMusic.gainNode = gainNode; // Store reference for volume changes
        
        // Mark as finished when it ends
        source.onended = () => {
            if (this.backgroundMusic === source) {
                this.backgroundMusic = null;
            }
        };
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
        // Early exit optimizations
        if (!this.audioContext || this.isMuted || this.audioProcessingPaused || !this.sounds[soundName]) return;
        
        // Check UI sounds setting for button clicks and hover sounds
        if ((soundName === 'buttonClick' || soundName === 'hover') && !this.settings.uiSounds) return;
        
        // Prevent audio spam with cooldowns
        const now = Date.now();
        const lastPlay = this.lastPlayTime.get(soundName) || 0;
        const cooldown = soundName === 'hover' ? 100 : 50; // Different cooldowns per sound
        
        if (now - lastPlay < cooldown) return;
        this.lastPlayTime.set(soundName, now);
        
        try {
            const buffer = this.sounds[soundName]();
            if (buffer) {
                this.playBuffer(buffer, 'sfx');
            }
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }
    
    // Pause audio processing to save performance
    pauseAudioProcessing() {
        this.audioProcessingPaused = true;
        this.stopBackgroundMusic();
    }
    
    // Resume audio processing
    resumeAudioProcessing() {
        this.audioProcessingPaused = false;
        if (this.onStartScreen && !this.isMuted) {
            this.playBackgroundMusic();
        }
    }
    
    // Play an audio buffer with volume control
    playBuffer(buffer, volumeType = 'sfx') {
        if (!this.audioContext || !buffer) return;
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Set volume based on type and settings
        const volume = this.getEffectiveVolume(volumeType);
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        
        source.start();
        
        // Clean up after playing
        source.onended = () => {
            source.disconnect();
            gainNode.disconnect();
        };
        
        return source;
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
    
    // Set volume levels (legacy method for backwards compatibility)
    setVolume(type, volume) {
        volume = Math.max(0, Math.min(1, volume));
        this.updateVolume(type, Math.round(volume * 100));
    }
    
    // Update volume levels (new method using percentage)
    updateVolume(type, volume) {
        volume = Math.max(0, Math.min(100, volume));
        
        switch(type) {
            case 'master':
                this.settings.masterVolume = volume;
                // Update background music volume immediately when master volume changes
                if (this.backgroundMusic && this.backgroundMusic.gainNode) {
                    this.backgroundMusic.gainNode.gain.setValueAtTime(this.getEffectiveVolume('music'), this.audioContext.currentTime);
                }
                break;
            case 'music':
                this.settings.musicVolume = volume;
                if (this.backgroundMusic && this.backgroundMusic.gainNode) {
                    // Update volume without restarting music
                    this.backgroundMusic.gainNode.gain.setValueAtTime(this.getEffectiveVolume('music'), this.audioContext.currentTime);
                }
                break;
            case 'sfx':
                this.settings.sfxVolume = volume;
                break;
        }
        this.saveSettings();
    }
    
    // Load settings from localStorage
    loadSettings() {
        const savedSettings = localStorage.getItem('jungleSnakeAudioSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsed };
            } catch (error) {
                console.log('Error loading audio settings:', error);
            }
        }
    }
    
    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('jungleSnakeAudioSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.log('Error saving audio settings:', error);
        }
    }
    
    // Get effective volume (master * specific)
    getEffectiveVolume(type) {
        const master = this.settings.masterVolume / 100;
        const specific = this.settings[type + 'Volume'] / 100;
        return master * specific;
    }
    
    // Initialize Settings UI
    initializeSettingsUI() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSettingsUI());
        } else {
            this.setupSettingsUI();
        }
    }
    
    // Helper method to get the appropriate slider thumb image based on value
    getSliderThumbImage(value) {
        value = parseInt(value, 10);
        if (value === 0) return "level_0.webp";
        if (value >= 1 && value <= 25) return "level_1-25.webp";
        if (value >= 26 && value <= 50) return "level_26-50.webp";
        if (value >= 51 && value <= 75) return "level_51-75.webp";
        if (value >= 76 && value <= 99) return "level_76-99.webp";
        if (value === 100) return "level_100.webp";
    }
    
    // Update slider thumb image based on current value
    updateSliderThumb(slider) {
        if (!slider) return;
        
        const value = slider.value;
        const imageName = this.getSliderThumbImage(value);
        const imageUrl = `assets/slider/${imageName}`;
        
        slider.style.setProperty('--thumb-image', `url(${imageUrl})`);
    }
    
    // Setup Settings UI Elements
    setupSettingsUI() {
        // Volume sliders
        const masterSlider = document.getElementById('masterVolume');
        const musicSlider = document.getElementById('musicVolume');
        const sfxSlider = document.getElementById('sfxVolume');
        
        // Volume value displays
        const masterValue = document.getElementById('masterVolumeValue');
        const musicValue = document.getElementById('musicVolumeValue');
        const sfxValue = document.getElementById('sfxVolumeValue');
        
        // Toggle switches
        const uiSoundsToggle = document.getElementById('uiSoundsToggle');
        const vibrationToggle = document.getElementById('vibrationToggle');
        
        if (masterSlider && musicSlider && sfxSlider) {
            // Set initial values
            masterSlider.value = this.settings.masterVolume;
            musicSlider.value = this.settings.musicVolume;
            sfxSlider.value = this.settings.sfxVolume;
            
            if (masterValue) masterValue.textContent = this.settings.masterVolume + '%';
            if (musicValue) musicValue.textContent = this.settings.musicVolume + '%';
            if (sfxValue) sfxValue.textContent = this.settings.sfxVolume + '%';
            
            // Initialize slider backgrounds
            this.updateSliderBackground(masterSlider, this.settings.masterVolume);
            this.updateSliderBackground(musicSlider, this.settings.musicVolume);
            this.updateSliderBackground(sfxSlider, this.settings.sfxVolume);
            
            // Initialize slider thumbs with appropriate images
            this.updateSliderThumb(masterSlider);
            this.updateSliderThumb(musicSlider);
            this.updateSliderThumb(sfxSlider);
            
            // Add event listeners
            masterSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.updateVolume('master', value);
                this.updateSliderBackground(masterSlider, value);
                this.updateSliderThumb(masterSlider);
                if (masterValue) masterValue.textContent = value + '%';
                this.playPreviewSound('click');
            });
            
            musicSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.updateVolume('music', value);
                this.updateSliderBackground(musicSlider, value);
                this.updateSliderThumb(musicSlider);
                if (musicValue) musicValue.textContent = value + '%';
                this.playPreviewSound('music');
            });
            
            sfxSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.updateVolume('sfx', value);
                this.updateSliderBackground(sfxSlider, value);
                this.updateSliderThumb(sfxSlider);
                if (sfxValue) sfxValue.textContent = value + '%';
                this.playPreviewSound('eat');
            });
        }
        
        // Setup toggle switches
        if (uiSoundsToggle) {
            uiSoundsToggle.classList.toggle('active', this.settings.uiSounds);
            uiSoundsToggle.addEventListener('click', () => {
                this.settings.uiSounds = !this.settings.uiSounds;
                uiSoundsToggle.classList.toggle('active', this.settings.uiSounds);
                this.saveSettings();
                if (this.settings.uiSounds) this.playSound('buttonClick');
            });
        }
        
        if (vibrationToggle) {
            vibrationToggle.classList.toggle('active', this.settings.vibration);
            vibrationToggle.addEventListener('click', () => {
                this.settings.vibration = !this.settings.vibration;
                vibrationToggle.classList.toggle('active', this.settings.vibration);
                this.saveSettings();
                if (this.settings.vibration) {
                    this.vibrateForEvent('button_click'); // Test vibration with enhanced system
                }
            });
        }
        
        // Setup reset to defaults button
        const resetButton = document.getElementById('resetSettingsBtn');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetToDefaults();
            });
        }
    }
    
    // Reset all settings to default values
    resetToDefaults() {
        // Reset settings object
        this.settings = { ...this.defaultSettings };
        
        // Save to localStorage
        this.saveSettings();
        
        // Update UI elements
        const masterSlider = document.getElementById('masterVolume');
        const musicSlider = document.getElementById('musicVolume');
        const sfxSlider = document.getElementById('sfxVolume');
        const masterValue = document.getElementById('masterVolumeValue');
        const musicValue = document.getElementById('musicVolumeValue');
        const sfxValue = document.getElementById('sfxVolumeValue');
        const uiSoundsToggle = document.getElementById('uiSoundsToggle');
        const vibrationToggle = document.getElementById('vibrationToggle');
        
        // Update sliders and values
        if (masterSlider) {
            masterSlider.value = this.settings.masterVolume;
            this.updateSliderBackground(masterSlider, this.settings.masterVolume);
            this.updateSliderThumb(masterSlider);
            if (masterValue) masterValue.textContent = this.settings.masterVolume + '%';
        }
        if (musicSlider) {
            musicSlider.value = this.settings.musicVolume;
            this.updateSliderBackground(musicSlider, this.settings.musicVolume);
            this.updateSliderThumb(musicSlider);
            if (musicValue) musicValue.textContent = this.settings.musicVolume + '%';
        }
        if (sfxSlider) {
            sfxSlider.value = this.settings.sfxVolume;
            this.updateSliderBackground(sfxSlider, this.settings.sfxVolume);
            this.updateSliderThumb(sfxSlider);
            if (sfxValue) sfxValue.textContent = this.settings.sfxVolume + '%';
        }
        
        // Update toggles
        if (uiSoundsToggle) {
            uiSoundsToggle.classList.toggle('active', this.settings.uiSounds);
        }
        if (vibrationToggle) {
            vibrationToggle.classList.toggle('active', this.settings.vibration);
        }
        
        // Update background music volume immediately if playing
        if (this.backgroundMusic && this.backgroundMusic.gainNode) {
            this.backgroundMusic.gainNode.gain.setValueAtTime(this.getEffectiveVolume('music'), this.audioContext.currentTime);
        }
        
        // Play confirmation sound
        this.playSound('buttonClick');
        
        console.log('Settings reset to defaults:', this.settings);
    }
    
    // Update slider background to show progress fill
    updateSliderBackground(slider, value) {
        if (!slider) return;
        
        const percentage = value;
        const activeColor = '#4caf50';      // Bright jungle green for filled portion
        const inactiveStart = '#2d4a2d';    // Dark jungle green for empty portion
        const inactiveEnd = '#1a3e1a';      // Even darker green
        
        // Create gradient that fills from left based on current value
        const background = `linear-gradient(90deg, 
            ${activeColor} 0%, 
            ${activeColor} ${percentage}%, 
            ${inactiveStart} ${percentage}%, 
            ${inactiveEnd} 100%)`;
            
        slider.style.background = background;
    }
    
    // Play preview sound for live feedback
    playPreviewSound(type) {
        if (!this.audioContext) return;
        
        // Throttle preview sounds to prevent spam
        const now = Date.now();
        const lastPlay = this.lastPlayTime.get('preview') || 0;
        if (now - lastPlay < 150) return; // 150ms throttle
        this.lastPlayTime.set('preview', now);
        
        switch (type) {
            case 'click':
                this.playSound('buttonClick');
                break;
            case 'music':
                this.playShortMusicPreview();
                break;
            case 'eat':
                this.playSound('eatFood');
                break;
        }
    }
    
    // Play short music preview
    playShortMusicPreview() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Play a pleasant chord (C major)
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator.type = 'triangle';
        
        const volume = this.getEffectiveVolume('music');
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    // Enhanced vibration support for all devices (mobile, laptop with gamepad, etc.)
    triggerVibration(pattern = 100, intensity = 0.5) {
        if (!this.settings.vibration) return;
        
        // Mobile device vibration using navigator.vibrate
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
        
        // Laptop/Desktop gamepad vibration support
        this.triggerGamepadVibration(intensity, pattern);
        
        // Web Vibration API fallback for supported browsers
        this.triggerWebVibration(pattern);
    }
    
    // Gamepad vibration for laptops/desktops with connected controllers
    triggerGamepadVibration(intensity = 0.5, duration = 100) {
        if (!navigator.getGamepads) return;
        
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad && gamepad.vibrationActuator) {
                // Use the Gamepad Vibration API
                gamepad.vibrationActuator.playEffect('dual-rumble', {
                    startDelay: 0,
                    duration: duration,
                    weakMagnitude: intensity * 0.7,
                    strongMagnitude: intensity
                }).catch(() => {
                    // Fallback if vibration fails
                    console.debug('Gamepad vibration not supported or failed');
                });
            }
        }
    }
    
    // Web Vibration API for browsers that support it
    triggerWebVibration(pattern) {
        // Some browsers support vibration on desktop through peripheral devices
        if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                console.debug('Web vibration not supported or failed:', e);
            }
        }
    }
    
    // Different vibration patterns for different game events
    vibrateForEvent(eventType) {
        if (!this.settings.vibration) return;
        
        switch (eventType) {
            case 'button_click':
                this.triggerVibration(50, 0.3); // Light, quick vibration
                break;
            case 'eat_food':
                this.triggerVibration([100, 50, 100], 0.4); // Double pulse
                break;
            case 'collision':
                this.triggerVibration([200, 100, 200], 0.8); // Strong collision feedback
                break;
            case 'game_over':
                this.triggerVibration([300, 200, 300, 200, 300], 0.7); // Game over sequence
                break;
            case 'level_up':
                this.triggerVibration([80, 80, 80, 80, 80], 0.5); // Rapid success pattern
                break;
            default:
                this.triggerVibration(100, 0.5); // Default vibration
        }
    }
    
    // Setup autoplay with silent error handling
    setupAutoPlay() {
        // Strategy 1: Silent autoplay after 1 second delay
        setTimeout(() => {
            if (!this.autoPlayAttempted && this.onStartScreen && !this.isMuted) {
                this.silentAutoPlay();
            }
        }, 1000);
        
        // Strategy 2: Listen for ANY user interaction to unlock audio immediately
        const userInteractionHandler = async () => {
            if (!this.autoPlayAttempted && this.onStartScreen && !this.isMuted) {
                await this.silentAutoPlay();
            }
        };
        
        // Add interaction listeners
        const events = ['click', 'touchstart', 'keydown', 'mousemove', 'scroll', 'mouseenter'];
        events.forEach(event => {
            document.addEventListener(event, userInteractionHandler, { once: true, passive: true });
        });
        
        // Store handler for cleanup
        this.userInteractionHandler = userInteractionHandler;
        this.interactionEvents = events;
        
        // Strategy 3: Page focus events
        window.addEventListener('focus', () => {
            if (!this.autoPlayAttempted && this.onStartScreen && !this.isMuted) {
                this.silentAutoPlay();
            }
        });
    }
    
    // Silent autoplay attempt without console warnings
    async silentAutoPlay() {
        if (this.autoPlayAttempted || this.isMuted || !this.onStartScreen) return;
        
        try {
            // Resume audio context silently
            await this.resumeAudioContext();
            
            if (this.audioContext && this.audioContext.state === 'running') {
                this.playBackgroundMusic();
                this.autoPlayAttempted = true;
                console.log('Background music started automatically');
                
                // Remove interaction listeners after successful start
                if (this.userInteractionHandler && this.interactionEvents) {
                    this.interactionEvents.forEach(event => {
                        document.removeEventListener(event, this.userInteractionHandler);
                    });
                }
            }
        } catch (error) {
            // Completely silent - no console warnings
        }
    }
    
    // Fade in music to desired volume
    fadeInMusic(targetVolume) {
        if (!this.backgroundMusic) return;
        
        const duration = 2000; // 2 seconds fade in
        const steps = 50;
        const stepDuration = duration / steps;
        const volumeStep = targetVolume / steps;
        
        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = Math.min(volumeStep * currentStep, targetVolume);
            this.settings.musicVolume = newVolume;
            
            if (this.backgroundMusic && this.backgroundMusic.buffer) {
                // Update the gain node if possible
                const gainNodes = this.backgroundMusic.context.destination.input || [];
                gainNodes.forEach(node => {
                    if (node.gain) {
                        node.gain.setValueAtTime(this.getEffectiveVolume('music'), this.audioContext.currentTime);
                    }
                });
            }
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
            }
        }, stepDuration);
    }

    // Generate and download all game sounds as audio files in a ZIP
    async downloadAllSounds() {
        if (!this.audioContext) {
            await this.initializeAudio();
            await this.resumeAudioContext();
        }
        
        const soundList = [
            { name: 'button_click', generator: () => this.createClickSound(), description: 'Button Click Sound' },
            { name: 'game_start', generator: () => this.createGameStartSound(), description: 'Game Start Fanfare' },
            { name: 'snake_move', generator: () => this.createMoveSound(), description: 'Snake Movement' },
            { name: 'eat_food', generator: () => this.createEatSound(), description: 'Eating Food Sound' },
            { name: 'tongue_flick', generator: () => this.createTongueSound(), description: 'Tongue Flick' },
            { name: 'collision', generator: () => this.createCollisionSound(), description: 'Collision Sound' },
            { name: 'hit_impact', generator: () => this.createHitSound(), description: 'Hit Impact' },
            { name: 'game_over', generator: () => this.createGameOverSound(), description: 'Game Over Sound' },
            { name: 'hover', generator: () => this.createHoverSound(), description: 'UI Hover Sound' },
            { name: 'background_music', generator: () => this.createBackgroundMusic(), description: 'Background Music' }
        ];

        try {
            await this.downloadSoundsAsZip(soundList);
            alert('All game sounds have been downloaded as a ZIP file!');
        } catch (error) {
            console.error('Error downloading sounds:', error);
            alert('Error downloading sounds. Please try again.');
        }
    }

    // Download all sounds as a ZIP file
    async downloadSoundsAsZip(soundList) {
        // Check if JSZip is available
        if (typeof JSZip === 'undefined') {
            console.error('JSZip library not loaded');
            alert('ZIP creation library not available. Please try again.');
            return;
        }

        const zip = new JSZip();
        
        // Create README file
        let readmeContent = "Jungle Snake Game - Audio Files\n";
        readmeContent += "================================\n\n";
        readmeContent += "This ZIP contains all the audio files used in the Jungle Snake game.\n";
        readmeContent += "All sounds are generated using Web Audio API for a cheerful, nature-themed experience.\n\n";
        readmeContent += "Files included:\n";
        
        // Generate and add audio files to ZIP
        for (const sound of soundList) {
            try {
                const buffer = sound.generator();
                if (buffer) {
                    const blob = await this.audioBufferToWav(buffer);
                    const fileName = `jungle_snake_${sound.name}.wav`;
                    zip.file(fileName, blob);
                    readmeContent += `- ${fileName}: ${sound.description}\n`;
                }
            } catch (error) {
                console.error(`Error generating ${sound.name}:`, error);
                readmeContent += `- ${sound.name}.wav: Error generating sound\n`;
            }
        }
        
        readmeContent += "\nGenerated on: " + new Date().toLocaleString();
        readmeContent += "\nTotal sounds: " + soundList.length;
        readmeContent += "\n\nEnjoy your Jungle Snake game sounds!";
        
        // Add README to ZIP
        zip.file("README.txt", readmeContent);
        
        try {
            // Generate ZIP file and download
            const zipBlob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 6
                }
            });
            
            this.downloadBlob(zipBlob, 'jungle_snake_sounds.zip');
        } catch (error) {
            console.error('Error creating ZIP file:', error);
            alert('Error creating ZIP file. Please try again.');
        }
    }

    // Convert AudioBuffer to WAV format
    async audioBufferToWav(buffer) {
        const length = buffer.length;
        const numberOfChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        
        // Create WAV header
        const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);
        
        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    // Download blob as file
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Add hover sound to UI elements
    addHoverSounds() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupHoverSounds());
        } else {
            this.setupHoverSounds();
        }
    }
    
    // Setup hover sounds for all interactive elements
    setupHoverSounds() {
        // Find all interactive elements
        const interactiveSelectors = [
            'button',
            '.stone-button',
            '.settings-btn',
            '.close-settings',
            '.toggle-switch',
            '.volume-slider',
            '.download-sounds-btn',
            '[role="button"]',
            'input[type="range"]',
            'input[type="checkbox"]'
        ];
        
        const elements = document.querySelectorAll(interactiveSelectors.join(', '));
        
        elements.forEach(element => {
            // Track hover state to prevent spam
            let hasHovered = false;
            
            const handleMouseEnter = () => {
                if (!hasHovered && this.settings.uiSounds) {
                    this.playSound('hover');
                    hasHovered = true;
                    
                    // Reset hover state after a short delay
                    setTimeout(() => {
                        hasHovered = false;
                    }, 300);
                }
            };
            
            element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
        });
    }
}

// Export for use in game
window.AudioManager = AudioManager;