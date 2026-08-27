import { AudioClip } from "../types";

export interface AudioTrackPreset {
  id: string;
  name: string;
  category: "music" | "sfx" | "ambient";
  duration: number;
  bpm: number;
  synthPreset: string;
  description: string;
}

export const SAMPLE_AUDIO_PRESETS: AudioTrackPreset[] = [
  {
    id: "track-cyberpunk",
    name: "Cyber Pulse Synth",
    category: "music",
    duration: 30,
    bpm: 120,
    synthPreset: "cyber-pulse",
    description: "Driving arpeggiated bassline with atmospheric neon pads and punchy kick.",
  },
  {
    id: "track-cinematic",
    name: "Cosmic Horizon Orchestral",
    category: "music",
    duration: 30,
    bpm: 90,
    synthPreset: "cosmic-horizon",
    description: "Expansive ethereal string chords with sub bass and warm brass swell.",
  },
  {
    id: "track-lofi",
    name: "Midnight Drift Lo-Fi",
    category: "music",
    duration: 30,
    bpm: 80,
    synthPreset: "midnight-lofi",
    description: "Warm Rhodes electric piano chords with vinyl flutter and relaxed boom-bap rhythm.",
  },
  {
    id: "track-ambient",
    name: "Deep Space Drone",
    category: "ambient",
    duration: 30,
    bpm: 60,
    synthPreset: "space-drone",
    description: "Low-frequency resonant drone with granular shimmer and twinkling celestial chimes.",
  },
  {
    id: "sfx-whoosh",
    name: "Cinematic Transition Whoosh",
    category: "sfx",
    duration: 1.2,
    bpm: 120,
    synthPreset: "whoosh-trans",
    description: "High-impact cinematic frequency sweep for scene cuts.",
  },
  {
    id: "sfx-sub-hit",
    name: "Heavy Sub Impact Boom",
    category: "sfx",
    duration: 2.0,
    bpm: 120,
    synthPreset: "sub-boom",
    description: "Deep low-end rumble and dramatic cinematic hit.",
  },
  {
    id: "sfx-glitch",
    name: "Cyber Hologram Glitch",
    category: "sfx",
    duration: 0.8,
    bpm: 120,
    synthPreset: "glitch-hit",
    description: "Digital static burst with stereo frequency modulation.",
  },
];

export const INITIAL_DEMO_AUDIO_CLIPS: AudioClip[] = [
  {
    id: "audio-demo-1",
    name: "Cyber Pulse Soundtrack",
    type: "music",
    synthPreset: "cyber-pulse",
    duration: 13,
    startTime: 0,
    trackIndex: 1, // BGM Track
    volume: 0.6,
    fadeIn: 0.5,
    fadeOut: 1.0,
  },
  {
    id: "audio-demo-voice",
    name: "AI Narration",
    type: "voiceover",
    duration: 8,
    startTime: 0.5,
    trackIndex: 0, // Voiceover Track
    volume: 0.95,
    fadeIn: 0.2,
    fadeOut: 0.2,
    voiceName: "Kore",
    transcript: "Welcome to the future of cinema. Transform text prompts directly into cinematic video creations.",
  },
];
