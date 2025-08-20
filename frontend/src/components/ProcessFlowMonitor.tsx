import React, { useState, useEffect } from 'react';
import './ProcessFlowMonitor.css';

interface ProcessStatus {
  [key: string]: {
    status: string;
    active_batches: number;
    recent_alerts: number;
    temperature?: number;
    pressure?: number;
    flow_rate?: number;
    operator?: string;
  };
}

const ProcessFlowMonitor: React.FC = () => {
  const [processStatus, setProcessStatus] = useState<ProcessStatus>({});
  const [selectedProcess, setSelectedProcess] = useState<string>('');
  const [controlMetrics, setControlMetrics] = useState<any>({});

  useEffect(() => {
    loadDemoData();
    const interval = setInterval(loadDemoData, 10000); // 10秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  const loadDemoData = () => {
    // より多様なデモデータ
    const demoStatus = {
      P1: { 
        status: 'running', 
        active_batches: 2, 
        recent_alerts: 0,
        temperature: 165,
        pressure: 8.2,
        flow_rate: 450,
        operator: 'OP005',
        kappa_number: 15.2,
        brightness: 86.5
      },
      P2: { 
        status: 'running', 
        active_batches: 1, 
        recent_alerts: 0,
        temperature: 45,
        pressure: 2.1,
        flow_rate: 380,
        operator: 'OP012',
        consistency: 3.4,
        ph: 7.1
      },
      P3: { 
        status: 'alarm', 
        active_batches: 1, 
        recent_alerts: 2,
        temperature: 180,
        pressure: 1.8,
        flow_rate: 1200,
        operator: 'OP007',
        basis_weight: 80.3,
        moisture: 5.2,
        speed: 1180
      },
      P4: { 
        status: 'running', 
        active_batches: 1, 
        recent_alerts: 0,
        temperature: 25,
        pressure: 1.0,
        flow_rate: 85,
        operator: 'OP018',
        smoothness: 148,
        rolls: 12
      }
    };
    
    setProcessStatus(demoStatus);
    
    // 制御室メトリクス
    setControlMetrics({
      totalProduction: 1247,
      efficiency: 94.2,
      energyConsumption: 4850,
      qualityRate: 96.8,
      alerts: {
        critical: 1,
        warning: 3,
        info: 2
      }
    });
  };

  const getStatusIcon = (status: string, alerts: number) => {
    if (alerts > 0) return '⚠️';
    if (status === 'running') return '▶️';
    if (status === 'maintenance') return '🔧';
    return '⏸️';
  };

  const getEquipmentIcon = (processCode: string) => {
    const icons = {
      P1: '🏭', // 蒸解釜
      P2: '⚡', // ミキサー
      P3: '📄', // 抄紙機
      P4: '✂️'  // 仕上げ
    };
    return icons[processCode as keyof typeof icons] || '⚙️';
  };

  const openProcessDetail = (processCode: string) => {
    setSelectedProcess(processCode);
  };

  const closeProcessDetail = () => {
    setSelectedProcess('');
  };

  const getProcessTitle = (code: string) => {
    const titles = {
      P1: { title: 'パルプ化工程', subtitle: '蒸解・洗浄・漂白' },
      P2: { title: '調成工程', subtitle: '叩解・薬品添加' },
      P3: { title: '抄紙工程', subtitle: 'シート形成・プレス・乾燥' },
      P4: { title: '仕上げ工程', subtitle: 'カレンダー・巻取・断裁' }
    };
    return titles[code as keyof typeof titles] || { title: code, subtitle: '' };
  };

  const renderProcessUnit = (processCode: string, data: any) => {
    const processInfo = getProcessTitle(processCode);
    
    return (
      <div 
        className={`process-unit ${data.status}`}
        onClick={() => openProcessDetail(processCode)}
      >
        {data.recent_alerts > 0 && (
          <div className="alert-badge">{data.recent_alerts}</div>
        )}
        
        <div className="process-header">
          <div className="process-title-group">
            <div className="process-icon">
              {getStatusIcon(data.status, data.recent_alerts)}
            </div>
            <div>
              <h3 className="process-title">{processInfo.title}</h3>
              <p className="process-subtitle">{processInfo.subtitle}</p>
            </div>
          </div>
          <div className={`process-status-indicator ${data.status}`}></div>
        </div>

        <div className="process-visual">
          <div className="equipment-icon">
            {getEquipmentIcon(processCode)}
          </div>
          <div className="process-animation"></div>
        </div>

        <div className="process-metrics">
          <div className="metric">
            <div className="metric-label">温度</div>
            <div className="metric-value">{data.temperature}°C</div>
          </div>
          <div className="metric">
            <div className="metric-label">圧力</div>
            <div className="metric-value">{data.pressure} MPa</div>
          </div>
        </div>

        <div className="operator-info">
          <span className="operator-icon">👨‍🔬</span>
          <span>{data.operator}</span>
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!selectedProcess || !processStatus[selectedProcess]) return null;

    const data = processStatus[selectedProcess];
    const processInfo = getProcessTitle(selectedProcess);

    return (
      <div className="process-detail-modal" onClick={closeProcessDetail}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">
              <span className="modal-title-icon">{getEquipmentIcon(selectedProcess)}</span>
              {processInfo.title} - 詳細情報
            </h2>
            <button className="modal-close-btn" onClick={closeProcessDetail}>
              ×
            </button>
          </div>
          
          <div className="modal-body">
            <div className="modal-metrics-grid">
              <div className="modal-metric-card">
                <h4 className="modal-metric-title">運転パラメータ</h4>
                <div className="modal-metric-item">
                  <span className="modal-metric-label">稼働状況</span>
                  <span className={`modal-metric-value ${data.status}`}>
                    {data.status === 'running' ? '稼働中' : 
                     data.status === 'alarm' ? 'アラート' : '停止中'}
                  </span>
                </div>
                <div className="modal-metric-item">
                  <span className="modal-metric-label">温度</span>
                  <span className="modal-metric-value">{data.temperature}°C</span>
                </div>
                <div className="modal-metric-item">
                  <span className="modal-metric-label">圧力</span>
                  <span className="modal-metric-value">{data.pressure} MPa</span>
                </div>
                <div className="modal-metric-item">
                  <span className="modal-metric-label">流量</span>
                  <span className="modal-metric-value">{data.flow_rate} L/min</span>
                </div>
              </div>

              <div className="modal-metric-card">
                <h4 className="modal-metric-title">品質指標</h4>
                {selectedProcess === 'P1' && (
                  <>
                    <div className="modal-metric-item">
                      <span className="modal-metric-label">カッパー価</span>
                      <span className="modal-metric-value">{(data as any).kappa_number}</span>
                    </div>
                    <div className="modal-metric-item">
                      <span className="modal-metric-label">白色度</span>
                      <span className="modal-metric-value">{(data as any).brightness}%</span>
                    </div>
                  </>
                )}
                {selectedProcess === 'P2' && (
                  <>
                    <div className="modal-metric-item">
                      <span className="modal-metric-label">パルプ濃度</span>
                      <span className="modal-metric-value">{(data as any).consistency}%</span>
                    </div>
                    <div className="modal-metric-item">
                      <span className="modal-metric-label">pH値</span>
                      <span className="modal-metric-value">{(data as any).ph}</span>
                    </div>
                  </>
                )}
                {selectedProcess === 'P3' && (
                  <>
                    <div className="modal-metric-item">
                      <span className="modal-metric-label">坪量</span>
                      <span className="modal-metric-value">{(data as any).basis_weight} g/m²</span>
                    </div>
                    <div className="modal-metric-item">
                      <span className="modal-metric-label">水分率</span>
                      <span className="modal-metric-value">{(data as any).moisture}%</span>
                    </div>
                    <div className="modal-metric-item">
                      <span className="modal-metric-label">マシン速度</span>
                      <span className="modal-metric-value">{(data as any).speed} m/min</span>
                    </div>
                  </>
                )}
                {selectedProcess === 'P4' && (
                  <>
                    <div className="modal-metric-item">
                      <span className="modal-metric-label">平滑度</span>
                      <span className="modal-metric-value">{(data as any).smoothness} ml/min</span>
                    </div>
                    <div className="modal-metric-item">
                      <span className="modal-metric-label">完成ロール数</span>
                      <span className="modal-metric-value">{(data as any).rolls} 本</span>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-metric-card">
                <h4 className="modal-metric-title">作業者情報</h4>
                <div className="modal-metric-item">
                  <span className="modal-metric-label">担当オペレーター</span>
                  <span className="modal-metric-value">{data.operator}</span>
                </div>
                <div className="modal-metric-item">
                  <span className="modal-metric-label">アクティブバッチ</span>
                  <span className="modal-metric-value">{data.active_batches} 個</span>
                </div>
                <div className="modal-metric-item">
                  <span className="modal-metric-label">今日のアラート</span>
                  <span className={`modal-metric-value ${data.recent_alerts > 0 ? 'critical' : 'good'}`}>
                    {data.recent_alerts} 件
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="process-flow-monitor">
      <h2>🏭 製紙工場リアルタイム工程フロー監視</h2>
      
      <div className="main-container">
        {/* 左サイドバー - 制御室 */}
        <div className="control-sidebar">
          <div className="control-room-header">
            <div className="control-room-title">
              <span className="control-room-icon">🖥️</span>
              中央制御室
            </div>
            <p className="control-room-subtitle">統合監視システム</p>
          </div>
          
          <div className="control-metrics-section">
            <div className="metrics-group">
              <h4>生産実績</h4>
              <div className="metric-row">
                <span className="metric-label">本日生産量:</span>
                <span className="metric-value good">{controlMetrics.totalProduction} t</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">稼働効率:</span>
                <span className="metric-value good">{controlMetrics.efficiency}%</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">品質達成率:</span>
                <span className="metric-value good">{controlMetrics.qualityRate}%</span>
              </div>
            </div>

            <div className="metrics-group">
              <h4>エネルギー</h4>
              <div className="metric-row">
                <span className="metric-label">消費電力:</span>
                <span className="metric-value warning">{controlMetrics.energyConsumption} kW</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">原単位:</span>
                <span className="metric-value">4.5 GJ/t</span>
              </div>
            </div>

            <div className="metrics-group">
              <h4>アラート状況</h4>
              <div className="metric-row">
                <span className="metric-label">重要:</span>
                <span className="metric-value critical">{controlMetrics.alerts?.critical} 件</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">警告:</span>
                <span className="metric-value warning">{controlMetrics.alerts?.warning} 件</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">情報:</span>
                <span className="metric-value">{controlMetrics.alerts?.info} 件</span>
              </div>
            </div>
          </div>
        </div>

        {/* 中央工程エリア */}
        <div className="factory-layout">
          <div className="process-flow-container">
            {/* 原料エリア */}
            <div className="raw-material-area">
              <div className="raw-material-container">
                <div className="raw-material-header">
                  <h3 className="raw-material-title">原料供給</h3>
                  <p className="raw-material-subtitle">Raw Materials</p>
                </div>
                
                <div className="silo-group">
                  <div className="silo">
                    <div className="silo-container">
                      <div className="silo-vessel">
                        <div className="silo-icon">🌲</div>
                        <div className="silo-level wood-chips" style={{height: '75%'}}></div>
                      </div>
                    </div>
                    <div className="silo-label">木材チップ</div>
                    <div className="silo-percentage">75%</div>
                  </div>
                  
                  <div className="silo">
                    <div className="silo-container">
                      <div className="silo-vessel">
                        <div className="silo-icon">♻️</div>
                        <div className="silo-level recycled-paper" style={{height: '45%'}}></div>
                      </div>
                    </div>
                    <div className="silo-label">古紙</div>
                    <div className="silo-percentage">45%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 工程ユニット */}
            <div className="p1-area">
              {processStatus.P1 && renderProcessUnit('P1', processStatus.P1)}
            </div>

            <div className="p2-area">
              {processStatus.P2 && renderProcessUnit('P2', processStatus.P2)}
            </div>

            <div className="p3-area">
              {processStatus.P3 && renderProcessUnit('P3', processStatus.P3)}
            </div>

            <div className="p4-area">
              {processStatus.P4 && renderProcessUnit('P4', processStatus.P4)}
            </div>
          </div>
        </div>
      </div>

      {/* 詳細モーダル */}
      {renderDetailModal()}
    </div>
  );
};

export default ProcessFlowMonitor;