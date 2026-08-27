import React, { useState } from "react";
import { VideoClip, FilterPreset, CameraAnimation, AspectRatio } from "../types";
import { enhancePromptWithAI, generateKeyframeImageWithAI } from "../services/geminiService";
import { PRESET_PROMPTS } from "../data/sampleClips";
import {
  Sparkles,
  X,
  Wand2,
  Video,
  Camera,
  Layers,
  Clock,
  Check,
  Film,
  Compass,
  Loader2,
} from "lucide-react";

interface PromptToClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  currentTime: number;
  onAddClip: (clip: VideoClip) => void;
}

export const PromptToClipModal: React.FC<PromptToClipModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  currentTime,
  onAddClip,
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [style, setStyle] = useState<string>("cinematic");
  const [cameraMotion, setCameraMotion] = useState<CameraAnimation>("drone-orbit");
  const [duration, setDuration] = useState<number>(4.0);
  const [filter, setFilter] = useState<FilterPreset>("cinematic");
  const [generationType, setGenerationType] = useState<"procedural" | "ai-image">("procedural");
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Enhance prompt with AI Cine Director
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const result = await enhancePromptWithAI(prompt, style, cameraMotion);
      setPrompt(result.enhancedPrompt);
      if (result.suggestedFilter) {
        setFilter(result.suggestedFilter as FilterPreset);
      }
      if (result.suggestedDuration) {
        setDuration(result.suggestedDuration);
      }
    } catch (err: any) {
      console.warn("AI prompt polish fallback:", err);
      setPrompt(
        `${prompt}, cinematic 4k masterpiece, anamorphic lens, volumetric lighting, photorealistic depth of field, 60fps`
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  // Select Preset Prompt
  const handleSelectPreset = (preset: (typeof PRESET_PROMPTS)[0]) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    setStyle(preset.style);
    setFilter(preset.filter);
    setCameraMotion(preset.cameraAnimation);
    setDuration(preset.duration);
    setGenerationType("procedural");
  };

  // Generate Clip
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setStatusMessage("Analyzing visual prompt & composition...");

    try {
      let mediaUrl: string | undefined = undefined;
      let procType: VideoClip["proceduralType"] = undefined;

      if (generationType === "ai-image") {
        setStatusMessage("Calling Gemini 3.1 Flash Image synthesis...");
        try {
          const imgResult = await generateKeyframeImageWithAI(prompt, aspectRatio);
          mediaUrl = imgResult.imageUrl;
        } catch (imgErr) {
          console.warn("Image generation fallback to procedural:", imgErr);
          // Fallback to closest procedural scene
          const pLower = prompt.toLowerCase();
          if (pLower.includes("cyber") || pLower.includes("tokyo") || pLower.includes("city")) procType = "cyberpunk";
          else if (pLower.includes("space") || pLower.includes("star") || pLower.includes("nebula")) procType = "nebula";
          else if (pLower.includes("sunset") || pLower.includes("ocean") || pLower.includes("beach")) procType = "sunset";
          else if (pLower.includes("particle") || pLower.includes("quantum")) procType = "particles";
          else if (pLower.includes("mountain") || pLower.includes("snow") || pLower.includes("alps")) procType = "mountains";
          else if (pLower.includes("aurora") || pLower.includes("green")) procType = "aurora";
          else procType = "nebula";
        }
      } else {
        // Procedural cinematic scene matching prompt keywords
        const pLower = prompt.toLowerCase();
        if (pLower.includes("cyber") || pLower.includes("tokyo") || pLower.includes("neon") || pLower.includes("future")) procType = "cyberpunk";
        else if (pLower.includes("space") || pLower.includes("nebula") || pLower.includes("cosmic") || pLower.includes("galaxy")) procType = "nebula";
        else if (pLower.includes("sunset") || pLower.includes("ocean") || pLower.includes("sea") || pLower.includes("beach")) procType = "sunset";
        else if (pLower.includes("particle") || pLower.includes("quantum") || pLower.includes("energy") || pLower.includes("vortex")) procType = "particles";
        else if (pLower.includes("synthwave") || pLower.includes("grid") || pLower.includes("80s") || pLower.includes("retro")) procType = "synthwave";
        else if (pLower.includes("matrix") || pLower.includes("code") || pLower.includes("digital") || pLower.includes("binary")) procType = "matrix";
        else if (pLower.includes("mountain") || pLower.includes("alpine") || pLower.includes("peak") || pLower.includes("mist")) procType = "mountains";
        else if (pLower.includes("aurora") || pLower.includes("northern") || pLower.includes("borealis")) procType = "aurora";
        else procType = "cyberpunk";
      }

      const newClip: VideoClip = {
        id: `clip-ai-${Date.now()}`,
        name: prompt.slice(0, 24) + "...",
        type: mediaUrl ? "image-animated" : "procedural",
        prompt,
        mediaUrl,
        proceduralType: procType,
        duration,
        startTime: currentTime,
        trackIndex: 0,
        speed: 1,
        volume: 1,
        filter,
        cameraAnimation: cameraMotion,
        transitionIn: { type: "crossfade", duration: 0.5 },
        transitionOut: { type: "crossfade", duration: 0.5 },
        transform: { scale: 1, x: 0, y: 0, rotation: 0, flipH: false, flipV: false, opacity: 1 },
        brightness: 1,
        contrast: 1.1,
        saturation: 1.2,
        hue: 0,
      };

      onAddClip(newClip);
      onClose();
    } catch (err: any) {
      console.error("Clip generation error:", err);
      setStatusMessage("Generation failed. Please try another prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="prompt-clip-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        id="prompt-clip-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#020617]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">AI Text-to-Video Clip Generator</h2>
              <p className="text-xs text-slate-400">Describe what you want to see or pick a cinematic template</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Quick Preset Cards Carousel */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Popular AI Cinematic Templates
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_PROMPTS.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between h-20 ${
                    selectedPresetId === p.id
                      ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500 shadow-md shadow-indigo-500/20"
                      : "border-slate-800 bg-[#020617]/60 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.previewGradient} opacity-20 pointer-events-none`} />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-[11px] truncate">{p.title}</span>
                  </div>
                  <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{p.duration}s</span>
                    <span className="capitalize">{p.style}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea & AI Polish */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Video Prompt
              </label>
              <button
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 rounded-md border border-indigo-500/40 text-[11px] font-semibold disabled:opacity-40 transition-colors"
                title="Use Gemini AI to enhance details, lighting, and camera motion"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3 text-indigo-400" />
                )}
                <span>AI Magic Polish</span>
              </button>
            </div>
            <textarea
              id="prompt-textarea"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Cyberpunk neon skyline in the rain with flying cars, slow drone orbit, 4k cinematic..."
              className="w-full bg-[#020617] border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs leading-relaxed resize-none"
            />
          </div>

          {/* Settings Grid: Camera Motion, Duration, Style, Generation Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Camera Motion */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>Camera Motion</span>
              </label>
              <select
                value={cameraMotion}
                onChange={(e) => setCameraMotion(e.target.value as CameraAnimation)}
                className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="drone-orbit">Drone Orbit</option>
                <option value="ken-burns">Ken Burns Smooth Pan</option>
                <option value="zoom-in">Dolly Zoom In</option>
                <option value="zoom-out">Slow Pullback Out</option>
                <option value="pan-left">Pan Left</option>
                <option value="pan-right">Pan Right</option>
                <option value="tilt-up">Tilt Up to Sky</option>
                <option value="pulse">Pulse Energy</option>
                <option value="handheld">Handheld Cinematic</option>
                <option value="none">Static Shot</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Duration ({duration}s)</span>
              </label>
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
              />
            </div>

            {/* Color Filter / LUT */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <Film className="w-3 h-3 text-pink-400" />
                <span>Color Grading</span>
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterPreset)}
                className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="cinematic">Cinematic Teal & Orange</option>
                <option value="cyberpunk">Cyberpunk Neon</option>
                <option value="vintage">Vintage 35mm Film</option>
                <option value="noir">Noir Monochrome</option>
                <option value="warm">Golden Hour Warmth</option>
                <option value="vibrant">Vibrant Pop HDR</option>
                <option value="matrix">Matrix Emerald</option>
                <option value="crt">Retro CRT Scanlines</option>
                <option value="none">Natural / Clean</option>
              </select>
            </div>
          </div>

          {/* Generation Engine Switcher */}
          <div className="bg-[#020617]/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200 block text-xs">Generation Pathway</span>
              <span className="text-[10px] text-slate-400">
                {generationType === "procedural"
                  ? "Real-time 60fps cinematic procedural motion graphics shader"
                  : "High-resolution keyframe synthesis via Gemini 3.1 Flash Image"}
              </span>
            </div>
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setGenerationType("procedural")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  generationType === "procedural"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Procedural Motion
              </button>
              <button
                type="button"
                onClick={() => setGenerationType("ai-image")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  generationType === "ai-image"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Gemini Image Frame
              </button>
            </div>
          </div>

          {/* Loading status */}
          {isGenerating && (
            <div className="p-3 bg-indigo-950/50 border border-indigo-500/40 rounded-xl flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <span className="text-indigo-200 font-medium text-xs">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#020617] flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Placement: {currentTime.toFixed(1)}s on Timeline
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-generate-clip"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all active:scale-95"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate & Add to Timeline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
