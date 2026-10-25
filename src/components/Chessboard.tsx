import { Chess, Square } from "chess.js";
import type { BoardSize, ModeName } from "../types";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  w: { p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔" },
  b: { p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" }
};

function getSquareName(row: number, col: number): Square {
  return `${FILES[col]}${8 - row}` as Square;
}

interface ChessboardProps {
  game: Chess;
  selectedSquare: Square | null;
  legalMoves: string[];
  boardSize: BoardSize;
  flipped: boolean;
  mode: ModeName;
  secretQueen: Square | null;
  onSquareClick: (square: Square, row: number, col: number) => void;
  onFlipBoard: () => void;
  onBoardSizeSet: (size: BoardSize) => void;
}

export default function Chessboard({
  game,
  selectedSquare,
  legalMoves,
  boardSize,
  flipped,
  mode,
  secretQueen,
  onSquareClick,
  onFlipBoard,
  onBoardSizeSet
}: ChessboardProps) {
  const board = game.board();
  const rowOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const currentTurn = game.turn() === "w" ? "White" : "Black";
  const moveCount = game.history().length;

  const squares = [];
  for (const row of rowOrder) {
    for (const col of colOrder) {
      const piece = board[row][col];
      const square = getSquareName(row, col);

      squares.push({
        square,
        row,
        col,
        piece,
        isLight: (row + col) % 2 === 0
      });
    }
  }

  return (
    <div className="panel board-panel">
      <div className="panel-top">
        <div className="panel-title">
          <i className="fa-solid fa-chess-board"></i>
          <span>Current Match</span>
          <strong>{mode === "classic" ? "Classic Arena" : `${mode.toUpperCase()} Arena`}</strong>
        </div>

        <div className="panel-controls">
          <button className="mini-btn" type="button" onClick={() => onBoardSizeSet("small")}>
            <i className="fa-solid fa-compress"></i>
          </button>
          <button className="mini-btn" type="button" onClick={() => onBoardSizeSet("large")}>
            <i className="fa-solid fa-expand"></i>
          </button>
          <button className="mini-btn" type="button" onClick={onFlipBoard}>
            <i className="fa-solid fa-rotate"></i>
          </button>
        </div>
      </div>

      <div className="board-wrap">
        <div className={`board ${boardSize}`} role="grid">
          {squares.map(({ square, row, col, piece, isLight }) => {
            const isSelected = selectedSquare === square;
            const isLegal = legalMoves.includes(square);
            const isSecret = secretQueen === square;

            return (
              <button
                key={`${square}-${row}-${col}`}
                type="button"
                className={[
                  "square",
                  isLight ? "light" : "dark",
                  isSelected ? "selected" : "",
                  isLegal ? (piece ? "capture" : "movable") : ""
                ].join(" ")}
                onClick={() => onSquareClick(square, row, col)}
              >
                {piece && (
                  <span className={`piece ${piece.color === "w" ? "white" : "black"}`}>
                    {(() => {
                      if (mode === "hiddenqueen" && secretQueen === square && piece.type === "p") {
                        return piece.color === "w" ? "♕" : "♛";
                      }
                      return PIECE_SYMBOLS[piece.color][piece.type];
                    })()}
                  </span>
                )}
                {isSecret && <span className="secret-marker">★</span>}
              </button>
            );
          })}
        </div>

        <div className="side-stack">
          <div className="status-card">
            <h4>Game Status</h4>

            <div className="status-line">
              <div className="chip">
                <span className="dot"></span>
                {currentTurn} to move
              </div>
              <span className="tiny-badge">
                <i className="fa-solid fa-clock"></i> 15:00
              </span>
            </div>

            <div className="info-list">
              <div className="info-row">
                <span>Mode</span>
                <strong>{mode.toUpperCase()}</strong>
              </div>
              <div className="info-row">
                <span>Twist</span>
                <strong>{mode === "classic" ? "Normal" : "Charged"}</strong>
              </div>
              <div className="info-row">
                <span>Secret Queen</span>
                <strong>{secretQueen ? "Selected" : "None"}</strong>
              </div>
            </div>
          </div>

          <div className="status-card">
            <h4>Match Stats</h4>
            <div className="mini-stats">
              <div className="mini-stat">
                <span>Moves</span>
                <strong>{moveCount}</strong>
              </div>
              <div className="mini-stat">
                <span>Blunders</span>
                <strong>3</strong>
              </div>
              <div className="mini-stat">
                <span>Accuracy</span>
                <strong>84%</strong>
              </div>
              <div className="mini-stat">
                <span>Combo</span>
                <strong>4x</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}