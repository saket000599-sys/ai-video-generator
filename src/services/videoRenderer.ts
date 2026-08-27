import { VideoClip, TextOverlay, FilterPreset, CameraAnimation, TransitionType, AspectRatio } from "../types";
import { renderProceduralScene } from "./proceduralRenderer";

// Cache for loaded images and video elements
const imageCache = new Map<string, HTMLImageElement>();
const videoCache = new Map<string, HTMLVideoElement>();

export function getResolutionForAspect(aspectRatio: AspectRatio, resQuality: "720p" | "1080p" | "4k" = "1080p"): { width: number; height: number } {
  const base1080 = {
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "1:1": { width: 1080, height: 1080 },
    "21:9": { width: 1920, height: 822 },
  };

  const dims = base1080[aspectRatio] || base1080["16:9"];
  if (resQuality === "720p") {
    return { width: Math.round(dims.width * (720 / 1080)), height: Math.round(dims.height * (720 / 1080)) };
  } else if (resQuality === "4k") {
    return { width: dims.width * 2, height: dims.height * 2 };
  }
  return dims;
}

export function preloadMedia(url: string, type: "image" | "video"): Promise<HTMLImageElement | HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    if (type === "image") {
      if (imageCache.has(url)) {
        return resolve(imageCache.get(url)!);
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = (e) => reject(e);
      img.src = url;
    } else {
      if (videoCache.has(url)) {
        return resolve(videoCache.get(url)!);
      }
      const vid = document.createElement("video");
      vid.crossOrigin = "anonymous";
      vid.muted = true;
      vid.playsInline = true;
      vid.onloadeddata = () => {
        videoCache.set(url, vid);
        resolve(vid);
      };
      vid.onerror = (e) => reject(e);
      vid.src = url;
    }
  });
}

// Master Video Frame Compositor
export function renderVideoFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number, // current timeline time in seconds
  clips: VideoClip[],
  textOverlays: TextOverlay[]
) {
  // Clear canvas with black background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // 1. Group active clips sorted by trackIndex
  const sortedClips = [...clips].sort((a, b) => a.trackIndex - b.trackIndex);

  sortedClips.forEach((clip) => {
    const clipStart = clip.startTime;
    const clipEnd = clip.startTime + clip.duration;

    // Check if this clip is visible at current time
    if (time >= clipStart && time < clipEnd) {
      const clipLocalTime = (time - clipStart) * (clip.speed || 1);
      const clipProgress = (time - clipStart) / clip.duration; // 0 to 1

      // Calculate Transition opacity / progress
      let transitionAlpha = 1.0;
      let transitionOffsetX = 0;
      let transitionOffsetY = 0;
      let transitionScale = 1.0;

      // Transition In
      if (clip.transitionIn && clip.transitionIn.type !== "none" && clip.transitionIn.duration > 0) {
        const transElapsed = time - clipStart;
        if (transElapsed < clip.transitionIn.duration) {
          const transProg = transElapsed / clip.transitionIn.duration;
          applyTransitionTransform(clip.transitionIn.type, transProg, true, (a, x, y, s) => {
            transitionAlpha *= a;
            transitionOffsetX += x * width;
            transitionOffsetY += y * height;
            transitionScale *= s;
          });
        }
      }

      // Transition Out
      if (clip.transitionOut && clip.transitionOut.type !== "none" && clip.transitionOut.duration > 0) {
        const transRemaining = clipEnd - time;
        if (transRemaining < clip.transitionOut.duration) {
          const transProg = 1 - transRemaining / clip.transitionOut.duration;
          applyTransitionTransform(clip.transitionOut.type, transProg, false, (a, x, y, s) => {
            transitionAlpha *= a;
            transitionOffsetX += x * width;
            transitionOffsetY += y * height;
            transitionScale *= s;
          });
        }
      }

      ctx.save();
      ctx.globalAlpha = (clip.transform?.opacity ?? 1) * transitionAlpha;

      // Apply Camera & Ken Burns Animations
      const animTransform = calculateCameraMotion(clip.cameraAnimation, clipProgress);

      // Apply Clip Transform
      const cx = width * 0.5 + (clip.transform?.x || 0) * (width / 100) + transitionOffsetX + animTransform.x * width;
      const cy = height * 0.5 + (clip.transform?.y || 0) * (height / 100) + transitionOffsetY + animTransform.y * height;
      const totalScale = (clip.transform?.scale || 1.0) * animTransform.scale * transitionScale;
      const totalRot = ((clip.transform?.rotation || 0) + animTransform.rotation) * (Math.PI / 180);

      ctx.translate(cx, cy);
      ctx.rotate(totalRot);
      ctx.scale(
        (clip.transform?.flipH ? -1 : 1) * totalScale,
        (clip.transform?.flipV ? -1 : 1) * totalScale
      );
      ctx.translate(-width * 0.5, -height * 0.5);

      // Apply CSS Filters & Color Grading
      applyColorGrading(ctx, clip.filter, clip.brightness, clip.contrast, clip.saturation, clip.hue);

      // Render clip media or procedural scene
      if (clip.type === "procedural" || (!clip.mediaUrl && clip.proceduralType)) {
        renderProceduralScene(ctx, width, height, clip.proceduralType || "nebula", clipLocalTime);
      } else if (clip.mediaUrl && imageCache.has(clip.mediaUrl)) {
        const img = imageCache.get(clip.mediaUrl)!;
        drawContainedImage(ctx, img, width, height);
      } else if (clip.mediaUrl && videoCache.has(clip.mediaUrl)) {
        const vid = videoCache.get(clip.mediaUrl)!;
        if (Math.abs(vid.currentTime - clipLocalTime) > 0.3) {
          vid.currentTime = clipLocalTime % (vid.duration || clip.duration);
        }
        drawContainedImage(ctx, vid, width, height);
      } else if (clip.colorMatte) {
        ctx.fillStyle = clip.colorMatte;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Fallback procedural
        renderProceduralScene(ctx, width, height, "cyberpunk", clipLocalTime);
      }

      ctx.restore();
    }
  });

  // 2. Render Text Overlays & Subtitles
  textOverlays.forEach((overlay) => {
    const oStart = overlay.startTime;
    const oEnd = overlay.startTime + overlay.duration;

    if (time >= oStart && time < oEnd) {
      const elapsed = time - oStart;
      const progress = elapsed / overlay.duration;
      renderTextOverlay(ctx, width, height, overlay, elapsed, progress);
    }
  });
}

function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLVideoElement,
  w: number,
  h: number
) {
  const iw = (img as HTMLImageElement).naturalWidth || (img as HTMLVideoElement).videoWidth || w;
  const ih = (img as HTMLImageElement).naturalHeight || (img as HTMLVideoElement).videoHeight || h;

  // Cover aspect ratio
  const imgAspect = iw / ih;
  const canvasAspect = w / h;
  let renderW = w;
  let renderH = h;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > canvasAspect) {
    renderW = h * imgAspect;
    offsetX = (w - renderW) / 2;
  } else {
    renderH = w / imgAspect;
    offsetY = (h - renderH) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
}

function calculateCameraMotion(anim: CameraAnimation, p: number): { scale: number; x: number; y: number; rotation: number } {
  switch (anim) {
    case "zoom-in":
      return { scale: 1.0 + p * 0.25, x: 0, y: 0, rotation: 0 };
    case "zoom-out":
      return { scale: 1.25 - p * 0.2, x: 0, y: 0, rotation: 0 };
    case "pan-left":
      return { scale: 1.15, x: 0.08 - p * 0.16, y: 0, rotation: 0 };
    case "pan-right":
      return { scale: 1.15, x: -0.08 + p * 0.16, y: 0, rotation: 0 };
    case "tilt-up":
      return { scale: 1.15, x: 0, y: 0.06 - p * 0.12, rotation: 0 };
    case "tilt-down":
      return { scale: 1.15, x: 0, y: -0.06 + p * 0.12, rotation: 0 };
    case "drone-orbit":
      return { scale: 1.1 + Math.sin(p * Math.PI) * 0.1, x: Math.sin(p * Math.PI * 2) * 0.04, y: Math.cos(p * Math.PI * 2) * 0.02, rotation: Math.sin(p * Math.PI * 2) * 1.5 };
    case "ken-burns":
      return { scale: 1.05 + p * 0.18, x: -0.04 + p * 0.08, y: -0.03 + p * 0.06, rotation: p * 0.5 };
    case "handheld":
      return { scale: 1.1, x: Math.sin(p * 20) * 0.008, y: Math.cos(p * 15) * 0.006, rotation: Math.sin(p * 12) * 0.4 };
    case "pulse":
      return { scale: 1.0 + Math.abs(Math.sin(p * 8)) * 0.12, x: 0, y: 0, rotation: 0 };
    default:
      return { scale: 1.0, x: 0, y: 0, rotation: 0 };
  }
}

function applyTransitionTransform(
  type: TransitionType,
  prog: number, // 0 to 1
  isEnter: boolean,
  apply: (alpha: number, x: number, y: number, scale: number) => void
) {
  const p = isEnter ? prog : 1 - prog;

  switch (type) {
    case "crossfade":
      apply(p, 0, 0, 1.0);
      break;
    case "wipe-left":
      apply(1.0, isEnter ? (1 - p) : -p, 0, 1.0);
      break;
    case "wipe-right":
      apply(1.0, isEnter ? -(1 - p) : p, 0, 1.0);
      break;
    case "slide-up":
      apply(1.0, 0, isEnter ? (1 - p) : -p, 1.0);
      break;
    case "zoom-in":
      apply(p, 0, 0, isEnter ? 0.7 + p * 0.3 : 1.0 + (1 - p) * 0.5);
      break;
    case "zoom-out":
      apply(p, 0, 0, isEnter ? 1.4 - p * 0.4 : 0.6 + p * 0.4);
      break;
    case "fade-black":
      apply(p, 0, 0, 1.0);
      break;
    case "fade-white":
      apply(p, 0, 0, 1.0);
      break;
    case "glitch":
      apply(p > 0.1 ? (Math.random() > 0.2 ? 1 : 0.4) : 0, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.02, 1.0);
      break;
    case "whip-pan":
      apply(p, isEnter ? (1 - p) * 1.5 : -p * 1.5, 0, 1.0 + (1 - p) * 0.2);
      break;
    default:
      apply(1.0, 0, 0, 1.0);
      break;
  }
}

function applyColorGrading(
  ctx: CanvasRenderingContext2D,
  filter: FilterPreset,
  b = 1,
  c = 1,
  s = 1,
  h = 0
) {
  let filterStr = `brightness(${b * 100}%) contrast(${c * 100}%) saturate(${s * 100}%) hue-rotate(${h}deg)`;

  switch (filter) {
    case "cinematic":
      filterStr += " contrast(120%) saturate(115%) sepia(10%)";
      break;
    case "cyberpunk":
      filterStr += " contrast(135%) saturate(160%) hue-rotate(-15deg)";
      break;
    case "vintage":
      filterStr += " sepia(45%) contrast(95%) brightness(95%)";
      break;
    case "noir":
      filterStr += " grayscale(100%) contrast(150%) brightness(90%)";
      break;
    case "warm":
      filterStr += " sepia(25%) saturate(130%) hue-rotate(-10deg)";
      break;
    case "vibrant":
      filterStr += " saturate(175%) contrast(115%)";
      break;
    case "matrix":
      filterStr += " hue-rotate(85deg) saturate(140%) contrast(125%)";
      break;
    case "dusk":
      filterStr += " hue-rotate(240deg) saturate(130%) contrast(110%)";
      break;
    case "hdr":
      filterStr += " contrast(145%) saturate(140%) brightness(105%)";
      break;
    case "crt":
      filterStr += " contrast(125%) saturate(120%)";
      break;
  }

  ctx.filter = filterStr;
}

function renderTextOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  item: TextOverlay,
  elapsed: number,
  progress: number
) {
  ctx.save();
  ctx.filter = "none"; // Text is crisp and unfiltered

  // Animation values
  let alpha = 1.0;
  let offsetY = 0;
  let scale = 1.0;
  let textToDisplay = item.text;

  if (item.animation === "fade") {
    if (progress < 0.15) alpha = progress / 0.15;
    else if (progress > 0.85) alpha = (1 - progress) / 0.15;
  } else if (item.animation === "typewriter") {
    const charsToShow = Math.min(item.text.length, Math.floor(elapsed * 25));
    textToDisplay = item.text.substring(0, charsToShow);
  } else if (item.animation === "pop") {
    if (progress < 0.15) scale = 0.5 + (progress / 0.15) * 0.5;
  } else if (item.animation === "slide-up") {
    if (progress < 0.15) offsetY = (1 - progress / 0.15) * 30;
  } else if (item.animation === "glow") {
    ctx.shadowColor = item.color || "#ffffff";
    ctx.shadowBlur = 15 + Math.sin(elapsed * 6) * 10;
  }

  // Positioning
  let px = w * 0.5;
  let py = h * 0.85; // default subtitle bottom
  if (item.position === "top") py = h * 0.15;
  else if (item.position === "center") py = h * 0.5;
  else if (item.position === "custom") {
    px = ((item.posX ?? 50) / 100) * w;
    py = ((item.posY ?? 85) / 100) * h;
  }

  py += offsetY;

  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  const fontSizePx = Math.round((item.fontSize / 1080) * h);
  ctx.font = `${item.fontWeight === "900" ? "900" : item.fontWeight === "bold" ? "700" : "500"} ${fontSizePx}px ${item.fontFamily || "sans-serif"}`;
  ctx.textAlign = item.align || "center";
  ctx.textBaseline = "middle";

  const metrics = ctx.measureText(textToDisplay);
  const textWidth = metrics.width;
  const paddingH = 20;
  const paddingV = 10;

  // Background Box (for subtitles or callouts)
  if (item.bgColor) {
    ctx.fillStyle = item.bgColor;
    const boxX = item.align === "left" ? px - paddingH : item.align === "right" ? px - textWidth - paddingH : px - textWidth * 0.5 - paddingH;
    const boxY = py - fontSizePx * 0.6 - paddingV;
    const boxW = textWidth + paddingH * 2;
    const boxH = fontSizePx * 1.2 + paddingV * 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, item.bgRadius || 8);
    ctx.fill();
  }

  // Text Shadow
  if (item.textShadow !== false) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  // Stroke Outline
  if (item.strokeColor && item.strokeWidth) {
    ctx.strokeStyle = item.strokeColor;
    ctx.lineWidth = item.strokeWidth;
    ctx.strokeText(textToDisplay, px, py);
  }

  // Text Fill
  ctx.fillStyle = item.color || "#ffffff";
  ctx.fillText(textToDisplay, px, py);

  ctx.restore();
}

// MediaRecorder Video Export Engine
export async function exportVideo(
  clips: VideoClip[],
  audioClips: any[],
  textOverlays: TextOverlay[],
  aspectRatio: AspectRatio,
  fps: number = 30,
  onProgress?: (progress: number, currentTime: number, totalTime: number) => void
): Promise<Blob> {
  const dims = getResolutionForAspect(aspectRatio, "1080p");
  const canvas = document.createElement("canvas");
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext("2d")!;

  // Preload all media assets
  for (const clip of clips) {
    if (clip.mediaUrl) {
      try {
        await preloadMedia(clip.mediaUrl, "image");
      } catch (err) {
        console.warn("Failed to preload media for export:", err);
      }
    }
  }

  // Calculate total duration
  let maxDuration = 0;
  clips.forEach((c) => {
    maxDuration = Math.max(maxDuration, c.startTime + c.duration);
  });
  textOverlays.forEach((t) => {
    maxDuration = Math.max(maxDuration, t.startTime + t.duration);
  });
  maxDuration = Math.max(maxDuration, 2.0);

  const stream = canvas.captureStream(fps);
  const chunks: Blob[] = [];

  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8000000, // 8 Mbps high quality
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.onerror = (e) => reject(e);

    recorder.start(100);

    const frameDuration = 1 / fps;
    let currentTime = 0;

    const renderStep = () => {
      if (currentTime >= maxDuration) {
        recorder.stop();
        if (onProgress) onProgress(1.0, maxDuration, maxDuration);
        return;
      }

      renderVideoFrame(ctx, canvas.width, canvas.height, currentTime, clips, textOverlays);

      currentTime += frameDuration;
      if (onProgress) {
        onProgress(Math.min(0.99, currentTime / maxDuration), currentTime, maxDuration);
      }

      // Fast render tick
      requestAnimationFrame(renderStep);
    };

    renderStep();
  });
}

export async function exportVideoProject(
  aspectRatio: AspectRatio,
  clips: VideoClip[],
  textOverlays: TextOverlay[],
  audioClips: any[],
  totalDuration: number,
  options: {
    resolution?: "720p" | "1080p" | "4k";
    fps?: 30 | 60;
    format?: "webm" | "mp4";
    quality?: string;
  } = {},
  onProgress?: (progress: number) => void
): Promise<string> {
  const blob = await exportVideo(
    clips,
    audioClips,
    textOverlays,
    aspectRatio,
    options.fps || 30,
    (progress) => {
      if (onProgress) onProgress(progress);
    }
  );
  return URL.createObjectURL(blob);
}

