// ==========================================
// MoaMoa Fruit Shop - Main Game Engine
// 7x7 Match-3 Puzzle + Shop Expansion + 100 Stages
// ==========================================

const FRUIT_TYPES = [
  { id: 'apple', name: '사과', icon: '🍎', color: '#ff4757', juiceColor: 'rgba(255, 71, 87, 0.8)' },
  { id: 'banana', name: '바나나', icon: '🍌', color: '#ffa502', juiceColor: 'rgba(255, 165, 2, 0.8)' },
  { id: 'grape', name: '포도', icon: '🍇', color: '#9b59b6', juiceColor: 'rgba(155, 89, 182, 0.8)' },
  { id: 'orange', name: '오렌지', icon: '🍊', color: '#ff7f50', juiceColor: 'rgba(255, 127, 80, 0.8)' },
  { id: 'strawberry', name: '딸기', icon: '🍓', color: '#ff3838', juiceColor: 'rgba(255, 56, 56, 0.8)' },
  { id: 'watermelon', name: '수박', icon: '🍉', color: '#2ed573', juiceColor: 'rgba(46, 213, 115, 0.8)' },
  { id: 'peach', name: '복숭아', icon: '🍑', color: '#ff9ff3', juiceColor: 'rgba(255, 159, 243, 0.8)' },
  { id: 'pineapple', name: '파인애플', icon: '🍍', color: '#feca57', juiceColor: 'rgba(254, 202, 87, 0.8)' },
  { id: 'kiwi', name: '키위', icon: '🥝', color: '#10ac84', juiceColor: 'rgba(16, 172, 132, 0.8)' },
  { id: 'mango', name: '망고', icon: '🥭', color: '#ff9f43', juiceColor: 'rgba(255, 159, 67, 0.85)' },
  { id: 'cherry', name: '체리', icon: '🍒', color: '#ee5253', juiceColor: 'rgba(238, 82, 83, 0.85)' }
];

// 10, 20, 30 ... 등 10단계 단위로 점점 발전하는 과일가게 일러스트 화면 데이터
const STAGE_MILESTONES = {
  10: {
    stage: 10,
    title: '지붕 달린 아담한 목조 과일 상점',
    badge: '🌱 1차 상점 발전',
    sub: '소박했던 과일 수레가 어엿한 지붕과 가판대를 갖춘 목조 상점으로 발전했습니다!',
    img: 'assets/growth_10.jpg',
    story: '향긋한 과일 향기를 맡고 마을 주민들이 찾아오기 시작했습니다. 과일 상자가 하나둘 늘어나며, 가게가 활기를 띱니다!',
    nextRule: '💡 다음 11단계부터는 과일 종류가 8개로 늘어나며, 주변을 얼려버리는 [얼음 과일] 방해물이 출현합니다!'
  },
  20: {
    stage: 20,
    title: '정겨운 골목길의 인기 과일가게',
    badge: '🛖 2차 상점 발전',
    sub: '꽃과 화분, 정겨운 조명으로 꾸며진 골목길 최고의 명소로 자리잡았습니다!',
    img: 'assets/growth_10.jpg',
    story: '단골 손님들의 발길이 끊이지 않습니다. 신선한 복숭아와 달콤한 딸기가 매일 불티나게 팔려나갑니다.',
    nextRule: '💡 더욱 늘어난 과일들과 꽁꽁 얼어붙는 얼음 과일을 조심하세요!'
  },
  30: {
    stage: 30,
    title: '활기 넘치는 전통 청과물 마켓',
    badge: '🏪 3차 상점 발전',
    sub: '신선한 과일들이 상자마다 가득 쌓인 대형 청과 마켓으로 크게 확장되었습니다!',
    img: 'assets/growth_30.jpg',
    story: '전통 시장 골목을 대표하는 청과 명가가 되었습니다. 알록달록한 제등 아래 수많은 손님들이 환호합니다.',
    nextRule: '💡 다음 31단계부터는 과일 종류가 9개로 증가하고, 과일 배열을 무작위로 섞어버리는 [썩은 과일] 방해물이 새롭게 출현합니다!'
  },
  40: {
    stage: 40,
    title: '과일 명가의 산지 직송 직판장',
    badge: '📦 4차 상점 발전',
    sub: '전국 농가에서 매일 아침 직송되는 최고급 명품 과일들을 한가득 선보입니다!',
    img: 'assets/growth_30.jpg',
    story: '신선함이 가득한 과일 박스들이 끊임없이 입고됩니다. 이제 동네를 넘어 이웃 마을까지 입소문이 퍼졌습니다.',
    nextRule: '💡 얼음 과일과 썩은 과일이 동시에 보드를 위협합니다. 물폭탄을 만들어 대비하세요!'
  },
  50: {
    stage: 50,
    title: '향긋한 도심 속 과일 가든 샵',
    badge: '🌿 5차 상점 발전',
    sub: '달콤한 과일 향기와 싱그러운 식물이 어우러진 도심 속 힐링 과일 정원!',
    img: 'assets/shop_bg.jpg',
    story: '손님들이 편안하게 쉬어가며 제철 과일을 맛볼 수 있는 멋진 가든 테라스가 완성되었습니다.',
    nextRule: '💡 50단계를 넘어선 진정한 프로 청과 마스터의 길! 고난도 매칭을 이어가세요.'
  },
  60: {
    stage: 60,
    title: '모던 프리미엄 오가닉 부티크',
    badge: '✨ 6차 상점 발전',
    sub: '세련된 유리 쇼케이스와 유기농 생과일 스무디 카페를 결합한 트렌디한 부티크!',
    img: 'assets/growth_60.jpg',
    story: '신선한 과일 착즙 쥬스와 디저트를 즐기려는 트렌디한 손님들로 문전성시를 이룹니다.',
    nextRule: '💡 다음 61단계부터는 과일 종류가 최대 10개로 증가하며, 얼음과일과 썩은과일의 방해 공세가 한층 더 거세집니다!'
  },
  70: {
    stage: 70,
    title: '하이엔드 프루트 갤러리 라운지',
    badge: '💎 7차 상점 발전',
    sub: '과일 하나하나가 예술 작품처럼 빛나는 최고급 과일 갤러리 샵!',
    img: 'assets/growth_60.jpg',
    story: '엄격하게 선별된 극상의 당도를 자랑하는 명품 과일들만이 진열되는 럭셔리 라운지입니다.',
    nextRule: '💡 10종류의 과일 속에서 장바구니 한 줄 매칭을 노려 30초 보너스 타임을 적극 공략하세요!'
  },
  80: {
    stage: 80,
    title: '모아모아 하베스트 페스티벌 마켓',
    badge: '🎆 8차 상점 발전',
    sub: '일년 365일 축제의 불꽃놀이가 터지는 반짝이는 과일 대축제의 장!',
    img: 'assets/bonus_bg.jpg',
    story: '밤하늘을 수놓는 불꽃과 조명 아래, 온 마을 사람들이 모여 과일 축제를 만끽합니다.',
    nextRule: '💡 얼음과 썩은 과일의 출현 빈도가 절정에 달합니다. 신속한 순발력으로 판을 정화하세요!'
  },
  90: {
    stage: 90,
    title: '월드 프루트 메가타워',
    badge: '🗼 9차 상점 발전',
    sub: '전 세계의 모든 진귀한 과일을 만날 수 있는 웅장한 대형 프루트 타워!',
    img: 'assets/bonus_bg.jpg',
    story: '국제적인 명성을 얻은 과일 랜드마크가 되었습니다. 대망의 100단계 정복까지 단 10걸음 남았습니다!',
    nextRule: '💡 마지막 100단계를 향한 궁극의 챌린지! 최고 득점에 도전하세요!'
  },
  100: {
    stage: 100,
    title: '그랜드 모아모아 과일 팰리스 원더랜드',
    badge: '👑 최종 궁극의 과일 왕국',
    sub: '거대한 유리 돔 온실과 황금 과일 나무가 찬란히 빛나는 전설의 과일 왕국 완성!',
    img: 'assets/growth_100.jpg',
    story: '작은 나무 수레에서 시작하여 마침내 전 세계 모든 사람들의 꿈이 담긴 과일 파라다이스를 세웠습니다! 수많은 축하 인파와 분수대가 당신의 위대한 업적을 찬양합니다.',
    nextRule: '🏆 대망의 최종 100단계! 과일의 제왕으로서 최고의 퍼즐 실력을 보여주세요!'
  }
};

const SHOP_LEVELS = [
  {
    level: 1,
    name: '소박한 과일 수레',
    cost: 0,
    desc: '작은 나무 수레에서 시작하는 정겨운 과일 장사!',
    badge: '🛞 초보 장사꾼',
    scoreBonus: 0,
    icon: '🛒'
  },
  {
    level: 2,
    name: '정겨운 골목 과일가게',
    cost: 5000,
    desc: '지붕과 아늑한 조명이 생긴 골목길의 명소!',
    badge: '🛖 동네 인기상점',
    scoreBonus: 0.10,
    icon: '🛖'
  },
  {
    level: 3,
    name: '활기찬 청과물 마켓',
    cost: 15000,
    desc: '매일 아침 신선한 과일이 가득한 전통 청과 마켓!',
    badge: '🏪 청과 명가',
    scoreBonus: 0.20,
    icon: '🏪'
  },
  {
    level: 4,
    name: '프리미엄 오가닉 부티크',
    cost: 35000,
    desc: '유기농 명품 과일과 생과일 쥬스를 판매하는 세련된 샵!',
    badge: '✨ 프리미엄 부티크',
    scoreBonus: 0.35,
    icon: '🏬'
  },
  {
    level: 5,
    name: '그랜드 모아모아 과일 랜드',
    cost: 80000,
    desc: '전국에서 손님이 찾아오는 과일 테마파크 백화점!',
    badge: '👑 과일의 제왕',
    scoreBonus: 0.50,
    icon: '🏰'
  }
];

class FruitShopGame {
  constructor() {
    this.boardSize = 7;
    this.grid = [];
    this.selectedCell = null;
    this.isProcessing = false;
    this.dragStartCell = null;

    // 게임 상태
    this.currentStage = 1;
    this.score = 0;
    this.targetScore = 1500;
    this.timeLeft = 60;
    this.timerInterval = null;
    this.isPlaying = false;
    this.isBonusStage = false;
    this.hasBasket = false;
    this.currentFruitPool = [];
    this.comboCount = 0;

    // 지속 데이터
    this.userGold = parseInt(localStorage.getItem('moamoa_gold') || '0', 10);
    this.shopLevel = parseInt(localStorage.getItem('moamoa_shop_level') || '1', 10);
    this.unlockedStage = parseInt(localStorage.getItem('moamoa_unlocked_stage') || '1', 10);
    this.viewedMilestones = JSON.parse(localStorage.getItem('moamoa_viewed_milestones') || '{}');

    this.initDOM();
    this.initCanvas();
    this.bindEvents();
    this.updateShopUI();
    this.loadStage(this.unlockedStage);
  }


  initDOM() {
    this.dom = {
      board: document.getElementById('game-board'),
      score: document.getElementById('current-score'),
      targetScore: document.getElementById('target-score'),
      timer: document.getElementById('timer-val'),
      timerBar: document.getElementById('timer-bar-fill'),
      stageBadge: document.getElementById('current-stage-badge'),
      stageName: document.getElementById('stage-title'),
      goldVal: document.getElementById('gold-val'),
      basketSlot: document.getElementById('basket-slot'),
      shopLevelTitle: document.getElementById('shop-level-title'),
      shopBonusTag: document.getElementById('shop-bonus-tag'),
      shopAvatar: document.getElementById('shop-avatar-icon'),
      modalOverlay: document.getElementById('modal-overlay'),
      modalTitle: document.getElementById('modal-title'),
      modalBody: document.getElementById('modal-body'),
      modalActionBtn: document.getElementById('modal-action-btn'),
      modalCloseBtn: document.getElementById('modal-close-btn'),
      stageListContainer: document.getElementById('stage-grid-list'),
      shopModalList: document.getElementById('shop-upgrade-list'),
      stageFruitPreview: document.getElementById('stage-fruit-preview'),
      bonusOverlay: document.getElementById('bonus-indicator-banner'),
      appContainer: document.getElementById('app-container')
    };
  }

  initCanvas() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    const renderLoop = () => {
      this.updateParticles();
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  spawnParticle(x, y, color, count = 12, speed = 4) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * 8 + 4,
        alpha: 1,
        color: color,
        life: 0.02 + Math.random() * 0.03
      });
    }
  }

  spawnWaterSplash(x, y) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 7 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * 12 + 6,
        alpha: 0.9,
        color: '#00d2d3',
        life: 0.025
      });
    }
  }

  updateParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // 중력
      p.alpha -= p.life;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  // ==========================================
  // 스테이지 설정 및 시작
  // ==========================================
  getStageConfig(stageNum) {
    const s = Math.min(Math.max(1, stageNum), 100);

    // 1. 단계별 과일 종류 및 방해 아이템 갯수 규칙:
    // - 1~10단계: 과일 7개, 방해 아이템 - 없음
    // - 11~30단계: 과일 8개, 방해 아이템 - 얼음과일 등장
    // - 31~60단계: 과일 9개, 방해 아이템 - 얼음과일/썩은과일 등장
    // - 61~100단계: 과일 10개, 방해 아이템 - 얼음과일/썩은과일 등장
    let fruitCount = 7;
    let allowIce = false;
    let allowRotten = false;
    let iceChance = 0;
    let rottenChance = 0;
    let initialIceCount = 0;
    let initialRottenCount = 0;

    if (s <= 10) {
      fruitCount = 7;
      allowIce = false;
      allowRotten = false;
      iceChance = 0;
      rottenChance = 0;
      initialIceCount = 0;
      initialRottenCount = 0;
    } else if (s <= 30) {
      fruitCount = 8;
      allowIce = true;
      allowRotten = false;
      iceChance = 0.06 + (s - 11) * 0.003; // 얼음과일만 등장
      rottenChance = 0;
      initialIceCount = Math.min(3, 1 + Math.floor((s - 11) / 8));
      initialRottenCount = 0;
    } else if (s <= 60) {
      fruitCount = 9;
      allowIce = true;
      allowRotten = true;
      iceChance = 0.08 + (s - 31) * 0.002;
      rottenChance = 0.05 + (s - 31) * 0.002;
      initialIceCount = Math.min(4, 2 + Math.floor((s - 31) / 10));
      initialRottenCount = Math.min(2, 1 + Math.floor((s - 31) / 15));
    } else {
      fruitCount = 10;
      allowIce = true;
      allowRotten = true;
      iceChance = 0.12 + (s - 61) * 0.002;
      rottenChance = 0.08 + (s - 61) * 0.002;
      initialIceCount = Math.min(5, 2 + Math.floor((s - 61) / 9));
      initialRottenCount = Math.min(3, 1 + Math.floor((s - 61) / 13));
    }

    const target = 1500 + (s - 1) * 350;

    return {
      stage: s,
      fruitCount: fruitCount,
      targetScore: target,
      timeLimit: 60,
      allowIce: allowIce,
      allowRotten: allowRotten,
      iceChance: iceChance,
      rottenChance: rottenChance,
      initialIceCount: initialIceCount,
      initialRottenCount: initialRottenCount
    };
  }

  loadStage(stageNum, autoStart = false) {
    this.currentStage = stageNum;
    this.config = this.getStageConfig(stageNum);
    this.score = 0;
    this.targetScore = this.config.targetScore;
    this.timeLeft = this.config.timeLimit;
    this.hasBasket = false;
    this.isBonusStage = false;
    this.comboCount = 0;
    this.isProcessing = false;
    this.selectedCell = null;

    // 과일 풀 랜덤 선택 (규칙: "각 스테이지 마다 등장하는 과일은 랜덤이다")
    const shuffledFruits = [...FRUIT_TYPES].sort(() => Math.random() - 0.5);
    this.currentFruitPool = shuffledFruits.slice(0, this.config.fruitCount);

    this.updateHUD();
    this.renderStageFruitPreview();
    this.buildBoard();
    this.resetTimer();

    // 10, 20, 30 ... 등 각 10단계 주기마다 발전하는 과일가게 일러스트 화면을 게임 플레이 전에 표시
    if (stageNum % 10 === 0 && STAGE_MILESTONES[stageNum]) {
      this.showMilestoneIntroModal(stageNum);
    } else if (autoStart) {
      this.startStage();
    }
  }

  showMilestoneIntroModal(stageNum) {
    const data = STAGE_MILESTONES[stageNum];
    if (!data) return;

    window.soundEngine.playVictory();

    const bodyHtml = `
      <div class="milestone-growth-container">
        <div class="milestone-img-wrap">
          <img src="${data.img}" alt="${data.title}" class="milestone-growth-img" />
          <div class="milestone-badge-tag">${data.badge}</div>
        </div>
        <div class="milestone-text-block">
          <h3 class="milestone-title">Stage ${stageNum} : ${data.title}</h3>
          <p class="milestone-sub">${data.sub}</p>
          <p class="milestone-story">${data.story}</p>
          <div class="milestone-rule-card">${data.nextRule}</div>
        </div>
      </div>
    `;

    this.openModal({
      title: `🎉 Stage ${stageNum} 과일가게 발전 달성!`,
      body: bodyHtml,
      actionText: `🚀 발전된 가게에서 게임 시작하기!`,
      actionCallback: () => {
        this.startStage();
      }
    });
  }

  renderStageFruitPreview() {
    this.dom.stageFruitPreview.innerHTML = '';
    this.currentFruitPool.forEach(fruit => {
      const tag = document.createElement('span');
      tag.className = 'fruit-tag';
      tag.innerHTML = `${fruit.icon} ${fruit.name}`;
      tag.style.borderColor = fruit.color;
      this.dom.stageFruitPreview.appendChild(tag);
    });
  }

  startStage() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    window.soundEngine.init();
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const maxTime = this.isBonusStage ? 30 : this.config.timeLimit;
    this.dom.timerBar.style.width = '100%';

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.dom.timer.textContent = this.timeLeft;
      const pct = Math.max(0, (this.timeLeft / maxTime) * 100);
      this.dom.timerBar.style.width = `${pct}%`;

      if (this.timeLeft <= 10) {
        this.dom.timer.classList.add('urgent');
      } else {
        this.dom.timer.classList.remove('urgent');
      }

      // 썩은 과일 자동 체크 (규칙: 썩은 과일이 있으면 보드 셔플 교란)
      if (this.config.allowRotten && this.timeLeft % 8 === 0 && this.hasRottenFruitOnBoard()) {
        this.triggerRottenShuffle();
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeUp();
      }
    }, 1000);
  }

  resetTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isPlaying = false;
    this.timeLeft = this.isBonusStage ? 30 : this.config.timeLimit;
    this.dom.timer.textContent = this.timeLeft;
    this.dom.timerBar.style.width = '100%';
    this.dom.timer.classList.remove('urgent');
  }

  // ==========================================
  // 보드 생성 및 초기화
  // ==========================================
  buildBoard() {
    this.grid = [];
    this.dom.board.innerHTML = '';

    // 7x7 빈 그리드 생성
    for (let r = 0; r < this.boardSize; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.boardSize; c++) {
        this.grid[r][c] = null;
      }
    }

    // 초기 매치 없는 무결성 과일 배치
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        let candidate;
        do {
          candidate = this.getRandomFruit();
        } while (
          (c >= 2 && this.grid[r][c - 1]?.type === candidate.id && this.grid[r][c - 2]?.type === candidate.id) ||
          (r >= 2 && this.grid[r - 1][c]?.type === candidate.id && this.grid[r - 2][c]?.type === candidate.id)
        );

        this.grid[r][c] = {
          r: r,
          c: c,
          type: candidate.id,
          special: null, // 'waterbomb', 'ice', 'rotten'
          fruitData: candidate
        };
      }
    }

    // 방해 아이템 초기 스폰 (보너스 스테이지가 아닐 때)
    if (!this.isBonusStage) {
      this.spawnInitialObstacles();
    }

    this.renderBoard();
  }

  spawnInitialObstacles() {
    // 1. 얼음 과일 스폰 (규칙: 1~10단계는 없음, 11단계 이상부터 등장)
    if (this.config.allowIce && this.config.initialIceCount > 0) {
      let spawned = 0;
      let attempts = 0;
      while (spawned < this.config.initialIceCount && attempts < 30) {
        attempts++;
        const r = Math.floor(Math.random() * (this.boardSize - 2)) + 1;
        const c = Math.floor(Math.random() * (this.boardSize - 2)) + 1;
        if (this.grid[r][c] && !this.grid[r][c].special) {
          this.grid[r][c].special = 'ice';
          spawned++;
        }
      }
    }

    // 2. 썩은 과일 스폰 (규칙: 1~30단계는 없음, 31단계 이상부터 등장)
    if (this.config.allowRotten && this.config.initialRottenCount > 0) {
      let spawned = 0;
      let attempts = 0;
      while (spawned < this.config.initialRottenCount && attempts < 30) {
        attempts++;
        const r = Math.floor(Math.random() * this.boardSize);
        const c = Math.floor(Math.random() * this.boardSize);
        if (this.grid[r][c] && !this.grid[r][c].special) {
          this.grid[r][c].special = 'rotten';
          spawned++;
        }
      }
    }
  }

  getRandomFruit() {
    const idx = Math.floor(Math.random() * this.currentFruitPool.length);
    return this.currentFruitPool[idx];
  }

  renderBoard() {
    this.dom.board.innerHTML = '';
    // 얼음 영향받은 주변 셀 계산
    const frozenNeighbors = this.getFrozenNeighborMap();

    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cellData = this.grid[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-cell';
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;

        if (cellData) {
          const itemEl = document.createElement('div');
          itemEl.className = 'fruit-item';

          // 특수 아이템 클래스
          if (cellData.special === 'waterbomb') {
            itemEl.classList.add('item-waterbomb');
            itemEl.innerHTML = `
              <div class="waterbomb-badge">💧</div>
              <span class="fruit-emoji">${cellData.fruitData.icon}</span>
              <div class="water-aura"></div>
            `;
          } else if (cellData.special === 'ice') {
            itemEl.classList.add('item-ice');
            itemEl.innerHTML = `
              <div class="ice-cube">🧊</div>
              <span class="fruit-emoji">${cellData.fruitData.icon}</span>
            `;
          } else if (cellData.special === 'rotten') {
            itemEl.classList.add('item-rotten');
            itemEl.innerHTML = `
              <div class="rotten-fly">🪰</div>
              <span class="fruit-emoji">${cellData.fruitData.icon}</span>
              <div class="rotten-aura"></div>
            `;
          } else {
            itemEl.innerHTML = `<span class="fruit-emoji">${cellData.fruitData.icon}</span>`;
          }

          // 얼음 과일 근처 4면의 과일: 규칙: "해당 과일 근처의 4면에 있는 과일은 움직일 수 없다."
          if (frozenNeighbors[`${r},${c}`] && cellData.special !== 'ice') {
            itemEl.classList.add('frozen-locked');
            const frostOverlay = document.createElement('div');
            frostOverlay.className = 'frost-overlay';
            frostOverlay.title = '주변 얼음 과일 때문에 얼어붙어 움직일 수 없습니다!';
            itemEl.appendChild(frostOverlay);
          }

          cellEl.appendChild(itemEl);
        }

        this.dom.board.appendChild(cellEl);
      }
    }
  }

  // 얼음 과일 주변 4면 좌표 맵핑
  getFrozenNeighborMap() {
    const map = {};
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.grid[r][c]?.special === 'ice') {
          const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          dirs.forEach(([dr, dc]) => {
            const nr = r + dr;
            const nc = c + dc;
            if (this.isValidCell(nr, nc)) {
              map[`${nr},${nc}`] = true;
            }
          });
        }
      }
    }
    return map;
  }

  isValidCell(r, c) {
    return r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize;
  }

  // ==========================================
  // 유저 상호작용 (클릭 및 드래그 스왑)
  // ==========================================
  bindEvents() {
    // 보드 클릭 및 터치 이벤트
    this.dom.board.addEventListener('click', (e) => this.handleCellClick(e));

    // 드래그 & 스와이프
    this.dom.board.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    this.dom.board.addEventListener('pointerup', (e) => this.handlePointerUp(e));

    // 버튼 이벤트
    document.getElementById('btn-play-pause').addEventListener('click', () => {
      if (this.isPlaying) {
        this.pauseGame();
      } else {
        this.startStage();
      }
    });

    document.getElementById('btn-sound-toggle').addEventListener('click', (e) => {
      const isMuted = window.soundEngine.toggleMute();
      e.currentTarget.textContent = isMuted ? '🔇 음소거' : '🔊 소리켬';
    });

    document.getElementById('btn-bgm-toggle').addEventListener('click', (e) => {
      const playing = window.soundEngine.toggleBGM();
      e.currentTarget.textContent = playing ? '🎵 BGM 끄기' : '🎵 BGM 켜기';
    });

    document.getElementById('btn-shop-modal').addEventListener('click', () => {
      this.openShopModal();
    });

    document.getElementById('btn-stages-modal').addEventListener('click', () => {
      this.openStageListModal();
    });

    document.getElementById('btn-growth-gallery')?.addEventListener('click', () => {
      this.openGrowthGalleryModal();
    });

    document.getElementById('btn-help-modal').addEventListener('click', () => {
      this.openHelpModal();
    });

    this.dom.modalCloseBtn.addEventListener('click', () => {
      this.closeModal();
    });

    // 치트 / 편의 기능: 스테이지 직접 이동
    document.getElementById('btn-next-stage-quick')?.addEventListener('click', () => {
      if (this.currentStage < 100) {
        this.loadStage(this.currentStage + 1);
      }
    });
    document.getElementById('btn-prev-stage-quick')?.addEventListener('click', () => {
      if (this.currentStage > 1) {
        this.loadStage(this.currentStage - 1);
      }
    });
  }

  handlePointerDown(e) {
    if (this.isProcessing) return;
    const cellEl = e.target.closest('.grid-cell');
    if (!cellEl) return;
    this.dragStartCell = {
      r: parseInt(cellEl.dataset.r, 10),
      c: parseInt(cellEl.dataset.c, 10),
      clientX: e.clientX,
      clientY: e.clientY
    };
  }

  handlePointerUp(e) {
    if (!this.dragStartCell || this.isProcessing) {
      this.dragStartCell = null;
      return;
    }

    const dx = e.clientX - this.dragStartCell.clientX;
    const dy = e.clientY - this.dragStartCell.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 스와이프 감지 (최소 25px 이상 드래그)
    if (dist > 25) {
      let targetR = this.dragStartCell.r;
      let targetC = this.dragStartCell.c;

      if (Math.abs(dx) > Math.abs(dy)) {
        targetC += dx > 0 ? 1 : -1;
      } else {
        targetR += dy > 0 ? 1 : -1;
      }

      if (this.isValidCell(targetR, targetC)) {
        this.attemptSwap(this.dragStartCell.r, this.dragStartCell.c, targetR, targetC);
        this.dragStartCell = null;
        this.clearSelection();
        return;
      }
    }
    this.dragStartCell = null;
  }

  handleCellClick(e) {
    if (this.isProcessing) return;

    // 게임 시작 안했으면 첫 클릭 시 자동 시작
    if (!this.isPlaying) {
      this.startStage();
    }

    const cellEl = e.target.closest('.grid-cell');
    if (!cellEl) return;

    const r = parseInt(cellEl.dataset.r, 10);
    const c = parseInt(cellEl.dataset.c, 10);
    const cellData = this.grid[r][c];
    if (!cellData) return;

    // 물폭탄 직접 클릭: 즉시 근처 5개 폭발 발동!
    // 규칙: "클릭하면, 근처에 있는 과일 5개를 폭발시켜 점수를 획득할 수 있다"
    if (cellData.special === 'waterbomb') {
      this.triggerWaterBombDirect(r, c);
      return;
    }

    // 얼음 영향 확인
    const frozenMap = this.getFrozenNeighborMap();
    if (frozenMap[`${r},${c}`] && cellData.special !== 'ice') {
      this.shakeCell(cellEl);
      window.soundEngine.playIceCrack();
      this.showFloatingNotice(cellEl, '🧊 얼어서 이동 불가!');
      this.clearSelection();
      return;
    }

    if (!this.selectedCell) {
      // 첫 번째 셀 선택
      this.selectedCell = { r, c };
      window.soundEngine.playSelect();
      this.highlightCell(r, c, true);
    } else {
      const prevR = this.selectedCell.r;
      const prevC = this.selectedCell.c;

      // 같은 셀 클릭 시 선택 해제
      if (prevR === r && prevC === c) {
        this.clearSelection();
        return;
      }

      // 인접 4방향 여부 확인
      const isAdjacent = (Math.abs(prevR - r) + Math.abs(prevC - c)) === 1;
      if (isAdjacent) {
        // 이동 시도
        this.attemptSwap(prevR, prevC, r, c);
        this.clearSelection();
      } else {
        // 인접하지 않으면 새 선택
        this.clearSelection();
        this.selectedCell = { r, c };
        window.soundEngine.playSelect();
        this.highlightCell(r, c, true);
      }
    }
  }

  highlightCell(r, c, isSelected) {
    const cellEl = this.getCellElement(r, c);
    if (cellEl) {
      if (isSelected) {
        cellEl.classList.add('selected');
      } else {
        cellEl.classList.remove('selected');
      }
    }
  }

  clearSelection() {
    if (this.selectedCell) {
      this.highlightCell(this.selectedCell.r, this.selectedCell.c, false);
      this.selectedCell = null;
    }
  }

  shakeCell(cellEl) {
    cellEl.classList.add('shake-anim');
    setTimeout(() => cellEl.classList.remove('shake-anim'), 400);
  }

  getCellElement(r, c) {
    return this.dom.board.querySelector(`.grid-cell[data-r="${r}"][data-c="${c}"]`);
  }

  // ==========================================
  // 스왑 및 매칭 로직
  // ==========================================
  async attemptSwap(r1, c1, r2, c2) {
    const frozenMap = this.getFrozenNeighborMap();
    const cell1 = this.grid[r1][c1];
    const cell2 = this.grid[r2][c2];

    // 얼음 과일 자체이거나, 얼음 과일 주변의 얼어붙은 과일은 스왑 불가
    if ((frozenMap[`${r1},${c1}`] && cell1.special !== 'ice') ||
        (frozenMap[`${r2},${c2}`] && cell2.special !== 'ice') ||
        cell1.special === 'ice' || cell2.special === 'ice') {
      window.soundEngine.playIceCrack();
      const el1 = this.getCellElement(r1, c1);
      const el2 = this.getCellElement(r2, c2);
      if (el1) this.shakeCell(el1);
      if (el2) this.shakeCell(el2);
      this.showFloatingNotice(el1, '🧊 얼음으로 인해 움직일 수 없습니다!');
      return;
    }

    this.isProcessing = true;
    window.soundEngine.playSwap();

    // 임시 스왑
    this.swapCells(r1, c1, r2, c2);
    this.renderBoard();

    // 매치 검사
    const matches = this.findMatches();

    if (matches.length > 0) {
      this.comboCount = 1;
      await this.processMatches(matches);
    } else {
      // 유효하지 않은 스왑 -> 원래대로 롤백 애니메이션
      await new Promise(res => setTimeout(res, 200));
      this.swapCells(r1, c1, r2, c2);
      this.renderBoard();
      const el = this.getCellElement(r1, c1);
      if (el) this.shakeCell(el);
    }

    this.isProcessing = false;
  }

  swapCells(r1, c1, r2, c2) {
    const temp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = temp;
    if (this.grid[r1][c1]) {
      this.grid[r1][c1].r = r1;
      this.grid[r1][c1].c = c1;
    }
    if (this.grid[r2][c2]) {
      this.grid[r2][c2].r = r2;
      this.grid[r2][c2].c = c2;
    }
  }

  // 매치 검색 (가로 & 세로 3개 이상)
  findMatches() {
    const matchedCoords = new Set();
    const matchGroups = [];

    // 가로 매치
    for (let r = 0; r < this.boardSize; r++) {
      let currentType = null;
      let streak = [];
      for (let c = 0; c < this.boardSize; c++) {
        const cell = this.grid[r][c];
        if (cell && cell.type === currentType && cell.special !== 'ice' && cell.special !== 'rotten') {
          streak.push({ r, c });
        } else {
          if (streak.length >= 3) {
            matchGroups.push([...streak]);
            streak.forEach(pt => matchedCoords.add(`${pt.r},${pt.c}`));
          }
          currentType = (cell && cell.special !== 'ice' && cell.special !== 'rotten') ? cell.type : null;
          streak = currentType ? [{ r, c }] : [];
        }
      }
      if (streak.length >= 3) {
        matchGroups.push([...streak]);
        streak.forEach(pt => matchedCoords.add(`${pt.r},${pt.c}`));
      }
    }

    // 세로 매치
    for (let c = 0; c < this.boardSize; c++) {
      let currentType = null;
      let streak = [];
      for (let r = 0; r < this.boardSize; r++) {
        const cell = this.grid[r][c];
        if (cell && cell.type === currentType && cell.special !== 'ice' && cell.special !== 'rotten') {
          streak.push({ r, c });
        } else {
          if (streak.length >= 3) {
            matchGroups.push([...streak]);
            streak.forEach(pt => matchedCoords.add(`${pt.r},${pt.c}`));
          }
          currentType = (cell && cell.special !== 'ice' && cell.special !== 'rotten') ? cell.type : null;
          streak = currentType ? [{ r, c }] : [];
        }
      }
      if (streak.length >= 3) {
        matchGroups.push([...streak]);
        streak.forEach(pt => matchedCoords.add(`${pt.r},${pt.c}`));
      }
    }

    return matchGroups;
  }

  // 매치 처리 및 특수 아이템 생성/획득
  async processMatches(matchGroups) {
    if (matchGroups.length === 0) return;

    let totalMatchedCells = new Map();
    let spawnBombAt = null;

    // 그룹별 분석
    matchGroups.forEach(group => {
      // 규칙: "5개 이상의 과일을 맞추면 물폭탄 아이템이 하나 등장한다."
      if (group.length >= 5) {
        spawnBombAt = group[Math.floor(group.length / 2)];
      }

      // 규칙: "과일을 한 줄로 맞추면 장바구니가 등장한다."
      // (가로/세로 4개 이상 일렬 매칭 또는 행/열을 가로지르는 매칭 시 장바구니 획득)
      const allSameRow = group.every(pt => pt.r === group[0].r);
      const allSameCol = group.every(pt => pt.c === group[0].c);
      if ((allSameRow || allSameCol) && group.length >= 4) {
        this.awardShoppingBasket();
      }

      group.forEach(pt => {
        totalMatchedCells.set(`${pt.r},${pt.c}`, pt);
      });
    });

    // 점수 계산 (상점 레벨 보너스 적용)
    const shopBonus = SHOP_LEVELS[this.shopLevel - 1].scoreBonus;
    const bonusMultiplier = this.isBonusStage ? 1.5 : 1.0;
    const basePts = totalMatchedCells.size * 60 * this.comboCount;
    const awardedScore = Math.floor(basePts * (1 + shopBonus) * bonusMultiplier);
    this.addScore(awardedScore);

    // 사운드 & 파티클
    window.soundEngine.playPop(this.comboCount);
    if (this.comboCount > 2) {
      window.soundEngine.playCombo();
    }

    // 인접 얼음/썩은 과일 파괴 확인
    totalMatchedCells.forEach(pt => {
      this.checkAndDestroyAdjacentObstacles(pt.r, pt.c);
    });

    // 제거 애니메이션 & 파티클
    totalMatchedCells.forEach(pt => {
      const cellData = this.grid[pt.r][pt.c];
      const cellEl = this.getCellElement(pt.r, pt.c);
      if (cellEl && cellData) {
        const rect = cellEl.getBoundingClientRect();
        this.spawnParticle(rect.left + rect.width / 2, rect.top + rect.height / 2, cellData.fruitData.juiceColor, 10);
        cellEl.classList.add('pop-anim');
      }
      this.grid[pt.r][pt.c] = null;
    });

    // 물폭탄 생성 지점 적용
    if (spawnBombAt) {
      const randomFruit = this.getRandomFruit();
      this.grid[spawnBombAt.r][spawnBombAt.c] = {
        r: spawnBombAt.r,
        c: spawnBombAt.c,
        type: randomFruit.id,
        special: 'waterbomb',
        fruitData: randomFruit
      };
      this.showBannerNotice('💧 물폭탄 생성! (5개 매치)');
    }

    await new Promise(res => setTimeout(res, 260));

    // 중력 캐스케이드 (위에서 아래로 떨어짐 & 새 과일 보충)
    await this.applyCascade();

    // 보드 다시 렌더링
    this.renderBoard();

    // 연쇄 매치 확인
    const nextMatches = this.findMatches();
    if (nextMatches.length > 0) {
      this.comboCount++;
      await new Promise(res => setTimeout(res, 180));
      await this.processMatches(nextMatches);
    } else {
      this.comboCount = 0;
      this.checkStageProgress();
    }
  }

  // 인접 장애물(얼음, 썩은 과일) 정화
  checkAndDestroyAdjacentObstacles(r, c) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    dirs.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (this.isValidCell(nr, nc)) {
        const neighbor = this.grid[nr][nc];
        if (neighbor && (neighbor.special === 'ice' || neighbor.special === 'rotten')) {
          if (neighbor.special === 'ice') {
            window.soundEngine.playIceCrack();
            this.showFloatingNotice(this.getCellElement(nr, nc), '🧊 얼음 파괴!');
          } else {
            this.showFloatingNotice(this.getCellElement(nr, nc), '✨ 썩은과일 정화!');
          }
          neighbor.special = null; // 일반 과일로 정화
        }
      }
    });
  }

  // ==========================================
  // 물폭탄 발동 (직접 클릭 또는 스왑)
  // 규칙: "클릭하면, 근처에 있는 과일 5개를 폭발시켜 점수를 획득할 수 있다"
  // ==========================================
  async triggerWaterBombDirect(centerR, centerC) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    window.soundEngine.playWaterBomb();
    const centerEl = this.getCellElement(centerR, centerC);
    if (centerEl) {
      const rect = centerEl.getBoundingClientRect();
      this.spawnWaterSplash(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    // 중심 + 상하좌우 총 5개 과일 좌표
    const targets = [
      { r: centerR, c: centerC },
      { r: centerR - 1, c: centerC },
      { r: centerR + 1, c: centerC },
      { r: centerR, c: centerC - 1 },
      { r: centerR, c: centerC + 1 }
    ].filter(pt => this.isValidCell(pt.r, pt.c));

    let explodedCount = 0;
    targets.forEach(pt => {
      const cell = this.grid[pt.r][pt.c];
      if (cell) {
        explodedCount++;
        const el = this.getCellElement(pt.r, pt.c);
        if (el) {
          const rect = el.getBoundingClientRect();
          this.spawnParticle(rect.left + rect.width / 2, rect.top + rect.height / 2, '#00d2d3', 14, 6);
          el.classList.add('bomb-burst-anim');
        }
        this.grid[pt.r][pt.c] = null;
      }
    });

    const bombScore = explodedCount * 120 + 200;
    this.addScore(bombScore);
    this.showBannerNotice(`💥 물폭탄 대폭발! +${bombScore}점!`);

    await new Promise(res => setTimeout(res, 320));
    await this.applyCascade();
    this.renderBoard();

    // 연쇄 매치 검사
    const nextMatches = this.findMatches();
    if (nextMatches.length > 0) {
      this.comboCount = 1;
      await this.processMatches(nextMatches);
    }

    this.isProcessing = false;
    this.checkStageProgress();
  }

  // ==========================================
  // 장바구니 획득 및 보너스 스테이지
  // 규칙: "과일을 한 줄로 맞추면 장바구니가 등장한다.
  // (해당 스테이지가 끝날 때, 보너스 스테이지에서 30초 간 과일을 추가적으로 맞춰서, 점수를 획득할 수 있게 한다)"
  // ==========================================
  awardShoppingBasket() {
    if (this.hasBasket) return;
    this.hasBasket = true;
    window.soundEngine.playBasketGet();
    this.dom.basketSlot.classList.add('active');
    this.showBannerNotice('🧺 장바구니 획득! 클리어 시 [30초 보너스 스테이지] 확정!');
  }

  // ==========================================
  // 썩은 과일 보드 셔플 교란
  // 규칙: "썩은과일 : 해당 아이템이 등장하면, 임의적으로 과일 배열이 변경된다."
  // ==========================================
  hasRottenFruitOnBoard() {
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.grid[r][c]?.special === 'rotten') return true;
      }
    }
    return false;
  }

  triggerRottenShuffle() {
    if (this.isProcessing) return;
    window.soundEngine.playRottenShuffle();
    this.showBannerNotice('🪰 썩은 과일의 악취로 과일 배열이 뒤섞입니다!');

    // 보드 셔플
    const normalFruits = [];
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.grid[r][c] && this.grid[r][c].special !== 'ice' && this.grid[r][c].special !== 'rotten') {
          normalFruits.push(this.grid[r][c].fruitData);
        }
      }
    }

    // 셔플
    normalFruits.sort(() => Math.random() - 0.5);
    let idx = 0;
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.grid[r][c] && this.grid[r][c].special !== 'ice' && this.grid[r][c].special !== 'rotten') {
          const newF = normalFruits[idx++];
          this.grid[r][c].fruitData = newF;
          this.grid[r][c].type = newF.id;
        }
      }
    }

    this.renderBoard();
  }

  // ==========================================
  // 중력 캐스케이드 (위에서 떨어짐)
  // ==========================================
  async applyCascade() {
    for (let c = 0; c < this.boardSize; c++) {
      let emptyRow = this.boardSize - 1;
      // 아래에서 위로 탐색
      for (let r = this.boardSize - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          if (emptyRow !== r) {
            this.grid[emptyRow][c] = this.grid[r][c];
            this.grid[emptyRow][c].r = emptyRow;
            this.grid[emptyRow][c].c = c;
            this.grid[r][c] = null;
          }
          emptyRow--;
        }
      }

      // 비어있는 상단 칸에 새 과일 채우기
      for (let r = emptyRow; r >= 0; r--) {
        const fruit = this.getRandomFruit();
        let special = null;

        // 보너스 스테이지가 아닐 때 확률적 방해 아이템 등장
        if (!this.isBonusStage) {
          if (this.config.allowIce && this.config.iceChance > 0 && Math.random() < this.config.iceChance * 0.12) {
            special = 'ice';
          } else if (this.config.allowRotten && this.config.rottenChance > 0 && Math.random() < this.config.rottenChance * 0.1) {
            special = 'rotten';
            setTimeout(() => this.triggerRottenShuffle(), 600);
          }
        }

        this.grid[r][c] = {
          r: r,
          c: c,
          type: fruit.id,
          special: special,
          fruitData: fruit
        };
      }
    }
  }

  // ==========================================
  // 점수 및 상태 갱신
  // ==========================================
  addScore(points) {
    this.score += points;
    // 획득 점수의 10%만큼 골드도 동시 적립
    const goldEarned = Math.max(1, Math.floor(points * 0.08));
    this.userGold += goldEarned;
    localStorage.setItem('moamoa_gold', this.userGold.toString());

    this.updateHUD();
    this.checkStageProgress();
  }

  updateHUD() {
    this.dom.score.textContent = this.score.toLocaleString();
    this.dom.targetScore.textContent = this.targetScore.toLocaleString();
    this.dom.goldVal.textContent = this.userGold.toLocaleString();
    this.dom.stageBadge.textContent = `Stage ${this.currentStage}`;
    this.dom.stageName.textContent = this.isBonusStage ? '✨ 30초 과일 파티 보너스 타임!' : `스테이지 ${this.currentStage}`;

    if (this.hasBasket) {
      this.dom.basketSlot.classList.add('active');
    } else {
      this.dom.basketSlot.classList.remove('active');
    }
  }

  checkStageProgress() {
    if (!this.isBonusStage && this.score >= this.targetScore && this.isPlaying) {
      // 목표 점수 달성!
      this.handleStageSuccess();
    }
  }

  handleStageSuccess() {
    clearInterval(this.timerInterval);
    this.isPlaying = false;
    window.soundEngine.playVictory();

    // 장바구니를 획득했다면 -> 보너스 스테이지(30초)로 직행!
    if (this.hasBasket) {
      this.openBonusStageTransitionModal();
    } else {
      this.openStageClearModal();
    }
  }

  handleTimeUp() {
    this.isPlaying = false;
    if (this.isBonusStage) {
      // 보너스 스테이지 시간 종료 -> 결과 모달
      window.soundEngine.playVictory();
      this.openStageClearModal(true);
    } else {
      if (this.score >= this.targetScore) {
        this.handleStageSuccess();
      } else {
        window.soundEngine.playGameOver();
        this.openGameOverModal();
      }
    }
  }

  pauseGame() {
    this.isPlaying = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.dom.appContainer.classList.add('paused');
    this.openModal({
      title: '⏸️ 일시 정지',
      body: '<p>잠시 쉬어가는 시간! 과일들이 싱싱하게 기다리고 있습니다.</p>',
      actionText: '▶️ 계속 하기',
      actionCallback: () => {
        this.dom.appContainer.classList.remove('paused');
        this.startStage();
      }
    });
  }

  // ==========================================
  // 보너스 스테이지 (30초 과일 파티)
  // ==========================================
  openBonusStageTransitionModal() {
    this.openModal({
      title: '🎉 장바구니 획득 완료!',
      body: `
        <div class="bonus-intro-box">
          <div class="bonus-intro-icon">🧺✨</div>
          <h3>보너스 스테이지 입장!</h3>
          <p>한 줄 매칭으로 장바구니를 획득하셨습니다!</p>
          <p class="highlight-txt">30초 동안 방해 아이템 없이 과일을 마구 터뜨려 보너스 점수와 골드를 획득하세요!</p>
        </div>
      `,
      actionText: '🚀 30초 보너스 타임 시작!',
      actionCallback: () => {
        this.startBonusStage();
      }
    });
  }

  startBonusStage() {
    this.isBonusStage = true;
    this.timeLeft = 30;
    this.dom.bonusOverlay.classList.remove('hidden');
    this.dom.appContainer.classList.add('bonus-mode');

    // 과일 풀을 화사한 4개로 압축하여 콤보 팡팡!
    this.currentFruitPool = [...FRUIT_TYPES].slice(0, 4);
    this.renderStageFruitPreview();
    this.buildBoard();

    this.isPlaying = true;
    this.startTimer();
  }

  // ==========================================
  // 모달 팝업들 (클리어, 게임오버, 상점 등)
  // ==========================================
  openStageClearModal(fromBonus = false) {
    if (this.currentStage >= this.unlockedStage && this.unlockedStage < 100) {
      this.unlockedStage = this.currentStage + 1;
      localStorage.setItem('moamoa_unlocked_stage', this.unlockedStage.toString());
    }

    // 별점 계산
    const ratio = this.score / this.targetScore;
    let stars = '⭐';
    if (ratio >= 1.4) stars = '⭐⭐';
    if (ratio >= 1.8) stars = '⭐⭐⭐';

    const bonusMsg = fromBonus ? '<p class="bonus-cleared-tag">✨ 30초 보너스 스테이지 추가 점수 대박!</p>' : '';
    const nextBtnText = this.currentStage < 100 ? `다음 스테이지 (${this.currentStage + 1}) 도전!` : '🎉 100단계 최종 클리어!';

    this.openModal({
      title: '🎉 스테이지 클리어!',
      body: `
        <div class="clear-result-card">
          <div class="clear-stars">${stars}</div>
          <h2>Stage ${this.currentStage} 성공!</h2>
          ${bonusMsg}
          <div class="result-stats">
            <div class="stat-row"><span>최종 점수:</span> <strong>${this.score.toLocaleString()} 점</strong></div>
            <div class="stat-row"><span>목표 점수:</span> <span>${this.targetScore.toLocaleString()} 점</span></div>
            <div class="stat-row"><span>보유 골드:</span> <span class="gold-txt">💰 ${this.userGold.toLocaleString()} G</span></div>
          </div>
          <p class="encourage-txt">골드를 모아 가게를 확장하면 점수 보너스를 받을 수 있습니다!</p>
        </div>
      `,
      actionText: nextBtnText,
      actionCallback: () => {
        this.dom.bonusOverlay.classList.add('hidden');
        this.dom.appContainer.classList.remove('bonus-mode');
        if (this.currentStage < 100) {
          this.loadStage(this.currentStage + 1);
        } else {
          this.openGameCompletedModal();
        }
      }
    });
  }

  openGameOverModal() {
    this.openModal({
      title: '😢 아쉬워요! 시간 종료',
      body: `
        <div class="gameover-card">
          <div class="gameover-icon">⏰💦</div>
          <h3>목표 점수에 도달하지 못했습니다</h3>
          <div class="result-stats">
            <div class="stat-row"><span>달성 점수:</span> <strong>${this.score.toLocaleString()} 점</strong></div>
            <div class="stat-row"><span>목표 점수:</span> <span>${this.targetScore.toLocaleString()} 점</span></div>
          </div>
          <p class="tip-txt">💡 팁: 5개 과일을 매치해 <strong>물폭탄</strong>을 만들고, 얼음 과일을 서둘러 깨뜨리세요!</p>
        </div>
      `,
      actionText: '🔄 다시 도전하기',
      actionCallback: () => {
        this.loadStage(this.currentStage);
      }
    });
  }

  openGameCompletedModal() {
    this.openModal({
      title: '🏆 대망의 100단계 정복!',
      body: `
        <div class="grand-clear-box">
          <div class="trophy-icon">👑🍇🍉🍓🍎</div>
          <h2>모아모아 과일가게의 전설적인 마스터!</h2>
          <p>100개의 스테이지를 모두 돌파하여 최고의 과일가게 왕국을 세웠습니다!</p>
          <p>언제든 원하는 스테이지를 다시 플레이할 수 있습니다.</p>
        </div>
      `,
      actionText: '가게 둘러보기',
      actionCallback: () => {
        this.openShopModal();
      }
    });
  }

  // 상점 업그레이드 모달
  openShopModal() {
    this.dom.shopModalList.innerHTML = '';
    SHOP_LEVELS.forEach(item => {
      const isOwned = this.shopLevel >= item.level;
      const isCurrent = this.shopLevel === item.level;
      const canAfford = this.userGold >= item.cost;

      const card = document.createElement('div');
      card.className = `shop-upgrade-card ${isOwned ? 'owned' : ''} ${isCurrent ? 'current' : ''}`;
      card.innerHTML = `
        <div class="shop-card-icon">${item.icon}</div>
        <div class="shop-card-info">
          <div class="shop-card-title">${item.name} <span class="badge">${item.badge}</span></div>
          <div class="shop-card-desc">${item.desc}</div>
          <div class="shop-card-bonus">✨ 획득 점수 +${Math.round(item.scoreBonus * 100)}% 버프</div>
        </div>
        <div class="shop-card-action">
          ${
            isCurrent
              ? '<span class="status-tag active">운영 중</span>'
              : isOwned
              ? '<button class="btn-sub select-shop-btn">선택</button>'
              : `<button class="btn-primary buy-shop-btn ${canAfford ? '' : 'disabled'}">
                  💰 ${item.cost.toLocaleString()} G
                </button>`
          }
        </div>
      `;

      // 구매 이벤트
      const buyBtn = card.querySelector('.buy-shop-btn');
      if (buyBtn && canAfford) {
        buyBtn.addEventListener('click', () => {
          this.userGold -= item.cost;
          this.shopLevel = item.level;
          localStorage.setItem('moamoa_gold', this.userGold.toString());
          localStorage.setItem('moamoa_shop_level', this.shopLevel.toString());
          window.soundEngine.playVictory();
          this.updateShopUI();
          this.openShopModal();
          this.showBannerNotice(`🎉 [${item.name}] 가게 확장 성공!`);
        });
      }

      // 보유한 가게 선택
      const selBtn = card.querySelector('.select-shop-btn');
      if (selBtn) {
        selBtn.addEventListener('click', () => {
          this.shopLevel = item.level;
          localStorage.setItem('moamoa_shop_level', this.shopLevel.toString());
          this.updateShopUI();
          this.openShopModal();
        });
      }

      this.dom.shopModalList.appendChild(card);
    });

    document.getElementById('modal-shop-container').classList.remove('hidden');
    document.getElementById('modal-generic-container').classList.add('hidden');
    document.getElementById('modal-stages-container').classList.add('hidden');
    this.dom.modalOverlay.classList.remove('hidden');
  }

  updateShopUI() {
    const shop = SHOP_LEVELS[this.shopLevel - 1];
    this.dom.shopLevelTitle.textContent = shop.name;
    this.dom.shopAvatar.textContent = shop.icon;
    this.dom.shopBonusTag.textContent = `점수 +${Math.round(shop.scoreBonus * 100)}%`;
    this.dom.goldVal.textContent = this.userGold.toLocaleString();
  }

  // 100단계 스테이지 선택 모달
  openStageListModal() {
    this.dom.stageListContainer.innerHTML = '';
    for (let s = 1; s <= 100; s++) {
      const isUnlocked = s <= this.unlockedStage;
      const isCurrent = s === this.currentStage;
      const cell = document.createElement('button');
      cell.className = `stage-select-btn ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'active' : ''}`;
      cell.innerHTML = `
        <span class="num">${s}</span>
        ${isUnlocked ? '<span class="icon">🍎</span>' : '<span class="icon">🔒</span>'}
      `;

      if (isUnlocked) {
        cell.addEventListener('click', () => {
          this.closeModal();
          this.loadStage(s);
          this.startStage();
        });
      }
      this.dom.stageListContainer.appendChild(cell);
    }

    document.getElementById('modal-stages-container').classList.remove('hidden');
    document.getElementById('modal-generic-container').classList.add('hidden');
    document.getElementById('modal-shop-container').classList.add('hidden');
    this.dom.modalOverlay.classList.remove('hidden');
  }

  // 게임 방법 설명 모달
  openHelpModal() {
    this.openModal({
      title: '📖 모아모아 과일가게 안내서',
      body: `
        <div class="help-content-list">
          <div class="help-item">
            <span class="help-icon">🍎🍊🍇</span>
            <div>
              <strong>기본 규칙</strong>
              <p>7X7 판에서 같은 과일을 3개 이상 가로/세로로 맞춰 터뜨려 점수를 얻습니다. 제한 시간 내에 목표 점수를 달성하세요!</p>
            </div>
          </div>
          <div class="help-item">
            <span class="help-icon">💧💣</span>
            <div>
              <strong>물폭탄 아이템</strong>
              <p>과일을 5개 이상 한 번에 맞추면 물폭탄이 생성됩니다! 물폭탄을 클릭하면 근처 과일 5개를 시원하게 터뜨립니다.</p>
            </div>
          </div>
          <div class="help-item">
            <span class="help-icon">🧺✨</span>
            <div>
              <strong>장바구니 & 보너스 스테이지</strong>
              <p>과일을 한 줄(4개 이상 일렬)로 맞추면 장바구니 획득! 해당 스테이지를 끝마치면 30초 동안 방해 없는 보너스 과일 파티가 시작됩니다.</p>
            </div>
          </div>
          <div class="help-item">
            <span class="help-icon">🧊</span>
            <div>
              <strong>얼음 과일 (방해)</strong>
              <p>얼음 과일 근처 4면에 있는 과일은 얼어붙어 움직일 수 없습니다! 주변에서 과일을 맞추거나 물폭탄으로 얼음을 깨뜨리세요.</p>
            </div>
          </div>
          <div class="help-item">
            <span class="help-icon">🪰🟣</span>
            <div>
              <strong>썩은 과일 (방해)</strong>
              <p>썩은 과일이 나타나면 전체 과일 배열을 무작위로 섞어버립니다! 주변 매칭이나 물폭탄으로 정화하세요.</p>
            </div>
          </div>
          <div class="help-item">
            <span class="help-icon">🏪👑</span>
            <div>
              <strong>가게 확장</strong>
              <p>게임을 플레이하며 모은 골드로 수레에서 대형 과일 백화점까지 가게를 확장하고 영구 점수 보너스를 받으세요!</p>
            </div>
          </div>
        </div>
      `,
      actionText: '알겠습니다!',
      actionCallback: () => {}
    });
  }

  // 10단계별 과일가게 발전 일러스트 갤러리 모달
  openGrowthGalleryModal() {
    const galleryGrid = document.getElementById('growth-gallery-grid');
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    const milestoneKeys = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    milestoneKeys.forEach(s => {
      const data = STAGE_MILESTONES[s];
      if (!data) return;
      const isReached = this.unlockedStage >= s;

      const card = document.createElement('div');
      card.className = `gallery-card ${isReached ? 'reached' : 'unreached'}`;
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <img src="${data.img}" alt="${data.title}" class="gallery-card-img" style="${isReached ? '' : 'filter: grayscale(80%) brightness(0.7);'}" />
        <div class="gallery-card-body">
          <div class="gallery-card-badge">${isReached ? data.badge : '🔒 ' + s + '단계 달성 시 해금'}</div>
          <div class="gallery-card-title">Stage ${s} : ${data.title}</div>
          <div class="gallery-card-sub">${data.sub}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.showMilestoneIntroModal(s);
      });

      galleryGrid.appendChild(card);
    });

    document.getElementById('modal-gallery-container').classList.remove('hidden');
    document.getElementById('modal-generic-container').classList.add('hidden');
    document.getElementById('modal-shop-container').classList.add('hidden');
    document.getElementById('modal-stages-container').classList.add('hidden');
    this.dom.modalOverlay.classList.remove('hidden');
  }

  openModal({ title, body, actionText, actionCallback }) {
    document.getElementById('modal-generic-container').classList.remove('hidden');
    document.getElementById('modal-shop-container').classList.add('hidden');
    document.getElementById('modal-stages-container').classList.add('hidden');
    document.getElementById('modal-gallery-container')?.classList.add('hidden');

    this.dom.modalTitle.textContent = title;
    this.dom.modalBody.innerHTML = body;
    this.dom.modalActionBtn.textContent = actionText;

    this.dom.modalActionBtn.onclick = () => {
      this.closeModal();
      if (actionCallback) actionCallback();
    };

    this.dom.modalOverlay.classList.remove('hidden');
  }

  closeModal() {
    this.dom.modalOverlay.classList.add('hidden');
  }

  showFloatingNotice(targetEl, text) {
    if (!targetEl) return;
    const notice = document.createElement('div');
    notice.className = 'floating-notice-text';
    notice.textContent = text;
    targetEl.appendChild(notice);
    setTimeout(() => notice.remove(), 1000);
  }

  showBannerNotice(msg) {
    const banner = document.getElementById('global-banner-toast');
    if (!banner) return;
    banner.textContent = msg;
    banner.classList.add('show');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      banner.classList.remove('show');
    }, 2200);
  }
}

// 게임 인스턴스 초기화
window.addEventListener('DOMContentLoaded', () => {
  window.fruitShopGame = new FruitShopGame();
});
