import React, { useRef, useState, useEffect } from "react";
import {
  VideoClip,
  AudioClip,
  TextOverlay,
  TimelineSelection,
} from "../types";
import {
  Scissors,
  Trash2,
  Copy,
  Magnet,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Type,
  Video,
  Music,
  Mic,
  Maximize,
  Sparkles,
  Plus,
} from "lucide-react";

interface TimelineProps {
  currentTime: number;
  setCurrentTime: (time: number) => void;
  totalDuration: number;
  clips: VideoClip[];
  setClips: React.Dispatch<React.SetStateAction<VideoClip[]>>;
  audioClips: AudioClip[];
  setAudioClips: React.Dispatch<React.SetStateAction<AudioClip[]>>;
  textOverlays: TextOverlay[];
  setTextOverlays: React.Dispatch<React.SetStateAction<TextOverlay[]>>;
  selection: TimelineSelection;
  setSelection: (sel: TimelineSelection) => void;
  onOpenPromptModal: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  currentTime,
  setCurrentTime,
  totalDuration,
  clips,
  setClips,
  audioClips,
  setAudioClips,
  textOverlays,
  setTextOverlays,
  selection,
  setSelection,
  onOpenPromptModal,
}) => {
  const rulerRef = useRef<HTMLDivElement | null>(null);
  const tracksContainerRef = useRef<HTMLDivElement | null>(null);

  // Zoom: pixels per second (e.g. 40px to 200px per second)
  const [zoomPxPerSec, setZoomPxPerSec] = useState<number>(65);
  const [isSnapping, setIsSnapping] = useState<boolean>(true);
  const [activeTool, setActiveTool] = useState<"select" | "razor">("select");
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState<boolean>(false);

  // Dragging / Trimming Clip state
  const [dragState, setDragState] = useState<{
    type: "move" | "trim-left" | "trim-right";
    itemType: "clip" | "audio" | "text";
    id: string;
    startX: number;
    initialStart: number;
    initialDuration: number;
  } | null>(null);

  // Track hide/mute toggles
  const [hiddenTracks, setHiddenTracks] = useState<Record<string, boolean>>({});
  const [mutedTracks, setMutedTracks] = useState<Record<string, boolean>>({});

  const toggleHideTrack = (trackId: string) => {
    setHiddenTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  const toggleMuteTrack = (trackId: string) => {
    setMutedTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  const timelineWidth = Math.max(1200, (totalDuration + 5) * zoomPxPerSec);

  // Handle Playhead Scrubbing
  const handleTimelineScrub = (clientX: number) => {
    if (!tracksContainerRef.current) return;
    const rect = tracksContainerRef.current.getBoundingClientRect();
    const scrollLeft = tracksContainerRef.current.scrollLeft;
    const relX = clientX - rect.left + scrollLeft;
    let targetTime = Math.max(0, Math.min(totalDuration + 5, relX / zoomPxPerSec));

    // Magnetic Snapping to Clip boundaries
    if (isSnapping) {
      const snapThreshold = 6 / zoomPxPerSec; // 6px snap radius
      const snapPoints = [0, totalDuration];
      clips.forEach((c) => {
        snapPoints.push(c.startTime, c.startTime + c.duration);
      });
      textOverlays.forEach((t) => {
        snapPoints.push(t.startTime, t.startTime + t.duration);
      });
      audioClips.forEach((a) => {
        snapPoints.push(a.startTime, a.startTime + a.duration);
      });

      for (const sp of snapPoints) {
        if (Math.abs(targetTime - sp) < snapThreshold) {
          targetTime = sp;
          break;
        }
      }
    }

    setCurrentTime(targetTime);
  };

  // Mouse drag handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPlayhead) {
        handleTimelineScrub(e.clientX);
      } else if (dragState) {
        const deltaSec = (e.clientX - dragState.startX) / zoomPxPerSec;

        if (dragState.itemType === "clip") {
          setClips((prev) =>
            prev.map((c) => {
              if (c.id !== dragState.id) return c;
              if (dragState.type === "move") {
                const newStart = Math.max(0, dragState.initialStart + deltaSec);
                return { ...c, startTime: newStart };
              } else if (dragState.type === "trim-right") {
                const newDur = Math.max(0.5, dragState.initialDuration + deltaSec);
                return { ...c, duration: newDur };
              } else if (dragState.type === "trim-left") {
                const newStart = Math.max(0, dragState.initialStart + deltaSec);
                const newDur = Math.max(0.5, dragState.initialDuration - deltaSec);
                return { ...c, startTime: newStart, duration: newDur };
              }
              return c;
            })
          );
        } else if (dragState.itemType === "text") {
          setTextOverlays((prev) =>
            prev.map((t) => {
              if (t.id !== dragState.id) return t;
              if (dragState.type === "move") {
                return { ...t, startTime: Math.max(0, dragState.initialStart + deltaSec) };
              } else if (dragState.type === "trim-right") {
                return { ...t, duration: Math.max(0.5, dragState.initialDuration + deltaSec) };
              }
              return t;
            })
          );
        } else if (dragState.itemType === "audio") {
          setAudioClips((prev) =>
            prev.map((a) => {
              if (a.id !== dragState.id) return a;
              if (dragState.type === "move") {
                return { ...a, startTime: Math.max(0, dragState.initialStart + deltaSec) };
              } else if (dragState.type === "trim-right") {
                return { ...a, duration: Math.max(0.5, dragState.initialDuration + deltaSec) };
              }
              return a;
            })
          );
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
      setDragState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPlayhead, dragState, zoomPxPerSec, isSnapping, totalDuration]);

  // Razor / Split Clip at current playhead
  const handleSplitClipAtPlayhead = () => {
    if (selection.type !== "clip" || !selection.id) return;
    const clipToSplit = clips.find((c) => c.id === selection.id);
    if (!clipToSplit) return;

    if (
      currentTime > clipToSplit.startTime + 0.2 &&
      currentTime < clipToSplit.startTime + clipToSplit.duration - 0.2
    ) {
      const firstDuration = currentTime - clipToSplit.startTime;
      const secondDuration = clipToSplit.duration - firstDuration;

      const clipA: VideoClip = {
        ...clipToSplit,
        duration: firstDuration,
      };

      const clipB: VideoClip = {
        ...clipToSplit,
        id: `clip-split-${Date.now()}`,
        name: `${clipToSplit.name} (Part 2)`,
        startTime: currentTime,
        duration: secondDuration,
        transitionIn: { type: "none", duration: 0 },
      };

      setClips((prev) => prev.map((c) => (c.id === clipToSplit.id ? clipA : c)).concat(clipB));
      setSelection({ type: "clip", id: clipB.id });
    }
  };

  // Delete Selected Item
  const handleDeleteSelected = () => {
    if (!selection.id) return;
    if (selection.type === "clip") {
      setClips((prev) => prev.filter((c) => c.id !== selection.id));
    } else if (selection.type === "text") {
      setTextOverlays((prev) => prev.filter((t) => t.id !== selection.id));
    } else if (selection.type === "audio") {
      setAudioClips((prev) => prev.filter((a) => a.id !== selection.id));
    }
    setSelection({ type: null, id: null });
  };

  // Duplicate Selected Item
  const handleDuplicateSelected = () => {
    if (!selection.id) return;
    if (selection.type === "clip") {
      const item = clips.find((c) => c.id === selection.id);
      if (item) {
        const copy: VideoClip = {
          ...item,
          id: `clip-copy-${Date.now()}`,
          name: `${item.name} Copy`,
          startTime: item.startTime + item.duration,
        };
        setClips((prev) => [...prev, copy]);
        setSelection({ type: "clip", id: copy.id });
      }
    } else if (selection.type === "text") {
      const item = textOverlays.find((t) => t.id === selection.id);
      if (item) {
        const copy: TextOverlay = {
          ...item,
          id: `text-copy-${Date.now()}`,
          startTime: item.startTime + item.duration,
        };
        setTextOverlays((prev) => [...prev, copy]);
        setSelection({ type: "text", id: copy.id });
      }
    }
  };

  // Generate Time Ruler Tick Marks
  const renderRulerTicks = () => {
    const ticks = [];
    const stepSec = zoomPxPerSec < 50 ? 2 : zoomPxPerSec < 100 ? 1 : 0.5;
    const totalSecs = Math.ceil(totalDuration + 5);

    for (let s = 0; s <= totalSecs; s += stepSec) {
      const x = s * zoomPxPerSec;
      const isMajor = s % (stepSec * 2) === 0;
      const mins = Math.floor(s / 60);
      const secs = Math.floor(s % 60);
      const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      ticks.push(
        <div
          key={s}
          className="absolute top-0 bottom-0 border-l border-slate-800 pointer-events-none select-none"
          style={{ left: `${x}px` }}
        >
          <span
            className={`text-[9px] font-mono pl-1 ${
              isMajor ? "text-slate-400 font-semibold" : "text-slate-600"
            }`}
          >
            {isMajor ? timeStr : ""}
          </span>
        </div>
      );
    }
    return ticks;
  };

  return (
    <div
      id="timeline-main-container"
      className="h-64 sm:h-72 bg-[#020617] flex flex-col select-none border-t border-slate-800 shrink-0"
    >
      {/* Timeline Toolbar */}
      <div
        id="timeline-toolbar"
        className="h-9 bg-slate-900/90 border-b border-slate-800 px-3 flex items-center justify-between text-xs shrink-0"
      >
        {/* Left: Tools */}
        <div className="flex items-center gap-1">
          {/* Select Tool */}
          <button
            id="tool-select"
            onClick={() => setActiveTool("select")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors ${
              activeTool === "select"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Selection Tool (V)"
          >
            <span>Select</span>
          </button>

          {/* Razor / Split Tool */}
          <button
            id="tool-razor"
            onClick={handleSplitClipAtPlayhead}
            className="px-2.5 py-1 rounded flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 font-medium transition-colors active:scale-95"
            title="Split Clip at Playhead (C)"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>Split (C)</span>
          </button>

          {/* Delete */}
          <button
            id="tool-delete"
            onClick={handleDeleteSelected}
            disabled={!selection.id}
            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Delete Selected Clip (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Duplicate */}
          <button
            id="tool-duplicate"
            onClick={handleDuplicateSelected}
            disabled={!selection.id}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Duplicate Selected Clip (Cmd+D)"
          >
            <Copy className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Snapping */}
          <button
            id="tool-snapping"
            onClick={() => setIsSnapping((s) => !s)}
            className={`p-1 rounded transition-colors ${
              isSnapping
                ? "text-indigo-400 bg-indigo-500/20 border border-indigo-500/30"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
            }`}
            title="Magnetic Snapping (S)"
          >
            <Magnet className="w-4 h-4" />
          </button>

          {/* Quick Add Prompt Clip */}
          <button
            id="tool-add-clip"
            onClick={onOpenPromptModal}
            className="flex items-center gap-1 px-2.5 py-0.5 ml-2 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 rounded border border-indigo-500/30 text-[11px] font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add AI Clip</span>
          </button>
        </div>

        {/* Right: Zoom Scale Slider */}
        <div className="flex items-center gap-2 text-slate-400">
          <ZoomOut className="w-3.5 h-3.5" />
          <input
            id="timeline-zoom-slider"
            type="range"
            min="30"
            max="180"
            value={zoomPxPerSec}
            onChange={(e) => setZoomPxPerSec(parseInt(e.target.value))}
            className="w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            title="Timeline Zoom Scale"
          />
          <ZoomIn className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono text-slate-500 w-8 text-right">
            {zoomPxPerSec}px
          </span>
        </div>
      </div>

      {/* Main Track Workspace (Headers on left, Multi-Tracks on right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Track Headers Column (Left fixed) */}
        <div className="w-40 bg-slate-900/95 border-r border-slate-800 shrink-0 flex flex-col z-20 shadow-md">
          {/* Top ruler placeholder */}
          <div className="h-6 bg-slate-950 border-b border-slate-800 px-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>TRACKS</span>
          </div>

          {/* Track 1: Primary Video (V1) */}
          <div className="h-14 border-b border-slate-800/80 px-2.5 flex items-center justify-between bg-slate-900/70 hover:bg-slate-850 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Video className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold">Video 1</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleHideTrack("v1")}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                {hiddenTracks["v1"] ? (
                  <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Track 2: Overlay Video (V2) */}
          <div className="h-12 border-b border-slate-800/80 px-2.5 flex items-center justify-between bg-slate-900/50 hover:bg-slate-850 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium">Video 2 (B-Roll)</span>
            </div>
          </div>

          {/* Track 3: Subtitles / Text (T1) */}
          <div className="h-10 border-b border-slate-800/80 px-2.5 flex items-center justify-between bg-slate-900/60 hover:bg-slate-850 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Type className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium">Titles & Subs</span>
            </div>
          </div>

          {/* Track 4: Voiceover (A1) */}
          <div className="h-11 border-b border-slate-800/80 px-2.5 flex items-center justify-between bg-slate-900/50 hover:bg-slate-850 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium">Voiceover</span>
            </div>
            <button
              onClick={() => toggleMuteTrack("a1")}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              {mutedTracks["a1"] ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Track 5: Music (A2) */}
          <div className="h-11 border-b border-slate-800/80 px-2.5 flex items-center justify-between bg-slate-900/40 hover:bg-slate-850 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Music className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-xs font-medium">Music Track</span>
            </div>
            <button
              onClick={() => toggleMuteTrack("a2")}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              {mutedTracks["a2"] ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Multi-Track Sequencer Canvas (Scrollable horizontally) */}
        <div
          ref={tracksContainerRef}
          id="timeline-tracks-scroll"
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-slate-950/90 cursor-crosshair"
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).id === "timeline-ruler" || (e.target as HTMLElement).closest("#timeline-ruler")) {
              setIsDraggingPlayhead(true);
              handleTimelineScrub(e.clientX);
            }
          }}
        >
          <div
            style={{ width: `${timelineWidth}px` }}
            className="h-full relative flex flex-col"
          >
            {/* 1. Time Ruler */}
            <div
              ref={rulerRef}
              id="timeline-ruler"
              className="h-6 bg-slate-900/90 border-b border-slate-800 relative cursor-ew-resize select-none overflow-hidden"
              onMouseDown={(e) => {
                setIsDraggingPlayhead(true);
                handleTimelineScrub(e.clientX);
              }}
            >
              {renderRulerTicks()}
            </div>

            {/* 2. Track 1: Primary Video (V1) */}
            <div className="h-14 border-b border-slate-800/40 relative bg-slate-900/20">
              {clips
                .filter((c) => (c.trackIndex ?? 0) === 0)
                .map((clip) => {
                  const left = clip.startTime * zoomPxPerSec;
                  const width = clip.duration * zoomPxPerSec;
                  const isSelected = selection.type === "clip" && selection.id === clip.id;

                  return (
                    <div
                      key={clip.id}
                      id={`timeline-clip-${clip.id}`}
                      style={{ left: `${left}px`, width: `${width}px` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelection({ type: "clip", id: clip.id });
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setSelection({ type: "clip", id: clip.id });
                        setDragState({
                          type: "move",
                          itemType: "clip",
                          id: clip.id,
                          startX: e.clientX,
                          initialStart: clip.startTime,
                          initialDuration: clip.duration,
                        });
                      }}
                      className={`absolute top-1 bottom-1 rounded-md border text-xs overflow-hidden cursor-grab active:cursor-grabbing flex flex-col justify-between p-1.5 transition-shadow ${
                        isSelected
                          ? "bg-indigo-600/90 border-indigo-300 ring-2 ring-indigo-400 text-white shadow-lg z-10"
                          : "bg-indigo-950/80 border-indigo-700/60 text-indigo-100 hover:border-indigo-500"
                      }`}
                    >
                      {/* Left Trim Handle */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/40"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDragState({
                            type: "trim-left",
                            itemType: "clip",
                            id: clip.id,
                            startX: e.clientX,
                            initialStart: clip.startTime,
                            initialDuration: clip.duration,
                          });
                        }}
                      />

                      <div className="flex items-center justify-between gap-1 overflow-hidden pointer-events-none">
                        <span className="font-semibold truncate text-[11px]">
                          {clip.name}
                        </span>
                        {clip.filter !== "none" && (
                          <span className="px-1 py-0.2 rounded bg-black/40 text-[9px] font-mono text-indigo-200">
                            {clip.filter}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-indigo-300/80 pointer-events-none">
                        <span>{clip.duration.toFixed(1)}s</span>
                        {clip.cameraAnimation !== "none" && (
                          <span className="text-[9px] bg-indigo-900/60 px-1 rounded">
                            {clip.cameraAnimation}
                          </span>
                        )}
                      </div>

                      {/* Right Trim Handle */}
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/40"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDragState({
                            type: "trim-right",
                            itemType: "clip",
                            id: clip.id,
                            startX: e.clientX,
                            initialStart: clip.startTime,
                            initialDuration: clip.duration,
                          });
                        }}
                      />
                    </div>
                  );
                })}
            </div>

            {/* 3. Track 2: Overlay Video (V2) */}
            <div className="h-12 border-b border-slate-800/40 relative bg-slate-900/10">
              {clips
                .filter((c) => c.trackIndex === 1)
                .map((clip) => {
                  const left = clip.startTime * zoomPxPerSec;
                  const width = clip.duration * zoomPxPerSec;
                  const isSelected = selection.type === "clip" && selection.id === clip.id;

                  return (
                    <div
                      key={clip.id}
                      style={{ left: `${left}px`, width: `${width}px` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelection({ type: "clip", id: clip.id });
                      }}
                      className={`absolute top-1 bottom-1 rounded-md border text-xs overflow-hidden cursor-pointer flex items-center justify-between px-2 ${
                        isSelected
                          ? "bg-cyan-600/90 border-cyan-300 ring-2 ring-cyan-400 text-white"
                          : "bg-cyan-950/80 border-cyan-700/60 text-cyan-100"
                      }`}
                    >
                      <span className="font-semibold truncate text-[11px]">{clip.name}</span>
                      <span className="text-[10px] text-cyan-300">{clip.duration.toFixed(1)}s</span>
                    </div>
                  );
                })}
            </div>

            {/* 4. Track 3: Subtitles & Titles (T1) */}
            <div className="h-10 border-b border-slate-800/40 relative bg-slate-900/15">
              {textOverlays.map((text) => {
                const left = text.startTime * zoomPxPerSec;
                const width = text.duration * zoomPxPerSec;
                const isSelected = selection.type === "text" && selection.id === text.id;

                return (
                  <div
                    key={text.id}
                    id={`timeline-text-${text.id}`}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelection({ type: "text", id: text.id });
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelection({ type: "text", id: text.id });
                      setDragState({
                        type: "move",
                        itemType: "text",
                        id: text.id,
                        startX: e.clientX,
                        initialStart: text.startTime,
                        initialDuration: text.duration,
                      });
                    }}
                    className={`absolute top-1 bottom-1 rounded-md border text-xs overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-between px-2 ${
                      isSelected
                        ? "bg-amber-600/90 border-amber-300 ring-2 ring-amber-400 text-white z-10"
                        : "bg-amber-950/80 border-amber-700/60 text-amber-200"
                    }`}
                  >
                    <span className="font-semibold truncate text-[11px]">
                      "{text.text}"
                    </span>
                    <span className="text-[9px] opacity-80">{text.duration.toFixed(1)}s</span>
                  </div>
                );
              })}
            </div>

            {/* 5. Track 4: Voiceover (A1) */}
            <div className="h-11 border-b border-slate-800/40 relative bg-slate-900/10">
              {audioClips
                .filter((a) => a.type === "voiceover")
                .map((audio) => {
                  const left = audio.startTime * zoomPxPerSec;
                  const width = audio.duration * zoomPxPerSec;
                  const isSelected = selection.type === "audio" && selection.id === audio.id;

                  return (
                    <div
                      key={audio.id}
                      style={{ left: `${left}px`, width: `${width}px` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelection({ type: "audio", id: audio.id });
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setSelection({ type: "audio", id: audio.id });
                        setDragState({
                          type: "move",
                          itemType: "audio",
                          id: audio.id,
                          startX: e.clientX,
                          initialStart: audio.startTime,
                          initialDuration: audio.duration,
                        });
                      }}
                      className={`absolute top-1 bottom-1 rounded-md border text-xs overflow-hidden cursor-grab flex items-center justify-between px-2 ${
                        isSelected
                          ? "bg-emerald-600/90 border-emerald-300 ring-2 ring-emerald-400 text-white z-10"
                          : "bg-emerald-950/80 border-emerald-700/60 text-emerald-200"
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate text-[11px]">{audio.transcript || audio.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-300">{audio.duration.toFixed(1)}s</span>
                    </div>
                  );
                })}
            </div>

            {/* 6. Track 5: Music (A2) */}
            <div className="h-11 border-b border-slate-800/40 relative bg-slate-900/15">
              {audioClips
                .filter((a) => a.type === "music" || a.type === "sfx")
                .map((audio) => {
                  const left = audio.startTime * zoomPxPerSec;
                  const width = audio.duration * zoomPxPerSec;
                  const isSelected = selection.type === "audio" && selection.id === audio.id;

                  return (
                    <div
                      key={audio.id}
                      style={{ left: `${left}px`, width: `${width}px` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelection({ type: "audio", id: audio.id });
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setSelection({ type: "audio", id: audio.id });
                        setDragState({
                          type: "move",
                          itemType: "audio",
                          id: audio.id,
                          startX: e.clientX,
                          initialStart: audio.startTime,
                          initialDuration: audio.duration,
                        });
                      }}
                      className={`absolute top-1 bottom-1 rounded-md border text-xs overflow-hidden cursor-grab flex items-center justify-between px-2 ${
                        isSelected
                          ? "bg-pink-600/90 border-pink-300 ring-2 ring-pink-400 text-white z-10"
                          : "bg-pink-950/80 border-pink-700/60 text-pink-200"
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        <Music className="w-3 h-3 text-pink-400 shrink-0" />
                        <span className="truncate text-[11px]">{audio.name}</span>
                      </div>
                      <span className="text-[10px] text-pink-300">{audio.duration.toFixed(1)}s</span>
                    </div>
                  );
                })}
            </div>

            {/* Dynamic Playhead Scrubber Line */}
            <div
              id="timeline-playhead"
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none shadow-sm"
              style={{ left: `${currentTime * zoomPxPerSec}px` }}
            >
              {/* Playhead Handle Triangle */}
              <div className="w-3.5 h-3.5 bg-red-500 rotate-45 -translate-x-[6px] -translate-y-1.5 shadow-md shadow-red-500/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
