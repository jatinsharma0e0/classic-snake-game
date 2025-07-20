// Audio System for Snake Game - Performance Optimized
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
        
        // Performance optimizations
        this.soundCooldowns = new Map();
        this.maxConcurrentSounds = 6; // Limit for mobile performance
        this.activeSources = [];
        this.audioPool = new Map(); // Reuse audio nodes
        this.lastPlayTime = new Map(); // Prevent audio spam
        
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

    // Generate and download all game sounds as audio files
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
            { name: 'background_music', generator: () => this.createBackgroundMusic(), description: 'Background Music' }
        ];

        try {
            await this.downloadSoundsIndividually(soundList);
            alert('All game sounds have been downloaded successfully!');
        } catch (error) {
            console.error('Error downloading sounds:', error);
            alert('Error downloading sounds. Please try again.');
        }
    }

    // Download sounds individually
    async downloadSoundsIndividually(soundList) {
        for (const sound of soundList) {
            try {
                const buffer = sound.generator();
                if (buffer) {
                    const blob = await this.audioBufferToWav(buffer);
                    this.downloadBlob(blob, `jungle_snake_${sound.name}.wav`);
                    // Small delay between downloads to avoid overwhelming the browser
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            } catch (error) {
                console.error(`Error generating ${sound.name}:`, error);
            }
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
}

// Export for use in game
window.AudioManager = AudioManager;