import { friendList } from "../data/gameModes";

export default function FriendsPanel() {
  return (
    <section className="panel list-panel">
      <div className="panel-head">
        <h3>Friends</h3>
        <span className="pill"><i className="fa-solid fa-plus"></i> Invite</span>
      </div>

      <div className="friends-list">
        {friendList.map((friend) => (
          <div className="friend-item" key={friend.name}>
            <div className="friend-main">
              <div className="avatar small" style={{ background: friend.color }}>{friend.name[0]}</div>
              <div className="friend-meta">
                <strong>{friend.name}</strong>
                <small>{friend.status}</small>
              </div>
            </div>
            <span className="status-pill"><span className="dot"></span> Challenge</span>
          </div>
        ))}
      </div>
    </section>
  );
}