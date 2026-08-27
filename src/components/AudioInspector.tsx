import React from "react";
import { AudioClip } from "../types";
import { audioEngine } from "../services/audioEngine";
import {
  Music,
  Mic,
  Trash2,
  Volume2,
  Sliders,
  Play,
} from "lucide-react";

interface AudioInspectorProps {
  audio: AudioClip;
  onUpdateAudio: (updated: AudioClip) => void;
  onDeleteAudio: () => void;
}

export const AudioInspector: React.FC<AudioInspectorProps> = ({
  audio,
  onUpdateAudio,
  onDeleteAudio,
}) => {
  return (
    <div
      id="audio-inspector-panel"
      className="w-72 sm:w-80 bg-[#020617] border-l border-slate-800 flex flex-col select-none overflow-y-auto shrink-0 text-xs"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2">
          {audio.type === "voiceover" ? (
            <Mic className="w-4 h-4 text-emerald-400" />
          ) : (
            <Music className="w-4 h-4 text-pink-400" />
          )}
          <span className="font-bold text-slate-200 text-xs truncate max-w-[170px]">
            {audio.name}
          </span>
        </div>
        <button
          onClick={onDeleteAudio}
          className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
          title="Delete Audio Track"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Track Name
          </label>
          <input
            type="text"
            value={audio.name}
            onChange={(e) => onUpdateAudio({ ...audio, name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        {/* Transcript if Voiceover */}
        {audio.transcript && (
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Narration Transcript
            </span>
            <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
              "{audio.transcript}"
            </p>
          </div>
        )}

        {/* Volume Slider */}
        <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Volume</span>
            </span>
            <span className="text-slate-500 font-mono">{((audio.volume ?? 0.8) * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={audio.volume ?? 0.8}
            onChange={(e) => onUpdateAudio({ ...audio, volume: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-700 rounded appearance-none accent-indigo-500"
          />
        </div>

        {/* Fade In / Fade Out */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Fade In ({audio.fadeIn ?? 0}s)
            </label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={audio.fadeIn ?? 0}
              onChange={(e) => onUpdateAudio({ ...audio, fadeIn: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded appearance-none accent-indigo-500 mt-1"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Fade Out ({audio.fadeOut ?? 0}s)
            </label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={audio.fadeOut ?? 0}
              onChange={(e) => onUpdateAudio({ ...audio, fadeOut: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded appearance-none accent-indigo-500 mt-1"
            />
          </div>
        </div>

        {/* Preview Button */}
        <button
          onClick={() => {
            if (audio.synthPreset) {
              audioEngine.playSFX(audio.synthPreset, audio.volume ?? 0.8);
            }
          }}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Play className="w-3.5 h-3.5 text-indigo-400" />
          <span>Test Sound Profile</span>
        </button>
      </div>
    </div>
  );
};
