/**
 * game.js - 메인 팩맨 게임 루프, 물리, 충돌, AI 및 스테이지 시스템
 */

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.maze = new MazeManager();

    // 게임 상태
    this.stage = 1;
    this.score = 0;
    this.targetScore = 200; // 스테이지 x 200
    this.isRunning = false;
    this.isPaused = false;
    this.inMinigame = false;

    // 플레이어 (고양이) 상태
    this.cat = {
      x: 10 * 32 + 16,
      y: 16 * 32 + 16,
      tileX: 10,
      tileY: 16,
      dir: 'right',
      nextDir: 'right',
      speed: 105, // 픽셀/초
      walkFrame: 0,
      invincibleTimer: 0
    };

    // 눈사람 (몬스터) 목록
    this.snowmen = [];

    // 파티클 및 플로팅 텍스트
    this.particles = [];
    this.floatingTexts = [];

    // 시간 관리
    this.lastTime = performance.now();
    this.animTime = 0;

    // 미니게임 인스턴스
    const bridgeCanvas = document.getElementById('bridgeCanvas');
    this.bridgeGame = new BridgeMinigame(bridgeCanvas, (earned, duration, isCleared) => {
      this.onMinigameComplete(earned, duration, isCleared);
    });

    this.bindInputs();
  }

  // 키보드 조작 바인딩
  bindInputs() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.code === 'Space') {
        this.togglePause();
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        if (!this.inMinigame) {
          document.getElementById('startOverlay').classList.add('hidden');
          this.isRunning = true;
          this.startBonusMinigame();
          return;
        }
      }

      if (e.key === 'n' || e.key === 'N') {
        this.score = this.targetScore;
        this.triggerStageClear();
        return;
      }

      let dir = null;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dir = 'up';
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dir = 'down';
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dir = 'left';
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dir = 'right';

      if (dir) {
        this.setCatDirection(dir);
      }
    });
  }

  // 방향 전환 (버퍼링 적용)
  setCatDirection(dir) {
    if (this.inMinigame) {
      this.bridgeGame.setMoveDir(dir);
      return;
    }
    this.cat.nextDir = dir;
  }

  // 스테이지 로드
  loadStage(stageNum) {
    this.stage = stageNum;
    this.targetScore = this.stage * 200; // 규칙: 스테이지 수 X 200점

    const stageInfo = this.maze.loadStage(this.stage);

    // 고양이 위치 리셋
    this.cat.x = stageInfo.catStart.x * 32 + 16;
    this.cat.y = stageInfo.catStart.y * 32 + 16;
    this.cat.tileX = stageInfo.catStart.x;
    this.cat.tileY = stageInfo.catStart.y;
    this.cat.dir = 'right';
    this.cat.nextDir = 'right';
    this.cat.invincibleTimer = 0;

    // 눈사람 생성 (스테이지 난이도에 따라 2~5마리)
    const snowmanCount = Math.min(5, 2 + Math.floor(this.stage / 20));
    this.snowmen = [];

    const baseSpeed = 80 + Math.min(30, this.stage * 0.4); // 고스테이지에서 약간 빨라짐
    const ghostSpawnX = stageInfo.ghostSpawn.x * 32 + 16;
    const ghostSpawnY = stageInfo.ghostSpawn.y * 32 + 16;

    for (let i = 0; i < snowmanCount; i++) {
      this.snowmen.push({
        x: ghostSpawnX + (i % 2 === 0 ? -12 : 12) * i,
        y: ghostSpawnY,
        tileX: stageInfo.ghostSpawn.x,
        tileY: stageInfo.ghostSpawn.y,
        dir: i % 2 === 0 ? 'up' : 'down',
        speed: baseSpeed + (i * 4),
        variant: i,
        aiMode: ['chase', 'ambush', 'patrol', 'random'][i % 4]
      });
    }

    this.particles = [];
    this.floatingTexts = [];
    this.updateHUD();

    this.showBanner(`STAGE ${this.stage} 시작! (목표: ${this.targetScore} P)`);
  }

  // 시작
  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loadStage(this.stage);
    if (window.soundEngine) {
      window.soundEngine.startBGM();
    }
    requestAnimationFrame((t) => this.loop(t));
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.showBanner('게임 일시정지 (Space를 누르면 계속)');
    }
  }

  // 메인 게임 루프
  loop(currentTime) {
    if (!this.isRunning) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.animTime += dt;
      if (this.inMinigame) {
        this.bridgeGame.update(dt);
        this.bridgeGame.render();
      } else {
        this.update(dt);
        this.render();
      }
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  // 물리 및 상태 갱신
  update(dt) {
    // 1. 고양이 무적 시간 갱신
    if (this.cat.invincibleTimer > 0) {
      this.cat.invincibleTimer -= dt;
    }

    // 2. 고양이 이동 (Pac-Man 식 정밀 그리드 버퍼링)
    this.updateCatMovement(dt);

    // 3. 눈사람 몬스터 이동 및 AI
    this.updateSnowmen(dt);

    // 4. 모닥불 수집 및 충돌 체크
    this.checkPelletCollection();

    // 5. 눈사람 충돌 체크
    this.checkSnowmanCollision();

    // 6. 파티클 및 플로팅 텍스트 업데이트
    this.updateParticles(dt);

    // 7. 스테이지 클리어 체크 (점수가 목표에 도달했는가?)
    if (this.score >= this.targetScore) {
      this.triggerStageClear();
    }
  }

  // 고양이 이동 로직 (부드러운 코너링 지원)
  updateCatMovement(dt) {
    const size = MazeManager.TILE_SIZE;
    const cat = this.cat;

    // 현재 타일 좌표
    cat.tileX = Math.floor(cat.x / size);
    cat.tileY = Math.floor(cat.y / size);

    // 중심 정렬 여부
    const centerX = cat.tileX * size + size / 2;
    const centerY = cat.tileY * size + size / 2;
    const distToCenter = Math.hypot(cat.x - centerX, cat.y - centerY);

    // 방향 전환 시도 (타일 중심 근처에서 허용)
    if (cat.nextDir !== cat.dir) {
      if (this.isOppositeDir(cat.dir, cat.nextDir)) {
        // 즉시 반대 방향으로 유턴 허용
        cat.dir = cat.nextDir;
      } else if (distToCenter < 6) {
        // 교차로에서 새 방향으로 회전 가능한지 확인
        const nextTargetTile = this.getAdjacentTile(cat.tileX, cat.tileY, cat.nextDir);
        if (!this.maze.isWall(nextTargetTile.x, nextTargetTile.y)) {
          cat.x = centerX;
          cat.y = centerY;
          cat.dir = cat.nextDir;
        }
      }
    }

    // 현재 진행 방향으로 이동
    const currentTarget = this.getAdjacentTile(cat.tileX, cat.tileY, cat.dir);
    const isNextWall = this.maze.isWall(currentTarget.x, currentTarget.y);

    let moveDist = cat.speed * dt;

    if (cat.dir === 'left') {
      if (!isNextWall || cat.x > centerX) {
        cat.x -= moveDist;
      }
    } else if (cat.dir === 'right') {
      if (!isNextWall || cat.x < centerX) {
        cat.x += moveDist;
      }
    } else if (cat.dir === 'up') {
      if (!isNextWall || cat.y > centerY) {
        cat.y -= moveDist;
      }
    } else if (cat.dir === 'down') {
      if (!isNextWall || cat.y < centerY) {
        cat.y += moveDist;
      }
    }

    cat.walkFrame += dt * 12;

    // 터널 포탈 (화면 좌우 뚫린 통로 워프)
    const totalW = MazeManager.COLS * size;
    if (cat.x < -8) {
      cat.x = totalW + 4;
    } else if (cat.x > totalW + 8) {
      cat.x = -4;
    }
  }

  isOppositeDir(d1, d2) {
    return (
      (d1 === 'left' && d2 === 'right') ||
      (d1 === 'right' && d2 === 'left') ||
      (d1 === 'up' && d2 === 'down') ||
      (d1 === 'down' && d2 === 'up')
    );
  }

  getAdjacentTile(tx, ty, dir) {
    if (dir === 'left') return { x: tx - 1, y: ty };
    if (dir === 'right') return { x: tx + 1, y: ty };
    if (dir === 'up') return { x: tx, y: ty - 1 };
    if (dir === 'down') return { x: tx, y: ty + 1 };
    return { x: tx, y: ty };
  }

  // 눈사람 AI 이동
  updateSnowmen(dt) {
    const size = MazeManager.TILE_SIZE;

    for (const sm of this.snowmen) {
      sm.tileX = Math.floor(sm.x / size);
      sm.tileY = Math.floor(sm.y / size);

      const centerX = sm.tileX * size + size / 2;
      const centerY = sm.tileY * size + size / 2;
      const distToCenter = Math.hypot(sm.x - centerX, sm.y - centerY);

      // 교차로 중심에 가까워졌을 때 방향 결정
      if (distToCenter < 4) {
        const validDirs = [];
        const allDirs = ['up', 'down', 'left', 'right'];

        for (const d of allDirs) {
          // 되돌아가는 방향은 기본적으로 제외 (막다른 길이 아닐 때)
          if (this.isOppositeDir(sm.dir, d)) continue;
          const nextTile = this.getAdjacentTile(sm.tileX, sm.tileY, d);
          if (!this.maze.isWall(nextTile.x, nextTile.y)) {
            validDirs.push(d);
          }
        }

        // 갈 수 있는 길이 없으면 되돌아가기 허용
        if (validDirs.length === 0) {
          for (const d of allDirs) {
            const nextTile = this.getAdjacentTile(sm.tileX, sm.tileY, d);
            if (!this.maze.isWall(nextTile.x, nextTile.y)) {
              validDirs.push(d);
            }
          }
        }

        if (validDirs.length > 0) {
          // AI 목표 타일 설정
          let targetX = this.cat.tileX;
          let targetY = this.cat.tileY;

          if (sm.aiMode === 'ambush') {
            // 고양이 진행방향 앞 3칸 매복
            const ahead = this.getAdjacentTile(this.cat.tileX, this.cat.tileY, this.cat.dir);
            targetX = ahead.x;
            targetY = ahead.y;
          } else if (sm.aiMode === 'random') {
            // 무작위 선택
            sm.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
          }

          if (sm.aiMode !== 'random') {
            // 가장 목표에 가까운 방향 선택
            let bestDir = validDirs[0];
            let bestDist = Infinity;
            for (const d of validDirs) {
              const nt = this.getAdjacentTile(sm.tileX, sm.tileY, d);
              const dist = Math.hypot(nt.x - targetX, nt.y - targetY);
              if (dist < bestDist) {
                bestDist = dist;
                bestDir = d;
              }
            }
            sm.dir = bestDir;
          }
        }
      }

      // 이동 실행
      const step = sm.speed * dt;
      if (sm.dir === 'left') sm.x -= step;
      else if (sm.dir === 'right') sm.x += step;
      else if (sm.dir === 'up') sm.y -= step;
      else if (sm.dir === 'down') sm.y += step;

      // 터널 포탈
      const totalW = MazeManager.COLS * size;
      if (sm.x < -8) sm.x = totalW + 4;
      else if (sm.x > totalW + 8) sm.x = -4;
    }
  }

  // 모닥불 수집 검사
  checkPelletCollection() {
    const tx = this.cat.tileX;
    const ty = this.cat.tileY;

    if (ty < 0 || ty >= MazeManager.ROWS || tx < 0 || tx >= MazeManager.COLS) return;

    const cell = this.maze.grid[ty][tx];
    if (cell === 2) {
      // 일반 모닥불: +1점
      this.maze.grid[ty][tx] = 0;
      this.maze.remainingCampfires--;
      this.addScore(1, this.cat.x, this.cat.y, '+1');
      if (window.soundEngine) window.soundEngine.playCampfire();
      this.createCampfireSparkles(this.cat.x, this.cat.y);

    } else if (cell === 3) {
      // 대형 모닥불: +10점
      this.maze.grid[ty][tx] = 0;
      this.maze.remainingCampfires--;
      this.addScore(10, this.cat.x, this.cat.y, '+10 대형 모닥불!');
      if (window.soundEngine) window.soundEngine.playBonusItem();
      this.createCampfireSparkles(this.cat.x, this.cat.y, 16);

    } else if (cell === 4) {
      // 보너스 간식 (생선구이): +25점
      this.maze.grid[ty][tx] = 0;
      this.addScore(25, this.cat.x, this.cat.y, '+25 꽁치구이!');
      if (window.soundEngine) window.soundEngine.playBonusItem();
      this.createCampfireSparkles(this.cat.x, this.cat.y, 22);
    }

    // 맵 내 모닥불을 모두 수집했는데 아직 목표 점수에 도달하지 못한 경우
    if (this.maze.remainingCampfires <= 0 && this.score < this.targetScore) {
      this.showBanner('온기가 마을 전체로 퍼져 새로운 모닥불이 피어납니다! (+50 보너스)');
      this.addScore(50, this.cat.x, this.cat.y, '+50 MAP CLEAR!');
      this.maze.replenishCampfires();
    }
  }

  // 눈사람 충돌 검사
  checkSnowmanCollision() {
    if (this.cat.invincibleTimer > 0) return;

    for (const sm of this.snowmen) {
      const dist = Math.hypot(this.cat.x - sm.x, this.cat.y - sm.y);
      if (dist < 20) {
        // 눈사람과 충돌 발생!
        // 규칙: 눈사람과 부딪히면 -1점
        this.deductScore(1, this.cat.x, this.cat.y);
        this.cat.invincibleTimer = 1.5; // 1.5초 무적 깜빡임 (연속 감점 방지)

        if (window.soundEngine) {
          window.soundEngine.playSnowmanHit();
        }

        // 눈 파편 튀는 이펙트
        this.createSnowSplash(this.cat.x, this.cat.y);
        break;
      }
    }
  }

  // 점수 추가
  addScore(amount, x, y, label) {
    this.score += amount;
    this.updateHUD();
    this.addFloatingText(label, x, y - 10, '#ffd166');
  }

  // 점수 차감 (-1점)
  deductScore(amount, x, y) {
    this.score = Math.max(0, this.score - amount);
    this.updateHUD();
    this.addFloatingText('-1 앗 차가워!', x, y - 10, '#70d6ff');
  }

  // HUD 갱신
  updateHUD() {
    const stageElem = document.getElementById('currentStage');
    const scoreElem = document.getElementById('currentScore');
    const targetElem = document.getElementById('targetScore');
    const progText = document.getElementById('progressText');
    const progBar = document.getElementById('progressBar');

    if (stageElem) stageElem.textContent = this.stage;
    if (scoreElem) scoreElem.textContent = this.score;
    if (targetElem) targetElem.textContent = this.targetScore;

    const ratio = Math.min(100, Math.floor((this.score / this.targetScore) * 100));
    if (progText) progText.textContent = `${ratio}%`;
    if (progBar) progBar.style.width = `${ratio}%`;
  }

  // 스테이지 클리어 처리
  triggerStageClear() {
    this.isPaused = true;
    if (window.soundEngine) {
      window.soundEngine.playStageClear();
    }

    // 끝자리가 9인 스테이지 체크 (9, 19, 29, 39... 99)
    if (this.stage % 10 === 9) {
      this.startBonusMinigame();
      return;
    }

    // 100 스테이지 최종 엔딩 체크
    if (this.stage >= 100) {
      this.triggerFinalEnding();
      return;
    }

    // 일반 스테이지 클리어 모달 출력
    const modal = document.getElementById('stageClearModal');
    const title = document.getElementById('clearTitle');
    const scoreVal = document.getElementById('clearScoreVal');
    const nextTarget = document.getElementById('clearNextTargetVal');

    if (title) title.textContent = `STAGE ${this.stage} CLEAR!`;
    if (scoreVal) scoreVal.textContent = `${this.score} P`;
    if (nextTarget) nextTarget.textContent = `${(this.stage + 1) * 200} P`;

    if (modal) modal.classList.remove('hidden');
  }

  // 보너스 미니게임 시작 (9, 19, 29... 스테이지)
  startBonusMinigame() {
    this.inMinigame = true;
    const miniOverlay = document.getElementById('minigameOverlay');
    if (miniOverlay) miniOverlay.classList.remove('hidden');

    this.bridgeGame.start();
  }

  // 미니게임 완료 콜백
  onMinigameComplete(earnedScore, duration, isCleared) {
    this.score += earnedScore;
    this.updateHUD();

    // 미니게임 오버레이 숨김
    const miniOverlay = document.getElementById('minigameOverlay');
    if (miniOverlay) miniOverlay.classList.add('hidden');

    // 정산 모달 표시
    const resultModal = document.getElementById('minigameResultModal');
    const icon = document.getElementById('miniResultIcon');
    const title = document.getElementById('miniResultTitle');
    const desc = document.getElementById('miniResultDesc');
    const durationElem = document.getElementById('miniResultDuration');
    const formulaElem = document.getElementById('miniScoreCalcFormula');
    const earnedElem = document.getElementById('miniResultEarned');
    const totalElem = document.getElementById('miniResultTotal');

    if (isCleared) {
      if (icon) icon.textContent = '🎉 🏡 🐱 🌟';
      if (title) title.textContent = '다리 완주 대성공!';
      if (desc) desc.textContent = '눈 덮인 다리를 무사히 건너 따뜻한 보너스를 획득했습니다!';
      if (formulaElem) formulaElem.textContent = '완주 보너스 (건넌 시간 × 10)';
    } else {
      if (icon) icon.textContent = '🦅 🐱 ❄️';
      if (title) title.textContent = '포근한 구조!';
      if (desc) desc.textContent = '다리에서 미끄러졌지만 버틴 시간만큼 온기를 모았습니다!';
      if (formulaElem) formulaElem.textContent = '버틴 보너스 (버틴 시간 × 5)';
    }

    if (durationElem) durationElem.textContent = `${duration.toFixed(1)}초`;
    if (earnedElem) earnedElem.textContent = `+${earnedScore} P`;
    if (totalElem) totalElem.textContent = `${this.score} P`;

    if (resultModal) resultModal.classList.remove('hidden');
  }

  // 다음 스테이지 진행
  advanceNextStage() {
    const clearModal = document.getElementById('stageClearModal');
    const miniResultModal = document.getElementById('minigameResultModal');
    if (clearModal) clearModal.classList.add('hidden');
    if (miniResultModal) miniResultModal.classList.add('hidden');

    this.inMinigame = false;
    this.loadStage(this.stage + 1);
    this.isPaused = false;
  }

  // 100 스테이지 최종 엔딩
  triggerFinalEnding() {
    const endingModal = document.getElementById('endingModal');
    const finalScore = document.getElementById('finalScoreVal');
    if (finalScore) finalScore.textContent = `${this.score} P`;
    if (endingModal) endingModal.classList.remove('hidden');
  }

  // 파티클 생성
  createCampfireSparkles(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 45 + 15;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15,
        color: ['#ff7324', '#fca311', '#ffd166', '#ffffff'][Math.floor(Math.random() * 4)],
        size: Math.random() * 2.5 + 1.2,
        life: 0.6,
        maxLife: 0.6
      });
    }
  }

  createSnowSplash(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 50 + 20;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#e0f2fe',
        size: Math.random() * 3 + 1.5,
        life: 0.5,
        maxLife: 0.5
      });
    }
  }

  addFloatingText(text, x, y, color = '#ffffff') {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      color: color,
      life: 0.9,
      maxLife: 0.9
    });
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y -= 25 * dt; // 위로 떠오름
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // 캔버스 렌더링
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. 미로 맵 (벽, 모닥불, 보너스 아이템)
    this.maze.render(ctx, this.animTime);

    // 2. 눈사람 몬스터들
    for (const sm of this.snowmen) {
      SpriteRenderer.drawSnowman(ctx, sm.x, sm.y, 28, this.animTime, sm.variant);
    }

    // 3. 플레이어 (고양이)
    const isInv = this.cat.invincibleTimer > 0;
    SpriteRenderer.drawCat(ctx, this.cat.x, this.cat.y, 30, this.cat.dir, this.cat.walkFrame, isInv);

    // 4. 온기 광륜 조명 마스크 (Lantern & Ambient Glow)
    this.renderLightingOverlay(ctx);

    // 5. 파티클
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 6. 플로팅 텍스트
    ctx.font = 'bold 13px Pretendard';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      const alpha = ft.life / ft.maxLife;
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = alpha;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1.0;
  }

  // 주변 조명 효과 (고양이 주변 포근한 온기 랜턴 빛)
  renderLightingOverlay(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 고양이 주변 따뜻한 빛
    const catLight = ctx.createRadialGradient(this.cat.x, this.cat.y, 10, this.cat.x, this.cat.y, 90);
    catLight.addColorStop(0, 'rgba(255, 180, 50, 0.28)');
    catLight.addColorStop(0.6, 'rgba(255, 120, 20, 0.1)');
    catLight.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = catLight;
    ctx.fillRect(0, 0, w, h);
  }

  showBanner(msg) {
    const banner = document.getElementById('floatingBanner');
    const text = document.getElementById('floatingBannerText');
    if (banner && text) {
      text.textContent = msg;
      banner.classList.remove('hidden');
      setTimeout(() => {
        banner.classList.add('hidden');
      }, 2400);
    }
  }
}

window.GameEngine = GameEngine;
