import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// 翻訳データ
const translations = {
  ja: {
    // サイドバー
    'sidebar.title': '🏭 製紙工場DX\nダッシュボード',
    'nav.summary': '📊 総合サマリー',
    'nav.process': '⚙️ 工程監視',
    'nav.processFlow': '🏭 工程フロー',
    'nav.traceability': '🔍 トレーサビリティ',
    'sidebar.description.1': '製紙工場の',
    'sidebar.description.2': '• トレーサビリティ管理',
    'sidebar.description.3': '• リアルタイム監視',
    'sidebar.description.4': '• 工程フロー可視化',
    'sidebar.description.5': '• KPI分析',
    'sidebar.description.6': 'を統合したダッシュボード',
    
    // 共通
    'language': 'ja',
    'language.switch': '🌐',
    'language.japanese': '日本語',
    'language.english': 'English',
    'chart.actual': '実績値',
    'chart.target': '目標値',
    
    // KPI
    'kpi.oee': 'OEE',
    'kpi.fpy': 'FPY',
    'kpi.energy': 'エネルギー原単位',
    'kpi.yield': '歩留まり率',
    'kpi.fsc': 'FSC認証材配合率',
    'kpi.production': '生産レート',
    'kpi.unit.percent': '%',
    'kpi.unit.energy': 'GJ/t',
    'kpi.unit.rate': 't/h',
    
    // アラート
    'alert.critical': '緊急',
    'alert.warning': '警告',
    'alert.info': '情報',
    'alert.title': '重要アラート',
    
    // 工程
    'process.p1': 'P1: パルプ化',
    'process.p2': 'P2: 調成',
    'process.p3': 'P3: 抄紙',
    'process.p4': 'P4: 仕上げ',
    
    // ステータス
    'status.running': '運転中',
    'status.warning': '警告',
    'status.error': '異常',
    'status.stopped': '停止',
    
    // 品質パラメータ
    'quality.kappa': 'カッパー価',
    'quality.brightness': '白色度',
    'quality.freeness': 'フリーネス',
    'quality.consistency': 'パルプ濃度',
    'quality.basis_weight': '坪量',
    'quality.moisture': '水分率',
    'quality.thickness': '紙厚',
    'quality.smoothness': '平滑度',
    'quality.strength': '引張強度',
    
    // ボタン・アクション
    'button.search': '検索',
    'button.clear': 'クリア',
    'button.showJourney': 'ジャーニーを表示',
    'button.refresh': '更新',
    
    // トレーサビリティ
    'trace.search': '検索',
    'trace.journey': 'ジャーニー',
    'trace.analysis': '分析',
    'trace.productLot': '製品ロットID',
    'trace.batchId': 'バッチID',
    'trace.rawMaterialLot': '原料ロットID',
    'trace.dateRange': '期間',
    
    // 時間
    'time.today': '今日',
    'time.yesterday': '昨日',
    'time.lastWeek': '先週',
    'time.lastMonth': '先月',
    
    // ダッシュボード
    'dashboard.title': '📊 総合サマリーダッシュボード',
    'dashboard.lastUpdate': '最終更新',
    'dashboard.target': '目標',
    'dashboard.kpiChart': '主要KPI実績 vs 目標値',
    'dashboard.alerts': '🚨 重要アラート',
    'dashboard.processFlow': '🏭 工程フロー状況',
    'dashboard.activeBatches': '稼働バッチ',
    'dashboard.alertCount': 'アラート',
    'dashboard.noAlerts': '✅ 現在、重要なアラートはありません',
    'dashboard.productionToday': '本日の生産量',
    'dashboard.planComparison': '計画対比',
    'dashboard.energyUsage': 'エネルギー使用量',
    'dashboard.energyIntensity': '原単位',
    'dashboard.environmentalContrib': '環境貢献度',
    'dashboard.fscRatio': 'FSC認証材配合率',
    
    // アラートメッセージ
    'alert.wireVibration': 'ワイヤー振動異常検知',
    'alert.digestorTemp': '蒸解釜温度上昇警告',
    
    // 工程監視
    'process.monitoring.title': '⚙️ 工程別モニタリングダッシュボード',
    'process.monitoring.target': '監視対象工程',
    'process.monitoring.timeRange': '表示時間範囲',
    'process.monitoring.refresh': 'データ更新',
    'process.monitoring.equipment': '🔧 設備ステータス',
    'process.monitoring.quality': '📊 品質パラメータトレンドチャート',
    'process.monitoring.dataPoints': 'データポイント',
    'process.monitoring.trend': 'トレンド',
    'process.monitoring.latest': '最新値',
    'process.monitoring.withinSpec': '規格内率',
    'process.monitoring.time': '時刻',
    'process.monitoring.stdDev': '標準偏差',
    'process.monitoring.cdProfile': '📊 幅方向品質プロファイル (CD Profile)',
    'process.monitoring.cdDescription': '紙の幅方向（Cross Direction）における品質の均一性を表示',
    'process.monitoring.profile': 'プロファイル',
    'process.monitoring.loading': '⚠️ データ読み込み中',
    'process.monitoring.loadingText': '品質パラメータデータを読み込んでいます...',
    
    // 時間範囲
    'time.range.1h': '過去1時間',
    'time.range.4h': '過去4時間',
    'time.range.12h': '過去12時間',
    'time.range.24h': '過去24時間',
    
    // 品質パラメータ名
    'quality.param.kappa': 'カッパー価',
    'quality.param.brightness': '白色度',
    'quality.param.freeness': 'フリーネス',
    'quality.param.consistency': 'パルプ濃度',
    'quality.param.basisWeight': '坪量',
    'quality.param.moisture': '水分率',
    'quality.param.caliper': '紙厚',
    'quality.param.smoothness': '平滑度',
    'quality.param.tensile': '引張強度',
    
    // 工程フロー監視
    'processFlow.title': '🏭 製紙工場リアルタイム工程フロー監視',
    'processFlow.controlRoom': '中央制御室',
    'processFlow.monitoring': '統合監視システム',
    'processFlow.production': '生産実績',
    'processFlow.todayProduction': '本日生産量',
    'processFlow.efficiency': '稼働効率',
    'processFlow.qualityRate': '品質達成率',
    'processFlow.energy': 'エネルギー',
    'processFlow.powerConsumption': '消費電力',
    'processFlow.unitCost': '原単価',
    'processFlow.alertStatus': 'アラート状況',
    'processFlow.critical': '重要',
    'processFlow.warning': '警告',
    'processFlow.info': '情報',
    'processFlow.operator': '担当者',
    'processFlow.temperature': '温度',
    'processFlow.pressure': '圧力',
    'processFlow.flowRate': '流量',
    'processFlow.details': '詳細情報',
    'processFlow.close': '閉じる',
    'processFlow.parameters': '運転パラメータ',
    'processFlow.qualityIndicators': '品質指標',
    'processFlow.operatorInfo': '作業者情報',
    'processFlow.activeBatches': 'アクティブバッチ',
    'processFlow.todayAlerts': '今日のアラート',
    'processFlow.units.pieces': '個',
    'processFlow.units.cases': '件',
    'processFlow.units.rolls': '本',
    
    // トレーサビリティ - 追加キー
    'trace.lotJourney': 'ロット生産ジャーニー',
    'trace.sampleDataShown': 'サンプルデータが表示されています',
    'trace.sampleDescription': 'の生産ジャーニーをご覧ください。',
    'trace.loadJourneyData': 'ジャーニーデータを読み込み',
    'trace.processTimeline': 'の製造工程を時系列で表示しています',
    'trace.eventsCount': 'イベント',
    'trace.initialQuantity': '原料投入量',
    'trace.finalQuantity': '製品完成量',
    'trace.overallYield': '総合歩留まり',
    'trace.qualityCorrelation': '品質パラメータ相関分析',
    'trace.qualityImprovementDesc': '品質改善のために、製品特性間の関係性を分析します。下記は坪量と引張強度の相関を示すデモンストレーションです。',
    'trace.correlationChart': '坪量と引張強度の相関分析',
    'trace.correlationResults': '分析結果:',
    'trace.correlationResult1': '坪量と引張強度の間に正の相関が見られます',
    'trace.correlationResult2': '坪量が高いほど引張強度も向上する傾向があります',
    'trace.correlationResult3': 'この関係性を活用して製品仕様を最適化できます',
    'trace.qualityTrends': '品質傾向',
    'trace.qualityItem': '品質項目',
    'trace.average': '平均値',
    'trace.standardDev': '標準偏差',
    'trace.qualityAchievement': '品質目標達成度',
    'trace.overallQualityRate': '総合品質達成率',
    'trace.basisWeightSpec': '坪量規格内率',
    'trace.moistureSpec': '水分率規格内率',
    'trace.strengthSpec': '強度規格内率',
    
    // 工程名
    'process.pulping.start': 'パルプ化工程開始',
    'process.pulping.end': 'パルプ化工程完了',
    'process.stockPrep.start': '調成工程開始',
    'process.stockPrep.end': '調成工程完了',
    'process.paperMaking.start': '抄紙工程開始',
    'process.paperMaking.end': '抄紙工程完了',
    'process.finishing.start': '仕上げ工程開始',
    'process.finishing.end': '仕上げ工程完了',
    'process.productCompletion': '製品完成',
    'process.shipment': '出荷',
    'process.rawMaterialArrival': '原料入荷',
    
    // その他
    'output.quantity': '出力量',
    'product': '製品',
    'destination': '出荷先',
    'equipment': '設備',
    'operator': '作業者',
    
    // トレーサビリティ検索UI
    'trace.searchAnalysis': 'トレーサビリティ検索・分析',
    'trace.searchTitle': 'トレーサビリティ検索',
    'trace.productLotExample': '例: FPL-0123',
    'trace.batchExample': '例: PB-0456',
    'trace.rawMaterialExample': '例: RML-0089',
    'trace.startDate': '開始日',
    'trace.endDate': '終了日',
    'trace.dateFormat': '年/月/日',
    'trace.executeSearch': '検索実行',
    'trace.searchResults': '検索結果',
    'trace.productLotResult': '製品ロット',
    'trace.showJourneyButton': 'ジャーニーを表示',
    'trace.productionBatch': '生産バッチ',
    'trace.rawMaterialLot': '原料ロット',
    
    // 原料・サプライヤー関連
    'supplier.hokkaido': '北海道木材',
    'material.woodChips': '木材チップ',
    'material.arrival': 'から木材チップが入荷',
    'rawMaterial.supply': '原料供給',
    'rawMaterial.inventory': '原料在庫',
    'rawMaterial.types': '原料類',
  },
  en: {
    // Sidebar
    'sidebar.title': '🏭 Paper Mill DX\nDashboard',
    'nav.summary': '📊 Summary',
    'nav.process': '⚙️ Process Monitor',
    'nav.processFlow': '🏭 Process Flow',
    'nav.traceability': '🔍 Traceability',
    'sidebar.description.1': 'Integrated dashboard for',
    'sidebar.description.2': '• Traceability management',
    'sidebar.description.3': '• Real-time monitoring',
    'sidebar.description.4': '• Process flow visualization',
    'sidebar.description.5': '• KPI analysis',
    'sidebar.description.6': 'of paper mill operations',
    
    // Common
    'language': 'en',
    'language.switch': '🌐',
    'language.japanese': '日本語',
    'language.english': 'English',
    'chart.actual': 'Actual',
    'chart.target': 'Target',
    
    // KPI
    'kpi.oee': 'OEE',
    'kpi.fpy': 'FPY',
    'kpi.energy': 'Energy Intensity',
    'kpi.yield': 'Yield Rate',
    'kpi.fsc': 'FSC Material Ratio',
    'kpi.production': 'Production Rate',
    'kpi.unit.percent': '%',
    'kpi.unit.energy': 'GJ/t',
    'kpi.unit.rate': 't/h',
    
    // Alerts
    'alert.critical': 'Critical',
    'alert.warning': 'Warning',
    'alert.info': 'Info',
    'alert.title': 'Critical Alerts',
    
    // Process
    'process.p1': 'P1: Pulping',
    'process.p2': 'P2: Stock Preparation',
    'process.p3': 'P3: Paper Making',
    'process.p4': 'P4: Finishing',
    
    // Status
    'status.running': 'Running',
    'status.warning': 'Warning',
    'status.error': 'Error',
    'status.stopped': 'Stopped',
    
    // Quality Parameters
    'quality.kappa': 'Kappa Number',
    'quality.brightness': 'Brightness',
    'quality.freeness': 'Freeness',
    'quality.consistency': 'Consistency',
    'quality.basis_weight': 'Basis Weight',
    'quality.moisture': 'Moisture',
    'quality.thickness': 'Thickness',
    'quality.smoothness': 'Smoothness',
    'quality.strength': 'Tensile Strength',
    
    // Buttons & Actions
    'button.search': 'Search',
    'button.clear': 'Clear',
    'button.showJourney': 'Show Journey',
    'button.refresh': 'Refresh',
    
    // Traceability
    'trace.search': 'Search',
    'trace.journey': 'Journey',
    'trace.analysis': 'Analysis',
    'trace.productLot': 'Product Lot ID',
    'trace.batchId': 'Batch ID',
    'trace.rawMaterialLot': 'Raw Material Lot ID',
    'trace.dateRange': 'Date Range',
    
    // Time
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.lastWeek': 'Last Week',
    'time.lastMonth': 'Last Month',
    
    // Dashboard
    'dashboard.title': '📊 Summary Dashboard',
    'dashboard.lastUpdate': 'Last Updated',
    'dashboard.target': 'Target',
    'dashboard.kpiChart': 'Key KPI Performance vs Targets',
    'dashboard.alerts': '🚨 Critical Alerts',
    'dashboard.processFlow': '🏭 Process Flow Status',
    'dashboard.activeBatches': 'Active Batches',
    'dashboard.alertCount': 'Alerts',
    'dashboard.noAlerts': '✅ No critical alerts currently',
    'dashboard.productionToday': "Today's Production",
    'dashboard.planComparison': 'vs Plan',
    'dashboard.energyUsage': 'Energy Usage',
    'dashboard.energyIntensity': 'Intensity',
    'dashboard.environmentalContrib': 'Environmental Contribution',
    'dashboard.fscRatio': 'FSC Material Ratio',
    
    // Alert Messages
    'alert.wireVibration': 'Wire vibration abnormality detected',
    'alert.digestorTemp': 'Digestor temperature rise warning',
    
    // Process Monitoring
    'process.monitoring.title': '⚙️ Process Monitoring Dashboard',
    'process.monitoring.target': 'Target Process',
    'process.monitoring.timeRange': 'Time Range',
    'process.monitoring.refresh': 'Refresh Data',
    'process.monitoring.equipment': '🔧 Equipment Status',
    'process.monitoring.quality': '📊 Quality Parameter Trend Charts',
    'process.monitoring.dataPoints': 'data points',
    'process.monitoring.trend': 'Trend',
    'process.monitoring.latest': 'Latest',
    'process.monitoring.withinSpec': 'Within Spec',
    'process.monitoring.time': 'Time',
    'process.monitoring.stdDev': 'Std Dev',
    'process.monitoring.cdProfile': '📊 Cross Direction Quality Profile (CD Profile)',
    'process.monitoring.cdDescription': 'Display quality uniformity in the cross direction of paper',
    'process.monitoring.profile': 'Profile',
    'process.monitoring.loading': '⚠️ Loading Data',
    'process.monitoring.loadingText': 'Loading quality parameter data...',
    
    // Time Range
    'time.range.1h': 'Past 1 hour',
    'time.range.4h': 'Past 4 hours',
    'time.range.12h': 'Past 12 hours',
    'time.range.24h': 'Past 24 hours',
    
    // Quality Parameter Names
    'quality.param.kappa': 'Kappa Number',
    'quality.param.brightness': 'Brightness',
    'quality.param.freeness': 'Freeness',
    'quality.param.consistency': 'Consistency',
    'quality.param.basisWeight': 'Basis Weight',
    'quality.param.moisture': 'Moisture Content',
    'quality.param.caliper': 'Caliper',
    'quality.param.smoothness': 'Smoothness',
    'quality.param.tensile': 'Tensile Strength',
    
    // Process Flow Monitoring
    'processFlow.title': '🏭 Real-time Process Flow Monitoring',
    'processFlow.controlRoom': 'Central Control Room',
    'processFlow.monitoring': 'Integrated Monitoring System',
    'processFlow.production': 'Production Results',
    'processFlow.todayProduction': "Today's Production",
    'processFlow.efficiency': 'Operating Efficiency',
    'processFlow.qualityRate': 'Quality Achievement Rate',
    'processFlow.energy': 'Energy',
    'processFlow.powerConsumption': 'Power Consumption',
    'processFlow.unitCost': 'Unit Cost',
    'processFlow.alertStatus': 'Alert Status',
    'processFlow.critical': 'Critical',
    'processFlow.warning': 'Warning',
    'processFlow.info': 'Info',
    'processFlow.operator': 'Operator',
    'processFlow.temperature': 'Temperature',
    'processFlow.pressure': 'Pressure',
    'processFlow.flowRate': 'Flow Rate',
    'processFlow.details': 'Details',
    'processFlow.close': 'Close',
    'processFlow.parameters': 'Operating Parameters',
    'processFlow.qualityIndicators': 'Quality Indicators',
    'processFlow.operatorInfo': 'Operator Information',
    'processFlow.activeBatches': 'Active Batches',
    'processFlow.todayAlerts': "Today's Alerts",
    'processFlow.units.pieces': 'pcs',
    'processFlow.units.cases': 'cases',
    'processFlow.units.rolls': 'rolls',
    
    // Traceability - Additional Keys
    'trace.lotJourney': 'Lot Production Journey',
    'trace.sampleDataShown': 'Sample data is being displayed',
    'trace.sampleDescription': 'View the production journey for ',
    'trace.loadJourneyData': 'Load Journey Data',
    'trace.processTimeline': 'Manufacturing process displayed chronologically',
    'trace.eventsCount': 'events',
    'trace.initialQuantity': 'Initial Raw Material',
    'trace.finalQuantity': 'Final Product Output',
    'trace.overallYield': 'Overall Yield',
    'trace.qualityCorrelation': 'Quality Parameter Correlation Analysis',
    'trace.qualityImprovementDesc': 'To improve quality, we analyze relationships between product characteristics. Below is a demonstration showing the correlation between basis weight and tensile strength.',
    'trace.correlationChart': 'Basis Weight vs Tensile Strength Correlation',
    'trace.correlationResults': 'Analysis Results:',
    'trace.correlationResult1': 'A positive correlation is observed between basis weight and tensile strength',
    'trace.correlationResult2': 'Higher basis weight tends to improve tensile strength',
    'trace.correlationResult3': 'This relationship can be utilized to optimize product specifications',
    'trace.qualityTrends': 'Quality Trends',
    'trace.qualityItem': 'Quality Item',
    'trace.average': 'Average',
    'trace.standardDev': 'Standard Deviation',
    'trace.qualityAchievement': 'Quality Target Achievement',
    'trace.overallQualityRate': 'Overall Quality Achievement Rate',
    'trace.basisWeightSpec': 'Basis Weight Within Spec',
    'trace.moistureSpec': 'Moisture Content Within Spec',
    'trace.strengthSpec': 'Strength Within Spec',
    
    // Process Names
    'process.pulping.start': 'Pulping Process Started',
    'process.pulping.end': 'Pulping Process Completed',
    'process.stockPrep.start': 'Stock Preparation Started',
    'process.stockPrep.end': 'Stock Preparation Completed',
    'process.paperMaking.start': 'Paper Making Started',
    'process.paperMaking.end': 'Paper Making Completed',
    'process.finishing.start': 'Finishing Process Started',
    'process.finishing.end': 'Finishing Process Completed',
    'process.productCompletion': 'Product Completed',
    'process.shipment': 'Shipment',
    'process.rawMaterialArrival': 'Raw Material Arrival',
    
    // Others
    'output.quantity': 'Output Quantity',
    'product': 'Product',
    'destination': 'Destination',
    'equipment': 'Equipment',
    'operator': 'Operator',
    
    // Traceability Search UI
    'trace.searchAnalysis': 'Traceability Search & Analysis',
    'trace.searchTitle': 'Traceability Search',
    'trace.productLotExample': 'e.g.: FPL-0123',
    'trace.batchExample': 'e.g.: PB-0456',
    'trace.rawMaterialExample': 'e.g.: RML-0089',
    'trace.startDate': 'Start Date',
    'trace.endDate': 'End Date',
    'trace.dateFormat': 'YYYY/MM/DD',
    'trace.executeSearch': 'Execute Search',
    'trace.searchResults': 'Search Results',
    'trace.productLotResult': 'Product Lot',
    'trace.showJourneyButton': 'Show Journey',
    'trace.productionBatch': 'Production Batch',
    'trace.rawMaterialLot': 'Raw Material Lot',
    
    // Raw Material & Supplier Related
    'supplier.hokkaido': 'Hokkaido Timber',
    'material.woodChips': 'Wood Chips',
    'material.arrival': 'wood chips arrived from',
    'rawMaterial.supply': 'Raw Material Supply',
    'rawMaterial.inventory': 'Raw Material Inventory',
    'rawMaterial.types': 'Raw Materials',
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ja');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ja']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};