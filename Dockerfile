# 🏭 製紙工場DXダッシュボード - Multi-stage Docker Build

# ===== フロントエンドビルドステージ =====
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# 依存関係のインストール（キャッシュ効率化）
COPY frontend/package*.json ./
RUN npm ci --only=production

# ソースコードのコピーとビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド本番ステージ =====
FROM python:3.9-slim AS backend-runtime

# システム依存関係
RUN apt-get update && apt-get install -y \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係のインストール
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# バックエンドソースコード
COPY backend/ ./backend/
COPY database/ ./database/

# フロントエンドビルド成果物のコピー
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# データベース初期化
RUN cd database && python simple_data_generator.py

# 実行用ユーザー作成（セキュリティ向上）
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# ポート公開
EXPOSE 8000

# アプリケーション起動
CMD ["python", "backend/main.py"]