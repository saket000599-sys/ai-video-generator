import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Prompt Enhancer & Camera Director
app.post("/api/ai/enhance-prompt", async (req, res) => {
  try {
    const { prompt, style = "cinematic", cameraMotion = "dynamic" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return high quality fallback prompt
      return res.json({
        enhancedPrompt: `${prompt}, ${style} aesthetic, ultra high definition 4K, 35mm cinematic lens, beautiful lighting, highly detailed texture, motion blur, smooth ${cameraMotion} camera movement, photorealistic atmosphere`,
        cameraMotion,
        suggestedDuration: 4,
        suggestedFilter: style === "cyberpunk" ? "cyberpunk" : style === "vintage" ? "vintage" : "cinematic",
        tags: [style, cameraMotion, "4k", "ai-video"],
      });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are an expert Hollywood cinematographer and AI video prompt engineer.
Analyze the user's simple prompt and output a JSON object to generate a stunning video clip.
User prompt: "${prompt}"
Desired Visual Style: "${style}"
Camera Motion: "${cameraMotion}"

Respond ONLY with valid JSON matching this schema:
{
  "enhancedPrompt": "Extremely detailed, visually descriptive prompt with lighting, atmosphere, lens type, camera angles, color grading and motion details",
  "cameraMotion": "e.g. Slow Dolly In, Wide Drone Orbit, Smooth Pan Right, Low Angle Tracking",
  "suggestedDuration": 4,
  "suggestedFilter": "cinematic" | "cyberpunk" | "vintage" | "noir" | "warm" | "vibrant" | "matrix" | "none",
  "visualDescription": "1-2 sentence description of what happens in the scene",
  "tags": ["tag1", "tag2", "tag3"]
}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Enhance prompt error:", error);
    res.status(500).json({
      error: error.message || "Failed to enhance prompt",
      fallback: {
        enhancedPrompt: `${req.body.prompt || "cinematic shot"}, high quality 4k video render, smooth motion, atmospheric lighting`,
        suggestedDuration: 4,
        suggestedFilter: "cinematic",
      },
    });
  }
});

// 2. AI Multi-Scene Storyboard & Video Sequence Generator
app.post("/api/ai/generate-storyboard", async (req, res) => {
  try {
    const {
      topic,
      style = "cinematic",
      targetDuration = 16,
      sceneCount = 4,
      aspectRatio = "16:9",
      includeVoiceover = true,
    } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic/concept is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      // High quality structured fallback
      const scenes = [
        {
          sceneNumber: 1,
          title: "The Awakening",
          prompt: `Cinematic wide establishing shot of ${topic}, dramatic sunrise lighting, volumetric golden rays, 8k resolution, photorealistic`,
          duration: 4,
          cameraMotion: "Slow Pan Right",
          transition: "crossfade",
          filter: "cinematic",
          voiceoverText: `In a world defined by change, the journey of ${topic} begins.`,
          subtitleText: "The journey begins...",
        },
        {
          sceneNumber: 2,
          title: "Ascension & Exploration",
          prompt: `Dynamic medium close-up tracking shot showing vibrant motion and energy around ${topic}, shallow depth of field, neon specular highlights`,
          duration: 4,
          cameraMotion: "Dolly Zoom In",
          transition: "slide-left",
          filter: "vibrant",
          voiceoverText: "Every moment pushes the boundaries of imagination and innovation.",
          subtitleText: "Pushing boundaries of imagination.",
        },
        {
          sceneNumber: 3,
          title: "The Climax",
          prompt: `High-octane low-angle dramatic view of ${topic}, swirling atmospheric particles, rim lighting, lens flare, cinematic intensity`,
          duration: 4,
          cameraMotion: "Low Angle Orbit",
          transition: "wipe",
          filter: "cyberpunk",
          voiceoverText: "Unleashing unprecedented visual power directly into reality.",
          subtitleText: "Unleashing unprecedented visual power.",
        },
        {
          sceneNumber: 4,
          title: "The Horizon",
          prompt: `Epic aerial drone pullback shot overlooking ${topic} against a vast cinematic horizon, twilight twilight atmosphere, peaceful resolution`,
          duration: 4,
          cameraMotion: "Drone Pull Back",
          transition: "fade-black",
          filter: "warm",
          voiceoverText: "Experience the next evolution of storytelling today.",
          subtitleText: "The future is here.",
        },
      ];

      return res.json({
        title: `Cinematic: ${topic}`,
        concept: topic,
        style,
        totalDuration: 16,
        aspectRatio,
        scenes,
      });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are an award-winning film director and video editor. Create a complete, cohesive multi-scene video sequence and storyboard for an AI video editor.
User Topic/Concept: "${topic}"
Visual Style: "${style}"
Target Total Duration: ${targetDuration} seconds
Approx Scene Count: ${sceneCount}
Aspect Ratio: "${aspectRatio}"
Include Voiceover: ${includeVoiceover}

Generate a JSON object with:
{
  "title": "Short catchy project title",
  "concept": "Concept overview",
  "style": "${style}",
  "totalDuration": ${targetDuration},
  "musicVibe": "e.g. Synthwave energetic / Orchestral emotional / Chill lofi beat / Epic Trailer",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene Name",
      "prompt": "Detailed AI video generation prompt for this exact clip with camera framing, lighting, motion, and visual details",
      "duration": 4, // in seconds
      "cameraMotion": "Slow Pan Right" | "Dolly Zoom In" | "Drone Orbit" | "Tilt Up" | "Static Telephoto" | "Handheld Drift",
      "transition": "crossfade" | "wipe" | "slide-left" | "zoom-in" | "glitch" | "fade-black",
      "filter": "cinematic" | "cyberpunk" | "vintage" | "noir" | "warm" | "vibrant" | "matrix",
      "voiceoverText": "Narration text for this scene (10-15 words)",
      "subtitleText": "Short on-screen caption (3-7 words)"
    }
  ]
}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Generate storyboard error:", error);
    res.status(500).json({ error: error.message || "Failed to generate storyboard" });
  }
});

// 3. AI Keyframe / Scene Image Generation via Gemini 3.1 Flash Lite Image
app.post("/api/ai/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured",
      });
    }

    const ai = getAI();
    // Validate aspect ratio
    const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : "16:9";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          {
            text: `High cinematic quality, professional 4K video frame capture: ${prompt}. Photorealistic, masterpiece lighting, no text watermarks.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: chosenRatio as any,
        },
      },
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "No image was returned by the AI model" });
    }

    res.json({ imageUrl, prompt });
  } catch (error: any) {
    console.error("Generate image error:", error);
    res.status(500).json({ error: error.message || "Image generation failed" });
  }
});

// 4. AI Voiceover TTS via Gemini TTS
app.post("/api/ai/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        useBrowserSpeech: true,
        text,
        voiceName,
      });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Narrate smoothly and cinematically: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName as any },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioBase64) {
      res.json({
        audioBase64,
        sampleRate: 24000,
        text,
        voiceName,
      });
    } else {
      res.json({
        useBrowserSpeech: true,
        text,
        voiceName,
      });
    }
  } catch (error: any) {
    console.error("TTS generation error:", error);
    // Graceful fallback to browser speech synthesis
    res.json({
      useBrowserSpeech: true,
      text: req.body.text,
      voiceName: req.body.voiceName || "Kore",
      error: error.message,
    });
  }
});

// 5. AI Script & Caption Assistant
app.post("/api/ai/generate-captions", async (req, res) => {
  try {
    const { prompt, style = "cinematic" } = req.body;
    const ai = getAI();

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        captions: [
          { text: "IN A WORLD OF INFINITE POSSIBILITIES", startTime: 0, duration: 3 },
          { text: "CREATIVITY KNOWS NO BOUNDARIES", startTime: 3.5, duration: 3.5 },
          { text: "EXPERIENCE THE FUTURE OF VIDEO", startTime: 7.5, duration: 4 },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Generate 3-5 punchy on-screen caption titles for a video about: "${prompt}". Style: ${style}.
Return JSON:
{
  "captions": [
    { "text": "SHORT PUNCHY ALL-CAPS OR TITLE", "startTime": 0, "duration": 3 },
    { "text": "NEXT STATEMENT", "startTime": 3.5, "duration": 3 }
  ]
}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate captions" });
  }
});

// 6. Veo Video Generation API (with status & download)
app.post("/api/generate-video", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", resolution = "720p" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY is required for direct video generation" });
    }

    const ai = getAI();
    const operation = await ai.models.generateVideos({
      model: "veo-3.1-lite-generate-preview",
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution as any,
        aspectRatio: aspectRatio as any,
      },
    });

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error("Veo video generation error:", error);
    res.status(500).json({ error: error.message || "Video generation failed" });
  }
});

app.post("/api/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "operationName is required" });
    }

    const ai = getAI();
    // Reconstruct minimal operation object
    const op = { name: operationName } as any;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ done: updated.done, error: updated.error });
  } catch (error: any) {
    console.error("Video status error:", error);
    res.status(500).json({ error: error.message || "Status check failed" });
  }
});

// Setup Vite middleware for development and static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Video Editor Server running on http://localhost:${PORT}`);
  });
}

startServer();
