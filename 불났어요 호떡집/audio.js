/**
 * audio.js - Web Audio API Synthesizer for "불났어요 호떡집"
 * High quality, dependency-free audio effects and cozy market synth music.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.bgmEnabled = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  toggleBgm() {
    this.init();
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.bgmEnabled;
  }

  // --- Sound Effects ---

  // 1. Generic Click / Select
  playClick() {
    if (!this.soundEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 2. Ingredient Added Pop
  playIngredientAdd() {
    if (!this.soundEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    const freqs = [440, 523.25, 587.33, 659.25, 783.99];
    const f = freqs[Math.floor(Math.random() * freqs.length)];
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.1);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 3. Hotteok Sizzling Cook Sound
  playSizzle() {
    if (!this.soundEnabled || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1600;
    filter.Q.value = 2.5;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // 4. Hotteok Finished Cooked Bell
  playCookSuccess() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1174.66, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // 5. Customer Served & Happy
  playCustomerHappy() {
    if (!this.soundEnabled || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // 6. Customer Left / Timeout Penalty
  playCustomerAngry() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 7. Mystery '?' Lucky Bonus Ding
  playLuckyBonus() {
    if (!this.soundEnabled || !this.ctx) return;
    const notes = [659.25, 880, 1174.66, 1318.51, 1567.98];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.28, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // 8. Stage Clear Fanfare
  playStageClear() {
    if (!this.soundEnabled || !this.ctx) return;
    const melody = [
      { f: 523.25, d: 0.12 }, // C
      { f: 659.25, d: 0.12 }, // E
      { f: 783.99, d: 0.12 }, // G
      { f: 1046.50, d: 0.35 } // C6
    ];
    let curTime = this.ctx.currentTime;

    melody.forEach(m => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(m.f, curTime);

      gain.gain.setValueAtTime(0.3, curTime);
      gain.gain.exponentialRampToValueAtTime(0.001, curTime + m.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(curTime);
      osc.stop(curTime + m.d);

      curTime += m.d * 0.9;
    });
  }

  // 9. Game Over Sad Tune
  playGameOver() {
    if (!this.soundEnabled || !this.ctx) return;
    const notes = [
      { f: 392.00, d: 0.25 }, // G4
      { f: 369.99, d: 0.25 }, // F#4
      { f: 349.23, d: 0.25 }, // F4
      { f: 311.13, d: 0.55 }  // Eb4
    ];
    let curTime = this.ctx.currentTime;

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, curTime);

      gain.gain.setValueAtTime(0.3, curTime);
      gain.gain.exponentialRampToValueAtTime(0.001, curTime + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(curTime);
      osc.stop(curTime + n.d);

      curTime += n.d * 0.9;
    });
  }

  // 10. Grand 100 Stage Victory
  playGrandEnding() {
    if (!this.soundEnabled || !this.ctx) return;
    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880.00],
      [659.25, 830.61, 987.77],
      [783.99, 987.77, 1174.66, 1567.98]
    ];
    let curTime = this.ctx.currentTime;

    chords.forEach((chord, i) => {
      const dur = i === chords.length - 1 ? 1.0 : 0.25;
      chord.forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, curTime);

        gain.gain.setValueAtTime(0.2, curTime);
        gain.gain.exponentialRampToValueAtTime(0.001, curTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(curTime);
        osc.stop(curTime + dur);
      });
      curTime += dur * 0.85;
    });
  }

  // --- Background Cozy Market Music (Light synth loop) ---
  startBgm() {
    if (this.bgmTimer) clearInterval(this.bgmTimer);
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const pattern = [0, 2, 4, 3, 2, 0, 4, 5, 4, 2, 1, 0, 3, 2, 4, 2];

    this.bgmStep = 0;
    this.bgmTimer = setInterval(() => {
      if (!this.bgmEnabled || !this.ctx) return;
      const noteIdx = pattern[this.bgmStep % pattern.length];
      const freq = pentatonic[noteIdx];
      this.bgmStep++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }, 280);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// Global instance
window.soundSystem = new SoundSystem();
