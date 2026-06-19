/* =============================================================
   Dreamy Doorsteps — app.js
   State, save/load, screen routing, shops, decoration, quizzes.
   ============================================================= */

const SAVE_KEY = 'dreamyDoorsteps_save_v1';
const SAVE_VERSION = 1;

/* ============= state ============= */
let state = null;
let currentGame = null;
let currentShopRoomTarget = null; // 'wall' | 'floor' | null
let pendingSlotIndex = null;
let dailyStart = Date.now();

function defaultState() {
  return {
    version: SAVE_VERSION,
    hasOnboarded: false,
    character: { name: '', avatar: 'frilly_dress', ownedOutfits: ['frilly_dress'] },
    dreamies: 100,
    unlockedBuildings: ['arcade', 'home'],
    inventory: {},
    homes: {
      starter: {
        unlocked: true,
        name: 'Rose Cottage',
        wallColor: '#F4D6E0',
        floorColor: '#D4B895',
        slots: Array(20).fill(null)
      }
    },
    currentHome: 'starter',
    lastLoginDate: null,
    loginStreak: 0,
    dailyQuests: [],
    questsAssignedFor: null,
    totalPlayMinutesToday: 0,
    parentalLimit: 0, // 0 = unlimited
    // counters for daily quests:
    todayCounts: { play_count: 0, earned: 0, purchases: 0, quiz_correct: 0, placed: 0,
                   score_bubble: 0, score_snake: 0, score_stack: 0 }
  };
}

/* ============= save / load ============= */
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Save failed', e);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== SAVE_VERSION) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

/* ============= utility ============= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showToast(text, kind = '') {
  const t = $('#toast');
  t.textContent = text;
  t.className = 'toast show ' + kind;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    t.className = 'toast hidden';
  }, 2000);
}

function show(screenId) {
  $$('.screen').forEach(s => s.hidden = (s.id !== screenId));
  // Top bar only when past onboarding
  $('#topbar').classList.toggle('hidden', !state.hasOnboarded || screenId === 'screen-welcome' || screenId.startsWith('screen-pick') || screenId === 'screen-name');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function refreshWallet() {
  $('#wallet-amount').textContent = state.dreamies.toLocaleString();
}

function addCoins(amount, reason = '') {
  state.dreamies += amount;
  state.todayCounts.earned += amount;
  updateQuestProgress('earned', amount, true);
  refreshWallet();
  save();
}

function spendCoins(amount) {
  if (state.dreamies < amount) {
    showToast('Not enough ✨', 'warn');
    return false;
  }
  state.dreamies -= amount;
  refreshWallet();
  save();
  return true;
}

function getCharacter(id) {
  return CHARACTERS.find(c => c.id === id);
}

/* ============= onboarding ============= */
function renderCharacterPick() {
  const grid = $('#character-grid');
  grid.innerHTML = '';
  CHARACTERS.forEach(c => {
    const card = document.createElement('button');
    card.className = 'char-card';
    card.dataset.id = c.id;
    card.innerHTML = `<img src="${c.img}" alt="${c.name}"/><span>${c.name}</span>`;
    card.addEventListener('click', () => {
      $$('#character-grid .char-card').forEach(el => el.classList.remove('selected'));
      card.classList.add('selected');
      state.character.avatar = c.id;
      state.character.ownedOutfits = [c.id];
      $('#char-next').disabled = false;
    });
    grid.appendChild(card);
  });
}

function setupHomePicker() {
  $$('#home-grid .home-card').forEach(card => {
    card.addEventListener('click', () => {
      $$('#home-grid .home-card').forEach(el => el.classList.remove('selected'));
      card.classList.add('selected');
      const homeId = card.dataset.home;
      const home = HOMES_STARTER[homeId];
      state.homes.starter.name = home.name;
      state.homes.starter.wallColor = home.wallColor;
      state.homes.starter.floorColor = home.floorColor;
      $('#home-next').disabled = false;
    });
  });
}

/* ============= town map ============= */
function renderTown() {
  $('#hello-name').textContent = state.character.name || 'friend';
  const map = $('#town-map');
  map.innerHTML = '';
  BUILDINGS.forEach(b => {
    const isUnlocked = state.unlockedBuildings.includes(b.id);
    const div = document.createElement('button');
    div.className = 'building' + (isUnlocked ? ' owned' : ' locked');
    div.innerHTML = `
      <div class="b-emoji">${b.emoji}</div>
      <div class="b-name">${b.name}</div>
      <div class="b-cost">${isUnlocked ? 'Open' : (b.cost + ' ✨')}</div>
    `;
    div.addEventListener('click', () => handleBuildingTap(b));
    map.appendChild(div);
  });

  // Daily login bonus
  const today = todayStr();
  if (state.lastLoginDate !== today) {
    if (state.lastLoginDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1) + '-' + yesterday.getDate();
      state.loginStreak = state.lastLoginDate === yStr ? (state.loginStreak + 1) : 1;
    } else {
      state.loginStreak = 1;
    }
    state.lastLoginDate = today;
    const bonus = 50 * Math.min(state.loginStreak, 7);
    addCoins(bonus, 'daily');
    showToast(`Daily bonus! +${bonus} ✨ (streak ${state.loginStreak})`, 'success');
    // Also reset daily counters
    state.totalPlayMinutesToday = 0;
    state.todayCounts = { play_count: 0, earned: bonus, purchases: 0, quiz_correct: 0, placed: 0,
                          score_bubble: 0, score_snake: 0, score_stack: 0 };
    rollDailyQuests();
    save();
  }
}

function handleBuildingTap(b) {
  if (!state.unlockedBuildings.includes(b.id)) {
    // Try to unlock
    if (state.dreamies < b.cost) {
      showToast(`Need ${b.cost - state.dreamies} more ✨`, 'warn');
      return;
    }
    confirmModal(`Unlock ${b.name}?`, `This costs ${b.cost} ✨.`, () => {
      if (spendCoins(b.cost)) {
        state.unlockedBuildings.push(b.id);
        // For homes, add to homes object
        if (b.home) {
          state.homes[b.home] = {
            unlocked: true,
            name: b.name,
            wallColor: '#FFF1DC',
            floorColor: '#D4B895',
            slots: Array(20).fill(null)
          };
        }
        addCoins(500, 'unlock_bonus');
        showToast(`${b.name} unlocked! +500 ✨ bonus`, 'success');
        renderTown();
        save();
      }
    });
    return;
  }
  // It's unlocked — open it
  routeToBuilding(b);
}

function routeToBuilding(b) {
  if (b.screen === 'screen-shop') {
    openShop(b.shop, b.name);
  } else if (b.screen === 'screen-home') {
    state.currentHome = b.home || 'starter';
    if (!state.homes[state.currentHome]) state.currentHome = 'starter';
    show('screen-home');
    renderHome();
  } else if (b.screen === 'screen-arcade') {
    show('screen-arcade');
  } else if (b.screen === 'screen-library') {
    show('screen-library');
    startQuiz();
  }
}

/* ============= shops ============= */
function openShop(shopId, title) {
  const items = SHOP_ITEMS[shopId] || [];
  $('#shop-title').textContent = title;
  $('#shop-sub').textContent = 'Tap an item to buy.';
  const grid = $('#shop-grid');
  grid.innerHTML = '';
  items.forEach(item => {
    const cell = document.createElement('button');
    const owned = item.category === 'outfits' && state.character.ownedOutfits.includes(item.outfitId);
    cell.className = 'shop-item' + (owned ? ' owned' : '');
    cell.innerHTML = `
      <div class="item-emoji">${item.emoji}</div>
      <div class="item-name">${item.name}</div>
      <div class="item-cost">${owned ? 'Owned' : (item.cost + ' ✨')}</div>
    `;
    if (!owned) {
      cell.addEventListener('click', () => buyItem(item, shopId));
    }
    grid.appendChild(cell);
  });
  show('screen-shop');
}

function buyItem(item, shopId) {
  if (!spendCoins(item.cost)) return;
  if (item.category === 'outfits') {
    state.character.ownedOutfits.push(item.outfitId);
    showToast(`Got ${item.name}! Check the Closet.`, 'success');
  } else {
    addToInventory(item);
    showToast(`Bought ${item.name}!`, 'success');
  }
  state.todayCounts.purchases++;
  updateQuestProgress('purchases', 1, true);
  save();
  openShop(shopId, $('#shop-title').textContent); // refresh
}

function addToInventory(item) {
  if (!state.inventory[item.id]) {
    state.inventory[item.id] = { ...item, count: 0 };
  }
  state.inventory[item.id].count++;
}

/* ============= inventory ============= */
let activeInvTab = 'furniture';
function renderInventory() {
  const grid = $('#inv-grid');
  grid.innerHTML = '';
  const items = Object.values(state.inventory).filter(it => it.category === activeInvTab && it.count > 0);
  if (items.length === 0) {
    grid.innerHTML = `<p class="hint" style="grid-column: 1/-1; text-align:center; padding:2rem 0;">Nothing here yet. Visit a shop!</p>`;
    return;
  }
  items.forEach(it => {
    const cell = document.createElement('div');
    cell.className = 'inv-cell';
    cell.innerHTML = `
      <div class="inv-emoji">${it.emoji}</div>
      <div class="inv-name">${it.name}</div>
      ${it.count > 1 ? `<span class="inv-count">${it.count}</span>` : ''}
    `;
    grid.appendChild(cell);
  });
}

/* ============= closet ============= */
function renderCloset() {
  const c = getCharacter(state.character.avatar);
  $('#closet-img').src = c.img;
  $('#closet-name').textContent = state.character.name;
  const grid = $('#closet-grid');
  grid.innerHTML = '';
  CHARACTERS.forEach(ch => {
    const owned = state.character.ownedOutfits.includes(ch.id);
    const worn = state.character.avatar === ch.id;
    const card = document.createElement('button');
    card.className = 'outfit-card' + (worn ? ' worn' : '') + (!owned ? ' locked' : '');
    card.innerHTML = `<img src="${ch.img}" alt="${ch.name}"/><span>${ch.name}</span>`;
    if (owned) {
      card.addEventListener('click', () => {
        state.character.avatar = ch.id;
        save();
        renderCloset();
        showToast(`Now wearing ${ch.name}!`, 'success');
      });
    }
    grid.appendChild(card);
  });
}

/* ============= home / decorate ============= */
function renderHome() {
  const home = state.homes[state.currentHome];
  if (!home) return;
  $('#home-title').textContent = home.name;
  $('#room-wall').style.background = home.wallColor;
  $('#room-floor').style.background = home.floorColor;
  const slotsEl = $('#room-slots');
  slotsEl.innerHTML = '';
  home.slots.forEach((slot, i) => {
    const div = document.createElement('div');
    div.className = 'room-slot' + (slot ? '' : ' empty');
    if (slot) {
      div.innerHTML = slot.emoji;
      div.addEventListener('click', () => removePlacedItem(i));
    } else {
      div.addEventListener('click', () => openPlacePicker(i));
    }
    slotsEl.appendChild(div);
  });
}

function openPlacePicker(slotIndex) {
  pendingSlotIndex = slotIndex;
  // Show items from inventory that are placeable
  const placeable = Object.values(state.inventory).filter(it =>
    ['furniture', 'food', 'plant', 'pet'].includes(it.category) && it.count > 0
  );
  if (placeable.length === 0) {
    showToast('Buy some items first!', 'warn');
    return;
  }
  $('#picker-title').textContent = 'Pick an item to place';
  const pg = $('#picker-grid');
  pg.innerHTML = '';
  placeable.forEach(it => {
    const sw = document.createElement('button');
    sw.className = 'picker-swatch';
    sw.style.background = '#FFF';
    sw.innerHTML = `${it.emoji}`;
    sw.title = it.name;
    sw.addEventListener('click', () => {
      placeItem(it);
      closePicker();
    });
    pg.appendChild(sw);
  });
  $('#picker-backdrop').classList.remove('hidden');
}

function placeItem(item) {
  const home = state.homes[state.currentHome];
  home.slots[pendingSlotIndex] = { id: item.id, emoji: item.emoji, name: item.name };
  state.inventory[item.id].count--;
  state.todayCounts.placed++;
  updateQuestProgress('placed', 1, true);
  save();
  renderHome();
  showToast(`Placed ${item.name}!`, 'success');
}

function removePlacedItem(slotIndex) {
  const home = state.homes[state.currentHome];
  const item = home.slots[slotIndex];
  if (!item) return;
  confirmModal('Remove this item?', `${item.name} will go back to your inventory.`, () => {
    home.slots[slotIndex] = null;
    if (!state.inventory[item.id]) {
      // Recreate the inventory entry
      const all = Object.values(SHOP_ITEMS).flat();
      const orig = all.find(x => x.id === item.id);
      if (orig) state.inventory[item.id] = { ...orig, count: 0 };
    }
    if (state.inventory[item.id]) state.inventory[item.id].count++;
    save();
    renderHome();
  });
}

function openWallPicker() {
  $('#picker-title').textContent = 'Pick a wallpaper';
  const pg = $('#picker-grid');
  pg.innerHTML = '';
  WALL_OPTIONS.forEach(opt => {
    const sw = document.createElement('button');
    sw.className = 'picker-swatch';
    sw.style.background = opt.color;
    sw.title = opt.label;
    sw.addEventListener('click', () => {
      state.homes[state.currentHome].wallColor = opt.color;
      save();
      renderHome();
      closePicker();
    });
    pg.appendChild(sw);
  });
  $('#picker-backdrop').classList.remove('hidden');
}

function openFloorPicker() {
  $('#picker-title').textContent = 'Pick a floor';
  const pg = $('#picker-grid');
  pg.innerHTML = '';
  FLOOR_OPTIONS.forEach(opt => {
    const sw = document.createElement('button');
    sw.className = 'picker-swatch';
    sw.style.background = opt.color;
    sw.title = opt.label;
    sw.addEventListener('click', () => {
      state.homes[state.currentHome].floorColor = opt.color;
      save();
      renderHome();
      closePicker();
    });
    pg.appendChild(sw);
  });
  $('#picker-backdrop').classList.remove('hidden');
}

function closePicker() { $('#picker-backdrop').classList.add('hidden'); }

/* ============= modal ============= */
function confirmModal(title, body, onYes) {
  $('#modal-title').textContent = title;
  $('#modal-body').textContent = body;
  $('#modal-backdrop').classList.remove('hidden');
  const yes = $('#modal-yes');
  const no = $('#modal-no');
  function close() {
    $('#modal-backdrop').classList.add('hidden');
    yes.removeEventListener('click', yesH);
    no.removeEventListener('click', noH);
  }
  function yesH() { close(); onYes(); }
  function noH() { close(); }
  yes.addEventListener('click', yesH);
  no.addEventListener('click', noH);
}

/* ============= quizzes ============= */
let currentQuiz = null;
function startQuiz() {
  currentQuiz = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
  $('#quiz-subject').textContent = currentQuiz.subject;
  $('#quiz-question').textContent = currentQuiz.q;
  $('#quiz-feedback').textContent = '';
  $('#quiz-next').hidden = true;
  const opts = $('#quiz-options');
  opts.innerHTML = '';
  currentQuiz.options.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'quiz-option';
    b.textContent = o;
    b.addEventListener('click', () => answerQuiz(b, i));
    opts.appendChild(b);
  });
}

function answerQuiz(btn, index) {
  $$('#quiz-options .quiz-option').forEach(el => el.disabled = true);
  if (index === currentQuiz.answer) {
    btn.classList.add('correct');
    const reward = 60;
    addCoins(reward, 'quiz');
    state.todayCounts.quiz_correct++;
    updateQuestProgress('quiz_correct', 1, true);
    $('#quiz-feedback').textContent = `Correct! +${reward} ✨`;
  } else {
    btn.classList.add('wrong');
    const correctBtn = $$('#quiz-options .quiz-option')[currentQuiz.answer];
    correctBtn.classList.add('correct');
    $('#quiz-feedback').textContent = 'Not quite — keep going!';
  }
  $('#quiz-next').hidden = false;
}

/* ============= games host ============= */
let lastGameId = null;
function openGame(gameId) {
  lastGameId = gameId;
  show('screen-game');
  $('#game-over').classList.add('hidden');
  $('#game-score-num').textContent = '0';
  $('#game-earned').textContent = '0 ✨';
  const canvas = $('#game-canvas');
  // Stop any old game first
  if (currentGame) currentGame.stop();
  // Wait a tick so canvas has correct size
  requestAnimationFrame(() => {
    const onScore = (s) => {
      $('#game-score-num').textContent = s;
      const earned = scoreToReward(gameId, s);
      $('#game-earned').textContent = earned + ' ✨';
    };
    const onEnd = (finalScore) => {
      const reward = scoreToReward(gameId, finalScore);
      addCoins(reward, 'game_' + gameId);
      state.todayCounts.play_count++;
      updateQuestProgress('play_count', 1, true);
      const scoreKey = 'score_' + gameId;
      state.todayCounts[scoreKey] = Math.max(state.todayCounts[scoreKey], finalScore);
      updateQuestProgress(scoreKey, finalScore, false);
      $('#over-score').textContent = finalScore;
      $('#over-earned').textContent = reward;
      $('#game-over').classList.remove('hidden');
      currentGame = null;
      save();
    };
    currentGame = Games[gameId](canvas, onEnd, onScore);
  });
}

function scoreToReward(gameId, score) {
  // Tuned per game so they all feel similar in payout
  const formulas = {
    bubble: (s) => Math.min(300, Math.round(s * 4)),
    snake:  (s) => Math.min(400, Math.round(s * 12)),
    stack:  (s) => Math.min(400, Math.round(s * 10))
  };
  return formulas[gameId] ? formulas[gameId](score) : 0;
}

/* ============= daily quests ============= */
function rollDailyQuests() {
  const today = todayStr();
  if (state.questsAssignedFor === today && state.dailyQuests.length === 3) return;
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
  state.dailyQuests = shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false }));
  state.questsAssignedFor = today;
  save();
}

function updateQuestProgress(type, value, increment) {
  state.dailyQuests.forEach(q => {
    if (q.completed) return;
    if (q.type !== type) return;
    if (increment) q.progress += value;
    else q.progress = Math.max(q.progress, value);
    if (q.progress >= q.target) {
      q.completed = true;
      addCoins(q.reward, 'quest');
      showToast(`Quest done! +${q.reward} ✨`, 'success');
    }
  });
  save();
}

function renderQuests() {
  const list = $('#quest-list');
  list.innerHTML = '';
  if (state.dailyQuests.length === 0) {
    list.innerHTML = `<p class="hint center" style="padding:2rem 0;">No quests yet. Check back tomorrow!</p>`;
    return;
  }
  state.dailyQuests.forEach(q => {
    const pct = Math.min(100, (q.progress / q.target) * 100);
    const div = document.createElement('div');
    div.className = 'quest-card' + (q.completed ? ' done' : '');
    div.innerHTML = `
      <div class="quest-desc">${q.desc}</div>
      <div class="quest-progress"><div class="quest-bar" style="width:${pct}%"></div></div>
      <div class="hint">${q.progress} / ${q.target} — Reward: <span class="quest-reward">${q.reward} ✨</span> ${q.completed ? '✅' : ''}</div>
    `;
    list.appendChild(div);
  });
}

/* ============= settings / parental timer ============= */
function renderSettings() {
  $('#timer-select').value = String(state.parentalLimit);
  $('#time-played').textContent = Math.round(state.totalPlayMinutesToday) + ' min';
}

function tickPlayTime() {
  // every minute
  state.totalPlayMinutesToday += 1;
  save();
  if (state.parentalLimit > 0 && state.totalPlayMinutesToday >= state.parentalLimit) {
    showToast(`Time's up for today (${state.parentalLimit} min). Take a break!`, 'warn');
    // Soft pause — pop user to welcome
    setTimeout(() => {
      if (currentGame) { currentGame.stop(); currentGame = null; }
      show('screen-welcome');
      $('#start-btn').textContent = 'Already played today';
      $('#start-btn').disabled = true;
    }, 1500);
  }
}

/* ============= event wiring ============= */
function wireEvents() {
  $('#start-btn').addEventListener('click', () => {
    state.hasOnboarded = false;
    show('screen-pick-character');
    renderCharacterPick();
  });
  $('#continue-btn').addEventListener('click', () => {
    show('screen-town');
    renderTown();
  });

  $('#char-next').addEventListener('click', () => {
    show('screen-name');
  });
  $('#name-input').addEventListener('input', (e) => {
    const v = e.target.value.trim();
    $('#name-next').disabled = v.length < 1;
    state.character.name = v;
  });
  $('#name-next').addEventListener('click', () => {
    show('screen-pick-home');
    setupHomePicker();
  });
  $('#home-next').addEventListener('click', () => {
    state.hasOnboarded = true;
    save();
    rollDailyQuests();
    show('screen-town');
    renderTown();
    refreshWallet();
    showToast(`Welcome to Dreamy Doorsteps, ${state.character.name}!`, 'success');
  });
  $$('[data-back]').forEach(b => {
    b.addEventListener('click', () => show(b.dataset.back));
  });

  $('#btn-home').addEventListener('click', () => {
    if (currentGame) { currentGame.stop(); currentGame = null; }
    show('screen-town');
    renderTown();
  });
  $('#btn-menu').addEventListener('click', () => {
    show('screen-menu');
  });

  $$('.menu-item').forEach(el => {
    el.addEventListener('click', () => {
      const goto = el.dataset.goto;
      if (goto === 'screen-home') {
        state.currentHome = 'starter';
        show(goto);
        renderHome();
      } else if (goto === 'screen-inventory') {
        show(goto);
        renderInventory();
      } else if (goto === 'screen-closet') {
        show(goto);
        renderCloset();
      } else if (goto === 'screen-quests') {
        show(goto);
        renderQuests();
      } else if (goto === 'screen-settings') {
        show(goto);
        renderSettings();
      }
    });
  });

  // Arcade
  $$('.arcade-card').forEach(c => {
    c.addEventListener('click', () => {
      openGame(c.dataset.game);
    });
  });
  $('#game-quit').addEventListener('click', () => {
    if (currentGame) currentGame.stop();
    currentGame = null;
    show('screen-arcade');
  });
  $('#over-quit').addEventListener('click', () => {
    show('screen-arcade');
  });
  $('#over-again').addEventListener('click', () => {
    openGame(lastGameId || 'bubble');
  });

  // Inventory tabs
  $$('#inv-tabs .tab').forEach(t => {
    t.addEventListener('click', () => {
      $$('#inv-tabs .tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      activeInvTab = t.dataset.tab;
      renderInventory();
    });
  });

  // Home tools
  $('#btn-wall').addEventListener('click', openWallPicker);
  $('#btn-floor').addEventListener('click', openFloorPicker);
  $('#btn-clear').addEventListener('click', () => {
    confirmModal('Clear the room?', 'All items will go back to your inventory.', () => {
      const home = state.homes[state.currentHome];
      home.slots.forEach((slot, i) => {
        if (slot) {
          if (!state.inventory[slot.id]) {
            const all = Object.values(SHOP_ITEMS).flat();
            const orig = all.find(x => x.id === slot.id);
            if (orig) state.inventory[slot.id] = { ...orig, count: 0 };
          }
          if (state.inventory[slot.id]) state.inventory[slot.id].count++;
        }
      });
      home.slots = Array(20).fill(null);
      save();
      renderHome();
    });
  });

  $('#picker-close').addEventListener('click', closePicker);

  // Quiz
  $('#quiz-next').addEventListener('click', startQuiz);

  // Settings
  $('#timer-select').addEventListener('change', (e) => {
    state.parentalLimit = parseInt(e.target.value, 10);
    save();
    showToast('Timer updated', 'success');
  });
  $('#reset-btn').addEventListener('click', () => {
    confirmModal('Reset everything?', 'This deletes your save permanently.', () => {
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    });
  });
}

/* ============= boot ============= */
function boot() {
  const saved = load();
  if (saved && saved.hasOnboarded) {
    state = saved;
    // Migrations / defaults
    if (!state.todayCounts) state.todayCounts = { play_count: 0, earned: 0, purchases: 0, quiz_correct: 0, placed: 0, score_bubble: 0, score_snake: 0, score_stack: 0 };
    if (typeof state.parentalLimit !== 'number') state.parentalLimit = 0;
    $('#continue-btn').hidden = false;
    refreshWallet();
    show('screen-welcome');
  } else {
    state = defaultState();
    show('screen-welcome');
  }
  wireEvents();
  refreshWallet();

  // Play time tick (1 min)
  setInterval(tickPlayTime, 60000);
  // Autosave every 30s
  setInterval(save, 30000);
  window.addEventListener('pagehide', save);
  window.addEventListener('beforeunload', save);
}

document.addEventListener('DOMContentLoaded', boot);
