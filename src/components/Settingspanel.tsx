import { BoardSize, IconPack, ThemeName } from "../types";

interface SettingsPanelProps {
  theme: ThemeName;
  onThemeChange: (nextTheme: ThemeName) => void;
  boardSize: BoardSize;
  onBoardSizeChange: (nextSize: BoardSize) => void;
  iconPack: IconPack;
  onIconPackChange: (pack: IconPack) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  soundLevel: number;
  onSoundLevelChange: (value: number) => void;
}

export default function SettingsPanel({
  theme,
  onThemeChange,
  boardSize,
  onBoardSizeChange,
  iconPack,
  onIconPackChange,
  soundEnabled,
  onSoundToggle,
  soundLevel,
  onSoundLevelChange
}: SettingsPanelProps) {
  return (
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
                { name: "midnight", css: "linear-gradient(135deg, #0b1020, #6ea8fe)" },
                { name: "sunset", css: "linear-gradient(135deg, #1b0f18, #ff7eb6)" },
                { name: "aurora", css: "linear-gradient(135deg, #071a18, #5eead4)" },
                { name: "classic", css: "linear-gradient(135deg, #f4f2ee, #3b82f6)" },
                { name: "chesscom", css: "linear-gradient(135deg, #101926, #0b5ad3)" }
              ].map((swatch) => (
                <button
                  key={swatch.name}
                  type="button"
                  className={`swatch ${theme === swatch.name ? "active" : ""}`}
                  style={{ background: swatch.css }}
                  onClick={() => onThemeChange(swatch.name as ThemeName)}
                />
              ))}
            </div>
          </div>

          <div className="setting-row">
            <label>
              <i className="fa-solid fa-icons"></i> Icon Pack
            </label>
            <select
              className="select"
              value={iconPack}
              onChange={(e) => onIconPackChange(e.target.value as IconPack)}
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
              className="select"
              value={boardSize}
              onChange={(e) => onBoardSizeChange(e.target.value as BoardSize)}
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
              onChange={(e) => onSoundLevelChange(Number(e.target.value))}
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

          <div className="setting-row">
            <label>
              <i className={`fa-solid ${soundEnabled ? "fa-volume-high" : "fa-volume-xmark"}`}></i> Enabled
            </label>
            <button className="action-btn" type="button" onClick={onSoundToggle}>
              {soundEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}