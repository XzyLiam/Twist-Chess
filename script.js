// Simple representation of standard chess pieces using Unicode symbols
const pieces = {
    r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
    R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙'
};

const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

function renderBoard() {
    const boardElement = document.getElementById('chessboard');
    boardElement.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const isLight = (row + col) % 2 === 0;
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            
            const piece = initialBoard[row][col];
            if (piece) {
                square.textContent = pieces[piece];
            }

            boardElement.appendChild(square);
        }
    }
}

document.getElementById('restart-btn').addEventListener('click', () => {
    renderBoard();
    document.getElementById('game-status').textContent = "Turn: White";
});

// Initialize on load
renderBoard();

