/**
 * maze.js - 팩맨 스타일 21x21 미로 맵 생성 및 관리 (100 스테이지 대응)
 * 타일 크기: 32x32px (전체 캔버스 672x672px)
 */

class MazeManager {
  static COLS = 21;
  static ROWS = 21;
  static TILE_SIZE = 32;

  // 6가지 기본 미로 템플릿 (100개 스테이지에 걸쳐 다채롭게 순환 및 진화)
  static BASE_LAYOUTS = [
    // 0: 클래식 대칭 루프 맵
    [
      "111111111111111111111",
      "122222222212222222221",
      "121112111212111211121",
      "131112111212111211131",
      "122222222222222222221",
      "121112121111121211121",
      "122222122212221222221",
      "111112111010111211111",
      "000012100000001210000", // 좌우 터널
      "111112101555101211111", // 눈사람 펜 (5)
      "000002001555100200000", // 중앙 통로 및 좌우 포탈
      "111112101111101211111",
      "000012100000001210000",
      "111112121111121211111",
      "122222222212222222221",
      "121112111212111211121",
      "132212222262222212231", // 고양이 시작 위치 (6)
      "111212121111121212111",
      "122222122212221222221",
      "121111111212111111121",
      "111111111111111111111"
    ],

    // 1: 십자형 정원 맵
    [
      "111111111111111111111",
      "132222222212222222231",
      "121112111212111211121",
      "121112111212111211121",
      "122222222222222222221",
      "121112121111121211121",
      "122222122212221222221",
      "111112111000111211111",
      "000012100000001210000",
      "111112101555101211111",
      "000002001555100200000",
      "111112101111101211111",
      "000012100000001210000",
      "111112121111121211111",
      "122222222212222222221",
      "121112111212111211121",
      "122212222262222212221",
      "111212121111121212111",
      "122222122212221222221",
      "131111111212111111131",
      "111111111111111111111"
    ],

    // 2: 눈 덮인 원형 광장 맵
    [
      "111111111111111111111",
      "122222222212222222221",
      "121111211212112111121",
      "131111211212112111131",
      "122222222222222222221",
      "12112111111111121121",
      "122222222212222222221",
      "111112111000111211111",
      "000012100000001210000",
      "111112101555101211111",
      "000002001555100200000",
      "111112101111101211111",
      "000012100000001210000",
      "111112111111111211111",
      "122222222212222222221",
      "121121111212111121121",
      "132222222262222222231",
      "111211211111112112111",
      "122222222212222222221",
      "121111111212111111121",
      "111111111111111111111"
    ]
  ];

  constructor() {
    this.grid = [];
    this.catStart = { x: 10, y: 16 };
    this.ghostSpawn = { x: 10, y: 9 };
    this.totalCampfires = 0;
    this.remainingCampfires = 0;
    this.theme = 0;
  }

  // 스테이지별 맵 로드 및 초기화
  loadStage(stageNumber) {
    const layoutIdx = (stageNumber - 1) % MazeManager.BASE_LAYOUTS.length;
    const rawTemplate = MazeManager.BASE_LAYOUTS[layoutIdx];
    this.theme = Math.floor((stageNumber - 1) / 5) % 3; // 5스테이지마다 테마 전환

    this.grid = [];
    this.totalCampfires = 0;
    this.remainingCampfires = 0;

    for (let r = 0; r < MazeManager.ROWS; r++) {
      this.grid[r] = [];
      const rowStr = rawTemplate[r];
      for (let c = 0; c < MazeManager.COLS; c++) {
        let val = parseInt(rowStr[c], 10);
        
        // 고양이 시작점 기록
        if (val === 6) {
          this.catStart = { x: c, y: r };
          val = 0; // 시작 위치는 이동 가능한 빈 길
        } else if (val === 5) {
          this.ghostSpawn = { x: c, y: r };
        }

        // 모닥불 개수 집계
        if (val === 2 || val === 3) {
          this.totalCampfires++;
          this.remainingCampfires++;
        }

        this.grid[r][c] = val;
      }
    }

    // 보너스 특수 간식 (따뜻한 생선구이) 2개 무작위 배치
    this.spawnBonusSnacks(2);

    return {
      cols: MazeManager.COLS,
      rows: MazeManager.ROWS,
      tileSize: MazeManager.TILE_SIZE,
      catStart: this.catStart,
      ghostSpawn: this.ghostSpawn,
      totalCampfires: this.totalCampfires
    };
  }

  // 특수 온기 간식 배치
  spawnBonusSnacks(count = 2) {
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < 100) {
      attempts++;
      const rx = Math.floor(Math.random() * MazeManager.COLS);
      const ry = Math.floor(Math.random() * MazeManager.ROWS);
      if (this.grid[ry][rx] === 2) {
        this.grid[ry][rx] = 4; // 4: 보너스 간식 (+25점)
        placed++;
      }
    }
  }

  // 고스테이지에서 맵 내 모닥불을 모두 수집했을 때 온기 재충전
  replenishCampfires() {
    this.totalCampfires = 0;
    this.remainingCampfires = 0;

    for (let r = 0; r < MazeManager.ROWS; r++) {
      for (let c = 0; c < MazeManager.COLS; c++) {
        if (this.grid[r][c] === 0) {
          // 중앙 펜이나 포탈 지역 제외
          if (!(r >= 8 && r <= 12 && c >= 7 && c <= 13)) {
            // 8% 확률로 대형 모닥불, 나머지 일반 모닥불
            this.grid[r][c] = (Math.random() < 0.08) ? 3 : 2;
            this.totalCampfires++;
            this.remainingCampfires++;
          }
        }
      }
    }
    this.spawnBonusSnacks(2);
  }

  isWall(tileX, tileY) {
    if (tileY < 0 || tileY >= MazeManager.ROWS) return true;
    // 터널 포탈 구역(좌우 밖) 허용
    if (tileX < 0 || tileX >= MazeManager.COLS) return false;
    return this.grid[tileY][tileX] === 1;
  }

  // 맵 렌더링
  render(ctx, animTime) {
    const size = MazeManager.TILE_SIZE;

    for (let r = 0; r < MazeManager.ROWS; r++) {
      for (let c = 0; c < MazeManager.COLS; c++) {
        const type = this.grid[r][c];
        const px = c * size;
        const py = r * size;

        if (type === 1) {
          // 벽
          SpriteRenderer.drawWallTile(ctx, px, py, size, this.theme);
        } else if (type === 2) {
          // 일반 모닥불 (+1점)
          SpriteRenderer.drawCampfire(ctx, px + size / 2, py + size / 2, size, animTime, false);
        } else if (type === 3) {
          // 대형 모닥불 (+10점)
          SpriteRenderer.drawCampfire(ctx, px + size / 2, py + size / 2, size, animTime, true);
        } else if (type === 4) {
          // 보너스 온기 간식 (+25점)
          SpriteRenderer.drawBonusItem(ctx, px + size / 2, py + size / 2, size, 'fish');
        }
      }
    }
  }
}

window.MazeManager = MazeManager;
