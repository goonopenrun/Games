/**
 * sprites.js - 캔버스 2D 고품질 절차적 벡터 스프라이트 렌더러
 * 귀여운 고양이, 눈사람, 모닥불, 특수 간식, 벽 타일 등
 */

class SpriteRenderer {
  // 1. 아기 고양이 그리기
  static drawCat(ctx, x, y, size, dir = 'right', walkFrame = 0, isInvincible = false) {
    ctx.save();
    ctx.translate(x, y);

    // 무적 상태 깜빡임
    if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    const scale = size / 32;
    ctx.scale(scale, scale);

    // 꼬리 흔들기 애니메이션
    const tailAngle = Math.sin(walkFrame * 0.2) * 0.35;
    ctx.save();
    ctx.translate(-7, 4);
    ctx.rotate(tailAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-8, -4, -10, -10);
    ctx.strokeStyle = '#f48c06'; // 치즈태비 주황
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    // 꼬리 끝 흰색 털
    ctx.beginPath();
    ctx.arc(-10, -10, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // 발걸음 오프셋
    const legOffset = Math.sin(walkFrame * 0.35) * 2;

    // 뒷발 & 앞발
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-6, 10 + legOffset, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(6, 10 - legOffset, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 고양이 몸통 (포근한 치즈빛 타원)
    ctx.fillStyle = '#f48c06';
    ctx.beginPath();
    ctx.ellipse(0, 3, 10, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 배 부분 부드러운 흰 털
    ctx.fillStyle = '#fff4e6';
    ctx.beginPath();
    ctx.ellipse(0, 5, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 얼굴 방향 설정
    let faceOffset = 0;
    if (dir === 'left') faceOffset = -2;
    else if (dir === 'right') faceOffset = 2;

    // 머리
    const headY = -4;
    ctx.fillStyle = '#f48c06';
    ctx.beginPath();
    ctx.arc(faceOffset, headY, 9.5, 0, Math.PI * 2);
    ctx.fill();

    // 쫑긋한 양쪽 귀
    // 왼쪽 귀
    ctx.beginPath();
    ctx.moveTo(faceOffset - 7, headY - 4);
    ctx.lineTo(faceOffset - 9, headY - 14);
    ctx.lineTo(faceOffset - 2, headY - 7);
    ctx.closePath();
    ctx.fillStyle = '#f48c06';
    ctx.fill();
    // 왼쪽 귀 안쪽 분홍
    ctx.beginPath();
    ctx.moveTo(faceOffset - 6.5, headY - 5);
    ctx.lineTo(faceOffset - 8, headY - 11);
    ctx.lineTo(faceOffset - 3, headY - 7);
    ctx.closePath();
    ctx.fillStyle = '#ffb3c6';
    ctx.fill();

    // 오른쪽 귀
    ctx.beginPath();
    ctx.moveTo(faceOffset + 2, headY - 7);
    ctx.lineTo(faceOffset + 9, headY - 14);
    ctx.lineTo(faceOffset + 7, headY - 4);
    ctx.closePath();
    ctx.fillStyle = '#f48c06';
    ctx.fill();
    // 오른쪽 귀 안쪽 분홍
    ctx.beginPath();
    ctx.moveTo(faceOffset + 3, headY - 7);
    ctx.lineTo(faceOffset + 8, headY - 11);
    ctx.lineTo(faceOffset + 6.5, headY - 5);
    ctx.closePath();
    ctx.fillStyle = '#ffb3c6';
    ctx.fill();

    // 이마 태비 줄무늬
    ctx.fillStyle = '#d00000';
    ctx.beginPath();
    ctx.arc(faceOffset, headY - 6, 1.2, 0, Math.PI * 2);
    ctx.arc(faceOffset - 3, headY - 5, 1, 0, Math.PI * 2);
    ctx.arc(faceOffset + 3, headY - 5, 1, 0, Math.PI * 2);
    ctx.fill();

    // 반짝이는 큰 눈망울
    const eyeY = headY - 1;
    const eyeSpacing = 4.5;
    ctx.fillStyle = '#212529'; // 짙은 눈동자
    ctx.beginPath();
    ctx.arc(faceOffset - eyeSpacing, eyeY, 2.2, 0, Math.PI * 2);
    ctx.arc(faceOffset + eyeSpacing, eyeY, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 눈 속 별빛 하이라이트
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(faceOffset - eyeSpacing - 0.7, eyeY - 0.7, 0.9, 0, Math.PI * 2);
    ctx.arc(faceOffset + eyeSpacing - 0.7, eyeY - 0.7, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // 분홍빛 코
    ctx.fillStyle = '#ff758f';
    ctx.beginPath();
    ctx.ellipse(faceOffset, headY + 2.2, 1.4, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // 귀여운 입 (w 모양)
    ctx.strokeStyle = '#9d0208';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(faceOffset - 1.2, headY + 3.8, 1.4, 0, Math.PI);
    ctx.arc(faceOffset + 1.2, headY + 3.8, 1.4, 0, Math.PI);
    ctx.stroke();

    // 양쪽 수염
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.7;
    // 좌측 수염
    ctx.beginPath();
    ctx.moveTo(faceOffset - 3.5, headY + 2.5);
    ctx.lineTo(faceOffset - 10, headY + 1.5);
    ctx.moveTo(faceOffset - 3.5, headY + 3.5);
    ctx.lineTo(faceOffset - 10, headY + 4.5);
    // 우측 수염
    ctx.moveTo(faceOffset + 3.5, headY + 2.5);
    ctx.lineTo(faceOffset + 10, headY + 1.5);
    ctx.moveTo(faceOffset + 3.5, headY + 3.5);
    ctx.lineTo(faceOffset + 10, headY + 4.5);
    ctx.stroke();

    // 빨간 털목도리 (따뜻한 겨울 느낌 극대화)
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.ellipse(faceOffset, headY + 5.5, 7.5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // 목도리 꼬리 날림
    ctx.beginPath();
    ctx.roundRect(faceOffset + 3, headY + 4.5, 4.5, 7, 2);
    ctx.fill();
    // 목도리 끝 수술 장식
    ctx.fillStyle = '#f1faee';
    ctx.fillRect(faceOffset + 3, headY + 10.5, 4.5, 1.5);

    ctx.restore();
  }

  // 2. 눈사람 몬스터 그리기
  static drawSnowman(ctx, x, y, size, animTime = 0, variant = 0) {
    ctx.save();
    ctx.translate(x, y);

    const scale = size / 32;
    ctx.scale(scale, scale);

    // 콩콩 뛰는 애니메이션
    const hop = Math.sin(animTime * 6 + variant * 1.5) * 2;
    ctx.translate(0, hop);

    // 바닥 눈 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 13 - hop * 0.5, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 눈사람 하단 큰 눈뭉치
    const gradientBody = ctx.createRadialGradient(-2, 5, 2, 0, 6, 10);
    gradientBody.addColorStop(0, '#ffffff');
    gradientBody.addColorStop(0.75, '#e0f2fe');
    gradientBody.addColorStop(1, '#bae6fd');

    ctx.fillStyle = gradientBody;
    ctx.beginPath();
    ctx.arc(0, 6, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 몸통 단추 (검은 숯)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 4, 1.2, 0, Math.PI * 2);
    ctx.arc(0, 8, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 눈사람 상단 작은 눈뭉치 (얼굴)
    const gradientHead = ctx.createRadialGradient(-1.5, -5, 1.5, 0, -4, 7);
    gradientHead.addColorStop(0, '#ffffff');
    gradientHead.addColorStop(0.8, '#e0f2fe');
    gradientHead.addColorStop(1, '#93c5fd');

    ctx.fillStyle = gradientHead;
    ctx.beginPath();
    ctx.arc(0, -4, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 눈사람 털목도리
    const scarfColors = ['#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];
    const scarfColor = scarfColors[variant % scarfColors.length];
    ctx.fillStyle = scarfColor;
    ctx.beginPath();
    ctx.ellipse(0, 1.5, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // 목도리 자락
    ctx.beginPath();
    ctx.roundRect(1.5, 1, 3.2, 6, 1);
    ctx.fill();

    // 검은 숯 눈
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-2.4, -5.5, 1.2, 0, Math.PI * 2);
    ctx.arc(2.4, -5.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 주황색 당근 코
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(0, -4.5);
    ctx.lineTo(5.5, -3.8);
    ctx.lineTo(0, -3.2);
    ctx.closePath();
    ctx.fill();

    // 숯 미소 (작은 점 세 개)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(-2, -1.8, 0.7, 0, Math.PI * 2);
    ctx.arc(0, -1.4, 0.7, 0, Math.PI * 2);
    ctx.arc(2, -1.8, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 겨울 털모자 (비니)
    ctx.fillStyle = scarfColor;
    ctx.beginPath();
    ctx.arc(0, -9, 5.5, Math.PI, Math.PI * 2);
    ctx.fill();
    // 모자 방울
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -11.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 3. 따뜻한 모닥불 (Campfire)
  static drawCampfire(ctx, x, y, size, animTime = 0, isLarge = false) {
    ctx.save();
    ctx.translate(x, y);

    const baseScale = isLarge ? (size / 24) : (size / 28);
    ctx.scale(baseScale, baseScale);

    // 따뜻한 주변 원형 온기 광륜 (Warm Ambient Glow)
    const glowRadius = isLarge ? 26 : 18;
    const radialGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, glowRadius);
    radialGlow.addColorStop(0, 'rgba(255, 140, 20, 0.45)');
    radialGlow.addColorStop(0.5, 'rgba(255, 90, 0, 0.18)');
    radialGlow.addColorStop(1, 'rgba(255, 60, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // 바닥 받침 장작 (Crossed wooden logs)
    ctx.fillStyle = '#6b3e26';
    ctx.save();
    ctx.rotate(0.4);
    ctx.fillRect(-6, 3, 12, 3);
    ctx.restore();
    ctx.save();
    ctx.rotate(-0.4);
    ctx.fillRect(-6, 3, 12, 3);
    ctx.restore();

    // 붉은 숯불 베이스
    ctx.fillStyle = '#d00000';
    ctx.beginPath();
    ctx.ellipse(0, 4, 4.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 흔들리는 바깥 불꽃 (주황/빨강)
    const flick1 = Math.sin(animTime * 14) * 1.5;
    const flick2 = Math.cos(animTime * 18) * 1.2;

    ctx.fillStyle = '#ff5400';
    ctx.beginPath();
    ctx.moveTo(-5, 4);
    ctx.quadraticCurveTo(-6 + flick1, -3, 0 + flick2, -10);
    ctx.quadraticCurveTo(6 - flick2, -3, 5, 4);
    ctx.closePath();
    ctx.fill();

    // 중심부 밝은 노랑 불꽃
    ctx.fillStyle = '#ffbe0b';
    ctx.beginPath();
    ctx.moveTo(-3, 4);
    ctx.quadraticCurveTo(-3 + flick2, -1, 0 + flick1, -6);
    ctx.quadraticCurveTo(3 - flick1, -1, 3, 4);
    ctx.closePath();
    ctx.fill();

    // 불꽃 중심 하얀 심지
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 위로 솟아오르는 작고 따뜻한 불씨 파티클
    const spark1Y = -8 - ((animTime * 25) % 8);
    const spark2Y = -6 - (((animTime * 30) + 4) % 10);
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(flick1 * 1.2, spark1Y, 0.8, 0, Math.PI * 2);
    ctx.arc(-flick2 * 1.4, spark2Y, 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 4. 특수 보너스 간식 (구운 생선 / 핫초코)
  static drawBonusItem(ctx, x, y, size, type = 'fish') {
    ctx.save();
    ctx.translate(x, y);
    const scale = size / 26;
    ctx.scale(scale, scale);

    // 황금빛 보너스 후광
    ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'fish') {
      // 따뜻한 꽁치 구이 🐟
      ctx.fillStyle = '#3a86ff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 4.5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // 꼬리 지느러미
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-13, -4);
      ctx.lineTo(-11, 0);
      ctx.lineTo(-13, 4);
      ctx.closePath();
      ctx.fill();
      // 눈
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -1, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(6.5, -1, 0.6, 0, Math.PI * 2);
      ctx.fill();
      // 노릇노릇 그릴 줄무늬
      ctx.strokeStyle = '#6b3e26';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-2, -3); ctx.lineTo(-1, 3);
      ctx.moveTo(2, -3); ctx.lineTo(3, 3);
      ctx.stroke();
    } else {
      // 김이 모락모락 나는 핫초코 머그잔 ☕
      ctx.fillStyle = '#ef4444'; // 빨간 머그
      ctx.beginPath();
      ctx.roundRect(-6, -4, 12, 10, 2);
      ctx.fill();
      // 손잡이
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(7, 1, 3, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      // 핫초코 윗면
      ctx.fillStyle = '#4a2810';
      ctx.beginPath();
      ctx.ellipse(0, -4, 5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // 모락모락 김
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-2, -7);
      ctx.quadraticCurveTo(-4, -10, -2, -12);
      ctx.moveTo(2, -7);
      ctx.quadraticCurveTo(4, -10, 2, -12);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 5. 스테이지 벽 타일 (겨울/얼음 벽돌)
  static drawWallTile(ctx, x, y, size, theme = 0) {
    ctx.save();
    
    // 테마별 색상 팔레트
    let baseColor = '#152238';
    let borderColor = '#3a86ff';
    let snowCapColor = '#e0f2fe';

    if (theme === 1) { // 크리스탈 동굴
      baseColor = '#1e1b4b';
      borderColor = '#a855f7';
      snowCapColor = '#f3e8ff';
    } else if (theme === 2) { // 오로라 협곡
      baseColor = '#064e3b';
      borderColor = '#34d399';
      snowCapColor = '#d1fae5';
    }

    // 벽 본체
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, size, size);

    // 네온 글래스 테두리
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

    // 벽 윗면 쌓인 포근한 눈
    ctx.fillStyle = snowCapColor;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, size - 4, 3, 2);
    ctx.fill();

    ctx.restore();
  }
}

window.SpriteRenderer = SpriteRenderer;
