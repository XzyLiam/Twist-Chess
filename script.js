
"use strict";

/* ============================================================
   TWISTCHESS
   Main gameplay engine
   ============================================================ */

(() => {

  /* ==========================================================
     1. CONSTANTS
     ========================================================== */

  const STORAGE_KEY = "twistchess-settings-v1";

  const PIECES = {
    classic: {
      w: {
        k: "♔", q: "♕", r: "♖",
        b: "♗", n: "♘", p: "♙"
      },
      b: {
        k: "♚", q: "♛", r: "♜",
        b: "♝", n: "♞", p: "♟"
      }
    },

    solid: {
      w: {
        k: "♚", q: "♛", r: "♜",
        b: "♝", n: "♞", p: "♟"
      },
      b: {
        k: "♚", q: "♛", r: "♜",
        b: "♝", n: "♞", p: "♟"
      }
    },

    letters: {
      w: {
        k: "K", q: "Q", r: "R",
        b: "B", n: "N", p: "P"
      },
      b: {
        k: "K", q: "Q", r: "R",
        b: "B", n: "N", p: "P"
      }
    }
  };

  const THEMES = [
    {
      id: "forest",
      name: "Forest",
      light: "#e0e8d4",
      dark: "#76966c"
    },
    {
      id: "classic",
      name: "Classic",
      light: "#f0d9b5",
      dark: "#b58863"
    },
    {
      id: "ocean",
      name: "Ocean",
      light: "#dcebf2",
      dark: "#638ba5"
    },
    {
      id: "midnight",
      name: "Midnight",
      light: "#b9c3d2",
      dark: "#45516c"
    },
    {
      id: "rose",
      name: "Rose",
      light: "#f5dfe4",
      dark: "#c9859c"
    },
    {
      id: "purple",
      name: "Purple",
      light: "#e8ddf4",
      dark: "#9475b9"
    },
    {
      id: "monochrome",
      name: "Monochrome",
      light: "#e5e5e5",
      dark: "#777777"
    }
  ];

  const MODES = [
    {
      id: "classic",
      name: "Classic Chess",
      icon: "♟",
      tag: "ORIGINAL",
      description: "Traditional chess with standard pieces and rules."
    },
    {
      id: "roook",
      name: "ROOOK",
      icon: "♜",
      tag: "CHAOS",
      description: "Every bishop and knight is replaced by a rook."
    },
    {
      id: "big",
      name: "Big Board",
      icon: "▦",
      tag: "EXPANDED",
      description: "A huge 10×10 battlefield with extra pieces."
    },
    {
      id: "small",
      name: "Small Board",
      icon: "▥",
      tag: "FAST",
      description: "A compact 6×6 battlefield."
    },
    {
      id: "hidden",
      name: "Hidden Queen",
      icon: "♛",
      tag: "SECRET",
      description: "Choose a pawn that secretly moves like a queen."
    },
    {
      id: "horde",
      name: "Pawn Horde",
      icon: "♙",
      tag: "SURVIVAL",
      description: "A large pawn army challenges a regular army."
    },
    {
      id: "knightmare",
      name: "Knightmare",
      icon: "♞",
      tag: "TACTICAL",
      description: "Replace bishops and rooks with knights."
    },
    {
      id: "bishop",
      name: "Bishop Blitz",
      icon: "♗",
      tag: "DIAGONAL",
      description: "Replace knights and rooks with bishops."
    },
    {
      id: "queenrush",
      name: "Queen Rush",
      icon: "♕",
      tag: "POWER",
      description: "Major and minor pieces become queens."
    },
    {
      id: "atomic",
      name: "Atomic",
      icon: "✹",
      tag: "EXPLOSIVE",
      description: "Captures explode nearby non-pawn pieces."
    },
    {
      id: "shuffle",
      name: "Shuffle",
      icon: "⤨",
      tag: "RANDOM",
      description: "Start with randomized back ranks."
    },
    {
      id: "kingrace",
      name: "King Race",
      icon: "♔",
      tag: "RACE",
      description: "Race your king to the opposite edge."
    },
    {
      id: "pawnwars",
      name: "Pawn Wars",
      icon: "♙",
      tag: "MINIMAL",
      description: "Only kings and pawns remain."
    },
    {
      id: "noqueens",
      name: "No Queens",
      icon: "◇",
      tag: "STRATEGY",
      description: "Chess without starting queens."
    },
    {
      id: "mirror",
      name: "Mirror Army",
      icon: "⇄",
      tag: "TWIST",
      description: "Play with horizontally mirrored back ranks."
    }
  ];

  const DEFAULT_SETTINGS = {
    theme: "forest",
    pieceStyle: "classic",
    orientation: "white",
    sound: true,
    legal: true,
    coords: true,
    animation: true,
    pieceSize: 90
  };

  const $ = id => document.getElementById(id);

  const FILES = "abcdefghij";

  const KNIGHT_STEPS = [
    [-2, -1], [-2, 1],
    [-1, -2], [-1, 2],
    [1, -2], [1, 2],
    [2, -1], [2, 1]
  ];

  const KING_STEPS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],             [0, 1],
    [1, -1],  [1, 0],   [1, 1]
  ];

  const ROOK_DIRECTIONS = [
    [-1, 0], [1, 0],
    [0, -1], [0, 1]
  ];

  const BISHOP_DIRECTIONS = [
    [-1, -1], [-1, 1],
    [1, -1], [1, 1]
  ];

  const QUEEN_DIRECTIONS = [
    ...ROOK_DIRECTIONS,
    ...BISHOP_DIRECTIONS
  ];

  /* ==========================================================
     2. APPLICATION STATE
     ========================================================== */

  let settings = loadSettings();

  let game = null;

  let selected = null;

  let legalTargets = [];

  let history = [];

  let moveHistory = [];

  let flipped = false;

  let currentMode = "classic";

  let audioContext = null;

  let gameVersion = 0;

  /* ==========================================================
     3. STORAGE
     ========================================================== */

  function loadSettings() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );

      return {
        ...DEFAULT_SETTINGS,
        ...saved
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch {
      // The game remains playable if storage is disabled.
    }
  }

  /* ==========================================================
     4. BOARD UTILITIES
     ========================================================== */

  function inside(board, r, c) {
    return (
      r >= 0 &&
      c >= 0 &&
      r < board.length &&
      c < board[0].length
    );
  }

  function createPiece(type, color, extra = {}) {
    return {
      type,
      color,
      moved: false,
      secret: false,
      ...extra
    };
  }

  function cloneBoard(board) {
    return board.map(row =>
      row.map(piece => piece ? { ...piece } : null)
    );
  }

  function cloneGame(source) {
    return {
      ...source,
      board: cloneBoard(source.board),
      enPassant: source.enPassant
        ? { ...source.enPassant }
        : null,
      secrets: { ...source.secrets },
      captured: {
        w: [...source.captured.w],
        b: [...source.captured.b]
      }
    };
  }

  function other(color) {
    return color === "w" ? "b" : "w";
  }

  function colorName(color) {
    return color === "w" ? "White" : "Black";
  }

  function squareName(r, c, size) {
    return FILES[c] + (size - r);
  }

  function getMode(id) {
    return MODES.find(mode => mode.id === id) || MODES[0];
  }

  function isFriendly(piece, color) {
    return piece && piece.color === color;
  }

  function isEnemy(piece, color) {
    return piece && piece.color !== color;
  }

  function sameSquare(a, b) {
    return (
      a &&
      b &&
      a.r === b.r &&
      a.c === b.c
    );
  }

  /* ==========================================================
     5. INITIAL BOARD GENERATION
     ========================================================== */

  function emptyBoard(size) {
    return Array.from(
      { length: size },
      () => Array(size).fill(null)
    );
  }

  function standardBackRank() {
    return [
      "r", "n", "b", "q",
      "k", "b", "n", "r"
    ];
  }

  function modeBackRank(mode) {
    const rank = standardBackRank();

    if (mode === "roook") {
      return [
        "r", "r", "r", "q",
        "k", "r", "r", "r"
      ];
    }

    if (mode === "knightmare") {
      return [
        "n", "n", "n", "q",
        "k", "n", "n", "n"
      ];
    }

    if (mode === "bishop") {
      return [
        "b", "b", "b", "q",
        "k", "b", "b", "b"
      ];
    }

    if (mode === "queenrush") {
      return [
        "q", "q", "q", "q",
        "k", "q", "q", "q"
      ];
    }

    if (mode === "mirror") {
      return [...rank].reverse();
    }

    if (mode === "noqueens") {
      return [
        "r", "n", "b", null,
        "k", "b", "n", "r"
      ];
    }

    if (mode === "pawnwars") {
      return [
        null, null, null, null,
        "k", null, null, null
      ];
    }

    if (mode === "shuffle") {
      return shuffledBackRank();
    }

    return rank;
  }

  function shuffledBackRank() {
    const rank = Array(8).fill(null);

    const even = [0, 2, 4, 6];
    const odd = [1, 3, 5, 7];

    const firstBishop =
      even[Math.floor(Math.random() * even.length)];

    const secondBishop =
      odd[Math.floor(Math.random() * odd.length)];

    rank[firstBishop] = "b";
    rank[secondBishop] = "b";

    function freeSquares() {
      return rank
        .map((piece, index) => piece === null ? index : -1)
        .filter(index => index !== -1);
    }

    function placeRandom(type) {
      const free = freeSquares();
      const chosen =
        free[Math.floor(Math.random() * free.length)];

      rank[chosen] = type;
    }

    placeRandom("q");
    placeRandom("n");
    placeRandom("n");

    const remaining = freeSquares().sort((a, b) => a - b);

    rank[remaining[0]] = "r";
    rank[remaining[1]] = "k";
    rank[remaining[2]] = "r";

    return rank;
  }

  function placeArmy(board, color, backRank) {
    const size = board.length;

    const backRow = color === "w" ? size - 1 : 0;
    const pawnRow = color === "w" ? size - 2 : 1;

    backRank.forEach((type, col) => {
      if (type) {
        board[backRow][col] = createPiece(type, color);
      }
    });

    for (let c = 0; c < size; c++) {
      board[pawnRow][c] = createPiece("p", color);
    }
  }

  function setupBigBoard(board) {
    const back = [
      "r", "n", "b", "r", "q",
      "k", "r", "b", "n", "r"
    ];

    placeArmy(board, "b", back);
    placeArmy(board, "w", back);
  }

  function setupSmallBoard(board) {
    const back = [
      "r", "n", "q",
      "k", "n", "r"
    ];

    placeArmy(board, "b", back);
    placeArmy(board, "w", back);
  }

  function setupHorde(board) {
    placeArmy(board, "b", standardBackRank());

    const size = board.length;

    // White's horde deliberately has no king.
    // Its objective is to eliminate Black's army.

    for (let r = 4; r < size; r++) {
      for (let c = 0; c < size; c++) {
        board[r][c] = createPiece("p", "w");
      }
    }
  }

  function setupKingRace(board) {
    const size = board.length;

    board[0][3] = createPiece("k", "b");
    board[size - 1][4] = createPiece("k", "w");

    const whiteRow = size - 2;
    const blackRow = 1;

    for (const c of [1, 2, 5, 6]) {
      board[whiteRow][c] = createPiece("n", "w");
      board[blackRow][c] = createPiece("n", "b");
    }
  }

  function setupBoard(mode) {
    const size = mode === "big"
      ? 10
      : mode === "small"
        ? 6
        : 8;

    const board = emptyBoard(size);

    if (mode === "big") {
      setupBigBoard(board);
    } else if (mode === "small") {
      setupSmallBoard(board);
    } else if (mode === "horde") {
      setupHorde(board);
    } else if (mode === "kingrace") {
      setupKingRace(board);
    } else {
      const back = modeBackRank(mode);

      placeArmy(board, "b", back);
      placeArmy(board, "w", back);
    }

    return board;
  }

  /* ==========================================================
     6. GAME CREATION
     ========================================================== */

  function createGame(mode) {
    return {
      mode,
      board: setupBoard(mode),
      turn: "w",
      fullmove: 1,
      halfmove: 0,
      enPassant: null,
      secrets: {
        w: null,
        b: null
      },
      hiddenSetup: mode === "hidden" ? "w" : null,
      captured: {
        w: [],
        b: []
      },
      winner: null,
      result: null,
      lastMove: null,
      status: "playing"
    };
  }

  function newGame(mode = currentMode) {
    gameVersion++;

    currentMode = mode;

    game = createGame(mode);

    selected = null;
    legalTargets = [];

    history = [];
    moveHistory = [];

    flipped = settings.orientation === "black";

    $("modeTitle").textContent = getMode(mode).name;
    $("modeDescription").textContent =
      getMode(mode).description;

    $("tipText").textContent =
      "Select a piece to see its legal moves.";

    showView("play");

    renderAll();

    playSound("start");
  }

  /* ==========================================================
     7. ATTACK DETECTION
     ========================================================== */

  function findKing(board, color) {
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board.length; c++) {
        const piece = board[r][c];

        if (
          piece &&
          piece.type === "k" &&
          piece.color === color
        ) {
          return { r, c };
        }
      }
    }

    return null;
  }

  function slidingAttacks(
    board,
    r,
    c,
    directions,
    targetR,
    targetC
  ) {
    for (const [dr, dc] of directions) {
      let nr = r + dr;
      let nc = c + dc;

      while (inside(board, nr, nc)) {
        if (nr === targetR && nc === targetC) {
          return true;
        }

        if (board[nr][nc]) {
          break;
        }

        nr += dr;
        nc += dc;
      }
    }

    return false;
  }

  function pieceAttacksSquare(
    state,
    r,
    c,
    targetR,
    targetC
  ) {
    const board = state.board;
    const piece = board[r][c];

    if (!piece) return false;

    const dr = targetR - r;
    const dc = targetC - c;

    if (piece.type === "p" && !piece.secret) {
      const direction = piece.color === "w" ? -1 : 1;

      return (
        dr === direction &&
        Math.abs(dc) === 1
      );
    }

    const type = piece.secret ? "q" : piece.type;

    if (type === "n") {
      return KNIGHT_STEPS.some(
        ([a, b]) => a === dr && b === dc
      );
    }

    if (type === "k") {
      return Math.max(
        Math.abs(dr),
        Math.abs(dc)
      ) === 1;
    }

    if (type === "r") {
      return slidingAttacks(
        board,
        r,
        c,
        ROOK_DIRECTIONS,
        targetR,
        targetC
      );
    }

    if (type === "b") {
      return slidingAttacks(
        board,
        r,
        c,
        BISHOP_DIRECTIONS,
        targetR,
        targetC
      );
    }

    if (type === "q") {
      return slidingAttacks(
        board,
        r,
        c,
        QUEEN_DIRECTIONS,
        targetR,
        targetC
      );
    }

    return false;
  }

  function isAttacked(state, r, c, byColor) {
    const board = state.board;

    for (let sr = 0; sr < board.length; sr++) {
      for (let sc = 0; sc < board.length; sc++) {
        const piece = board[sr][sc];

        if (!piece || piece.color !== byColor) {
          continue;
        }

        if (
          pieceAttacksSquare(
            state,
            sr,
            sc,
            r,
            c
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  function isInCheck(state, color) {
    const king = findKing(state.board, color);

    if (!king) {
      return false;
    }

    return isAttacked(
      state,
      king.r,
      king.c,
      other(color)
    );
  }

  /* ==========================================================
     8. MOVE GENERATION
     ========================================================== */

  function createMove(fr, fc, tr, tc, extra = {}) {
    return {
      fr,
      fc,
      tr,
      tc,
      ...extra
    };
  }

  function slidingMoves(
    state,
    r,
    c,
    directions
  ) {
    const board = state.board;
    const piece = board[r][c];

    const moves = [];

    for (const [dr, dc] of directions) {
      let nr = r + dr;
      let nc = c + dc;

      while (inside(board, nr, nc)) {
        const target = board[nr][nc];

        if (isFriendly(target, piece.color)) {
          break;
        }

        if (!target || target.type !== "k") {
          moves.push(createMove(r, c, nr, nc));
        }

        if (target) {
          break;
        }

        nr += dr;
        nc += dc;
      }
    }

    return moves;
  }

  function jumpingMoves(
    state,
    r,
    c,
    steps
  ) {
    const board = state.board;
    const piece = board[r][c];

    const moves = [];

    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;

      if (!inside(board, nr, nc)) continue;

      const target = board[nr][nc];

      if (
        !isFriendly(target, piece.color) &&
        (!target || target.type !== "k")
      ) {
        moves.push(createMove(r, c, nr, nc));
      }
    }

    return moves;
  }

  function pawnMoves(state, r, c) {
    const board = state.board;
    const piece = board[r][c];

    const moves = [];

    const direction = piece.color === "w" ? -1 : 1;
    const startRow =
      piece.color === "w" ? board.length - 2 : 1;

    const nr = r + direction;

    if (
      inside(board, nr, c) &&
      !board[nr][c]
    ) {
      moves.push(createMove(r, c, nr, c));

      const doubleRow = r + direction * 2;

      if (
        r === startRow &&
        !piece.moved &&
        inside(board, doubleRow, c) &&
        !board[doubleRow][c]
      ) {
        moves.push(
          createMove(r, c, doubleRow, c, {
            doublePawn: true
          })
        );
      }
    }

    for (const dc of [-1, 1]) {
      const nc = c + dc;

      if (!inside(board, nr, nc)) continue;

      const target = board[nr][nc];

      if (
        isEnemy(target, piece.color) &&
        target.type !== "k"
      ) {
        moves.push(createMove(r, c, nr, nc));
      }

      const ep = state.enPassant;

      if (
        ep &&
        ep.r === nr &&
        ep.c === nc &&
        ep.color !== piece.color &&
        board[r][nc] &&
        board[r][nc].type === "p" &&
        board[r][nc].color !== piece.color
      ) {
        moves.push(
          createMove(r, c, nr, nc, {
            enPassant: true
          })
        );
      }
    }

    return moves;
  }

  /* ==========================================================
     9. CASTLING
     ========================================================== */

  function castlingMoves(state, r, c) {
    const board = state.board;
    const king = board[r][c];

    if (
      !king ||
      king.type !== "k" ||
      king.moved ||
      state.mode === "kingrace" ||
      state.mode === "atomic"
    ) {
      return [];
    }

    if (isInCheck(state, king.color)) {
      return [];
    }

    const moves = [];

    for (const rookCol of [0, board.length - 1]) {
      const rook = board[r][rookCol];

      if (
        !rook ||
        rook.type !== "r" ||
        rook.color !== king.color ||
        rook.moved
      ) {
        continue;
      }

      const direction = rookCol > c ? 1 : -1;

      const destination = c + direction * 2;

      if (
        !inside(board, r, destination)
      ) {
        continue;
      }

      let clear = true;

      for (
        let col = c + direction;
        col !== rookCol;
        col += direction
      ) {
        if (board[r][col]) {
          clear = false;
          break;
        }
      }

      if (!clear) continue;

      if (
        isAttacked(
          state,
          r,
          c + direction,
          other(king.color)
        ) ||
        isAttacked(
          state,
          r,
          destination,
          other(king.color)
        )
      ) {
        continue;
      }

      moves.push(
        createMove(r, c, r, destination, {
          castle: true,
          rookFrom: rookCol,
          rookTo: c + direction
        })
      );
    }

    return moves;
  }

  /* ==========================================================
     10. PSEUDO-LEGAL MOVES
     ========================================================== */

  function pseudoMoves(state, r, c) {
    const board = state.board;
    const piece = board[r]?.[c];

    if (!piece) return [];

    if (piece.secret) {
      return slidingMoves(
        state,
        r,
        c,
        QUEEN_DIRECTIONS
      );
    }

    switch (piece.type) {
      case "p":
        return pawnMoves(state, r, c);

      case "n":
        return jumpingMoves(
          state,
          r,
          c,
          KNIGHT_STEPS
        );

      case "b":
        return slidingMoves(
          state,
          r,
          c,
          BISHOP_DIRECTIONS
        );

      case "r":
        return slidingMoves(
          state,
          r,
          c,
          ROOK_DIRECTIONS
        );

      case "q":
        return slidingMoves(
          state,
          r,
          c,
          QUEEN_DIRECTIONS
        );

      case "k":
        return [
          ...jumpingMoves(
            state,
            r,
            c,
            KING_STEPS
          ),
          ...castlingMoves(state, r, c)
        ];

      default:
        return [];
    }
  }

  /* ==========================================================
     11. SIMULATING MOVES
     ========================================================== */

  function applyMove(state, move, simulation = false) {
    const next = cloneGame(state);
    const board = next.board;

    const piece = board[move.fr][move.fc];

    if (!piece) return next;

    const target = board[move.tr][move.tc];

    let captured = target;

    board[move.fr][move.fc] = null;

    if (move.enPassant) {
      captured = board[move.fr][move.tc];
      board[move.fr][move.tc] = null;
    }

    const moving = {
      ...piece,
      moved: true
    };

    board[move.tr][move.tc] = moving;

    if (move.castle) {
      const rook = board[move.fr][move.rookFrom];

      board[move.fr][move.rookFrom] = null;

      board[move.fr][move.rookTo] = {
        ...rook,
        moved: true
      };
    }

    // Atomic variant:
    // A capture destroys the capturing piece and nearby
    // non-pawn pieces. Kings may not be captured directly.

    if (
      state.mode === "atomic" &&
      captured
    ) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = move.tr + dr;
          const nc = move.tc + dc;

          if (!inside(board, nr, nc)) continue;

          const nearby = board[nr][nc];

          if (!nearby) continue;

          const center = dr === 0 && dc === 0;

          if (center || nearby.type !== "p") {
            board[nr][nc] = null;
          }
        }
      }
    }

    // Standard promotion to a queen by default.
    // The UI can later expose underpromotion choices.

    if (
      board[move.tr][move.tc] &&
      board[move.tr][move.tc].type === "p" &&
      !board[move.tr][move.tc].secret &&
      (
        move.tr === 0 ||
        move.tr === board.length - 1
      )
    ) {
      board[move.tr][move.tc].type =
        move.promotion || "q";
    }

    next.enPassant = null;

    if (
      piece.type === "p" &&
      Math.abs(move.tr - move.fr) === 2
    ) {
      next.enPassant = {
        r: (move.tr + move.fr) / 2,
        c: move.fc,
        color: piece.color
      };
    }

    if (!simulation) {
      if (captured) {
        next.captured[piece.color].push(
          captured.type
        );
      }

      next.lastMove = { ...move };

      next.halfmove =
        captured || piece.type === "p"
          ? 0
          : state.halfmove + 1;

      if (piece.color === "b") {
        next.fullmove++;
      }
    }

    next.turn = other(piece.color);

    return next;
  }

  /* ==========================================================
     12. LEGAL MOVE FILTER
     ========================================================== */

  function legalMovesFor(state, r, c) {
    const piece = state.board[r]?.[c];

    if (!piece) return [];

    if (piece.color !== state.turn) {
      return [];
    }

    const pseudo = pseudoMoves(state, r, c);

    return pseudo.filter(move => {
      const simulated = applyMove(
        state,
        move,
        true
      );

      if (state.mode === "horde" && piece.color === "w") {
        return true;
      }

      if (state.mode === "kingrace") {
        // In this variant kings still cannot move
        // onto squares controlled by the opponent.
        return !isInCheck(simulated, piece.color);
      }

      if (state.mode === "atomic") {
        const king = findKing(
          simulated.board,
          piece.color
        );

        if (!king) return false;

        return !isInCheck(
          simulated,
          piece.color
        );
      }

      return !isInCheck(
        simulated,
        piece.color
      );
    });
  }

  function allLegalMoves(state, color = state.turn) {
    const copy = {
      ...state,
      turn: color
    };

    const moves = [];

    for (let r = 0; r < copy.board.length; r++) {
      for (let c = 0; c < copy.board.length; c++) {
        const piece = copy.board[r][c];

        if (
          piece &&
          piece.color === color
        ) {
          moves.push(
            ...legalMovesFor(copy, r, c)
          );
        }
      }
    }

    return moves;
  }

  /* ==========================================================
     13. SPECIAL VICTORY CONDITIONS
     ========================================================== */

  function countPieces(state, color) {
    let count = 0;

    for (const row of state.board) {
      for (const piece of row) {
        if (
          piece &&
          piece.color === color
        ) {
          count++;
        }
      }
    }

    return count;
  }

  function finishGame(state, winner, result) {
    state.winner = winner;
    state.result = result;
    state.status = "finished";
  }

  function evaluateGame(state) {
    if (state.status === "finished") {
      return;
    }

    if (state.mode === "kingrace") {
      const whiteKing = findKing(state.board, "w");
      const blackKing = findKing(state.board, "b");

      if (whiteKing && whiteKing.r === 0) {
        finishGame(
          state,
          "w",
          "White wins the king race!"
        );
        return;
      }

      if (
        blackKing &&
        blackKing.r === state.board.length - 1
      ) {
        finishGame(
          state,
          "b",
          "Black wins the king race!"
        );
        return;
      }
    }

    if (state.mode === "horde") {
      if (countPieces(state, "w") === 0) {
        finishGame(
          state,
          "b",
          "Black defeated the pawn horde!"
        );
        return;
      }

      if (countPieces(state, "b") === 0) {
        finishGame(
          state,
          "w",
          "The pawn horde wins!"
        );
        return;
      }
    }

    if (state.mode === "atomic") {
      const whiteKing = findKing(state.board, "w");
      const blackKing = findKing(state.board, "b");

      if (!whiteKing) {
        finishGame(
          state,
          "b",
          "Black wins by explosion!"
        );
        return;
      }

      if (!blackKing) {
        finishGame(
          state,
          "w",
          "White wins by explosion!"
        );
        return;
      }
    }

    const moves = allLegalMoves(state);

    if (moves.length === 0) {
      if (isInCheck(state, state.turn)) {
        finishGame(
          state,
          other(state.turn),
          `${colorName(other(state.turn))} wins by checkmate!`
        );
      } else {
        finishGame(
          state,
          null,
          "Draw by stalemate."
        );
      }

      return;
    }

    if (state.halfmove >= 100) {
      finishGame(
        state,
        null,
        "Draw by the 50-move rule."
      );
    }
  }

  /* ==========================================================
     14. HIDDEN QUEEN SETUP
     ========================================================== */

  function chooseHiddenQueen(r, c) {
    if (
      game.mode !== "hidden" ||
      !game.hiddenSetup
    ) {
      return false;
    }

    const piece = game.board[r][c];

    if (
      !piece ||
      piece.type !== "p" ||
      piece.color !== game.hiddenSetup
    ) {
      showToast(
        `Choose one of ${colorName(game.hiddenSetup)}'s pawns.`,
        "error"
      );
      return true;
    }

    const color = game.hiddenSetup;

    piece.secret = true;

    game.secrets[color] = { r, c };

    if (color === "w") {
      game.hiddenSetup = "b";

      showToast(
        "White's secret queen selected. Pass the device to Black.",
        "success"
      );
    } else {
      game.hiddenSetup = null;

      showToast(
        "Both secret queens selected. Game started!",
        "success"
      );
    }

    selected = null;
    legalTargets = [];

    renderAll();

    return true;
  }

  /* ==========================================================
     15. MOVE NOTATION
     ========================================================== */

  function notationFor(state, move) {
    const piece = state.board[move.fr][move.fc];

    if (!piece) return "";

    if (move.castle) {
      return move.tc > move.fc
        ? "O-O"
        : "O-O-O";
    }

    const target = state.board[move.tr][move.tc];

    const capture = target || move.enPassant;

    const letter = piece.type === "p"
      ? ""
      : piece.type.toUpperCase();

    const destination = squareName(
      move.tr,
      move.tc,
      state.board.length
    );

    let notation =
      letter +
      (capture ? "x" : "") +
      destination;

    if (
      piece.type === "p" &&
      capture
    ) {
      notation =
        FILES[move.fc] +
        "x" +
        destination;
    }

    if (
      piece.type === "p" &&
      (
        move.tr === 0 ||
        move.tr === state.board.length - 1
      )
    ) {
      notation += "=Q";
    }

    return notation;
  }

  /* ==========================================================
     16. EXECUTING A MOVE
     ========================================================== */

  function executeMove(move) {
    if (
      !game ||
      game.status !== "playing" ||
      game.hiddenSetup
    ) {
      return;
    }

    const previous = cloneGame(game);

    const movingPiece =
      previous.board[move.fr][move.fc];

    const captured =
      previous.board[move.tr][move.tc] ||
      move.enPassant;

    let notation = notationFor(previous, move);

    history.push(previous);

    game = applyMove(
      game,
      move,
      false
    );

    evaluateGame(game);

    if (
      game.status !== "finished" &&
      isInCheck(game, game.turn)
    ) {
      notation += "+";
    }

    if (
      game.status === "finished" &&
      game.winner
    ) {
      notation += "#";
    }

    moveHistory.push({
      notation,
      color: movingPiece.color,
      moveNumber: previous.fullmove
    });

    selected = null;
    legalTargets = [];

    if (game.status === "finished") {
      playSound("win");

      showToast(
        game.result,
        "success"
      );
    } else if (captured) {
      playSound("capture");
    } else if (isInCheck(game, game.turn)) {
      playSound("check");
    } else {
      playSound("move");
    }

    renderAll();
  }

  /* ==========================================================
     17. SQUARE INTERACTION
     ========================================================== */

  function onSquareClick(r, c) {
    if (!game) return;

    if (game.hiddenSetup) {
      chooseHiddenQueen(r, c);
      return;
    }

    if (game.status === "finished") {
      return;
    }

    const piece = game.board[r][c];

    if (selected) {
      const move = legalTargets.find(
        candidate =>
          candidate.tr === r &&
          candidate.tc === c
      );

      if (move) {
        executeMove(move);
        return;
      }
    }

    if (
      piece &&
      piece.color === game.turn
    ) {
      if (
        selected &&
        selected.r === r &&
        selected.c === c
      ) {
        selected = null;
        legalTargets = [];
      } else {
        selected = { r, c };

        legalTargets = legalMovesFor(
          game,
          r,
          c
        );

        playSound("select");
      }
    } else {
      selected = null;
      legalTargets = [];
    }

    renderBoard();
  }

  /* ==========================================================
     18. BOARD ORIENTATION
     ========================================================== */

  function displayedCoordinates(size) {
    const coordinates = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        coordinates.push({
          r: flipped ? size - 1 - r : r,
          c: flipped ? size - 1 - c : c,
          displayR: r,
          displayC: c
        });
      }
    }

    return coordinates;
  }

  /* ==========================================================
     19. PIECE RENDERING
     ========================================================== */

  function pieceSymbol(piece) {
    if (!piece) return "";

    const style =
      PIECES[settings.pieceStyle] ||
      PIECES.classic;

    return style[piece.color][piece.type];
  }

  function renderBoard() {
    if (!game) return;

    const element = $("board");

    if (!element) return;

    const board = game.board;
    const size = board.length;

    element.style.setProperty(
      "--size",
      size
    );

    element.className =
      "board theme-" + settings.theme;

    if (settings.animation) {
      element.classList.add("animated");
    }

    if (game.status === "finished") {
      element.classList.add("game-over");
    }

    element.style.setProperty(
      "--piece-scale",
      String(settings.pieceSize / 100)
    );

    const fragment = document.createDocumentFragment();

    const coordinates = displayedCoordinates(size);

    for (const position of coordinates) {
      const {
        r,
        c,
        displayR,
        displayC
      } = position;

      const piece = board[r][c];

      const square = document.createElement("button");

      square.type = "button";

      square.className = "square";

      square.setAttribute(
        "role",
        "gridcell"
      );

      square.setAttribute(
        "aria-label",
        `${squareName(r, c, size)} ${
          piece
            ? colorName(piece.color) + " " + piece.type
            : "empty"
        }`
      );

      if ((r + c) % 2 === 1) {
        square.classList.add("dark-square");
      }

      if (
        selected &&
        selected.r === r &&
        selected.c === c
      ) {
        square.classList.add("selected");
      }

      if (
        game.lastMove &&
        (
          (
            game.lastMove.fr === r &&
            game.lastMove.fc === c
          ) ||
          (
            game.lastMove.tr === r &&
            game.lastMove.tc === c
          )
        )
      ) {
        square.classList.add("lastmove");
      }

      const legal = legalTargets.some(
        move =>
          move.tr === r &&
          move.tc === c
      );

      if (legal && settings.legal) {
        square.classList.add(
          piece ? "capture-target" : "legal"
        );
      }

      if (
        piece &&
        piece.type === "k" &&
        isInCheck(game, piece.color)
      ) {
        square.classList.add("in-check");
      }

      if (piece) {
        const span = document.createElement("span");

        span.className =
          "piece " +
          (piece.color === "w"
            ? "white-piece"
            : "black-piece");

        span.textContent = pieceSymbol(piece);

        square.appendChild(span);
      }

      if (settings.coords) {
        if (displayC === 0) {
          const rank = document.createElement("span");

          rank.className = "coord";

          rank.textContent = size - r;

          square.appendChild(rank);
        }

        if (displayR === size - 1) {
          const file = document.createElement("span");

          file.className = "coord file";

          file.textContent = FILES[c];

          square.appendChild(file);
        }
      }

      square.addEventListener(
        "click",
        () => onSquareClick(r, c)
      );

      fragment.appendChild(square);
    }

    element.replaceChildren(fragment);
  }

  /* ==========================================================
     20. PLAYER STATUS
     ========================================================== */

  function renderPlayerStatus() {
    if (!game) return;

    const white = $("whiteStatus");
    const black = $("blackStatus");

    if (game.status === "finished") {
      white.textContent = game.result;
      black.textContent = game.result;
      return;
    }

    white.textContent =
      game.turn === "w"
        ? "Your move"
        : "Waiting";

    black.textContent =
      game.turn === "b"
        ? "Your move"
        : "Waiting";

    if (isInCheck(game, "w")) {
      white.textContent = "In check!";
    }

    if (isInCheck(game, "b")) {
      black.textContent = "In check!";
    }
  }

  /* ==========================================================
     21. CAPTURED PIECES
     ========================================================== */

  function renderCaptures() {
    if (!game) return;

    function capturedText(color) {
      return game.captured[color]
        .map(type => {
          const opponent = other(color);

          return PIECES.classic[opponent][type];
        })
        .join("");
    }

    $("whiteCaptures").textContent =
      capturedText("w");

    $("blackCaptures").textContent =
      capturedText("b");
  }

  /* ==========================================================
     22. TURN INDICATOR
     ========================================================== */

  function renderTurn() {
    if (!game) return;

    const turnLabel = $("turnLabel");

    if (game.status === "finished") {
      turnLabel.textContent =
        game.winner
          ? `${colorName(game.winner)} wins`
          : "Draw";

      return;
    }

    turnLabel.textContent =
      game.turn === "w"
        ? "♔ White"
        : "♚ Black";
  }

  /* ==========================================================
     23. HIDDEN QUEEN NOTICE
     ========================================================== */

  function renderSecretNotice() {
    const notice = $("secretNotice");

    if (!notice) return;

    if (game.mode !== "hidden") {
      notice.classList.add("hidden");
      return;
    }

    notice.classList.remove("hidden");

    if (game.hiddenSetup) {
      notice.textContent =
        `SECRET SETUP: ${colorName(game.hiddenSetup)} ` +
        "must select a pawn to become a hidden queen.";
    } else {
      notice.textContent =
        "Hidden Queen active. Secret queens look like pawns.";
    }
  }

  /* ==========================================================
     24. MOVE HISTORY
     ========================================================== */

  function renderHistory() {
    const element = $("history");

    if (!element) return;

    element.replaceChildren();

    if (moveHistory.length === 0) {
      const empty = document.createElement("div");

      empty.className = "empty-history";

      empty.textContent =
        "Your story begins with the first move.";

      element.appendChild(empty);

      return;
    }

    const rows = new Map();

    for (const move of moveHistory) {
      if (!rows.has(move.moveNumber)) {
        rows.set(move.moveNumber, {
          white: "",
          black: ""
        });
      }

      const row = rows.get(move.moveNumber);

      if (move.color === "w") {
        row.white = move.notation;
      } else {
        row.black = move.notation;
      }
    }

    for (const [number, moves] of rows) {
      const row = document.createElement("div");

      row.className = "move-row";

      const numberSpan = document.createElement("span");
      const whiteSpan = document.createElement("span");
      const blackSpan = document.createElement("span");

      numberSpan.textContent = number + ".";
      whiteSpan.textContent = moves.white;
      blackSpan.textContent = moves.black;

      row.append(
        numberSpan,
        whiteSpan,
        blackSpan
      );

      element.appendChild(row);
    }

    element.scrollTop = element.scrollHeight;
  }

  /* ==========================================================
     25. COMPLETE GAME RENDER
     ========================================================== */

  function renderAll() {
    renderBoard();
    renderPlayerStatus();
    renderCaptures();
    renderTurn();
    renderSecretNotice();
    renderHistory();
  }

  /* ==========================================================
     26. UNDO
     ========================================================== */

  function undoMove() {
    if (history.length === 0) {
      showToast(
        "No moves to undo.",
        "error"
      );
      return;
    }

    game = history.pop();

    moveHistory.pop();

    selected = null;
    legalTargets = [];

    renderAll();

    playSound("undo");
  }

  /* ==========================================================
     27. SOUND ENGINE
     ========================================================== */

  function getAudioContext() {
    if (!settings.sound) return null;

    try {
      if (!audioContext) {
        const Context =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!Context) return null;

        audioContext = new Context();
      }

      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }

      return audioContext;
    } catch {
      return null;
    }
  }

  function tone(
    frequency,
    duration,
    type = "sine",
    volume = 0.06,
    delay = 0
  ) {
    const context = getAudioContext();

    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    const now = context.currentTime + delay;

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
      frequency,
      now
    );

    gain.gain.setValueAtTime(
      0.0001,
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      Math.max(volume, 0.0002),
      now + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  function playSound(name) {
    if (!settings.sound) return;

    switch (name) {
      case "select":
        tone(540, 0.045, "sine", 0.018);
        break;

      case "move":
        tone(340, 0.08, "triangle", 0.045);
        tone(440, 0.07, "sine", 0.02, 0.025);
        break;

      case "capture":
        tone(180, 0.15, "sawtooth", 0.035);
        tone(110, 0.12, "triangle", 0.04, 0.025);
        break;

      case "check":
        tone(650, 0.12, "square", 0.025);
        tone(780, 0.12, "sine", 0.04, 0.1);
        break;

      case "win":
        tone(440, 0.18, "sine", 0.05);
        tone(550, 0.18, "sine", 0.05, 0.15);
        tone(660, 0.25, "sine", 0.05, 0.3);
        break;

      case "undo":
        tone(400, 0.07, "triangle", 0.03);
        tone(300, 0.09, "triangle", 0.03, 0.05);
        break;

      case "start":
        tone(400, 0.09, "sine", 0.03);
        tone(600, 0.13, "sine", 0.04, 0.09);
        break;
    }
  }

  /* ==========================================================
     28. TOAST NOTIFICATIONS
     ========================================================== */

  function showToast(message, type = "normal") {
    let container = document.querySelector(
      ".toast-container"
    );

    if (!container) {
      container = document.createElement("div");

      container.className = "toast-container";

      document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    toast.className = "toast";

    if (type === "success" || type === "error") {
      toast.classList.add(type);
    }

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();

      if (!container.children.length) {
        container.remove();
      }
    }, 3200);
  }

  /* ==========================================================
     29. NAVIGATION
     ========================================================== */

  const PAGE_CONTENT = {
    play: {
      title: "Make your next move",
      emphasis: "legendary.",
      subtitle:
        "Classic strategy. Unpredictable rules. Endless rematches."
    },
    modes: {
      title: "Choose your",
      emphasis: "chaos.",
      subtitle:
        "Explore experimental chess variants and unexpected rules."
    },
    settings: {
      title: "Make it",
      emphasis: "yours.",
      subtitle:
        "Customize your chessboard, pieces, sounds and controls."
    }
  };

  function showView(name) {
    const views = {
      play: $("playView"),
      modes: $("modesView"),
      settings: $("settingsView")
    };

    for (const [key, element] of Object.entries(views)) {
      if (!element) continue;

      element.classList.toggle(
        "hidden",
        key !== name
      );
    }

    document.querySelectorAll(".nav").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.view === name
      );
    });

    const page = PAGE_CONTENT[name];

    if (page) {
      const title = $("pageTitle");

      title.replaceChildren();

      title.append(
        document.createTextNode(page.title + " ")
      );

      const emphasis = document.createElement("em");

      emphasis.textContent = page.emphasis;

      title.appendChild(emphasis);

      $("pageSubtitle").textContent = page.subtitle;
    }
  }

  /* ==========================================================
     30. GAME MODE CARDS
     ========================================================== */

  function renderModeCards() {
    const grid = $("modeGrid");

    if (!grid) return;

    grid.replaceChildren();

    $("modeCount").textContent =
      `${MODES.length} MODES AVAILABLE`;

    for (const mode of MODES) {
      const card = document.createElement("article");

      card.className = "mode-card";

      const icon = document.createElement("div");
      icon.className = "mode-emoji";
      icon.textContent = mode.icon;

      const tag = document.createElement("div");
      tag.className = "mode-tag";
      tag.textContent = mode.tag;

      const title = document.createElement("h3");
      title.textContent = mode.name;

      const description = document.createElement("p");
      description.textContent = mode.description;

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Play this mode";

      button.addEventListener("click", () => {
        newGame(mode.id);

        showToast(
          `${mode.name} started!`,
          "success"
        );
      });

      card.append(
        icon,
        title,
        description,
        tag,
        button
      );

      grid.appendChild(card);
    }
  }

  /* ==========================================================
     31. BOARD THEME CONTROLS
     ========================================================== */

  function renderThemeChoices() {
    const container = $("themeChoices");

    if (!container) return;

    container.replaceChildren();

    for (const theme of THEMES) {
      const button = document.createElement("button");

      button.type = "button";

      button.className = "theme-choice";

      button.title = theme.name;

      button.setAttribute(
        "aria-label",
        theme.name + " board theme"
      );

      button.setAttribute(
        "aria-pressed",
        settings.theme === theme.id
          ? "true"
          : "false"
      );

      button.style.setProperty(
        "--l",
        theme.light
      );

      button.style.setProperty(
        "--d",
        theme.dark
      );

      if (settings.theme === theme.id) {
        button.classList.add("active");
      }

      button.addEventListener("click", () => {
        settings.theme = theme.id;

        saveSettings();

        renderThemeChoices();
        renderBoard();

        playSound("select");
      });

      container.appendChild(button);
    }
  }

  /* ==========================================================
     32. SETTINGS BINDING
     ========================================================== */

  function bindSettings() {
    const pieceStyle = $("pieceStyle");
    const orientation = $("orientation");
    const sound = $("soundToggle");
    const legal = $("legalToggle");
    const coords = $("coordsToggle");
    const animation = $("animationToggle");
    const pieceSize = $("pieceSize");

    pieceStyle.value = settings.pieceStyle;
    orientation.value = settings.orientation;

    sound.checked = settings.sound;
    legal.checked = settings.legal;
    coords.checked = settings.coords;
    animation.checked = settings.animation;

    pieceSize.value = settings.pieceSize;

    pieceStyle.addEventListener("change", event => {
      settings.pieceStyle = event.target.value;

      saveSettings();
      renderBoard();
    });

    orientation.addEventListener("change", event => {
      settings.orientation = event.target.value;

      flipped = settings.orientation === "black";

      saveSettings();
      renderBoard();
    });

    sound.addEventListener("change", event => {
      settings.sound = event.target.checked;

      saveSettings();

      if (settings.sound) {
        playSound("select");
      }
    });

    legal.addEventListener("change", event => {
      settings.legal = event.target.checked;

      saveSettings();
      renderBoard();
    });

    coords.addEventListener("change", event => {
      settings.coords = event.target.checked;

      saveSettings();
      renderBoard();
    });

    animation.addEventListener("change", event => {
      settings.animation = event.target.checked;

      saveSettings();
      renderBoard();
    });

    pieceSize.addEventListener("input", event => {
      settings.pieceSize = Number(event.target.value);

      saveSettings();
      renderBoard();
    });

    $("resetSettings").addEventListener("click", () => {
      settings = { ...DEFAULT_SETTINGS };

      saveSettings();

      flipped = false;

      pieceStyle.value = settings.pieceStyle;
      orientation.value = settings.orientation;

      sound.checked = settings.sound;
      legal.checked = settings.legal;
      coords.checked = settings.coords;
      animation.checked = settings.animation;

      pieceSize.value = settings.pieceSize;

      renderThemeChoices();
      renderBoard();

      showToast(
        "Settings reset to defaults.",
        "success"
      );
    });
  }

  /* ==========================================================
     33. KEYBOARD SHORTCUTS
     ========================================================== */

  function bindKeyboard() {
    document.addEventListener("keydown", event => {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA"
        )
      ) {
        return;
      }

      if (
        event.key === "Escape" &&
        selected
      ) {
        selected = null;
        legalTargets = [];

        renderBoard();
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();

        undoMove();
      }
    });
  }

  /* ==========================================================
     34. BUTTON EVENTS
     ========================================================== */

  function bindButtons() {
    $("newGame").addEventListener("click", () => {
      newGame(currentMode);
    });

    $("undoBtn").addEventListener("click", () => {
      undoMove();
    });

    $("flipBtn").addEventListener("click", () => {
      flipped = !flipped;

      renderBoard();

      playSound("select");
    });

    document.querySelectorAll(".nav").forEach(button => {
      button.addEventListener("click", () => {
        showView(button.dataset.view);

        playSound("select");
      });
    });
  }

  /* ==========================================================
     35. INITIALIZATION
     ========================================================== */

  function initialize() {
    renderModeCards();
    renderThemeChoices();

    bindSettings();
    bindButtons();
    bindKeyboard();

    newGame("classic");

    console.info(
      "TwistChess initialized successfully."
    );

    console.info(
      `${MODES.length} game modes registered.`
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }

})();
