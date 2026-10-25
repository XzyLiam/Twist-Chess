export default function AnalysisPanel() {
  return (
    <section className="panel large-panel">
      <div className="panel-head">
        <h3>Own Analysis</h3>
        <span className="pill"><i className="fa-solid fa-layer-group"></i> PGN review</span>
      </div>

      <div className="analysis-box">
        <div className="analysis-split">
          <div className="analysis-card">
            <h4>Opening</h4>
            <p>Italian Game — tempo advantage</p>
          </div>
          <div className="analysis-card">
            <h4>Middle Game</h4>
            <p>Central tension, queen activity heavy</p>
          </div>
          <div className="analysis-card">
            <h4>Endgame</h4>
            <p>Rook endgame conversion and king activity</p>
          </div>
        </div>

        <div className="chart-box">
          <div className="chart-line">
            <span style={{ height: "14%" }}></span>
            <span style={{ height: "22%" }}></span>
            <span style={{ height: "29%" }}></span>
            <span style={{ height: "47%" }}></span>
            <span style={{ height: "67%" }}></span>
            <span style={{ height: "80%" }}></span>
            <span style={{ height: "76%" }}></span>
            <span style={{ height: "90%" }}></span>
          </div>
        </div>
      </div>
    </section>
  );
}