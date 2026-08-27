export type AspectRatio = "16:9" | "9:16" | "1:1" | "21:9";

export type FilterPreset =
  | "none"
  | "cinematic"
  | "cyberpunk"
  | "vintage"
  | "noir"
  | "warm"
  | "vibrant"
  | "matrix"
  | "dusk"
  | "pastel"
  | "hdr"
  | "crt";

export type TransitionType =
  | "none"
  | "crossfade"
  | "wipe-left"
  | "wipe-right"
  | "slide-up"
  | "slide-down"
  | "zoom-in"
  | "zoom-out"
  | "glitch"
  | "fade-black"
  | "fade-white"
  | "whip-pan";

export type CameraAnimation =
  | "none"
  | "pan-left"
  | "pan-right"
  | "tilt-up"
  | "tilt-down"
  | "zoom-in"
  | "zoom-out"
  | "ken-burns"
  | "drone-orbit"
  | "handheld"
  | "pulse";

export type TextAnimation =
  | "none"
  | "fade"
  | "typewriter"
  | "pop"
  | "slide-up"
  | "glow"
  | "karaoke"
  | "bounce";

export interface ClipTransform {
  scale: number; // 0.1 to 3.0 (default 1.0)
  x: number; // offset in percentage (-100 to 100)
  y: number; // offset in percentage (-100 to 100)
  rotation: number; // degrees (-180 to 180)
  flipH: boolean;
  flipV: boolean;
  opacity: number; // 0 to 1
}

export interface VideoClip {
  id: string;
  name: string;
  type: "ai-video" | "procedural" | "image-animated" | "color-matte" | "custom-video";
  prompt?: string;
  mediaUrl?: string; // image or video source data/url
  proceduralType?: "cyberpunk" | "nebula" | "sunset" | "particles" | "matrix" | "aurora" | "synthwave" | "mountains";
  duration: number; // duration in seconds
  startTime: number; // timeline start position in seconds
  trimStart?: number; // trim offset from beginning
  trimEnd?: number; // trim offset from end
  trackIndex: number; // 0 = main video, 1 = overlay/b-roll
  speed: number; // 0.25 to 4.0
  volume: number; // 0 to 1
  filter: FilterPreset;
  cameraAnimation: CameraAnimation;
  transitionIn: {
    type: TransitionType;
    duration: number; // in seconds, e.g. 0.5
  };
  transitionOut: {
    type: TransitionType;
    duration: number;
  };
  transform: ClipTransform;
  brightness: number; // 0 to 2, default 1
  contrast: number; // 0 to 2, default 1
  saturation: number; // 0 to 2, default 1
  hue: number; // 0 to 360, default 0
  colorMatte?: string; // for solid color cards
}

export interface AudioClip {
  id: string;
  name: string;
  type: "voiceover" | "music" | "sfx";
  audioUrl?: string; // base64 or blob url
  audioBase64?: string;
  synthPreset?: string; // for built-in procedural synthesizers
  duration: number;
  startTime: number;
  trimStart?: number;
  trackIndex: number; // 0 = voiceover, 1 = background music, 2 = sfx
  volume: number; // 0 to 1
  fadeIn: number; // in seconds
  fadeOut: number; // in seconds
  voiceName?: string;
  transcript?: string;
  muted?: boolean;
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  trackIndex: number;
  fontFamily: string;
  fontSize: number; // relative size 16 to 96
  fontWeight: "normal" | "bold" | "900";
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  bgColor?: string;
  bgPadding?: number;
  bgRadius?: number;
  position: "top" | "center" | "bottom" | "custom";
  posX?: number; // 0 to 100 percentage
  posY?: number; // 0 to 100 percentage
  align: "left" | "center" | "right";
  animation: TextAnimation;
  letterSpacing?: number;
  textShadow?: boolean;
  isSubtitle?: boolean;
}

export interface StoryboardScene {
  sceneNumber: number;
  title: string;
  prompt: string;
  duration: number;
  cameraMotion: string;
  transition: TransitionType;
  filter: FilterPreset;
  voiceoverText: string;
  subtitleText: string;
  proceduralType?: VideoClip["proceduralType"];
}

export interface Project {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
  clips: VideoClip[];
  audioClips: AudioClip[];
  textOverlays: TextOverlay[];
  totalDuration: number;
  createdAt: number;
  updatedAt: number;
}

export interface TimelineSelection {
  type: "clip" | "audio" | "text" | null;
  id: string | null;
}

export interface ExportOptions {
  format: "webm" | "mp4";
  resolution: "720p" | "1080p" | "4k";
  fps: 30 | 60;
  quality: "standard" | "high" | "maximum";
}

export type ExportSettings = ExportOptions;

