import React, { useState, useEffect, useMemo } from "react";
import {
  AspectRatio,
  VideoClip,
  AudioClip,
  TextOverlay,
  TimelineSelection,
} from "./types";
import {
  SAMPLE_PROJECT_CYBERPUNK,
  SAMPLE_CLIPS,
} from "./data/sampleClips";
import { SAMPLE_AUDIO_PRESETS } from "./data/sampleAudio";
import { Header } from "./components/Header";
import { PreviewPlayer } from "./components/PreviewPlayer";
import { Timeline } from "./components/Timeline";
import { MediaLibrary } from "./components/MediaLibrary";
import { ClipInspector } from "./components/ClipInspector";
import { TextInspector } from "./components/TextInspector";
import { AudioInspector } from "./components/AudioInspector";
import { PromptToClipModal } from "./components/PromptToClipModal";
import { AIStoryboardModal } from "./components/AIStoryboardModal";
import { ExportModal } from "./components/ExportModal";
import { AiCopilotDrawer } from "./components/AiCopilotDrawer";
import { Film, Sparkles, Layers, Sliders, Info } from "lucide-react";

export function App() {
  // Project State
  const [projectName, setProjectName] = useState<string>("Neo Tokyo Cyberpunk Trailer");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [clips, setClips] = useState<VideoClip[]>(SAMPLE_PROJECT_CYBERPUNK.clips);
  const [audioClips, setAudioClips] = useState<AudioClip[]>(SAMPLE_PROJECT_CYBERPUNK.audio);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>(
    SAMPLE_PROJECT_CYBERPUNK.textOverlays
  );

  // Playback & Selection State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selection, setSelection] = useState<TimelineSelection>({
    type: "clip",
    id: SAMPLE_PROJECT_CYBERPUNK.clips[0]?.id || null,
  });

  // Modal Dialogs State
  const [activeModal, setActiveModal] = useState<
    "prompt" | "storyboard" | "export" | "copilot" | null
  >(null);

  // Calculate Total Timeline Duration
  const totalDuration = useMemo(() => {
    let maxTime = 10;
    clips.forEach((c) => {
      maxTime = Math.max(maxTime, c.startTime + c.duration);
    });
    audioClips.forEach((a) => {
      maxTime = Math.max(maxTime, a.startTime + a.duration);
    });
    textOverlays.forEach((t) => {
      maxTime = Math.max(maxTime, t.startTime + t.duration);
    });
    return Math.max(1, maxTime);
  }, [clips, audioClips, textOverlays]);

  // Keyboard Shortcuts (Space for Play/Pause, Del for Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === "Delete" || e.code === "Backspace") {
        if (selection.id) {
          e.preventDefault();
          if (selection.type === "clip") {
            setClips((prev) => prev.filter((c) => c.id !== selection.id));
          } else if (selection.type === "text") {
            setTextOverlays((prev) => prev.filter((t) => t.id !== selection.id));
          } else if (selection.type === "audio") {
            setAudioClips((prev) => prev.filter((a) => a.id !== selection.id));
          }
          setSelection({ type: null, id: null });
        }
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - (e.shiftKey ? 1 : 0.1)));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setCurrentTime((t) => Math.min(totalDuration, t + (e.shiftKey ? 1 : 0.1)));
      } else if (e.code === "KeyC") {
        // Split shortcut
        const clipToSplit = clips.find((c) => c.id === selection.id);
        if (
          clipToSplit &&
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selection, currentTime, totalDuration, clips]);

  // Reset to Cyberpunk Demo Project
  const handleResetDemo = () => {
    setProjectName("Neo Tokyo Cyberpunk Trailer");
    setAspectRatio("16:9");
    setClips(SAMPLE_PROJECT_CYBERPUNK.clips);
    setAudioClips(SAMPLE_PROJECT_CYBERPUNK.audio);
    setTextOverlays(SAMPLE_PROJECT_CYBERPUNK.textOverlays);
    setCurrentTime(0);
    setSelection({ type: "clip", id: SAMPLE_PROJECT_CYBERPUNK.clips[0]?.id || null });
  };

  // Start Blank Project
  const handleNewProject = () => {
    setProjectName("Untitled AI Video Project");
    setClips([]);
    setAudioClips([]);
    setTextOverlays([]);
    setCurrentTime(0);
    setSelection({ type: null, id: null });
  };

  // Add Generated / Library Clip to Timeline
  const handleAddClip = (clip: VideoClip) => {
    setClips((prev) => [...prev, clip]);
    setSelection({ type: "clip", id: clip.id });
  };

  // Add Audio to Timeline
  const handleAddAudio = (audio: AudioClip) => {
    setAudioClips((prev) => [...prev, audio]);
    setSelection({ type: "audio", id: audio.id });
  };

  // Add Text Overlay to Timeline
  const handleAddText = (text: TextOverlay) => {
    setTextOverlays((prev) => [...prev, text]);
    setSelection({ type: "text", id: text.id });
  };

  // Apply Full AI Storyboard
  const handleApplyStoryboard = (
    newClips: VideoClip[],
    newAudio: AudioClip[],
    newText: TextOverlay[],
    newTitle: string
  ) => {
    setProjectName(newTitle);
    setClips(newClips);
    setAudioClips(newAudio);
    setTextOverlays(newText);
    setCurrentTime(0);
    setSelection({ type: "clip", id: newClips[0]?.id || null });
  };

  // Currently Selected Objects
  const selectedClip = useMemo(
    () => (selection.type === "clip" ? clips.find((c) => c.id === selection.id) : null),
    [selection, clips]
  );

  const selectedText = useMemo(
    () => (selection.type === "text" ? textOverlays.find((t) => t.id === selection.id) : null),
    [selection, textOverlays]
  );

  const selectedAudio = useMemo(
    () => (selection.type === "audio" ? audioClips.find((a) => a.id === selection.id) : null),
    [selection, audioClips]
  );

  return (
    <div
      id="app-root"
      className="h-screen w-screen flex flex-col bg-[#020617] text-slate-100 font-sans overflow-hidden select-none"
    >
      {/* Top Navigation Bar */}
      <Header
        projectName={projectName}
        setProjectName={setProjectName}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        onOpenPromptModal={() => setActiveModal("prompt")}
        onOpenStoryboardModal={() => setActiveModal("storyboard")}
        onOpenExportModal={() => setActiveModal("export")}
        onOpenCopilot={() => setActiveModal("copilot")}
        onResetDemo={handleResetDemo}
        onNewProject={handleNewProject}
        totalDuration={totalDuration}
      />

      {/* Middle Stage: [Left Sidebar: Media Library] | [Center: Video Preview Canvas] | [Right Sidebar: Inspector] */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Sidebar: Media Library */}
        <MediaLibrary
          currentTime={currentTime}
          onAddClip={handleAddClip}
          onAddAudio={handleAddAudio}
          onAddText={handleAddText}
          onOpenPromptModal={() => setActiveModal("prompt")}
        />

        {/* Center: Video Preview Canvas & Transport */}
        <PreviewPlayer
          aspectRatio={aspectRatio}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          totalDuration={totalDuration}
          clips={clips}
          audioClips={audioClips}
          textOverlays={textOverlays}
        />

        {/* Right Sidebar: Contextual Inspector */}
        {selectedClip ? (
          <ClipInspector
            clip={selectedClip}
            onUpdateClip={(updated) =>
              setClips((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
            }
            onDeleteClip={() => {
              setClips((prev) => prev.filter((c) => c.id !== selectedClip.id));
              setSelection({ type: null, id: null });
            }}
          />
        ) : selectedText ? (
          <TextInspector
            text={selectedText}
            onUpdateText={(updated) =>
              setTextOverlays((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
            }
            onDeleteText={() => {
              setTextOverlays((prev) => prev.filter((t) => t.id !== selectedText.id));
              setSelection({ type: null, id: null });
            }}
          />
        ) : selectedAudio ? (
          <AudioInspector
            audio={selectedAudio}
            onUpdateAudio={(updated) =>
              setAudioClips((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
            }
            onDeleteAudio={() => {
              setAudioClips((prev) => prev.filter((a) => a.id !== selectedAudio.id));
              setSelection({ type: null, id: null });
            }}
          />
        ) : (
          /* Default Inspector Placeholder */
          <div
            id="inspector-placeholder"
            className="w-72 sm:w-80 bg-[#020617] border-l border-slate-800 p-5 flex flex-col items-center justify-center text-center text-slate-500 select-none shrink-0"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 shadow-inner">
              <Sliders className="w-5 h-5 text-slate-500" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">
              No Item Selected
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px]">
              Select any clip, subtitle, or audio track on the timeline to edit color grading, camera motion, or transitions.
            </p>
          </div>
        )}
      </div>

      {/* Bottom: Multi-Track NLE Timeline */}
      <Timeline
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        totalDuration={totalDuration}
        clips={clips}
        setClips={setClips}
        audioClips={audioClips}
        setAudioClips={setAudioClips}
        textOverlays={textOverlays}
        setTextOverlays={setTextOverlays}
        selection={selection}
        setSelection={setSelection}
        onOpenPromptModal={() => setActiveModal("prompt")}
      />

      {/* Modals & Drawers */}
      <PromptToClipModal
        isOpen={activeModal === "prompt"}
        onClose={() => setActiveModal(null)}
        aspectRatio={aspectRatio}
        currentTime={currentTime}
        onAddClip={handleAddClip}
      />

      <AIStoryboardModal
        isOpen={activeModal === "storyboard"}
        onClose={() => setActiveModal(null)}
        aspectRatio={aspectRatio}
        onApplyStoryboard={handleApplyStoryboard}
      />

      <ExportModal
        isOpen={activeModal === "export"}
        onClose={() => setActiveModal(null)}
        aspectRatio={aspectRatio}
        projectName={projectName}
        totalDuration={totalDuration}
        clips={clips}
        audioClips={audioClips}
        textOverlays={textOverlays}
      />

      <AiCopilotDrawer
        isOpen={activeModal === "copilot"}
        onClose={() => setActiveModal(null)}
        clips={clips}
        setClips={setClips}
        audioClips={audioClips}
        setAudioClips={setAudioClips}
        textOverlays={textOverlays}
        setTextOverlays={setTextOverlays}
        totalDuration={totalDuration}
      />
    </div>
  );
}

export default App;
