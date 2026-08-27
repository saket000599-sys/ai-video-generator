// Client-Side AI Service Connector

export interface EnhancePromptResult {
  enhancedPrompt: string;
  cameraMotion: string;
  suggestedDuration: number;
  suggestedFilter: string;
  visualDescription?: string;
  tags?: string[];
}

export interface StoryboardResponse {
  title: string;
  concept: string;
  style: string;
  totalDuration: number;
  musicVibe?: string;
  scenes: Array<{
    sceneNumber: number;
    title: string;
    prompt: string;
    duration: number;
    cameraMotion: string;
    transition: string;
    filter: string;
    voiceoverText: string;
    subtitleText: string;
    proceduralType?: string;
  }>;
}

export async function checkServerStatus(): Promise<{ hasApiKey: boolean }> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return { hasApiKey: false };
    const data = await res.json();
    return { hasApiKey: !!data.hasApiKey };
  } catch {
    return { hasApiKey: false };
  }
}

export async function enhancePromptWithAI(
  prompt: string,
  style = "cinematic",
  cameraMotion = "dynamic"
): Promise<EnhancePromptResult> {
  const res = await fetch("/api/ai/enhance-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style, cameraMotion }),
  });

  if (!res.ok) {
    throw new Error(`Failed to enhance prompt: ${res.statusText}`);
  }

  return res.json();
}

export async function generateStoryboardWithAI(
  topic: string,
  style = "cinematic",
  targetDuration = 16,
  sceneCount = 4,
  aspectRatio = "16:9",
  includeVoiceover = true
): Promise<StoryboardResponse> {
  const res = await fetch("/api/ai/generate-storyboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic,
      style,
      targetDuration,
      sceneCount,
      aspectRatio,
      includeVoiceover,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate storyboard: ${res.statusText}`);
  }

  return res.json();
}

export async function generateKeyframeImageWithAI(
  prompt: string,
  aspectRatio = "16:9"
): Promise<{ imageUrl: string }> {
  const res = await fetch("/api/ai/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to generate image`);
  }

  return res.json();
}

export async function generateTTSWithAI(
  text: string,
  voiceName = "Kore"
): Promise<{ audioBase64?: string; useBrowserSpeech?: boolean; voiceName: string; text: string }> {
  const res = await fetch("/api/ai/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceName }),
  });

  if (!res.ok) {
    return { useBrowserSpeech: true, voiceName, text };
  }

  return res.json();
}

export async function generateCaptionsWithAI(
  prompt: string,
  style = "cinematic"
): Promise<{ captions: Array<{ text: string; startTime: number; duration: number }> }> {
  const res = await fetch("/api/ai/generate-captions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate captions`);
  }

  return res.json();
}
