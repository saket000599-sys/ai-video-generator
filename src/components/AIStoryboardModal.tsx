import React, { useState } from "react";
import { VideoClip, AudioClip, TextOverlay, AspectRatio, StoryboardScene, TransitionType, FilterPreset, CameraAnimation } from "../types";
import { generateStoryboardWithAI } from "../services/geminiService";
import {
  Wand2,
  X,
  Play,
  Film,
  Sparkles,
  Layers,
  Mic,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface AIStoryboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  onApplyStoryboard: (
    clips: VideoClip[],
    audioClips: AudioClip[],
    textOverlays: TextOverlay[],
    projectName: string
  ) => void;
}

const STORYBOARD_PRESETS = [
  {
    title: "Cyberpunk Tokyo 2099",
    concept: "High-octane commercial for a flying hypercar racing through neon-lit rainy futuristic skyscrapers",
    style: "cyberpunk",
    duration: 16,
  },
  {
    title: "Cosmic Odyssey: Deep Space",
    concept: "Cinematic trailer exploring deep space nebulae, black holes, and the birth of distant solar systems",
    style: "cinematic",
    duration: 16,
  },
  {
    title: "Nordic Alpine Horizons",
    concept: "Breathtaking drone travel documentary through mist-covered fjords, snow peaks, and emerald auroras",
    style: "cinematic",
    duration: 16,
  },
  {
    title: "Quantum AI Awakening",
    concept: "Abstract scientific exploration of quantum neural particles forming super-intelligent conscious networks",
    style: "vibrant",
    duration: 16,
  },
];

export const AIStoryboardModal: React.FC<AIStoryboardModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  onApplyStoryboard,
}) => {
  const [topic, setTopic] = useState<string>("");
  const [style, setStyle] = useState<string>("cinematic");
  const [targetDuration, setTargetDuration] = useState<number>(16);
  const [sceneCount, setSceneCount] = useState<number>(4);
  const [includeVoiceover, setIncludeVoiceover] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedStory, setGeneratedStory] = useState<{
    title: string;
    concept: string;
    style: string;
    scenes: StoryboardScene[];
    musicVibe?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const response = await generateStoryboardWithAI(
        topic,
        style,
        targetDuration,
        sceneCount,
        aspectRatio,
        includeVoiceover
      );

      setGeneratedStory({
        title: response.title || topic,
        concept: response.concept || topic,
        style: response.style || style,
        musicVibe: response.musicVibe,
        scenes: response.scenes.map((s, idx) => ({
          sceneNumber: s.sceneNumber || idx + 1,
          title: s.title || `Scene ${idx + 1}`,
          prompt: s.prompt || topic,
          duration: s.duration || 4,
          cameraMotion: s.cameraMotion || "drone-orbit",
          transition: (s.transition as TransitionType) || "crossfade",
          filter: (s.filter as FilterPreset) || "cinematic",
          voiceoverText: s.voiceoverText || "",
          subtitleText: s.subtitleText || "",
        })),
      });
    } catch (err) {
      console.error("Storyboard error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToTimeline = () => {
    if (!generatedStory || generatedStory.scenes.length === 0) return;

    const newClips: VideoClip[] = [];
    const newAudio: AudioClip[] = [];
    const newText: TextOverlay[] = [];

    let currentTimelineTime = 0;

    generatedStory.scenes.forEach((scene, index) => {
      // Determine procedural background type from prompt keywords
      const pLower = scene.prompt.toLowerCase();
      let procType: VideoClip["proceduralType"] = "nebula";
      if (pLower.includes("cyber") || pLower.includes("tokyo") || pLower.includes("city") || pLower.includes("neon")) procType = "cyberpunk";
      else if (pLower.includes("space") || pLower.includes("star") || pLower.includes("nebula") || pLower.includes("cosmic")) procType = "nebula";
      else if (pLower.includes("sunset") || pLower.includes("ocean") || pLower.includes("sea") || pLower.includes("wave")) procType = "sunset";
      else if (pLower.includes("particle") || pLower.includes("quantum") || pLower.includes("vortex")) procType = "particles";
      else if (pLower.includes("synth") || pLower.includes("grid") || pLower.includes("retro")) procType = "synthwave";
      else if (pLower.includes("matrix") || pLower.includes("code") || pLower.includes("data")) procType = "matrix";
      else if (pLower.includes("mountain") || pLower.includes("alpine") || pLower.includes("mist")) procType = "mountains";
      else if (pLower.includes("aurora") || pLower.includes("northern") || pLower.includes("fjord")) procType = "aurora";

      // Map camera motion string to CameraAnimation enum
      let camAnim: CameraAnimation = "drone-orbit";
      const cLower = scene.cameraMotion.toLowerCase();
      if (cLower.includes("pan right")) camAnim = "pan-right";
      else if (cLower.includes("pan left")) camAnim = "pan-left";
      else if (cLower.includes("tilt")) camAnim = "tilt-up";
      else if (cLower.includes("dolly") || cLower.includes("zoom in")) camAnim = "zoom-in";
      else if (cLower.includes("pull") || cLower.includes("zoom out")) camAnim = "zoom-out";
      else if (cLower.includes("ken")) camAnim = "ken-burns";
      else if (cLower.includes("pulse")) camAnim = "pulse";

      // 1. Video Clip
      const clip: VideoClip = {
        id: `story-clip-${Date.now()}-${index}`,
        name: scene.title,
        type: "procedural",
        proceduralType: procType,
        prompt: scene.prompt,
        duration: scene.duration,
        startTime: currentTimelineTime,
        trackIndex: 0,
        speed: 1,
        volume: 1,
        filter: scene.filter || "cinematic",
        cameraAnimation: camAnim,
        transitionIn: { type: index === 0 ? "none" : scene.transition || "crossfade", duration: 0.6 },
        transitionOut: { type: index === generatedStory.scenes.length - 1 ? "fade-black" : scene.transition || "crossfade", duration: 0.6 },
        transform: { scale: 1, x: 0, y: 0, rotation: 0, flipH: false, flipV: false, opacity: 1 },
        brightness: 1.05,
        contrast: 1.15,
        saturation: 1.2,
        hue: 0,
      };
      newClips.push(clip);

      // 2. Subtitle / On-screen Text Overlay
      if (scene.subtitleText) {
        newText.push({
          id: `story-text-${Date.now()}-${index}`,
          text: scene.subtitleText,
          startTime: currentTimelineTime + 0.3,
          duration: Math.max(2, scene.duration - 0.6),
          trackIndex: 0,
          fontFamily: "system-ui, sans-serif",
          fontSize: 42,
          fontWeight: "bold",
          color: "#ffffff",
          bgColor: "rgba(0, 0, 0, 0.65)",
          bgRadius: 8,
          position: "bottom",
          posY: 85,
          align: "center",
          animation: "slide-up",
          isSubtitle: true,
        });
      }

      // 3. Narration Voiceover Audio
      if (scene.voiceoverText && includeVoiceover) {
        newAudio.push({
          id: `story-vo-${Date.now()}-${index}`,
          name: `VO: Scene ${scene.sceneNumber}`,
          type: "voiceover",
          duration: scene.duration,
          startTime: currentTimelineTime,
          trackIndex: 0,
          volume: 0.95,
          fadeIn: 0.2,
          fadeOut: 0.2,
          voiceName: "Kore",
          transcript: scene.voiceoverText,
        });
      }

      currentTimelineTime += scene.duration;
    });

    // 4. Background Music Track across total duration
    const synthPreset = style === "cyberpunk" ? "cyber-pulse" : style === "vintage" ? "midnight-lofi" : "cosmic-horizon";
    newAudio.push({
      id: `story-bgm-${Date.now()}`,
      name: `${generatedStory.title} Soundtrack`,
      type: "music",
      synthPreset,
      duration: currentTimelineTime,
      startTime: 0,
      trackIndex: 1,
      volume: 0.55,
      fadeIn: 0.8,
      fadeOut: 1.2,
    });

    onApplyStoryboard(newClips, newAudio, newText, generatedStory.title);
    onClose();
  };

  return (
    <div
      id="storyboard-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        id="storyboard-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#020617]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                AI Storyboard Director Mode
                <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  GEMINI 3.7 DIRECTOR
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Input a video concept — AI plans shots, generates cinematic prompts, scripts narration, and sequences the timeline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {!generatedStory ? (
            <>
              {/* Concept Presets */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Quick Cinematic Storyboard Concepts
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STORYBOARD_PRESETS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTopic(item.concept);
                        setStyle(item.style);
                        setTargetDuration(item.duration);
                      }}
                      className="p-3 rounded-xl border border-slate-800 bg-[#020617]/60 hover:border-indigo-500/60 hover:bg-indigo-950/20 text-left transition-all group"
                    >
                      <span className="font-bold text-slate-200 block text-xs group-hover:text-indigo-300">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {item.concept}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Concept Input */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Your Video Concept / Storyline
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. A dramatic trailer for an expedition discovering an ancient alien artifact on a frozen moon of Jupiter..."
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs leading-relaxed resize-none"
                />
              </div>

              {/* Configuration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Visual Style */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Visual Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="cinematic">Cinematic Hollywood</option>
                    <option value="cyberpunk">Cyberpunk Neo-Tokyo</option>
                    <option value="nature">Nature / BBC Earth</option>
                    <option value="vintage">Vintage 35mm Film</option>
                    <option value="vibrant">Vibrant Sci-Fi Pop</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Total Duration ({targetDuration}s)
                  </label>
                  <select
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                    className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="8">8 Seconds (Short Teaser - 2 Scenes)</option>
                    <option value="16">16 Seconds (Standard Reel - 4 Scenes)</option>
                    <option value="24">24 Seconds (Full Narrative - 6 Scenes)</option>
                  </select>
                </div>

                {/* Voiceover Toggle */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Voiceover & Captions
                  </label>
                  <button
                    type="button"
                    onClick={() => setIncludeVoiceover((v) => !v)}
                    className={`w-full p-2 rounded-lg border text-left font-medium flex items-center justify-between transition-colors ${
                      includeVoiceover
                        ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-300"
                        : "bg-[#020617] border-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5" />
                      <span>{includeVoiceover ? "AI Voiceover Included" : "Visual Only"}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold">
                      {includeVoiceover ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Generated Storyboard Review */
            <div className="space-y-4">
              <div className="bg-indigo-950/30 border border-indigo-500/30 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{generatedStory.title}</h3>
                  <p className="text-xs text-indigo-300/80 mt-0.5">
                    {generatedStory.scenes.length} Scenes • {targetDuration}s Total • {generatedStory.style} Style
                  </p>
                </div>
                <button
                  onClick={() => setGeneratedStory(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Regenerate
                </button>
              </div>

              {/* Scene Cards */}
              <div className="space-y-3">
                {generatedStory.scenes.map((scene) => (
                  <div
                    key={scene.sceneNumber}
                    className="p-3.5 rounded-xl border border-slate-800 bg-[#020617]/80 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="font-bold text-indigo-300 text-xs flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-[10px]">
                          {scene.sceneNumber}
                        </span>
                        {scene.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{scene.duration}s</span>
                        <span>•</span>
                        <span>{scene.cameraMotion}</span>
                        <span>•</span>
                        <span className="capitalize">{scene.transition}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-mono bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-indigo-400 font-semibold">Prompt: </span>
                      {scene.prompt}
                    </p>

                    {scene.voiceoverText && (
                      <div className="flex items-start gap-2 text-[11px] text-emerald-300/90 pt-1">
                        <Mic className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                        <span>"{scene.voiceoverText}"</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#020617] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors font-medium text-xs"
          >
            Cancel
          </button>

          {!generatedStory ? (
            <button
              id="btn-generate-storyboard"
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all active:scale-95 text-xs"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span>Generate AI Storyboard</span>
            </button>
          ) : (
            <button
              id="btn-apply-storyboard"
              onClick={handleApplyToTimeline}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Assemble Storyboard on Timeline</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
