export default function ProfilePanel() {
  return (
    <section className="profile-layout">
      <div className="panel profile-panel">
        <div className="profile-header">
          <div className="profile-main">
            <div className="avatar large">A</div>
            <div className="profile-meta-box">
              <strong>Aisha Knight</strong>
              <span>Grandmaster • 1482</span>
            </div>
          </div>
          <button className="primary-btn small" type="button">
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
  );
}