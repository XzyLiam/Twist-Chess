import React from "react";

interface TopBarProps {
  onThemeToggle: () => void;
  onSoundToggle: () => void;
  soundEnabled: boolean;
  onLoginOpen: () => void;
}

export default function TopBar({
  onThemeToggle,
  onSoundToggle,
  soundEnabled,
  onLoginOpen
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="search-box">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="Search games, players, modes..." />
      </div>

      <div className="top-actions">
        <button className="action-btn" onClick={onThemeToggle}>
          <i className="fa-solid fa-sparkles"></i> Theme
        </button>

        <button className="action-btn" onClick={onSoundToggle}>
          <i className={`fa-solid ${soundEnabled ? "fa-volume-high" : "fa-volume-xmark"}`}></i>
          {soundEnabled ? "Sound" : "Muted"}
        </button>

        <button className="primary-btn" onClick={onLoginOpen}>
          <i className="fa-solid fa-right-to-bracket"></i> Login
        </button>
      </div>
    </header>
  );
}