import React, { useRef, useEffect, useState } from "react";
import { AspectRatio, VideoClip, TextOverlay, AudioClip } from "../types";
import { renderVideoFrame, getResolutionForAspect } from "../services/videoRenderer";
import { audioEngine } from "../services/audioEngine";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Volume2,
  VolumeX,
  Maximize2,
  Grid,
  Sparkles,
} from "lucide-react";

interface PreviewPlayerProps {
  aspectRatio: AspectRatio;
  currentTime: number;
  setCurrentTime: (time: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
  totalDuration: number;
  clips: VideoClip[];
  audioClips: AudioClip[];
  textOverlays: TextOverlay[];
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({
  aspectRatio,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  totalDuration,
  clips,
  audioClips,
  textOverlays,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(true);
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Playback timer loop
  useEffect(() => {
    let animFrame: number;
    let lastTimestamp: number | null = null;

    const loop = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt * playbackSpeed;
          if (next >= totalDuration) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return totalDuration;
            }
          }
          return next;
        });

        // Trigger Audio Sync
        if (!isMuted) {
          audioClips.forEach((audio) => {
            if (
              currentTime >= audio.startTime &&
              currentTime < audio.startTime + audio.duration
            ) {
              if (audio.synthPreset) {
                audioEngine.playMusicTick(audio.synthPreset, currentTime, (audio.volume ?? 0.6) * volume);
              }
            }
          });
        }
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, totalDuration, isLooping, playbackSpeed, isMuted, volume, audioClips, currentTime]);

  // Real-time canvas redraw on currentTime or timeline elements update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const res = getResolutionForAspect(aspectRatio, "1080p");
    if (canvas.width !== res.width || canvas.height !== res.height) {
      canvas.width = res.width;
      canvas.height = res.height;
    }

    renderVideoFrame(ctx, canvas.width, canvas.height, currentTime, clips, textOverlays);
  }, [currentTime, clips, textOverlays, aspectRatio]);

  // Format timecode (e.g. 00:04.12)
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
  };

  const handleStep = (direction: -1 | 1) => {
    const frameTime = 1 / 30; // 1 frame
    setCurrentTime((prev) => Math.max(0, Math.min(totalDuration, prev + direction * frameTime)));
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setMasterVolume(isMuted ? 0 : newVol);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMasterVolume(nextMuted ? 0 : volume);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Compute CSS Aspect Ratio Class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case "9:16":
        return "aspect-[9/16] max-h-[88%]";
      case "1:1":
        return "aspect-square max-h-[88%]";
      case "21:9":
        return "aspect-[21/9] max-w-[92%]";
      case "16:9":
      default:
        return "aspect-video max-w-[92%] max-h-[88%]";
    }
  };

  return (
    <div
      ref={containerRef}
      id="preview-player-container"
      className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden select-none border-b border-slate-800"
    >
      {/* Canvas Viewport Area */}
      <div className="flex-1 flex items-center justify-center p-3 relative min-h-0 bg-slate-950">
        <div
          className={`relative shadow-2xl rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center ${getAspectClass()}`}
        >
          <canvas
            ref={canvasRef}
            id="video-viewport-canvas"
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Safe Areas / Rule of Thirds Overlay */}
          {showSafeAreas && (
            <div className="absolute inset-0 pointer-events-none border border-emerald-500/30">
              {/* Rule of thirds grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-white/20" />
                <div className="border-r border-white/20" />
                <div />
              </div>
              {/* Title safe area (80%) */}
              <div className="absolute inset-[10%] border border-dashed border-amber-400/40 rounded-sm">
                <span className="absolute top-1 left-1 text-[9px] text-amber-300/60 font-mono">
                  TITLE SAFE 80%
                </span>
              </div>
              {/* Center Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/40" />
              </div>
            </div>
          )}

          {/* Active Aspect Ratio Pill */}
          <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-400">
            {aspectRatio} • {playbackSpeed}x
          </div>
        </div>
      </div>

      {/* Playback Control Bar */}
      <div
        id="player-control-bar"
        className="h-12 bg-[#020617] border-t border-slate-800 px-4 flex items-center justify-between shrink-0"
      >
        {/* Left: Timecode */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-slate-900 rounded-md border border-slate-800 font-mono text-xs font-semibold text-slate-200">
            <span className="text-indigo-400">{formatTimecode(currentTime)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{formatTimecode(totalDuration)}</span>
          </div>
        </div>

        {/* Center: Playhead Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Jump to start */}
          <button
            id="btn-player-start"
            onClick={() => setCurrentTime(0)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition-colors"
            title="Jump to Start (Home)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Step Back 1 Frame */}
          <button
            id="btn-player-step-back"
            onClick={() => handleStep(-1)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition-colors"
            title="Step Back 1 Frame (,)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            id="btn-player-play-pause"
            onClick={() => setIsPlaying((p) => !p)}
            className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all active:scale-95 mx-1"
            title="Play / Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Step Forward 1 Frame */}
          <button
            id="btn-player-step-forward"
            onClick={() => handleStep(1)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition-colors"
            title="Step Forward 1 Frame (.)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Jump to end */}
          <button
            id="btn-player-end"
            onClick={() => setCurrentTime(totalDuration)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition-colors"
            title="Jump to End (End)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Loop Toggle */}
          <button
            id="btn-player-loop"
            onClick={() => setIsLooping((l) => !l)}
            className={`p-1.5 rounded transition-colors ml-1 ${
              isLooping
                ? "text-indigo-400 bg-indigo-500/20 border border-indigo-500/30"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
            }`}
            title="Toggle Loop Playback"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Audio, Speed, Grid, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <select
            id="player-speed-select"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="bg-slate-900 text-slate-300 text-xs px-2 py-1 rounded-md border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer hidden sm:inline-block"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1.0x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-player-mute"
              onClick={toggleMute}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              id="player-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hidden md:inline-block"
              title="Master Audio Volume"
            />
          </div>

          {/* Safe Areas Grid */}
          <button
            id="btn-player-grid"
            onClick={() => setShowSafeAreas((g) => !g)}
            className={`p-1.5 rounded transition-colors ${
              showSafeAreas
                ? "text-emerald-400 bg-emerald-500/20 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
            title="Toggle Rule of Thirds & Safe Areas"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            id="btn-player-fullscreen"
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
