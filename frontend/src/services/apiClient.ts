/**
 * API Client - 開発/本番環境対応
 */

// 環境判定
const isDevelopment = (import.meta as any).env?.MODE === 'development';
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// API Base URL設定
const getApiBaseUrl = (): string => {
  // 本番環境（Netlify）
  if (!isDevelopment && !isLocalhost) {
    return '/.netlify/functions/api';
  }
  
  // 開発環境
  if (isDevelopment || isLocalhost) {
    // ローカルバックエンドが利用可能かチェック
    return 'http://localhost:8000/api';
  }
  
  // フォールバック
  return '/.netlify/functions/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Client Configuration:', {
  isDevelopment,
  isLocalhost,
  apiBaseUrl: API_BASE_URL,
  mode: (import.meta as any).env?.MODE || 'production'
});

// HTTPクライアント
class ApiClient {
  private baseUrl: string;
  private fallbackToMock: boolean = false;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API Response: ${endpoint}`, data);
      return data;

    } catch (error) {
      console.warn(`API request failed for ${endpoint}:`, error);
      
      // 本番環境でローカルAPIが失敗した場合、モックデータにフォールバック
      if (!this.fallbackToMock && this.baseUrl.includes('localhost')) {
        console.log('Falling back to mock data due to local API failure');
        this.fallbackToMock = true;
        return this.getMockData<T>(endpoint);
      }
      
      throw error;
    }
  }

  private getMockData<T>(endpoint: string): T {
    // モックデータ生成
    switch (endpoint) {
      case '/dashboard/summary':
        return {
          kpis: {
            OEE: { value: 75.2, target: 85.0, unit: '%', achievement_rate: 88.5 },
            FPY: { value: 92.1, target: 95.0, unit: '%', achievement_rate: 96.9 },
            energy_intensity: { value: 4.5, target: 4.2, unit: 'GJ/t', achievement_rate: 93.3 },
            yield_rate: { value: 96.3, target: 98.0, unit: '%', achievement_rate: 98.3 },
            fsc_ratio: { value: 28.5, target: 30.0, unit: '%', achievement_rate: 95.0 },
            production_rate: { value: 47.2, target: 50.0, unit: 't/h', achievement_rate: 94.4 }
          },
          active_batches: 5,
          critical_alerts: [
            { machine_id: 'PM-01', message: 'ワイヤー振動異常検知', timestamp: new Date().toISOString(), level: 'critical' }
          ],
          last_updated: new Date().toISOString()
        } as T;

      case '/dashboard/process-flow':
        return {
          processes: {
            P1: { status: 'running', active_batches: 2, recent_alerts: 0 },
            P2: { status: 'running', active_batches: 1, recent_alerts: 1 },
            P3: { status: 'alarm', active_batches: 1, recent_alerts: 2 },
            P4: { status: 'idle', active_batches: 0, recent_alerts: 0 }
          }
        } as T;

      default:
        console.warn(`No mock data available for endpoint: ${endpoint}`);
        throw new Error(`Mock data not available for ${endpoint}`);
    }
  }

  // API Methods
  async getDashboardSummary() {
    return this.request('/dashboard/summary');
  }

  async getProcessFlowStatus() {
    return this.request('/dashboard/process-flow');
  }

  async getProcessMonitoring(processCode: string, startTime?: string, endTime?: string) {
    const params = new URLSearchParams();
    if (startTime) params.append('start_time', startTime);
    if (endTime) params.append('end_time', endTime);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/dashboard/process/${processCode}${query}`);
  }

  async getQualityTrend(parameter: string, hours: number = 24) {
    return this.request(`/dashboard/quality-trend/${parameter}?hours=${hours}`);
  }

  async searchTraceability(params: {
    product_lot_id?: string;
    batch_id?: string;
    raw_material_lot_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/traceability/search${queryString}`);
  }

  async getLotJourney(lotId: string) {
    return this.request(`/traceability/journey/${lotId}`);
  }

  async getKPITrend(metricName: string, period: string = 'daily', days: number = 30) {
    return this.request(`/kpi/trend/${metricName}?period=${period}&days=${days}`);
  }

  async getAlerts(status: string = 'active', limit: number = 50) {
    return this.request(`/alerts?status=${status}&limit=${limit}`);
  }

  async healthCheck() {
    return this.request('/health');
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient(API_BASE_URL);

// 型定義
export interface KPIData {
  [key: string]: {
    value: number;
    target: number;
    unit: string;
    achievement_rate: number;
  };
}

export interface Alert {
  machine_id: string;
  message: string;
  timestamp: string;
  level: string;
}

export interface ProcessStatus {
  [key: string]: {
    status: string;
    active_batches: number;
    recent_alerts: number;
  };
}

export interface DashboardSummary {
  kpis: KPIData;
  active_batches: number;
  critical_alerts: Alert[];
  last_updated: string;
}

export interface ProcessFlowStatus {
  processes: ProcessStatus;
}

export default apiClient;