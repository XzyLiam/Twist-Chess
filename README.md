# TwistChess

A responsive, static HTML/CSS/JavaScript local two-player chess variant website.

## Run
Open `index.html` in a browser. For local development, use VS Code Live Server or run `python -m http.server 8000` inside this directory and visit http://localhost:8000.

## Files
- `index.html` — app layout and controls
- `style.css` — responsive styling and themes
- `script.js` — chess logic, modes, UI, sound, and settings

## Modes
Classic, ROOOK, Big Board (10×10), Small Board (6×6), Hidden Queen, Pawn Horde, Knightmare, Bishop Blitz, Queen Rush, No Queens, Atomic Chess, Shuffle Chess, King Race, Pawn Wars, Mirror Army.

## Limitations / important notes
This is a local two-player prototype, not an online multiplayer service. Secret queen selection is a pass-and-play honor system; the board doesn't conceal selection from someone watching the screen. The queen-power pawn still promotes normally and can be captured. Atomic, Horde, King Race, and custom board variants are experimental adaptations, not tournament-certified rule sets. Undo is shared by both players. Pawn promotion is automatic to queen. No chess AI, clocks, accounts, or matchmaking. The application does not use a third-party chess rules engine and has not been exhaustively tested for edge cases.

## GitHub Pages
Push these files to a repository, then go to Settings → Pages → Deploy from a branch → main / root.
