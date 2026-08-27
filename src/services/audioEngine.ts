// Multi-Track Web Audio Synthesizer & Playback Engine

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private activeNodes: { stop: () => void }[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getAudioContext(): AudioContext | null {
    this.initContext();
    return this.ctx;
  }

  public getDestination(): MediaStreamAudioDestinationNode | null {
    this.initContext();
    if (!this.ctx) return null;
    const dest = this.ctx.createMediaStreamDestination();
    this.masterGain?.connect(dest);
    return dest;
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, vol));
    }
  }

  public stopAll() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {}
    });
    this.activeNodes = [];
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Play Sound Effects
  public playSFX(synthPreset: string, volume = 0.7) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.8, t);
    gainNode.connect(this.masterGain);

    if (synthPreset === "whoosh-trans") {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.exponentialRampToValueAtTime(3200, t + 0.3);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.7);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.7);

      gainNode.gain.setValueAtTime(0.01, t);
      gainNode.gain.linearRampToValueAtTime(volume, t + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      osc.connect(filter);
      filter.connect(gainNode);
      osc.start(t);
      osc.stop(t + 0.7);
    } else if (synthPreset === "sub-boom") {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.8);

      gainNode.gain.setValueAtTime(volume, t);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gainNode);
      osc.start(t);
      osc.stop(t + 1.2);
    } else if (synthPreset === "glitch-hit") {
      const osc = this.ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(980, t);
      osc.frequency.setValueAtTime(240, t + 0.05);
      osc.frequency.setValueAtTime(1400, t + 0.1);
      osc.frequency.setValueAtTime(120, t + 0.15);

      gainNode.gain.setValueAtTime(volume, t);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gainNode);
      osc.start(t);
      osc.stop(t + 0.3);
    }
  }

  // Play Procedural Music Step at currentTime in timeline
  public playMusicTick(synthPreset: string, timelineTime: number, volume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const beat = Math.floor(timelineTime * 2); // 120 bpm eighth notes

    if (synthPreset === "cyber-pulse") {
      // Bass synth note
      const notes = [55, 55, 65.4, 55, 73.4, 55, 49, 55]; // A1, C2, D2, G1 bassline
      const freq = notes[beat % notes.length];

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const noteGain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.2);

      noteGain.gain.setValueAtTime(volume * 0.6, t);
      noteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.25);
    } else if (synthPreset === "cosmic-horizon") {
      // Ethereal chord pad
      const chords = [
        [220, 261.6, 329.6], // Am
        [174.6, 220, 261.6], // F
        [261.6, 329.6, 392.0], // C
        [196.0, 246.9, 293.7], // G
      ];
      const chordIndex = Math.floor(timelineTime / 4) % chords.length;
      const currentChord = chords[chordIndex];

      currentChord.forEach((f) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, t);

        noteGain.gain.setValueAtTime(volume * 0.15, t);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.45);
      });
    }
  }

  // Play Voiceover Narration via Web Speech API or Base64
  public playVoiceover(text: string, voiceName = "Kore", onEnd?: () => void) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = voiceName === "Puck" ? 1.2 : voiceName === "Zephyr" ? 1.05 : 0.92;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
    ) || voices[0];

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }
}

export const audioEngine = new AudioEngine();
