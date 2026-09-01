/**
 * Web Audio Synthesizer for NirbhayaVision Fail-Safe Alerts
 * Generates warning chimes, urgent sirens, and security audio deterrents
 */

class AudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeOscillator: OscillatorNode | null = null;

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopContinuousAlert();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Stage 1 Warning: Soft double chime
   */
  public playStage1Warning() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.15); // A5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  /**
   * Stage 2 Warning: Urgent pulse beeps
   */
  public playStage2Warning() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
      const startTime = now + i * 0.18;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, startTime);
      osc.frequency.linearRampToValueAtTime(1100, startTime + 0.08);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    }
  }

  /**
   * Stage 3 & 4: Continuous fail-safe warble siren
   */
  public startContinuousSiren() {
    if (this.isMuted) return;
    this.stopContinuousAlert();
    this.initContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    const now = this.audioCtx.currentTime;

    // Siren LFO
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(2.5, now); // 2.5Hz modulation
    lfoGain.gain.setValueAtTime(300, now);

    osc.frequency.setValueAtTime(750, now);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.2, now);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    lfo.start(now);
    osc.start(now);

    this.activeOscillator = osc;
  }

  public stopContinuousAlert() {
    if (this.activeOscillator) {
      try {
        this.activeOscillator.stop();
        this.activeOscillator.disconnect();
      } catch (e) {
        // Ignore
      }
      this.activeOscillator = null;
    }
  }

  /**
   * Audio Deterrent Speaker Announcement
   */
  public playAudioDeterrentVoice() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = "Security Alert. You are under live AI video surveillance. Campus police and rapid response team have been dispatched to this location.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const alertAudio = new AudioSynthesizer();
