import React, { useState, useEffect } from 'react';
import './ProcessFlowMonitor.css';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();
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
      P1: { 
        title: t('language') === 'ja' ? 'パルプ化工程' : 'Pulping Process', 
        subtitle: t('language') === 'ja' ? '蒸解・洗浄・漂白' : 'Digesting, Washing, Bleaching' 
      },
      P2: { 
        title: t('language') === 'ja' ? '調成工程' : 'Stock Preparation', 
        subtitle: t('language') === 'ja' ? '叩解・薬品添加' : 'Refining, Chemical Addition' 
      },
      P3: { 
        title: t('language') === 'ja' ? '抄紙工程' : 'Paper Making', 
        subtitle: t('language') === 'ja' ? 'シート形成・プレス・乾燥' : 'Sheet Forming, Press, Drying' 
      },
      P4: { 
        title: t('language') === 'ja' ? '仕上げ工程' : 'Finishing Process', 
        subtitle: t('language') === 'ja' ? 'カレンダー・巻取・断裁' : 'Calendering, Winding, Cutting' 
      }
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
            <div className="metric-label">{t('processFlow.temperature')}</div>
            <div className="metric-value">{data.temperature}°C</div>
          </div>
          <div className="metric">
            <div className="metric-label">{t('processFlow.pressure')}</div>
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
              {processInfo.title} - {t('processFlow.details')}
            </h2>
            <button className="modal-close-btn" onClick={closeProcessDetail} title={t('processFlow.close')}>
              ×
            </button>
          </div>
          
          <div className="modal-body">
            {/* Status Overview Section */}
            <div className="modal-status-overview">
              <div className="status-indicator-large">
                <div className={`status-circle ${data.status}`}></div>
                <div className="status-info">
                  <h3>{data.status === 'running' ? (t('language') === 'ja' ? '稼働中' : 'Running') : 
                       data.status === 'alarm' ? (t('language') === 'ja' ? 'アラート' : 'Alert') : (t('language') === 'ja' ? '停止中' : 'Stopped')}</h3>
                  <p>{t('processFlow.operator')}: {data.operator}</p>
                </div>
              </div>
              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="stat-value">{data.active_batches}</span>
                  <span className="stat-label">{t('processFlow.activeBatches')}</span>
                </div>
                <div className="quick-stat">
                  <span className={`stat-value ${data.recent_alerts > 0 ? 'critical' : 'good'}`}>{data.recent_alerts}</span>
                  <span className="stat-label">{t('processFlow.todayAlerts')}</span>
                </div>
              </div>
            </div>

            <div className="modal-metrics-grid">
              <div className="modal-metric-card primary">
                <h4 className="modal-metric-title">
                  <span className="metric-icon">⚙️</span>
                  {t('processFlow.parameters')}
                </h4>
                <div className="metric-grid">
                  <div className="modal-metric-item">
                    <span className="modal-metric-label">{t('processFlow.temperature')}</span>
                    <span className="modal-metric-value temperature">{data.temperature}°C</span>
                  </div>
                  <div className="modal-metric-item">
                    <span className="modal-metric-label">{t('processFlow.pressure')}</span>
                    <span className="modal-metric-value pressure">{data.pressure} MPa</span>
                  </div>
                  <div className="modal-metric-item">
                    <span className="modal-metric-label">{t('processFlow.flowRate')}</span>
                    <span className="modal-metric-value flow">{data.flow_rate} L/min</span>
                  </div>
                </div>
              </div>

              <div className="modal-metric-card secondary">
                <h4 className="modal-metric-title">
                  <span className="metric-icon">📊</span>
                  {t('processFlow.qualityIndicators')}
                </h4>
                <div className="quality-metrics">
                  {selectedProcess === 'P1' && (
                    <div className="quality-grid">
                      <div className="quality-metric">
                        <div className="quality-value">{(data as any).kappa_number}</div>
                        <div className="quality-label">{t('quality.param.kappa')}</div>
                      </div>
                      <div className="quality-metric">
                        <div className="quality-value">{(data as any).brightness}%</div>
                        <div className="quality-label">{t('quality.param.brightness')}</div>
                      </div>
                    </div>
                  )}
                  {selectedProcess === 'P2' && (
                    <div className="quality-grid">
                      <div className="quality-metric">
                        <div className="quality-value">{(data as any).consistency}%</div>
                        <div className="quality-label">{t('quality.param.consistency')}</div>
                      </div>
                      <div className="quality-metric">
                        <div className="quality-value">{(data as any).ph}</div>
                        <div className="quality-label">{t('language') === 'ja' ? 'pH値' : 'pH Value'}</div>
                      </div>
                    </div>
                  )}
                  {selectedProcess === 'P3' && (
                    <div className="quality-grid">
                      <div className="quality-metric">
                        <div className="quality-value">{(data as any).basis_weight}</div>
                        <div className="quality-label">{t('quality.param.basisWeight')} (g/m²)</div>
                      </div>
                      <div className="quality-metric">
                        <div className="quality-value">{(data as any).moisture}%</div>
                        <div className="quality-label">{t('quality.param.moisture')}</div>
                      </div>
                      <div className="quality-metric">
                        <div className="quality-value">{(data as any).speed}</div>
                        <div className="quality-label">{t('language') === 'ja' ? 'マシン速度' : 'Machine Speed'} (m/min)</div>
                      </div>
                    </div>
                  )}
                  {selectedProcess === 'P4' && (
                    <div className="quality-grid">
                      <div className="quality-metric">
                        <div className="quality-value">{(data as any).smoothness}</div>
                        <div className="quality-label">{t('quality.param.smoothness')} (ml/min)</div>
                      </div>
                      <div className="quality-metric">
                        <div className="quality-value">{(data as any).rolls}</div>
                        <div className="quality-label">{t('language') === 'ja' ? '完成ロール数' : 'Finished Rolls'}</div>
                      </div>
                    </div>
                  )}
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
      <h2>{t('processFlow.title')}</h2>
      
      <div className="main-container">
        {/* 左サイドバー - 制御室 */}
        <div className="control-sidebar">
          <div className="control-room-header">
            <div className="control-room-title">
              <span className="control-room-icon">🖥️</span>
              {t('processFlow.controlRoom')}
            </div>
            <p className="control-room-subtitle">{t('processFlow.monitoring')}</p>
          </div>
          
          <div className="control-metrics-section">
            <div className="metrics-group">
              <h4>{t('processFlow.production')}</h4>
              <div className="metric-row">
                <span className="metric-label">{t('processFlow.todayProduction')}:</span>
                <span className="metric-value good">{controlMetrics.totalProduction} t</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">{t('processFlow.efficiency')}:</span>
                <span className="metric-value good">{controlMetrics.efficiency}%</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">{t('processFlow.qualityRate')}:</span>
                <span className="metric-value good">{controlMetrics.qualityRate}%</span>
              </div>
            </div>

            <div className="metrics-group">
              <h4>{t('processFlow.energy')}</h4>
              <div className="metric-row">
                <span className="metric-label">{t('processFlow.powerConsumption')}:</span>
                <span className="metric-value warning">{controlMetrics.energyConsumption} kW</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">{t('processFlow.unitCost')}:</span>
                <span className="metric-value">4.5 GJ/t</span>
              </div>
            </div>

            <div className="metrics-group">
              <h4>{t('processFlow.alertStatus')}</h4>
              <div className="metric-row">
                <span className="metric-label">{t('processFlow.critical')}:</span>
                <span className="metric-value critical">{controlMetrics.alerts?.critical} 件</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">{t('processFlow.warning')}:</span>
                <span className="metric-value warning">{controlMetrics.alerts?.warning} 件</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">{t('processFlow.info')}:</span>
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
                  <h3 className="raw-material-title">{t('rawMaterial.supply')}</h3>
                  <p className="raw-material-subtitle">{t('rawMaterial.types')}</p>
                </div>
                
                <div className="silo-group">
                  <div className="silo">
                    <div className="silo-container">
                      <div className="silo-vessel">
                        <div className="silo-icon">🌲</div>
                        <div className="silo-level wood-chips" style={{height: '75%'}}></div>
                      </div>
                    </div>
                    <div className="silo-label">{t('language') === 'ja' ? '木材チップ' : 'Wood Chips'}</div>
                    <div className="silo-percentage">75%</div>
                  </div>
                  
                  <div className="silo">
                    <div className="silo-container">
                      <div className="silo-vessel">
                        <div className="silo-icon">♻️</div>
                        <div className="silo-level recycled-paper" style={{height: '45%'}}></div>
                      </div>
                    </div>
                    <div className="silo-label">{t('language') === 'ja' ? '古紙' : 'Recycled Paper'}</div>
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