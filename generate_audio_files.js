// Audio File Generator for Snake Game
// This script generates actual audio files from the Web Audio API sounds
// Run this in a browser environment to download the audio files

class AudioFileGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sampleRate = 44100;
    }
    
    // Create a buffer and encode it as WAV
    bufferToWav(buffer) {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, this.sampleRate, true);
        view.setUint32(28, this.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);
        
        // Convert buffer to PCM
        const data = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
        
        return arrayBuffer;
    }
    
    // Download a buffer as a WAV file
    downloadBuffer(buffer, filename) {
        const wavBuffer = this.bufferToWav(buffer);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Generate button click sound
    generateButtonClick() {
        const duration = 0.15;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const freq = 800 + (400 * t / duration);
            const envelope = Math.exp(-t * 10);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }
        
        this.downloadBuffer(buffer, 'button_click.wav');
    }
    
    // Generate game start fanfare
    generateGameStart() {
        const duration = 0.6;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const noteDuration = duration / notes.length;
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const noteIndex = Math.floor(t / noteDuration);
            const noteTime = t - (noteIndex * noteDuration);
            
            if (noteIndex < notes.length) {
                const freq = notes[noteIndex];
                const envelope = Math.exp(-noteTime * 5);
                data[i] = Math.sin(2 * Math.PI * freq * noteTime) * envelope * 0.4;
            }
        }
        
        this.downloadBuffer(buffer, 'game_start.wav');
    }
    
    // Generate subtle movement sound
    generateSnakeMove() {
        const duration = 0.08;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const freq = 200 - (50 * t / duration);
            const envelope = Math.exp(-t * 15);
            const noise = (Math.random() - 0.5) * 0.1;
            data[i] = (Math.sin(2 * Math.PI * freq * t) + noise) * envelope * 0.1;
        }
        
        this.downloadBuffer(buffer, 'snake_move.wav');
    }
    
    // Generate eating sound
    generateEatFood() {
        const duration = 0.3;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const crunch1 = Math.sin(2 * Math.PI * 600 * t) * Math.exp(-t * 8);
            const crunch2 = Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 6);
            const crunch3 = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10);
            data[i] = (crunch1 + crunch2 + crunch3) * 0.2;
        }
        
        this.downloadBuffer(buffer, 'eat_food.wav');
    }
    
    // Generate tongue flick sound
    generateTongueFlick() {
        const duration = 0.05;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const freq = 1200 - (400 * t / duration);
            const envelope = Math.exp(-t * 30);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
        }
        
        this.downloadBuffer(buffer, 'tongue_flick.wav');
    }
    
    // Generate collision sound
    generateCollision() {
        const duration = 0.2;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const freq = 200 - (150 * t / duration);
            const envelope = Math.exp(-t * 8);
            const noise = (Math.random() - 0.5) * 0.3;
            data[i] = (Math.sin(2 * Math.PI * freq * t) + noise) * envelope * 0.4;
        }
        
        this.downloadBuffer(buffer, 'collision.wav');
    }
    
    // Generate hit impact sound
    generateHitImpact() {
        const duration = 0.3;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const freq = 150 - (100 * t / duration);
            const envelope = Math.exp(-t * 5);
            const noise = (Math.random() - 0.5) * 0.5;
            data[i] = (Math.sin(2 * Math.PI * freq * t) + noise) * envelope * 0.6;
        }
        
        this.downloadBuffer(buffer, 'hit_impact.wav');
    }
    
    // Generate game over sound
    generateGameOver() {
        const duration = 1.2;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        const notes = [523.25, 466.16, 415.30, 369.99]; // C5, Bb4, Ab4, F#4
        const noteDuration = duration / notes.length;
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const noteIndex = Math.floor(t / noteDuration);
            const noteTime = t - (noteIndex * noteDuration);
            
            if (noteIndex < notes.length) {
                const freq = notes[noteIndex];
                const envelope = Math.exp(-noteTime * 3);
                data[i] = Math.sin(2 * Math.PI * freq * noteTime) * envelope * 0.3;
            }
        }
        
        this.downloadBuffer(buffer, 'game_over.wav');
    }
    
    // Generate background music
    generateBackgroundMusic() {
        const duration = 8;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);
        
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
        
        for (let note of melody) {
            const startSample = Math.floor(note.time * this.sampleRate);
            const endSample = Math.floor((note.time + note.duration) * this.sampleRate);
            
            for (let i = startSample; i < endSample && i < data.length; i++) {
                const t = (i - startSample) / this.sampleRate;
                const envelope = Math.sin(Math.PI * t / note.duration);
                data[i] += Math.sin(2 * Math.PI * note.freq * t) * envelope * 0.1;
            }
        }
        
        this.downloadBuffer(buffer, 'background_music.wav');
    }
    
    // Generate all audio files
    generateAll() {
        console.log('Generating audio files...');
        setTimeout(() => this.generateButtonClick(), 100);
        setTimeout(() => this.generateGameStart(), 200);
        setTimeout(() => this.generateSnakeMove(), 300);
        setTimeout(() => this.generateEatFood(), 400);
        setTimeout(() => this.generateTongueFlick(), 500);
        setTimeout(() => this.generateCollision(), 600);
        setTimeout(() => this.generateHitImpact(), 700);
        setTimeout(() => this.generateGameOver(), 800);
        setTimeout(() => this.generateBackgroundMusic(), 900);
        console.log('All audio files will be downloaded in sequence...');
    }
}

// Usage:
// const generator = new AudioFileGenerator();
// generator.generateAll();

// Export for use
window.AudioFileGenerator = AudioFileGenerator;