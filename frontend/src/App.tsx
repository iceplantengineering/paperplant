import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import SummaryDashboard from './components/SummaryDashboard';
import ProcessMonitoring from './components/ProcessMonitoring';
import ProcessFlowMonitor from './components/ProcessFlowMonitor';
import TraceabilitySearch from './components/TraceabilitySearch';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <Router>
      <div className="dashboard-container">
        <nav className="sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <h1 style={{ whiteSpace: 'pre-line', fontSize: '16px', margin: 0 }}>{t('sidebar.title')}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  color: 'white',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  minWidth: '60px'
                }}
                title={language === 'ja' ? t('language.english') : t('language.japanese')}
              >
                {language === 'ja' ? 'EN' : 'JP'}
              </button>
            </div>
          </div>
          <ul className="nav-menu">
            <li>
              <NavLink to="/" end>
                {t('nav.summary')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/process">
                {t('nav.process')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/process-flow">
                {t('nav.processFlow')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/traceability">
                {t('nav.traceability')}
              </NavLink>
            </li>
          </ul>
          
          <div style={{ marginTop: '40px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            <p>{t('sidebar.description.1')}</p>
            <p>{t('sidebar.description.2')}</p>
            <p>{t('sidebar.description.3')}</p>
            <p>{t('sidebar.description.4')}</p>
            <p>{t('sidebar.description.5')}</p>
            <p>{t('sidebar.description.6')}</p>
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

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;