import React, { useState } from "react";
import { VideoClip, AudioClip, TextOverlay, FilterPreset, CameraAnimation, TransitionType } from "../types";
import { PRESET_PROMPTS } from "../data/sampleClips";
import { SAMPLE_AUDIO_PRESETS } from "../data/sampleAudio";
import { generateTTSWithAI } from "../services/geminiService";
import { audioEngine } from "../services/audioEngine";
import {
  Sparkles,
  Film,
  Music,
  Type,
  Layers,
  Upload,
  Plus,
  Play,
  Volume2,
  Mic,
  Sliders,
  Check,
  Loader2,
} from "lucide-react";

interface MediaLibraryProps {
  currentTime: number;
  onAddClip: (clip: VideoClip) => void;
  onAddAudio: (audio: AudioClip) => void;
  onAddText: (text: TextOverlay) => void;
  onOpenPromptModal: () => void;
}

type TabType = "ai" | "clips" | "audio" | "text" | "transitions" | "uploads";

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  currentTime,
  onAddClip,
  onAddAudio,
  onAddText,
  onOpenPromptModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("clips");
  const [ttsInput, setTtsInput] = useState<string>("");
  const [ttsVoice, setTtsVoice] = useState<string>("Kore");
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false);

  // Add Preset Clip
  const handleAddPresetClip = (preset: (typeof PRESET_PROMPTS)[0]) => {
    const newClip: VideoClip = {
      id: `clip-${preset.id}-${Date.now()}`,
      name: preset.title,
      type: "procedural",
      proceduralType: preset.proceduralType,
      prompt: preset.prompt,
      duration: preset.duration,
      startTime: currentTime,
      trackIndex: 0,
      speed: 1,
      volume: 1,
      filter: preset.filter,
      cameraAnimation: preset.cameraAnimation,
      transitionIn: { type: "crossfade", duration: 0.5 },
      transitionOut: { type: "crossfade", duration: 0.5 },
      transform: { scale: 1, x: 0, y: 0, rotation: 0, flipH: false, flipV: false, opacity: 1 },
      brightness: 1,
      contrast: 1.1,
      saturation: 1.2,
      hue: 0,
    };
    onAddClip(newClip);
  };

  // Add Audio Track
  const handleAddAudioPreset = (preset: (typeof SAMPLE_AUDIO_PRESETS)[0]) => {
    const isSfx = preset.category === "sfx";
    const newAudio: AudioClip = {
      id: `audio-${preset.id}-${Date.now()}`,
      name: preset.name,
      type: isSfx ? "sfx" : "music",
      synthPreset: preset.synthPreset,
      duration: preset.duration,
      startTime: currentTime,
      trackIndex: isSfx ? 2 : 1,
      volume: isSfx ? 0.8 : 0.6,
      fadeIn: isSfx ? 0 : 0.5,
      fadeOut: isSfx ? 0.2 : 1.0,
    };
    onAddAudio(newAudio);
  };

  // Generate & Add TTS Voiceover
  const handleGenerateTTS = async () => {
    if (!ttsInput.trim()) return;
    setIsGeneratingTts(true);
    try {
      const result = await generateTTSWithAI(ttsInput, ttsVoice);
      const estDuration = Math.max(2.5, ttsInput.split(" ").length * 0.45);

      const newAudio: AudioClip = {
        id: `audio-tts-${Date.now()}`,
        name: `VO: ${ttsInput.slice(0, 16)}...`,
        type: "voiceover",
        duration: estDuration,
        startTime: currentTime,
        trackIndex: 0,
        volume: 0.95,
        fadeIn: 0.1,
        fadeOut: 0.2,
        voiceName: ttsVoice,
        transcript: ttsInput,
        audioBase64: result.audioBase64,
      };

      onAddAudio(newAudio);

      // Also create matching subtitle text overlay!
      onAddText({
        id: `text-sub-${Date.now()}`,
        text: ttsInput,
        startTime: currentTime,
        duration: estDuration,
        trackIndex: 0,
        fontFamily: "system-ui, sans-serif",
        fontSize: 42,
        fontWeight: "bold",
        color: "#ffffff",
        bgColor: "rgba(0, 0, 0, 0.7)",
        bgRadius: 8,
        position: "bottom",
        posY: 85,
        align: "center",
        animation: "typewriter",
        isSubtitle: true,
      });

      setTtsInput("");
    } catch (err) {
      console.error("TTS generation error:", err);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Add Text Overlay Template
  const handleAddTextTemplate = (
    text: string,
    anim: TextOverlay["animation"],
    size = 54,
    color = "#ffffff",
    bgColor?: string,
    pos: TextOverlay["position"] = "center"
  ) => {
    const newText: TextOverlay = {
      id: `text-overlay-${Date.now()}`,
      text,
      startTime: currentTime,
      duration: 3.5,
      trackIndex: 0,
      fontFamily: "system-ui, sans-serif",
      fontSize: size,
      fontWeight: "900",
      color,
      bgColor,
      bgRadius: 10,
      position: pos,
      posY: pos === "top" ? 20 : pos === "center" ? 50 : 85,
      align: "center",
      animation: anim,
    };
    onAddText(newText);
  };

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const isVideo = file.type.startsWith("video/");
      const isAudio = file.type.startsWith("audio/");

      if (isAudio) {
        onAddAudio({
          id: `audio-user-${Date.now()}`,
          name: file.name,
          type: "music",
          audioUrl: dataUrl,
          duration: 10,
          startTime: currentTime,
          trackIndex: 1,
          volume: 0.7,
          fadeIn: 0.5,
          fadeOut: 0.5,
        });
      } else {
        onAddClip({
          id: `clip-user-${Date.now()}`,
          name: file.name,
          type: isVideo ? "custom-video" : "image-animated",
          mediaUrl: dataUrl,
          duration: 4,
          startTime: currentTime,
          trackIndex: 0,
          speed: 1,
          volume: 1,
          filter: "none",
          cameraAnimation: "ken-burns",
          transitionIn: { type: "crossfade", duration: 0.5 },
          transitionOut: { type: "crossfade", duration: 0.5 },
          transform: { scale: 1, x: 0, y: 0, rotation: 0, flipH: false, flipV: false, opacity: 1 },
          brightness: 1,
          contrast: 1,
          saturation: 1,
          hue: 0,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="media-library-sidebar"
      className="w-64 sm:w-72 bg-[#020617] border-r border-slate-800 flex flex-col select-none shrink-0"
    >
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("clips")}
          className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${
            activeTab === "clips"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
          title="Curated AI Video Clips"
        >
          <Film className="w-3.5 h-3.5" />
          <span>Clips</span>
        </button>

        <button
          onClick={() => setActiveTab("audio")}
          className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${
            activeTab === "audio"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
          title="AI Voiceover TTS & Soundtracks"
        >
          <Music className="w-3.5 h-3.5" />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setActiveTab("text")}
          className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${
            activeTab === "text"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
          title="Animated Titles & Subtitles"
        >
          <Type className="w-3.5 h-3.5" />
          <span>Text</span>
        </button>

        <button
          onClick={() => setActiveTab("uploads")}
          className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${
            activeTab === "uploads"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
          title="Upload Custom Media"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {/* 1. CLIPS TAB */}
        {activeTab === "clips" && (
          <div className="space-y-3">
            {/* Quick Generator Trigger */}
            <button
              onClick={onOpenPromptModal}
              className="w-full p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/40 hover:border-indigo-400 text-left transition-all group flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Generate Custom Clip
                </span>
                <span className="text-[10px] text-indigo-300/80 block mt-0.5">
                  Type any prompt to create a new scene
                </span>
              </div>
              <Plus className="w-4 h-4 text-indigo-300 group-hover:scale-110 transition-transform" />
            </button>

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
              Cinematic Procedural Presets
            </div>

            {/* Presets List */}
            <div className="space-y-2">
              {PRESET_PROMPTS.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-200 block text-xs leading-tight">
                        {p.title}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {p.description}
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 font-mono">
                      {p.duration}s
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-[9px] text-indigo-400 font-mono capitalize">
                      {p.cameraAnimation} • {p.filter}
                    </span>
                    <button
                      onClick={() => handleAddPresetClip(p)}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. AUDIO & TTS TAB */}
        {activeTab === "audio" && (
          <div className="space-y-4">
            {/* AI TTS Voiceover Studio */}
            <div className="p-3 rounded-lg border border-indigo-500/30 bg-slate-900/80 space-y-2.5">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Voiceover Narration (TTS)</span>
              </div>

              <textarea
                rows={2}
                value={ttsInput}
                onChange={(e) => setTtsInput(e.target.value)}
                placeholder="Type narration script to generate speech & synced subtitle..."
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
              />

              <div className="flex items-center justify-between gap-2">
                <select
                  value={ttsVoice}
                  onChange={(e) => setTtsVoice(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] px-2 py-1 rounded-md focus:outline-none focus:border-indigo-500"
                >
                  <option value="Kore">Voice: Kore (Cinematic Neutral)</option>
                  <option value="Zephyr">Voice: Zephyr (Calm Storyteller)</option>
                  <option value="Puck">Voice: Puck (Energetic Dynamic)</option>
                  <option value="Fenrir">Voice: Fenrir (Deep Resonant)</option>
                </select>

                <button
                  onClick={handleGenerateTTS}
                  disabled={isGeneratingTts || !ttsInput.trim()}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-semibold text-[11px] disabled:opacity-40 flex items-center gap-1 transition-colors shrink-0"
                >
                  {isGeneratingTts ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  <span>Generate</span>
                </button>
              </div>
            </div>

            {/* Soundtrack & SFX Presets */}
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
              Music Soundtracks & SFX
            </div>

            <div className="space-y-2">
              {SAMPLE_AUDIO_PRESETS.map((track) => (
                <div
                  key={track.id}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-all flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-200 block text-xs truncate">
                      {track.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {track.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => audioEngine.playSFX(track.synthPreset, 0.7)}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-md"
                      title="Preview Sound"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAddAudioPreset(track)}
                      className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. TEXT & TITLES TAB */}
        {activeTab === "text" && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
              Animated Title & Caption Templates
            </div>

            {/* Lower Thirds */}
            <button
              onClick={() =>
                handleAddTextTemplate(
                  "CYBERPUNK TOKYO 2099",
                  "pop",
                  52,
                  "#00f0ff",
                  "rgba(0,0,0,0.85)",
                  "top"
                )
              }
              className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-cyan-300 text-xs block">Neon Cyber Title</span>
                <span className="text-[10px] text-slate-400">Pop animation with neon glow</span>
              </div>
              <Plus className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Cinematic Centerpiece */}
            <button
              onClick={() =>
                handleAddTextTemplate(
                  "THE AWAKENING",
                  "glow",
                  64,
                  "#ffffff",
                  undefined,
                  "center"
                )
              }
              className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-left transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-indigo-300 text-xs block">Cinematic Title</span>
                <span className="text-[10px] text-slate-400">Center display with pulsing glow</span>
              </div>
              <Plus className="w-4 h-4 text-indigo-400" />
            </button>

            {/* Typewriter Subtitle */}
            <button
              onClick={() =>
                handleAddTextTemplate(
                  "Every journey begins with a single bold prompt...",
                  "typewriter",
                  40,
                  "#fef08a",
                  "rgba(0,0,0,0.75)",
                  "bottom"
                )
              }
              className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-amber-500/50 hover:bg-amber-950/20 text-left transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-amber-300 text-xs block">Typewriter Subtitle</span>
                <span className="text-[10px] text-slate-400">Smooth character reveal caption</span>
              </div>
              <Plus className="w-4 h-4 text-amber-400" />
            </button>

            {/* Slide-Up Lower Third */}
            <button
              onClick={() =>
                handleAddTextTemplate(
                  "AI VIDEO EDITOR PRO",
                  "slide-up",
                  44,
                  "#ffffff",
                  "rgba(99,102,241,0.75)",
                  "bottom"
                )
              }
              className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-left transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-indigo-200 text-xs block">Lower Third Banner</span>
                <span className="text-[10px] text-slate-400">Indigo backdrop slide-up tag</span>
              </div>
              <Plus className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        )}

        {/* 4. UPLOADS TAB */}
        {activeTab === "uploads" && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
              Import Video, Image or Audio
            </div>

            <label
              id="dropzone-file-upload"
              className="border-2 border-dashed border-slate-800 hover:border-indigo-500/80 bg-slate-900/40 hover:bg-indigo-950/10 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
            >
              <Upload className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
              <span className="font-bold text-slate-200 text-xs block">
                Click or Drop Files Here
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Supports MP4, WebM, PNG, JPG, GIF, MP3, WAV
              </span>
              <input
                type="file"
                accept="video/*,image/*,audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
