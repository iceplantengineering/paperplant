/**
 * 製紙工場ダッシュボードAPI - Netlify Functions
 * サーバーレス環境でのAPIエンドポイント
 */

// デモデータ生成用のヘルパー関数
function generateRandomValue(base, variance = 0.1) {
  return base + (Math.random() - 0.5) * base * variance;
}

function generateTimestamp(hoursAgo = 0) {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
}

// KPIデモデータ生成
function generateKPIData() {
  const baseKPIs = {
    OEE: { base: 75.2, target: 85.0, unit: '%' },
    FPY: { base: 92.1, target: 95.0, unit: '%' },
    energy_intensity: { base: 4.5, target: 4.2, unit: 'GJ/t' },
    yield_rate: { base: 96.3, target: 98.0, unit: '%' },
    fsc_ratio: { base: 28.5, target: 30.0, unit: '%' },
    production_rate: { base: 47.2, target: 50.0, unit: 't/h' }
  };

  const kpiData = {};
  Object.entries(baseKPIs).forEach(([key, config]) => {
    const value = generateRandomValue(config.base, 0.05);
    kpiData[key] = {
      value: Math.round(value * 10) / 10,
      target: config.target,
      unit: config.unit,
      achievement_rate: Math.round((value / config.target * 100) * 10) / 10
    };
  });

  return kpiData;
}

// 工程ステータス生成
function generateProcessStatus() {
  const processes = ['P1', 'P2', 'P3', 'P4'];
  const status = {};
  
  processes.forEach(processCode => {
    const statusType = Math.random() > 0.8 ? 'alarm' : 
                       Math.random() > 0.3 ? 'running' : 'idle';
    
    status[processCode] = {
      status: statusType,
      active_batches: statusType === 'idle' ? 0 : Math.floor(Math.random() * 3) + 1,
      recent_alerts: statusType === 'alarm' ? Math.floor(Math.random() * 3) + 1 : 
                     Math.random() > 0.7 ? 1 : 0
    };
  });

  return status;
}

// アラートデータ生成
function generateAlerts() {
  const machines = ['PM-01', 'PM-02', 'DG-01', 'DG-02', 'MC-01', 'MC-02'];
  const messages = [
    'ワイヤー振動異常検知',
    '蒸解釜温度上昇警告',
    'モーター電流値異常',
    '品質パラメータ逸脱',
    '原料供給量不足',
    'センサー通信エラー'
  ];
  const levels = ['warning', 'critical', 'info'];

  const alertCount = Math.floor(Math.random() * 5);
  const alerts = [];

  for (let i = 0; i < alertCount; i++) {
    alerts.push({
      machine_id: machines[Math.floor(Math.random() * machines.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: generateTimestamp(Math.random() * 24),
      level: levels[Math.floor(Math.random() * levels.length)]
    });
  }

  return alerts;
}

// 品質データ生成
function generateQualityData(processCode, hours = 24) {
  const parameters = {
    'P1': ['consistency', 'kappa_number', 'temperature'],
    'P2': ['freeness', 'ash_content', 'brightness'],
    'P3': ['basis_weight', 'moisture', 'caliper'],
    'P4': ['roughness', 'opacity', 'tensile_strength']
  };

  const targets = {
    consistency: { value: 3.5, upper: 4.0, lower: 3.0, unit: '%' },
    kappa_number: { value: 15.0, upper: 18.0, lower: 12.0, unit: '' },
    temperature: { value: 85.0, upper: 90.0, lower: 80.0, unit: '°C' },
    freeness: { value: 350, upper: 400, lower: 300, unit: 'ml' },
    ash_content: { value: 2.1, upper: 2.5, lower: 1.8, unit: '%' },
    brightness: { value: 88.5, upper: 90.0, lower: 87.0, unit: '%' },
    basis_weight: { value: 80.0, upper: 82.0, lower: 78.0, unit: 'g/m²' },
    moisture: { value: 7.5, upper: 8.0, lower: 7.0, unit: '%' },
    caliper: { value: 105, upper: 110, lower: 100, unit: 'μm' },
    roughness: { value: 140, upper: 160, lower: 120, unit: 'ml/min' },
    opacity: { value: 96.2, upper: 98.0, lower: 94.0, unit: '%' },
    tensile_strength: { value: 115, upper: 125, lower: 105, unit: 'N·m/g' }
  };

  const qualityData = [];
  const processParams = parameters[processCode] || ['generic_param'];
  const pointCount = Math.floor(hours / 2); // 2時間ごとのデータポイント

  processParams.forEach(param => {
    const config = targets[param];
    if (config) {
      for (let i = 0; i < pointCount; i++) {
        const timestamp = generateTimestamp((pointCount - i - 1) * 2);
        const value = generateRandomValue(config.value, 0.1);
        const isOk = value >= config.lower && value <= config.upper;

        qualityData.push({
          timestamp,
          parameter: param,
          value: Math.round(value * 100) / 100,
          target: config.value,
          upper_limit: config.upper,
          lower_limit: config.lower,
          is_ok: isOk,
          unit: config.unit
        });
      }
    }
  });

  return qualityData;
}

// マシンステータス生成
function generateMachineStatus(processCode) {
  const machineMap = {
    'P1': ['DG-01', 'DG-02'],
    'P2': ['MC-01', 'MC-02'],
    'P3': ['PM-01', 'PM-02'],
    'P4': ['RW-01', 'RW-02', 'SL-01']
  };

  const machines = machineMap[processCode] || [];
  const statuses = ['running', 'idle', 'maintenance', 'alarm'];
  const alertLevels = ['normal', 'warning', 'critical'];

  return machines.map(machineId => ({
    machine_id: machineId,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    last_update: generateTimestamp(Math.random() * 2),
    alert_level: alertLevels[Math.floor(Math.random() * alertLevels.length)]
  }));
}

// トレーサビリティデータ生成
function generateTraceabilityData(searchParams) {
  const sampleData = {
    search_results: [
      {
        type: 'product',
        data: {
          product_lot_id: 'FPL-20241201-001',
          product_code: 'A4-COPY-80',
          batch_id: 'PB-20241201-001',
          completion_ts: generateTimestamp(2),
          destination: '東京営業所',
          quantity_kg: 2500
        }
      },
      {
        type: 'batch',
        data: {
          batch_id: 'PB-20241201-001',
          raw_material_lot_id: 'RM-20241130-003',
          creation_ts: generateTimestamp(24),
          batch_type: 'STANDARD',
          initial_quantity_kg: 3000
        }
      },
      {
        type: 'raw_material',
        data: {
          lot_id: 'RM-20241130-003',
          supplier_name: '北海道森林資源',
          material_type: '針葉樹チップ',
          fsc_cert_id: 'FSC-C123456',
          arrival_ts: generateTimestamp(48),
          weight_kg: 15000
        }
      }
    ]
  };

  return sampleData;
}

// メインハンドラー
exports.handler = async (event, context) => {
  // CORS設定
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONSリクエスト対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    const method = event.httpMethod;

    console.log(`API Request: ${method} ${path}`);

    // ルーティング
    if (method === 'GET') {
      // ダッシュボードサマリー
      if (path === '/dashboard/summary') {
        const data = {
          kpis: generateKPIData(),
          active_batches: Math.floor(Math.random() * 8) + 2,
          critical_alerts: generateAlerts().filter(alert => alert.level === 'critical'),
          last_updated: new Date().toISOString()
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // 工程フロー状況
      if (path === '/dashboard/process-flow') {
        const data = {
          processes: generateProcessStatus()
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // 工程別監視データ
      const processMatch = path.match(/^\/dashboard\/process\/(.+)$/);
      if (processMatch) {
        const processCode = processMatch[1].toUpperCase();
        const data = {
          process_code: processCode,
          time_range: {
            start: generateTimestamp(24),
            end: new Date().toISOString()
          },
          quality_data: generateQualityData(processCode, 24),
          machine_status: generateMachineStatus(processCode),
          total_records: Math.floor(Math.random() * 50) + 20
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // 品質トレンド
      const trendMatch = path.match(/^\/dashboard\/quality-trend\/(.+)$/);
      if (trendMatch) {
        const parameter = trendMatch[1];
        const hours = parseInt(event.queryStringParameters?.hours || '24');
        const qualityData = generateQualityData('P3', hours)
          .filter(item => item.parameter === parameter);
        
        const data = {
          parameter,
          data: qualityData,
          time_range: { hours, start_time: generateTimestamp(hours) }
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // トレーサビリティ検索
      if (path === '/traceability/search') {
        const data = generateTraceabilityData(event.queryStringParameters);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      // ヘルスチェック
      if (path === '/health') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            environment: 'netlify-functions'
          })
        };
      }
    }

    // 404 - Not Found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: 'Not Found', 
        path: path,
        message: 'APIエンドポイントが見つかりません'
      })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      })
    };
  }
};