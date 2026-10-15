/**
 * main.js - 애플리케이션 진입점 및 UI 이벤트 컨트롤러
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 캔버스 요소 획득
  const gameCanvas = document.getElementById('gameCanvas');
  const snowCanvas = document.getElementById('snowCanvas');

  // 2. 배경 눈 내리는 이펙트 초기화
  initSnowBackground(snowCanvas);

  // 3. 게임 엔진 초기화
  const game = new GameEngine(gameCanvas);
  window.game = game;

  // 4. 스테이지 바로가기 그리드 (1 ~ 100) 동적 생성
  initStageGrid(game);

  // 5. 버튼 및 UI 이벤트 바인딩
  bindUIEvents(game);

  // 6. 가상 D-Pad 터치 이벤트 연결
  bindTouchControls(game);
});

// 배경 눈송이 시스템
function initSnowBackground(canvas) {
  const ctx = canvas.getContext('2d');
  let flakes = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 90; i++) {
    flakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 0.8,
      density: Math.random() + 0.5,
      speedY: Math.random() * 1.2 + 0.4,
      speedX: (Math.random() - 0.5) * 0.6
    });
  }

  function renderSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(235, 248, 255, 0.75)';
    ctx.beginPath();
    for (const f of flakes) {
      ctx.moveTo(f.x, f.y);
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, true);
    }
    ctx.fill();

    for (const f of flakes) {
      f.y += f.speedY;
      f.x += f.speedX;
      if (f.y > canvas.height) {
        f.y = -5;
        f.x = Math.random() * canvas.width;
      }
      if (f.x > canvas.width) f.x = 0;
      if (f.x < 0) f.x = canvas.width;
    }
    requestAnimationFrame(renderSnow);
  }
  renderSnow();
}

// 1~100 스테이지 셀렉터 그리드
function initStageGrid(game) {
  const gridContainer = document.getElementById('stageGrid');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';
  for (let s = 1; s <= 100; s++) {
    const btn = document.createElement('button');
    btn.className = 'stage-btn-item';
    btn.textContent = s;

    // 끝자리가 9인 스테이지는 보너스 미니게임 별표 표기
    if (s % 10 === 9) {
      btn.classList.add('bonus-stage');
      btn.title = `스테이지 ${s} (보너스 흔들다리 미니게임 포함!)`;
    }

    btn.addEventListener('click', () => {
      game.stage = s;
      game.score = (s - 1) * 200; // 진입 시점에 맞춘 온기 점수 세팅
      game.loadStage(s);
      game.isPaused = false;
      document.getElementById('stageSelectModal').classList.add('hidden');
      document.getElementById('startOverlay').classList.add('hidden');
    });

    gridContainer.appendChild(btn);
  }
}

// UI 버튼 이벤트 바인딩
function bindUIEvents(game) {
  // 게임 시작 버튼
  const btnStart = document.getElementById('btnStartGame');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      document.getElementById('startOverlay').classList.add('hidden');
      game.start();
    });
  }

  // 사운드 토글 버튼
  const btnAudio = document.getElementById('btnAudioToggle');
  const audioIcon = document.getElementById('audioIcon');
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      if (window.soundEngine) {
        const isMuted = !window.soundEngine.toggleMute();
        audioIcon.textContent = isMuted ? '🔇' : '🔊';
      }
    });
  }

  // 스테이지 모달
  const btnStage = document.getElementById('btnStageSelect');
  const stageModal = document.getElementById('stageSelectModal');
  const btnCloseStage = document.getElementById('btnCloseStageSelect');
  const btnDirectMini = document.getElementById('btnDirectMinigame');

  if (btnStage && stageModal) {
    btnStage.addEventListener('click', () => stageModal.classList.remove('hidden'));
  }
  if (btnCloseStage && stageModal) {
    btnCloseStage.addEventListener('click', () => stageModal.classList.add('hidden'));
  }
  if (btnDirectMini) {
    btnDirectMini.addEventListener('click', () => {
      stageModal.classList.add('hidden');
      document.getElementById('startOverlay').classList.add('hidden');
      game.isRunning = true;
      game.startBonusMinigame();
    });
  }

  // 도움말 모달
  const btnHelp = document.getElementById('btnHelp');
  const helpModal = document.getElementById('helpModal');
  const btnCloseHelp = document.getElementById('btnCloseHelp');
  if (btnHelp && helpModal) {
    btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
  }
  if (btnCloseHelp && helpModal) {
    btnCloseHelp.addEventListener('click', () => helpModal.classList.add('hidden'));
  }

  // 스테이지 클리어 다음 버튼
  const btnNext = document.getElementById('btnNextStage');
  if (btnNext) {
    btnNext.addEventListener('click', () => game.advanceNextStage());
  }

  // 미니게임 클리어 다음 버튼
  const btnMiniContinue = document.getElementById('btnMiniContinue');
  if (btnMiniContinue) {
    btnMiniContinue.addEventListener('click', () => game.advanceNextStage());
  }

  // 100 스테이지 엔딩 후 재시작 버튼
  const btnRestart = document.getElementById('btnRestartGame');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      document.getElementById('endingModal').classList.add('hidden');
      game.score = 0;
      game.loadStage(1);
      game.isPaused = false;
    });
  }
}

// 터치 & 모바일 D-Pad 컨트롤 연결
function bindTouchControls(game) {
  const dpadBtns = document.querySelectorAll('.dpad-btn[data-dir]');
  dpadBtns.forEach((btn) => {
    const dir = btn.getAttribute('data-dir');
    const triggerDir = (e) => {
      e.preventDefault();
      game.setCatDirection(dir);
    };

    btn.addEventListener('touchstart', triggerDir, { passive: false });
    btn.addEventListener('mousedown', triggerDir);
  });
}
