/**
 * audio.js - Web Audio API 기반 순수 절차적 사운드 신시사이저
 * 외부 오디오 파일 다운로드 없이 100% 브라우저 내장 Web Audio API로 작동
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmOscs = [];
    this.bgmTimer = null;
    this.isBgmPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return !this.isMuted;
  }

  // 모닥불 획득 사운드 (영롱한 벨 차임)
  playCampfire() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // 따뜻한 펜타토닉 음계 (E5 -> B5 하모닉스)
    osc.frequency.setValueAtTime(659.25, t);
    osc.frequency.exponentialRampToValueAtTime(987.77, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // 특수 간식 (생선구이 등) 획득 사운드
  playBonusItem() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.25, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.22);
    });
  }

  // 눈사람 충돌 사운드 (찬 바람 둔탁한 소리 + 고양이 야옹 느낌의 피치 벤드)
  playSnowmanHit() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    // 1. 차가운 충돌음
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.15);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    whiteNoise.start(t);

    // 2. 고양이 야옹~ (Meow 피치 벤드)
    const meowOsc = this.ctx.createOscillator();
    const meowGain = this.ctx.createGain();
    meowOsc.type = 'sine';
    meowOsc.frequency.setValueAtTime(450, t + 0.04);
    meowOsc.frequency.linearRampToValueAtTime(680, t + 0.14);
    meowOsc.frequency.exponentialRampToValueAtTime(320, t + 0.35);

    meowGain.gain.setValueAtTime(0.2, t + 0.04);
    meowGain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

    meowOsc.connect(meowGain);
    meowGain.connect(this.ctx.destination);
    meowOsc.start(t + 0.04);
    meowOsc.stop(t + 0.38);
  }

  // 발자국 사운드 (눈 밟는 뽀드득 소리)
  playSnowStep() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  // 다리 건너기 바람/미끄러짐 사운드
  playWindGust() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(260, t + 0.25);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.6);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.7);
  }

  // 흔들다리 삐걱거림 (Wooden bridge creak)
  playBridgeCreak() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.18);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // 스테이지 클리어 팡파르
  playStageClear() {
    if (this.isMuted) return;
    this.init();
    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.35 }  // C6
    ];
    let curTime = this.ctx.currentTime;
    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, curTime);
      gain.gain.setValueAtTime(0.28, curTime);
      gain.gain.exponentialRampToValueAtTime(0.001, curTime + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(curTime);
      osc.stop(curTime + n.d + 0.05);
      curTime += n.d * 0.9;
    });
  }

  // 포근한 8-bit 겨울 앰비언트 BGM
  startBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.init();
    this.isBgmPlaying = true;

    // 포근한 펜타토닉 아르페지오 멜로디 (도-레-미-솔-라)
    const melody = [
      392.00, 440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00,
      392.00, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99, 659.25
    ];
    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.isBgmPlaying || this.isMuted) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const freq = melody[noteIndex % melody.length];
      osc.frequency.setValueAtTime(freq, t);

      // 부드러운 패드 느낌의 엔벨로프
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.45);

      noteIndex++;
      this.bgmTimer = setTimeout(playNextNote, 340);
    };

    playNextNote();
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// 전역 싱글톤 인스턴스
window.soundEngine = new SoundEngine();
