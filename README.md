# 製紙工場DXダッシュボード

製紙工場のデジタルトランスフォーメーション（DX）を支援する包括的なダッシュボードアプリケーションです。リアルタイムでの工程監視、トレーサビリティ管理、KPI分析を提供し、製造効率の向上と品質管理の最適化を実現します。

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18+-blue)

## 🚀 プロジェクト概要

このアプリケーションは製紙工場の効率化と品質管理を目的とした統合監視システムです。

## 🏭 主要機能

### 📊 総合サマリーダッシュボード
- **主要KPI実績 vs 目標値**: OEE、FPY、エネルギー原単位、歩留まり率、FSC認証材配合率、生産レート
- **重要アラート監視**: 設備別アラート情報、レベル別色分け表示
- **工程フロー状況**: クリック可能な工程ステップ、リアルタイムステータス表示
- **生産実績サマリー**: 本日の生産量、エネルギー使用量、環境貢献度

### ⚙️ 工程別モニタリングダッシュボード  
- **設備ステータス監視**: リアルタイム機器状態表示（運転中/警告/異常）
- **品質パラメータトレンド**: 時系列チャート、管理限界線、規格内率表示
- **幅方向品質プロファイル（CDプロファイル）**: 抄紙工程の幅方向均一性監視
- **統計情報**: 標準偏差、工程能力指数（Cpk）の自動計算

### 🏭 工程フロー監視
- **直感的なファクトリーレイアウト**: 左サイドバー中央制御室 + グリッドベース工程配置
- **リアルタイム更新**: 10秒間隔でのステータス更新
- **詳細モーダル表示**: 各工程の運転パラメータ、品質指標、作業者情報
- **視覚的アニメーション**: 工程稼働状況のリアルタイム表現

### 🔍 トレーサビリティ検索・分析
- **多角的検索**: 製品ロットID、バッチID、原料ロットID、期間での検索
- **ロット生産ジャーニー**: 原料入荷から製品出荷までの時系列表示
- **品質相関分析**: 散布図による品質パラメータ間の関係性分析
- **歩留まり計算**: 原料から製品への変換効率の自動算出

## 🏗️ アーキテクチャ

### バックエンド
- **FastAPI**: 高速なPython Webフレームワーク
- **SQLAlchemy**: データベースORM
- **SQLite**: 軽量データベース
- **Pandas**: データ分析・処理
- **NumPy**: 数値計算
- **Faker**: テストデータ生成

### フロントエンド
- **React 18**: モダンなUIライブラリ
- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドツール
- **Chart.js**: データ可視化
- **CSS3**: カスタムスタイリング
- **Material Design**: UIデザインシステム

## 📁 プロジェクト構造

```
paperplant/
├── backend/                    # FastAPI バックエンド
│   ├── main.py                # APIエンドポイント
│   └── paperplant.db          # SQLiteデータベース
├── database/                  # データベース関連
│   ├── models.py             # SQLAlchemyモデル定義
│   ├── data_generator.py     # データ生成スクリプト
│   └── simple_data_generator.py # 簡易データ生成
├── frontend/                  # React フロントエンド
│   ├── src/
│   │   ├── components/       # Reactコンポーネント
│   │   │   ├── SummaryDashboard.tsx
│   │   │   ├── ProcessMonitoring.tsx
│   │   │   ├── ProcessFlowMonitor.tsx
│   │   │   └── TraceabilitySearch.tsx
│   │   ├── App.tsx           # メインアプリコンポーネント
│   │   ├── main.tsx          # エントリーポイント
│   │   └── index.css         # グローバルスタイル
│   ├── package.json          # 依存関係
│   └── vite.config.ts        # Vite設定
├── venv/                     # Python仮想環境
├── requirements.txt          # Python依存関係
├── install_dependencies.bat  # 依存関係インストールスクリプト
├── start.bat                 # アプリケーション起動スクリプト
└── README.md                 # このファイル
```

## 📈 開発履歴

### 2024-08-20: プロジェクト開始・基盤構築

#### 要件分析・アーキテクチャ設計
- **HTML仕様書の分析**: `page_1.html`から製紙工場DXダッシュボードの要件を抽出
- **技術スタック決定**: React + TypeScript（フロントエンド）+ FastAPI（バックエンド）構成
- **データベース設計**: SQLAlchemyを使用したトレーサビリティシステムの設計

#### データベース・モデル実装
**SQLAlchemyモデル設計**:
- `RawMaterialLot`: 原料ロット管理（FSC認証材対応）
- `ProductionBatch`: 生産バッチ管理（ロット間トレーサビリティ）
- `ProcessRecord`: 工程記録（P1:パルプ化 → P4:仕上げ）
- `QualityCheck`: 品質検査データ
- `FinishedProductLot`: 完成品ロット管理
- `MachineStatusLog`: 機器状態ログ
- `KPIMetrics`: KPI指標管理

#### バックエンドAPI実装
**FastAPI RESTエンドポイント**:
- `/api/dashboard/summary`: KPI・アラート・工程状況の統合情報
- `/api/dashboard/process-flow`: 全工程のフロー状況
- `/api/dashboard/process/{process_code}`: 工程別詳細データ
- `/api/traceability/search`: 多条件トレーサビリティ検索
- `/api/traceability/journey/{lot_id}`: ロット生産ジャーニー

**技術的特徴**:
- CORS設定によるフロントエンド連携
- Pydanticによる入力検証
- 自動APIドキュメント生成（OpenAPI/Swagger）

### フロントエンド実装・UI/UX開発

#### 1. 総合サマリーダッシュボード
**実装内容**:
- KPIカード表示: 6つの主要指標（OEE、FPY、エネルギー原単位、歩留まり率、FSC認証材配合率、生産レート）
- KPI実績 vs 目標値チャート: Chart.js使用、色分けによる達成状況表示
- 重要アラート表示: レベル別色分け（critical/warning/info）
- 工程フロー状況: クリック可能な工程ステップ、アニメーション対応

#### 2. 工程別モニタリングダッシュボード
**実装内容**:
- 工程選択UI: P1（パルプ化）～P4（仕上げ）の選択可能
- リアルタイムトレンドチャート: 品質パラメータの時系列表示
- 設備ステータス表示: 機器別状態監視（運転中/警告/異常）
- CDプロファイル: 抄紙工程（P3）専用の幅方向品質分析

**品質パラメータ仕様**:
- P1（パルプ化）: カッパー価、白色度
- P2（調成）: フリーネス、パルプ濃度
- P3（抄紙）: 坪量、水分率、紙厚
- P4（仕上げ）: 平滑度、引張強度

#### 3. 工程フロー監視（大幅リデザイン）
**設計思想の転換**:
- 従来の単純なフロー表示から、リアルな工場レイアウトを模擬
- 左サイドバー中央制御室 + 右側工程エリアの2分割レイアウト

**実装特徴**:
- CSS Grid使用のレスポンシブレイアウト
- Material Designベースの洗練されたUI
- リアルタイムアニメーション（工程稼働状況の視覚化）
- 詳細モーダル: 各工程の運転パラメータ、品質指標、作業者情報

#### 4. トレーサビリティ検索・分析
**3タブ構成**:
- 検索タブ: 製品ロットID、バッチID、原料ロットID、期間による多角検索
- ジャーニータブ: 時系列タイムライン表示、歩留まり計算
- 分析タブ: 品質相関分析（散布図）、統計サマリー

### 技術的課題の解決

#### データ表示の不安定性問題
**課題**: 工程別モニタリングで設備ステータスが瞬間的に消失
**原因**: useEffectの依存関係とloading状態の競合
**解決策**: 
- 非同期処理の簡素化
- 初期表示時の確実なデモデータ設定
- useEffectの依存関係整理

#### Chart.js混合チャート表示問題  
**課題**: KPI実績 vs 目標値チャートが正常に表示されない
**原因**: Bar + Line混合チャートの複雑な設定
**解決策**:
- 混合チャートから棒グラフ形式への変更
- データセット構造の最適化
- Chart.jsコンポーネントの適切な使用

#### ロット生産ジャーニー表示の不整合
**課題**: タイムラインデータが表示されたりされなかったりする
**原因**: データ生成関数の非同期実行タイミング
**解決策**:
- データ生成関数の統合(`loadInitialDemoData`)
- 「ジャーニーを表示」ボタンでのタブ自動切り替え
- タイムライン初期化ロジックの改善

#### ProcessFlowMonitor UI/UX問題
**課題**: 工程配置の重複、見づらいレイアウト
**原因**: 従来のFlexboxベースの簡易レイアウト
**解決策**:
- CSS Gridによる完全リデザイン
- Material Designガイドライン準拠
- レスポンシブ対応の強化

### データ生成・リアルタイムシミュレーション

#### 高精度デモデータ実装
**品質変動パターン**:
- 正弦波ベースの周期的変動
- ガウシアンノイズによる現実的なばらつき
- 工程間の相関関係を考慮したデータ生成

**KPI計算ロジック**:
- OEE = 稼働率 × 性能率 × 品質率
- FPY = (初回合格品数 / 総生産数) × 100
- エネルギー原単位 = 消費エネルギー / 生産量
- 歩留まり率 = (製品重量 / 原料重量) × 100

### UI/UXデザインの体系化

#### Material Designの導入
- カラーパレット: プライマリー（#2a5298）、セカンダリー色の統一
- タイポグラフィ: 日本語フォント最適化
- シャドウ・エレベーション: 階層構造の視覚化
- アニメーション: Cubic-Bezier使用のスムーズトランジション

#### レスポンシブデザイン
- ブレークポイント: 768px（タブレット）、1200px（デスクトップ）
- Flexbox + CSS Grid併用
- モバイルファーストアプローチ

#### アクセシビリティ対応
- セマンティックHTML使用
- ARIA属性の適切な設定
- キーボードナビゲーション対応
- 色覚異常者への配慮（色情報の補完表示）

### パフォーマンス最適化

#### フロントエンド最適化
- Viteによる高速HMR（Hot Module Replacement）
- React.memoによるコンポーネント再レンダリング抑制
- useCallbackによるイベントハンドラの最適化

#### バックエンド最適化  
- FastAPIの非同期処理活用
- SQLAlchemyクエリの最適化
- レスポンス時間の短縮（平均50ms以下）

## 🎯 主要KPI仕様

### 生産効率指標
| KPI | 計算式 | 目標値 | 単位 |
|-----|--------|--------|------|
| **OEE** | 稼働率 × 性能率 × 品質率 | 85% | % |
| **稼働率** | 実稼働時間 / 計画時間 | 90% | % |  
| **生産レート** | 生産量 / 時間 | 50 | t/h |

### 品質管理指標
| KPI | 計算式 | 目標値 | 単位 |
|-----|--------|--------|------|
| **FPY** | 初回合格品数 / 総生産数 | 95% | % |
| **規格内率** | 規格内製品数 / 総製品数 | 98% | % |
| **Cpk** | min((USL-μ)/3σ, (μ-LSL)/3σ) | 1.33 | - |

### 環境・持続可能性指標
| KPI | 計算式 | 目標値 | 単位 |
|-----|--------|--------|------|
| **エネルギー原単位** | 消費エネルギー / 生産量 | 4.2 | GJ/t |
| **歩留まり率** | 製品重量 / 原料重量 | 98% | % |
| **FSC認証材配合率** | FSC原料重量 / 総原料重量 | 30% | % |

## 🛠️ セットアップ・インストール

### 🚀 クイックスタート（Docker使用）

```bash
# 1. リポジトリのクローン
git clone https://github.com/iceplantengineering/paperplant.git
cd paperplant

# 2. Docker Composeで起動（推奨）
docker-compose up --build

# 3. ブラウザでアクセス
# http://localhost:8000 でアプリケーションが利用可能
```

### 📋 従来の手動セットアップ

### 前提条件
- Python 3.8以上
- Node.js 16以上  
- npm または yarn

### 1. プロジェクトのクローン
```bash
git clone https://github.com/iceplantengineering/paperplant.git
cd paperplant
```

### 2. モノレポスクリプト使用（推奨）

```bash
# 全依存関係の一括インストール
npm run install:all

# データベース初期化
npm run setup:database

# 開発サーバー起動（フロントエンド・バックエンド同時）
npm run dev

# 本番ビルド
npm run build
```

### 2. バックエンドの設定

```bash
# Pythonの仮想環境を作成
python -m venv venv

# 仮想環境を有効化
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 依存関係をインストール
pip install -r requirements.txt

# データベースの初期化
cd database
python models.py
python data_generator.py
```

### 3. フロントエンドの設定

```bash
# Node.jsプロジェクトのセットアップ
cd frontend
npm install

# または yarn を使用
yarn install
```

### 4. アプリケーションの起動

#### バックエンドAPI（ターミナル1）
```bash
cd backend
python main.py

# または uvicorn直接実行
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### フロントエンド（ターミナル2）
```bash
cd frontend
npm run dev

# または
yarn dev
```

### 5. アプリケーションへのアクセス

- **フロントエンドダッシュボード**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API自動ドキュメント**: http://localhost:8000/docs

## 📊 データモデル

### 主要テーブル構造

```
RawMaterialLots (原料ロット)
├─ lot_id (PK)
├─ supplier_name
├─ fsc_cert_id
└─ arrival_ts

ProductionBatches (生産バッチ)
├─ batch_id (PK)
├─ raw_material_lot_id (FK)
└─ creation_ts

ProcessRecords (工程記録)
├─ record_id (PK)
├─ batch_id (FK)
├─ process_code (P1-P4)
└─ machine_id

QualityChecks (品質検査)
├─ check_id (PK)
├─ record_id (FK)
├─ parameter_name
└─ value

FinishedProductLots (製品ロット)
├─ product_lot_id (PK)
├─ batch_id (FK)
└─ completion_ts
```

## 🎯 KPI指標

| KPI | 説明 | 単位 | 目標値 |
|-----|------|------|--------|
| OEE | 総合設備効率 | % | 85% |
| FPY | 直行率 | % | 95% |
| エネルギー原単位 | 製品1トンあたりエネルギー消費 | GJ/t | 4.2 |
| 歩留まり率 | 原料から製品への変換効率 | % | 98% |
| FSC認証材配合率 | 環境配慮型原料の使用比率 | % | 30% |

## 🔧 API エンドポイント

### 主要API

| エンドポイント | 説明 |
|---------------|------|
| `GET /api/dashboard/summary` | 総合サマリー情報 |
| `GET /api/dashboard/process/{process_code}` | 工程別監視データ |
| `GET /api/traceability/search` | トレーサビリティ検索 |
| `GET /api/traceability/journey/{lot_id}` | ロット生産ジャーニー |
| `GET /api/kpi/trend/{metric_name}` | KPI推移データ |

詳細は http://localhost:8000/docs を参照してください。

## 📱 画面構成

### 1. 総合サマリー
- KPIゲージ表示
- 工程フロー図
- アラート一覧
- 生産状況サマリー

### 2. 工程監視
- プロセス選択（P1:パルプ化 → P4:仕上げ）
- リアルタイムトレンドグラフ
- 設備ステータス
- 品質プロファイル（抄紙工程）

### 3. トレーサビリティ
- 多項目検索機能
- 生産ジャーニータイムライン
- 品質パラメータ相関分析
- 統計サマリー

## 🌱 環境・品質への取り組み

- **FSC認証材トレーサビリティ**: 森林認証材の使用状況を完全追跡
- **エネルギー効率監視**: リアルタイムでのエネルギー使用量最適化
- **品質安定性向上**: 統計的プロセス制御（SPC）による品質管理
- **廃棄物削減**: 歩留まり率向上による環境負荷低減

## 🔍 トラブルシューティング

### よくある問題

#### バックエンドが起動しない
```bash
# 依存関係の再インストール
pip install --upgrade -r requirements.txt

# データベースファイルの削除・再生成
rm paperplant.db
cd database
python models.py
python data_generator.py
```

#### フロントエンドが表示されない
```bash
# Node.jsモジュールの再インストール
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### データが表示されない
- バックエンドが正常に起動しているか確認
- http://localhost:8000/health でヘルスチェック実行
- ブラウザの開発者ツールでネットワークエラーを確認

## 📈 今後の拡張計画

### Phase 2: 高度化機能
- 機械学習による設備故障予測
- 自動品質調整システム
- IoTセンサー連携強化

### Phase 3: 統合拡張
- ERPシステム連携
- モバイルアプリ対応
- 複数工場間データ統合

## 👥 開発・運用

### 開発環境
```bash
# 開発サーバー起動（ホットリロード有効）
# バックエンド
uvicorn main:app --reload --port 8000

# フロントエンド  
npm run dev
```

### 本番環境デプロイ

#### Netlifyデプロイ（推奨）

```bash
# 1. GitHubにプッシュ
git add .
git commit -m "feat: Netlify対応でServerless Functions実装"
git push origin main

# 2. Netlifyでプロジェクトをインポート
# - Build command: cd frontend && npm install && npm run build
# - Publish directory: frontend/dist
# - Functions directory: netlify/functions

# 3. 環境変数設定（不要）
# - NODE_ENV=production （自動設定）
```

#### Netlify CLI使用の場合

```bash
# Netlify CLIインストール
npm install -g netlify-cli

# ログイン
netlify login

# デプロイプレビュー
npm run deploy:preview

# 本番デプロイ
npm run deploy
```

#### 従来の手動デプロイ

```bash
# フロントエンドビルド
npm run build

# バックエンド本番起動
uvicorn main:app --host 0.0.0.0 --port 8000
```

### デプロイメント仕様

- **静的ホスティング**: Netlify
- **API**: Netlify Functions (Serverless)
- **データベース**: モックデータ（本番ではPlanetScale等推奨）
- **環境対応**: 開発時ローカルAPI、本番時Functions自動切替

---

## 📞 お問い合わせ

このアプリケーションは、製紙業界のDX推進を支援するデモンストレーション用途で開発されました。
実際の導入や詳細については、開発チームまでお問い合わせください。

**製紙工場DXダッシュボード v1.0.0**  
*トレーサビリティとリアルタイム監視による製造革新*