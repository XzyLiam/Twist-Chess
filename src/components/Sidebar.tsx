import React from "react";
import { ViewName } from "../types";

interface SidebarProps {
  view: ViewName;
  onViewChange: (next: ViewName) => void;
}

export default function Sidebar({ view, onViewChange }: SidebarProps) {
  const navItems: Array<{ key: ViewName; label: string; icon: string }> = [
    { key: "home", label: "Home", icon: "fa-house" },
    { key: "puzzles", label: "Puzzles", icon: "fa-puzzle-piece" },
    { key: "analysis", label: "Analysis", icon: "fa-chart-line" },
    { key: "profile", label: "Profile", icon: "fa-user" },
    { key: "friends", label: "Friends", icon: "fa-user-group" },
    { key: "modes", label: "Modes", icon: "fa-chess-knight" },
    { key: "settings", label: "Settings", icon: "fa-gear" }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">T</div>
        <div className="brand-copy">
          <strong>TwistChess</strong>
          <span>ARENA</span>
        </div>
      </div>

      <nav className="nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${view === item.key ? "active" : ""}`}
            onClick={() => onViewChange(item.key)}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}
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
  );
}