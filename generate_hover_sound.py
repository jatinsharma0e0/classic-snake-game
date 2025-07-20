#!/usr/bin/env python3
"""
Generate a subtle hover sound effect for the UI
This creates the same hover sound that's synthesized in the Web Audio API
"""

import numpy as np
import wave
import struct

def generate_hover_sound():
    # Audio parameters
    sample_rate = 44100
    duration = 0.15  # Very short, subtle
    
    # Generate time array
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # Gentle ascending chime
    base_freq = 800  # Higher pitched for subtlety
    harmonic_freq = base_freq * 1.5  # Perfect fifth
    
    # Main tone - very short and sweet
    main_tone = np.sin(2 * np.pi * base_freq * t) * 0.15
    main_envelope = np.exp(-t * 12.5)  # Quick decay
    main_tone = main_tone * main_envelope
    
    # Apply time window to make it even shorter
    main_window = np.where(t < 0.08, 1.0, 0.0)
    main_tone = main_tone * main_window
    
    # Harmonic - even shorter for sparkle effect
    harmonic_tone = np.sin(2 * np.pi * harmonic_freq * t) * 0.08
    harmonic_envelope = np.exp(-t * 20)  # Very quick decay
    harmonic_tone = harmonic_tone * harmonic_envelope
    
    # Apply time window to harmonic (starts at 0.03s, lasts 0.05s)
    harmonic_window = np.where((t >= 0.03) & (t < 0.08), 1.0, 0.0)
    harmonic_tone = harmonic_tone * harmonic_window
    
    # Add tiny bit of shimmer
    shimmer = np.sin(t * np.pi * 12000) * 0.02 * np.exp(-t * 20)
    
    # Combine all components
    audio = main_tone + harmonic_tone + shimmer
    
    # Normalize to prevent clipping
    max_val = np.max(np.abs(audio))
    if max_val > 0:
        audio = audio / max_val * 0.8
    
    return audio, sample_rate

def save_wav(filename, audio_data, sample_rate):
    """Save audio data as a WAV file"""
    # Convert to 16-bit integers
    audio_int = (audio_data * 32767).astype(np.int16)
    
    # Create WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_int.tobytes())

if __name__ == "__main__":
    # Generate the hover sound
    audio, sample_rate = generate_hover_sound()
    
    # Save to assets/audio directory
    save_wav("assets/audio/hover.wav", audio, sample_rate)
    print("Hover sound generated and saved to assets/audio/hover.wav")