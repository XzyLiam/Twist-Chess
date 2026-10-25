export type ThemeName = "midnight" | "sunset" | "aurora" | "classic" | "chesscom";
export type ViewName = "home" | "puzzles" | "analysis" | "profile" | "friends" | "modes" | "settings";
export type ModeName =
  | "classic"
  | "rook"
  | "hiddenqueen"
  | "bigboard"
  | "smallboard"
  | "mirror"
  | "chaos"
  | "nocastle"
  | "daily";
export type BoardSize = "small" | "normal" | "large";
export type IconPack = "classic" | "minimal" | "neon";

export interface GameMode {
  key: ModeName;
  label: string;
  subtitle: string;
  icon: string;
}

export interface FriendRecord {
  name: string;
  status: string;
  color: string;
}

export interface RecentGame {
  result: "W" | "L" | "D";
  label: string;
  subtitle: string;
  score: string;
}

export interface DailyPuzzle {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  theme: string;
  solution: string;
  pattern: "Mate in 2" | "Tactics" | "Attack" | "Defense" | "Endgame";
}