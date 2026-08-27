import React, { useState } from "react";
import { VideoClip, AudioClip, TextOverlay, FilterPreset, CameraAnimation } from "../types";
import {
  Sparkles,
  X,
  Layers,
  Wand2,
  Film,
  Music,
  Type,
  Compass,
  CheckCircle2,
  Zap,
} from "lucide-react";

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clips: VideoClip[];
  setClips: React.Dispatch<React.SetStateAction<VideoClip[]>>;
  audioClips: AudioClip[];
  setAudioClips: React.Dispatch<React.SetStateAction<AudioClip[]>>;
  textOverlays: TextOverlay[];
  setTextOverlays: React.Dispatch<React.SetStateAction<TextOverlay[]>>;
  totalDuration: number;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  clips,
  setClips,
  audioClips,
  setAudioClips,
  textOverlays,
  setTextOverlays,
  totalDuration,
}) => {
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // 1. Harmonize Cinematic Color Grading across all clips
  const handleHarmonizeGrading = (targetFilter: FilterPreset) => {
    setClips((prev) =>
      prev.map((c) => ({
        ...c,
        filter: targetFilter,
        contrast: 1.15,
        saturation: 1.25,
      }))
    );
    showFeedback(`Harmonized color grading to "${targetFilter}" across all ${clips.length} clips!`);
  };

  // 2. Auto-Add Smooth Crossfade Transitions
  const handleAutoTransitions = () => {
    setClips((prev) =>
      prev.map((c, i) => ({
        ...c,
        transitionIn: { type: i === 0 ? "none" : "crossfade", duration: 0.6 },
        transitionOut: { type: i === prev.length - 1 ? "fade-black" : "crossfade", duration: 0.6 },
      }))
    );
    showFeedback("Applied smooth 0.6s cinematic crossfades to all clip boundaries!");
  };

  // 3. Apply Dynamic Ken Burns Camera Motion to all static clips
  const handleApplyKenBurns = () => {
    const motions: CameraAnimation[] = ["drone-orbit", "ken-burns", "zoom-in", "pan-left", "pan-right"];
    setClips((prev) =>
      prev.map((c, idx) => ({
        ...c,
        cameraAnimation: motions[idx % motions.length],
      }))
    );
    showFeedback("Applied dynamic AI camera motion paths to all timeline clips!");
  };

  // 4. Auto-Generate Subtitles from Clip prompts
  const handleAutoGenerateCaptions = () => {
    const newSubs: TextOverlay[] = clips.map((c, idx) => ({
      id: `auto-sub-${Date.now()}-${idx}`,
      text: c.name || `Scene ${idx + 1}`,
      startTime: c.startTime + 0.2,
      duration: Math.max(1.5, c.duration - 0.4),
      trackIndex: 0,
      fontFamily: "system-ui, sans-serif",
      fontSize: 40,
      fontWeight: "bold",
      color: "#ffffff",
      bgColor: "rgba(0,0,0,0.7)",
      bgRadius: 8,
      position: "bottom",
      posY: 85,
      align: "center",
      animation: "typewriter",
      isSubtitle: true,
    }));

    setTextOverlays(newSubs);
    showFeedback(`Generated ${newSubs.length} synced subtitle captions!`);
  };

  // 5. Add Ambient Background Soundtrack
  const handleAddAmbientScore = () => {
    const musicTrack: AudioClip = {
      id: `copilot-bgm-${Date.now()}`,
      name: "Cyber Pulse Synth Soundtrack",
      type: "music",
      synthPreset: "cyber-pulse",
      duration: Math.max(12, totalDuration),
      startTime: 0,
      trackIndex: 1,
      volume: 0.55,
      fadeIn: 0.8,
      fadeOut: 1.2,
    };
    setAudioClips((prev) => [...prev.filter((a) => a.type !== "music"), musicTrack]);
    showFeedback("Added synchronized background synth soundtrack!");
  };

  return (
    <div
      id="ai-copilot-drawer"
      className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#020617]/95 border-l border-slate-800 shadow-2xl z-40 flex flex-col backdrop-blur-md select-none text-xs"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-xs">AI Copilot Quick Polish</h3>
            <span className="text-[10px] text-slate-400">One-click intelligent studio tools</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Toast Alert */}
        {successToast && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 flex items-center gap-2 animate-fade-in shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium">{successToast}</span>
          </div>
        )}

        {/* 1. Harmonize Color Grading */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-200">Harmonize Color Grading</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Unify color temperature and contrast across all clips on the timeline to achieve a cohesive cinematic look.
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => handleHarmonizeGrading("cinematic")}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg font-medium transition-colors text-[11px]"
            >
              Teal & Orange
            </button>
            <button
              onClick={() => handleHarmonizeGrading("cyberpunk")}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg font-medium transition-colors text-[11px]"
            >
              Cyberpunk Neon
            </button>
            <button
              onClick={() => handleHarmonizeGrading("noir")}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg font-medium transition-colors text-[11px]"
            >
              Classic Noir
            </button>
            <button
              onClick={() => handleHarmonizeGrading("vintage")}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg font-medium transition-colors text-[11px]"
            >
              Vintage 35mm
            </button>
          </div>
        </div>

        {/* 2. Auto-Pacing & Crossfades */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Smart Transitions</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Automatically inject smooth crossfades and black-fades at the start and end of every clip.
          </p>
          <button
            onClick={handleAutoTransitions}
            className="w-full py-2 bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 rounded-lg font-medium transition-colors text-[11px]"
          >
            Apply Smart Crossfades
          </button>
        </div>

        {/* 3. Dynamic Ken Burns Motion */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200">Dynamic Camera Motion</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Add subtle 3D drone orbits, dolly zooms, and cinematic pans to keep every shot engaging.
          </p>
          <button
            onClick={handleApplyKenBurns}
            className="w-full py-2 bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-200 rounded-lg font-medium transition-colors text-[11px]"
          >
            Animate All Camera Paths
          </button>
        </div>

        {/* 4. Auto Subtitles */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Auto Generate Subtitles</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Generate synchronized animated lower-third subtitles matching each scene on the timeline.
          </p>
          <button
            onClick={handleAutoGenerateCaptions}
            className="w-full py-2 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 rounded-lg font-medium transition-colors text-[11px]"
          >
            Generate Subtitle Captions
          </button>
        </div>

        {/* 5. Add Background Music */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-pink-400" />
            <span className="font-bold text-slate-200">Ambient Background Score</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Generate an ambient procedural synthesizer score that matches the exact length of your project.
          </p>
          <button
            onClick={handleAddAmbientScore}
            className="w-full py-2 bg-slate-800 hover:bg-pink-600 hover:text-white text-slate-200 rounded-lg font-medium transition-colors text-[11px]"
          >
            Add Matching Soundtrack
          </button>
        </div>
      </div>
    </div>
  );
};
