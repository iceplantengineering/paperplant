@echo off
echo ========================================
echo 製紙工場DXダッシュボード - 依存関係インストール
echo ========================================
echo.

echo Python仮想環境を作成中...
python -m venv venv
if errorlevel 1 (
    echo Python仮想環境の作成に失敗しました。
    echo Pythonがインストールされているか確認してください。
    pause
    exit /b 1
)

echo.
echo Python仮想環境を有効化中...
call venv\Scripts\activate.bat

echo.
echo Pythonパッケージをインストール中...
pip install fastapi uvicorn sqlalchemy pandas numpy faker pytest httpx
if errorlevel 1 (
    echo Pythonパッケージのインストールに失敗しました。
    pause
    exit /b 1
)

echo.
echo Node.jsの依存関係をインストール中...
cd frontend
npm install
if errorlevel 1 (
    echo Node.jsパッケージのインストールに失敗しました。
    echo Node.jsがインストールされているか確認してください。
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo 依存関係のインストールが完了しました！
echo.
echo 次のステップ：
echo 1. start.bat を実行してアプリケーションを起動
echo 2. ブラウザで http://localhost:3000 にアクセス
echo ========================================
pause