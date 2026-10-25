/* =========================================================
   TWISTCHESS 2.0
   Main JavaScript application
   Features:
   - Login / signup demo
   - Dashboard navigation
   - Chess game with legal move validation
   - Click-to-move and drag-and-drop
   - Move history, captures, undo, reset
   - Game timers and game modes
   - Themes and sound preferences
   - Profile, friends, and game history
   - Local storage persistence
   ========================================================= */

(() => {
  "use strict";

  /* -------------------- CONFIGURATION -------------------- */

  const CONFIG = {
    storageKey: "twistchess_v2",
    pieceImageBase:
      "https://chessboardjs.com/img/chesspieces/wikipedia/",
    chessLibrary:
      "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js",
    defaultTheme: "midnight",
    defaultMode: "rapid",
    defaultTime: 600,
    soundVolume: 0.35,
    version: "2.0.0"
  };

  const PIECE_CODES = {
    wk: "wK",
    wq: "wQ",
    wr: "wR",
    wb: "wB",
    wn: "wN",
    wp: "wP",
    bk: "bK",
    bq: "bQ",
    br: "bR",
    bb: "bB",
    bn: "bN",
    bp: "bP"
  };

  const PIECE_SYMBOLS = {
    wK: "♔",
    wQ: "♕",
    wR: "♖",
    wB: "♗",
    wN: "♘",
    wP: "♙",
    bK: "♚",
    bQ: "♛",
    bR: "♜",
    bB: "♝",
    bN: "♞",
    bP: "♟"
  };

  const THEMES = [
    "midnight",
    "classic",
    "forest",
    "ocean",
    "purple",
    "rose",
    "light"
  ];

  const MODES = {
    bullet: { label: "Bullet", seconds: 60 },
    blitz: { label: "Blitz", seconds: 180 },
    rapid: { label: "Rapid", seconds: 600 },
    classical: { label: "Classical", seconds: 1800 },
    untimed: { label: "Untimed", seconds: 0 },
    practice: { label: "Practice", seconds: 0 }
  };

  /* -------------------- APPLICATION STATE -------------------- */

  const state = {
    chess: null,
    selectedSquare: null,
    legalTargets: [],
    currentScreen: "dashboard",
    currentMode: CONFIG.defaultMode,
    boardFlipped: false,
    gameStarted: false,
    gameOver: false,
    gameResult: null,
    timerInterval: null,
    lastTick: null,
    soundEnabled: true,
    soundVolume: CONFIG.soundVolume,
    boardTheme: "green",
    moveSoundContext: null,
    selectedFriend: null,
    draggedFrom: null,
    promotionPending: null,
    libraryReady: false,
    libraryLoading: false
  };

  const defaultData = {
    account: null,
    profile: {
      username: "Player",
      displayName: "Chess Player",
      avatar: "",
      bio: "Ready for the next game.",
      country: "",
      rating: 1200
    },
    preferences: {
      theme: CONFIG.defaultTheme,
      boardTheme: "green",
      pieceStyle: "classic",
      soundEnabled: true,
      soundVolume: CONFIG.soundVolume,
      coordinates: true,
      showLegalMoves: true,
      confirmResign: true,
      autoQueen: true
    },
    stats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      rating: 1200
    },
    friends: [],
    history: [],
    currentGame: null
  };

  let appData = loadData();

  /* -------------------- GENERAL HELPERS -------------------- */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  function byId(id) {
    return document.getElementById(id);
  }

  function firstExisting(selectors) {
    for (const selector of selectors) {
      const element = $(selector);
      if (element) return element;
    }

    return null;
  }

  function allExisting(selectors) {
    const found = [];

    selectors.forEach((selector) => {
      $$(selector).forEach((element) => {
        if (!found.includes(element)) found.push(element);
      });
    });

    return found;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return replacements[character];
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomId() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function formatDate(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function formatDuration(seconds) {
    const total = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(total / 60);
    const remainder = total % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainder
    ).padStart(2, "0")}`;
  }

  function setText(selectors, value) {
    allExisting(selectors).forEach((element) => {
      element.textContent = value;
    });
  }

  function setVisible(element, visible) {
    if (!element) return;

    element.hidden = !visible;
    element.setAttribute("aria-hidden", String(!visible));
  }

  function announce(message) {
    let toast = firstExisting([
      "#toast",
      "#toastContainer",
      ".toast-container",
      ".toast"
    ]);

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "twistchess-toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");

      Object.assign(toast.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: "99999",
        maxWidth: "min(360px, calc(100vw - 40px))",
        padding: "12px 16px",
        borderRadius: "12px",
        background: "#202738",
        color: "#fff",
        boxShadow: "0 8px 30px rgba(0,0,0,.25)",
        fontSize: "14px",
        opacity: "0",
        transform: "translateY(8px)",
        transition: "opacity .2s ease, transform .2s ease",
        pointerEvents: "none"
      });

      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");

    if (toast.id === "twistchess-toast") {
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
      });
    }

    clearTimeout(toast._hideTimeout);

    toast._hideTimeout = setTimeout(() => {
      if (toast.id === "twistchess-toast") {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
      } else {
        toast.classList.remove("is-visible");
      }
    }, 2800);
  }

  /* -------------------- LOCAL STORAGE -------------------- */

  function loadData() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);

      if (!raw) return structuredCloneSafe(defaultData);

      const saved = JSON.parse(raw);

      return {
        ...structuredCloneSafe(defaultData),
        ...saved,
        profile: {
          ...defaultData.profile,
          ...(saved.profile || {})
        },
        preferences: {
          ...defaultData.preferences,
          ...(saved.preferences || {})
        },
        stats: {
          ...defaultData.stats,
          ...(saved.stats || {})
        },
        friends: Array.isArray(saved.friends)
          ? saved.friends
          : [],
        history: Array.isArray(saved.history)
          ? saved.history
          : []
      };
    } catch (error) {
      console.warn("TwistChess: Could not load saved data.", error);
      return structuredCloneSafe(defaultData);
    }
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function saveData() {
    try {
      localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(appData)
      );
    } catch (error) {
      console.warn("TwistChess: Could not save data.", error);
      announce("Your browser could not save the latest changes.");
    }
  }

  /* -------------------- CHESS LIBRARY -------------------- */

  function loadChessLibrary() {
    if (typeof window.Chess === "function") {
      state.libraryReady = true;
      initializeChess();
      return Promise.resolve(true);
    }

    if (state.libraryLoading) {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (state.libraryReady) {
            clearInterval(check);
            resolve(true);
          } else if (!state.libraryLoading) {
            clearInterval(check);
            resolve(false);
          }
        }, 100);
      });
    }

    state.libraryLoading = true;

    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src = CONFIG.chessLibrary;
      script.async = true;

      script.onload = () => {
        state.libraryLoading = false;
        state.libraryReady = typeof window.Chess === "function";

        if (state.libraryReady) {
          initializeChess();
          resolve(true);
        } else {
          showChessUnavailable();
          resolve(false);
        }
      };

      script.onerror = () => {
        state.libraryLoading = false;
        showChessUnavailable();
        resolve(false);
      };

      document.head.appendChild(script);
    });
  }

  function showChessUnavailable() {
    console.error(
      "TwistChess: chess.js failed to load. Check your internet connection or include chess.js in index.html."
    );

    const board = getBoardElement();

    if (board && !state.chess) {
      board.innerHTML = `
        <div class="chess-error" role="alert">
          <strong>Chess engine unavailable</strong>
          <p>Connect to the internet or load chess.js locally, then reload.</p>
          <button type="button" data-action="retry-chess">
            Retry
          </button>
        </div>
      `;
    }
  }

  function initializeChess() {
    if (typeof window.Chess !== "function") return;

    try {
      state.chess = new window.Chess();
      state.selectedSquare = null;
      state.legalTargets = [];
      state.gameOver = false;
      state.gameStarted = false;
      state.gameResult = null;

      initializeTimers();
      renderBoard();
      renderMoveHistory();
      updateGameStatus();
      updateGameControls();
    } catch (error) {
      console.error("TwistChess: Chess initialization failed.", error);
      announce("Could not start a chess game.");
    }
  }

  /* -------------------- BOARD ELEMENTS -------------------- */

  function getBoardElement() {
    return firstExisting([
      "#chessboard",
      "#board",
      ".chessboard",
      ".chess-board",
      ".board",
      "[data-chessboard]"
    ]);
  }

  function getMoveListElement() {
    return firstExisting([
      "#moveHistory",
      "#moveList",
      ".move-history",
      ".move-list",
      "[data-move-history]"
    ]);
  }

  function squareName(file, rank) {
    return "abcdefgh"[file] + String(rank + 1);
  }

  function getPieceAt(square) {
    if (!state.chess) return null;

    try {
      return state.chess.get(square);
    } catch {
      return null;
    }
  }

  function isPlayersPiece(piece) {
    return piece && piece.color === state.chess.turn();
  }

  function getPieceCode(piece) {
    if (!piece) return null;

    const color = piece.color === "w" ? "w" : "b";
    return color + piece.type.toUpperCase();
  }

  function createPieceElement(piece, square) {
    const code = getPieceCode(piece);
    const pieceElement = document.createElement("div");

    pieceElement.className =
      `piece chess-piece piece-${code} ` +
      `piece-${piece.color === "w" ? "white" : "black"}`;

    pieceElement.dataset.piece = code;
    pieceElement.dataset.square = square;
    pieceElement.draggable = !state.gameOver;

    pieceElement.setAttribute(
      "aria-label",
      `${piece.color === "w" ? "White" : "Black"} ${piece.type}`
    );

    const image = document.createElement("img");

    image.src = CONFIG.pieceImageBase + code + ".png";
    image.alt = "";
    image.draggable = false;
    image.className = "piece-image";

    image.onerror = () => {
      image.remove();

      const symbol = document.createElement("span");
      symbol.className = "piece-symbol";
      symbol.textContent = PIECE_SYMBOLS[code] || "?";
      pieceElement.appendChild(symbol);
    };

    pieceElement.appendChild(image);

    return pieceElement;
  }

  function createSquare(file, rank) {
    const name = squareName(file, rank);
    const piece = getPieceAt(name);
    const square = document.createElement("div");

    const isLight = (file + rank) % 2 === 1;

    square.className =
      "square chess-square " +
      (isLight ? "light-square" : "dark-square");

    square.dataset.square = name;
    square.setAttribute("role", "button");
    square.setAttribute("tabindex", "0");
    square.setAttribute("aria-label", name);

    if (piece) {
      square.classList.add("has-piece");
      square.appendChild(createPieceElement(piece, name));
    }

    if (state.selectedSquare === name) {
      square.classList.add("selected", "is-selected");
    }

    if (state.legalTargets.includes(name)) {
      square.classList.add("legal-target", "possible-move");

      if (piece) {
        square.classList.add("capture-target");
      }
    }

    if (
      state.chess &&
      typeof state.chess.isCheck === "function" &&
      piece &&
      piece.type === "k" &&
      piece.color === state.chess.turn() &&
      state.chess.isCheck()
    ) {
      square.classList.add("king-in-check");
    }

    if (appData.preferences.coordinates) {
      if (file === 0) {
        const rankLabel = document.createElement("span");
        rankLabel.className = "board-coordinate rank-coordinate";
        rankLabel.textContent = String(rank + 1);
        square.appendChild(rankLabel);
      }

      if (rank === 0) {
        const fileLabel = document.createElement("span");
        fileLabel.className = "board-coordinate file-coordinate";
        fileLabel.textContent = "abcdefgh"[file];
        square.appendChild(fileLabel);
      }
    }

    return square;
  }

  function renderBoard() {
    const board = getBoardElement();

    if (!board || !state.chess) return;

    board.innerHTML = "";
    board.classList.add("chessboard");
    board.setAttribute("role", "grid");
    board.setAttribute("aria-label", "Chess board");

    const ranks = state.boardFlipped
      ? [0, 1, 2, 3, 4, 5, 6, 7]
      : [7, 6, 5, 4, 3, 2, 1, 0];

    const files = state.boardFlipped
      ? [7, 6, 5, 4, 3, 2, 1, 0]
      : [0, 1, 2, 3, 4, 5, 6, 7];

    ranks.forEach((rank) => {
      files.forEach((file) => {
        board.appendChild(createSquare(file, rank));
      });
    });

    board.classList.toggle("board-flipped", state.boardFlipped);
    board.dataset.boardTheme = appData.preferences.boardTheme;
    board.dataset.theme = appData.preferences.boardTheme;

    updateCapturedPieces();
  }

  /* -------------------- MOVE SELECTION -------------------- */

  function getLegalMoves(square) {
    if (!state.chess) return [];

    try {
      return state.chess.moves({
        square,
        verbose: true
      });
    } catch {
      return [];
    }
  }

  function selectSquare(square) {
    if (!state.chess || state.gameOver) return;

    const piece = getPieceAt(square);

    if (state.selectedSquare === square) {
      clearSelection();
      return;
    }

    if (state.selectedSquare) {
      const existingTarget = state.legalTargets.includes(square);

      if (existingTarget) {
        attemptMove(state.selectedSquare, square);
        return;
      }
    }

    if (isPlayersPiece(piece)) {
      state.selectedSquare = square;

      state.legalTargets = getLegalMoves(square).map(
        (move) => move.to
      );

      renderBoard();
      return;
    }

    clearSelection();
  }

  function clearSelection() {
    state.selectedSquare = null;
    state.legalTargets = [];
    renderBoard();
  }

  function attemptMove(from, to, promotion = "q") {
    if (!state.chess || state.gameOver) return false;

    const movingPiece = getPieceAt(from);

    if (!movingPiece) return false;

    const isPromotion =
      movingPiece.type === "p" &&
      ((movingPiece.color === "w" && to.endsWith("8")) ||
        (movingPiece.color === "b" && to.endsWith("1")));

    if (isPromotion && !promotion) {
      state.promotionPending = { from, to };
      showPromotionDialog();
      return false;
    }

    const previousTurn = state.chess.turn();
    let move;

    try {
      move = state.chess.move({
        from,
        to,
        promotion: promotion || "q"
      });
    } catch {
      move = null;
    }

    if (!move) {
      announce("That move is not legal.");
      return false;
    }

    state.selectedSquare = null;
    state.legalTargets = [];

    if (!state.gameStarted) {
      state.gameStarted = true;
      state.lastTick = Date.now();
      startTimerLoop();
    }

    playSound(move.captured ? "capture" : "move");

    state.currentMove = move;

    renderBoard();
    renderMoveHistory();
    updateGameStatus();
    updateCapturedPieces();
    updateGameControls();
    updateMoveIndicators(move);

    if (state.chess.isGameOver()) {
      finishGame();
    } else {
      updateTurnIndicator(previousTurn);
    }

    return true;
  }

  function updateMoveIndicators(move) {
    if (!move) return;

    const board = getBoardElement();
    if (!board) return;

    $$(".last-move, .last-move-from, .last-move-to", board)
      .forEach((element) => {
        element.classList.remove(
          "last-move",
          "last-move-from",
          "last-move-to"
        );
      });

    const fromSquare = $(
      `[data-square="${move.from}"]`,
      board
    );

    const toSquare = $(
      `[data-square="${move.to}"]`,
      board
    );

    fromSquare?.classList.add("last-move", "last-move-from");
    toSquare?.classList.add("last-move", "last-move-to");
  }

  /* -------------------- PROMOTION -------------------- */

  function showPromotionDialog() {
    const dialog = firstExisting([
      "#promotionDialog",
      ".promotion-dialog",
      "[data-promotion-dialog]"
    ]);

    if (!dialog) {
      const pending = state.promotionPending;

      if (pending) {
        attemptMove(pending.from, pending.to, "q");
        state.promotionPending = null;
      }

      return;
    }

    setVisible(dialog, true);
    dialog.classList.add("is-open");
  }

  function choosePromotion(pieceType) {
    const pending = state.promotionPending;
    if (!pending) return;

    state.promotionPending = null;

    const dialog = firstExisting([
      "#promotionDialog",
      ".promotion-dialog",
      "[data-promotion-dialog]"
    ]);

    if (dialog) {
      setVisible(dialog, false);
      dialog.classList.remove("is-open");
    }

    attemptMove(pending.from, pending.to, pieceType);
  }

  /* -------------------- MOVE HISTORY -------------------- */

  function renderMoveHistory() {
    const list = getMoveListElement();
    if (!list || !state.chess) return;

    let history = [];

    try {
      history = state.chess.history();
    } catch {
      history = [];
    }

    list.innerHTML = "";

    if (!history.length) {
      const empty = document.createElement("div");
      empty.className = "empty-moves empty-state";
      empty.textContent = "Your moves will appear here.";
      list.appendChild(empty);
      return;
    }

    const table = document.createElement("div");
    table.className = "move-history-table";

    for (let index = 0; index < history.length; index += 2) {
      const row = document.createElement("div");
      row.className = "move-row";

      const number = document.createElement("span");
      number.className = "move-number";
      number.textContent = `${Math.floor(index / 2) + 1}.`;

      const whiteMove = document.createElement("span");
      whiteMove.className = "move-white";
      whiteMove.textContent = history[index];

      const blackMove = document.createElement("span");
      blackMove.className = "move-black";
      blackMove.textContent = history[index + 1] || "…";

      row.append(number, whiteMove, blackMove);
      table.appendChild(row);
    }

    list.appendChild(table);

    const lastMove = list.querySelector(".move-row:last-child");

    if (lastMove) {
      lastMove.classList.add("current-move");
    }

    list.scrollTop = list.scrollHeight;
  }

  /* -------------------- CAPTURED PIECES -------------------- */

  function updateCapturedPieces() {
    if (!state.chess) return;

    let history = [];

    try {
      history = state.chess.history({ verbose: true });
    } catch {
      return;
    }

    const capturedWhite = [];
    const capturedBlack = [];

    history.forEach((move) => {
      if (!move.captured) return;

      const capturedCode =
        (move.color === "w" ? "b" : "w") +
        move.captured.toUpperCase();

      if (move.color === "w") {
        capturedBlack.push(capturedCode);
      } else {
        capturedWhite.push(capturedCode);
      }
    });

    renderCapturedGroup(
      ["#capturedWhite", ".captured-white", "[data-captured='white']"],
      capturedWhite
    );

    renderCapturedGroup(
      ["#capturedBlack", ".captured-black", "[data-captured='black']"],
      capturedBlack
    );
  }

  function renderCapturedGroup(selectors, pieces) {
    const container = firstExisting(selectors);
    if (!container) return;

    container.innerHTML = "";

    pieces.forEach((code) => {
      const image = document.createElement("img");

      image.src = CONFIG.pieceImageBase + code + ".png";
      image.alt = code;
      image.className = "captured-piece";
      image.loading = "lazy";

      image.onerror = () => {
        image.remove();

        const symbol = document.createElement("span");
        symbol.className = "captured-piece-symbol";
        symbol.textContent = PIECE_SYMBOLS[code] || "?";
        container.appendChild(symbol);
      };

      container.appendChild(image);
    });
  }

  /* -------------------- GAME STATUS -------------------- */

  function updateGameStatus() {
    if (!state.chess) return;

    const turn = state.chess.turn() === "w" ? "White" : "Black";
    let status = `${turn} to move`;

    if (state.chess.isCheck()) {
      status = `${turn} is in check`;
    }

    if (state.chess.isCheckmate()) {
      status = `Checkmate — ${turn === "White" ? "Black" : "White"} wins`;
    } else if (state.chess.isDraw()) {
      status = "Draw";
    } else if (state.chess.isStalemate()) {
      status = "Stalemate";
    }

    setText(
      [
        "#gameStatus",
        "#turnIndicator",
        ".game-status",
        ".turn-indicator",
        "[data-game-status]"
      ],
      status
    );

    setText(
      ["#activePlayer", ".active-player"],
      turn
    );

    document.body.dataset.turn = turn.toLowerCase();
  }

  function updateTurnIndicator(previousTurn) {
    const currentTurn = state.chess.turn();

    if (previousTurn !== currentTurn) {
      const indicator = firstExisting([
        "#turnIndicator",
        ".turn-indicator",
        ".game-status"
      ]);

      if (indicator) {
        indicator.classList.remove("turn-change");
        void indicator.offsetWidth;
        indicator.classList.add("turn-change");
      }
    }
  }

  function updateGameControls() {
    const disabled = !state.chess || state.gameOver;

    allExisting([
      "#undoMove",
      "[data-action='undo']",
      ".undo-move"
    ]).forEach((element) => {
      element.disabled =
        !state.chess || state.chess.history().length === 0;
    });

    allExisting([
      "#resignGame",
      "[data-action='resign']",
      ".resign-game"
    ]).forEach((element) => {
      element.disabled = disabled;
    });
  }

  /* -------------------- GAME TIMERS -------------------- */

  function initializeTimers() {
    stopTimerLoop();

    const mode = MODES[state.currentMode] || MODES.rapid;

    appData.currentGame = {
      ...(appData.currentGame || {}),
      mode: state.currentMode,
      whiteTime: mode.seconds,
      blackTime: mode.seconds
    };

    updateTimerDisplay();
  }

  function startTimerLoop() {
    if (state.timerInterval || state.gameOver) return;

    state.lastTick = Date.now();

    state.timerInterval = setInterval(() => {
      if (!state.gameStarted || state.gameOver || !state.chess) {
        return;
      }

      const now = Date.now();
      const elapsed = Math.max(
        0,
        Math.floor((now - state.lastTick) / 1000)
      );

      if (elapsed < 1) return;

      state.lastTick = now;

      const mode = MODES[state.currentMode] || MODES.rapid;

      if (mode.seconds === 0) return;

      const key =
        state.chess.turn() === "w" ? "whiteTime" : "blackTime";

      appData.currentGame[key] = Math.max(
        0,
        (appData.currentGame[key] ?? mode.seconds) - elapsed
      );

      updateTimerDisplay();

      if (appData.currentGame[key] <= 0) {
        finishOnTimeOut(state.chess.turn());
      }
    }, 250);
  }

  function stopTimerLoop() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    const game = appData.currentGame || {};
    const mode = MODES[state.currentMode] || MODES.rapid;

    const whiteTime =
      mode.seconds === 0 ? null : game.whiteTime ?? mode.seconds;

    const blackTime =
      mode.seconds === 0 ? null : game.blackTime ?? mode.seconds;

    setText(
      ["#whiteTimer", ".white-timer", "[data-timer='white']"],
      whiteTime === null ? "∞" : formatDuration(whiteTime)
    );

    setText(
      ["#blackTimer", ".black-timer", "[data-timer='black']"],
      blackTime === null ? "∞" : formatDuration(blackTime)
    );

    allExisting(["#whiteTimer", ".white-timer"])
      .forEach((element) => {
        element.classList.toggle(
          "timer-low",
          whiteTime !== null && whiteTime <= 10
        );
      });

    allExisting(["#blackTimer", ".black-timer"])
      .forEach((element) => {
        element.classList.toggle(
          "timer-low",
          blackTime !== null && blackTime <= 10
        );
      });
  }

  function finishOnTimeOut(flaggedColor) {
    if (state.gameOver) return;

    const winner = flaggedColor === "w" ? "Black" : "White";

    finishGame({
      result: flaggedColor === "w" ? "0-1" : "1-0",
      message: `${winner} wins on time`
    });
  }

  /* -------------------- GAME COMPLETION -------------------- */

  function finishGame(customResult = null) {
    if (!state.chess || state.gameOver) return;

    state.gameOver = true;
    state.gameStarted = false;
    stopTimerLoop();

    let result = customResult?.result || "*";
    let message = customResult?.message || "Game over";

    if (!customResult) {
      if (state.chess.isCheckmate()) {
        const winner = state.chess.turn() === "w" ? "Black" : "White";
        result = winner === "White" ? "1-0" : "0-1";
        message = `Checkmate — ${winner} wins`;
      } else if (state.chess.isStalemate()) {
        result = "1/2-1/2";
        message = "Draw by stalemate";
      } else if (state.chess.isThreefoldRepetition()) {
        result = "1/2-1/2";
        message = "Draw by repetition";
      } else if (state.chess.isInsufficientMaterial()) {
        result = "1/2-1/2";
        message = "Draw by insufficient material";
      } else if (state.chess.isDraw()) {
        result = "1/2-1/2";
        message = "Draw";
      }
    }

    state.gameResult = result;

    recordFinishedGame(result, message);

    renderBoard();
    updateGameStatus();
    updateGameControls();
    updateTimerDisplay();
    showGameOverDialog(message, result);

    saveData();
  }

  function recordFinishedGame(result, message) {
    const playerColor = "w";

    let outcome = "draw";

    if (result === "1-0") {
      outcome = playerColor === "w" ? "win" : "loss";
    } else if (result === "0-1") {
      outcome = playerColor === "b" ? "win" : "loss";
    }

    const record = {
      id: randomId(),
      date: new Date().toISOString(),
      mode: state.currentMode,
      result,
      outcome,
      message,
      pgn: state.chess ? state.chess.pgn() : "",
      moves: state.chess ? state.chess.history().length : 0
    };

    appData.history.unshift(record);
    appData.history = appData.history.slice(0, 100);

    appData.stats.gamesPlayed += 1;

    if (outcome === "win") {
      appData.stats.wins += 1;
      appData.stats.rating += 8;
    } else if (outcome === "loss") {
      appData.stats.losses += 1;
      appData.stats.rating = Math.max(100, appData.stats.rating - 8);
    } else {
      appData.stats.draws += 1;
    }

    appData.profile.rating = appData.stats.rating;

    renderStats();
    renderGameHistory();
  }

  function showGameOverDialog(message, result) {
    const dialog = firstExisting([
      "#gameOverDialog",
      ".game-over-dialog",
      "[data-game-over-dialog]"
    ]);

    setText(
      ["#gameOverMessage", ".game-over-message"],
      message
    );

    setText(["#gameOverResult", ".game-over-result"], result);

    if (dialog) {
      setVisible(dialog, true);
      dialog.classList.add("is-open");
    } else {
      announce(message);
    }
  }

  /* -------------------- NEW GAME / RESET -------------------- */

  function startNewGame(mode = state.currentMode) {
    state.currentMode = MODES[mode] ? mode : CONFIG.defaultMode;

    if (state.chess && state.gameStarted && !state.gameOver) {
      const confirmReset = window.confirm(
        "Start a new game? The current game will be abandoned."
      );

      if (!confirmReset) return;
    }

    stopTimerLoop();

    state.chess = new window.Chess();
    state.selectedSquare = null;
    state.legalTargets = [];
    state.gameStarted = false;
    state.gameOver = false;
    state.gameResult = null;
    state.boardFlipped = false;
    state.currentMove = null;

    const dialog = firstExisting([
      "#gameOverDialog",
      ".game-over-dialog",
      "[data-game-over-dialog]"
    ]);

    if (dialog) {
      setVisible(dialog, false);
      dialog.classList.remove("is-open");
    }

    const promotionDialog = firstExisting([
      "#promotionDialog",
      ".promotion-dialog",
      "[data-promotion-dialog]"
    ]);

    if (promotionDialog) {
      setVisible(promotionDialog, false);
      promotionDialog.classList.remove("is-open");
    }

    initializeTimers();
    renderBoard();
    renderMoveHistory();
    updateGameStatus();
    updateGameControls();
    updateCapturedPieces();

    navigateTo("game");
  }

  function undoMove() {
    if (!state.chess || state.gameOver) return;

    let undone;

    try {
      undone = state.chess.undo();
    } catch {
      undone = null;
    }

    if (!undone) {
      announce("There are no moves to undo.");
      return;
    }

    state.selectedSquare = null;
    state.legalTargets = [];

    renderBoard();
    renderMoveHistory();
    updateGameStatus();
    updateCapturedPieces();
    updateGameControls();

    announce("Last move undone.");
  }

  function resignGame() {
    if (!state.chess || state.gameOver) return;

    const confirmResign =
      appData.preferences.confirmResign !== false;

    if (
      confirmResign &&
      !window.confirm("Are you sure you want to resign?")
    ) {
      return;
    }

    const result =
      state.chess.turn() === "w" ? "0-1" : "1-0";

    finishGame({
      result,
      message: "You resigned"
    });
  }

  function flipBoard() {
    state.boardFlipped = !state.boardFlipped;
    renderBoard();

    allExisting(["#flipBoard", ".flip-board"])
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(state.boardFlipped)
        );
      });
  }

  /* -------------------- NAVIGATION -------------------- */

  function normalizeScreen(screen) {
    const aliases = {
      home: "dashboard",
      dashboard: "dashboard",
      play: "game",
      game: "game",
      chess: "game",
      profile: "profile",
      friends: "friends",
      history: "history",
      settings: "settings",
      leaderboard: "leaderboard",
      stats: "stats",
      login: "auth",
      signup: "auth",
      register: "auth"
    };

    return aliases[String(screen || "").toLowerCase()] || "dashboard";
  }

  function navigateTo(screen) {
    const target = normalizeScreen(screen);
    state.currentScreen = target;

    const pageSelectors = [
      ".page",
      ".app-page",
      "[data-page]",
      "main > section[id$='Page']"
    ];

    allExisting(pageSelectors).forEach((page) => {
      const raw =
        page.dataset.page ||
        page.dataset.screen ||
        page.id.replace(/Page$/, "").replace(/-/g, "");

      const pageName = normalizeScreen(raw);

      const isTarget = pageName === target;

      page.classList.toggle("active", isTarget);
      page.classList.toggle("is-active", isTarget);
      page.hidden = !isTarget;
      page.setAttribute("aria-hidden", String(!isTarget));
    });

    allExisting([
      ".nav-item",
      ".sidebar-link",
      "[data-nav]",
      "[data-page-target]"
    ]).forEach((link) => {
      const raw =
        link.dataset.nav ||
        link.dataset.pageTarget ||
        link.dataset.target ||
        link.getAttribute("href")?.replace("#", "");

      const active = normalizeScreen(raw) === target;

      link.classList.toggle("active", active);
      link.classList.toggle("is-active", active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const sidebar = firstExisting([
      "#sidebar",
      ".sidebar",
      ".app-sidebar"
    ]);

    sidebar?.classList.remove("open", "is-open");

    if (target === "game") {
      renderBoard();
      renderMoveHistory();
      updateGameStatus();
      updateTimerDisplay();
    } else if (target === "profile") {
      renderProfile();
      renderStats();
    } else if (target === "friends") {
      renderFriends();
    } else if (target === "history") {
      renderGameHistory();
    } else if (target === "settings") {
      renderSettings();
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    document.dispatchEvent(
      new CustomEvent("twistchess:navigate", {
        detail: { screen: target }
      })
    );
  }

  function toggleSidebar() {
    const sidebar = firstExisting([
      "#sidebar",
      ".sidebar",
      ".app-sidebar"
    ]);

    if (!sidebar) return;

    sidebar.classList.toggle("open");
    sidebar.classList.toggle("is-open");
  }

  /* -------------------- AUTHENTICATION DEMO -------------------- */

  function showAuth(mode = "login") {
    const authScreen = firstExisting([
      "#authScreen",
      ".auth-screen",
      "[data-screen='auth']"
    ]);

    const appShell = firstExisting([
      "#app",
      "#appShell",
      ".app-shell"
    ]);

    if (authScreen) {
      setVisible(authScreen, true);
      authScreen.classList.add("active");
    }

    if (appShell) {
      setVisible(appShell, false);
    }

    switchAuthMode(mode);
  }

  function hideAuth() {
    const authScreen = firstExisting([
      "#authScreen",
      ".auth-screen",
      "[data-screen='auth']"
    ]);

    const appShell = firstExisting([
      "#app",
      "#appShell",
      ".app-shell"
    ]);

    if (authScreen) {
      setVisible(authScreen, false);
      authScreen.classList.remove("active");
    }

    if (appShell) {
      setVisible(appShell, true);
    }
  }

  function switchAuthMode(mode) {
    const normalized = mode === "signup" ? "signup" : "login";

    allExisting([
      "[data-auth-mode]",
      ".auth-tab",
      ".auth-mode-button"
    ]).forEach((button) => {
      const active =
        button.dataset.authMode === normalized ||
        button.dataset.mode === normalized;

      button.classList.toggle("active", active);
      button.classList.toggle("is-active", active);
    });

    allExisting([
      "#loginForm",
      ".login-form",
      "[data-auth-form='login']"
    ]).forEach((form) => {
      setVisible(form, normalized === "login");
    });

    allExisting([
      "#signupForm",
      ".signup-form",
      "[data-auth-form='signup']"
    ]).forEach((form) => {
      setVisible(form, normalized === "signup");
    });

    setText(
      ["#authTitle", ".auth-title"],
      normalized === "signup" ? "Create your account" : "Welcome back"
    );

    setText(
      ["#authSubtitle", ".auth-subtitle"],
      normalized === "signup"
        ? "Join TwistChess and start playing."
        : "Sign in to continue playing."
    );
  }

  function authenticate(form, mode) {
    const formData = new FormData(form);

    const username = String(
      formData.get("username") ||
      formData.get("name") ||
      ""
    ).trim();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") || "");

    if (mode === "signup" && username.length < 2) {
      announce("Enter a username with at least 2 characters.");
      return;
    }

    if (!email || !email.includes("@")) {
      announce("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      announce("Password must contain at least 6 characters.");
      return;
    }

    /*
      This is a front-end demonstration, not secure authentication.
      Do not store real passwords in localStorage.
      Connect a backend or authentication provider for production.
    */

    appData.account = {
      email,
      username: username || email.split("@")[0],
      createdAt: new Date().toISOString()
    };

    appData.profile.username = appData.account.username;
    appData.profile.displayName = appData.account.username;

    saveData();
    hideAuth();
    applyPreferences();
    renderProfile();
    renderStats();
    renderFriends();
    renderGameHistory();

    announce(
      mode === "signup"
        ? "Demo account created."
        : "Signed in to this browser."
    );

    navigateTo("dashboard");
  }

  function logout() {
    appData.account = null;
    saveData();
    showAuth("login");
  }

  /* -------------------- PROFILE -------------------- */

  function renderProfile() {
    const profile = appData.profile;

    setText(
      ["#profileName", ".profile-name", "[data-profile='name']"],
      profile.displayName || profile.username
    );

    setText(
      ["#profileUsername", ".profile-username", "[data-profile='username']"],
      `@${profile.username || "player"}`
    );

    setText(
      ["#profileBio", ".profile-bio", "[data-profile='bio']"],
      profile.bio || ""
    );

    setText(
      ["#profileRating", ".profile-rating", "[data-profile='rating']"],
      String(appData.stats.rating)
    );

    setText(
      ["#profileCountry", ".profile-country", "[data-profile='country']"],
      profile.country || "Not set"
    );

    allExisting([
      "#profileAvatar",
      ".profile-avatar img",
      "[data-profile-avatar]"
    ]).forEach((image) => {
      if (image.tagName === "IMG") {
        if (profile.avatar) {
          image.src = profile.avatar;
          image.alt = profile.displayName || profile.username;
        } else {
          image.removeAttribute("src");
          image.alt = "";
        }
      }
    });

    allExisting([
      "#profileDisplayName",
      "input[name='displayName']"
    ]).forEach((input) => {
      input.value = profile.displayName || "";
    });

    allExisting([
      "#profileUsernameInput",
      "input[name='profileUsername']"
    ]).forEach((input) => {
      input.value = profile.username || "";
    });

    allExisting([
      "#profileBioInput",
      "textarea[name='bio']"
    ]).forEach((input) => {
      input.value = profile.bio || "";
    });
  }

  function saveProfile(form) {
    const data = new FormData(form);

    const displayName = String(
      data.get("displayName") || ""
    ).trim();

    const username = String(
      data.get("profileUsername") ||
      data.get("username") ||
      appData.profile.username
    ).trim();

    const bio = String(data.get("bio") || "").trim();
    const country = String(data.get("country") || "").trim();

    if (username.length < 2) {
      announce("Username must contain at least 2 characters.");
      return;
    }

    appData.profile.displayName = displayName || username;
    appData.profile.username = username;
    appData.profile.bio = bio.slice(0, 240);
    appData.profile.country = country.slice(0, 80);

    if (appData.account) {
      appData.account.username = username;
    }

    saveData();
    renderProfile();
    updateUserLabels();

    announce("Profile saved.");
  }

  function updateUserLabels() {
    const name =
      appData.profile.displayName ||
      appData.profile.username ||
      "Player";

    setText(
      ["#userName", ".user-name", ".sidebar-user-name", "[data-user-name]"],
      name
    );

    setText(
      ["#userRating", ".user-rating", "[data-user-rating]"],
      String(appData.stats.rating)
    );

    setText(
      ["#userInitials", ".user-initials"],
      name.slice(0, 1).toUpperCase()
    );
  }

  function renderStats() {
    const stats = appData.stats;

    setText(
      ["#gamesPlayed", ".games-played", "[data-stat='games']"],
      String(stats.gamesPlayed)
    );

    setText(
      ["#wins", ".wins", "[data-stat='wins']"],
      String(stats.wins)
    );

    setText(
      ["#losses", ".losses", "[data-stat='losses']"],
      String(stats.losses)
    );

    setText(
      ["#draws", ".draws", "[data-stat='draws']"],
      String(stats.draws)
    );

    setText(
      ["#rating", ".rating-value", "[data-stat='rating']"],
      String(stats.rating)
    );

    const winRate =
      stats.gamesPlayed > 0
        ? Math.round((stats.wins / stats.gamesPlayed) * 100)
        : 0;

    setText(
      ["#winRate", ".win-rate", "[data-stat='win-rate']"],
      `${winRate}%`
    );

    updateUserLabels();
  }

  /* -------------------- FRIENDS -------------------- */

  function renderFriends() {
    const container = firstExisting([
      "#friendsList",
      ".friends-list",
      "[data-friends-list]"
    ]);

    setText(
      ["#friendCount", ".friend-count", "[data-friend-count]"],
      String(appData.friends.length)
    );

    if (!container) return;

    container.innerHTML = "";

    if (!appData.friends.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = `
        <strong>No friends yet</strong>
        <p>Add a friend to keep track of your chess circle.</p>
      `;

      container.appendChild(empty);
      return;
    }

    appData.friends.forEach((friend) => {
      const item = document.createElement("article");

      item.className = "friend-card";
      item.dataset.friendId = friend.id;

      const avatar = document.createElement("div");
      avatar.className = "avatar friend-avatar";

      if (friend.avatar) {
        const image = document.createElement("img");
        image.src = friend.avatar;
        image.alt = "";
        avatar.appendChild(image);
      } else {
        avatar.textContent = (friend.name || "?")
          .slice(0, 1)
          .toUpperCase();
      }

      const details = document.createElement("div");
      details.className = "friend-details";

      const name = document.createElement("strong");
      name.className = "friend-name";
      name.textContent = friend.name;

      const status = document.createElement("span");
      status.className = "friend-status";
      status.textContent = friend.status || "Added locally";

      details.append(name, status);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button button-secondary friend-remove";
      remove.dataset.action = "remove-friend";
      remove.dataset.friendId = friend.id;
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${friend.name}`);

      item.append(avatar, details, remove);
      container.appendChild(item);
    });
  }

  function addFriend(name) {
    const normalizedName = String(name || "").trim();

    if (normalizedName.length < 2) {
      announce("Enter a friend name with at least 2 characters.");
      return;
    }

    const exists = appData.friends.some(
      (friend) =>
        friend.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (exists) {
      announce("That friend is already on your list.");
      return;
    }

    appData.friends.push({
      id: randomId(),
      name: normalizedName,
      status: "Added locally",
      avatar: "",
      addedAt: new Date().toISOString()
    });

    saveData();
    renderFriends();

    const input = firstExisting([
      "#friendName",
      "input[name='friendName']",
      ".friend-search-input"
    ]);

    if (input) input.value = "";

    announce(`${normalizedName} added to your friends.`);
  }

  function removeFriend(id) {
    appData.friends = appData.friends.filter(
      (friend) => friend.id !== id
    );

    saveData();
    renderFriends();
    announce("Friend removed.");
  }

  /* -------------------- GAME HISTORY -------------------- */

  function renderGameHistory() {
    const container = firstExisting([
      "#gameHistory",
      "#historyList",
      ".game-history",
      ".history-list",
      "[data-game-history]"
    ]);

    if (!container) return;

    container.innerHTML = "";

    if (!appData.history.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = `
        <strong>No games recorded</strong>
        <p>Completed games will appear here.</p>
      `;

      container.appendChild(empty);
      return;
    }

    appData.history.forEach((game) => {
      const item = document.createElement("article");

      item.className = `history-item result-${game.outcome}`;
      item.dataset.gameId = game.id;

      const result = document.createElement("span");
      result.className = "history-result";
      result.textContent =
        game.outcome === "win"
          ? "WIN"
          : game.outcome === "loss"
            ? "LOSS"
            : "DRAW";

      const details = document.createElement("div");
      details.className = "history-details";

      const title = document.createElement("strong");
      title.textContent =
        `${(MODES[game.mode] || MODES.rapid).label} game`;

      const subtitle = document.createElement("span");
      subtitle.textContent =
        `${formatDate(game.date)} · ${game.moves || 0} plies`;

      details.append(title, subtitle);

      const score = document.createElement("span");
      score.className = "history-score";
      score.textContent = game.result || "*";

      item.append(result, details, score);

      if (game.pgn) {
        const view = document.createElement("button");
        view.type = "button";
        view.className = "button button-secondary";
        view.dataset.action = "view-pgn";
        view.dataset.gameId = game.id;
        view.textContent = "View PGN";
        item.appendChild(view);
      }

      container.appendChild(item);
    });
  }

  function viewPGN(id) {
    const game = appData.history.find((item) => item.id === id);

    if (!game || !game.pgn) {
      announce("No PGN is available for this game.");
      return;
    }

    const dialog = firstExisting([
      "#pgnDialog",
      ".pgn-dialog",
      "[data-pgn-dialog]"
    ]);

    const textarea = firstExisting([
      "#pgnText",
      "textarea[name='pgn']",
      ".pgn-text"
    ]);

    if (textarea) {
      textarea.value = game.pgn;
    }

    if (dialog) {
      setVisible(dialog, true);
      dialog.classList.add("is-open");
    } else {
      const blob = new Blob([game.pgn], {
        type: "application/x-chess-pgn"
      });

      downloadBlob(blob, `twistchess-${game.id}.pgn`);
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportCurrentPGN() {
    if (!state.chess) return;

    const pgn = state.chess.pgn();

    if (!pgn) {
      announce("Make a move before exporting a PGN.");
      return;
    }

    const blob = new Blob([pgn], {
      type: "application/x-chess-pgn"
    });

    downloadBlob(blob, "twistchess-game.pgn");
  }

  /* -------------------- THEMES AND SETTINGS -------------------- */

  function applyPreferences() {
    const preferences = appData.preferences;
    const theme = THEMES.includes(preferences.theme)
      ? preferences.theme
      : CONFIG.defaultTheme;

    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;

    document.documentElement.classList.remove(
      ...THEMES.map((name) => `theme-${name}`)
    );

    document.body.classList.remove(
      ...THEMES.map((name) => `theme-${name}`)
    );

    document.documentElement.classList.add(`theme-${theme}`);
    document.body.classList.add(`theme-${theme}`);

    document.documentElement.dataset.boardTheme =
      preferences.boardTheme;

    document.body.dataset.boardTheme =
      preferences.boardTheme;

    document.documentElement.style.setProperty(
      "--sound-volume",
      String(preferences.soundVolume)
    );

    state.soundEnabled = preferences.soundEnabled !== false;
    state.soundVolume = clamp(
      Number(preferences.soundVolume ?? CONFIG.soundVolume),
      0,
      1
    );

    state.boardTheme = preferences.boardTheme || "green";

    allExisting([
      "input[name='soundEnabled']",
      "#soundEnabled",
      "[data-setting='sound']"
    ]).forEach((input) => {
      if ("checked" in input) {
        input.checked = state.soundEnabled;
      }
    });

    allExisting([
      "input[name='coordinates']",
      "#showCoordinates",
      "[data-setting='coordinates']"
    ]).forEach((input) => {
      if ("checked" in input) {
        input.checked = preferences.coordinates !== false;
      }
    });

    allExisting([
      "input[name='showLegalMoves']",
      "#showLegalMoves",
      "[data-setting='legal-moves']"
    ]).forEach((input) => {
      if ("checked" in input) {
        input.checked = preferences.showLegalMoves !== false;
      }
    });

    allExisting([
      "input[name='soundVolume']",
      "#soundVolume",
      "[data-setting='volume']"
    ]).forEach((input) => {
      input.value = String(state.soundVolume);
    });

    renderBoard();
  }

  function setTheme(theme) {
    if (!THEMES.includes(theme)) {
      announce("That theme is not available.");
      return;
    }

    appData.preferences.theme = theme;
    saveData();
    applyPreferences();
    renderSettings();

    announce(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied.`);
  }

  function setBoardTheme(theme) {
    const supported = [
      "green",
      "classic",
      "blue",
      "wood",
      "purple",
      "marble"
    ];

    if (!supported.includes(theme)) {
      announce("That board theme is not available.");
      return;
    }

    appData.preferences.boardTheme = theme;
    state.boardTheme = theme;

    saveData();
    applyPreferences();
    renderSettings();
  }

  function renderSettings() {
    const preferences = appData.preferences;

    allExisting([
      "#themeSelect",
      "select[name='theme']"
    ]).forEach((select) => {
      select.value = preferences.theme;
    });

    allExisting([
      "#boardThemeSelect",
      "select[name='boardTheme']"
    ]).forEach((select) => {
      select.value = preferences.boardTheme;
    });

    allExisting([
      "#soundEnabled",
      "input[name='soundEnabled']"
    ]).forEach((input) => {
      input.checked = preferences.soundEnabled !== false;
    });

    allExisting([
      "#showCoordinates",
      "input[name='coordinates']"
    ]).forEach((input) => {
      input.checked = preferences.coordinates !== false;
    });

    allExisting([
      "#showLegalMoves",
      "input[name='showLegalMoves']"
    ]).forEach((input) => {
      input.checked = preferences.showLegalMoves !== false;
    });

    allExisting([
      "#soundVolume",
      "input[name='soundVolume']"
    ]).forEach((input) => {
      input.value = String(preferences.soundVolume);
    });
  }

  function updatePreference(key, value) {
    if (!(key in appData.preferences)) return;

    appData.preferences[key] = value;
    saveData();
    applyPreferences();
  }

  function resetSettings() {
    if (!window.confirm("Reset all preferences to their defaults?")) {
      return;
    }

    appData.preferences = structuredCloneSafe(
      defaultData.preferences
    );

    saveData();
    applyPreferences();
    renderSettings();

    announce("Settings restored to defaults.");
  }

  /* -------------------- SOUND EFFECTS -------------------- */

  function playSound(type = "move") {
    if (!state.soundEnabled || state.soundVolume <= 0) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!state.moveSoundContext) {
        state.moveSoundContext = new AudioContextClass();
      }

      const context = state.moveSoundContext;

      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      const frequencies = {
        move: 420,
        capture: 270,
        check: 520,
        notification: 640,
        error: 180
      };

      oscillator.type = "sine";
      oscillator.frequency.value = frequencies[type] || 420;

      gain.gain.setValueAtTime(
        Math.max(0.001, state.soundVolume * 0.12),
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.09
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    } catch (error) {
      console.debug("TwistChess: Sound unavailable.", error);
    }
  }

  /* -------------------- SEARCH -------------------- */

  function searchContent(query) {
    const term = String(query || "").trim().toLowerCase();

    const searchable = allExisting([
      ".mode-card",
      ".friend-card",
      ".history-item",
      ".searchable",
      "[data-searchable]"
    ]);

    searchable.forEach((item) => {
      const text = item.textContent.toLowerCase();

      item.hidden = Boolean(term) && !text.includes(term);
    });
  }

  /* -------------------- MODALS -------------------- */

  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("is-open", "active");
    setVisible(modal, false);
  }

  function closeAllModals() {
    allExisting([
      ".modal",
      ".dialog",
      ".promotion-dialog",
      ".game-over-dialog",
      ".pgn-dialog",
      "[role='dialog']"
    ]).forEach(closeModal);
  }

  function openModal(modal) {
    if (!modal) return;

    setVisible(modal, true);
    modal.classList.add("is-open", "active");
  }

  /* -------------------- EVENT DELEGATION -------------------- */

  function onBoardClick(event) {
    const square = event.target.closest("[data-square]");
    if (!square) return;

    const board = getBoardElement();

    if (!board || !board.contains(square)) return;

    selectSquare(square.dataset.square);
  }

  function onBoardKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;

    const square = event.target.closest("[data-square]");
    if (!square) return;

    event.preventDefault();
    selectSquare(square.dataset.square);
  }

  function onDragStart(event) {
    const pieceElement = event.target.closest(".piece[data-square]");

    if (!pieceElement || state.gameOver || !state.chess) {
      event.preventDefault();
      return;
    }

    const square = pieceElement.dataset.square;
    const piece = getPieceAt(square);

    if (!isPlayersPiece(piece)) {
      event.preventDefault();
      return;
    }

    state.draggedFrom = square;
    state.selectedSquare = square;
    state.legalTargets = getLegalMoves(square).map(
      (move) => move.to
    );

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", square);
    }

    renderBoard();
  }

  function onDragOver(event) {
    const square = event.target.closest("[data-square]");

    if (
      square &&
      state.legalTargets.includes(square.dataset.square)
    ) {
      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    }
  }

  function onDrop(event) {
    const square = event.target.closest("[data-square]");
    if (!square) return;

    event.preventDefault();

    const from =
      state.draggedFrom ||
      (event.dataTransfer &&
        event.dataTransfer.getData("text/plain"));

    const to = square.dataset.square;

    state.draggedFrom = null;

    if (from && to) {
      attemptMove(from, to);
    }
  }

  function handleClickAction(actionElement) {
    const action =
      actionElement.dataset.action ||
      actionElement.dataset.nav ||
      actionElement.dataset.pageTarget;

    const target =
      actionElement.dataset.target ||
      actionElement.dataset.page ||
      actionElement.dataset.nav ||
      actionElement.dataset.pageTarget;

    switch (action) {
      case "navigate":
        navigateTo(target);
        break;

      case "dashboard":
      case "home":
      case "game":
      case "profile":
      case "friends":
      case "history":
      case "settings":
      case "leaderboard":
      case "stats":
        navigateTo(action);
        break;

      case "new-game":
      case "play":
        startNewGame(
          actionElement.dataset.mode || state.currentMode
        );
        break;

      case "undo":
        undoMove();
        break;

      case "resign":
        resignGame();
        break;

      case "flip-board":
        flipBoard();
        break;

      case "toggle-sidebar":
        toggleSidebar();
        break;

      case "login":
        showAuth("login");
        break;

      case "signup":
        showAuth("signup");
        break;

      case "logout":
        logout();
        break;

      case "close-modal":
        closeModal(actionElement.closest(
          ".modal, .dialog, [role='dialog']"
        ));
        break;

      case "close-all-modals":
        closeAllModals();
        break;

      case "add-friend": {
        const input = firstExisting([
          "#friendName",
          "input[name='friendName']",
          ".friend-search-input"
        ]);

        addFriend(input?.value);
        break;
      }

      case "remove-friend":
        removeFriend(actionElement.dataset.friendId);
        break;

      case "theme":
        setTheme(actionElement.dataset.theme);
        break;

      case "board-theme":
        setBoardTheme(actionElement.dataset.boardTheme);
        break;

      case "reset-settings":
        resetSettings();
        break;

      case "export-pgn":
        exportCurrentPGN();
        break;

      case "view-pgn":
        viewPGN(actionElement.dataset.gameId);
        break;

      case "new-game-confirm":
        startNewGame(state.currentMode);
        break;

      case "retry-chess":
        loadChessLibrary();
        break;

      case "promotion":
        choosePromotion(actionElement.dataset.piece || "q");
        break;

      case "show-login":
        switchAuthMode("login");
        break;

      case "show-signup":
        switchAuthMode("signup");
        break;

      default:
        break;
    }
  }

  function handleChange(event) {
    const element = event.target;

    if (
      element.matches("[data-theme-select], #themeSelect, select[name='theme']")
    ) {
      setTheme(element.value);
      return;
    }

    if (
      element.matches(
        "[data-board-theme-select], #boardThemeSelect, select[name='boardTheme']"
      )
    ) {
      setBoardTheme(element.value);
      return;
    }

    if (
      element.matches(
        "#soundEnabled, input[name='soundEnabled'], [data-setting='sound']"
      )
    ) {
      updatePreference("soundEnabled", element.checked);
      return;
    }

    if (
      element.matches(
        "#showCoordinates, input[name='coordinates'], [data-setting='coordinates']"
      )
    ) {
      updatePreference("coordinates", element.checked);
      return;
    }

    if (
      element.matches(
        "#showLegalMoves, input[name='showLegalMoves'], [data-setting='legal-moves']"
      )
    ) {
      updatePreference("showLegalMoves", element.checked);
      return;
    }

    if (
      element.matches(
        "#soundVolume, input[name='soundVolume'], [data-setting='volume']"
      )
    ) {
      const volume = clamp(Number(element.value), 0, 1);

      state.soundVolume = volume;
      appData.preferences.soundVolume = volume;

      saveData();
      return;
    }

    if (element.matches("[data-mode-select], #gameMode")) {
      state.currentMode = MODES[element.value]
        ? element.value
        : CONFIG.defaultMode;

      initializeTimers();
      updateTimerDisplay();
      return;
    }

    if (element.matches("[data-search], #globalSearch, .global-search")) {
      searchContent(element.value);
    }
  }

  function handleSubmit(event) {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) return;

    if (
      form.matches(
        "#loginForm, .login-form, [data-auth-form='login']"
      )
    ) {
      event.preventDefault();
      authenticate(form, "login");
      return;
    }

    if (
      form.matches(
        "#signupForm, .signup-form, [data-auth-form='signup']"
      )
    ) {
      event.preventDefault();
      authenticate(form, "signup");
      return;
    }

    if (
      form.matches(
        "#profileForm, .profile-form, [data-form='profile']"
      )
    ) {
      event.preventDefault();
      saveProfile(form);
      return;
    }

    if (
      form.matches(
        "#addFriendForm, .add-friend-form, [data-form='add-friend']"
      )
    ) {
      event.preventDefault();

      const data = new FormData(form);
      addFriend(data.get("friendName") || data.get("name"));
    }
  }

  /* -------------------- KEYBOARD SHORTCUTS -------------------- */

  function handleKeyboard(event) {
    const target = event.target;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable
    ) {
      if (event.key === "Escape") {
        closeAllModals();
      }

      return;
    }

    if (event.key === "Escape") {
      closeAllModals();
      clearSelection();
      return;
    }

    if (event.key.toLowerCase() === "f" && !event.ctrlKey && !event.metaKey) {
      flipBoard();
      return;
    }

    if (
      event.key.toLowerCase() === "n" &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      startNewGame(state.currentMode);
    }
  }

  /* -------------------- MODE CARDS -------------------- */

  function initializeModeCards() {
    allExisting([
      ".mode-card",
      "[data-mode]",
      "[data-game-mode]"
    ]).forEach((card) => {
      const mode =
        card.dataset.mode ||
        card.dataset.gameMode;

      if (!MODES[mode]) return;

      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      if (!card.dataset.action) {
        card.dataset.action = "new-game";
      }

      card.dataset.mode = mode;
    });
  }

  /* -------------------- INITIALIZATION -------------------- */

  function initializeEventListeners() {
    document.addEventListener("click", (event) => {
      const actionElement = event.target.closest(
        "[data-action], [data-nav], [data-page-target], [data-auth-mode], .nav-item, .sidebar-link, .mode-card"
      );

      if (!actionElement) return;

      if (actionElement.dataset.authMode) {
        switchAuthMode(actionElement.dataset.authMode);
        return;
      }

      if (
        actionElement.classList.contains("nav-item") ||
        actionElement.classList.contains("sidebar-link")
      ) {
        const target =
          actionElement.dataset.nav ||
          actionElement.dataset.pageTarget ||
          actionElement.getAttribute("href")?.replace("#", "");

        if (target) {
          event.preventDefault();
          navigateTo(target);
        }

        return;
      }

      if (
        actionElement.classList.contains("mode-card") &&
        !actionElement.dataset.action
      ) {
        startNewGame(
          actionElement.dataset.mode ||
          actionElement.dataset.gameMode ||
          CONFIG.defaultMode
        );

        return;
      }

      if (actionElement.dataset.action) {
        event.preventDefault();
        handleClickAction(actionElement);
      }
    });

    document.addEventListener("submit", handleSubmit);
    document.addEventListener("change", handleChange);
    document.addEventListener("keydown", handleKeyboard);

    document.addEventListener("click", onBoardClick);
    document.addEventListener("keydown", onBoardKeydown);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);

    document.addEventListener("click", (event) => {
      const backdrop = event.target.closest(
        ".modal, .dialog, [role='dialog']"
      );

      if (
        backdrop &&
        event.target === backdrop &&
        backdrop.dataset.closeOnBackdrop !== "false"
      ) {
        closeModal(backdrop);
      }
    });

    document.addEventListener("input", (event) => {
      const input = event.target;

      if (
        input.matches(
          "[data-search], #globalSearch, .global-search"
        )
      ) {
        searchContent(input.value);
      }
    });
  }

  function initializeUI() {
    applyPreferences();
    updateUserLabels();
    renderStats();
    renderProfile();
    renderFriends();
    renderGameHistory();
    renderSettings();
    initializeModeCards();

    const savedPage = document.body.dataset.startPage;

    if (!appData.account) {
      const authScreen = firstExisting([
        "#authScreen",
        ".auth-screen",
        "[data-screen='auth']"
      ]);

      if (authScreen) {
        showAuth("login");
      } else {
        navigateTo(savedPage || "dashboard");
      }
    } else {
      hideAuth();
      navigateTo(savedPage || "dashboard");
    }

    const currentModeElement = firstExisting([
      "#gameMode",
      "select[name='gameMode']",
      "[data-mode-select]"
    ]);

    if (currentModeElement && MODES[currentModeElement.value]) {
      state.currentMode = currentModeElement.value;
    }

    updateTimerDisplay();
  }

  function init() {
    if (document.documentElement.dataset.twistChessInitialized) {
      return;
    }

    document.documentElement.dataset.twistChessInitialized = "true";

    initializeEventListeners();
    initializeUI();

    loadChessLibrary().then((loaded) => {
      if (loaded) {
        renderBoard();
        updateGameStatus();
      }
    });

    document.dispatchEvent(
      new CustomEvent("twistchess:ready", {
        detail: {
          version: CONFIG.version
        }
      })
    );

    console.info(`TwistChess ${CONFIG.version} initialized.`);
  }

  /* -------------------- PUBLIC API -------------------- */

  window.TwistChess = {
    version: CONFIG.version,

    navigate: navigateTo,
    newGame: startNewGame,
    undoMove,
    resign: resignGame,
    flipBoard,
    setTheme,
    setBoardTheme,
    addFriend,
    removeFriend,
    exportPGN: exportCurrentPGN,
    getState: () => ({
      screen: state.currentScreen,
      mode: state.currentMode,
      gameStarted: state.gameStarted,
      gameOver: state.gameOver,
      boardFlipped: state.boardFlipped,
      fen: state.chess ? state.chess.fen() : null,
      history: state.chess ? state.chess.history() : [],
      stats: structuredCloneSafe(appData.stats),
      preferences: structuredCloneSafe(appData.preferences)
    })
  };

  /* -------------------- START -------------------- */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
