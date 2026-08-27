import React from "react";
import { TextOverlay } from "../types";
import {
  Type,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Layers,
} from "lucide-react";

interface TextInspectorProps {
  text: TextOverlay;
  onUpdateText: (updated: TextOverlay) => void;
  onDeleteText: () => void;
}

export const TextInspector: React.FC<TextInspectorProps> = ({
  text,
  onUpdateText,
  onDeleteText,
}) => {
  return (
    <div
      id="text-inspector-panel"
      className="w-72 sm:w-80 bg-[#020617] border-l border-slate-800 flex flex-col select-none overflow-y-auto shrink-0 text-xs"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200 text-xs">Text & Subtitles</span>
        </div>
        <button
          onClick={onDeleteText}
          className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
          title="Delete Text"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Text content */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Caption / Subtitle Text
          </label>
          <textarea
            rows={3}
            value={text.text}
            onChange={(e) => onUpdateText({ ...text, text: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs resize-none leading-relaxed"
          />
        </div>

        {/* Animation Preset */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Animation Effect</span>
          </label>
          <select
            value={text.animation || "pop"}
            onChange={(e) => onUpdateText({ ...text, animation: e.target.value as TextOverlay["animation"] })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="pop">Pop & Scale Bounce</option>
            <option value="typewriter">Typewriter Character Reveal</option>
            <option value="slide-up">Smooth Slide Up</option>
            <option value="glow">Pulse Neon Glow</option>
            <option value="karaoke">Karaoke Word Highlight</option>
            <option value="fade">Gentle Dissolve Fade</option>
            <option value="none">Static</option>
          </select>
        </div>

        {/* Font Size & Position */}
        <div className="space-y-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
          <div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Font Size</span>
              <span className="text-slate-500 font-mono">{text.fontSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="96"
              value={text.fontSize}
              onChange={(e) => onUpdateText({ ...text, fontSize: parseInt(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded appearance-none accent-indigo-500 mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Vertical Position (Y%)</span>
              <span className="text-slate-500 font-mono">{text.posY ?? 85}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={text.posY ?? 85}
              onChange={(e) => onUpdateText({ ...text, posY: parseInt(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded appearance-none accent-indigo-500 mt-1"
            />
          </div>
        </div>

        {/* Alignment */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Alignment
          </label>
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                onClick={() => onUpdateText({ ...text, align: a })}
                className={`flex-1 py-1.5 flex items-center justify-center rounded-md transition-colors ${
                  text.align === a
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {a === "left" && <AlignLeft className="w-3.5 h-3.5" />}
                {a === "center" && <AlignCenter className="w-3.5 h-3.5" />}
                {a === "right" && <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
              <input
                type="color"
                value={text.color}
                onChange={(e) => onUpdateText({ ...text, color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-[11px] text-slate-300 uppercase">{text.color}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Backdrop Box
            </label>
            <button
              onClick={() =>
                onUpdateText({
                  ...text,
                  bgColor: text.bgColor ? undefined : "rgba(0, 0, 0, 0.75)",
                })
              }
              className={`w-full py-2 px-2.5 rounded-lg border font-medium transition-colors ${
                text.bgColor
                  ? "bg-indigo-950/60 border-indigo-500 text-indigo-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {text.bgColor ? "Backdrop ON" : "Transparent"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
