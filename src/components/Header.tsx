import React from "react";
import { AspectRatio } from "../types";
import {
  Wand2,
  Sparkles,
  Download,
  FolderOpen,
  Film,
  RotateCcw,
  Layers,
  Settings,
  HelpCircle,
} from "lucide-react";

interface HeaderProps {
  projectName: string;
  setProjectName: (name: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  onOpenPromptModal: () => void;
  onOpenStoryboardModal: () => void;
  onOpenExportModal: () => void;
  onOpenCopilot: () => void;
  onResetDemo: () => void;
  onNewProject: () => void;
  totalDuration: number;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  setProjectName,
  aspectRatio,
  setAspectRatio,
  onOpenPromptModal,
  onOpenStoryboardModal,
  onOpenExportModal,
  onOpenCopilot,
  onResetDemo,
  onNewProject,
  totalDuration,
}) => {
  return (
    <header
      id="app-header"
      className="h-14 bg-[#020617]/80 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between select-none z-30 shrink-0 backdrop-blur-md"
    >
      {/* Left: Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold tracking-tight text-slate-100">
              VividAI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-normal text-xs">/</span>
          <input
            id="project-name-input"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent hover:bg-slate-900 focus:bg-slate-900 text-xs font-medium text-slate-300 px-2 py-1 rounded border border-transparent hover:border-slate-700 focus:border-indigo-500/60 focus:outline-none transition-colors max-w-[170px] sm:max-w-[220px] truncate"
            title="Click to rename project"
          />
          <span className="text-[11px] text-slate-500 hidden md:inline font-mono">
            ({totalDuration.toFixed(1)}s)
          </span>
        </div>
      </div>

      {/* Center: Aspect Ratio & Director Tools */}
      <div className="flex items-center gap-2">
        {/* Aspect Ratio Switcher */}
        <div className="hidden sm:flex items-center bg-slate-900/90 rounded-md p-0.5 border border-slate-800">
          {(["16:9", "9:16", "1:1", "21:9"] as AspectRatio[]).map((ar) => (
            <button
              key={ar}
              id={`aspect-btn-${ar.replace(":", "-")}`}
              onClick={() => setAspectRatio(ar)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                aspectRatio === ar
                  ? "bg-slate-800 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {ar}
            </button>
          ))}
        </div>

        {/* AI Storyboard Director Mode */}
        <button
          id="btn-ai-storyboard"
          onClick={onOpenStoryboardModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-md border border-slate-800 text-xs font-medium transition-colors"
          title="AI Director creates complete multi-scene storyboard"
        >
          <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">AI Storyboard Director</span>
          <span className="md:hidden">Director</span>
        </button>

        {/* AI Generate Clip */}
        <button
          id="btn-generate-clip"
          onClick={onOpenPromptModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span>Generate Clip</span>
        </button>
      </div>

      {/* Right: AI Copilot & Export */}
      <div className="flex items-center gap-2">
        <button
          id="btn-ai-copilot"
          onClick={onOpenCopilot}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md border border-slate-800 transition-colors"
          title="AI Video Copilot & Auto Polish"
        >
          <Layers className="w-4 h-4" />
        </button>

        <div className="relative group">
          <button
            id="btn-project-menu"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md border border-slate-800 transition-colors"
            title="Project Options"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
            <button
              onClick={onNewProject}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              New Blank Project
            </button>
            <button
              onClick={onResetDemo}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Load Cyberpunk Demo
            </button>
          </div>
        </div>

        {/* Export Button */}
        <button
          id="btn-export-video"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};
