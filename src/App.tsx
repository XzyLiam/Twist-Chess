import { useEffect, useMemo, useState } from "react";
import { Chess, Square } from "chess.js";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import AuthModal from "./components/AuthModal";
import Chessboard from "./components/Chessboard";
import SettingsPanel from "./components/SettingsPanel";
import ProfilePanel from "./components/ProfilePanel";
import FriendsPanel from "./components/FriendsPanel";
import DailyPuzzles from "./components/DailyPuzzles";
import AnalysisPanel from "./components/AnalysisPanel";

import { gameModes, recentGames } from "./data/gameModes";
import { playSound } from "./utils/audio";
import type { BoardSize, IconPack, ModeName, ThemeName, ViewName } from "./types";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  w: {
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔"
  },
  b: {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚"
  }
};

function getSquareName(row: number, col: number): Square {
  return `${FILES[col]}${8 - row}` as Square;
}

function App() {
  const [theme, setTheme] = useState<ThemeName>("midnight");
  const [view, setView] = useState<ViewName>("home");
  const [mode, setMode] = useState<ModeName>("classic");
  const [boardSize, setBoardSize] = useState<BoardSize>("large");
  const [iconPack, setIconPack] = useState<IconPack>("classic");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundLevel, setSoundLevel] = useState(72);
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [secretQueen, setSecretQueen] = useState<Square | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [game, setGame] = useState(() => new Chess());

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.dataset.iconPack = iconPack;
  }, [theme, iconPack]);

  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare, verbose: true }).map((move) => move.to);
  }, [game, selectedSquare]);

  const currentTurn = game.turn() === "w" ? "White" : "Black";
  const moveCount = game.history().length;

  useEffect(() => {
    if (mode === "bigboard") setBoardSize("large");
    if (mode === "smallboard") setBoardSize("small");
    if (mode === "classic" || mode === "rook" || mode === "hiddenqueen" || mode === "mirror" || mode === "chaos") {
      setBoardSize("large");
    }
  }, [mode]);

  function resetBoard() {
    setGame(new Chess());
    setSelectedSquare(null);
    setSecretQueen(null);
    setFlipped(false);
  }

  function applyMode(nextMode: ModeName) {
    setMode(nextMode);
    resetBoard();
  }

  function handleSquareClick(square: Square, row: number, col: number) {
    const board = game.board();
    const piece = board[row][col];

    if (
      mode === "hiddenqueen" &&
      game.history().length === 0 &&
      piece &&
      piece.type === "p" &&
      piece.color === game.turn() &&
      !secretQueen
    ) {
      setSecretQueen(square);
      playSound(soundEnabled, soundLevel, "click");
      return;
    }

    if (!selectedSquare) {
      if (!piece || piece.color !== game.turn()) return;
      const candidateMoves = game.moves({ square, verbose: true });
      if (!candidateMoves.length) return;

      setSelectedSquare(square);
      playSound(soundEnabled, soundLevel, "click");
      return;
    }

    const targetMove = game.moves({ square: selectedSquare, verbose: true }).find((move) => move.to === square);

    if (targetMove) {
      const nextGame = new Chess(game.fen());
      nextGame.move({
        from: selectedSquare,
        to: square,
        promotion: "q"
      });

      setGame(nextGame);
      setSelectedSquare(null);

      playSound(soundEnabled, soundLevel, targetMove.captured ? "capture" : "move");

      if (nextGame.isCheckmate()) {
        playSound(soundEnabled, soundLevel, "win");
      }

      return;
    }

    if (piece && piece.color === game.turn()) {
      const candidateMoves = game.moves({ square, verbose: true });
      if (candidateMoves.length) {
        setSelectedSquare(square);
        playSound(soundEnabled, soundLevel, "click");
        return;
      }
    }

    setSelectedSquare(null);
  }

  function handleThemeToggle() {
    const cycle: ThemeName[] = ["midnight", "sunset", "aurora", "classic", "chesscom"];
    const currentIndex = cycle.indexOf(theme);
    const nextTheme = cycle[(currentIndex + 1) % cycle.length];
    setTheme(nextTheme);
    playSound(soundEnabled, soundLevel, "click");
  }

  function handleThemeSelect(nextTheme: ThemeName) {
    setTheme(nextTheme);
    playSound(soundEnabled, soundLevel, "click");
  }

  function handleBoardSizeChange(nextSize: BoardSize) {
    setBoardSize(nextSize);
  }

  return (
    <div className="app-shell">
      <Sidebar view={view} onViewChange={setView} />

      <main className="main">
        <TopBar
          soundEnabled={soundEnabled}
          onThemeToggle={handleThemeToggle}
          onSoundToggle={() => setSoundEnabled((prev) => !prev)}
          onLoginOpen={() => setAuthOpen(true)}
        />

        <div className="content-shell">
          {view === "home" && (
            <>
              <section className="hero-grid">
                <div className="hero-panel">
                  <div className="badge">
                    <i className="fa-solid fa-bolt"></i> Twist mode unlocked
                  </div>

                  <div className="hero-copy">
                    <h1>Chess, but with a twist.</h1>
                    <p>
                      Battle through custom rulesets, hidden identities, giant boards, daily twists, and
                      strategic chaos designed for elite players and creative tacticians.
                    </p>

                    <div className="hero-actions">
                      <button className="cta primary" type="button">
                        <i className="fa-solid fa-play"></i> Play Now
                      </button>
                      <button className="cta secondary" type="button">
                        <i className="fa-solid fa-trophy"></i> Leaderboard
                      </button>
                    </div>

                    <div className="stats-row">
                      <div className="stat-box">
                        <span>Players</span>
                        <strong>18.4K</strong>
                      </div>
                      <div className="stat-box">
                        <span>Modes</span>
                        <strong>42+</strong>
                      </div>
                      <div className="stat-box">
                        <span>Win Rate</span>
                        <strong>71%</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="quick-panel">
                  <div className="panel-head">
                    <h3>Quick Modes</h3>
                    <span className="pill"><i className="fa-solid fa-rocket"></i> Fresh</span>
                  </div>

                  <div className="mode-list">
                    {gameModes.slice(0, 5).map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        className={`mode-card ${mode === item.key ? "active" : ""}`}
                        onClick={() => applyMode(item.key as ModeName)}
                      >
                        <div className="mode-icon">
                          <i className={`fa-solid ${item.icon}`}></i>
                        </div>
                        <div className="mode-meta">
                          <strong>{item.label}</strong>
                          <span>{item.subtitle}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </aside>
              </section>

              <section className="board-layout">
                <Chessboard
                  game={game}
                  selectedSquare={selectedSquare}
                  legalMoves={legalMoves}
                  boardSize={boardSize}
                  flipped={flipped}
                  mode={mode}
                  secretQueen={secretQueen}
                  onSquareClick={handleSquareClick}
                  onFlipBoard={() => setFlipped((prev) => !prev)}
                  onBoardSizeSet={handleBoardSizeChange}
                />

                <aside className="panel list-panel">
                  <div className="panel-head">
                    <h3>Recent Games</h3>
                    <span className="pill"><i className="fa-solid fa-signal"></i> Live</span>
                  </div>

                  <div className="results-list">
                    {recentGames.map((item) => (
                      <div className="result-row" key={item.label}>
                        <div className="result-left">
                          <div
                            className={`result-mark ${
                              item.result === "W" ? "win" : item.result === "L" ? "lose" : "draw"
                            }`}
                          >
                            {item.result}
                          </div>
                          <div className="result-copy">
                            <strong>{item.label}</strong>
                            <span>{item.subtitle}</span>
                          </div>
                        </div>
                        <div className="tag">{item.score}</div>
                      </div>
                    ))}
                  </div>
                </aside>
              </section>
            </>
          )}

          {view === "puzzles" && <DailyPuzzles />}

          {view === "analysis" && <AnalysisPanel />}

          {view === "profile" && (
            <ProfilePanel />
          )}

          {view === "friends" && <FriendsPanel />}

          {view === "modes" && (
            <section className="panel list-panel">
              <div className="panel-head">
                <h3>Game Modes</h3>
                <span className="pill"><i className="fa-solid fa-wand-sparkles"></i> All Modes</span>
              </div>

              <div className="mode-list expansive">
                {gameModes.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`mode-card ${mode === item.key ? "active" : ""}`}
                    onClick={() => applyMode(item.key as ModeName)}
                  >
                    <div className="mode-icon">
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <div className="mode-meta">
                      <strong>{item.label}</strong>
                      <span>{item.subtitle}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {view === "settings" && (
            <SettingsPanel
              theme={theme}
              onThemeChange={handleThemeSelect}
              boardSize={boardSize}
              onBoardSizeChange={handleBoardSizeChange}
              iconPack={iconPack}
              onIconPackChange={setIconPack}
              soundEnabled={soundEnabled}
              onSoundToggle={() => setSoundEnabled((prev) => !prev)}
              soundLevel={soundLevel}
              onSoundLevelChange={(value) => {
                setSoundLevel(value);
                setSoundEnabled(value > 0);
              }}
            />
          )}
        </div>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export default App;