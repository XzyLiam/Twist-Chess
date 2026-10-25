import type { DailyPuzzle } from "../types";

export const dailyPuzzles: DailyPuzzle[] = [
  {
    id: "puzzle-001",
    title: "The Quiet Queen Finish",
    description: "White to move and finish a tactical queen attack with a calm but decisive move.",
    difficulty: "Medium",
    theme: "Opening pressure",
    solution: "Qd8+",
    pattern: "Mate in 2"
  },
  {
    id: "puzzle-002",
    title: "Fork in the Fog",
    description: "A knight jump reveals a fork that forces the king and queen to separate.",
    difficulty: "Easy",
    theme: "Knight tactics",
    solution: "Nf6+",
    pattern: "Tactics"
  },
  {
    id: "puzzle-003",
    title: "The Pin That Breaks",
    description: "A quiet rook move disarms the defense and opens the back rank.",
    difficulty: "Hard",
    theme: "Pin breakthrough",
    solution: "Rxe5",
    pattern: "Attack"
  },
  {
    id: "puzzle-004",
    title: "Roaring Rook",
    description: "The rook slides onto the seventh rank and wins the exchange with style.",
    difficulty: "Medium",
    theme: "Rook lift",
    solution: "Re7",
    pattern: "Attack"
  },
  {
    id: "puzzle-005",
    title: "The Last Defenders",
    description: "A king-side attack demands precision in timing and coordination of the queen and bishop.",
    difficulty: "Expert",
    theme: "King attack",
    solution: "Qh7+",
    pattern: "Mate in 2"
  },
  {
    id: "puzzle-006",
    title: "Stalemate Escape",
    description: "The defense looks lost, but one move changes the board and creates a fortress.",
    difficulty: "Hard",
    theme: "Defense",
    solution: "Kf1",
    pattern: "Defense"
  },
  {
    id: "puzzle-007",
    title: "The Pawn Break",
    description: "A pawn break opens a file and forces the enemy king to choose between material and safety.",
    difficulty: "Medium",
    theme: "Central break",
    solution: "d5",
    pattern: "Tactics"
  },
  {
    id: "puzzle-008",
    title: "Endgame Precision",
    description: "The endgame is drawn by hand, but precise king movement creates a winning conversion.",
    difficulty: "Expert",
    theme: "Endgame conversion",
    solution: "Ke5",
    pattern: "Endgame"
  }
];