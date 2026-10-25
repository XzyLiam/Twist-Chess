import { useEffect, useMemo, useState } from "react";
import { Chess, Square } from "chess.js";

type ThemeName = "midnight" | "sunset" | "aurora" | "classic";
type ViewName = "home" | "profile" | "friends" | "games" | "modes" | "settings";
type ModeName = "classic" | "rook" | "hiddenqueen" | "bigboard" | "smallboard" | "mirror";
type BoardSize = "small" | "normal" | "large";
type IconPack = "classic" | "minimal" | "neon";

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

  const playableBoard = useMemo(() => {
    const board = game.board();
    const rowOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const colOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    const renderSquares = [];
    for (const row of rowOrder) {
      for (const col of colOrder) {
        const piece = board[row][col];
        const square = getSquareName(row, col);
        const displayPiece =
          piece && mode === "rook" && (piece.type === "n" || piece.type === "b")
            ? { ...piece, type: "r" }
            : piece;

        renderSquares.push({
          square,
          row,
          col,
          piece: displayPiece,
          isLight: (row + col) % 2 === 0
        });
      }
    }
    return renderSquares;
  }, [flipped, game, mode]);

  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare, verbose: true }).map((move) => move.to);
  }, [game, selectedSquare]);

  const currentTurn = game.turn() === "w" ? "White" : "Black";

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

    setTimeout(() => context.close(), duration * 1000 + 150);
  }

  function playSound(type: "move" | "capture" | "click" | "win") {
    if (!soundEnabled) return;
    if (type === "click") {
      playTone(520, 0.07, "triangle", 0.02);
    }
    if (type === "move") {
      playTone(700, 0.08, "sine", 0.025);
      setTimeout(() => playTone(920, 0.09, "triangle", 0.02), 50);
    }
    if (type === "capture") {
      playTone(220, 0.15, "square", 0.045);
    }
    if (type === "win") {
      playTone(523, 0.18, "triangle", 0.04);
      setTimeout(() => playTone(659, 0.18, "triangle", 0.04), 150);
      setTimeout(() => playTone(784, 0.22, "triangle", 0.04), 300);
    }
  }

  function handleSquareClick(square: Square, row: number, col: number) {
    const board = game.board();
    const piece = board[row][col];
    const isHiddenQueenSelection =
      mode === "hiddenqueen" &&
      game.history().length === 0 &&
      piece &&
      piece.type === "p" &&
      piece.color === game.turn();

    if (isHiddenQueenSelection && !secretQueen) {
      setSecretQueen(square);
      playSound("click");
      return;
    }

    if (!selectedSquare) {
      if (!piece || piece.color !== game.turn()) return;
      const moves = game.moves({ square, verbose: true });
      if (!moves.length) return;
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

      if (nextGame.isCheckmate()) {
        playSound("win");
      }

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

  function resetBoard() {
    setGame(new Chess());
    setSelectedSquare(null);
    setSecretQueen(null);
    setFlipped(false);
  }

  function applyMode(nextMode: ModeName) {
    setMode(nextMode);
    setTimeout(() => resetBoard(), 50);
  }

  function applyTheme(nextTheme: ThemeName) {
    setTheme(nextTheme);
  }

  useEffect(() => {
    if (mode === "bigboard") setBoardSize("large");
    if (mode === "smallboard") setBoardSize("small");
    if (mode === "classic" || mode === "rook" || mode === "hiddenqueen" || mode === "mirror") {
      setBoardSize("large");
    }
  }, [mode]);

  return (
    <div className={`app ${theme}`}>
      <div className="sidebar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div className="brand-copy">
            <strong>TwistChess</strong>
            <span>ARCADE</span>
          </div>
        </div>

        <nav className="nav">
          <button className={`nav-item ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>
            <i className="fa-solid fa-house"></i>
            <span>Home</span>
          </button>

          <button className={`nav-item ${view === "profile" ? "active" : ""}`} onClick={() => setView("profile")}>
            <i className="fa-solid fa-user"></i>
            <span>Profile</span>
          </button>

          <button className={`nav-item ${view === "friends" ? "active" : ""}`} onClick={() => setView("friends")}>
            <i className="fa-solid fa-user-group"></i>
            <span>Friends</span>
          </button>

          <button className={`nav-item ${view === "games" ? "active" : ""}`} onClick={() => setView("games")}>
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span>Recent</span>
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
          <strong>Session live</strong>

          <div className="user-panel">
            <div className="avatar">A</div>
            <div className="user-meta">
              <strong>Aisha</strong>
              <small>GM • 1482</small>
            </div>
          </div>
        </div>
      </div>

      <main className="main">
        <header className="topbar">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search games, players, modes..." />
          </div>

          <div className="top-actions">
            <button className="action-btn" onClick={() => setTheme(theme === "midnight" ? "sunset" : "midnight")}>
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
                      Play custom variants like ROOK mode, hidden queens, mirrored boards, big board chaos,
                      and fast tactical duels built for serious players.
                    </p>

                    <div className="hero-actions">
                      <button className="cta primary" onClick={() => setView("home")}>
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
                    {[
                      { key: "classic", label: "Classic", subtitle: "Original rules", icon: "fa-chess" },
                      { key: "rook", label: "ROOK", subtitle: "Knights & bishops become rooks", icon: "fa-chess-rook" },
                      { key: "hiddenqueen", label: "Hidden Queen", subtitle: "Secret pawn queen chosen at start", icon: "fa-user-secret" },
                      { key: "bigboard", label: "Big Board", subtitle: "Expanded battlefield", icon: "fa-expand" },
                      { key: "smallboard", label: "Small Board", subtitle: "Compact chaotic duels", icon: "fa-compress" }
                    ].map((item) => (
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
                <div className="board-panel panel">
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
                    <div className={`board ${boardSize}`} role="grid" aria-label="Chess board">
                      {playableBoard.map(({ square, piece, row, col, isLight }) => {
                        const isSelected = selectedSquare === square;
                        const isLegal = legalMoves.includes(square);
                        const isSecret = secretQueen === square;

                        return (
                          <button
                            key={square}
                            className={[
                              "square",
                              isLight ? "light" : "dark",
                              isSelected ? "selected" : "",
                              isLegal ? (piece ? "capture" : "movable") : ""
                            ].join(" ")}
                            onClick={() => handleSquareClick(square, row, col)}
                            type="button"
                          >
                            {piece && (
                              <span
                                className={`piece ${piece.color === "w" ? "white" : "black"} ${
                                  // hidden queen reveal logic
                                  mode === "hiddenqueen" && secretQueen === square && piece.type === "p"
                                    ? "secret-queen"
                                    : ""
                                }`}
                              >
                                {(() => {
                                  const visiblePiece = piece;

                                  if (
                                    mode === "hiddenqueen" &&
                                    secretQueen === square &&
                                    piece.type === "p" &&
                                    game.history().length === 0
                                  ) {
                                    return piece.color === "w" ? "♕" : "♛";
                                  }

                                  const type = visiblePiece.type;
                                  return PIECE_SYMBOLS[visiblePiece.color][type];
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
                          <span className="tiny-badge"><i className="fa-solid fa-clock"></i> 15:00</span>
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
                            <strong>{secretQueen ? secretQueen.toUpperCase() : "None"}</strong>
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
                    <div className="result-row">
                      <div className="result-left">
                        <div className="result-mark win">W</div>
                        <div className="result-copy">
                          <strong>Quick Arena</strong>
                          <span>vs Lumen • +14 rating</span>
                        </div>
                      </div>
                      <div className="tag">1-0</div>
                    </div>

                    <div className="result-row">
                      <div className="result-left">
                        <div className="result-mark lose">L</div>
                        <div className="result-copy">
                          <strong>ROOK Duel</strong>
                          <span>vs Nova • -7 rating</span>
                        </div>
                      </div>
                      <div className="tag">0-1</div>
                    </div>

                    <div className="result-row">
                      <div className="result-left">
                        <div className="result-mark win">W</div>
                        <div className="result-copy">
                          <strong>Hidden Queen</strong>
                          <span>vs Izzy • +9 rating</span>
                        </div>
                      </div>
                      <div className="tag">1-0</div>
                    </div>

                    <div className="result-row">
                      <div className="result-left">
                        <div className="result-mark draw">D</div>
                        <div className="result-copy">
                          <strong>Big Board</strong>
                          <span>vs Kade • draw</span>
                        </div>
                      </div>
                      <div className="tag">½-½</div>
                    </div>
                  </div>
                </aside>
              </section>
            </>
          )}

          {view === "profile" && (
            <section className="profile-layout">
              <div className="panel profile-panel">
                <div className="profile-header">
                  <div className="profile-main">
                    <div className="avatar large">A</div>
                    <div>
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
                {[["Lumen", "Online • Blitz", "#6ea8fe"], ["Nova", "Online • Classic", "#7cf5d6"], ["Izzy", "Idle • Hidden Queen", "#ffb454"], ["Kade", "In Match • Large Board", "#9be9a8"]].map(([name, status, color]) => (
                  <div className="friend-item" key={name}>
                    <div className="friend-main">
                      <div className="avatar small" style={{ background: `linear-gradient(135deg, ${color}, #ffffff)` }}>{name[0]}</div>
                      <div className="friend-meta">
                        <strong>{name}</strong>
                        <small>{status}</small>
                      </div>
                    </div>
                    <span className="status-pill"><span className="dot"></span> Challenge</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {view === "games" && (
            <section className="panel list-panel">
              <div className="panel-head">
                <h3>Recent Games</h3>
                <span className="pill"><i className="fa-solid fa-chart-simple"></i> History</span>
              </div>

              <div className="results-list">
                <div className="result-row">
                  <div className="result-left">
                    <div className="result-mark win">W</div>
                    <div className="result-copy">
                      <strong>Classic Arena</strong>
                      <span>May 18 • 26 moves • 1-0</span>
                    </div>
                  </div>
                  <div className="tag">Review</div>
                </div>

                <div className="result-row">
                  <div className="result-left">
                    <div className="result-mark lose">L</div>
                    <div className="result-copy">
                      <strong>ROOK Surprise</strong>
                      <span>May 16 • 37 moves • 0-1</span>
                    </div>
                  </div>
                  <div className="tag">Replay</div>
                </div>

                <div className="result-row">
                  <div className="result-left">
                    <div className="result-mark win">W</div>
                    <div className="result-copy">
                      <strong>Large Board Royal</strong>
                      <span>May 13 • 42 moves • 1-0</span>
                    </div>
                  </div>
                  <div className="tag">Review</div>
                </div>
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
                {[
                  { key: "classic", label: "Classic", subtitle: "Traditional chess with pure rules", icon: "fa-chess" },
                  { key: "rook", label: "ROOK", subtitle: "Knights and bishops become rooks", icon: "fa-chess-rook" },
                  { key: "hiddenqueen", label: "Hidden Queen", subtitle: "Choose your secret queen at the start", icon: "fa-user-secret" },
                  { key: "bigboard", label: "Big Board", subtitle: "Larger tactical variations", icon: "fa-expand" },
                  { key: "smallboard", label: "Small Board", subtitle: "Tighter rapid-fire games", icon: "fa-compress" },
                  { key: "mirror", label: "Mirror", subtitle: "Board flips and mirrored tactics", icon: "fa-arrows-left-right" }
                ].map((item) => (
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
                    <label>
                      <i className="fa-solid fa-palette"></i> Theme
                    </label>
                    <div className="swatches">
                      {[
                        { name: "midnight", color: "linear-gradient(135deg, #0b1020, #6ea8fe)" },
                        { name: "sunset", color: "linear-gradient(135deg, #1b0f18, #ff7eb6)" },
                        { name: "aurora", color: "linear-gradient(135deg, #071a18, #5eead4)" },
                        { name: "classic", color: "linear-gradient(135deg, #f4f2ee, #3b82f6)" }
                      ].map((swatch) => (
                        <button
                          key={swatch.name}
                          className={`swatch ${theme === swatch.name ? "active" : ""}`}
                          onClick={() => applyTheme(swatch.name as ThemeName)}
                          style={{ background: swatch.color }}
                          aria-label={swatch.name}
                          type="button"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="setting-row">
                    <label>
                      <i className="fa-solid fa-icons"></i> Icon Pack
                    </label>
                    <select
                      value={iconPack}
                      onChange={(e) => setIconPack(e.target.value as IconPack)}
                      className="select"
                    >
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                      <option value="neon">Neon</option>
                    </select>
                  </div>

                  <div className="setting-row">
                    <label>
                      <i className="fa-solid fa-mobile-screen-button"></i> Board Size
                    </label>
                    <select
                      value={boardSize}
                      onChange={(e) => setBoardSize(e.target.value as BoardSize)}
                      className="select"
                    >
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
                    <label>
                      <i className="fa-solid fa-volume-high"></i> Sound
                    </label>
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
                    <label>
                      <i className="fa-solid fa-wand-sparkles"></i> Motion
                    </label>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="switch-knob"></span>
                    </label>
                  </div>

                  <div className="setting-row">
                    <label>
                      <i className="fa-solid fa-shield-heart"></i> Reduced Motion
                    </label>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="switch-knob"></span>
                    </label>
                  </div>

                  <div className="setting-row">
                    <label>
                      <i className="fa-solid fa-brain"></i> AI Coach
                    </label>
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

    {authOpen && (
      <div className="auth-overlay" onClick={() => setAuthOpen(false)}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <div className="auth-header">
            <h3>Welcome back</h3>
            <button className="close-btn" onClick={() => setAuthOpen(false)} type="button">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="auth-form">
            <div className="field">
              <label>Email</label>
              <input type="email" defaultValue="aisha@twistchess.app" />
            </div>

            <div className="field">
              <label>Password</label>
              <input type="password" defaultValue="••••••••" />
            </div>

            <div className="auth-row">
              <span className="switch-text">New here? <strong>Sign up</strong></span>
              <button className="primary-btn small" type="button">
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  );
}

export default App;
