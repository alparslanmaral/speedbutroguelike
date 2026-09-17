// =====================================================================
// INFERNO SPEED — single-player Speed turned into a Balatro-style roguelike
// =====================================================================

// === CONSTANTS ===
const SUITS = ['hearts', 'diamonds', 'spades', 'clubs'];
const SUIT_SYMBOL = { hearts: '♥', diamonds: '♦', spades: '♠', clubs: '♣' };
const RANK_LABEL = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };

const anteTimeLimits = [240, 210, 185, 165, 145, 130, 115, 100, 90, 75]; // seconds
const anteCardCounts = [20, 21, 22, 23, 24, 25, 26, 27, 28, 30];        // cards dealt to the player
const TOTAL_ANTES = anteTimeLimits.length;
const BOSS_TIME_FACTOR = 0.75;
const BASE_HAND_SIZE = 5;
const BASE_REFILL_DELAY = 350;   // ms until hand refills from stock
const BASE_FLIP_DELAY = 1000;    // ms of being stuck before reserves flip automatically
const SHOP_SIZE = 3;
const REROLL_COST = 3;
const SAVE_KEY = 'infernoSpeedSave';

// === MARKET ITEMS (jokers + consumables) ===
// type: 'joker' stays in ownedMarketItems; 'consumable' applies instantly on purchase.
const ALL_MARKET_ITEMS = [
  // --- Crimson combo (red cards) ---
  { key: 'crimson_deal', name: 'Crimson Deal', price: 6, type: 'joker', desc: '+1 chip whenever a red card (hearts/diamonds) is played.' },
  { key: 'crimson_haste', name: 'Crimson Haste', price: 6, type: 'joker', desc: '+2 seconds to the ante timer whenever a red card (hearts/diamonds) is played.' },
  { key: 'crimson_abundance', name: 'Crimson Abundance', price: 15, type: 'joker', desc: 'Increases the number of red cards in the main deck by 50% (the deck is rebuilt).' },
  // --- Onyx combo (black cards) ---
  { key: 'onyx_deal', name: 'Onyx Deal', price: 6, type: 'joker', desc: '+1 chip whenever a black card (spades/clubs) is played.' },
  { key: 'onyx_haste', name: 'Onyx Haste', price: 6, type: 'joker', desc: '+2 seconds whenever a black card is played.' },
  { key: 'onyx_abundance', name: 'Onyx Abundance', price: 15, type: 'joker', desc: 'Increases the number of black cards in the main deck by 50%.' },
  // --- Seven combo ---
  { key: 'lucky_seven', name: 'Lucky Seven', price: 7, type: 'joker', desc: '+2 chips whenever a 7 is played.' },
  { key: 'seven_seconds', name: 'Seven Seconds', price: 7, type: 'joker', desc: '+7 seconds whenever a 7 is played.' },
  { key: 'sevenfold', name: 'Sevenfold', price: 12, type: 'joker', desc: 'Adds 4 extra 7s (one per suit) to the main deck.' },
  // --- Low card combo ---
  { key: 'low_road', name: 'Low Road', price: 6, type: 'joker', desc: '+1 second whenever a low card (2-5) is played.' },
  { key: 'gutter_deck', name: 'Gutter Deck', price: 10, type: 'joker', desc: 'Adds 8 extra low cards (2-5) to the main deck.' },
  // --- Face / Ace ---
  { key: 'bounty_of_faces', name: 'Bounty of Faces', price: 8, type: 'joker', desc: '+3 chips whenever a face card (J/Q/K) is played.' },
  { key: 'royal_court', name: 'Royal Court', price: 12, type: 'joker', desc: 'Adds 6 extra face cards (J/Q/K) to the main deck.' },
  { key: 'ace_of_hell', name: 'Ace of Hell', price: 10, type: 'joker', desc: '+5 seconds whenever an Ace is played.' },
  // --- Rules ---
  { key: 'infinity_loop', name: 'Infinity Loop', price: 12, type: 'joker', desc: 'King-to-Ace and Ace-to-King wraps now count as valid moves.' },
  { key: 'quick_hands', name: 'Quick Hands', price: 10, type: 'joker', desc: 'Side-pile draw delay is reduced by 30%.' },
  { key: 'steady_hand', name: 'Steady Hand', price: 14, type: 'joker', desc: 'Maximum hand size is increased by 1.' },
  { key: 'light_load', name: 'Light Load', price: 11, type: 'joker', desc: 'You are dealt 3 fewer cards at the start of every ante.' },
  { key: 'deep_reserves', name: 'Deep Reserves', price: 8, type: 'joker', desc: '+2 seconds whenever the reserves are flipped.' },
  { key: 'time_dilation', name: 'Time Dilation', price: 13, type: 'joker', desc: 'Every ante timer starts with +15 seconds.' },
  { key: 'second_wind', name: 'Second Wind', price: 18, type: 'joker', desc: 'Consumed once: the first time the timer would hit zero, grants +10 seconds instead.' },
  { key: 'chain_reaction', name: 'Chain Reaction', price: 9, type: 'joker', desc: 'Playing 3 cards within 2 seconds grants +3 seconds.' },
  { key: 'golden_streak', name: 'Golden Streak', price: 8, type: 'joker', desc: 'Every 5th card you play grants +2 chips.' },
  // --- Economy ---
  { key: 'devils_bargain', name: "Devil's Bargain", price: 5, type: 'joker', desc: 'Ante rewards are reduced by 2 chips, but shop prices drop by 20%.' },
  { key: 'soul_trade', name: 'Soul Trade', price: 9, type: 'joker', desc: 'Boss ante chip rewards are doubled.' },
  { key: 'interest', name: 'Hellish Interest', price: 8, type: 'joker', desc: 'At the end of each ante, gain +1 chip per 10 chips held (max +5).' },
  // --- Enhancement synergies ---
  { key: 'midas_touch', name: 'Midas Touch', price: 10, type: 'joker', desc: 'Gold Cards give +8 chips instead of +5.' },
  { key: 'prism', name: 'Prism', price: 10, type: 'joker', desc: 'Diamond Cards give +5 seconds instead of +3.' },
  { key: 'tempered_glass', name: 'Tempered Glass', price: 9, type: 'joker', desc: 'Glass Cards only have a 10% chance to shatter instead of 25%.' },
  // --- Consumables (card enhancements) ---
  { key: 'alchemy', name: 'Alchemy', price: 12, type: 'consumable', desc: 'Turns 1 random card in the main deck into a Gold Card. Gold Cards give +5 bonus chips when played.' },
  { key: 'diamond_touch', name: 'Diamond Touch', price: 12, type: 'consumable', desc: 'Turns 1 random card into a Diamond Card. Diamond Cards give +3 bonus seconds when played.' },
  { key: 'glass_gamble', name: 'Glass Gamble', price: 8, type: 'consumable', desc: 'Turns 1 random card into a Glass Card. Glass Cards give +10 chips when played, but have a 25% chance to shatter and be permanently removed from the deck.' },
];

const ENHANCEMENT_MAP = { alchemy: 'gold', diamond_touch: 'diamond', glass_gamble: 'glass' };

// === BOSS MODIFIERS ===
const bossModifiers = [
  { key: 'no_red', name: 'Crimson Ban', desc: 'Red cards (hearts/diamonds) can only be played onto red cards this ante.' },
  { key: 'no_black', name: 'Onyx Ban', desc: 'Black cards (spades/clubs) can only be played onto black cards this ante.' },
  { key: 'no_face', name: 'Silent Devil', desc: 'You can hold at most 1 face card (J/Q/K) in your hand at a time. Your hand will not refill past a second one.' },
  { key: 'short_fuse', name: 'Time Thief', desc: 'The timer is 35% shorter than normal this ante.' },
  { key: 'reverse_rule', name: 'Mirror Hell', desc: 'The ±2 rule applies instead of ±1 this ante.' },
  { key: 'slow_draw', name: 'Hoarding Devil', desc: 'Drawing a new card from the side piles has a 1.5 second delay.' },
  { key: 'locked_number', name: 'Sealed Rank', desc: 'A randomly chosen rank cannot be played this ante.' },
  { key: 'hand_of_four', name: 'Hand of Four', desc: 'Maximum hand size is 4 instead of 5 this ante.' },
  { key: 'no_joker_effects', name: 'Silenced Power', desc: 'Half of your owned jokers (randomly chosen) are disabled this ante.' },
  { key: 'frozen_reserve', name: 'Frozen Reserve', desc: 'You cannot flip the reserves manually. Stuck? Wait 3 seconds for the automatic flip.' },
  { key: 'heavy_hand', name: 'Heavy Hand', desc: 'You are dealt 5 extra cards this ante.' },
  { key: 'greedy_devil', name: 'Greedy Devil', desc: "This ante's chip reward is halved." },
];
const BOSS_CONFLICTS = [['no_red', 'no_black']];

// === PERSISTENT STATE (survives between antes, saved to localStorage) ===
let userChips = 0;
let ownedMarketItems = [];   // array of item keys
let enhancedCards = [];      // { suit, rank, enhancement }
let removedCards = [];       // { suit, rank } — shattered glass cards
let currentAnte = 1;
let runActive = false;

// === ANTE STATE (per ante) ===
let playerHand = [], playerStock = [];
let centerPiles = [[], []];
let sidePiles = [[], []];
let preparedPool = [];
let timeRemaining = 0, anteTimeLimit = 0;
let anteRunning = false;
let activeBossModifiers = [];
let sealedRank = null;
let disabledJokers = [];
let secondWindUsed = false;
let anteChipsEarned = 0, anteTimeGained = 0, cardsPlayedThisAnte = 0;
let recentPlayTimes = [];
let playerInitialCards = 0;
let selectedPile = null;
let lastTick = 0;
let cardIdCounter = 0;
let timers = { loop: null, refill: null, flip: null, toast: null };

// === SHOP STATE ===
let nextMarketItems = [];
let soldThisVisit = [];

// =====================================================================
// === HELPERS ===
// =====================================================================
const $ = (id) => document.getElementById(id);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeCard(suit, rank, enhancement = null) {
  return { id: ++cardIdCounter, suit, rank, enhancement };
}
const isRed = (c) => c.suit === 'hearts' || c.suit === 'diamonds';
const isFace = (c) => c.rank >= 11;
const isLow = (c) => c.rank >= 2 && c.rank <= 5;
const rankLabel = (r) => RANK_LABEL[r] || String(r);
const cardName = (c) => `${rankLabel(c.rank)}${SUIT_SYMBOL[c.suit]}`;

const isBossAnte = (n) => n % 3 === 0 || n === TOTAL_ANTES;
const isFinalAnte = (n) => n === TOTAL_ANTES;
const hasBoss = (key) => activeBossModifiers.some((m) => m.key === key);
const itemByKey = (key) => ALL_MARKET_ITEMS.find((i) => i.key === key);

// Jokers that are currently active (owned minus silenced ones)
function activeJokerSet() {
  return new Set(ownedMarketItems.filter((k) => !disabledJokers.includes(k)));
}
function hasJoker(key) { return activeJokerSet().has(key); }

// Central place where owned upgrades + boss modifiers turn into gameplay numbers
function getMods() {
  const j = activeJokerSet();
  const has = (k) => j.has(k);
  const m = {
    handSize: BASE_HAND_SIZE + (has('steady_hand') ? 1 : 0),
    refillDelay: hasBoss('slow_draw') ? 1500 : BASE_REFILL_DELAY,
    flipDelay: hasBoss('frozen_reserve') ? 3000 : BASE_FLIP_DELAY,
    manualFlip: !hasBoss('frozen_reserve'),
    wrap: has('infinity_loop'),
    rankStep: hasBoss('reverse_rule') ? 2 : 1,
    redAbundance: has('crimson_abundance'),
    blackAbundance: has('onyx_abundance'),
    sevenfold: has('sevenfold'),
    gutterDeck: has('gutter_deck'),
    royalCourt: has('royal_court'),
    startCardsDelta: (has('light_load') ? -3 : 0) + (hasBoss('heavy_hand') ? 5 : 0),
    timeBonus: has('time_dilation') ? 15 : 0,
    priceMult: ownedMarketItems.includes('devils_bargain') ? 0.8 : 1,
  };
  if (has('quick_hands')) m.refillDelay = Math.round(m.refillDelay * 0.7);
  if (hasBoss('hand_of_four')) m.handSize = 4;
  return m;
}

function itemPrice(item) {
  return Math.max(1, Math.round(item.price * getMods().priceMult));
}

// =====================================================================
// === PERSISTENCE ===
// =====================================================================
function saveProgress() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      userChips, ownedMarketItems, enhancedCards, removedCards, currentAnte, runActive,
    }));
  } catch (e) { /* storage unavailable — play without saving */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    userChips = d.userChips || 0;
    ownedMarketItems = d.ownedMarketItems || [];
    enhancedCards = d.enhancedCards || [];
    removedCards = d.removedCards || [];
    currentAnte = d.currentAnte || 1;
    runActive = !!d.runActive;
    return runActive;
  } catch (e) { return false; }
}

function resetGameProgress() {
  userChips = 0;
  ownedMarketItems = [];
  enhancedCards = [];
  removedCards = [];
  currentAnte = 1;
  runActive = false;
  saveProgress();
  renderChips();
}

// =====================================================================
// === DECK BUILDING ===
// =====================================================================
function buildPool() {
  const pool = [];
  for (const suit of SUITS) for (let r = 1; r <= 13; r++) pool.push(makeCard(suit, r));
  const mods = getMods();
  const extras = [];
  const copies = (list, n) => shuffle(list.slice()).slice(0, n).map((c) => makeCard(c.suit, c.rank));

  if (mods.redAbundance) extras.push(...copies(pool.filter(isRed), 13));       // 26 → 39
  if (mods.blackAbundance) extras.push(...copies(pool.filter((c) => !isRed(c)), 13));
  if (mods.sevenfold) for (const suit of SUITS) extras.push(makeCard(suit, 7));
  if (mods.gutterDeck) extras.push(...copies(pool.filter(isLow), 8));
  if (mods.royalCourt) extras.push(...copies(pool.filter(isFace), 6));
  pool.push(...extras);

  // Shattered glass cards are gone for good
  for (const rc of removedCards) {
    const idx = pool.findIndex((c) => c.suit === rc.suit && c.rank === rc.rank && !c.enhancement);
    if (idx >= 0) pool.splice(idx, 1);
  }
  // Permanent enhancements travel with the deck
  for (const ec of enhancedCards) {
    const c = pool.find((x) => x.suit === ec.suit && x.rank === ec.rank && !x.enhancement);
    if (c) c.enhancement = ec.enhancement;
  }
  return pool;
}

// Groups the pool into { suit, rank, enhancement, count } entries for the deck preview
function getDeckComposition(pool) {
  const map = new Map();
  for (const c of pool) {
    const key = `${c.suit}|${c.rank}|${c.enhancement || ''}`;
    if (!map.has(key)) map.set(key, { suit: c.suit, rank: c.rank, enhancement: c.enhancement, count: 0 });
    map.get(key).count++;
  }
  return [...map.values()].sort((a, b) => {
    const s = SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    if (s !== 0) return s;
    if (a.rank !== b.rank) return a.rank - b.rank;
    return (a.enhancement ? 1 : 0) - (b.enhancement ? 1 : 0);
  });
}

function applyEnhancement(enhancement) {
  const pool = buildPool();
  const candidates = pool.filter((c) => !c.enhancement);
  if (candidates.length === 0) return null;
  const pick = candidates[randInt(0, candidates.length - 1)];
  enhancedCards.push({ suit: pick.suit, rank: pick.rank, enhancement });
  return pick;
}

// =====================================================================
// === ANTE FLOW ===
// =====================================================================
function pickBossModifiers(count) {
  const chosen = [];
  const available = bossModifiers.filter((m) => !(m.key === 'no_joker_effects' && ownedMarketItems.length < 2));
  shuffle(available);
  for (const m of available) {
    if (chosen.length >= count) break;
    const conflict = BOSS_CONFLICTS.some((pair) => pair.includes(m.key) && chosen.some((c) => pair.includes(c.key)));
    if (!conflict) chosen.push(m);
  }
  return chosen;
}

function prepareAnte() {
  stopLoop();
  const boss = isBossAnte(currentAnte);
  activeBossModifiers = boss ? pickBossModifiers(isFinalAnte(currentAnte) ? 2 : randInt(1, 2)) : [];
  sealedRank = hasBoss('locked_number') ? randInt(1, 13) : null;
  disabledJokers = [];
  if (hasBoss('no_joker_effects')) {
    disabledJokers = shuffle(ownedMarketItems.slice()).slice(0, Math.floor(ownedMarketItems.length / 2));
  }

  let limit = anteTimeLimits[currentAnte - 1] + getMods().timeBonus;
  if (boss) limit *= BOSS_TIME_FACTOR;
  if (hasBoss('short_fuse')) limit *= 0.65;
  anteTimeLimit = Math.round(limit);
  timeRemaining = anteTimeLimit;

  preparedPool = buildPool();
  playerHand = []; playerStock = []; centerPiles = [[], []]; sidePiles = [[], []];
  runActive = true;
  saveProgress();

  showScreen('game');
  renderAll();
  if (boss) showBossModal(); else showDeckModal();
}

function showBossModal() {
  const final = isFinalAnte(currentAnte);
  $('boss-title').textContent = final ? 'The Devil Himself' : `Boss Ante ${currentAnte}`;
  $('boss-mod-list').innerHTML = activeBossModifiers.map((m) => {
    let desc = m.desc;
    if (m.key === 'locked_number') desc = `All ${rankLabel(sealedRank)}s cannot be played this ante.`;
    if (m.key === 'no_joker_effects' && disabledJokers.length) {
      desc += ` Silenced: ${disabledJokers.map((k) => itemByKey(k).name).join(', ')}.`;
    }
    return `<div class="mod-item"><b>${m.name}</b>${desc}</div>`;
  }).join('');
  $('modal-boss').hidden = false;
}

function showDeckModal() {
  $('deck-ante').textContent = currentAnte;
  const comp = getDeckComposition(preparedPool);
  const total = preparedPool.length;
  const red = preparedPool.filter(isRed).length;
  const enh = preparedPool.filter((c) => c.enhancement);
  $('deck-summary').innerHTML = `
    <span>Total<b>${total}</b></span>
    <span>Red<b>${red}</b></span>
    <span>Black<b>${total - red}</b></span>
    <span>Enhanced<b>${enh.length}</b></span>
    <span>Time limit<b>${anteTimeLimit}s</b></span>
    <span>Dealt to you<b>${dealCount()}</b></span>`;
  $('deck-grid').innerHTML = comp.map((e) => {
    const card = { suit: e.suit, rank: e.rank, enhancement: e.enhancement };
    const boosted = !e.enhancement && e.count > 1;
    return `<div class="deck-entry">
      ${cardHTML(card, { small: true })}
      <span class="qty ${boosted ? 'boosted' : ''}">x ${e.count}</span>
      ${e.enhancement ? `<span class="enh-name ${e.enhancement}">${capitalize(e.enhancement)}</span>` : ''}
    </div>`;
  }).join('');
  $('deck-enhanced').innerHTML = enh.length
    ? 'Enhanced cards: ' + enh.map((c) => `<span class="${c.enhancement}">${cardName(c)} (${capitalize(c.enhancement)})</span>`).join('')
    : 'No enhanced cards yet. Visit the Soul Trader for Alchemy, Diamond Touch or Glass Gamble.';
  $('modal-deck').hidden = false;
}

function dealCount() {
  const base = anteCardCounts[currentAnte - 1] + getMods().startCardsDelta;
  return clamp(base, 10, preparedPool.length - 6);
}

function startAnte() {
  $('modal-deck').hidden = true;
  const pool = shuffle(preparedPool.slice());
  const count = dealCount();

  playerHand = [];
  playerStock = pool.splice(0, count);
  centerPiles = [[pool.pop()], [pool.pop()]];
  const half = Math.ceil(pool.length / 2);
  sidePiles = [pool.slice(0, half), pool.slice(half)];
  playerInitialCards = count;

  timeRemaining = anteTimeLimit;
  secondWindUsed = false;
  anteChipsEarned = 0; anteTimeGained = 0; cardsPlayedThisAnte = 0;
  recentPlayTimes = [];
  selectedPile = null;

  refillHandNow();
  anteRunning = true;
  renderAll();
  showToast(isBossAnte(currentAnte) ? 'The Devil is watching. Go!' : `Ante ${currentAnte} — Go!`, 1200);
  lastTick = performance.now();
  timers.loop = setInterval(gameLoop, 100);
}

function stopLoop() {
  anteRunning = false;
  for (const k of ['loop', 'refill', 'flip']) {
    if (timers[k]) { clearInterval(timers[k]); clearTimeout(timers[k]); timers[k] = null; }
  }
  $('btn-flip').hidden = true;
}

function gameLoop() {
  const now = performance.now();
  const dt = Math.min((now - lastTick) / 1000, 0.25);
  lastTick = now;
  timeRemaining -= dt;

  if (timeRemaining <= 0) {
    if (hasJoker('second_wind') && !secondWindUsed) {
      secondWindUsed = true;
      ownedMarketItems = ownedMarketItems.filter((k) => k !== 'second_wind');
      timeRemaining = 10;
      floatText('Second Wind! +10s', 'time');
      renderJokers();
      saveProgress();
    } else {
      timeRemaining = 0;
      renderTimer();
      anteLost();
      return;
    }
  }
  checkStuck();
  renderTimer();
}

// =====================================================================
// === RULES ===
// =====================================================================
function rankDiffValid(a, b) {
  const mods = getMods();
  const d = Math.abs(a - b);
  if (d === mods.rankStep) return true;
  if (mods.wrap && d === 13 - mods.rankStep) return true;
  return false;
}

function topOf(pileIdx) {
  const p = centerPiles[pileIdx];
  return p.length ? p[p.length - 1] : null;
}

function canPlay(card, pileIdx) {
  const top = topOf(pileIdx);
  if (!top) return true;
  if (!rankDiffValid(card.rank, top.rank)) return false;
  if (hasBoss('no_red') && isRed(card) && !isRed(top)) return false;
  if (hasBoss('no_black') && !isRed(card) && isRed(top)) return false;
  if (sealedRank !== null && card.rank === sealedRank) return false;
  return true;
}

const playerHasMove = () => playerHand.some((c) => [0, 1].some((p) => canPlay(c, p)));

// =====================================================================
// === PLAYER ACTIONS ===
// =====================================================================
function playerPlayCard(cardId, pileIdx = null) {
  if (!anteRunning) return;
  const idx = playerHand.findIndex((c) => c.id === cardId);
  if (idx < 0) return;
  const card = playerHand[idx];

  let target = pileIdx !== null ? pileIdx : selectedPile;
  if (target === null) target = [0, 1].find((p) => canPlay(card, p));
  if (target === undefined || target === null || !canPlay(card, target)) {
    const el = document.querySelector(`#player-hand .card[data-id="${cardId}"]`);
    if (el) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 300); }
    return;
  }

  playerHand.splice(idx, 1);
  centerPiles[target].push(card);
  selectedPile = null;
  onPlayerCardPlayed(card);
  scheduleRefill();
  renderAll();
  checkWin();
}

function scheduleRefill() {
  if (timers.refill) return;
  const delay = getMods().refillDelay;
  timers.refill = setTimeout(() => {
    timers.refill = null;
    refillHandNow();
    renderAll();
    checkWin();
  }, delay);
}

function refillHandNow() {
  const m = getMods();
  while (playerHand.length < m.handSize && playerStock.length > 0) {
    const next = playerStock[0];
    if (hasBoss('no_face') && isFace(next) && playerHand.some(isFace)) break;
    playerHand.push(playerStock.shift());
  }
}

// Central trigger: every owned joker / enhancement that reacts to a played card lives here
function onPlayerCardPlayed(card) {
  const has = hasJoker;
  let chips = 0, secs = 0;
  const notes = [];

  if (isRed(card)) {
    if (has('crimson_deal')) chips += 1;
    if (has('crimson_haste')) secs += 2;
  } else {
    if (has('onyx_deal')) chips += 1;
    if (has('onyx_haste')) secs += 2;
  }
  if (isFace(card) && has('bounty_of_faces')) chips += 3;
  if (card.rank === 1 && has('ace_of_hell')) secs += 5;
  if (card.rank === 7) {
    if (has('lucky_seven')) chips += 2;
    if (has('seven_seconds')) secs += 7;
  }
  if (isLow(card) && has('low_road')) secs += 1;

  cardsPlayedThisAnte++;
  if (has('golden_streak') && cardsPlayedThisAnte % 5 === 0) chips += 2;

  if (has('chain_reaction')) {
    const now = performance.now();
    recentPlayTimes.push(now);
    recentPlayTimes = recentPlayTimes.filter((t) => now - t <= 2000);
    if (recentPlayTimes.length >= 3) { secs += 3; recentPlayTimes = []; notes.push('Chain Reaction!'); }
  }

  if (card.enhancement === 'gold') chips += has('midas_touch') ? 8 : 5;
  if (card.enhancement === 'diamond') secs += has('prism') ? 5 : 3;
  if (card.enhancement === 'glass') {
    chips += 10;
    const shatterChance = has('tempered_glass') ? 0.10 : 0.25;
    if (Math.random() < shatterChance) {
      removedCards.push({ suit: card.suit, rank: card.rank });
      const i = enhancedCards.findIndex((e) => e.suit === card.suit && e.rank === card.rank && e.enhancement === 'glass');
      if (i >= 0) enhancedCards.splice(i, 1);
      notes.push(`${cardName(card)} shattered!`);
      floatText('Shattered!', 'bad');
      saveProgress();
    }
  }

  grantBonus(chips, secs);
  if (notes.length) showToast(notes.join(' '), 1200);
}

function grantBonus(chips, secs) {
  if (chips > 0) {
    userChips += chips; anteChipsEarned += chips;
    floatText(`+${chips} chips`, 'chips');
  }
  if (secs > 0) {
    timeRemaining += secs; anteTimeGained += secs;
    floatText(`+${secs}s`, 'time', 60);
  }
}

function checkWin() {
  if (!anteRunning) return;
  if (playerHand.length === 0 && playerStock.length === 0) anteWon();
}

// =====================================================================
// === STUCK / FLIPPING RESERVES ===
// =====================================================================
function checkStuck() {
  const stuck = anteRunning && !playerHasMove() && !timers.refill && playerHand.length > 0;
  if (stuck) {
    if (!timers.flip) timers.flip = setTimeout(flipReserves, getMods().flipDelay);
    $('btn-flip').hidden = !getMods().manualFlip;
  } else {
    if (timers.flip) { clearTimeout(timers.flip); timers.flip = null; }
    $('btn-flip').hidden = true;
  }
}

function flipReserves() {
  if (timers.flip) { clearTimeout(timers.flip); timers.flip = null; }
  $('btn-flip').hidden = true;
  if (!anteRunning || playerHasMove()) return;

  // Reserves empty? Recycle everything under the top cards back into the reserves.
  if (sidePiles[0].length + sidePiles[1].length === 0) {
    const recycled = [];
    for (const p of [0, 1]) recycled.push(...centerPiles[p].splice(0, Math.max(0, centerPiles[p].length - 1)));
    shuffle(recycled);
    const half = Math.ceil(recycled.length / 2);
    sidePiles = [recycled.slice(0, half), recycled.slice(half)];
  }
  // Last resort: nothing left anywhere but your own cards — push from stock/hand.
  const a = sidePiles[0].shift() || sidePiles[1].shift() || playerStock.shift() || playerHand.splice(randInt(0, playerHand.length - 1), 1)[0];
  const b = sidePiles[1].shift() || sidePiles[0].shift() || playerStock.shift() || playerHand.splice(randInt(0, playerHand.length - 1), 1)[0];
  if (a) centerPiles[0].push(a);
  if (b) centerPiles[1].push(b);

  if (hasJoker('deep_reserves')) grantBonus(0, 2);
  scheduleRefill();
  renderAll();
  checkWin();
}

// =====================================================================
// === ANTE RESULTS ===
// =====================================================================
function calcAnteReward(timeRemainingSeconds, limit) {
  const boss = isBossAnte(currentAnte);
  const base = 15;
  const speedBonus = Math.floor(clamp(timeRemainingSeconds / limit, 0, 1) * 20);
  const bossBonus = boss ? 10 : 0;
  let total = base + speedBonus + bossBonus;
  const bargain = hasJoker('devils_bargain') ? -2 : 0;
  total += bargain;
  const soulTrade = boss && hasJoker('soul_trade');
  if (soulTrade) total *= 2;
  const greedy = hasBoss('greedy_devil');
  if (greedy) total = Math.floor(total / 2);
  const interest = hasJoker('interest') ? Math.min(5, Math.floor(userChips / 10)) : 0;
  total += interest;
  return { base, speedBonus, bossBonus, bargain, soulTrade, greedy, interest, total: Math.max(0, total) };
}

function anteWon() {
  stopLoop();
  const r = calcAnteReward(timeRemaining, anteTimeLimit);
  userChips += r.total;
  const clearedAnte = currentAnte;
  const wasFinal = isFinalAnte(currentAnte);
  disabledJokers = [];
  activeBossModifiers = [];
  sealedRank = null;

  if (wasFinal) {
    runActive = false;
    saveProgress();
    $('victory-summary').innerHTML = summaryRows([
      ['Final ante reward', `+${r.total} chips`],
      ['Chips earned during ante', `+${anteChipsEarned}`],
      ['Time gained from jokers', `+${anteTimeGained}s`],
      ['Final chip total', `${userChips}`],
      ['Jokers collected', String(ownedMarketItems.length)],
    ]);
    $('modal-victory').hidden = false;
    return;
  }

  currentAnte++;
  saveProgress();
  renderChips();
  const rows = [
    ['Ante', String(clearedAnte)],
    ['Time remaining', `${Math.ceil(timeRemaining)}s / ${anteTimeLimit}s`],
    ['Base reward', `+${r.base}`],
    ['Speed bonus', `+${r.speedBonus}`],
  ];
  if (r.bossBonus) rows.push(['Boss bonus', `+${r.bossBonus}`]);
  if (r.bargain) rows.push(["Devil's Bargain", `${r.bargain}`]);
  if (r.soulTrade) rows.push(['Soul Trade', 'x2']);
  if (r.greedy) rows.push(['Greedy Devil', '÷2']);
  if (r.interest) rows.push(['Hellish Interest', `+${r.interest}`]);
  rows.push(['Chips from jokers this ante', `+${anteChipsEarned}`]);
  rows.push(['Seconds gained this ante', `+${anteTimeGained}s`]);
  rows.push(['Ante reward', `+${r.total} chips`, 'total']);
  $('ante-won-summary').innerHTML = summaryRows(rows);
  $('modal-ante-won').hidden = false;
}

function anteLost() {
  stopLoop();
  const left = playerHand.length + playerStock.length;
  $('game-over-summary').innerHTML = summaryRows([
    ['Reached', `Ante ${currentAnte}${isBossAnte(currentAnte) ? ' (Boss)' : ''}`],
    ['Cards left', String(left)],
    ['Chips lost', `${userChips}`],
    ['Jokers lost', String(ownedMarketItems.length)],
  ]);
  resetGameProgress();
  $('modal-game-over').hidden = false;
}

function summaryRows(rows) {
  return rows.map(([k, v, cls]) => `<div class="row ${cls || ''}"><span>${k}</span><span>${v}</span></div>`).join('');
}

// =====================================================================
// === SHOP (The Soul Trader) ===
// =====================================================================
function getRandomMarketItems() {
  const available = ALL_MARKET_ITEMS.filter((item) => !ownedMarketItems.includes(item.key));
  return shuffle(available.slice()).slice(0, SHOP_SIZE).map((item) => item.key);
}

function openMarket() {
  nextMarketItems = getRandomMarketItems();
  soldThisVisit = [];
  renderMarket();
  $('modal-shop').hidden = false;
}

function buyMarketItem(key) {
  const item = itemByKey(key);
  if (!item) return;
  const price = itemPrice(item);
  if (userChips < price) { showToast('Not enough chips.', 1200); return; }
  userChips -= price;
  if (item.type === 'consumable') {
    const picked = applyEnhancement(ENHANCEMENT_MAP[key]);
    showToast(picked ? `${cardName(picked)} became a ${capitalize(ENHANCEMENT_MAP[key])} Card.` : 'No card could be enhanced.', 1800);
    soldThisVisit.push(key);
  } else {
    ownedMarketItems.push(key);
  }
  saveProgress();
  renderMarket();
}

function sellMarketItem(key) {
  const item = itemByKey(key);
  if (!item || !ownedMarketItems.includes(key)) return;
  userChips += Math.floor(item.price / 2);
  ownedMarketItems = ownedMarketItems.filter((k) => k !== key);
  saveProgress();
  renderMarket();
}

function rerollMarket() {
  if (userChips < REROLL_COST) { showToast('Not enough chips to reroll.', 1200); return; }
  userChips -= REROLL_COST;
  nextMarketItems = getRandomMarketItems();
  soldThisVisit = [];
  saveProgress();
  renderMarket();
}

function renderMarket() {
  renderChips();
  $('shop-chips').textContent = `${userChips} chips`;
  $('btn-reroll').disabled = userChips < REROLL_COST;

  $('shop-items').innerHTML = nextMarketItems.map((key) => {
    const item = itemByKey(key);
    const owned = ownedMarketItems.includes(key);
    const sold = owned || soldThisVisit.includes(key);
    const price = itemPrice(item);
    const priceHtml = price !== item.price ? `<s>${item.price}</s>${price} chips` : `${price} chips`;
    return `<div class="shop-item ${sold ? 'sold' : ''}">
      <span class="type">${item.type === 'consumable' ? 'Card Enhancement' : 'Joker'}</span>
      <span class="name">${item.name}</span>
      <span class="desc">${item.desc}</span>
      <span class="price">${priceHtml}</span>
      <button class="btn btn-secondary buy-btn" data-key="${key}" ${sold || userChips < price ? 'disabled' : ''}>${sold ? 'Sold' : 'Buy'}</button>
    </div>`;
  }).join('');

  $('shop-owned').innerHTML = ownedMarketItems.length
    ? ownedMarketItems.map((key) => {
        const item = itemByKey(key);
        return `<div class="owned-row">
          <div><span class="name">${item.name}</span> <span class="desc">— ${item.desc}</span></div>
          <button class="btn btn-ghost btn-sm sell-btn" data-key="${key}">Sell · +${Math.floor(item.price / 2)}</button>
        </div>`;
      }).join('')
    : '<div class="empty-note">You own no jokers yet.</div>';

  document.querySelectorAll('.buy-btn').forEach((b) => (b.onclick = () => buyMarketItem(b.dataset.key)));
  document.querySelectorAll('.sell-btn').forEach((b) => (b.onclick = () => sellMarketItem(b.dataset.key)));
}

// =====================================================================
// === RENDERING ===
// =====================================================================
function cardHTML(card, opts = {}) {
  const cls = ['card', isRed(card) ? 'red' : 'black'];
  if (card.enhancement) cls.push(`enh-${card.enhancement}`);
  if (opts.playable) cls.push('playable');
  if (opts.dim) cls.push('dim');
  if (opts.small) cls.push('small');
  const sym = SUIT_SYMBOL[card.suit];
  const r = rankLabel(card.rank);
  return `<div class="${cls.join(' ')}" data-id="${card.id || ''}" title="${cardName(card)}${card.enhancement ? ' (' + capitalize(card.enhancement) + ')' : ''}">
    <span class="corner tl">${r}<br>${sym}</span>
    <span class="pip">${sym}</span>
    <span class="corner br">${r}<br>${sym}</span>
    ${opts.keyHint ? `<span class="key-hint">${opts.keyHint}</span>` : ''}
    ${card.enhancement ? `<span class="enh-tag">${card.enhancement}</span>` : ''}
  </div>`;
}
const cardBackHTML = () => '<div class="card-back"></div>';

function renderAll() {
  renderHud();
  renderHand();
  renderPiles();
  renderCounts();
}

function renderHud() {
  $('hud-ante').textContent = currentAnte;
  $('hud-boss-badge').hidden = !isBossAnte(currentAnte);
  $('hud-boss-badge').textContent = isFinalAnte(currentAnte) ? 'Final Boss' : 'Boss';
  renderChips();
  renderTimer();
  renderModifiers();
  renderJokers();
}

function renderChips() {
  $('hud-chips').textContent = `${userChips} chips`;
}

function renderTimer() {
  const t = Math.max(0, timeRemaining);
  const el = $('hud-timer');
  el.textContent = Math.ceil(t);
  el.classList.toggle('low', anteRunning && t <= 15);
  $('hud-timer-fill').style.width = `${anteTimeLimit ? clamp((t / anteTimeLimit) * 100, 0, 100) : 100}%`;
}

function renderModifiers() {
  $('hud-modifiers').innerHTML = activeBossModifiers.map((m) => {
    let label = m.name;
    if (m.key === 'locked_number' && sealedRank !== null) label += ` (${rankLabel(sealedRank)})`;
    return `<span class="tag mod" title="${m.desc}">${label}</span>`;
  }).join('');
}

function renderJokers() {
  $('hud-jokers').innerHTML = ownedMarketItems.map((k) => {
    const item = itemByKey(k);
    const off = disabledJokers.includes(k);
    return `<span class="tag joker ${off ? 'disabled' : ''}" title="${item.desc}${off ? ' (Silenced this ante)' : ''}">${item.name}</span>`;
  }).join('');
}

function renderHand() {
  const m = getMods();
  const slots = [];
  playerHand.forEach((c, i) => {
    const playable = anteRunning && (selectedPile !== null ? canPlay(c, selectedPile) : [0, 1].some((p) => canPlay(c, p)));
    slots.push(cardHTML(c, { playable, dim: anteRunning && !playable, keyHint: i + 1 }));
  });
  for (let i = playerHand.length; i < m.handSize; i++) slots.push('<div class="empty-slot"></div>');
  $('player-hand').innerHTML = slots.join('');
  document.querySelectorAll('#player-hand .card').forEach((el) => {
    el.onclick = () => playerPlayCard(Number(el.dataset.id));
  });
}

function renderPiles() {
  for (const p of [0, 1]) {
    const el = $(`center-pile-${p}`);
    const top = topOf(p);
    el.innerHTML = (top ? cardHTML(top) : '') + `<span class="pile-count">${centerPiles[p].length}</span>`;
    el.classList.toggle('selected', selectedPile === p);
    el.classList.toggle('targetable', anteRunning && selectedPile === null && playerHand.some((c) => canPlay(c, p)));
    $(`side-pile-${p}`).innerHTML = sidePiles[p].length ? cardBackHTML() + `<span class="pile-count">${sidePiles[p].length}</span>` : '';
  }
  $('player-stock').innerHTML = playerStock.length ? cardBackHTML() : '';
  $('player-stock-count').textContent = playerStock.length;
}

function renderCounts() {
  const left = playerHand.length + playerStock.length;
  $('player-count').textContent = left;
  $('player-progress').style.width = `${playerInitialCards ? (left / playerInitialCards) * 100 : 0}%`;
}

function floatText(text, cls, offsetX = 0) {
  const el = document.createElement('div');
  el.className = `float-text ${cls}`;
  el.textContent = text;
  el.style.marginLeft = `${offsetX + randInt(-30, 30)}px`;
  $('float-layer').appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

function showToast(msg, ms = 1500) {
  const el = $('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(timers.toast);
  timers.toast = setTimeout(() => (el.hidden = true), ms);
}

function showScreen(name) {
  $('screen-menu').hidden = name !== 'menu';
  $('screen-game').hidden = name !== 'game';
}

function hideAllModals() {
  document.querySelectorAll('.modal').forEach((m) => (m.hidden = true));
}

// =====================================================================
// === MENU & WIRING ===
// =====================================================================
function renderMenu() {
  const hasRun = loadProgress();
  $('btn-continue').hidden = !hasRun;
  $('continue-ante').textContent = currentAnte;
  showScreen('menu');
}

function startNewRun() {
  resetGameProgress();
  hideAllModals();
  prepareAnte();
}

function continueRun() {
  hideAllModals();
  prepareAnte();
}

function returnToMenu() {
  stopLoop();
  hideAllModals();
  renderMenu();
}

function wireEvents() {
  $('btn-start').onclick = startNewRun;
  $('btn-continue').onclick = continueRun;
  $('btn-howto').onclick = () => ($('howto').hidden = !$('howto').hidden);
  $('btn-quit').onclick = () => {
    if (anteRunning && !confirm('Quit to menu? The current ante will restart when you continue.')) return;
    returnToMenu();
  };
  $('btn-boss-continue').onclick = () => { $('modal-boss').hidden = true; showDeckModal(); };
  $('btn-start-ante').onclick = startAnte;
  $('btn-ante-won-continue').onclick = () => { $('modal-ante-won').hidden = true; openMarket(); };
  $('btn-shop-continue').onclick = () => { $('modal-shop').hidden = true; prepareAnte(); };
  $('btn-reroll').onclick = rerollMarket;
  $('btn-game-over-menu').onclick = returnToMenu;
  $('btn-victory-menu').onclick = returnToMenu;
  $('btn-flip').onclick = () => { if (getMods().manualFlip) flipReserves(); };

  // Click a center pile to pick it as the target, then click a card
  document.querySelectorAll('.center-pile').forEach((el) => {
    el.onclick = () => {
      if (!anteRunning) return;
      const p = Number(el.dataset.pile);
      selectedPile = selectedPile === p ? null : p;
      renderHand();
      renderPiles();
    };
  });

  // Keyboard: 1-6 plays the nth card, Space flips reserves when stuck, Escape clears the pile selection
  document.addEventListener('keydown', (e) => {
    if (!anteRunning) return;
    if (e.key === 'Escape') { selectedPile = null; renderHand(); renderPiles(); return; }
    if (e.key === ' ') { e.preventDefault(); if (!$('btn-flip').hidden) flipReserves(); return; }
    const n = Number(e.key);
    if (n >= 1 && n <= 6 && playerHand[n - 1]) playerPlayCard(playerHand[n - 1].id);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  wireEvents();
  renderMenu();
});
