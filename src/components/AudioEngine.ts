// Audio Engine using Web Audio API to synthesize sound effects and dynamic music
class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private isMusicPlaying = false;
  private volume: number = 0.5; // 0.0 to 1.0
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSettings(soundEnabled: boolean, musicEnabled: boolean, volume: number) {
    this.soundEnabled = soundEnabled;
    this.musicEnabled = musicEnabled;
    this.volume = volume / 100;

    if (!musicEnabled && this.isMusicPlaying) {
      this.stopMusic();
    } else if (musicEnabled && !this.isMusicPlaying && this.ctx) {
      this.startMusic();
    }
  }

  public playSelect() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playJump() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playCollect() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc1.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.04); // G5
    osc2.frequency.setValueAtTime(1046.50, this.ctx.currentTime + 0.12); // C6

    gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.25);
    osc2.stop(this.ctx.currentTime + 0.25);
  }

  public playShoot() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playHurt() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playGameOver() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [293.66, 277.18, 261.63, 220.00]; // D4, C#4, C4, A3
    
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      gain.gain.setValueAtTime(this.volume * 0.25, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.3);
    });
  }

  public playWin() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440.00, 554.37, 659.25, 880.00]; // A4, C#5, E5, A5
    
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(this.volume * 0.2, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }

  public startMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    this.init();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    let step = 0;
    
    // Simple Mor Lam (หมอลำ) inspired 8-step bass/synth rhythm
    // Mor Lam is pentatonic: A, C, D, E, G
    const bassline = [110, 110, 130.81, 146.83, 164.81, 164.81, 196.00, 220.00]; // A2, A2, C3, D3, E3, E3, G3, A3
    const leadPattern = [
      440, 0, 440, 523.25, 587.33, 0, 659.25, 783.99,
      0, 880, 783.99, 659.25, 0, 587.33, 523.25, 440
    ];

    const tick = () => {
      if (!this.isMusicPlaying || !this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = this.volume * 0.12;

      // 1. Kick/Beat (Every 2 steps)
      if (step % 2 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(120, now);
        kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.15);
        kickGain.gain.setValueAtTime(vol * 1.5, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.start(now);
        kickOsc.stop(now + 0.15);
      }

      // 2. Hat (Every step)
      const hatOsc = this.ctx.createOscillator();
      const hatGain = this.ctx.createGain();
      hatOsc.type = 'triangle';
      hatOsc.frequency.setValueAtTime(10000, now);
      hatGain.gain.setValueAtTime(step % 4 === 2 ? vol * 0.4 : vol * 0.15, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      hatOsc.connect(hatGain);
      hatGain.connect(this.ctx.destination);
      hatOsc.start(now);
      hatOsc.stop(now + 0.04);

      // 3. Bass line
      const bassNote = bassline[step % bassline.length];
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassNote, now);
      bassGain.gain.setValueAtTime(vol * 0.6, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      bassOsc.connect(bassGain);
      // Low pass filter for warm bass
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      bassGain.connect(filter);
      filter.connect(this.ctx.destination);
      
      bassOsc.start(now);
      bassOsc.stop(now + 0.25);

      // 4. Cheerful Phin (Thai lute) lead melody
      const leadNote = leadPattern[step % leadPattern.length];
      if (leadNote > 0 && Math.random() > 0.3) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadNote, now);
        // Subtle vibrato (Phin style)
        leadOsc.frequency.linearRampToValueAtTime(leadNote + 10, now + 0.1);
        leadOsc.frequency.linearRampToValueAtTime(leadNote - 10, now + 0.2);

        leadGain.gain.setValueAtTime(vol * 0.25, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        leadOsc.connect(leadGain);
        
        // High pass & Band pass filter for a crisp string sound
        const phinFilter = this.ctx.createBiquadFilter();
        phinFilter.type = 'bandpass';
        phinFilter.frequency.setValueAtTime(1000, now);
        phinFilter.Q.setValueAtTime(1.0, now);
        leadGain.connect(phinFilter);
        phinFilter.connect(this.ctx.destination);

        leadOsc.start(now);
        leadOsc.stop(now + 0.25);
      }

      step++;
    };

    // Run interval around 130 BPM (approx 230ms per step)
    const bpmInterval = 230; 
    this.musicInterval = setInterval(tick, bpmInterval);
    tick(); // play first tick immediately
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new AudioEngine();
