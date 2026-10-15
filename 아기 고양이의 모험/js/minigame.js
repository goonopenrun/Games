/**
 * minigame.js - 눈 덮인 흔들다리 건너기 미니게임
 * 조건: 9, 19, 29... 끝자리가 9인 스테이지 클리어 시 진행
 * 규칙:
 * 1) 고양이는 눈길 흔들다리 위에서 넘어지지 않고 건너야 함
 * 2) 버틴 시간 × 5만큼 점수 획득
 * 3) 다리를 다 건넌 경우, 건넌 시간 × 10만큼 점수 획득!
 */

class BridgeMinigame {
  constructor(canvas, onComplete) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onComplete = onComplete; // 결과 콜백: (earnedScore, survivedTime, isCompleted)

    this.isActive = false;
    this.startTime = 0;
    this.elapsedTime = 0;

    // 다리 스펙
    this.bridgeTotalDist = 45; // 45미터 (약 15초 코스)
    this.catDist = 0;
    this.catSpeed = 3.0; // 초당 3m 전진

    // 횡방향 (좌우 균형) 물리
    this.bridgeHalfWidth = 75; // 다리 중심 기준 좌우 폭
    this.catX = 0;             // 중심 = 0
    this.catVelX = 0;
    this.catWalkFrame = 0;

    // 바람 및 얼음 물리
    this.windForce = 0;
    this.nextWindChange = 0;
    this.windParticles = [];

    // 장애물 (구르는 눈덩이 / 빙판 패치)
    this.obstacles = [];
    this.nextObstacleTime = 0;

    // 게임 상태
    this.state = 'READY'; // READY, PLAYING, FALLEN, SUCCESS
    this.fallAnimProgress = 0;
    this.successAnimProgress = 0;

    // 키 입력 상태
    this.keys = { left: false, right: false };

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActive || this.state !== 'PLAYING') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = false;
      }
    });
  }

  // 터치 및 가상 D-Pad 조작 지원
  setMoveDir(dir) {
    if (!this.isActive || this.state !== 'PLAYING') return;
    if (dir === 'left') {
      this.catVelX -= 3.2;
    } else if (dir === 'right') {
      this.catVelX += 3.2;
    }
  }

  start() {
    this.isActive = true;
    this.state = 'PLAYING';
    this.startTime = performance.now();
    this.elapsedTime = 0;
    this.catDist = 0;
    this.catX = 0;
    this.catVelX = 0;
    this.catWalkFrame = 0;
    this.fallAnimProgress = 0;
    this.successAnimProgress = 0;
    this.windForce = 0;
    this.nextWindChange = 2.0;
    this.obstacles = [];
    this.windParticles = [];

    // 초기 바람 파티클
    for (let i = 0; i < 40; i++) {
      this.windParticles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speedX: (Math.random() - 0.5) * 6,
        speedY: Math.random() * 2 + 1,
        size: Math.random() * 2.5 + 1
      });
    }

    if (window.soundEngine) {
      window.soundEngine.playBridgeCreak();
    }
  }

  update(dt) {
    if (!this.isActive) return;

    if (this.state === 'PLAYING') {
      this.elapsedTime = (performance.now() - this.startTime) / 1000;
      this.catWalkFrame += dt * 10;

      // 1. 전진 거리 갱신
      this.catDist += this.catSpeed * dt;
      if (this.catDist >= this.bridgeTotalDist) {
        this.completeSuccess();
        return;
      }

      // 2. 바람 시스템
      if (this.elapsedTime > this.nextWindChange) {
        // -30 ~ +30 강도의 돌풍
        this.windForce = (Math.random() - 0.5) * 55;
        this.nextWindChange = this.elapsedTime + 2.5 + Math.random() * 2.5;
        if (Math.abs(this.windForce) > 20 && window.soundEngine) {
          window.soundEngine.playWindGust();
        }
      }

      // 3. 조작 입력 처리 (빙판 미끄러짐 마찰 적용)
      const moveAccel = 130; // 조작 가속도
      if (this.keys.left) {
        this.catVelX -= moveAccel * dt;
      }
      if (this.keys.right) {
        this.catVelX += moveAccel * dt;
      }

      // 바람 외력 추가
      this.catVelX += this.windForce * dt;

      // 빙판 마찰 감쇠
      this.catVelX *= 0.94;
      this.catX += this.catVelX * dt;

      // 4. 장애물 스폰 (눈덩이)
      if (this.elapsedTime > this.nextObstacleTime) {
        this.obstacles.push({
          relDist: this.catDist + 18, // 전방 18m 앞에서 등장
          x: (Math.random() - 0.5) * (this.bridgeHalfWidth * 1.4),
          radius: 9,
          speed: -2.5 // 앞으로 굴러옴
        });
        this.nextObstacleTime = this.elapsedTime + 2.8 + Math.random() * 2.0;
      }

      // 장애물 업데이트 및 충돌 체크
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.relDist += obs.speed * dt;

        // 고양이와 동일 거리 도달 시 충돌 체크
        if (Math.abs(obs.relDist - this.catDist) < 1.0) {
          if (Math.abs(obs.x - this.catX) < obs.radius + 12) {
            // 눈덩이에 부딪혀 옆으로 튕겨남!
            this.catVelX += (this.catX > obs.x ? 45 : -45);
            if (window.soundEngine) window.soundEngine.playSnowmanHit();
            this.obstacles.splice(i, 1);
            continue;
          }
        }

        // 지나간 장애물 제거
        if (obs.relDist < this.catDist - 5) {
          this.obstacles.splice(i, 1);
        }
      }

      // 5. 다리 밖으로 추락 체크
      if (Math.abs(this.catX) > this.bridgeHalfWidth) {
        this.failFall();
        return;
      }

      // UI HUD 갱신용
      this.updateHud();
    } else if (this.state === 'FALLEN') {
      this.fallAnimProgress += dt * 1.5;
      if (this.fallAnimProgress >= 1.0) {
        this.finishMinigame(false);
      }
    } else if (this.state === 'SUCCESS') {
      this.successAnimProgress += dt * 1.2;
      if (this.successAnimProgress >= 1.0) {
        this.finishMinigame(true);
      }
    }

    // 눈보라 파티클
    for (const p of this.windParticles) {
      p.x += (p.speedX + this.windForce * 0.15);
      p.y += p.speedY;
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y > this.canvas.height) p.y = 0;
    }
  }

  updateHud() {
    const timeElem = document.getElementById('bridgeTime');
    const progElem = document.getElementById('bridgeProgress');
    const estElem = document.getElementById('bridgeEstScore');

    if (timeElem) timeElem.textContent = `${this.elapsedTime.toFixed(1)}초`;
    const percent = Math.min(100, Math.floor((this.catDist / this.bridgeTotalDist) * 100));
    if (progElem) progElem.textContent = `${percent}%`;

    // 예상 점수 (버틴 시간 x 5)
    const estScore = Math.floor(this.elapsedTime) * 5;
    if (estElem) estElem.textContent = `${estScore} P`;
  }

  // 낙하 실패 처리
  failFall() {
    this.state = 'FALLEN';
    this.fallAnimProgress = 0;
    if (window.soundEngine) {
      window.soundEngine.playSnowmanHit();
    }
  }

  // 완주 성공 처리
  completeSuccess() {
    this.state = 'SUCCESS';
    this.successAnimProgress = 0;
    if (window.soundEngine) {
      window.soundEngine.playStageClear();
    }
  }

  // 미니게임 최종 정산
  finishMinigame(isCompleted) {
    this.isActive = false;
    const finalTime = Math.max(0.5, this.elapsedTime);
    let earnedScore = 0;

    if (isCompleted) {
      // 다리를 다 건넌 경우: 건넌 시간 X 10만큼 점수 획득!
      earnedScore = Math.floor(finalTime) * 10;
    } else {
      // 다리에서 버틴 시간 X 5만큼 점수 획득!
      earnedScore = Math.floor(finalTime) * 5;
    }

    if (this.onComplete) {
      this.onComplete(earnedScore, finalTime, isCompleted);
    }
  }

  // 렌더링
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. 신비로운 겨울 협곡 및 오로라 밤하늘 배경
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#050c1e');
    skyGrad.addColorStop(0.5, '#0b1d3a');
    skyGrad.addColorStop(1, '#1b3252');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 오로라 광채
    const aurora = ctx.createRadialGradient(w * 0.5, 60, 20, w * 0.5, 80, 220);
    aurora.addColorStop(0, 'rgba(52, 211, 153, 0.35)');
    aurora.addColorStop(0.5, 'rgba(56, 189, 248, 0.2)');
    aurora.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aurora;
    ctx.fillRect(0, 0, w, 200);

    // 저 멀리 눈 덮인 산 실루엣
    ctx.fillStyle = '#0e1f38';
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.lineTo(120, 140);
    ctx.lineTo(240, 210);
    ctx.lineTo(380, 110);
    ctx.lineTo(540, 220);
    ctx.lineTo(680, 130);
    ctx.lineTo(w, 200);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 2. 깊은 계곡 심연
    const abyss = ctx.createLinearGradient(0, 240, 0, h);
    abyss.addColorStop(0, 'rgba(2, 6, 15, 0.4)');
    abyss.addColorStop(1, 'rgba(1, 3, 8, 0.95)');
    ctx.fillStyle = abyss;
    ctx.fillRect(0, 240, w, h - 240);

    // 3. 눈 덮인 흔들다리 그리기 (원근법 2.5D 전방 투영)
    const centerX = w / 2;
    const bridgeY = 280;
    const bridgeH = 170;

    // 다리 본체 (원근 사다리꼴)
    // 원거리(상단) 폭 100px -> 근거리(하단) 폭 170px
    const topWidth = 80;
    const botWidth = this.bridgeHalfWidth * 2.2;

    ctx.fillStyle = '#452b1b'; // 짙은 목재
    ctx.beginPath();
    ctx.moveTo(centerX - topWidth / 2, bridgeY);
    ctx.lineTo(centerX + topWidth / 2, bridgeY);
    ctx.lineTo(centerX + botWidth / 2, bridgeY + bridgeH);
    ctx.lineTo(centerX - botWidth / 2, bridgeY + bridgeH);
    ctx.closePath();
    ctx.fill();

    // 다리 발판 판자 및 눈 덮인 얼음 질감
    const numPlanks = 14;
    for (let i = 0; i < numPlanks; i++) {
      const t = i / numPlanks;
      const py = bridgeY + t * bridgeH;
      const pw = topWidth + (botWidth - topWidth) * t;

      // 나무 판자 경계선
      ctx.strokeStyle = '#27170c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - pw / 2, py);
      ctx.lineTo(centerX + pw / 2, py);
      ctx.stroke();

      // 판자 위 쌓인 미끄러운 눈과 얼음
      ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
      ctx.fillRect(centerX - pw / 2 + 4, py - 4, pw - 8, 4);
    }

    // 좌우 밧줄 난간 (Suspension Ropes)
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    // 좌측 밧줄
    ctx.beginPath();
    ctx.moveTo(centerX - topWidth / 2, bridgeY - 18);
    ctx.quadraticCurveTo(centerX - (topWidth + botWidth) / 4 - 8, bridgeY + bridgeH * 0.5, centerX - botWidth / 2, bridgeY + bridgeH - 24);
    ctx.stroke();
    // 우측 밧줄
    ctx.beginPath();
    ctx.moveTo(centerX + topWidth / 2, bridgeY - 18);
    ctx.quadraticCurveTo(centerX + (topWidth + botWidth) / 4 + 8, bridgeY + bridgeH * 0.5, centerX + botWidth / 2, bridgeY + bridgeH - 24);
    ctx.stroke();

    // 4. 건너편 도착지점의 따뜻한 오두막집 (Cabin)
    this.renderCabin(ctx, centerX, bridgeY - 10);

    // 5. 장애물 (굴러오는 눈덩이)
    for (const obs of this.obstacles) {
      const relPos = (obs.relDist - this.catDist);
      if (relPos > 0 && relPos < 20) {
        // 원근 투영 거리
        const distRatio = 1 - (relPos / 20); // 0 (먼 곳) ~ 1 (가까운 곳)
        const obsY = bridgeY + distRatio * bridgeH;
        const obsX = centerX + obs.x * (0.6 + distRatio * 0.6);
        const radius = obs.radius * (0.5 + distRatio * 0.7);

        ctx.fillStyle = '#f0f9ff';
        ctx.beginPath();
        ctx.arc(obsX, obsY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // 6. 플레이어 고양이 렌더링
    const catScreenY = bridgeY + bridgeH * 0.75;
    const catScreenX = centerX + this.catX;

    if (this.state === 'PLAYING') {
      // 걷는 방향에 따른 스프라이트
      let faceDir = 'up';
      if (this.catVelX > 5) faceDir = 'right';
      else if (this.catVelX < -5) faceDir = 'left';

      // 꼬리 및 귀여운 고양이 본체
      SpriteRenderer.drawCat(ctx, catScreenX, catScreenY, 36, faceDir, this.catWalkFrame, false);

      // 균형 인디케이터 (고양이 머리 위 미니 밸런스 바)
      const balanceRatio = (this.catX / this.bridgeHalfWidth); // -1.0 ~ +1.0
      const barW = 42;
      const barH = 5;
      const barY = catScreenY - 30;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.roundRect(catScreenX - barW / 2, barY, barW, barH, 2);
      ctx.fill();

      // 안전지대(초록) or 위험지대(빨강)
      const danger = Math.abs(balanceRatio);
      ctx.fillStyle = danger > 0.7 ? '#ef4444' : danger > 0.4 ? '#f59e0b' : '#10b981';
      ctx.beginPath();
      ctx.arc(catScreenX + (balanceRatio * (barW / 2 - 4)), barY + barH / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.state === 'FALLEN') {
      // 낙하 애니메이션 (회전하며 아래로)
      ctx.save();
      ctx.translate(catScreenX, catScreenY + this.fallAnimProgress * 120);
      ctx.rotate(this.fallAnimProgress * 5);
      SpriteRenderer.drawCat(ctx, 0, 0, 32, 'down', 0, false);
      ctx.restore();

      // "앗!" 말풍선
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px Pretendard';
      ctx.fillText('미끄러졌다냥! 💦', catScreenX - 35, catScreenY - 20);

    } else if (this.state === 'SUCCESS') {
      // 도착 환호 애니메이션 (집 앞에서 펄쩍 뜀)
      const hop = Math.abs(Math.sin(this.successAnimProgress * 12)) * 25;
      SpriteRenderer.drawCat(ctx, centerX, bridgeY - 15 - hop, 38, 'right', 0, false);

      // 도착 축하 메시지
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 20px Jua';
      ctx.textAlign = 'center';
      ctx.fillText('다리를 무사히 건넜어요! 🎉', centerX, bridgeY - 55);
    }

    // 7. 눈보라 파티클
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (const p of this.windParticles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8. 바람 방향 화살표 인디케이터
    if (Math.abs(this.windForce) > 8) {
      ctx.save();
      ctx.fillStyle = 'rgba(112, 214, 255, 0.75)';
      ctx.font = 'bold 13px Pretendard';
      const windText = this.windForce > 0 ? '▶ 강한 바람! ▶' : '◀ 강한 바람! ◀';
      ctx.fillText(windText, centerX - 45, bridgeY + 30);
      ctx.restore();
    }
  }

  // 도착 지점 오두막집
  renderCabin(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 오두막 벽체
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(-22, -26, 44, 26);

    // 눈 덮인 삼각 지붕
    ctx.fillStyle = '#991b1b'; // 붉은 기와
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.lineTo(-30, -24);
    ctx.lineTo(30, -24);
    ctx.closePath();
    ctx.fill();

    // 지붕 위 포근한 눈
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(0, -43);
    ctx.lineTo(-32, -23);
    ctx.lineTo(-24, -23);
    ctx.lineTo(0, -38);
    ctx.lineTo(24, -23);
    ctx.lineTo(32, -23);
    ctx.closePath();
    ctx.fill();

    // 굴뚝 & 연기
    ctx.fillStyle = '#44403c';
    ctx.fillRect(12, -45, 8, 14);
    ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
    ctx.beginPath();
    ctx.arc(16, -50 - ((Date.now() / 80) % 15), 4, 0, Math.PI * 2);
    ctx.fill();

    // 따뜻하게 빛나는 창문 (Golden Glow)
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.fillRect(-14, -20, 10, 10);
    ctx.fillRect(4, -20, 10, 10);
    ctx.shadowBlur = 0;

    // 창살
    ctx.strokeStyle = '#5c3a21';
    ctx.lineWidth = 1;
    ctx.strokeRect(-14, -20, 10, 10);
    ctx.strokeRect(4, -20, 10, 10);

    ctx.restore();
  }
}

window.BridgeMinigame = BridgeMinigame;
