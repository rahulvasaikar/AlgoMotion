import wave
import struct
import math
import os

SAMPLE_RATE = 44100

def generate_ambient_drone(filename, duration_sec=40.0):
    """Generates a warm, dreamy ambient pad chord loop (C - G - B - E)"""
    num_samples = int(SAMPLE_RATE * duration_sec)
    os.makedirs(os.path.dirname(filename), exist_ok=True)

    # Ambient chord frequencies (Hz): C3 (130.81), G3 (196.00), B3 (246.94), E4 (329.63), G4 (392.00)
    freqs = [130.81, 196.00, 246.94, 329.63, 392.00]
    weights = [0.25, 0.20, 0.18, 0.15, 0.10]

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(2) # Stereo
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(SAMPLE_RATE)

        for i in range(num_samples):
            t = i / SAMPLE_RATE

            # Gentle LFO slow pulsing modulation
            lfo1 = 0.8 + 0.2 * math.sin(2 * math.pi * 0.15 * t)
            lfo2 = 0.8 + 0.2 * math.sin(2 * math.pi * 0.22 * t + 1.0)

            # Fade in and out at ends for seamless loop
            fade_len = 2.0
            envelope = 1.0
            if t < fade_len:
                envelope = t / fade_len
            elif t > duration_sec - fade_len:
                envelope = (duration_sec - t) / fade_len

            left_val = 0.0
            right_val = 0.0

            for idx, f in enumerate(freqs):
                w = weights[idx]
                phase = 2 * math.pi * f * t
                # Stereo chorus detune
                s_left = math.sin(phase) * w
                s_right = math.sin(phase * 1.003 + 0.5) * w
                left_val += s_left
                right_val += s_right

            left_sample = int(left_val * lfo1 * envelope * 0.4 * 32767)
            right_sample = int(right_val * lfo2 * envelope * 0.4 * 32767)

            # Clamp
            left_sample = max(-32767, min(32767, left_sample))
            right_sample = max(-32767, min(32767, right_sample))

            wav_file.writeframes(struct.pack('<hh', left_sample, right_sample))

    print(f"Generated ambient pad: {filename}")

def generate_match_chime(filename, duration_sec=1.5):
    """Generates an uplifting crystal chime chord (E5, G#5, B5, E6) for solution match"""
    num_samples = int(SAMPLE_RATE * duration_sec)
    os.makedirs(os.path.dirname(filename), exist_ok=True)

    freqs = [659.25, 830.61, 987.77, 1318.51]

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)

        for i in range(num_samples):
            t = i / SAMPLE_RATE
            # Exponential decay
            envelope = math.exp(-3.5 * t)

            left_val = 0.0
            right_val = 0.0

            for idx, f in enumerate(freqs):
                # Arpeggiate slightly (15ms delay per note)
                note_t = t - (idx * 0.02)
                if note_t > 0:
                    note_env = math.exp(-3.2 * note_t)
                    phase = 2 * math.pi * f * note_t
                    s = math.sin(phase) * note_env * 0.22
                    # Pan slightly across stereo field
                    pan = (idx / (len(freqs) - 1)) # 0 to 1
                    left_val += s * (1.0 - pan * 0.5)
                    right_val += s * (0.5 + pan * 0.5)

            left_sample = int(max(-32767, min(32767, left_val * 32767)))
            right_sample = int(max(-32767, min(32767, right_val * 32767)))

            wav_file.writeframes(struct.pack('<hh', left_sample, right_sample))

    print(f"Generated victory chime: {filename}")

if __name__ == "__main__":
    audio_dir = os.path.join(os.getcwd(), "public", "audio")
    generate_ambient_drone(os.path.join(audio_dir, "ambient_bed.wav"), duration_sec=45.0)
    generate_match_chime(os.path.join(audio_dir, "victory_chime.wav"), duration_sec=1.8)
