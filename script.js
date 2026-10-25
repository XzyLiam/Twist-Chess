// ============================================================
// 1. PIECE SVGs
// ============================================================
const PIECES = {
  wK: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M12.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#fff"/><path d="M12.5 30c5.5-3 15.5-3 21 0M12.5 33.5c5.5-3 15.5-3 21 0M12.5 37c5.5-3 15.5-3 21 0" fill="none"/></g></svg>`,
  wQ: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g></svg>`,
  wR: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g></svg>`,
  wB: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/></g></svg>`,
  wN: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#fff"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z" fill="#000" stroke="#000"/></g></svg>`,
  wP: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  bK: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M12.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#000"/><path d="M20 8h5" stroke-linejoin="miter"/><path d="M32 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5l.01 2.1-.01-2.1C20 18 9.906 14 6.997 19.85c-2.497 5.65 4.853 9 4.853 9M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff"/></g></svg>`,
  bQ: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000" stroke="none"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/><path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="#fff"/></g></svg>`,
  bR: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" stroke-linecap="butt"/><path d="M14 29.5v-13h17v13H14z" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" stroke-linecap="butt"/><path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="miter"/></g></svg>`,
  bB: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" stroke-linejoin="miter"/></g></svg>`,
  bN: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#000"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z" fill="#fff" stroke="#fff"/><path d="M24.55 10.4l-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34-2.37-4.49-5.79-6.64-9.19-7.16l-.51-.1z" fill="#fff" stroke="none"/></g></svg>`,
  bP: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>`
};

// ============================================================
// 2. SOUND
// ============================================================
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
let soundEnabled = true;
let volumeLevel = 0.7;

function playTone(freq, duration, type = 'sine', gainVal = 0.15) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainVal * volumeLevel;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

const Sound = {
  move()      { playTone(600, 0.08, 'sine', 0.12); },
  capture()   { playTone(300, 0.12, 'sawtooth', 0.1); playTone(450, 0.08, 'sine', 0.08); },
  check()     { playTone(880, 0.15, 'square', 0.06); playTone(1100, 0.1, 'sine', 0.06); },
  gameEnd()   { playTone(523, 0.15, 'sine', 0.1); setTimeout(()=>playTone(659,0.15,'sine',0.1),150); setTimeout(()=>playTone(784,0.3,'sine',0.1),300); },
  click()     { playTone(800, 0.04, 'sine', 0.06); }
};

// ============================================================
// 3. ENGINE STATE
// ============================================================
let board = [];
let selectedSquare = null;
let currentTurn = 'w';
let gameActive = false;
let currentGamemode = 'classic';
let moveHistory = [];
let playerColor = 'w';
let enPassantTarget = null;
let castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
let gameOver = false;
let hiddenQueenSquare = null;
let hiddenQueenRevealed = false;
let whiteTime = 600, blackTime = 600;
let clockInterval = null, clockRunning = false;

const initialBoard = [
  'bR','bN','bB','bQ','bK','bB','bN','bR',
  'bP','bP','bP','bP','bP','bP','bP','bP',
  null,null,null,null,null,null,null,null,
  null,null,null,null,null,null,null,null,
  null,null,null,null,null,null,null,null,
  null,null,null,null,null,null,null,null,
  'wP','wP','wP','wP','wP','wP','wP','wP',
  'wR','wN','wB','wQ','wK','wB','wN','wR'
];

function initBoard(gamemode) {
  board = [...initialBoard];
  if (gamemode === 'roook') {
    for (let i = 0; i < 64; i++) {
      if (board[i] === 'wN' || board[i] === 'wB') board[i] = 'wR';
      if (board[i] === 'bN' || board[i] === 'bB') board[i] = 'bR';
    }
  }
  selectedSquare = null;
  currentTurn = 'w';
  gameActive = true;
  gameOver = false;
  moveHistory = [];
  enPassantTarget = null;
  castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
  hiddenQueenSquare = null;
  hiddenQueenRevealed = false;
  whiteTime = 600; blackTime = 600;
  stopClock();
  renderBoard();
  updateStatus();
  updateClocks();
  updateMoveHistory();
}

// ============================================================
// 4. RENDER
// ============================================================
const boardEl = document.getElementById('chessboard');
const moveHistoryEl = document.getElementById('moveHistory');
const gameStatusEl = document.getElementById('gameStatus');
const playerClockEl = document.getElementById('playerClock');
const opponentClockEl = document.getElementById('opponentClock');

function renderBoard() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const square = document.createElement('div');
    square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
    square.dataset.index = i;
    const piece = board[i];
    if (piece) {
      const pieceDiv = document.createElement('div');
      pieceDiv.className = 'piece';
      pieceDiv.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(PIECES[piece])}")`;
      square.appendChild(pieceDiv);
    }
    if (selectedSquare === i) square.classList.add('selected');
    if (selectedSquare !== null && legalMovesForSquare(selectedSquare).includes(i)) {
      square.classList.add(board[i] && board[i][0] !== currentTurn ? 'capture-highlight' : 'highlight');
    }
    square.addEventListener('click', () => onSquareClick(i));
    boardEl.appendChild(square);
  }
}

function updateStatus() {
  if (gameOver) return;
  const turnName = currentTurn === 'w' ? 'White' : 'Black';
  if (isInCheck(currentTurn)) {
    gameStatusEl.textContent = `${turnName} is in check!`;
    gameStatusEl.style.color = '#f44336';
  } else {
    gameStatusEl.textContent = `${turnName} to move`;
    gameStatusEl.style.color = 'var(--text)';
  }
}

function updateMoveHistory() {
  moveHistoryEl.innerHTML = '';
  for (let i = 0; i < moveHistory.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    moveHistoryEl.innerHTML += `<div>${moveNum}. <span>${moveHistory[i] || ''}</span> <span>${moveHistory[i+1] || ''}</span></div>`;
  }
  moveHistoryEl.scrollTop = moveHistoryEl.scrollHeight;
}

function updateClocks() {
  const fmt = s => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;
  if (playerColor === 'w') {
    playerClockEl.textContent = fmt(whiteTime);
    opponentClockEl.textContent = fmt(blackTime);
  } else {
    playerClockEl.textContent = fmt(blackTime);
    opponentClockEl.textContent = fmt(whiteTime);
  }
  playerClockEl.classList.toggle('active', currentTurn === playerColor && gameActive);
  opponentClockEl.classList.toggle('active', currentTurn !== playerColor && gameActive);
}

// ============================================================
// 5. MOVE GEN
// ============================================================
function findKing(color) {
  for (let i = 0; i < 64; i++) if (board[i] === color + 'K') return i;
  return -1;
}

function isInCheck(color) {
  const kingPos = findKing(color);
  if (kingPos === -1) return false;
  const enemy = color === 'w' ? 'b' : 'w';
  for (let i = 0; i < 64; i++) {
    if (board[i] && board[i][0] === enemy && pseudoLegalMoves(i, board).includes(kingPos)) return true;
  }
  return false;
}

function pseudoLegalMoves(index, b) {
  const piece = b[index];
  if (!piece) return [];
  const color = piece[0], type = piece[1];
  const row = Math.floor(index / 8), col = index % 8;
  const moves = [];
  const addIfValid = (r, c) => {
    if (r < 0 || r > 7 || c < 0 || c > 7) return false;
    const t = r * 8 + c;
    if (!b[t]) { moves.push(t); return true; }
    if (b[t][0] !== color) moves.push(t);
    return false;
  };
  if (type === 'P') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    const f1 = (row + dir) * 8 + col;
    if (row + dir >= 0 && row + dir <= 7 && !b[f1]) {
      moves.push(f1);
      if (row === startRow) {
        const f2 = (row + 2*dir) * 8 + col;
        if (!b[f2]) moves.push(f2);
      }
    }
    for (const dc of [-1, 1]) {
      const nc = col + dc, nr = row + dir;
      if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
        const t = nr * 8 + nc;
        if (b[t] && b[t][0] !== color) moves.push(t);
        if (t === enPassantTarget) moves.push(t);
      }
    }
  } else if (type === 'N') {
    for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) addIfValid(row+dr, col+dc);
  } else if (type === 'B') {
    for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      let r = row+dr, c = col+dc;
      while (r>=0 && r<=7 && c>=0 && c<=7) {
        const t = r*8+c;
        if (!b[t]) moves.push(t);
        else { if (b[t][0] !== color) moves.push(t); break; }
        r+=dr; c+=dc;
      }
    }
  } else if (type === 'R') {
    for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      let r = row+dr, c = col+dc;
      while (r>=0 && r<=7 && c>=0 && c<=7) {
        const t = r*8+c;
        if (!b[t]) moves.push(t);
        else { if (b[t][0] !== color) moves.push(t); break; }
        r+=dr; c+=dc;
      }
    }
  } else if (type === 'Q') {
    for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) {
      let r = row+dr, c = col+dc;
      while (r>=0 && r<=7 && c>=0 && c<=7) {
        const t = r*8+c;
        if (!b[t]) moves.push(t);
        else { if (b[t][0] !== color) moves.push(t); break; }
        r+=dr; c+=dc;
      }
    }
  } else if (type === 'K') {
    for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) addIfValid(row+dr, col+dc);
    if (color === 'w' && index === 60) {
      if (castlingRights.wK && !b[61] && !b[62] && b[63] === 'wR') moves.push(62);
      if (castlingRights.wQ && !b[59] && !b[58] && !b[57] && b[56] === 'wR') moves.push(58);
    }
    if (color === 'b' && index === 4) {
      if (castlingRights.bK && !b[5] && !b[6] && b[7] === 'bR') moves.push(6);
      if (castlingRights.bQ && !b[3] && !b[2] && !b[1] && b[0] === 'bR') moves.push(2);
    }
  }
  return moves;
}

function legalMovesForSquare(index) {
  if (!board[index] || board[index][0] !== currentTurn) return [];
  return pseudoLegalMoves(index, board).filter(target => {
    const savedTarget = board[target];
    const savedSource = board[index];
    board[target] = board[index];
    board[index] = null;
    const inCheck = isInCheck(currentTurn);
    board[index] = savedSource;
    board[target] = savedTarget;
    return !inCheck;
  });
}

// ============================================================
// 6. MOVE EXECUTION
// ============================================================
function onSquareClick(index) {
  if (!gameActive || gameOver) return;
  const piece = board[index];
  if (selectedSquare !== null) {
    const moves = legalMovesForSquare(selectedSquare);
    if (moves.includes(index)) { executeMove(selectedSquare, index); return; }
    if (piece && piece[0] === currentTurn) {
      selectedSquare = index; Sound.click(); renderBoard(); return;
    }
    selectedSquare = null; renderBoard(); return;
  }
  if (piece && piece[0] === currentTurn) {
    selectedSquare = index; Sound.click(); renderBoard();
  }
}

function executeMove(from, to) {
  const piece = board[from];
  const captured = board[to];
  const isCapture = captured !== null || (piece[1] === 'P' && to === enPassantTarget);

  if (piece[1] === 'P' && to === enPassantTarget) {
    const dir = piece[0] === 'w' ? 1 : -1;
    board[to + dir * 8] = null;
  }

  if (piece[1] === 'K' && Math.abs((to % 8) - (from % 8)) === 2) {
    const row = Math.floor(from / 8);
    if (to % 8 === 6) { board[row*8+5] = board[row*8+7]; board[row*8+7] = null; }
    else if (to % 8 === 2) { board[row*8+3] = board[row*8+0]; board[row*8+0] = null; }
  }

  board[to] = piece;
  board[from] = null;

  if (currentGamemode === 'hiddenqueen' && hiddenQueenSquare === from && !hiddenQueenRevealed) {
    hiddenQueenRevealed = true;
    board[to] = piece[0] + 'Q';
    showToast('The Hidden Queen is revealed!');
  }

  if (piece[1] === 'P' && (to < 8 || to >= 56)) board[to] = piece[0] + 'Q';

  if (piece === 'wK') { castlingRights.wK = false; castlingRights.wQ = false; }
  if (piece === 'bK') { castlingRights.bK = false; castlingRights.bQ = false; }
  if (from === 63 || to === 63) castlingRights.wK = false;
  if (from === 56 || to === 56) castlingRights.wQ = false;
  if (from === 7 || to === 7) castlingRights.bK = false;
  if (from === 0 || to === 0) castlingRights.bQ = false;

  enPassantTarget = null;
  if (piece[1] === 'P' && Math.abs(Math.floor(to/8) - Math.floor(from/8)) === 2) {
    enPassantTarget = (from + to) / 2;
  }

  const files = 'abcdefgh';
  moveHistory.push(files[from%8] + (8-Math.floor(from/8)) + files[to%8] + (8-Math.floor(to/8)) + (isCapture ? 'x' : ''));

  isCapture ? Sound.capture() : Sound.move();
  currentTurn = currentTurn === 'w' ? 'b' : 'w';
  selectedSquare = null;

  if (isInCheck(currentTurn)) {
    Sound.check();
    const hasMove = board.some((p, i) => p && p[0] === currentTurn && legalMovesForSquare(i).length > 0);
    if (!hasMove) endGame(currentTurn === 'w' ? 'Black wins by checkmate!' : 'White wins by checkmate!');
    else updateStatus();
  } else {
    const hasMove = board.some((p, i) => p && p[0] === currentTurn && legalMovesForSquare(i).length > 0);
    if (!hasMove) endGame('Draw by stalemate');
  }

  renderBoard(); updateStatus(); updateMoveHistory(); updateClocks(); startClock();
}

function endGame(message) {
  gameActive = false; gameOver = true;
  gameStatusEl.textContent = message;
  gameStatusEl.style.color = '#ffd700';
  Sound.gameEnd();
  stopClock();
  saveRecentGame(message);
}

// ============================================================
// 7. CLOCK
// ============================================================
function startClock() {
  if (clockRunning || !gameActive) return;
  clockRunning = true;
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(() => {
    if (!gameActive || gameOver) return;
    if (currentTurn === 'w') {
      whiteTime = Math.max(0, whiteTime - 0.1);
      if (whiteTime <= 0) endGame('Black wins on time');
    } else {
      blackTime = Math.max(0, blackTime - 0.1);
      if (blackTime <= 0) endGame('White wins on time');
    }
    updateClocks();
  }, 100);
}
function stopClock() {
  clockRunning = false;
  if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
}

// ============================================================
// 8. UI
// ============================================================
document.querySelectorAll('.nav-links li').forEach(li => {
  li.addEventListener('click', () => {
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    li.classList.add('active');
    const screen = li.dataset.screen;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + screen).classList.add('active');
    Sound.click();
    if (screen === 'play' && !gameActive) startGame('classic');
  });
});

document.querySelectorAll('.gamemode-card').forEach(card => {
  card.addEventListener('click', () => {
    Sound.click();
    startGame(card.dataset.mode);
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-links li[data-screen="play"]').classList.add('active');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-play').classList.add('active');
  });
});

function startGame(mode) {
  currentGamemode = mode;
  initBoard(mode);
  playerColor = 'w';
  const username = localStorage.getItem('twistchess_username') || 'Player';
  document.getElementById('playerName').textContent = username;
  document.getElementById('playerAvatar').textContent = username[0].toUpperCase();
  document.getElementById('opponentName').textContent = 'TwistBot';
  document.getElementById('opponentAvatar').textContent = 'T';
  if (mode === 'hiddenqueen') showQueenModal();
  whiteTime = 600; blackTime = 600;
  stopClock(); updateClocks();
  renderBoard(); updateStatus(); updateMoveHistory();
  gameActive = true; gameOver = false;
  startClock();
  if (mode === 'roook') gameStatusEl.textContent = 'ROOOK mode — Rooks only!';
  if (mode === 'bigboard') gameStatusEl.textContent = 'Big Board mode (demo: standard board)';
  if (mode === 'smallboard') gameStatusEl.textContent = 'Small Board mode (demo: standard board)';
  if (mode === 'hiddenqueen') gameStatusEl.textContent = 'Hidden Queen — Choose your secret pawn';
}

document.getElementById('newGameBtn').addEventListener('click', () => { Sound.click(); startGame(currentGamemode); });
document.getElementById('resignBtn').addEventListener('click', () => {
  if (gameActive && !gameOver) {
    Sound.click();
    endGame(currentTurn === 'w' ? 'Black wins by resignation' : 'White wins by resignation');
  }
});

// Hidden queen modal
const queenModal = document.getElementById('queenModal');
const pawnGrid = document.getElementById('pawnGrid');
const confirmQueenBtn = document.getElementById('confirmQueenBtn');
let selectedPawnIndex = null;

function showQueenModal() {
  pawnGrid.innerHTML = '';
  selectedPawnIndex = null;
  confirmQueenBtn.disabled = true;
  for (let i = 48; i < 56; i++) {
    const div = document.createElement('div');
    div.className = 'pawn-choice';
    div.innerHTML = '<i class="fas fa-chess-pawn" style="color: #fff; text-shadow: 0 0 2px #000;"></i>';
    div.dataset.index = i;
    div.addEventListener('click', () => {
      document.querySelectorAll('.pawn-choice').forEach(p => p.classList.remove('selected'));
      div.classList.add('selected');
      selectedPawnIndex = i;
      confirmQueenBtn.disabled = false;
      Sound.click();
    });
    pawnGrid.appendChild(div);
  }
  queenModal.classList.remove('hidden');
}

confirmQueenBtn.addEventListener('click', () => {
  if (selectedPawnIndex !== null) {
    hiddenQueenSquare = selectedPawnIndex;
    hiddenQueenRevealed = false;
    queenModal.classList.add('hidden');
    Sound.click();
    gameStatusEl.textContent = 'Hidden Queen chosen. Opponent cannot see it!';
  }
});

// Settings
document.getElementById('darkModeToggle').addEventListener('click', function() {
  this.classList.toggle('active');
  document.body.classList.toggle('light-theme', !this.classList.contains('active'));
  localStorage.setItem('twistchess_dark', this.classList.contains('active'));
  Sound.click();
});
document.getElementById('soundToggle').addEventListener('click', function() {
  this.classList.toggle('active');
  soundEnabled = this.classList.contains('active');
  localStorage.setItem('twistchess_sound', soundEnabled);
  if (soundEnabled) Sound.click();
});
document.getElementById('legalMovesToggle').addEventListener('click', function() { this.classList.toggle('active'); Sound.click(); });
document.getElementById('autoPromoteToggle').addEventListener('click', function() { this.classList.toggle('active'); Sound.click(); });
document.getElementById('coordsToggle').addEventListener('click', function() { this.classList.toggle('active'); Sound.click(); });
document.getElementById('volumeSlider').addEventListener('input', function() { volumeLevel = this.value / 100; });

document.querySelectorAll('.theme-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    const theme = opt.dataset.theme;
    document.body.classList.remove('theme-wood', 'theme-ice', 'theme-emerald', 'theme-dark');
    if (theme !== 'wood') document.body.classList.add('theme-' + theme);
    localStorage.setItem('twistchess_theme', theme);
    Sound.click();
  });
});

// ============================================================
// 9. DATA
// ============================================================
function getRecentGames() {
  const stored = localStorage.getItem('twistchess_games');
  return stored ? JSON.parse(stored) : [
    { mode: 'Classic', result: 'win', opponent: 'MagnusFan', time: '2 hours ago' },
    { mode: 'Hidden Queen', result: 'loss', opponent: 'TrickyBishop', time: '5 hours ago' },
    { mode: 'ROOOK', result: 'win', opponent: 'RookMaster', time: 'Yesterday' },
    { mode: 'Classic', result: 'draw', opponent: 'DrawLord', time: '2 days ago' },
  ];
}
function saveRecentGame(result) {
  const games = getRecentGames();
  games.unshift({
    mode: currentGamemode.charAt(0).toUpperCase() + currentGamemode.slice(1),
    result: result.includes('wins') && result.includes('White') ? (playerColor === 'w' ? 'win' : 'loss') :
            result.includes('wins') && result.includes('Black') ? (playerColor === 'b' ? 'win' : 'loss') : 'draw',
    opponent: 'TwistBot', time: 'Just now'
  });
  if (games.length > 6) games.pop();
  localStorage.setItem('twistchess_games', JSON.stringify(games));
  renderRecentGames();
}
function renderRecentGames() {
  const games = getRecentGames();
  const html = games.map(g => `
    <div class="game-row">
      <div class="game-info">
        <span class="game-badge">${g.mode}</span>
        <span class="game-players">You vs ${g.opponent}</span>
      </div>
      <div>
        <span class="game-result result-${g.result}">${g.result === 'win' ? 'Victory' : g.result === 'loss' ? 'Defeat' : 'Draw'}</span>
        <span style="color: var(--text-muted); font-size: 12px; margin-left: 12px;">${g.time}</span>
      </div>
    </div>`).join('');
  document.getElementById('recentGamesList').innerHTML = html;
  document.getElementById('profileRecentGames').innerHTML = html;
}

const friends = [
  { name: 'MagnusFan', status: 'online', rating: 2100 },
  { name: 'TrickyBishop', status: 'online', rating: 1850 },
  { name: 'RookMaster', status: 'offline', rating: 1950 },
  { name: 'PawnStorm', status: 'online', rating: 1720 },
  { name: 'QueenSac', status: 'offline', rating: 1600 },
];
function renderFriends() {
  document.getElementById('friendsList').innerHTML = friends.map(f => `
    <div class="friend-row">
      <div class="friend-info">
        <div class="friend-avatar">${f.name[0]}</div>
        <div>
          <div style="font-weight: 600; font-size: 14px;">${f.name}</div>
          <div class="friend-status ${f.status}">${f.status === 'online' ? '● Online' : '○ Offline'} · ${f.rating}</div>
        </div>
      </div>
      <button class="btn" style="padding: 8px 16px; font-size: 12px;">Challenge</button>
    </div>`).join('');
}

// ============================================================
// 10. AUTH
// ============================================================
let isSignUp = false;
const authOverlay = document.getElementById('authOverlay');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authToggleText = document.getElementById('authToggleText');
const authToggleLink = document.getElementById('authToggleLink');

authToggleLink.addEventListener('click', () => {
  isSignUp = !isSignUp;
  authTitle.textContent = isSignUp ? 'Create your account' : 'Welcome back';
  authSubtitle.textContent = isSignUp ? 'Join TwistChess and start playing.' : 'Sign in to continue your games.';
  authSubmitBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
  authToggleText.textContent = isSignUp ? 'Already have an account?' : "Don't have an account?";
  authToggleLink.textContent = isSignUp ? 'Sign in' : 'Sign up';
  Sound.click();
});
authSubmitBtn.addEventListener('click', () => {
  const username = document.getElementById('authUsername').value.trim();
  if (!username) { alert('Please enter a username'); return; }
  localStorage.setItem('twistchess_username', username);
  authOverlay.classList.add('hidden');
  document.getElementById('homeUsername').textContent = username;
  document.getElementById('profileName').textContent = username;
  document.getElementById('profileAvatar').textContent = username[0].toUpperCase();
  Sound.click();
  renderRecentGames();
});

const storedUser = localStorage.getItem('twistchess_username');
if (storedUser) {
  authOverlay.classList.add('hidden');
  document.getElementById('homeUsername').textContent = storedUser;
  document.getElementById('profileName').textContent = storedUser;
  document.getElementById('profileAvatar').textContent = storedUser[0].toUpperCase();
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:12px 24px;border-radius:var(--radius);font-weight:600;z-index:2000;box-shadow:var(--shadow);';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================================
// 11. INIT
// ============================================================
const savedSound = localStorage.getItem('twistchess_sound');
if (savedSound !== null) {
  soundEnabled = savedSound === 'true';
  document.getElementById('soundToggle').classList.toggle('active', soundEnabled);
}
const savedDark = localStorage.getItem('twistchess_dark');
if (savedDark === 'false') {
  document.body.classList.add('light-theme');
  document.getElementById('darkModeToggle').classList.remove('active');
}
const savedTheme = localStorage.getItem('twistchess_theme');
if (savedTheme) {
  document.body.classList.remove('theme-wood', 'theme-ice', 'theme-emerald', 'theme-dark');
  if (savedTheme !== 'wood') document.body.classList.add('theme-' + savedTheme);
  document.querySelectorAll('.theme-option').forEach(o => o.classList.toggle('selected', o.dataset.theme === savedTheme));
}

renderRecentGames();
renderFriends();
initBoard('classic');
gameActive = false;

document.getElementById('statGames').textContent = '42';
document.getElementById('statWins').textContent = '24';
document.getElementById('statWinRate').textContent = '57%';
document.getElementById('statRating').textContent = '1620';

document.addEventListener('click', () => { getAudioCtx(); }, { once: true });
