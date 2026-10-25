/* ==========================================
   AUDIO SYNTHESIZER SYSTEM
   ========================================== */
class SoundEngine {
    constructor() {
        this.ctx = null;
    }
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    playTone(freq, type, duration, vol = 0.08) {
        const soundEnabled = document.getElementById('soundToggle').checked;
        if (!soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    }
    move() { this.playTone(440, 'sine', 0.08, 0.06); }
    capture() { this.playTone(300, 'triangle', 0.12, 0.1); }
    check() { this.playTone(660, 'square', 0.2, 0.08); }
    victory() {
        setTimeout(() => this.playTone(523.25, 'sine', 0.15, 0.12), 0);
        setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.12), 150);
        setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.12), 300);
    }
}
const soundEngine = new SoundEngine();

/* ==========================================
   PIECE ICON SETS & CHESS CORE
   ========================================== */
const PIECE_SETS = {
    neo: {
        'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
        'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
    },
    standard: {
        'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
        'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
    },
    solid: {
        'P': '♟', 'N': '♞', 'B': '♝', 'R': '♜', 'Q': '♛', 'K': '♚',
        'p': '♙', 'n': '♘', 'b': '♗', 'r': '♖', 'q': '♕', 'k': '♔'
    },
    fantasy: {
        'P': '🛡️', 'N': '🐴', 'B': '🔮', 'R': '🏰', 'Q': '👑', 'K': '🤴',
        'p': '🗡️', 'n': '🐎', 'b': '🧿', 'r': '🏯', 'q': '👸', 'k': '🧛'
    }
};

let currentPieceSet = 'neo';
let boardState = [];
let turn = 'w';
let castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
let enPassantTarget = null;
let halfmoveClock = 0;
let fullmoveNumber = 1;
let moveHistory = [];
let capturedPieces = { w: [], b: [] };

let selectedSquare = null;
let legalMovesForSelected = [];
let isFlipped = false;
let pendingPromotion = null;
let gameOver = false;

// Game Configuration from Landing
let gameMode = 'ai';
let aiElo = 1500;
let timeControlSeconds = 600;
let timers = { w: 600, b: 600 };
let timerInterval = null;

const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/* ==========================================
   LANDING & CONFIGURATION SYNC
   ========================================== */
function syncHomeSettings() {
    gameMode = document.getElementById('homeGameMode').value;
    timeControlSeconds = parseInt(document.getElementById('homeTimeControl').value);
    
    const eloGroup = document.getElementById('homeEloGroup');
    if (gameMode === 'ai') {
        eloGroup.style.display = 'flex';
    } else {
        eloGroup.style.display = 'none';
    }
}

function syncHomeElo(val) {
    aiElo = parseInt(val);
    document.getElementById('homeEloDisplay').textContent = `${aiElo} Elo`;
}

function launchGameFromLanding() {
    syncHomeSettings();
    document.getElementById('landingScreen').classList.add('hidden');
    document.getElementById('appWrapper').classList.remove('hidden');

    const blackUsername = document.getElementById('blackUsername');
    const whiteUsername = document.getElementById('whiteUsername');

    if (gameMode === 'ai') {
        blackUsername.textContent = `Bot (${aiElo} Elo)`;
        whiteUsername.textContent = 'Player (White)';
    } else {
        blackUsername.textContent = 'Black Player';
        whiteUsername.textContent = 'White Player';
    }

    resetGame();
}

function returnToLanding() {
    clearInterval(timerInterval);
    document.getElementById('appWrapper').classList.add('hidden');
    document.getElementById('landingScreen').classList.remove('hidden');
}

/* ==========================================
   FEN & GAME INITIALIZATION
   ========================================== */
function loadFen(fen) {
    const parts = fen.split(' ');
    const rows = parts[0].split('/');
    boardState = [];
    
    for (let r = 0; r < 8; r++) {
        let row = [];
        let fenRow = rows[r];
        for (let char of fenRow) {
            if (!isNaN(char)) {
                for (let i = 0; i < parseInt(char); i++) row.push(null);
            } else {
                const color = char === char.toUpperCase() ? 'w' : 'b';
                row.push({ type: char.toLowerCase(), color: color, symbol: char });
            }
        }
        boardState.push(row);
    }

    turn = parts[1] || 'w';
    castlingRights = { w: { k: false, q: false }, b: { k: false, q: false } };
    if (parts[2] && parts[2] !== '-') {
        if (parts[2].includes('K')) castlingRights.w.k = true;
        if (parts[2].includes('Q')) castlingRights.w.q = true;
        if (parts[2].includes('k')) castlingRights.b.k = true;
        if (parts[2].includes('q')) castlingRights.b.q = true;
    }
    if (parts[3] && parts[3] !== '-') {
        const file = parts[3].charCodeAt(0) - 97;
        const rank = 8 - parseInt(parts[3][1]);
        enPassantTarget = { r: rank, c: file };
    } else {
        enPassantTarget = null;
    }
    halfmoveClock = parseInt(parts[4]) || 0;
    fullmoveNumber = parseInt(parts[5]) || 1;
}

function resetGame() {
    loadFen(initialFen);
    moveHistory = [];
    capturedPieces = { w: [], b: [] };
    selectedSquare = null;
    legalMovesForSelected = [];
    gameOver = false;
    document.getElementById('gameOverBanner').classList.remove('show');
    document.getElementById('movesListBody').innerHTML = '';
    document.getElementById('captured-white').innerHTML = '';
    document.getElementById('captured-black').innerHTML = '';
    document.getElementById('moveCountBadge').textContent = '0 plies';
    document.getElementById('evalScoreText').textContent = 'Equal position (0.0)';
    document.getElementById('evalBarFill').style.height = '50%';

    clearInterval(timerInterval);
    timers.w = timeControlSeconds;
    timers.b = timeControlSeconds;
    updateTimersDisplay();
    if (timeControlSeconds > 0) startTimer();

    renderBoard();
    updateTurnIndicator();

    if (gameMode === 'ai' && turn === 'b') {
        setTimeout(makeAIMove, 400);
    }
}

/* ==========================================
   CHESS RULES & MOVE VALIDATION ENGINE
   ========================================== */
function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

function findKing(board, color) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'k' && p.color === color) return { r, c };
        }
    }
    return null;
}

function isSquareAttacked(board, r, c, attackerColor) {
    const pawnDir = attackerColor === 'w' ? 1 : -1;
    const pawnRow = r - pawnDir;
    if (pawnRow >= 0 && pawnRow < 8) {
        for (let dc of [-1, 1]) {
            const pc = c + dc;
            if (inBounds(pawnRow, pc)) {
                const p = board[pawnRow][pc];
                if (p && p.color === attackerColor && p.type === 'p') return true;
            }
        }
    }

    const knightMoves = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
    for (let [dr, dc] of knightMoves) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(nr, nc)) {
            const p = board[nr][nc];
            if (p && p.color === attackerColor && p.type === 'n') return true;
        }
    }

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (inBounds(nr, nc)) {
                const p = board[nr][nc];
                if (p && p.color === attackerColor && p.type === 'k') return true;
            }
        }
    }

    const orthoDirs = [[-1,0], [1,0], [0,-1], [0,1]];
    for (let [dr, dc] of orthoDirs) {
        let nr = r + dr, nc = c + dc;
        while (inBounds(nr, nc)) {
            const p = board[nr][nc];
            if (p) {
                if (p.color === attackerColor && (p.type === 'r' || p.type === 'q')) return true;
                break;
            }
            nr += dr; nc += dc;
        }
    }

    const diagDirs = [[-1,-1], [-1,1], [1,-1], [1,1]];
    for (let [dr, dc] of diagDirs) {
        let nr = r + dr, nc = c + dc;
        while (inBounds(nr, nc)) {
            const p = board[nr][nc];
            if (p) {
                if (p.color === attackerColor && (p.type === 'b' || p.type === 'q')) return true;
                break;
            }
            nr += dr; nc += dc;
        }
    }

    return false;
}

function isKingInCheck(board, color) {
    const kingPos = findKing(board, color);
    if (!kingPos) return false;
    const enemyColor = color === 'w' ? 'b' : 'w';
    return isSquareAttacked(board, kingPos.r, kingPos.c, enemyColor);
}

function getRawPseudoMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const moves = [];
    const color = piece.color;
    const enemyColor = color === 'w' ? 'b' : 'w';

    if (piece.type === 'p') {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        const f1 = r + dir;
        if (inBounds(f1, c) && !board[f1][c]) {
            moves.push({ r: f1, c: c });
            const f2 = r + dir * 2;
            if (r === startRow && inBounds(f2, c) && !board[f2][c]) {
                moves.push({ r: f2, c: c });
            }
        }
        for (let dc of [-1, 1]) {
            const nc = c + dc;
            if (inBounds(f1, nc)) {
                const target = board[f1][nc];
                if (target && target.color === enemyColor) {
                    moves.push({ r: f1, c: nc });
                }
                if (enPassantTarget && enPassantTarget.r === f1 && enPassantTarget.c === nc) {
                    moves.push({ r: f1, c: nc, enPassant: true });
                }
            }
        }
    } else if (piece.type === 'n') {
        const knightMoves = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
        for (let [dr, dc] of knightMoves) {
            const nr = r + dr, nc = c + dc;
            if (inBounds(nr, nc)) {
                const target = board[nr][nc];
                if (!target || target.color === enemyColor) moves.push({ r: nr, c: nc });
            }
        }
    } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
        let dirs = [];
        if (piece.type === 'b' || piece.type === 'q') dirs.push([-1,-1], [-1,1], [1,-1], [1,1]);
        if (piece.type === 'r' || piece.type === 'q') dirs.push([-1,0], [1,0], [0,-1], [0,1]);

        for (let [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            while (inBounds(nr, nc)) {
                const target = board[nr][nc];
                if (!target) {
                    moves.push({ r: nr, c: nc });
                } else {
                    if (target.color === enemyColor) moves.push({ r: nr, c: nc });
                    break;
                }
                nr += dr; nc += dc;
            }
        }
    } else if (piece.type === 'k') {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (inBounds(nr, nc)) {
                    const target = board[nr][nc];
                    if (!target || target.color === enemyColor) moves.push({ r: nr, c: nc });
                }
            }
        }
        if (color === 'w' && r === 7 && c === 4) {
            if (castlingRights.w.k && !board[7][5] && !board[7][6] && !isSquareAttacked(board, 7, 4, 'b') && !isSquareAttacked(board, 7, 5, 'b') && !isSquareAttacked(board, 7, 6, 'b')) {
                moves.push({ r: 7, c: 6, castling: 'k' });
            }
            if (castlingRights.w.q && !board[7][3] && !board[7][2] && !board[7][1] && !isSquareAttacked(board, 7, 4, 'b') && !isSquareAttacked(board, 7, 3, 'b') && !isSquareAttacked(board, 7, 2, 'b')) {
                moves.push({ r: 7, c: 2, castling: 'q' });
            }
        } else if (color === 'b' && r === 0 && c === 4) {
            if (castlingRights.b.k && !board[0][5] && !board[0][6] && !isSquareAttacked(board, 0, 4, 'w') && !isSquareAttacked(board, 0, 5, 'w') && !isSquareAttacked(board, 0, 6, 'w')) {
                moves.push({ r: 0, c: 6, castling: 'k' });
            }
            if (castlingRights.b.q && !board[0][3] && !board[0][2] && !board[0][1] && !isSquareAttacked(board, 0, 4, 'w') && !isSquareAttacked(board, 0, 3, 'w') && !isSquareAttacked(board, 0, 2, 'w')) {
                moves.push({ r: 0, c: 2, castling: 'q' });
            }
        }
    }
    return moves;
}

function cloneBoard(board) {
    return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

function getLegalMoves(r, c) {
    const piece = boardState[r][c];
    if (!piece || piece.color !== turn) return [];
    const pseudo = getRawPseudoMoves(boardState, r, c);
    const legal = [];

    for (let move of pseudo) {
        const tempBoard = cloneBoard(boardState);
        if (move.enPassant) {
            const capturedPawnRow = piece.color === 'w' ? move.r + 1 : move.r - 1;
            tempBoard[capturedPawnRow][move.c] = null;
        }
        if (move.castling) {
            if (move.castling === 'k') {
                tempBoard[move.r][5] = tempBoard[move.r][7];
                tempBoard[move.r][7] = null;
            } else if (move.castling === 'q') {
                tempBoard[move.r][3] = tempBoard[move.r][0];
                tempBoard[move.r][0] = null;
            }
        }
        tempBoard[move.r][move.c] = tempBoard[r][c];
        tempBoard[r][c] = null;

        if (!isKingInCheck(tempBoard, piece.color)) {
            legal.push(move);
        }
    }
    return legal;
}

function getAllLegalMovesForColor(color) {
    let allMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = boardState[r][c];
            if (p && p.color === color) {
                const prevTurn = turn;
                turn = color;
                const lm = getLegalMoves(r, c);
                turn = prevTurn;
                lm.forEach(m => allMoves.push({ from: {r, c}, to: m }));
            }
        }
    }
    return allMoves;
}

/* ==========================================
   EXECUTION & AI ENGINE
   ========================================== */
function executeMove(from, to, promotionPiece = 'q') {
    const piece = boardState[from.r][from.c];
    const target = boardState[to.r][to.c];
    let captured = target;

    const historyEntry = {
        from: { ...from },
        to: { ...to },
        piece: { ...piece },
        target: target ? { ...target } : null,
        castlingRights: JSON.parse(JSON.stringify(castlingRights)),
        enPassantTarget: enPassantTarget ? { ...enPassantTarget } : null,
        halfmoveClock,
        fullmoveNumber,
        isPromotion: false,
        isEnPassant: false,
        isCastling: false
    };

    if (piece.type === 'p' && enPassantTarget && to.r === enPassantTarget.r && to.c === enPassantTarget.c && !target) {
        const capturedPawnRow = piece.color === 'w' ? to.r + 1 : to.r - 1;
        captured = boardState[capturedPawnRow][to.c];
        boardState[capturedPawnRow][to.c] = null;
        historyEntry.isEnPassant = true;
    }

    enPassantTarget = null;
    if (piece.type === 'p' && Math.abs(from.r - to.r) === 2) {
        enPassantTarget = { r: (from.r + to.r) / 2, c: from.c };
    }

    if (piece.type === 'k' && Math.abs(from.c - to.c) === 2) {
        historyEntry.isCastling = true;
        if (to.c === 6) {
            boardState[from.r][5] = boardState[from.r][7];
            boardState[from.r][7] = null;
        } else if (to.c === 2) {
            boardState[from.r][3] = boardState[from.r][0];
            boardState[from.r][0] = null;
        }
    }

    if (piece.type === 'k') {
        castlingRights[piece.color].k = false;
        castlingRights[piece.color].q = false;
    }
    if (piece.type === 'r') {
        if (from.r === 7 && from.c === 0) castlingRights.w.q = false;
        if (from.r === 7 && from.c === 7) castlingRights.w.k = false;
        if (from.r === 0 && from.c === 0) castlingRights.b.q = false;
        if (from.r === 0 && from.c === 7) castlingRights.b.k = false;
    }

    boardState[to.r][to.c] = piece;
    boardState[from.r][from.c] = null;

    if (piece.type === 'p' && (to.r === 0 || to.r === 7)) {
        boardState[to.r][to.c] = { type: promotionPiece, color: piece.color, symbol: piece.color === 'w' ? promotionPiece.toUpperCase() : promotionPiece.toLowerCase() };
        historyEntry.isPromotion = true;
    }

    if (captured) {
        capturedPieces[piece.color].push(captured.symbol);
        updateCapturedDisplay();
    }

    if (captured) soundEngine.capture();
    else soundEngine.move();

    const moveNotation = formatNotation(piece, from, to, captured, historyEntry.isCastling, historyEntry.isPromotion);

    turn = turn === 'w' ? 'b' : 'w';
    if (turn === 'w') fullmoveNumber++;

    moveHistory.push({ notation: moveNotation, state: historyEntry });
    updateMovesTable();
    updateTurnIndicator();
    updateAnalysisEvaluation();

    const enemyLegalMoves = getAllLegalMovesForColor(turn);
    const inCheck = isKingInCheck(boardState, turn);

    if (enemyLegalMoves.length === 0) {
        gameOver = true;
        clearInterval(timerInterval);
        if (inCheck) {
            soundEngine.check();
            const winner = turn === 'w' ? 'Black' : 'White';
            showGameOver(`${winner} Wins!`, `Checkmate by ${winner === 'White' ? 'Black' : 'White'}`);
        } else {
            showGameOver('Stalemate!', 'The game is a draw.');
        }
    } else if (inCheck) {
        soundEngine.check();
    }

    renderBoard();

    if (!gameOver && gameMode === 'ai' && turn === 'b') {
        setTimeout(makeAIMove, 250);
    }
}

function makeAIMove() {
    if (gameOver) return;
    const allMoves = getAllLegalMovesForColor('b');
    if (allMoves.length === 0) return;

    let chosenMove;
    if (aiElo < 800) {
        chosenMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    } else if (aiElo < 2000) {
        const captures = allMoves.filter(m => boardState[m.to.r][m.to.c] !== null);
        if (captures.length > 0 && Math.random() < 0.75) {
            chosenMove = captures[Math.floor(Math.random() * captures.length)];
        } else {
            chosenMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        }
    } else {
        const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 1000 };
        let bestScore = -99999, bestMoves = [];
        for (let m of allMoves) {
            const target = boardState[m.to.r][m.to.c];
            let score = target ? values[target.type] * 10 : Math.random();
            if (score > bestScore) {
                bestScore = score;
                bestMoves = [m];
            } else if (score === bestScore) {
                bestMoves.push(m);
            }
        }
        chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    if (chosenMove) executeMove(chosenMove.from, chosenMove.to);
}

function formatNotation(piece, from, to, captured, isCastling, isPromotion) {
    if (isCastling) return to.c === 6 ? 'O-O' : 'O-O-O';
    let notation = '';
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    if (piece.type !== 'p') {
        notation += piece.symbol.toUpperCase();
        notation += files[from.c] + ranks[from.r];
    } else if (captured) {
        notation += files[from.c];
    }
    if (captured) notation += 'x';
    notation += files[to.c] + ranks[to.r];
    if (isPromotion) notation += '=Q';
    return notation;
}

function undoMove() {
    if (moveHistory.length === 0 || gameOver) return;
    const plies = (gameMode === 'ai' && moveHistory.length >= 2) ? 2 : 1;

    for (let i = 0; i < plies; i++) {
        if (moveHistory.length === 0) break;
        const lastMove = moveHistory.pop();
        const entry = lastMove.state;

        boardState[entry.from.r][entry.from.c] = entry.piece;
        boardState[entry.to.r][entry.to.c] = entry.target;

        if (entry.isEnPassant) {
            const capturedPawnRow = entry.piece.color === 'w' ? entry.to.r + 1 : entry.to.r - 1;
            boardState[entry.to.r][entry.to.c] = null;
            boardState[capturedPawnRow][entry.to.c] = { type: 'p', color: entry.piece.color === 'w' ? 'b' : 'w', symbol: entry.piece.color === 'w' ? 'p' : 'P' };
        }
        if (entry.isCastling) {
            if (entry.to.c === 6) {
                boardState[entry.from.r][7] = boardState[entry.from.r][5];
                boardState[entry.from.r][5] = null;
            } else if (entry.to.c === 2) {
                boardState[entry.from.r][0] = boardState[entry.from.r][3];
                boardState[entry.from.r][3] = null;
            }
        }
        castlingRights = entry.castlingRights;
        enPassantTarget = entry.enPassantTarget;
        halfmoveClock = entry.halfmoveClock;
        fullmoveNumber = entry.fullmoveNumber;

        if (entry.target) {
            capturedPieces[entry.piece.color].pop();
            updateCapturedDisplay();
        }
        turn = turn === 'w' ? 'b' : 'w';
    }

    selectedSquare = null;
    legalMovesForSelected = [];
    gameOver = false;
    document.getElementById('gameOverBanner').classList.remove('show');

    updateMovesTable();
    updateTurnIndicator();
    updateAnalysisEvaluation();
    renderBoard();
}

/* ==========================================
   UI RENDERING & INTERACTION
   ========================================== */
function renderBoard() {
    const container = document.getElementById('chessboard');
    const banner = document.getElementById('gameOverBanner');
    container.innerHTML = '';
    container.appendChild(banner);

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const kingInCheckPos = isKingInCheck(boardState, turn) ? findKing(boardState, turn) : null;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const r = isFlipped ? 7 - i : i;
            const c = isFlipped ? 7 - j : j;

            const square = document.createElement('div');
            square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.r = r;
            square.dataset.c = c;

            if (c === (isFlipped ? 7 : 0)) {
                const rankLabel = document.createElement('span');
                rankLabel.className = 'coord-rank';
                rankLabel.textContent = ranks[r];
                square.appendChild(rankLabel);
            }
            if (r === (isFlipped ? 0 : 7)) {
                const fileLabel = document.createElement('span');
                fileLabel.className = 'coord-file';
                fileLabel.textContent = files[c];
                square.appendChild(fileLabel);
            }

            if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                square.classList.add('selected');
            }
            if (kingInCheckPos && kingInCheckPos.r === r && kingInCheckPos.c === c) {
                square.classList.add('check');
            }

            if (document.getElementById('highlightToggle').checked) {
                const moveMatch = legalMovesForSelected.find(m => m.r === r && m.c === c);
                if (moveMatch) {
                    if (boardState[r][c] || moveMatch.enPassant) {
                        square.classList.add('possible-capture');
                    } else {
                        square.classList.add('possible-move');
                    }
                }
            }

            const piece = boardState[r][c];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece';
                pieceEl.textContent = PIECE_SETS[currentPieceSet][piece.symbol];
                square.appendChild(pieceEl);
            }

            square.addEventListener('click', () => handleSquareClick(r, c));
            container.appendChild(square);
        }
    }
}

function handleSquareClick(r, c) {
    if (gameOver) return;
    if (gameMode === 'ai' && turn === 'b') return;

    const piece = boardState[r][c];
    if (selectedSquare) {
        const moveMatch = legalMovesForSelected.find(m => m.r === r && m.c === c);
        if (moveMatch) {
            const movingPiece = boardState[selectedSquare.r][selectedSquare.c];
            if (movingPiece.type === 'p' && (r === 0 || r === 7)) {
                pendingPromotion = { from: { ...selectedSquare }, to: { r, c } };
                showPromotionModal(movingPiece.color);
            } else {
                executeMove(selectedSquare, { r, c });
            }
            selectedSquare = null;
            legalMovesForSelected = [];
            renderBoard();
            return;
        }
    }

    if (piece && piece.color === turn) {
        selectedSquare = { r, c };
        legalMovesForSelected = getLegalMoves(r, c);
        renderBoard();
    } else {
        selectedSquare = null;
        legalMovesForSelected = [];
        renderBoard();
    }
}

function showPromotionModal(color) {
    const modal = document.getElementById('promotionModal');
    const choices = document.getElementById('promoChoices');
    choices.innerHTML = '';
    ['q', 'r', 'b', 'n'].forEach(pType => {
        const sym = color === 'w' ? pType.toUpperCase() : pType;
        const btn = document.createElement('div');
        btn.className = 'promo-piece-btn';
        btn.textContent = PIECE_SETS[currentPieceSet][sym];
        btn.onclick = () => {
            modal.classList.remove('show');
            executeMove(pendingPromotion.from, pendingPromotion.to, pType);
            pendingPromotion = null;
        };
        choices.appendChild(btn);
    });
    modal.classList.add('show');
}

function updateTurnIndicator() {
    const whiteCard = document.getElementById('player-white-card');
    const blackCard = document.getElementById('player-black-card');
    if (turn === 'w') {
        whiteCard.classList.add('active-turn');
        blackCard.classList.remove('active-turn');
    } else {
        blackCard.classList.add('active-turn');
        whiteCard.classList.remove('active-turn');
    }
}

function updateCapturedDisplay() {
    document.getElementById('captured-white').textContent = capturedPieces.w.join(' ');
    document.getElementById('captured-black').textContent = capturedPieces.b.join(' ');
}

function updateMovesTable() {
    const tbody = document.getElementById('movesListBody');
    tbody.innerHTML = '';
    for (let i = 0; i < moveHistory.length; i += 2) {
        const tr = document.createElement('tr');
        const num = Math.floor(i / 2) + 1;
        const wMove = moveHistory[i] ? moveHistory[i].notation : '';
        const bMove = moveHistory[i + 1] ? moveHistory[i + 1].notation : '';
        tr.innerHTML = `<td>${num}.</td><td>${wMove}</td><td>${bMove}</td>`;
        tbody.appendChild(tr);
    }
    const box = document.querySelector('.moves-ledger-box');
    box.scrollTop = box.scrollHeight;
    document.getElementById('moveCountBadge').textContent = `${moveHistory.length} plies`;
}

function updateAnalysisEvaluation() {
    let evalVal = 0;
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = boardState[r][c];
            if (p && values[p.type]) {
                if (p.color === 'w') evalVal += values[p.type];
                else evalVal -= values[p.type];
            }
        }
    }
    const evalText = evalVal > 0 ? `+${evalVal.toFixed(1)} for White` : evalVal < 0 ? `${evalVal.toFixed(1)} for Black` : 'Equal position (0.0)';
    document.getElementById('evalScoreText').textContent = evalText;
    const fillPercent = Math.max(10, Math.min(90, 50 + (evalVal * 5)));
    document.getElementById('evalBarFill').style.height = `${fillPercent}%`;
}

function showGameOver(title, subtitle) {
    soundEngine.victory();
    document.getElementById('winnerTitle').textContent = title;
    document.getElementById('winnerSubtitle').textContent = subtitle;
    document.getElementById('gameOverBanner').classList.add('show');
}

/* ==========================================
   TIMERS & MODAL CONTROLLERS
   ========================================== */
function startTimer() {
    clearInterval(timerInterval);
    if (timeControlSeconds <= 0) return;

    timerInterval = setInterval(() => {
        if (gameOver) return;
        timers[turn]--;
        updateTimersDisplay();

        if (timers[turn] <= 0) {
            clearInterval(timerInterval);
            gameOver = true;
            const winner = turn === 'w' ? 'Black' : 'White';
            showGameOver(`${winner} Wins!`, `Time out for ${turn === 'w' ? 'White' : 'Black'}.`);
        }
    }, 1000);
}

function updateTimersDisplay() {
    document.getElementById('timer-white').textContent = formatTime(timers.w);
    document.getElementById('timer-black').textContent = formatTime(timers.b);
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function switchSidebarTab(tabId) {
    document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-pane').forEach(p => p.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById(`pane-${tabId}`).classList.add('active');
}

function openSettingsModal() { document.getElementById('settingsModal').classList.add('show'); }
function openCustomizationModal() { document.getElementById('customizationModal').classList.add('show'); }
function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
}

function changeBoardTheme(themeClass) { document.body.className = themeClass; }
function changePieceSet(setName) {
    currentPieceSet = setName;
    renderBoard();
}
function flipBoard() {
    isFlipped = !isFlipped;
    renderBoard();
}
