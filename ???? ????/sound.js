// ==========================================
// MoaMoa Fruit Shop - Audio Synthesizer Engine
// Web Audio API 기반 완전 무외부의존 사운드 시스템
// ==========================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
    }
    return this.isMuted;
  }

  // 과일 선택/탭 소리 (상큼하고 가벼운 틱)
  playSelect() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // 과일 스왑 소리 (부드러운 쉬익)
  playSwap() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // 매치 팝 소리 (콤보 단계에 따라 피치 상승)
  playPop(combo = 1) {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 440 + Math.min(combo * 60, 600);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // 콤보 팡파레
  playCombo() {
    if (this.isMuted) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      }, i * 60);
    });
  }

  // 물폭탄 폭발 소리 (시원한 물줄기와 버블 쾅)
  playWaterBomb() {
    if (this.isMuted) return;
    this.init();
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    whiteNoise.stop(this.ctx.currentTime + 0.35);

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(400 + i * 200, this.ctx.currentTime);
        bOsc.frequency.exponentialRampToValueAtTime(900 + i * 300, this.ctx.currentTime + 0.08);
        bGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        bGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        bOsc.connect(bGain);
        bGain.connect(this.masterGain);
        bOsc.start();
        bOsc.stop(this.ctx.currentTime + 0.08);
      }, i * 50);
    }
  }

  // 얼음 깨짐 사운드 (쨍그랑)
  playIceCrack() {
    if (this.isMuted) return;
    this.init();
    const freqs = [1200, 1800, 2400];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.02);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.02 + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + idx * 0.02);
      osc.stop(this.ctx.currentTime + idx * 0.02 + 0.12);
    });
  }

  // 썩은 과일 셔플 효과음
  playRottenShuffle() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.25);
    osc.frequency.linearRampToValueAtTime(330, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  // 장바구니 획득 사운드
  playBasketGet() {
    if (this.isMuted) return;
    this.init();
    const notes = [523, 659, 784, 1046, 1318];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
      }, i * 70);
    });
  }

  // 승리/클리어 팡파레
  playVictory() {
    if (this.isMuted) return;
    this.init();
    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880.00],
      [659.25, 830.61, 987.77],
      [783.99, 987.77, 1174.66]
    ];
    chords.forEach((chord, step) => {
      setTimeout(() => {
        chord.forEach(freq => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.35);
        });
      }, step * 160);
    });
  }

  // 게임오버 사운드
  playGameOver() {
    if (this.isMuted) return;
    this.init();
    const notes = [440, 415, 392, 349];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      }, i * 150);
    });
  }

  // 과일가게 루프 BGM
  startBGM() {
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.init();

    const melody = [
      { note: 261.63, dur: 0.25 }, // C4
      { note: 329.63, dur: 0.25 }, // E4
      { note: 392.00, dur: 0.25 }, // G4
      { note: 523.25, dur: 0.5 },  // C5
      { note: 392.00, dur: 0.25 }, // G4
      { note: 329.63, dur: 0.25 }, // E4
      { note: 349.23, dur: 0.25 }, // F4
      { note: 440.00, dur: 0.25 }, // A4
      { note: 392.00, dur: 0.5 },  // G4
      { note: 293.66, dur: 0.25 }, // D4
      { note: 349.23, dur: 0.25 }, // F4
      { note: 329.63, dur: 0.5 },  // E4
      { note: 261.63, dur: 0.5 },  // C4
    ];

    let noteIdx = 0;
    const playNext = () => {
      if (!this.bgmPlaying || this.isMuted) {
        if (this.bgmPlaying) {
          this.bgmTimer = setTimeout(playNext, 400);
        }
        return;
      }
      const item = melody[noteIdx];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(item.note, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + item.dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + item.dur);

      noteIdx = (noteIdx + 1) % melody.length;
      this.bgmTimer = setTimeout(playNext, item.dur * 1000 + 60);
    };

    playNext();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleBGM() {
    if (this.bgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }
}

window.soundEngine = new SoundEngine();
