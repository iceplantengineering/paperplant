@echo off
echo ========================================
echo 製紙工場DXダッシュボードアプリケーション
echo ========================================
echo.

echo データベースとダミーデータを初期化中...
cd database
python models.py
python data_generator.py
cd ..

echo.
echo バックエンドAPIを起動中...
cd backend
start "PaperPlant Backend API" cmd /k "python main.py"
cd ..

echo.
echo フロントエンドを起動中...
cd frontend
start "PaperPlant Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo アプリケーションを起動しました！
echo.
echo フロントエンド: http://localhost:3000
echo バックエンドAPI: http://localhost:8000
echo APIドキュメント: http://localhost:8000/docs
echo ========================================
echo.
echo 使用完了後は、起動したターミナルを閉じてください。
pause