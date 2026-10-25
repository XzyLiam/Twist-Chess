import { useEffect, useMemo, useState } from "react";
import { Chess, Square } from "chess.js";

type ThemeName = "midnight" | "sunset" | "aurora" | "classic" | "chesscom";
type ViewName = "home" | "puzzles" | "analysis" | "profile" | "friends" | "modes" | "settings";
type ModeName =
  | "classic"
  | "rook"
  | "hiddenqueen"
  | "bigboard"
  | "smallboard"
  | "mirror"
  | "chaos"
  | "nocastle"
  | "daily";
type BoardSize = "small" | "normal" | "large";
type IconPack = "classic" | "minimal" | "neon";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  w: { p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔" },
  b: { p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" }
};

const modes = [
  { key: "classic", label: "Classic", subtitle: "Original rules", icon: "fa-chess" },
  { key: "rook", label: "ROOK", subtitle: "Knights & bishops become rooks", icon: "fa-chess-rook" },
  { key: "hiddenqueen", label: "Hidden Queen", subtitle: "Secret queen chosen at start", icon: "fa-user-secret" },
  { key: "bigboard", label: "Big Board", subtitle: "Larger battlefield", icon: "fa-expand" },
  { key: "smallboard", label: "Small Board", subtitle: "Fast tactical duels", icon: "fa-compress" },
  { key: "mirror", label: "Mirror", subtitle: "Board flips after moves", icon: "fa-arrows-left-right" },
  { key: "chaos", label: "Chaos", subtitle: "Randomized power-ups", icon: "fa-bolt" },
  { key: "nocastle", label: "No Castle", subtitle: "Castling disabled", icon: "fa-shield-halved" },
  { key: "daily", label: "Daily Twist", subtitle: "New variant each day", icon: "fa-calendar-day" }
];

const friendList = [
  { name: "Lumen", status: "Online • Blitz", color: "linear-gradient(135deg, #6ea8fe, #7cf5d6)" },
  { name: "Nova", status: "Online • Classic", color: "linear-gradient(135deg, #7cf5d6, #6ea8fe)" },
  { name: "Izzy", status: "Idle • Hidden Queen", color: "linear-gradient(135deg, #ffb454, #ff7a7a)" },
  { name: "Kade", status: "In Match • Large Board", color: "linear-gradient(135deg, #9be9a8, #5eead4)" },
  { name: "Milo", status: "Reviewing • Analysis", color: "linear-gradient(135deg, #c4b5fd, #7dd3fc)" }
];

const recentGames = [
  { result: "W", label: "Quick Arena", subtitle: "vs Lumen • +14 rating", score: "1-0" },
  { result: "L", label: "ROOK Duel", subtitle: "vs Nova • -7 rating", score: "0-1" },
  { result: "W", label: "Hidden Queen", subtitle: "vs Izzy • +9 rating", score: "1-0" },
  { result: "D", label: "Big Board", subtitle: "vs Kade • draw", score: "½-½" }
];

function getSquareName(row: number, col: number) {
  return `${FILES[col]}${8 - row}` as Square;
}

function App() {
  const [theme, setTheme] = useState<ThemeName>("midnight");
  const [view, setView] = useState<ViewName>("home");
  const [mode, setMode] = useState<ModeName>("classic");
  const [boardSize, setBoardSize] = useState<BoardSize>("large");
  const [iconPack, setIconPack] = useState<IconPack>("classic");
  const [authOpen, setAuthOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundLevel, setSoundLevel] = useState(72);
  const [flipped, setFlipped] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [secretQueen, setSecretQueen] = useState<Square | null>(null);
  const [game, setGame] = useState(() => new Chess());

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.dataset.iconPack = iconPack;
  }, [theme, iconPack]);

  const moveCount = game.history().length;
  const currentTurn = game.turn() === "w" ? "White" : "Black";

  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare, verbose: true }).map((move) => move.to);
  }, [game, selectedSquare]);

  const boardSquares = useMemo(() => {
    const board = game.board();
    const rowOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const colOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    const rendered: Array<{ square: Square; row: number; col: number; piece: any; isLight: boolean }> = [];
    for (const row of rowOrder) {
      for (const col of colOrder) {
        const piece = board[row][col];
        rendered.push({
          square: getSquareName(row, col),
          row,
          col,
          piece,
          isLight: (row + col) % 2 === 0
        });
      }
    }
    return rendered;
  }, [flipped, game]);

  function playTone(freq = 440, duration = 0.12, type: OscillatorType = "sine", gainValue = 0.05) {
    if (!soundEnabled) return;
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) return;

    const context = new AudioCtor();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(gainValue * (soundLevel / 100), context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + duration);

    setTimeout(() => context.close(), duration * 1000 + 200);
  }

  function playSound(type: "move" | "capture" | "click" | "win") {
    if (!soundEnabled) return;
    if (type === "click") playTone(520, 0.07, "triangle", 0.02);
    if (type === "move") {
      playTone(700, 0.08, "sine", 0.025);
      setTimeout(() => playTone(920, 0.09, "triangle", 0.02), 50);
    }
    if (type === "capture") playTone(220, 0.15, "square", 0.045);
    if (type === "win") {
      playTone(523, 0.18, "triangle", 0.04);
      setTimeout(() => playTone(659, 0.18, "triangle", 0.04), 150);
      setTimeout(() => playTone(784, 0.22, "triangle", 0.04), 300);
    }
  }

  function resetBoard() {
    setGame(new Chess());
    setSelectedSquare(null);
    setSecretQueen(null);
    setFlipped(false);
  }

  function applyMode(nextMode: ModeName) {
    setMode(nextMode);
    if (nextMode === "bigboard") setBoardSize("large");
    if (nextMode === "smallboard") setBoardSize("small");
    if (nextMode === "classic" || nextMode === "rook" || nextMode === "hiddenqueen" || nextMode === "mirror" || nextMode === "chaos") {
      setBoardSize("large");
    }
    resetBoard();
  }

  function handleSquareClick(square: Square, row: number, col: number) {
    const board = game.board();
    const piece = board[row][col];

    if (mode === "hiddenqueen" && game.history().length === 0 && piece && piece.type === "p" && piece.color === game.turn()) {
      if (!secretQueen) {
        setSecretQueen(square);
        playSound("click");
        return;
      }
    }

    if (!selectedSquare) {
      if (!piece || piece.color !== game.turn()) return;
      const candidateMoves = game.moves({ square, verbose: true });
      if (!candidateMoves.length) return;

      setSelectedSquare(square);
      playSound("click");
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
      playSound(targetMove.captured ? "capture" : "move");
      if (nextGame.isCheckmate()) playSound("win");
      return;
    }

    if (piece && piece.color === game.turn()) {
      const nextMoves = game.moves({ square, verbose: true });
      if (nextMoves.length) {
        setSelectedSquare(square);
        playSound("click");
        return;
      }
    }

    setSelectedSquare(null);
  }

  function setThemeName(next: ThemeName) {
    setTheme(next);
    playTone(540, 0.06, "triangle", 0.025);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div className="brand-copy">
            <strong>TwistChess</strong>
            <span>ARENA</span>
          </div>
        </div>

        <nav className="nav">
          <button className={`nav-item ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>
            <i className="fa-solid fa-house"></i>
            <span>Home</span>
          </button>
          <button className={`nav-item ${view === "puzzles" ? "active" : ""}`} onClick={() => setView("puzzles")}>
            <i className="fa-solid fa-puzzle-piece"></i>
            <span>Puzzles</span>
          </button>
          <button className={`nav-item ${view === "analysis" ? "active" : ""}`} onClick={() => setView("analysis")}>
            <i className="fa-solid fa-chart-line"></i>
            <span>Analysis</span>
          </button>
          <button className={`nav-item ${view === "profile" ? "active" : ""}`} onClick={() => setView("profile")}>
            <i className="fa-solid fa-user"></i>
            <span>Profile</span>
          </button>
          <button className={`nav-item ${view === "friends" ? "active" : ""}`} onClick={() => setView("friends")}>
            <i className="fa-solid fa-user-group"></i>
            <span>Friends</span>
          </button>
          <button className={`nav-item ${view === "modes" ? "active" : ""}`} onClick={() => setView("modes")}>
            <i className="fa-solid fa-chess-knight"></i>
            <span>Modes</span>
          </button>
          <button className={`nav-item ${view === "settings" ? "active" : ""}`} onClick={() => setView("settings")}>
            <i className="fa-solid fa-gear"></i>
            <span>Settings</span>
          </button>
        </nav>

        <div className="mini-panel">
          <span className="mini-label">Online</span>
          <strong>Session Live</strong>

          <div className="user-panel">
            <div className="avatar">A</div>
            <div className="user-meta">
              <strong>Aisha</strong>
              <small>GM • 1482</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search games, players, modes..." />
          </div>

          <div className="top-actions">
            <button className="action-btn" onClick={() => setThemeName(theme === "midnight" ? "sunset" : "midnight")}>
              <i className="fa-solid fa-sparkles"></i> Theme
            </button>

            <button className="action-btn" onClick={() => setSoundEnabled((prev) => !prev)}>
              <i className={`fa-solid ${soundEnabled ? "fa-volume-high" : "fa-volume-xmark"}`}></i>
              {soundEnabled ? "Sound" : "Muted"}
            </button>

            <button className="primary-btn" onClick={() => setAuthOpen(true)}>
              <i className="fa-solid fa-right-to-bracket"></i> Login
            </button>
          </div>
        </header>

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
                      Battle through custom rulesets, hidden identities, giant boards, daily twists, and strategic
                      chaos designed for elite players and creative tacticians.
                    </p>

                    <div className="hero-actions">
                      <button className="cta primary">
                        <i className="fa-solid fa-play"></i> Play Now
                      </button>
                      <button className="cta secondary">
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
                    {modes.slice(0, 5).map((item) => (
                      <button
                        key={item.key}
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
                <div className="panel board-panel">
                  <div className="panel-top">
                    <div className="panel-title">
                      <i className="fa-solid fa-chess-board"></i>
                      <span>Current Match</span>
                      <strong>{mode === "classic" ? "Classic Arena" : `${mode.toUpperCase()} Arena`}</strong>
                    </div>

                    <div className="panel-controls">
                      <button className="mini-btn" onClick={() => setBoardSize("small")}>
                        <i className="fa-solid fa-compress"></i>
                      </button>
                      <button className="mini-btn" onClick={() => setBoardSize("large")}>
                        <i className="fa-solid fa-expand"></i>
                      </button>
                      <button className="mini-btn" onClick={() => setFlipped((prev) => !prev)}>
                        <i className="fa-solid fa-rotate"></i>
                      </button>
                    </div>
                  </div>

                  <div className="board-wrap">
                    <div className={`board ${boardSize}`} role="grid">
                      {boardSquares.map(({ square, piece, row, col, isLight }) => {
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
                            onClick={() => handleSquareClick(square, row, col)}
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

                <aside className="panel list-panel">
                  <div className="panel-head">
                    <h3>Recent Games</h3>
                    <span className="pill"><i className="fa-solid fa-signal"></i> Live</span>
                  </div>

                  <div className="results-list">
                    {recentGames.map((item) => (
                      <div className="result-row" key={item.label}>
                        <div className="result-left">
                          <div className={`result-mark ${item.result === "W" ? "win" : item.result === "L" ? "lose" : "draw"}`}>
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

          {view === "puzzles" && (
            <section className="puzzle-layout">
              <div className="panel large-panel">
                <div className="panel-head">
                  <h3>Daily Puzzles</h3>
                  <span className="pill"><i className="fa-solid fa-medal"></i> 5/7 streak</span>
                </div>

                <div className="puzzle-surface">
                  <div className="puzzle-left">
                    <div className="puzzle-card">
                      <span className="puzzle-tag">Puzzle #482</span>
                      <h2>White to move and mate in 2</h2>
                      <p>Find the tactical setup and coordinate the quiet queen move to finish the attack.</p>
                    </div>

                    <div className="mini-actions">
                      <button className="primary-btn small">Solve</button>
                      <button className="action-btn">Skip</button>
                    </div>
                  </div>

                  <div className="mini-board">
                    <div className="mini-square light">♔</div>
                    <div className="mini-square dark">♙</div>
                    <div className="mini-square light">♖</div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark">♘</div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark">♕</div>

                    <div className="mini-square dark">♙</div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark">♚</div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>

                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light">♛</div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>

                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>

                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>

                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>

                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>

                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                    <div className="mini-square dark"></div>
                    <div className="mini-square light"></div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === "analysis" && (
            <section className="analysis-layout">
              <div className="panel large-panel">
                <div className="panel-head">
                  <h3>Own Analysis</h3>
                  <span className="pill"><i className="fa-solid fa-layer-group"></i> PGN review</span>
                </div>

                <div className="analysis-box">
                  <div className="analysis-split">
                    <div className="analysis-card">
                      <h4>Opening</h4>
                      <p>Italian Game — tempo advantage</p>
                    </div>
                    <div className="analysis-card">
                      <h4>Middle Game</h4>
                      <p>Central tension, queen activity heavy</p>
                    </div>
                    <div className="analysis-card">
                      <h4>Endgame</h4>
                      <p>Rook endgame conversion and king activity</p>
                    </div>
                  </div>

                  <div className="chart-box">
                    <div className="chart-line">
                      <span style={{ height: "14%" }}></span>
                      <span style={{ height: "22%" }}></span>
                      <span style={{ height: "29%" }}></span>
                      <span style={{ height: "47%" }}></span>
                      <span style={{ height: "67%" }}></span>
                      <span style={{ height: "80%" }}></span>
                      <span style={{ height: "76%" }}></span>
                      <span style={{ height: "90%" }}></span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === "profile" && (
            <section className="profile-layout">
              <div className="panel profile-panel">
                <div className="profile-header">
                  <div className="profile-main">
                    <div className="avatar large">A</div>
                    <div className="profile-meta-box">
                      <strong>Aisha Knight</strong>
                      <span>Grandmaster • 1482</span>
                    </div>
                  </div>
                  <button className="primary-btn small">
                    <i className="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                </div>

                <div className="meta-grid">
                  <div className="data-box">
                    <span>Win Rate</span>
                    <strong>71%</strong>
                  </div>
                  <div className="data-box">
                    <span>Games</span>
                    <strong>1,228</strong>
                  </div>
                  <div className="data-box">
                    <span>Streak</span>
                    <strong>17</strong>
                  </div>
                </div>

                <div className="detail-list">
                  <div className="detail-row">
                    <span>Favorite Mode</span>
                    <strong>Hidden Queen</strong>
                  </div>
                  <div className="detail-row">
                    <span>Preferred Board</span>
                    <strong>Large</strong>
                  </div>
                  <div className="detail-row">
                    <span>Sound Profile</span>
                    <strong>Classic Chess</strong>
                  </div>
                </div>
              </div>

              <div className="panel profile-panel secondary">
                <div className="panel-head">
                  <h3>Highlights</h3>
                </div>

                <div className="detail-list">
                  <div className="detail-row">
                    <span>Rank</span>
                    <strong>GM</strong>
                  </div>
                  <div className="detail-row">
                    <span>Trophies</span>
                    <strong>12</strong>
                  </div>
                  <div className="detail-row">
                    <span>Friends</span>
                    <strong>148</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === "friends" && (
            <section className="panel list-panel">
              <div className="panel-head">
                <h3>Friends</h3>
                <span className="pill"><i className="fa-solid fa-plus"></i> Invite</span>
              </div>

              <div className="friends-list">
                {friendList.map((friend) => (
                  <div className="friend-item" key={friend.name}>
                    <div className="friend-main">
                      <div className="avatar small" style={{ background: friend.color }}>{friend.name[0]}</div>
                      <div className="friend-meta">
                        <strong>{friend.name}</strong>
                        <small>{friend.status}</small>
                      </div>
                    </div>
                    <span className="status-pill"><span className="dot"></span> Challenge</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {view === "modes" && (
            <section className="panel list-panel">
              <div className="panel-head">
                <h3>Game Modes</h3>
                <span className="pill"><i className="fa-solid fa-wand-sparkles"></i> All Modes</span>
              </div>

              <div className="mode-list expansive">
                {modes.map((item) => (
                  <button
                    key={item.key}
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
            <section className="settings-grid">
              <div className="panel settings-panel">
                <div className="panel-head">
                  <h3>Appearance</h3>
                </div>

                <div className="settings-list">
                  <div className="setting-row">
                    <label><i className="fa-solid fa-palette"></i> Theme</label>
                    <div className="swatches">
                      {[
                        { name: "midnight", css: "linear-gradient(135deg, #0b1020, #6ea8fe)" },
                        { name: "sunset", css: "linear-gradient(135deg, #1b0f18, #ff7eb6)" },
                        { name: "aurora", css: "linear-gradient(135deg, #071a18, #5eead4)" },
                        { name: "classic", css: "linear-gradient(135deg, #f4f2ee, #3b82f6)" },
                        { name: "chesscom", css: "linear-gradient(135deg, #121926, #0a5ad6)" }
                      ].map((swatch) => (
                        <button
                          key={swatch.name}
                          type="button"
                          className={`swatch ${theme === swatch.name ? "active" : ""}`}
                          style={{ background: swatch.css }}
                          onClick={() => setThemeName(swatch.name as ThemeName)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="setting-row">
                    <label><i className="fa-solid fa-icons"></i> Icon Pack</label>
                    <select className="select" value={iconPack} onChange={(e) => setIconPack(e.target.value as IconPack)}>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                      <option value="neon">Neon</option>
                    </select>
                  </div>

                  <div className="setting-row">
                    <label><i className="fa-solid fa-mobile-screen-button"></i> Board Size</label>
                    <select className="select" value={boardSize} onChange={(e) => setBoardSize(e.target.value as BoardSize)}>
                      <option value="small">Small</option>
                      <option value="normal">Normal</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="panel settings-panel">
                <div className="panel-head">
                  <h3>Audio & Motion</h3>
                </div>

                <div className="settings-list">
                  <div className="setting-row">
                    <label><i className="fa-solid fa-volume-high"></i> Sound</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={soundLevel}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setSoundLevel(value);
                        setSoundEnabled(value > 0);
                      }}
                    />
                  </div>

                  <div className="setting-row">
                    <label><i className="fa-solid fa-wand-sparkles"></i> Motion</label>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="switch-knob"></span>
                    </label>
                  </div>

                  <div className="setting-row">
                    <label><i className="fa-solid fa-shield-heart"></i> Reduced Motion</label>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="switch-knob"></span>
                    </label>
                  </div>

                  <div className="setting-row">
                    <label><i className="fa-solid fa-brain"></i> AI Coach</label>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="switch-knob"></span>
                    </label>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
