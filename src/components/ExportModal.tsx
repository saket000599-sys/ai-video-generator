import React, { useState, useRef } from "react";
import { AspectRatio, VideoClip, TextOverlay, AudioClip, ExportOptions } from "../types";
import { exportVideoProject } from "../services/videoRenderer";
import {
  Download,
  X,
  Film,
  CheckCircle2,
  Play,
  Share2,
  Sparkles,
  Loader2,
  HardDrive,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  projectName: string;
  totalDuration: number;
  clips: VideoClip[];
  audioClips: AudioClip[];
  textOverlays: TextOverlay[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  projectName,
  totalDuration,
  clips,
  audioClips,
  textOverlays,
}) => {
  const [resolution, setResolution] = useState<ExportOptions["resolution"]>("1080p");
  const [fps, setFps] = useState<ExportOptions["fps"]>(30);
  const [format, setFormat] = useState<ExportOptions["format"]>("webm");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setDownloadUrl(null);

    try {
      const url = await exportVideoProject(
        aspectRatio,
        clips,
        textOverlays,
        audioClips,
        totalDuration,
        {
          resolution,
          fps,
          format,
          quality: "high",
        },
        (progress) => {
          setExportProgress(progress);
        }
      );

      setDownloadUrl(url);
    } catch (err: any) {
      console.error("Export failure:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    const cleanName = projectName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    a.download = `${cleanName}_${aspectRatio.replace(":", "x")}_${resolution}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        id="export-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#020617]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Export High-Quality Video</h2>
              <p className="text-xs text-slate-400">
                Render composite timeline into a downloadable video file
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
        <div className="p-6 space-y-4 text-xs">
          {!downloadUrl ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-[#020617] rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-slate-500 block text-[10px]">Timeline Length</span>
                  <span className="text-slate-200 font-bold font-mono text-sm">
                    {totalDuration.toFixed(1)}s
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Aspect Ratio</span>
                  <span className="text-indigo-400 font-bold font-mono text-sm">{aspectRatio}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Clips</span>
                  <span className="text-slate-200 font-bold font-mono text-sm">{clips.length}</span>
                </div>
              </div>

              {/* Resolution selection */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Render Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "720p", label: "720p HD", desc: "Fast export" },
                    { id: "1080p", label: "1080p Full HD", desc: "Crisp & standard" },
                    { id: "4k", label: "4K UHD", desc: "Maximum clarity" },
                  ].map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setResolution(res.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        resolution === res.id
                          ? "border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500"
                          : "border-slate-800 bg-[#020617]/60 hover:border-slate-700"
                      }`}
                    >
                      <span className="font-bold text-slate-200 block text-xs">{res.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{res.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Framerate & Format */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Framerate
                  </label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value) as any)}
                    className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="30">30 FPS (Standard)</option>
                    <option value="60">60 FPS (Ultra Smooth)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Output Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="webm">WebM (Hardware VP9 Accelerated)</option>
                    <option value="mp4">MP4 (Universal)</option>
                  </select>
                </div>
              </div>

              {/* Progress Bar while Exporting */}
              {isExporting && (
                <div className="p-4 bg-[#020617] rounded-xl border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-400 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rendering frames & transitions...
                    </span>
                    <span className="font-mono text-slate-300">
                      {Math.round(exportProgress * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                      style={{ width: `${Math.round(exportProgress * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Rendered Complete Success Screen */
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Video Render Complete!</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your video is encoded and ready to download.
                </p>
              </div>

              {/* Downloadable Video Player Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video max-h-56 mx-auto flex items-center justify-center">
                <video
                  src={downloadUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
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
            {downloadUrl ? "Done" : "Cancel"}
          </button>

          {!downloadUrl ? (
            <button
              id="btn-start-render-export"
              onClick={handleStartExport}
              disabled={isExporting || clips.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-lg shadow-emerald-600/30 disabled:opacity-40 transition-all active:scale-95 text-xs"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isExporting ? "Rendering Video..." : "Start Export"}</span>
            </button>
          ) : (
            <button
              id="btn-download-video-file"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 text-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Video File</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
