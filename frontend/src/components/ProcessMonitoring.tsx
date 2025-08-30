import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface QualityData {
  timestamp: string;
  parameter: string;
  value: number;
  target: number;
  upper_limit: number;
  lower_limit: number;
  is_ok: boolean;
  cd_profile?: number[];
}

interface MachineStatus {
  machine_id: string;
  status: string;
  last_update: string;
  alert_level: string;
}

const ProcessMonitoring: React.FC = () => {
  const { t } = useLanguage();
  const [selectedProcess, setSelectedProcess] = useState('P3');
  const [qualityData, setQualityData] = useState<QualityData[]>([]);
  const [machineStatus, setMachineStatus] = useState<MachineStatus[]>([]);
  const [timeRange, setTimeRange] = useState(24);
  const [loading, setLoading] = useState(false);

  const getProcessOptions = () => [
    { value: 'P1', label: t('process.p1') },
    { value: 'P2', label: t('process.p2') },
    { value: 'P3', label: t('process.p3') },
    { value: 'P4', label: t('process.p4') }
  ];

  useEffect(() => {
    console.log('ProcessMonitoring useEffect triggered for:', selectedProcess, timeRange);
    
    // 初期表示時にデモデータを即座に設定
    const demoData = generateDemoQualityData(selectedProcess, timeRange);
    const demoMachines = generateDemoMachineStatus(selectedProcess);
    
    setQualityData(demoData);
    setMachineStatus(demoMachines);
    setLoading(false);
    
    // 定期更新のタイマーを設定（デモデータを定期的に更新）
    const interval = setInterval(() => {
      console.log('Refreshing demo data...');
      const newDemoData = generateDemoQualityData(selectedProcess, timeRange);
      const newDemoMachines = generateDemoMachineStatus(selectedProcess);
      
      setQualityData(newDemoData);
      setMachineStatus(newDemoMachines);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [selectedProcess, timeRange]);

  const refreshData = () => {
    console.log('Manual refresh triggered');
    const demoData = generateDemoQualityData(selectedProcess, timeRange);
    const demoMachines = generateDemoMachineStatus(selectedProcess);
    
    setQualityData(demoData);
    setMachineStatus(demoMachines);
  };

  const generateDemoQualityData = (processCode: string, hours: number): QualityData[] => {
    const data: QualityData[] = [];
    const params = getProcessParameters(processCode);
    const pointsPerHour = 12; // より多くのデータポイント
    
    console.log(`Generating demo data for ${processCode}, ${hours} hours, ${params.length} parameters`);
    
    for (let i = 0; i < hours * pointsPerHour; i++) {
      const timestamp = new Date(Date.now() - (hours * pointsPerHour - i) * 5 * 60 * 1000); // 5分間隔
      
      params.forEach(param => {
        // より現実的な変動パターン
        const timeProgress = i / (hours * pointsPerHour);
        const trendFactor = Math.sin(timeProgress * Math.PI * 4) * 0.3; // 周期的変動
        const randomNoise = (Math.random() - 0.5) * param.tolerance / 3;
        const value = param.target + (param.target * trendFactor * 0.02) + randomNoise;
        
        // CDプロファイル生成（抄紙工程のみ）
        let cd_profile = undefined;
        if (processCode === 'P3' && ['basis_weight', 'moisture_content'].includes(param.name)) {
          cd_profile = Array.from({length: 50}, (_, index) => {
            const position = index / 49; // 0-1の位置
            const profileVariation = Math.sin(position * Math.PI * 2) * param.tolerance / 6; // 幅方向変動
            return value + profileVariation + (Math.random() - 0.5) * param.tolerance / 8;
          });
        }
        
        data.push({
          timestamp: timestamp.toISOString(),
          parameter: param.name,
          value: Math.max(0, value), // 負の値を避ける
          target: param.target,
          upper_limit: param.target + param.tolerance,
          lower_limit: param.target - param.tolerance,
          is_ok: Math.abs(value - param.target) <= param.tolerance,
          cd_profile: cd_profile
        });
      });
    }
    
    console.log(`Generated ${data.length} data points for ${processCode}`);
    return data;
  };

  const generateDemoMachineStatus = (processCode: string): MachineStatus[] => {
    const machinesMap = {
      P1: ['DG-01', 'DG-02'],
      P2: ['MC-01', 'MC-02'], 
      P3: ['PM-01', 'PM-02'],
      P4: ['RW-01', 'RW-02', 'SL-01']
    };
    
    const machines = machinesMap[processCode as keyof typeof machinesMap] || [];
    console.log(`Generating machine status for ${processCode}:`, machines);
    
    const result = machines.map((machineId, index) => ({
      machine_id: machineId,
      status: index === 0 ? 'running' : (Math.random() > 0.7 ? 'alarm' : 'running'),
      last_update: new Date().toISOString(),
      alert_level: index === 0 ? 'normal' : (Math.random() > 0.8 ? 'critical' : 'normal')
    }));
    
    console.log('Generated machine status:', result);
    return result;
  };

  const getProcessParameters = (processCode: string) => {
    const getParamLabel = (paramName: string) => {
      const labelMap: { [key: string]: string } = {
        'kappa_number': t('quality.param.kappa'),
        'brightness': t('quality.param.brightness'),
        'freeness_csf': t('quality.param.freeness'),
        'consistency': t('quality.param.consistency'),
        'basis_weight': t('quality.param.basisWeight'),
        'moisture_content': t('quality.param.moisture'),
        'caliper': t('quality.param.caliper'),
        'smoothness': t('quality.param.smoothness'),
        'tensile_strength': t('quality.param.tensile')
      };
      return labelMap[paramName] || paramName;
    };

    const paramMap = {
      P1: [
        { name: 'kappa_number', target: 15.0, tolerance: 2.0, unit: '', label: getParamLabel('kappa_number') },
        { name: 'brightness', target: 85.0, tolerance: 3.0, unit: '%', label: getParamLabel('brightness') }
      ],
      P2: [
        { name: 'freeness_csf', target: 450.0, tolerance: 50.0, unit: 'ml', label: getParamLabel('freeness_csf') },
        { name: 'consistency', target: 3.5, tolerance: 0.3, unit: '%', label: getParamLabel('consistency') }
      ],
      P3: [
        { name: 'basis_weight', target: 80.0, tolerance: 2.0, unit: 'g/m²', label: getParamLabel('basis_weight') },
        { name: 'moisture_content', target: 5.0, tolerance: 0.5, unit: '%', label: getParamLabel('moisture_content') },
        { name: 'caliper', target: 0.12, tolerance: 0.01, unit: 'mm', label: getParamLabel('caliper') }
      ],
      P4: [
        { name: 'smoothness', target: 150.0, tolerance: 20.0, unit: 'ml/min', label: getParamLabel('smoothness') },
        { name: 'tensile_strength', target: 120.0, tolerance: 15.0, unit: 'N*m/g', label: getParamLabel('tensile_strength') }
      ]
    };
    
    return paramMap[processCode as keyof typeof paramMap] || [];
  };

  const getUniqueParameters = (data: QualityData[]) => {
    const unique = [...new Set(data.map(d => d.parameter))];
    console.log('Unique parameters found:', unique, 'from', data.length, 'data points');
    return unique;
  };

  const getParameterData = (parameter: string) => {
    const paramData = qualityData.filter(d => d.parameter === parameter);
    return paramData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const createTrendChart = (parameter: string) => {
    const paramData = getParameterData(parameter);
    const params = getProcessParameters(selectedProcess);
    const paramInfo = params.find(p => p.name === parameter);
    
    console.log(`Creating chart for ${parameter}:`, paramData.length, 'data points');
    
    if (paramData.length === 0) {
      console.log(`No data found for parameter: ${parameter}`);
      return null;
    }

    const chartData = {
      labels: paramData.map(d => new Date(d.timestamp).toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })),
      datasets: [
        {
          label: `${paramInfo?.label || parameter}`,
          data: paramData.map(d => d.value),
          borderColor: 'rgb(42, 82, 152)',
          backgroundColor: 'rgba(42, 82, 152, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5
        },
        {
          label: t('chart.target'),
          data: paramData.map(d => d.target),
          borderColor: 'rgb(76, 175, 80)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        },
        {
          label: t('language') === 'ja' ? '上限' : 'Upper Limit',
          data: paramData.map(d => d.upper_limit),
          borderColor: 'rgb(244, 67, 54)',
          backgroundColor: 'transparent',
          borderDash: [2, 2],
          fill: false,
          pointRadius: 0
        },
        {
          label: t('language') === 'ja' ? '下限' : 'Lower Limit',
          data: paramData.map(d => d.lower_limit),
          borderColor: 'rgb(244, 67, 54)',
          backgroundColor: 'transparent',
          borderDash: [2, 2],
          fill: false,
          pointRadius: 0
        }
      ]
    };

    return (
      <div key={parameter} className="card">
        <h3>{paramInfo?.label || parameter} {t('process.monitoring.trend')}</h3>
        <div className="chart-container chart-small">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                  labels: {
                    usePointStyle: true,
                    padding: 20
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const value = context.parsed.y.toFixed(2);
                      const unit = paramInfo?.unit || '';
                      return `${context.dataset.label}: ${value} ${unit}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  title: { display: true, text: t('process.monitoring.time') }
                },
                y: {
                  title: { display: true, text: `${paramInfo?.label || parameter} (${paramInfo?.unit || ''})` }
                }
              }
            }}
          />
        </div>
        
        {/* 品質状況サマリー */}
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-around', fontSize: '14px' }}>
          <div>
            <strong>{t('process.monitoring.latest')}:</strong> {paramData[paramData.length - 1]?.value.toFixed(2)} {paramInfo?.unit}
          </div>
          <div>
            <strong>{t('process.monitoring.withinSpec')}:</strong> {((paramData.filter(d => d.is_ok).length / paramData.length) * 100).toFixed(1)}%
          </div>
          <div>
            <strong>{t('process.monitoring.stdDev')}:</strong> {calculateStandardDeviation(paramData.map(d => d.value)).toFixed(3)}
          </div>
        </div>
      </div>
    );
  };

  const calculateStandardDeviation = (values: number[]): number => {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    return Math.sqrt(avgSquaredDiff);
  };

  const getMachineStatusIcon = (status: string, alertLevel: string) => {
    if (alertLevel === 'critical') return { icon: '🔴', color: '#f44336' };
    if (status === 'alarm') return { icon: '🟡', color: '#ff9800' };
    if (status === 'running') return { icon: '🟢', color: '#4caf50' };
    return { icon: '⚪', color: '#999' };
  };

  // デバッグ用の状態ログ
  console.log('ProcessMonitoring render - qualityData:', qualityData.length, 'machineStatus:', machineStatus.length, 'loading:', loading);

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#1e3c72' }}>
{t('process.monitoring.title')}
      </h1>

      {/* 工程選択とオプション */}
      <div className="card">
        <div className="search-form">
          <div className="form-group">
            <label>{t('process.monitoring.target')}</label>
            <select 
              value={selectedProcess} 
              onChange={(e) => setSelectedProcess(e.target.value)}
            >
              {getProcessOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>{t('process.monitoring.timeRange')}</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(Number(e.target.value))}
            >
              <option value={1}>{t('time.range.1h')}</option>
              <option value={4}>{t('time.range.4h')}</option>
              <option value={12}>{t('time.range.12h')}</option>
              <option value={24}>{t('time.range.24h')}</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>&nbsp;</label>
            <button className="btn btn-primary" onClick={refreshData}>
              🔄 {t('process.monitoring.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* 設備ステータス */}
      <div className="card">
        <h2>{t('process.monitoring.equipment')}</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {machineStatus.map(machine => {
            const statusInfo = getMachineStatusIcon(machine.status, machine.alert_level);
            return (
              <div key={machine.machine_id} 
                   style={{ 
                     padding: '15px', 
                     border: `2px solid ${statusInfo.color}`, 
                     borderRadius: '8px',
                     minWidth: '150px',
                     textAlign: 'center'
                   }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                  {statusInfo.icon}
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {machine.machine_id}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {machine.status} | {machine.alert_level}
                </div>
                <div style={{ fontSize: '10px', color: '#999' }}>
                  {new Date(machine.last_update).toLocaleTimeString('ja-JP')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {/* 品質パラメータトレンドチャート */}
      {qualityData.length === 0 ? (
        <div className="card">
          <h2>{t('process.monitoring.loading')}</h2>
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            {t('process.monitoring.loadingText')}
            <br />
            <small>{t('language') === 'ja' ? `工程: ${selectedProcess}, 時間範囲: ${timeRange}時間` : `Process: ${selectedProcess}, Time Range: ${timeRange} hours`}</small>
          </p>
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>{t('process.monitoring.quality')}</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {t('language') === 'ja' ? `${selectedProcess}工程の品質パラメータ（過去${timeRange}時間、${qualityData.length}データポイント）` : `Quality parameters for ${selectedProcess} process (past ${timeRange} hours, ${qualityData.length} ${t('process.monitoring.dataPoints')})`}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {getUniqueParameters(qualityData).map(parameter => 
              createTrendChart(parameter)
            )}
          </div>
        </>
      )}

      {/* CDプロファイル表示（抄紙工程のみ） */}
      {selectedProcess === 'P3' && (
        <div className="card">
          <h2>{t('process.monitoring.cdProfile')}</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {t('process.monitoring.cdDescription')}
          </p>
          
          {['basis_weight', 'moisture_content'].map(param => {
            const latestData = qualityData
              .filter(d => d.parameter === param && d.cd_profile)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            
            if (!latestData || !latestData.cd_profile) return null;
            
            const paramInfo = getProcessParameters('P3').find(p => p.name === param);
            
            const profileChartData = {
              labels: latestData.cd_profile.map((_, i) => `${i * 2}%`),
              datasets: [{
                label: paramInfo?.label || param,
                data: latestData.cd_profile,
                borderColor: 'rgb(42, 82, 152)',
                backgroundColor: 'rgba(42, 82, 152, 0.2)',
                fill: true,
                tension: 0.3
              }]
            };
            
            return (
              <div key={param} style={{ marginBottom: '30px' }}>
                <h3>{paramInfo?.label || param} {t('process.monitoring.profile')}</h3>
                <div className="chart-container chart-small">
                  <Line 
                    data={profileChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: { title: { display: true, text: t('language') === 'ja' ? '紙幅位置' : 'Paper Width Position' } },
                        y: { title: { display: true, text: `${paramInfo?.label || param} (${paramInfo?.unit || ''})` } }
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProcessMonitoring;