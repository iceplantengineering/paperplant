import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Scatter } from 'react-chartjs-2';
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

interface SearchResult {
  type: string;
  data: any;
}

interface TimelineEvent {
  timestamp: string;
  event_type: string;
  title: string;
  description: string;
  data: any;
}

const TraceabilitySearch: React.FC = () => {
  const { t } = useLanguage();
  const [searchCriteria, setSearchCriteria] = useState({
    productLotId: '',
    batchId: '',
    rawMaterialLotId: '',
    startDate: '',
    endDate: ''
  });
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'journey' | 'analysis'>('search');

  useEffect(() => {
    console.log('TraceabilitySearch initializing...');
    // 初期表示時にサンプルデータを表示
    loadInitialDemoData();
  }, []);

  const loadInitialDemoData = () => {
    console.log('Loading initial demo data...');
    
    const demo = [
      {
        type: 'product',
        data: {
          product_lot_id: 'FPL-0123',
          product_code: 'NP-80',
          batch_id: 'PB-0456',
          completion_ts: '2024-01-15T14:30:00Z',
          destination: 'Customer-05',
          quantity_kg: 1250.5
        }
      },
      {
        type: 'batch',
        data: {
          batch_id: 'PB-0456',
          raw_material_lot_id: 'RML-0089',
          creation_ts: '2024-01-14T08:00:00Z',
          batch_type: 'Paper',
          initial_quantity_kg: 1500.0
        }
      },
      {
        type: 'raw_material',
        data: {
          lot_id: 'RML-0089',
          supplier_name: '北海道木材',
          material_type: '木材チップ',
          fsc_cert_id: 'FSC-123456',
          arrival_ts: '2024-01-13T10:00:00Z',
          weight_kg: 25000.0
        }
      }
    ];
    
    setSearchResults(demo);
    
    // ジャーニーデータを即座に生成
    const journeyData = generateDemoTimelineData('FPL-0123');
    setTimeline(journeyData);
    
    console.log('Demo data loaded:', demo.length, 'results,', journeyData.length, 'timeline events');
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchCriteria.productLotId) params.append('product_lot_id', searchCriteria.productLotId);
      if (searchCriteria.batchId) params.append('batch_id', searchCriteria.batchId);
      if (searchCriteria.rawMaterialLotId) params.append('raw_material_lot_id', searchCriteria.rawMaterialLotId);
      if (searchCriteria.startDate) params.append('start_date', searchCriteria.startDate);
      if (searchCriteria.endDate) params.append('end_date', searchCriteria.endDate);

      const response = await fetch(`/api/traceability/search?${params}`);
      const data = await response.json();
      setSearchResults(data.search_results || []);
      
      // 最初の結果があればジャーニーも取得
      if (data.search_results && data.search_results.length > 0) {
        const firstResult = data.search_results[0];
        let lotId = '';
        
        if (firstResult.type === 'product') {
          lotId = firstResult.data.product_lot_id;
        } else if (firstResult.type === 'batch') {
          lotId = firstResult.data.batch_id;
        }
        
        if (lotId) {
          await fetchJourney(lotId);
        }
      }
    } catch (error) {
      console.error('検索に失敗:', error);
      // デモデータを生成
      generateDemoResults();
    }
    setLoading(false);
  };

  const fetchJourney = async (lotId: string) => {
    try {
      const response = await fetch(`/api/traceability/journey/${lotId}`);
      const data = await response.json();
      setTimeline(data.timeline || []);
    } catch (error) {
      console.error('ジャーニー情報の取得に失敗:', error);
      const timelineData = generateDemoTimelineData(lotId);
      setTimeline(timelineData);
    }
  };

  const generateDemoResults = () => {
    console.log('Generating demo results (called from error handler)');
    loadInitialDemoData();
  };

  const generateDemoTimelineData = (lotId: string): TimelineEvent[] => {
    console.log('Generating timeline for lot:', lotId);
    const baseTime = new Date('2024-01-13T10:00:00Z');
    const timeline = [
      {
        timestamp: new Date(baseTime.getTime()).toISOString(),
        event_type: 'raw_material_arrival',
        title: t('process.rawMaterialArrival'),
        description: `${t('supplier.hokkaido')}${t('material.arrival')}`,
        data: {
          supplier: t('supplier.hokkaido'),
          weight: 25000,
          fsc_cert: 'FSC-123456'
        }
      },
      {
        timestamp: new Date(baseTime.getTime() + 22 * 60 * 60 * 1000).toISOString(),
        event_type: 'process_start',
        title: t('process.pulping.start'),
        description: `${t('equipment')}: DG-01, ${t('operator')}: OP005`,
        data: {
          machine_id: 'DG-01',
          operator_id: 'OP005',
          output_kg: 21250,
          quality_checks: 12
        }
      },
      {
        timestamp: new Date(baseTime.getTime() + 30 * 60 * 60 * 1000).toISOString(),
        event_type: 'process_end',
        title: t('process.pulping.end'),
        description: `${t('output.quantity')}: 21,250.0kg`,
        data: {
          duration_hours: 8.0,
          output_kg: 21250
        }
      },
      {
        timestamp: new Date(baseTime.getTime() + 32 * 60 * 60 * 1000).toISOString(),
        event_type: 'process_start',
        title: t('process.stockPrep.start'),
        description: `${t('equipment')}: MC-01, ${t('operator')}: OP012`,
        data: {
          machine_id: 'MC-01',
          operator_id: 'OP012',
          output_kg: 20825,
          quality_checks: 8
        }
      },
      {
        timestamp: new Date(baseTime.getTime() + 36 * 60 * 60 * 1000).toISOString(),
        event_type: 'process_end',
        title: t('process.stockPrep.end'),
        description: `${t('output.quantity')}: 20,825.0kg`,
        data: {
          duration_hours: 4.0,
          output_kg: 20825
        }
      },
      {
        timestamp: new Date(baseTime.getTime() + 38 * 60 * 60 * 1000).toISOString(),
        event_type: 'process_start',
        title: t('process.paperMaking.start'),
        description: `${t('equipment')}: PM-01, ${t('operator')}: OP007`,
        data: {
          machine_id: 'PM-01',
          operator_id: 'OP007',
          output_kg: 19575,
          quality_checks: 156
        }
      },
      {
        timestamp: new Date(baseTime.getTime() + 50 * 60 * 60 * 1000).toISOString(),
        event_type: 'process_end',
        title: t('process.paperMaking.end'),
        description: `${t('output.quantity')}: 19,575.0kg`,
        data: {
          duration_hours: 12.0,
          output_kg: 19575
        }
      },
      {
        timestamp: new Date(baseTime.getTime() + 52 * 60 * 60 * 1000).toISOString(),
        event_type: 'process_start',
        title: t('process.finishing.start'),
        description: `${t('equipment')}: RW-01, ${t('operator')}: OP018`,
        data: {
          machine_id: 'RW-01',
          operator_id: 'OP018',
          output_kg: 19380,
          quality_checks: 24
        }
      },
      {
        timestamp: new Date(baseTime.getTime() + 58 * 60 * 60 * 1000).toISOString(),
        event_type: 'process_end',
        title: t('process.finishing.end'),
        description: `${t('output.quantity')}: 19,380.0kg`,
        data: {
          duration_hours: 6.0,
          output_kg: 19380
        }
      },
      {
        timestamp: new Date(baseTime.getTime() + 60 * 60 * 60 * 1000).toISOString(),
        event_type: 'product_completion',
        title: t('process.productCompletion'),
        description: `${t('product')}: NP-80`,
        data: {
          product_code: 'NP-80',
          quantity_kg: 1250.5,
          roll_count: 12
        }
      },
      {
        timestamp: new Date(baseTime.getTime() + 84 * 60 * 60 * 1000).toISOString(),
        event_type: 'shipment',
        title: t('process.shipment'),
        description: `${t('destination')}: Customer-05`,
        data: {
          destination: 'Customer-05',
          quantity_kg: 1250.5
        }
      }
    ];
    
    console.log('Generated timeline with', timeline.length, 'events');
    return timeline;
  };

  const getEventIcon = (eventType: string) => {
    const iconMap = {
      raw_material_arrival: '📦',
      process_start: '▶️',
      process_end: '✅',
      product_completion: '📋',
      shipment: '🚛'
    };
    return iconMap[eventType as keyof typeof iconMap] || '📌';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP');
  };

  const calculateYield = () => {
    if (timeline.length < 2) return null;
    
    const arrival = timeline.find(t => t.event_type === 'raw_material_arrival');
    const completion = timeline.find(t => t.event_type === 'product_completion');
    
    if (!arrival || !completion) return null;
    
    const initialWeight = arrival.data.weight;
    const finalWeight = completion.data.quantity_kg;
    const yieldRate = (finalWeight / initialWeight) * 100;
    
    return {
      initial: initialWeight,
      final: finalWeight,
      yield: yieldRate
    };
  };

  const generateCorrelationData = () => {
    // デモ用の相関分析データ
    const data = [];
    for (let i = 0; i < 50; i++) {
      const basisWeight = 80 + (Math.random() - 0.5) * 4;
      const moisture = 5 + (Math.random() - 0.5) * 1;
      const tensileStrength = 120 + (basisWeight - 80) * 3 + (Math.random() - 0.5) * 10;
      
      data.push({
        x: basisWeight,
        y: tensileStrength,
        moisture: moisture
      });
    }
    return data;
  };

  const correlationChartData = {
    datasets: [{
      label: `${t('quality.param.basisWeight')} vs ${t('quality.param.tensile')}`,
      data: generateCorrelationData(),
      backgroundColor: 'rgba(42, 82, 152, 0.6)',
      borderColor: 'rgba(42, 82, 152, 1)',
      pointRadius: 5,
      pointHoverRadius: 8
    }]
  };

  // デバッグ用のログ
  console.log('TraceabilitySearch render - timeline length:', timeline.length, 'activeTab:', activeTab);

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#1e3c72' }}>
        🔍 {t('trace.searchAnalysis')}
      </h1>

      {/* タブナビゲーション */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #eee' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { key: 'search', label: `🔍 ${t('trace.search')}`, icon: '🔍' },
            { key: 'journey', label: `📈 ${t('trace.journey')}`, icon: '📈' },
            { key: 'analysis', label: `📊 ${t('trace.analysis')}`, icon: '📊' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: activeTab === tab.key ? '#2a5298' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '16px',
                borderRadius: '8px 8px 0 0',
                marginBottom: '-2px'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'search' && (
        <>
          {/* 検索フォーム */}
          <div className="card">
            <h2>🔍 {t('trace.searchTitle')}</h2>
            <div className="search-form">
              <div className="form-group">
                <label>{t('trace.productLot')}</label>
                <input
                  type="text"
                  placeholder={t('trace.productLotExample')}
                  value={searchCriteria.productLotId}
                  onChange={(e) => setSearchCriteria({...searchCriteria, productLotId: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>{t('trace.batchId')}</label>
                <input
                  type="text"
                  placeholder={t('trace.batchExample')}
                  value={searchCriteria.batchId}
                  onChange={(e) => setSearchCriteria({...searchCriteria, batchId: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>{t('trace.rawMaterialLot')}</label>
                <input
                  type="text"
                  placeholder={t('trace.rawMaterialExample')}
                  value={searchCriteria.rawMaterialLotId}
                  onChange={(e) => setSearchCriteria({...searchCriteria, rawMaterialLotId: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>{t('trace.startDate')}</label>
                <input
                  type="date"
                  value={searchCriteria.startDate}
                  onChange={(e) => setSearchCriteria({...searchCriteria, startDate: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>{t('trace.endDate')}</label>
                <input
                  type="date"
                  value={searchCriteria.endDate}
                  onChange={(e) => setSearchCriteria({...searchCriteria, endDate: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>&nbsp;</label>
                <button className="btn btn-primary" onClick={handleSearch}>
                  🔍 {t('trace.executeSearch')}
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          )}

          {/* 検索結果 */}
          {searchResults.length > 0 && (
            <div className="card">
              <h2>📋 {t('trace.searchResults')}</h2>
              {searchResults.map((result, index) => (
                <div key={index} style={{ 
                  marginBottom: '20px', 
                  padding: '15px', 
                  border: '1px solid #eee', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9' 
                }}>
                  <h3>
                    {result.type === 'product' && `📋 ${t('trace.productLotResult')}`}
                    {result.type === 'batch' && `⚙️ ${t('trace.productionBatch')}`}
                    {result.type === 'raw_material' && `📦 ${t('trace.rawMaterialLot')}`}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    {Object.entries(result.data).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </div>
                    ))}
                  </div>
                  
                  {result.type === 'product' && (
                    <button 
                      className="btn btn-secondary"
                      style={{ marginTop: '10px' }}
                      onClick={() => {
                        console.log('Journey button clicked for:', result.data.product_lot_id);
                        const timelineData = generateDemoTimelineData(result.data.product_lot_id);
                        setTimeline(timelineData);
                        setActiveTab('journey');
                      }}
                    >
                      📈 {t('trace.showJourneyButton')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'journey' && (
        <>
          {/* ロットジャーニー・タイムライン */}
          <div className="card">
            <h2>📈 {t('trace.lotJourney')}</h2>
            
            {timeline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p style={{ fontSize: '18px', marginBottom: '20px' }}>📋 {t('trace.sampleDataShown')}</p>
                <p>{t('trace.sampleDescription')}製品ロット FPL-0123</p>
                <button 
                  className="btn btn-primary"
                  style={{ marginTop: '20px' }}
                  onClick={() => {
                    const timelineData = generateDemoTimelineData('FPL-0123');
                    setTimeline(timelineData);
                  }}
                >
                  🔄 {t('trace.loadJourneyData')}
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  ロット FPL-0123 {t('trace.processTimeline')}（{timeline.length}{t('trace.eventsCount')}）
                </p>
              </>
            )}
            
            {timeline.length > 0 && (
              <>
                {/* サマリー情報 */}
                {calculateYield() && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-around', 
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2a5298' }}>
                        {calculateYield()!.initial.toLocaleString()} kg
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{t('trace.initialQuantity')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>
                        {calculateYield()!.final.toLocaleString()} kg
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{t('trace.finalQuantity')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800' }}>
                        {calculateYield()!.yield.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{t('trace.overallYield')}</div>
                    </div>
                  </div>
                )}
                
                {/* タイムライン */}
                <div style={{ position: 'relative' }}>
                  {timeline.map((event, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      marginBottom: '20px',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ 
                        minWidth: '60px',
                        textAlign: 'center',
                        marginRight: '20px'
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                          {getEventIcon(event.event_type)}
                        </div>
                        <div style={{ fontSize: '10px', color: '#666' }}>
                          {formatTimestamp(event.timestamp).split(' ')[1]}
                        </div>
                      </div>
                      
                      <div style={{ 
                        flex: 1,
                        padding: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: 'white'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#1e3c72' }}>
                              {event.title}
                            </h4>
                            <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                              {event.description}
                            </p>
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {formatTimestamp(event.timestamp).split(' ')[0]}
                          </div>
                        </div>
                        
                        {/* 詳細データ */}
                        {Object.keys(event.data).length > 0 && (
                          <div style={{ 
                            marginTop: '10px',
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {Object.entries(event.data).map(([key, value]) => (
                              <span key={key} style={{ marginRight: '15px' }}>
                                <strong>{key}:</strong> {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'analysis' && (
        <>
          {/* 相関分析 */}
          <div className="card">
            <h2>📊 {t('trace.qualityCorrelation')}</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {t('trace.qualityImprovementDesc')}
            </p>
            
            <div className="chart-container">
              <Scatter 
                data={correlationChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: t('trace.correlationChart')
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context: any) {
                          const point = context.raw;
                          return [
                            `${t('quality.param.basisWeight')}: ${point.x.toFixed(1)} g/m²`,
                            `${t('quality.param.tensile')}: ${point.y.toFixed(1)} N*m/g`,
                            `${t('quality.param.moisture')}: ${point.moisture.toFixed(1)} %`
                          ];
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: `${t('quality.param.basisWeight')} (g/m²)`
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: `${t('quality.param.tensile')} (N*m/g)`
                      }
                    }
                  }
                }}
              />
            </div>
            
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              <p><strong>{t('trace.correlationResults')}</strong></p>
              <p>• {t('trace.correlationResult1')}</p>
              <p>• {t('trace.correlationResult2')}</p>
              <p>• {t('trace.correlationResult3')}</p>
            </div>
          </div>

          {/* 品質統計サマリー */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="card">
              <h3>📈 {t('trace.qualityTrends')}</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('trace.qualityItem')}</th>
                    <th>{t('trace.average')}</th>
                    <th>{t('trace.standardDev')}</th>
                    <th>Cpk</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t('quality.param.basisWeight')}</td>
                    <td>80.1 g/m²</td>
                    <td>0.82</td>
                    <td>1.22</td>
                  </tr>
                  <tr>
                    <td>{t('quality.param.moisture')}</td>
                    <td>5.0 %</td>
                    <td>0.15</td>
                    <td>1.67</td>
                  </tr>
                  <tr>
                    <td>{t('quality.param.tensile')}</td>
                    <td>121.5 N*m/g</td>
                    <td>4.2</td>
                    <td>1.19</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3>🎯 {t('trace.qualityAchievement')}</h3>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', color: '#4caf50', fontWeight: 'bold' }}>
                  96.2%
                </div>
                <p style={{ color: '#666' }}>{t('trace.overallQualityRate')}</p>
                
                <div style={{ marginTop: '20px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    {t('trace.basisWeightSpec')}: <strong style={{ color: '#4caf50' }}>98.5%</strong>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    {t('trace.moistureSpec')}: <strong style={{ color: '#4caf50' }}>99.1%</strong>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    {t('trace.strengthSpec')}: <strong style={{ color: '#ff9800' }}>91.2%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TraceabilitySearch;