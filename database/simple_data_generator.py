"""
簡単なダミーデータ生成スクリプト
製紙工場ダッシュボード用のサンプルデータを生成
"""

import random
from datetime import datetime, timedelta
from models import create_database, get_session, KPIMetrics

def generate_kpi_data():
    """KPI指標データの生成"""
    engine = create_database()
    session = get_session(engine)
    
    # 過去30日分のKPIデータを生成
    start_date = datetime.now() - timedelta(days=30)
    
    kpis = []
    
    for day in range(30):
        current_date = start_date + timedelta(days=day)
        
        # 主要KPI設定
        metrics = [
            {"name": "OEE", "base": 75.0, "variation": 8.0, "unit": "%", "target": 85.0},
            {"name": "FPY", "base": 92.0, "variation": 3.0, "unit": "%", "target": 95.0},
            {"name": "energy_intensity", "base": 4.5, "variation": 0.3, "unit": "GJ/t", "target": 4.2},
            {"name": "yield_rate", "base": 96.0, "variation": 1.5, "unit": "%", "target": 98.0},
            {"name": "fsc_ratio", "base": 25.0, "variation": 5.0, "unit": "%", "target": 30.0},
            {"name": "production_rate", "base": 45.0, "variation": 5.0, "unit": "t/h", "target": 50.0}
        ]
        
        for metric in metrics:
            value = random.gauss(metric["base"], metric["variation"])
            value = max(0, value)  # 負の値を避ける
            
            kpi = KPIMetrics(
                ts=current_date,
                metric_name=metric["name"],
                value=value,
                unit=metric["unit"],
                period_type="daily",
                target_value=metric["target"]
            )
            kpis.append(kpi)
    
    # データベースに保存
    session.add_all(kpis)
    session.commit()
    
    print(f"KPIデータ {len(kpis)}件 を生成しました")
    session.close()

if __name__ == "__main__":
    generate_kpi_data()
    print("ダミーデータの生成が完了しました！")