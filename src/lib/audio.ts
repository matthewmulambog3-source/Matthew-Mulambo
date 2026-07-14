/**
 * Procedural Fireplace / Candle Wick Crackle Synthesizer
 * Uses the Web Audio API to generate low-end fire rumble and random wooden wick snap impulses.
 */

export class FireplaceSynthesizer {
  private audioCtx: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private roarGain: GainNode | null = null;
  private crackleGain: GainNode | null = null;
  private sources: AudioNode[] = [];
  private isPlaying: boolean = false;
  private volume: number = 0.5;

  constructor() {
    // Lazy initialize to avoid running on page load (violating browser autoplay policies)
  }

  private init() {
    if (this.audioCtx) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    
    // Main Volume Control
    this.mainGain = this.audioCtx.createGain();
    this.mainGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    this.mainGain.connect(this.audioCtx.destination);

    // Roar/Rumble Gain
    this.roarGain = this.audioCtx.createGain();
    this.roarGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
    this.roarGain.connect(this.mainGain);

    // Crackle Gain
    this.crackleGain = this.audioCtx.createGain();
    this.crackleGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
    this.crackleGain.connect(this.mainGain);
  }

  /**
   * Generates a buffer of brown noise (deeper white noise).
   */
  private createBrownNoiseBuffer(): AudioBuffer {
    if (!this.audioCtx) throw new Error("AudioContext not initialized");
    
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise formula: accumulate and decay white noise
      output[i] = (lastOut + (0.02 * white)) / 1.002;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }
    
    return noiseBuffer;
  }

  /**
   * Starts synthesizing the cozy crackling fire sound.
   */
  public start() {
    if (this.isPlaying) return;
    
    try {
      this.init();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      this.isPlaying = true;
      this.sources = [];

      // 1. Create Fire Rumble (Low Brown Noise with slow modulation)
      const brownNoiseBuffer = this.createBrownNoiseBuffer();
      const rumbleSource = this.audioCtx.createBufferSource();
      rumbleSource.buffer = brownNoiseBuffer;
      rumbleSource.loop = true;

      const rumbleFilter = this.audioCtx.createBiquadFilter();
      rumbleFilter.type = "lowpass";
      rumbleFilter.frequency.setValueAtTime(95, this.audioCtx.currentTime);
      rumbleFilter.Q.setValueAtTime(1.0, this.audioCtx.currentTime);

      // Modulator (LFO) for breathing fire intensity
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, this.audioCtx.currentTime); // 0.2 Hz (slow sweep)
      
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(15, this.audioCtx.currentTime); // sweep range in Hz

      lfo.connect(lfoGain);
      lfoGain.connect(rumbleFilter.frequency); // modulate cutoff frequency

      rumbleSource.connect(rumbleFilter);
      rumbleFilter.connect(this.roarGain!);

      lfo.start();
      rumbleSource.start();

      this.sources.push(rumbleSource);
      this.sources.push(lfo);

      // 2. Start Crackling Firewood Snaps (Procedural dynamic spikes)
      this.scheduleCrackles();
    } catch (error) {
      console.error("Failed to start sound synthesis:", error);
    }
  }

  /**
   * Repeatedly schedules organic crackle/snap sound impulses at random intervals.
   */
  private scheduleCrackles() {
    if (!this.isPlaying || !this.audioCtx || !this.crackleGain) return;

    // Create a very brief high-frequency pop
    const now = this.audioCtx.currentTime;
    
    // Create single short buffer for the spike
    const sampleRate = this.audioCtx.sampleRate;
    const dur = 0.005 + Math.random() * 0.015; // 5ms - 20ms
    const numSamples = Math.floor(sampleRate * dur);
    const buffer = this.audioCtx.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    // Fill buffer with an exponential decay spike
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 220); // rapid decay
      // Combine white noise with a sharp pop curve
      const noise = (Math.random() * 2 - 1) * 0.2;
      const spike = Math.sin(t * 1200) * 0.8;
      data[i] = (noise + spike) * decay;
    }

    const crackleSource = this.audioCtx.createBufferSource();
    crackleSource.buffer = buffer;

    // Crackle filter to make it sound sharp and woody
    const bandpass = this.audioCtx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1500 + Math.random() * 2000, now); // sharp crackle freq
    bandpass.Q.setValueAtTime(3.0, now);

    crackleSource.connect(bandpass);
    bandpass.connect(this.crackleGain);
    crackleSource.start(now);

    // Schedule next crackle organically (between 40ms and 1400ms)
    // We vary between high frequency small crackles and occasional large pops
    const rand = Math.random();
    let nextDelay = 50 + Math.random() * 400; // default medium rate
    if (rand < 0.15) {
      nextDelay = 10 + Math.random() * 40; // fast micro crackles
    } else if (rand > 0.85) {
      nextDelay = 600 + Math.random() * 1000; // sporadic deep pops
    }

    setTimeout(() => {
      this.scheduleCrackles();
    }, nextDelay);
  }

  /**
   * Changes the output volume.
   * @param vol level from 0.0 to 1.0
   */
  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.mainGain && this.audioCtx) {
      this.mainGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  /**
   * Stops the synthesis.
   */
  public stop() {
    this.isPlaying = false;
    for (const src of this.sources) {
      try {
        (src as any).stop();
      } catch (e) {}
    }
    this.sources = [];
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      // Suspend rather than close entirely to easily resume
      this.audioCtx.suspend();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
