import type { FriendRecord, GameMode, RecentGame } from "../types";

export const gameModes: GameMode[] = [
  { key: "classic", label: "Classic", subtitle: "Original rules", icon: "fa-chess" },
  { key: "rook", label: "ROOK", subtitle: "Knights and bishops become rooks", icon: "fa-chess-rook" },
  { key: "hiddenqueen", label: "Hidden Queen", subtitle: "Secret queen chosen at start", icon: "fa-user-secret" },
  { key: "bigboard", label: "Big Board", subtitle: "Larger battlefield", icon: "fa-expand" },
  { key: "smallboard", label: "Small Board", subtitle: "Fast tactical duels", icon: "fa-compress" },
  { key: "mirror", label: "Mirror", subtitle: "Board flips after moves", icon: "fa-arrows-left-right" },
  { key: "chaos", label: "Chaos", subtitle: "Randomized power-up twist", icon: "fa-bolt" },
  { key: "nocastle", label: "No Castle", subtitle: "Castling disabled", icon: "fa-shield-halved" },
  { key: "daily", label: "Daily Twist", subtitle: "Fresh variant every day", icon: "fa-calendar-day" }
];

export const recentGames: RecentGame[] = [
  { result: "W", label: "Quick Arena", subtitle: "vs Lumen • +14 rating", score: "1-0" },
  { result: "L", label: "ROOK Duel", subtitle: "vs Nova • -7 rating", score: "0-1" },
  { result: "W", label: "Hidden Queen", subtitle: "vs Izzy • +9 rating", score: "1-0" },
  { result: "D", label: "Big Board", subtitle: "vs Kade • draw", score: "½-½" }
];

export const friendList: FriendRecord[] = [
  { name: "Lumen", status: "Online • Blitz", color: "linear-gradient(135deg, #6ea8fe, #7cf5d6)" },
  { name: "Nova", status: "Online • Classic", color: "linear-gradient(135deg, #7cf5d6, #6ea8fe)" },
  { name: "Izzy", status: "Idle • Hidden Queen", color: "linear-gradient(135deg, #ffb454, #ff7a7a)" },
  { name: "Kade", status: "In Match • Large Board", color: "linear-gradient(135deg, #9be9a8, #5eead4)" },
  { name: "Milo", status: "Reviewing • Analysis", color: "linear-gradient(135deg, #c4b5fd, #7dd3fc)" }
];