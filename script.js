let game = new Chess();
let selectedSquare = null;
let gameMode = 'standard';

const pieceSymbols = {
    p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
    P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
};

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function startGame(mode) {
    gameMode = mode;
    game.reset();
    switchScreen('game-screen');
    renderBoard();
    updateStatus();
}

function goHome() {
    switchScreen('home-screen');
}

function openSettings() {
    switchScreen('settings-screen');
}

function openPuzzles() {
    alert("Daily Puzzles feature coming up next!");
}

function setTheme(themeName, event) {
    document.querySelectorAll('.theme-opt').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    if(themeName === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeName);
    }
}

function renderBoard() {
    const boardEl = document.getElementById('chessboard');
    boardEl.innerHTML = '';
    const board = game.board();

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const squareEl = document.createElement('div');
            const isLight = (r + c) % 2 === 0;
            squareEl.className = `square ${isLight ? 'light' : 'dark'}`;
            
            const squareCoord = String.fromCharCode(97 + c) + (8 - r);
            squareEl.dataset.square = squareCoord;

            const piece = board[r][c];
            if (piece) {
                const pieceKey = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
                squareEl.textContent = pieceSymbols[pieceKey];
            }

            if (selectedSquare === squareCoord) {
                squareEl.classList.add('selected');
            }

            squareEl.addEventListener('click', () => handleSquareClick(squareCoord));
            boardEl.appendChild(squareEl);
        }
    }
}

function handleSquareClick(square) {
    if (selectedSquare === null) {
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
            selectedSquare = square;
            renderBoard();
        }
    } else {
        try {
            const move = game.move({
                from: selectedSquare,
                to: square,
                promotion: 'q'
            });

            if (move) {
                selectedSquare = null;
                renderBoard();
                updateStatus();

                if (gameMode === 'bot' && !game.game_over() && game.turn() === 'b') {
                    document.getElementById('game-status').textContent = "Bot is thinking...";
                    setTimeout(makeBotMove, 500);
                }
            } else {
                selectedSquare = null;
                renderBoard();
            }
        } catch (e) {
            selectedSquare = null;
            renderBoard();
        }
    }
}

function makeBotMove() {
    const moves = game.moves();
    if (moves.length === 0) return;
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    game.move(randomMove);
    renderBoard();
    updateStatus();
}

function updateStatus() {
    const statusEl = document.getElementById('game-status');
    if (game.in_checkmate()) {
        statusEl.textContent = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
    } else if (game.in_draw()) {
        statusEl.textContent = "Game drawn!";
    } else {
        statusEl.textContent = `${game.turn() === 'w' ? "White's Turn" : "Black's Turn"}${game.in_check() ? ' (Check!)' : ''}`;
    }
}

function resetGame() {
    game.reset();
    selectedSquare = null;
    renderBoard();
    updateStatus();
}

function undoMove() {
    game.undo();
    if (gameMode === 'bot') {
        game.undo();
    }
    selectedSquare = null;
    renderBoard();
    updateStatus();
}
