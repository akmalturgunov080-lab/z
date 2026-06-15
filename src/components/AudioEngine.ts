class AudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;

  constructor() {
    // Lazy initialize on first user action to comply with browser autoplay policies
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn("AudioContext init failed:", e);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.ctx) {
      this.ctx.suspend();
    } else if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCoin() {
    this.init();
    if (!this.ctx || this.muted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    // Classic retro double-ping for a coin
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.setValueAtTime(1318, now + 0.08); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  playMegaCoin() {
    this.init();
    if (!this.ctx || this.muted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const notes = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6 (Arpeggio)
    
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.45);
    });
  }

  playHeal() {
    this.init();
    if (!this.ctx || this.muted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.setValueAtTime(987.77, now + 0.1); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.2); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  playCrash() {
    this.init();
    if (!this.ctx || this.muted) return;
    this.resume();

    const now = this.ctx.currentTime;
    
    // Low rumble oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(10, now + 0.4);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.45);

    // Create a bit of white noise burst
    try {
      const bufferSize = this.ctx.sampleRate * 0.3; // 300ms of noise
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(400, now);
      noiseFilter.frequency.linearRampToValueAtTime(80, now + 0.3);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.35);
    } catch (e) {
      // Background noise buffer creation error fallback
    }
  }

  playUpgrade() {
    this.init();
    if (!this.ctx || this.muted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const scale = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    scale.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }

  playSiren(pitchHigh: boolean) {
    this.init();
    if (!this.ctx || this.muted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    const frequency = pitchHigh ? 880 : 660; // siren dual pitch
    
    osc.frequency.setValueAtTime(frequency, now);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  startEngineSound() {
    this.init();
    if (!this.ctx || this.muted) return;
    if (this.engineOsc) return;

    try {
      this.resume();
      const now = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(50, now);

      // Lowpass filter to make it sound rumblier like a real motor rather than buzzing
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, now);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineGain.gain.setValueAtTime(0.03, now);
      this.engineOsc.start(now);
    } catch (e) {
      console.warn("Could not start engine sound", e);
    }
  }

  updateEngineSound(speedRatio: number) {
    if (!this.ctx || this.muted || !this.engineOsc) return;
    const now = this.ctx.currentTime;
    // Base pitch 40Hz up to 130Hz depending on travel speed
    const pitch = 40 + Math.min(speedRatio, 1) * 90;
    this.engineOsc.frequency.setTargetAtTime(pitch, now, 0.1);
  }

  stopEngineSound() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (e) {}
      this.engineOsc = null;
    }
    if (this.engineGain) {
      this.engineGain.disconnect();
      this.engineGain = null;
    }
  }

  playGameOver() {
    this.init();
    if (!this.ctx || this.muted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const notes = [440, 392, 349.23, 293.66, 220]; // descending sadness A4, G4, F4, D4, A3
    
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0.12, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.4);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.45);
    });
  }
}

export const audioEngine = new AudioEngine();
