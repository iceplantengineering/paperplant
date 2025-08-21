import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import SummaryDashboard from './components/SummaryDashboard';
import ProcessMonitoring from './components/ProcessMonitoring';
import ProcessFlowMonitor from './components/ProcessFlowMonitor';
import TraceabilitySearch from './components/TraceabilitySearch';

function App() {
  return (
    <Router>
      <div className="dashboard-container">
        <nav className="sidebar">
          <h1>🏭 製紙工場DX<br />ダッシュボード</h1>
          <ul className="nav-menu">
            <li>
              <NavLink to="/" end>
                📊 総合サマリー
              </NavLink>
            </li>
            <li>
              <NavLink to="/process">
                ⚙️ 工程監視
              </NavLink>
            </li>
            <li>
              <NavLink to="/process-flow">
                🏭 工程フロー
              </NavLink>
            </li>
            <li>
              <NavLink to="/traceability">
                🔍 トレーサビリティ
              </NavLink>
            </li>
          </ul>
          
          <div style={{ marginTop: '40px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            <p>製紙工場の</p>
            <p>• トレーサビリティ管理</p>
            <p>• リアルタイム監視</p>
            <p>• 工程フロー可視化</p>
            <p>• KPI分析</p>
            <p>を統合したダッシュボード</p>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<SummaryDashboard />} />
            <Route path="/process" element={<ProcessMonitoring />} />
            <Route path="/process-flow" element={<ProcessFlowMonitor />} />
            <Route path="/traceability" element={<TraceabilitySearch />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;