/**
 * game.js - 불났어요 호떡집 (Namdaemun Hotteok Tycoon)
 * Full Game Engine & Interaction Controller
 */

// 1. 호떡 레시피 및 재료 정의
const RECIPES = {
  "꿀호떡": {
    name: "꿀호떡",
    emoji: "🍯",
    score: 100,
    ingredients: ["밀가루", "물", "기름", "설탕"]
  },
  "야채호떡": {
    name: "야채호떡",
    emoji: "🥬",
    score: 120,
    ingredients: ["밀가루", "물", "기름", "당면", "야채"]
  },
  "씨앗호떡": {
    name: "씨앗호떡",
    emoji: "🥜",
    score: 150,
    ingredients: ["밀가루", "물", "기름", "설탕", "시나몬가루", "견과류"]
  },
  "매콤호떡": {
    name: "매콤호떡",
    emoji: "🌶️",
    score: 140,
    ingredients: ["밀가루", "물", "기름", "당면", "야채", "고춧가루"]
  },
  "팥호떡": {
    name: "팥호떡",
    emoji: "🫘",
    score: 130,
    ingredients: ["밀가루", "물", "기름", "설탕", "팥"]
  }
};

// 재료별 아이콘 맵
const INGREDIENT_ICONS = {
  "밀가루": "🌾",
  "물": "💧",
  "기름": "🫗",
  "설탕": "🍬",
  "당면": "🍜",
  "야채": "🥬",
  "시나몬가루": "🍂",
  "견과류": "🥜",
  "고춧가루": "🌶️",
  "팥": "🫘"
};

// 귀여운 동글동글 사람 손님 아바타 풀 (스킨톤 & 캐주얼 애니풍)
const CUSTOMER_AVATARS = [
  { id: 'c1', img: 'assets/images/customers/customer_1.jpg', name: '호떡 사랑 학생' },
  { id: 'c2', img: 'assets/images/customers/customer_2.jpg', name: '장난꾸러기 어린이' },
  { id: 'c3', img: 'assets/images/customers/customer_3.jpg', name: '남대문 단골 할머니' },
  { id: 'c4', img: 'assets/images/customers/customer_4.jpg', name: '열정 가득 직장인' },
  { id: 'c5', img: 'assets/images/customers/customer_5.jpg', name: '맛기행 관광객 삼촌' }
];

// 손님이 호떡을 받았을 때 랜덤으로 외치는 리액션 멘트 풀
const CUSTOMER_REACTION_QUOTES = [
  "맛있다!",
  "음~",
  "또 사먹자!",
  "역시 맛집이야!",
  "완전 꿀맛!",
  "겉바속촉 최고!",
  "따끈따끈 최고야~",
  "줄 선 보람이 있네!"
];

class HotteokGame {
  constructor() {
    // 게임 전역 상태
    this.stage = 1;
    this.maxStage = 100;
    this.stageDuration = 90; // 1분 30초 (90초)
    this.customerPatienceTime = 60; // 1분 (60초)
    this.remainingTime = 90;
    this.score = 0;
    this.isPlaying = false;

    // 단계별 통계 (호떡 수 및 손님 수)
    this.servedHotteoksCount = 0;
    this.lostHotteoksCount = 0;
    this.servedCustomersCount = 0;
    this.lostCustomersCount = 0;

    // 조리대 상태
    this.selectedIngredients = [];
    this.hasMysteryIngredient = false;
    this.cookedHotteoks = []; // 조리 완료되어 철판 위에 있는 호떡들

    // 손님 슬롯 (최대 4명)
    this.customerSlots = [null, null, null, null];

    // 타이머 핸들러
    this.stageTimerInterval = null;
    this.customerTickInterval = null;
    this.customerSpawnTimer = null;
    this.mysterySpawnTimer = null;
    this.mysteryCountdownInterval = null;

    // DOM 요소 캐싱
    this.cacheDom();
    this.bindEvents();
    this.loadHighScore();
  }

  cacheDom() {
    // 헤더 상태
    this.stageNumDisplay = document.getElementById('current-stage-num');
    this.stageTimerDisplay = document.getElementById('stage-timer-display');
    this.stageTimerBar = document.getElementById('stage-timer-bar');
    this.timerBox = document.getElementById('timer-box');
    this.orderRateDisplay = document.getElementById('order-rate-display');
    this.orderRatioDisplay = document.getElementById('order-ratio-display');
    this.stageRateBar = document.getElementById('stage-rate-bar');
    this.currentScoreDisplay = document.getElementById('current-score-display');

    // 손님 구역
    this.customerSlotsContainer = document.getElementById('customer-slots-container');

    // 조합대 & 철판
    this.bowlList = document.getElementById('selected-ingredients-list');
    this.bowlEmptyHint = document.getElementById('bowl-empty-hint');
    this.luckyBadge = document.getElementById('lucky-ingredient-badge');
    this.btnCraft = document.getElementById('btn-craft-hotteok');
    this.btnClear = document.getElementById('btn-clear-ingredients');
    this.cookedTray = document.getElementById('cooked-hotteok-tray');
    this.trayEmptyHint = document.getElementById('tray-empty-hint');
    this.btnAutoServe = document.getElementById('btn-auto-serve');

    // 재료 버튼들
    this.ingRack = document.getElementById('ingredients-rack');
    this.btnMystery = document.getElementById('btn-mystery-ingredient');
    this.mysteryCountdownBar = document.getElementById('mystery-countdown-bar');

    // 모달들
    this.modalStart = document.getElementById('modal-start');
    this.modalRecipe = document.getElementById('modal-recipe');
    this.modalStageClear = document.getElementById('modal-stage-clear');
    this.modalGameOver = document.getElementById('modal-game-over');
    this.modalGrandEnding = document.getElementById('modal-grand-ending');
    this.modalStageJump = document.getElementById('modal-stage-jump');

    // 모달 내 동적 텍스트
    this.nextStageNumText = document.getElementById('next-stage-num-text');
    this.clearRateVal = document.getElementById('clear-rate-val');
    this.clearOrdersVal = document.getElementById('clear-orders-val');
    this.clearScoreVal = document.getElementById('clear-score-val');

    this.failRateVal = document.getElementById('fail-rate-val');
    this.failStageVal = document.getElementById('fail-stage-val');
    this.failScoreVal = document.getElementById('fail-score-val');
    this.failReasonText = document.getElementById('fail-reason-text');

    this.endingFinalScore = document.getElementById('ending-final-score');
    this.floatingScoresLayer = document.getElementById('floating-scores-layer');
  }

  bindEvents() {
    // 1. 시작 모달
    document.getElementById('btn-game-start').addEventListener('click', () => {
      this.closeModal(this.modalStart);
      window.soundSystem.init();
      this.startStage(1);
    });

    // 2. 효과음 & BGM 토글
    document.getElementById('btn-sound-toggle').addEventListener('click', (e) => {
      window.soundSystem.init();
      const enabled = window.soundSystem.toggleSound();
      e.currentTarget.textContent = enabled ? '🔊' : '🔇';
    });

    document.getElementById('btn-bgm-toggle').addEventListener('click', (e) => {
      window.soundSystem.init();
      const enabled = window.soundSystem.toggleBgm();
      e.currentTarget.textContent = enabled ? '🎵' : '💤';
      e.currentTarget.style.color = enabled ? '#34d399' : 'inherit';
    });

    // 3. 레시피 도감 모달 열기/닫기
    document.getElementById('btn-recipe-book').addEventListener('click', () => {
      window.soundSystem.playClick();
      this.openRecipeModal();
    });
    document.getElementById('btn-close-recipe').addEventListener('click', () => {
      this.closeModal(this.modalRecipe);
    });
    document.getElementById('btn-confirm-recipe').addEventListener('click', () => {
      this.closeModal(this.modalRecipe);
    });

    // 레시피 자동 담기 버튼들
    document.querySelectorAll('.btn-auto-fill-recipe').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rName = e.currentTarget.getAttribute('data-recipe');
        this.autoFillRecipe(rName);
        this.closeModal(this.modalRecipe);
      });
    });

    // 4. 재료 클릭 이벤트
    this.ingRack.addEventListener('click', (e) => {
      const btn = e.target.closest('.ing-btn');
      if (!btn) return;

      if (btn.id === 'btn-mystery-ingredient') {
        this.pickMysteryIngredient();
        return;
      }

      const ing = btn.getAttribute('data-ingredient');
      if (ing) {
        this.toggleIngredient(ing);
      }
    });

    // 5. 비우기 & 굽기
    this.btnClear.addEventListener('click', () => {
      window.soundSystem.playClick();
      this.clearBowl();
    });

    this.btnCraft.addEventListener('click', () => {
      this.craftHotteok();
    });

    // 6. 일괄 서빙 버튼
    this.btnAutoServe.addEventListener('click', () => {
      this.serveMatchingHotteok();
    });

    // 7. 다음 단계 / 재도전 / 재시작 버튼
    document.getElementById('btn-next-stage').addEventListener('click', () => {
      this.closeModal(this.modalStageClear);
      this.startStage(this.stage + 1);
    });

    document.getElementById('btn-retry-stage').addEventListener('click', () => {
      this.closeModal(this.modalGameOver);
      this.startStage(this.stage);
    });

    document.getElementById('btn-restart-game').addEventListener('click', () => {
      this.closeModal(this.modalGameOver);
      this.score = 0;
      this.updateScoreDisplay();
      this.startStage(1);
    });

    document.getElementById('btn-ending-restart').addEventListener('click', () => {
      this.closeModal(this.modalGrandEnding);
      this.score = 0;
      this.updateScoreDisplay();
      this.startStage(1);
    });

    // 8. 단계 점프(테스트용) 모달
    const btnBadge = document.getElementById('btn-stage-badge');
    const btnDebug = document.getElementById('btn-debug-jump');
    const openJumpModal = () => {
      window.soundSystem.playClick();
      this.modalStageJump.classList.add('active');
    };
    btnBadge.addEventListener('click', openJumpModal);
    btnDebug.addEventListener('click', openJumpModal);

    document.getElementById('btn-close-jump').addEventListener('click', () => {
      this.closeModal(this.modalStageJump);
    });

    // 프리셋 버튼들
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const s = parseInt(e.currentTarget.getAttribute('data-stage'), 10);
        this.closeModal(this.modalStageJump);
        this.startStage(s);
      });
    });

    // 직접 입력 이동
    document.getElementById('btn-apply-jump').addEventListener('click', () => {
      const val = parseInt(document.getElementById('input-custom-stage').value, 10);
      if (val >= 1 && val <= 100) {
        this.closeModal(this.modalStageJump);
        this.startStage(val);
      }
    });

    // 디버그 즉시 승리 테스트 버튼
    document.getElementById('btn-debug-win-now').addEventListener('click', () => {
      this.closeModal(this.modalStageJump);
      this.triggerDebugWin();
    });
  }

  // ==================== 게임 루프 및 단계 관리 ====================

  startStage(stageNumber) {
    this.stage = Math.min(Math.max(1, stageNumber), this.maxStage);
    this.isPlaying = true;
    this.remainingTime = this.stageDuration; // 90초
    this.servedHotteoksCount = 0;
    this.lostHotteoksCount = 0;
    this.servedCustomersCount = 0;
    this.lostCustomersCount = 0;

    // 조리대 및 슬롯 초기화
    this.clearBowl();
    this.cookedHotteoks = [];
    this.renderCookedTray();
    this.customerSlots = [null, null, null, null];
    this.renderCustomerSlots();

    // UI 갱신
    this.stageNumDisplay.textContent = this.stage;
    this.updateTimerDisplay();
    this.updateOrderRateDisplay();
    this.timerBox.classList.remove('danger');

    // 인터벌 및 타이머 정리
    this.stopAllTimers();

    // 1. 스테이지 타이머 (1초마다 90초 카운트다운)
    this.stageTimerInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.remainingTime--;
      this.updateTimerDisplay();

      if (this.remainingTime <= 15) {
        this.timerBox.classList.add('danger');
      }

      if (this.remainingTime <= 0) {
        this.endStage();
      }
    }, 1000);

    // 2. 손님 대기시간(1분=60초) 매 초 감소 및 이탈 처리
    this.customerTickInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.tickCustomerPatience();
    }, 1000);

    // 3. 첫 손님 즉시 2명 생성 후 주기적 손님 스폰
    this.spawnCustomer();
    setTimeout(() => { if (this.isPlaying) this.spawnCustomer(); }, 1200);
    this.startCustomerSpawner();

    // 4. 무작위 ? 랜덤 재료 스폰 스케줄러
    this.scheduleMysteryIngredient();

    // 시작 사운드
    window.soundSystem.playClick();
  }

  stopAllTimers() {
    if (this.stageTimerInterval) clearInterval(this.stageTimerInterval);
    if (this.customerTickInterval) clearInterval(this.customerTickInterval);
    if (this.customerSpawnTimer) clearInterval(this.customerSpawnTimer);
    if (this.mysterySpawnTimer) clearTimeout(this.mysterySpawnTimer);
    if (this.mysteryCountdownInterval) clearInterval(this.mysteryCountdownInterval);
    this.hideMysteryIngredient();
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.remainingTime / 60);
    const secs = this.remainingTime % 60;
    this.stageTimerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const percent = (this.remainingTime / this.stageDuration) * 100;
    this.stageTimerBar.style.width = `${percent}%`;
  }

  updateOrderRateDisplay() {
    const totalHotteoks = this.servedHotteoksCount + this.lostHotteoksCount;
    const rate = totalHotteoks === 0 ? 0 : Math.round((this.servedHotteoksCount / totalHotteoks) * 100);

    this.orderRateDisplay.textContent = `${rate}%`;
    this.orderRatioDisplay.textContent = `(${this.servedHotteoksCount}/${totalHotteoks}개)`;
    this.stageRateBar.style.width = `${Math.min(100, rate)}%`;

    if (rate >= 80) {
      this.orderRateDisplay.style.color = '#34d399';
    } else {
      this.orderRateDisplay.style.color = rate >= 50 ? '#f59e0b' : '#ef4444';
    }
  }

  updateScoreDisplay() {
    this.currentScoreDisplay.textContent = this.score.toLocaleString();
    this.saveHighScore();
  }

  // ==================== 손님 시스템 (1~5개 다중/다종 주문 & 귀여운 스킨톤 아바타) ====================

  startCustomerSpawner() {
    // 단계가 높아질수록 손님 생성 속도 소폭 빨라짐 (3~6초 주기)
    const interval = Math.max(3000, 6000 - Math.floor(this.stage * 30));
    this.customerSpawnTimer = setInterval(() => {
      if (!this.isPlaying) return;
      this.spawnCustomer();
    }, interval);
  }

  spawnCustomer() {
    // 빈 슬롯 찾기
    const emptyIdx = this.customerSlots.findIndex(slot => slot === null);
    if (emptyIdx === -1) return; // 자리가 꽉 참

    // 단계별 주문 가능한 호떡 결정
    const availableHotteoks = ["꿀호떡", "야채호떡"];
    if (this.stage >= 2) availableHotteoks.push("팥호떡");
    if (this.stage >= 4) availableHotteoks.push("매콤호떡");
    if (this.stage >= 6) availableHotteoks.push("씨앗호떡");

    // 손님이 원하는 호떡 수량: 1개 ~ 5개 (동일 호떡 여러 개 또는 여러 종류 혼합)
    const totalQty = Math.floor(Math.random() * 5) + 1;
    const orderItemsMap = {};

    // 35% 확률로 1가지 종류 몰아사기, 65% 확률로 여러 종류 혼합 주문
    const isSingleKind = Math.random() < 0.35 || totalQty === 1;

    if (isSingleKind) {
      const pick = availableHotteoks[Math.floor(Math.random() * availableHotteoks.length)];
      orderItemsMap[pick] = totalQty;
    } else {
      let remainingToDistribute = totalQty;
      // 섞을 호떡 종류 선택 (최대 3종류)
      const shuffledKinds = [...availableHotteoks].sort(() => 0.5 - Math.random());
      const kindsToUse = shuffledKinds.slice(0, Math.min(shuffledKinds.length, Math.min(3, totalQty)));

      kindsToUse.forEach(k => {
        orderItemsMap[k] = 1;
        remainingToDistribute--;
      });

      while (remainingToDistribute > 0) {
        const pick = kindsToUse[Math.floor(Math.random() * kindsToUse.length)];
        orderItemsMap[pick]++;
        remainingToDistribute--;
      }
    }

    const orderItems = Object.keys(orderItemsMap).map(k => ({
      name: k,
      total: orderItemsMap[k],
      remaining: orderItemsMap[k]
    }));

    const avatarInfo = CUSTOMER_AVATARS[Math.floor(Math.random() * CUSTOMER_AVATARS.length)];

    const customer = {
      id: Date.now() + Math.random(),
      orderItems: orderItems,
      totalCount: totalQty,
      name: avatarInfo.name,
      avatarImg: avatarInfo.img,
      remainingPatience: this.customerPatienceTime, // 60초 (1분)
      totalPatience: this.customerPatienceTime,
      activeReactionQuote: null,
      quoteTimer: null
    };

    this.customerSlots[emptyIdx] = customer;
    this.renderCustomerSlots();
  }

  tickCustomerPatience() {
    let changed = false;
    for (let i = 0; i < this.customerSlots.length; i++) {
      const c = this.customerSlots[i];
      if (!c) continue;

      c.remainingPatience--;
      changed = true;

      // 1분이 지나 고객이 떠남
      if (c.remainingPatience <= 0) {
        this.customerLeaves(i, c);
      }
    }
    if (changed) {
      this.renderCustomerSlots();
    }
  }

  customerLeaves(slotIndex, customer) {
    if (customer.quoteTimer) clearTimeout(customer.quoteTimer);

    // 아직 못 받은 호떡 수량을 손실 통계에 추가
    const lostQty = customer.orderItems.reduce((acc, it) => acc + it.remaining, 0);
    this.lostHotteoksCount += lostQty;
    this.lostCustomersCount++;
    this.customerSlots[slotIndex] = null;

    // 고객이 떠나면 -10점
    const penalty = 10;
    this.score = Math.max(0, this.score - penalty);
    this.updateScoreDisplay();
    this.updateOrderRateDisplay();

    // 효과음 및 페널티 플로팅 텍스트
    window.soundSystem.playCustomerAngry();
    this.showFloatingText(`-10점 (손님 이탈!)`, '#ef4444');
  }

  renderCustomerSlots() {
    this.customerSlotsContainer.innerHTML = '';

    for (let i = 0; i < 4; i++) {
      const customer = this.customerSlots[i];
      const slotEl = document.createElement('div');

      if (!customer) {
        slotEl.className = 'customer-card empty-slot';
        slotEl.innerHTML = `<span class="empty-slot-text">손님을 기다리는 중...</span>`;
        this.customerSlotsContainer.appendChild(slotEl);
        continue;
      }

      const percent = (customer.remainingPatience / customer.totalPatience) * 100;
      let statusClass = '';
      if (percent <= 25) {
        statusClass = 'danger';
      } else if (percent <= 50) {
        statusClass = 'warning';
      }

      // 호떡 주문 목록 아이템 칩 렌더링
      const orderChipsHtml = customer.orderItems.map(item => {
        const recipeInfo = RECIPES[item.name];
        const isDone = item.remaining === 0;
        return `
          <button class="order-item-chip ${isDone ? 'completed' : ''}" data-hotteok="${item.name}" title="클릭하여 '${item.name}' 레시피 확인">
            <span>${recipeInfo.emoji} ${item.name}</span>
            <span class="order-item-qty">${isDone ? '완료 ✔' : item.remaining + '개'}</span>
          </button>
        `;
      }).join('');

      slotEl.className = `customer-card ${percent <= 25 ? 'urgent' : ''}`;
      slotEl.innerHTML = `
        <!-- 호떡 다중 주문 말풍선 -->
        <div class="customer-order-bubble">
          <div class="order-bubble-top">
            <span class="order-total-badge">주문 총 ${customer.totalCount}개</span>
            <span class="order-recipe-hint">🔍 호떡 누르면 레시피</span>
          </div>
          <div class="order-items-grid">
            ${orderChipsHtml}
          </div>
        </div>

        <!-- 동글동글 귀여운 스킨톤 사람 캐릭터 아바타 & 리액션 말풍선 -->
        <div class="customer-avatar-box">
          ${customer.activeReactionQuote ? `<div class="customer-reaction-bubble">${customer.activeReactionQuote}</div>` : ''}
          <div class="customer-avatar-frame">
            <img src="${customer.avatarImg}" alt="${customer.name}" class="customer-avatar-img">
          </div>
          <span class="customer-emote">${percent <= 25 ? '💦' : (customer.activeReactionQuote ? '✨' : '😋')}</span>
        </div>

        <span class="customer-name-tag">${customer.name}</span>

        <!-- 1분 대기 시간 프로그레스 바 -->
        <div class="customer-patience-wrap">
          <div class="patience-info-row">
            <span>대기 시간</span>
            <span class="patience-timer-text">${customer.remainingPatience}초</span>
          </div>
          <div class="patience-track">
            <div class="patience-fill ${statusClass}" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;

      // 주문 칩 클릭 시 해당 호떡의 레시피 팝업 창 노출
      slotEl.querySelectorAll('.order-item-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const hName = btn.getAttribute('data-hotteok');
          window.soundSystem.playClick();
          this.openRecipeModal(hName);
        });
      });

      // 카드 전체 클릭 시 첫 번째 남은 호떡 레시피 노출
      slotEl.addEventListener('click', () => {
        const firstRemaining = customer.orderItems.find(it => it.remaining > 0) || customer.orderItems[0];
        window.soundSystem.playClick();
        this.openRecipeModal(firstRemaining.name);
      });

      this.customerSlotsContainer.appendChild(slotEl);
    }
  }

  // ==================== 재료 조합 & 호떡 굽기 ====================

  toggleIngredient(ingName) {
    window.soundSystem.playIngredientAdd();

    // 이미 들어가 있으면 제거, 아니면 추가
    const existingIdx = this.selectedIngredients.indexOf(ingName);
    if (existingIdx !== -1) {
      this.selectedIngredients.splice(existingIdx, 1);
    } else {
      this.selectedIngredients.push(ingName);
    }

    this.renderBowl();
    this.updateIngredientButtonsState();
  }

  autoFillRecipe(recipeName) {
    const r = RECIPES[recipeName];
    if (!r) return;
    this.selectedIngredients = [...r.ingredients];
    window.soundSystem.playIngredientAdd();
    this.renderBowl();
    this.updateIngredientButtonsState();
  }

  clearBowl() {
    this.selectedIngredients = [];
    this.hasMysteryIngredient = false;
    this.renderBowl();
    this.updateIngredientButtonsState();
  }

  renderBowl() {
    this.bowlList.innerHTML = '';
    const hasItems = this.selectedIngredients.length > 0;

    this.bowlEmptyHint.style.display = hasItems ? 'none' : 'block';

    this.selectedIngredients.forEach((ing) => {
      const chip = document.createElement('div');
      chip.className = 'ing-chip';
      chip.innerHTML = `
        <span>${INGREDIENT_ICONS[ing] || '🧂'} ${ing}</span>
        <span class="chip-remove">✖</span>
      `;
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleIngredient(ing);
      });
      this.bowlList.appendChild(chip);
    });

    // 행운의 ? 재료 배지
    if (this.hasMysteryIngredient) {
      this.luckyBadge.classList.remove('hidden');
    } else {
      this.luckyBadge.classList.add('hidden');
    }

    // 굽기 버튼 활성화 조건: 재료가 3개 이상 들어있을 때
    this.btnCraft.disabled = this.selectedIngredients.length === 0;
  }

  updateIngredientButtonsState() {
    document.querySelectorAll('.ing-btn[data-ingredient]').forEach(btn => {
      const ing = btn.getAttribute('data-ingredient');
      if (this.selectedIngredients.includes(ing)) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  craftHotteok() {
    if (this.selectedIngredients.length === 0) return;

    window.soundSystem.playSizzle();

    // 일치하는 호떡 레시피 검사
    const matchedRecipe = this.findMatchingRecipe(this.selectedIngredients);

    if (matchedRecipe) {
      // 합성 성공!
      window.soundSystem.playCookSuccess();

      let bonusScore = 0;
      if (this.hasMysteryIngredient) {
        // "랜덤 호떡 재료를 다른 호떡 재료와 함께 클릭하면 1~100까지의 추가 점수를 무작위로 받을 수 있다."
        bonusScore = Math.floor(Math.random() * 100) + 1;
        window.soundSystem.playLuckyBonus();
        this.showFloatingText(`✨ 행운 보너스 +${bonusScore}점!`, '#34d399');
      }

      const cookedItem = {
        name: matchedRecipe.name,
        emoji: matchedRecipe.emoji,
        score: matchedRecipe.score,
        bonus: bonusScore
      };

      this.cookedHotteoks.push(cookedItem);
      this.renderCookedTray();
      this.clearBowl();

      // 자동 서빙 가능한 손님이 있다면 즉시 전달
      this.autoServeFirstMatching(cookedItem);

    } else {
      // 레시피 불일치 - 반죽 실패
      this.showFloatingText('⚠️ 재료 조합 불일치! 레시피를 확인하세요', '#f87171');
      window.soundSystem.playCustomerAngry();
      // 재료는 그대로 두거나 편의상 유지
    }
  }

  findMatchingRecipe(ingredientsList) {
    const listSorted = [...ingredientsList].sort();
    for (const key in RECIPES) {
      const recipe = RECIPES[key];
      const rSorted = [...recipe.ingredients].sort();
      if (listSorted.length === rSorted.length && listSorted.every((val, idx) => val === rSorted[idx])) {
        return recipe;
      }
    }
    return null;
  }

  renderCookedTray() {
    this.cookedTray.innerHTML = '';
    const hasCooked = this.cookedHotteoks.length > 0;

    this.trayEmptyHint.style.display = hasCooked ? 'none' : 'flex';
    this.btnAutoServe.disabled = !hasCooked;

    this.cookedHotteoks.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'cooked-item-card';
      card.innerHTML = `
        <span class="cooked-emoji">${item.emoji}</span>
        <div class="cooked-info">
          <span class="cooked-name">${item.name}</span>
          ${item.bonus > 0 ? `<span class="cooked-bonus">🎁 +${item.bonus}pt 보너스</span>` : ''}
        </div>
        <button class="btn-serve-item">손님 전달</button>
      `;

      card.querySelector('.btn-serve-item').addEventListener('click', () => {
        this.serveSpecificHotteok(idx);
      });

      this.cookedTray.appendChild(card);
    });
  }

  // ==================== 호떡 전달 & 점수 획득 ====================

  autoServeFirstMatching(cookedItem) {
    // 주문한 손님 중 해당 호떡이 필요하고(remaining > 0), 남은 대기 시간이 가장 적은 손님 우선 전달
    let candidateIndex = -1;
    let minPatience = Infinity;

    for (let i = 0; i < this.customerSlots.length; i++) {
      const c = this.customerSlots[i];
      if (!c) continue;

      const needsThisHotteok = c.orderItems.some(it => it.name === cookedItem.name && it.remaining > 0);
      if (needsThisHotteok) {
        if (c.remainingPatience < minPatience) {
          minPatience = c.remainingPatience;
          candidateIndex = i;
        }
      }
    }

    if (candidateIndex !== -1) {
      const trayIndex = this.cookedHotteoks.indexOf(cookedItem);
      if (trayIndex !== -1) {
        this.cookedHotteoks.splice(trayIndex, 1);
        this.renderCookedTray();
        this.executeServe(candidateIndex, cookedItem);
      }
    }
  }

  serveMatchingHotteok() {
    if (this.cookedHotteoks.length === 0) return;

    for (let hIdx = this.cookedHotteoks.length - 1; hIdx >= 0; hIdx--) {
      const hotteok = this.cookedHotteoks[hIdx];
      const custIdx = this.customerSlots.findIndex(c => 
        c && c.orderItems.some(it => it.name === hotteok.name && it.remaining > 0)
      );

      if (custIdx !== -1) {
        this.cookedHotteoks.splice(hIdx, 1);
        this.renderCookedTray();
        this.executeServe(custIdx, hotteok);
        return;
      }
    }

    this.showFloatingText('일치하는 주문 손님이 없습니다!', '#f59e0b');
  }

  serveSpecificHotteok(trayIndex) {
    const hotteok = this.cookedHotteoks[trayIndex];
    if (!hotteok) return;

    const custIdx = this.customerSlots.findIndex(c => 
      c && c.orderItems.some(it => it.name === hotteok.name && it.remaining > 0)
    );

    if (custIdx !== -1) {
      this.cookedHotteoks.splice(trayIndex, 1);
      this.renderCookedTray();
      this.executeServe(custIdx, hotteok);
    } else {
      this.showFloatingText(`현재 '${hotteok.name}'을 기다리는 손님이 없습니다!`, '#f59e0b');
    }
  }

  executeServe(slotIndex, hotteok) {
    const customer = this.customerSlots[slotIndex];
    if (!customer) return;

    // 해당 호떡의 잔여 수량 1개 차감
    const targetItem = customer.orderItems.find(it => it.name === hotteok.name && it.remaining > 0);
    if (!targetItem) return;

    targetItem.remaining--;
    this.servedHotteoksCount++;

    // 기본 점수 + 행운 ? 보너스 점수 가산
    const totalGained = hotteok.score + (hotteok.bonus || 0);
    this.score += totalGained;

    // 손님의 랜덤 감탄 멘트 ('맛있다', '음~', '또 사먹자!', '역시 맛집이야' 등)
    const quote = CUSTOMER_REACTION_QUOTES[Math.floor(Math.random() * CUSTOMER_REACTION_QUOTES.length)];
    customer.activeReactionQuote = quote;

    if (customer.quoteTimer) clearTimeout(customer.quoteTimer);
    customer.quoteTimer = setTimeout(() => {
      customer.activeReactionQuote = null;
      this.renderCustomerSlots();
    }, 1800);

    // 전체 호떡 수령 완료 여부 체크
    const isAllCompleted = customer.orderItems.every(it => it.remaining === 0);

    this.updateScoreDisplay();
    this.updateOrderRateDisplay();
    this.renderCustomerSlots();
    window.soundSystem.playCustomerHappy();

    if (isAllCompleted) {
      // 모든 호떡을 다 받아 매우 만족하여 퇴장
      this.servedCustomersCount++;
      this.showFloatingText(`+${totalGained}점! 완전 만족! (${customer.totalCount}개 완판)`, '#34d399');

      // 리액션 말풍선을 충분히 본 후 기분 좋게 퇴장
      setTimeout(() => {
        if (this.customerSlots[slotIndex] === customer) {
          this.customerSlots[slotIndex] = null;
          this.renderCustomerSlots();
          setTimeout(() => {
            if (this.isPlaying) this.spawnCustomer();
          }, 1000);
        }
      }, 900);

    } else {
      // 아직 더 받을 호떡이 남아있음
      const leftTotal = customer.orderItems.reduce((acc, it) => acc + it.remaining, 0);
      this.showFloatingText(`+${totalGained}점! ('${hotteok.name}' 전달, 남은 호떡: ${leftTotal}개)`, '#34d399');
    }
  }

  // ==================== 무작위 ? 랜덤 재료 시스템 ====================

  scheduleMysteryIngredient() {
    // 10~20초 무작위 간격으로 ? 재료 출현
    const delay = Math.floor(Math.random() * 10000) + 12000;
    this.mysterySpawnTimer = setTimeout(() => {
      if (!this.isPlaying) return;
      this.showMysteryIngredient();
    }, delay);
  }

  showMysteryIngredient() {
    this.btnMystery.classList.remove('hidden');
    window.soundSystem.playLuckyBonus();

    let durationMs = 8000; // 8초간 노출
    let remaining = durationMs;
    const interval = 100;

    if (this.mysteryCountdownInterval) clearInterval(this.mysteryCountdownInterval);
    this.mysteryCountdownInterval = setInterval(() => {
      remaining -= interval;
      const pct = (remaining / durationMs) * 100;
      this.mysteryCountdownBar.style.width = `${pct}%`;

      if (remaining <= 0) {
        clearInterval(this.mysteryCountdownInterval);
        this.hideMysteryIngredient();
        this.scheduleMysteryIngredient();
      }
    }, interval);
  }

  hideMysteryIngredient() {
    this.btnMystery.classList.add('hidden');
    if (this.mysteryCountdownInterval) clearInterval(this.mysteryCountdownInterval);
  }

  pickMysteryIngredient() {
    this.hasMysteryIngredient = true;
    this.hideMysteryIngredient();
    window.soundSystem.playLuckyBonus();
    this.renderBowl();
    this.showFloatingText('✨ 행운의 ? 비법 재료 첨가!', '#facc15');
    this.scheduleMysteryIngredient();
  }

  // ==================== 단계 종료 & 클리어/오버 판정 ====================

  endStage() {
    this.isPlaying = false;
    this.stopAllTimers();

    const totalHotteoks = this.servedHotteoksCount + this.lostHotteoksCount;
    // 총 주문이 0개면 100% 처리
    const rate = totalHotteoks === 0 ? 100 : Math.round((this.servedHotteoksCount / totalHotteoks) * 100);

    // 판정 규칙: 고객 주문을 80% 이상 수행 시 성공
    const isSuccess = rate >= 80;

    if (isSuccess) {
      if (this.stage >= this.maxStage) {
        // 100단계 최종 클리어 엔딩!
        this.showGrandEnding();
      } else {
        // 다음 단계 통과 모달
        this.showStageClear(rate);
      }
    } else {
      // 80% 미달로 게임 오버
      this.showGameOver(rate);
    }
  }

  showStageClear(rate) {
    window.soundSystem.playStageClear();
    this.clearRateVal.textContent = `${rate}%`;
    this.clearOrdersVal.textContent = `${this.servedHotteoksCount}개 (${this.servedCustomersCount}명)`;
    this.clearScoreVal.textContent = `${this.score.toLocaleString()}점`;
    this.nextStageNumText.textContent = this.stage + 1;
    this.openModal(this.modalStageClear);
  }

  showGameOver(rate) {
    window.soundSystem.playGameOver();
    this.failRateVal.textContent = `${rate}% (목표 80%)`;
    this.failStageVal.textContent = `STAGE ${this.stage}`;
    this.failScoreVal.textContent = `${this.score.toLocaleString()}점`;
    this.failReasonText.textContent = `주문 달성률(${rate}%)이 80%에 미치지 못해 남대문 호떡 영업을 마감합니다...`;
    this.openModal(this.modalGameOver);
  }

  showGrandEnding() {
    window.soundSystem.playGrandEnding();
    this.endingFinalScore.textContent = this.score.toLocaleString();
    this.openModal(this.modalGrandEnding);
  }

  triggerDebugWin() {
    // 디버그 테스트: 즉시 90% 달성으로 스테이지 클리어
    this.servedHotteoksCount = 18;
    this.lostHotteoksCount = 2;
    this.servedCustomersCount = 6;
    this.endStage();
  }

  // ==================== 레시피 팝업 모달 ====================

  openRecipeModal(highlightHotteok = null) {
    const cards = document.querySelectorAll('.recipe-item');
    cards.forEach(card => {
      card.classList.remove('highlight-order');
      if (highlightHotteok && card.getAttribute('data-hotteok') === highlightHotteok) {
        card.classList.add('highlight-order');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    const descEl = document.getElementById('recipe-modal-desc');
    if (highlightHotteok) {
      descEl.innerHTML = `🎯 손님이 주문한 <strong style="color:#facc15;">[${highlightHotteok}]</strong>의 필수 레시피입니다! 아래 버튼을 누르면 즉시 조합대에 재료가 담깁니다.`;
    } else {
      descEl.textContent = '손님이 주문한 호떡의 필수 재료를 확인하고 정성껏 합성해 보세요!';
    }

    this.openModal(this.modalRecipe);
  }

  // ==================== 유틸리티 ====================

  openModal(el) {
    el.classList.add('active');
  }

  closeModal(el) {
    el.classList.remove('active');
  }

  showFloatingText(text, color = '#facc15') {
    const el = document.createElement('div');
    el.className = 'floating-score';
    el.textContent = text;
    el.style.color = color;
    el.style.left = `${Math.random() * 40 + 30}%`;
    el.style.top = `${Math.random() * 20 + 40}%`;

    this.floatingScoresLayer.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1400);
  }

  saveHighScore() {
    try {
      const current = localStorage.getItem('hotteok_master_best');
      if (!current || this.score > parseInt(current, 10)) {
        localStorage.setItem('hotteok_master_best', this.score);
      }
    } catch (e) {}
  }

  loadHighScore() {
    try {
      const best = localStorage.getItem('hotteok_master_best');
      if (best) {
        // 옵션: 이전 최고 점수 로드 가능
      }
    } catch (e) {}
  }
}

// 브라우저 로드 시 게임 엔진 시작
window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new HotteokGame();
});
