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
    } else if (musicEnabled && !this.isMusicPlaying) {
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

  // 1. เพิ่มเอฟเฟกต์เสียงต่อย/โจมตี (ปุ่ม P) - เสียงกระแทกสั้น ดุดัน
  public playAttack() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    // ความถี่วูบลงอย่างรวดเร็วให้ความรู้สึกเหมือนการปะทะ (Impact)
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // 2. เพิ่มเอฟเฟกต์เสียงสกิลระเบิดพลังวงแหวน (ปุ่ม O) - เสียงชาร์จกระจายเบสแน่น
  public playSkillRing() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    // ความถี่ไล่ขึ้นเลียนแบบการขยายตัวของวงแหวนเวทย์
    osc.frequency.linearRampToValueAtTime(350, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  public playCollect() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); 
    osc1.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); 

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.04); 
    osc2.frequency.setValueAtTime(1046.50, this.ctx.currentTime + 0.12); 

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
    const context = this.ctx; // ล็อกอินสแตนซ์ป้องกันความคลุมเครือในลูป
    if (!context) return;

    const now = context.currentTime;
    const notes = [293.66, 277.18, 261.63, 220.00]; 
    
    notes.forEach((freq, i) => {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      gain.gain.setValueAtTime(this.volume * 0.25, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);

      osc.connect(gain);
      gain.connect(context.destination);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.3);
    });
  }

  public playWin() {
    if (!this.soundEnabled) return;
    this.init();
    const context = this.ctx; // ล็อกอินสแตนซ์ป้องกันความคลุมเครือในลูป
    if (!context) return;

    const now = context.currentTime;
    const notes = [440.00, 554.37, 659.25, 880.00]; 
    
    notes.forEach((freq, i) => {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(this.volume * 0.2, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(context.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }

  public startMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    this.init();
    if (!this.ctx) return;

    // เคลียร์ Interval เก่าออกก่อนเสมอเพื่อกันเสียงทับซ้อนกันซ้ำ ๆ
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
    }

    this.isMusicPlaying = true;
    let step = 0;
    
    const bassline = [110, 110, 130.81, 146.83, 164.81, 164.81, 196.00, 220.00]; 
    const leadPattern = [
      440, 0, 440, 523.25, 587.33, 0, 659.25, 783.99,
      0, 880, 783.99, 659.25, 0, 587.33, 523.25, 440
    ];

    const tick = () => {
      if (!this.isMusicPlaying || !this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = this.volume * 0.12;

      // 1. Kick/Beat
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

      // 2. Hat
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
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      bassGain.connect(filter);
      filter.connect(this.ctx.destination);
      
      bassOsc.start(now);
      bassOsc.stop(now + 0.25);

      // 4. Phin (Thai lute) lead melody
      const leadNote = leadPattern[step % leadPattern.length];
      if (leadNote > 0 && Math.random() > 0.3) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadNote, now);
        leadOsc.frequency.linearRampToValueAtTime(leadNote + 10, now + 0.1);
        leadOsc.frequency.linearRampToValueAtTime(leadNote - 10, now + 0.2);

        leadGain.gain.setValueAtTime(vol * 0.25, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        leadOsc.connect(leadGain);
        
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

    const bpmInterval = 230; 
    this.musicInterval = setInterval(tick, bpmInterval);
    tick();
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
