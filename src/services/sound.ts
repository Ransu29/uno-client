class SoundService {
  private ctx: AudioContext | null = null;
  private enabled = false;

  constructor() {
    // Try to init context interaction
    window.addEventListener('click', () => this.init(), { once: true });
  }

  private init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.enabled = true;
  }

  // Helper to make a beep
  private playTone(freq: number, type: OscillatorType, duration: number) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playPlayCard() {
    this.playTone(600, 'sine', 0.1); // High blip
  }

  playDraw() {
    this.playTone(400, 'triangle', 0.1); // Lower blip
  }

  playUno() {
    // Double beep
    this.playTone(800, 'square', 0.1);
    setTimeout(() => this.playTone(1200, 'square', 0.2), 100);
  }

  playError() {
    this.playTone(150, 'sawtooth', 0.3); // Buzz
  }

  playTurnStart() {
    this.playTone(500, 'sine', 0.5); // Soft chime
  }
}

export const soundService = new SoundService();