import React from "react";
import { VideoClip, FilterPreset, CameraAnimation, TransitionType } from "../types";
import {
  Sliders,
  Film,
  Compass,
  RotateCcw,
  Sparkles,
  Layers,
  Volume2,
  Trash2,
  Maximize,
  FlipHorizontal,
  FlipVertical,
} from "lucide-react";

interface ClipInspectorProps {
  clip: VideoClip;
  onUpdateClip: (updated: VideoClip) => void;
  onDeleteClip: () => void;
}

export const ClipInspector: React.FC<ClipInspectorProps> = ({
  clip,
  onUpdateClip,
  onDeleteClip,
}) => {
  const updateTransform = (key: keyof VideoClip["transform"], value: any) => {
    onUpdateClip({
      ...clip,
      transform: {
        ...clip.transform,
        [key]: value,
      },
    });
  };

  return (
    <div
      id="clip-inspector-panel"
      className="w-72 sm:w-80 bg-[#020617] border-l border-slate-800 flex flex-col select-none overflow-y-auto shrink-0 text-xs"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-slate-200 text-xs truncate max-w-[170px]">
            {clip.name}
          </span>
        </div>
        <button
          onClick={onDeleteClip}
          className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
          title="Delete Clip"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector Body */}
      <div className="p-4 space-y-4">
        {/* Clip Name */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Clip Name
          </label>
          <input
            type="text"
            value={clip.name}
            onChange={(e) => onUpdateClip({ ...clip, name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        {/* AI Prompt details if available */}
        {clip.prompt && (
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
              AI Generation Prompt
            </span>
            <p className="text-[11px] text-slate-300 font-mono leading-relaxed line-clamp-3">
              {clip.prompt}
            </p>
          </div>
        )}

        {/* Timing & Speed */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Duration ({clip.duration.toFixed(1)}s)
            </label>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={clip.duration}
              onChange={(e) => onUpdateClip({ ...clip, duration: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-1"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Speed ({clip.speed || 1}x)
            </label>
            <select
              value={clip.speed || 1}
              onChange={(e) => onUpdateClip({ ...clip, speed: parseFloat(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="0.25">0.25x (Super Slow)</option>
              <option value="0.5">0.5x (Slow Motion)</option>
              <option value="1">1.0x (Normal)</option>
              <option value="1.5">1.5x (Fast)</option>
              <option value="2">2.0x (Hyperlapse)</option>
              <option value="4">4.0x (Ultra Fast)</option>
            </select>
          </div>
        </div>

        {/* Camera Motion & Ken Burns */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Camera Animation / Ken Burns</span>
          </label>
          <select
            value={clip.cameraAnimation || "none"}
            onChange={(e) => onUpdateClip({ ...clip, cameraAnimation: e.target.value as CameraAnimation })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="none">None (Static)</option>
            <option value="drone-orbit">Drone 3D Orbit</option>
            <option value="ken-burns">Ken Burns Smooth Pan</option>
            <option value="zoom-in">Dolly Zoom In</option>
            <option value="zoom-out">Slow Pullback Out</option>
            <option value="pan-left">Pan Left</option>
            <option value="pan-right">Pan Right</option>
            <option value="tilt-up">Tilt Up to Sky</option>
            <option value="pulse">Pulse Energy</option>
            <option value="handheld">Cinematic Handheld Drift</option>
          </select>
        </div>

        {/* Color Grading & LUT Filters */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Color Grading Preset</span>
          </label>
          <select
            value={clip.filter || "none"}
            onChange={(e) => onUpdateClip({ ...clip, filter: e.target.value as FilterPreset })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="none">Clean / Original</option>
            <option value="cinematic">Cinematic Teal & Orange</option>
            <option value="cyberpunk">Cyberpunk Neon High Contrast</option>
            <option value="vintage">Vintage 35mm Sepia</option>
            <option value="noir">Noir High Contrast Monochrome</option>
            <option value="warm">Golden Hour Warmth</option>
            <option value="vibrant">Vibrant Pop Saturation</option>
            <option value="matrix">Matrix Emerald Tint</option>
            <option value="hdr">HDR Dynamic Range</option>
            <option value="crt">Retro CRT Scanline Glow</option>
          </select>
        </div>

        {/* Color Balance Sliders */}
        <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Brightness</span>
            <span className="text-slate-500 font-mono">{((clip.brightness ?? 1) * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={clip.brightness ?? 1}
            onChange={(e) => onUpdateClip({ ...clip, brightness: parseFloat(e.target.value) })}
            className="w-full h-1 bg-slate-700 rounded appearance-none accent-indigo-500"
          />

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">Contrast</span>
            <span className="text-slate-500 font-mono">{((clip.contrast ?? 1) * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={clip.contrast ?? 1}
            onChange={(e) => onUpdateClip({ ...clip, contrast: parseFloat(e.target.value) })}
            className="w-full h-1 bg-slate-700 rounded appearance-none accent-indigo-500"
          />

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">Saturation</span>
            <span className="text-slate-500 font-mono">{((clip.saturation ?? 1) * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="2.5"
            step="0.05"
            value={clip.saturation ?? 1}
            onChange={(e) => onUpdateClip({ ...clip, saturation: parseFloat(e.target.value) })}
            className="w-full h-1 bg-slate-700 rounded appearance-none accent-indigo-500"
          />
        </div>

        {/* Transitions In / Out */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Transition In
            </label>
            <select
              value={clip.transitionIn?.type || "none"}
              onChange={(e) =>
                onUpdateClip({
                  ...clip,
                  transitionIn: {
                    type: e.target.value as TransitionType,
                    duration: clip.transitionIn?.duration || 0.5,
                  },
                })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="none">None</option>
              <option value="crossfade">Crossfade</option>
              <option value="wipe-left">Wipe Left</option>
              <option value="wipe-right">Wipe Right</option>
              <option value="slide-up">Slide Up</option>
              <option value="zoom-in">Zoom In</option>
              <option value="glitch">Glitch Flash</option>
              <option value="fade-black">Fade from Black</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Transition Out
            </label>
            <select
              value={clip.transitionOut?.type || "none"}
              onChange={(e) =>
                onUpdateClip({
                  ...clip,
                  transitionOut: {
                    type: e.target.value as TransitionType,
                    duration: clip.transitionOut?.duration || 0.5,
                  },
                })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="none">None</option>
              <option value="crossfade">Crossfade</option>
              <option value="wipe-left">Wipe Left</option>
              <option value="wipe-right">Wipe Right</option>
              <option value="slide-up">Slide Up</option>
              <option value="zoom-out">Zoom Out</option>
              <option value="glitch">Glitch Flash</option>
              <option value="fade-black">Fade to Black</option>
            </select>
          </div>
        </div>

        {/* Transform & Layout Controls */}
        <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Transform & Layout
          </span>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Scale</span>
            <span className="text-slate-500 font-mono">{(clip.transform?.scale ?? 1).toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={clip.transform?.scale ?? 1}
            onChange={(e) => updateTransform("scale", parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded appearance-none accent-indigo-500"
          />

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => updateTransform("flipH", !clip.transform?.flipH)}
              className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium flex items-center justify-center gap-1 transition-colors ${
                clip.transform?.flipH
                  ? "bg-indigo-950 border-indigo-500 text-indigo-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip H</span>
            </button>
            <button
              onClick={() => updateTransform("flipV", !clip.transform?.flipV)}
              className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium flex items-center justify-center gap-1 transition-colors ${
                clip.transform?.flipV
                  ? "bg-indigo-950 border-indigo-500 text-indigo-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FlipVertical className="w-3.5 h-3.5" />
              <span>Flip V</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
