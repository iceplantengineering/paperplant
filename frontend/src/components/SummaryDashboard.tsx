import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface KPIData {
  [key: string]: {
    value: number;
    target: number;
    unit: string;
    achievement_rate: number;
  };
}

interface Alert {
  machine_id: string;
  message: string;
  timestamp: string;
  level: string;
}

interface ProcessStatus {
  [key: string]: {
    status: string;
    active_batches: number;
    recent_alerts: number;
  };
}

const SummaryDashboard: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIData>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('SummaryDashboard initializing...');
    
    // 初期表示時にデモデータを即座に設定
    const initialKpiData = {
      OEE: { value: 75.2, target: 85.0, unit: '%', achievement_rate: 88.5 },
      FPY: { value: 92.1, target: 95.0, unit: '%', achievement_rate: 96.9 },
      energy_intensity: { value: 4.5, target: 4.2, unit: 'GJ/t', achievement_rate: 93.3 },
      yield_rate: { value: 96.3, target: 98.0, unit: '%', achievement_rate: 98.3 },
      fsc_ratio: { value: 28.5, target: 30.0, unit: '%', achievement_rate: 95.0 },
      production_rate: { value: 47.2, target: 50.0, unit: 't/h', achievement_rate: 94.4 }
    };
    
    const initialAlerts = [
      { machine_id: 'PM-01', message: 'ワイヤー振動異常検知', timestamp: new Date().toISOString(), level: 'warning' },
      { machine_id: 'DG-02', message: '蒸解釜温度上昇警告', timestamp: new Date(Date.now() - 30*60*1000).toISOString(), level: 'critical' }
    ];
    
    const initialProcessStatus = {
      P1: { status: 'running', active_batches: 2, recent_alerts: 0 },
      P2: { status: 'running', active_batches: 1, recent_alerts: 1 },
      P3: { status: 'alarm', active_batches: 1, recent_alerts: 2 },
      P4: { status: 'idle', active_batches: 0, recent_alerts: 0 }
    };
    
    setKpiData(initialKpiData);
    setAlerts(initialAlerts);
    setProcessStatus(initialProcessStatus);
    setLoading(false);
    
    // 30秒ごとにデータを更新
    const interval = setInterval(() => {
      console.log('Refreshing dashboard data...');
      
      // データを少し変動させる
      const updatedKpiData = {
        OEE: { value: 75.2 + (Math.random() - 0.5) * 2, target: 85.0, unit: '%', achievement_rate: 88.5 + (Math.random() - 0.5) * 2 },
        FPY: { value: 92.1 + (Math.random() - 0.5) * 2, target: 95.0, unit: '%', achievement_rate: 96.9 + (Math.random() - 0.5) * 2 },
        energy_intensity: { value: 4.5 + (Math.random() - 0.5) * 0.2, target: 4.2, unit: 'GJ/t', achievement_rate: 93.3 + (Math.random() - 0.5) * 2 },
        yield_rate: { value: 96.3 + (Math.random() - 0.5) * 1, target: 98.0, unit: '%', achievement_rate: 98.3 + (Math.random() - 0.5) * 2 },
        fsc_ratio: { value: 28.5 + (Math.random() - 0.5) * 2, target: 30.0, unit: '%', achievement_rate: 95.0 + (Math.random() - 0.5) * 2 },
        production_rate: { value: 47.2 + (Math.random() - 0.5) * 3, target: 50.0, unit: 't/h', achievement_rate: 94.4 + (Math.random() - 0.5) * 2 }
      };
      
      setKpiData(updatedKpiData);
    }, 30000);

    return () => clearInterval(interval);
  }, []);


  // API呼び出しは削除（デモデータのみ使用）

  const getKPIStatus = (achievementRate: number): string => {
    if (achievementRate >= 95) return 'good';
    if (achievementRate >= 90) return 'warning';
    return 'critical';
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('ja-JP');
  };

  const kpiLabels = {
    OEE: '総合設備効率',
    FPY: '直行率',
    energy_intensity: 'エネルギー原単位',
    yield_rate: '歩留まり率',
    fsc_ratio: 'FSC認証材配合率',
    production_rate: '生産レート'
  };

  const processNames = {
    P1: 'パルプ化',
    P2: '調成',
    P3: '抄紙',
    P4: '仕上げ'
  };

  // KPI チャートデータ - 棒グラフ形式
  console.log('KPI Chart Data - kpiData keys:', Object.keys(kpiData));
  console.log('KPI Chart Data - kpiData values:', Object.values(kpiData));
  
  const kpiChartData = Object.keys(kpiData).length > 0 ? {
    labels: Object.keys(kpiData).map(key => kpiLabels[key as keyof typeof kpiLabels] || key),
    datasets: [
      {
        label: '実績値',
        data: Object.values(kpiData).map(kpi => kpi.value),
        backgroundColor: Object.values(kpiData).map((kpi) => {
          const status = getKPIStatus(kpi.achievement_rate);
          return status === 'good' ? 'rgba(76, 175, 80, 0.7)' :
                 status === 'warning' ? 'rgba(255, 152, 0, 0.7)' :
                 'rgba(244, 67, 54, 0.7)';
        }),
        borderColor: Object.values(kpiData).map((kpi) => {
          const status = getKPIStatus(kpi.achievement_rate);
          return status === 'good' ? 'rgba(76, 175, 80, 1)' :
                 status === 'warning' ? 'rgba(255, 152, 0, 1)' :
                 'rgba(244, 67, 54, 1)';
        }),
        borderWidth: 2
      },
      {
        label: '目標値',
        data: Object.values(kpiData).map(kpi => kpi.target),
        backgroundColor: 'rgba(255, 99, 132, 0.3)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        borderDash: [5, 5]
      }
    ]
  } : {
    labels: ['データ読み込み中'],
    datasets: [{
      label: '実績値',
      data: [0],
      backgroundColor: ['rgba(200, 200, 200, 0.6)'],
      borderColor: ['rgba(200, 200, 200, 1)'],
      borderWidth: 2
    }]
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#1e3c72' }}>
        📊 総合サマリーダッシュボード
        <span style={{ fontSize: '14px', color: '#666', marginLeft: '20px' }}>
          最終更新: {new Date().toLocaleString('ja-JP')}
        </span>
      </h1>

      {/* KPI概要カード */}
      <div className="kpi-grid">
        {Object.entries(kpiData).map(([key, kpi]) => (
          <div key={key} className="kpi-card">
            <div className="kpi-label">
              {kpiLabels[key as keyof typeof kpiLabels] || key}
            </div>
            <div className={`kpi-value ${getKPIStatus(kpi.achievement_rate)}`}>
              {kpi.value.toFixed(1)} <span style={{ fontSize: '1rem' }}>{kpi.unit}</span>
            </div>
            <div className="kpi-target">
              目標: {kpi.target} {kpi.unit} ({kpi.achievement_rate.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* KPIチャート */}
        <div className="card">
          <h2>主要KPI実績 vs 目標値</h2>
          <div className="chart-container">
            <Bar 
              data={kpiChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: {
                      padding: 20
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        const kpiKeys = Object.keys(kpiData);
                        const kpiKey = kpiKeys[context.dataIndex];
                        const unit = kpiData[kpiKey]?.unit || '';
                        return `${label}: ${value.toFixed(1)} ${unit}`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'KPI項目'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: '値'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* 重要アラート */}
        <div className="card">
          <h2>🚨 重要アラート</h2>
          <div className="alert-list">
            {alerts.length === 0 ? (
              <p style={{ color: '#4CAF50', textAlign: 'center', padding: '20px' }}>
                ✅ 現在、重要なアラートはありません
              </p>
            ) : (
              alerts.map((alert, index) => (
                <div key={index} className={`alert-item ${alert.level}`}>
                  <strong>{alert.machine_id}</strong>
                  <span className="alert-time">{formatTimestamp(alert.timestamp)}</span>
                  <br />
                  <span>{alert.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 工程フロー図 */}
      <div className="card">
        <h2>🏭 工程フロー状況</h2>
        <div className="process-flow">
          {Object.entries(processStatus).map(([processCode, status], index) => (
            <React.Fragment key={processCode}>
              <div 
                className={`process-step ${status.status}`}
                onClick={() => window.location.href = `/process?code=${processCode}`}
              >
                <h3>{processNames[processCode as keyof typeof processNames]}</h3>
                <p>{processCode}</p>
                <div style={{ marginTop: '10px', fontSize: '12px' }}>
                  稼働バッチ: {status.active_batches}<br />
                  アラート: {status.recent_alerts}
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '20px',
                  color: status.status === 'running' ? '#4CAF50' :
                         status.status === 'alarm' ? '#f44336' : '#999'
                }}>
                  {status.status === 'running' ? '▶️' :
                   status.status === 'alarm' ? '⚠️' : '⏸️'}
                </div>
              </div>
              {index < Object.keys(processStatus).length - 1 && (
                <div className="process-arrow">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
          工程をクリックすると詳細監視画面へ移動します
        </div>
      </div>

      {/* 生産状況サマリー */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3>📈 本日の生産量</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2a5298', textAlign: 'center' }}>
            1,128 <span style={{ fontSize: '1rem' }}>トン</span>
          </div>
          <p style={{ textAlign: 'center', color: '#666', marginTop: '10px' }}>
            計画対比: 94.2%
          </p>
        </div>

        <div className="card">
          <h3>⚡ エネルギー使用量</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800', textAlign: 'center' }}>
            5,076 <span style={{ fontSize: '1rem' }}>GJ</span>
          </div>
          <p style={{ textAlign: 'center', color: '#666', marginTop: '10px' }}>
            原単位: 4.5 GJ/t
          </p>
        </div>

        <div className="card">
          <h3>🌱 環境貢献度</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50', textAlign: 'center' }}>
            28.5 <span style={{ fontSize: '1rem' }}>%</span>
          </div>
          <p style={{ textAlign: 'center', color: '#666', marginTop: '10px' }}>
            FSC認証材配合率
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboard;