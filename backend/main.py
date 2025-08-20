"""
製紙工場ダッシュボードアプリ - FastAPI バックエンド
トレーサビリティとリアルタイム監視のためのRESTful API
"""

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import sys
import os

# データベースモデルのインポート
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'database'))
from models import (
    create_database, get_session, 
    RawMaterialLot, ProductionBatch, ProcessRecord, 
    QualityCheck, FinishedProductLot, MachineStatusLog, KPIMetrics
)

app = FastAPI(
    title="製紙工場ダッシュボードAPI",
    description="トレーサビリティとリアルタイム監視を実現するAPI",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Reactアプリのurl
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データベースセッションの依存関係
engine = create_database()

def get_db():
    session = get_session(engine)
    try:
        yield session
    finally:
        session.close()

# === 総合サマリーダッシュボード用API ===

@app.get("/api/dashboard/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    """工場長・管理者向け総合サマリー情報を取得"""
    
    # 主要KPI取得
    latest_date = db.query(KPIMetrics.ts).order_by(KPIMetrics.ts.desc()).first()
    if latest_date:
        kpis = db.query(KPIMetrics).filter(
            KPIMetrics.ts >= latest_date[0],
            KPIMetrics.period_type == "daily"
        ).all()
    else:
        kpis = []
    
    # KPIデータを整形
    kpi_data = {}
    for kpi in kpis:
        kpi_data[kpi.metric_name] = {
            "value": kpi.value,
            "target": kpi.target_value,
            "unit": kpi.unit,
            "achievement_rate": (kpi.value / kpi.target_value * 100) if kpi.target_value > 0 else 0
        }
    
    # 現在の生産状況
    active_batches = db.query(ProductionBatch).filter(
        ProductionBatch.status.in_(["active", "processing"])
    ).count()
    
    # 重要アラート
    critical_alerts = db.query(MachineStatusLog).filter(
        MachineStatusLog.alert_level == "critical",
        MachineStatusLog.resolved == False,
        MachineStatusLog.ts >= datetime.now() - timedelta(hours=24)
    ).limit(10).all()
    
    alerts_data = []
    for alert in critical_alerts:
        alerts_data.append({
            "machine_id": alert.machine_id,
            "message": alert.message,
            "timestamp": alert.ts,
            "level": alert.alert_level
        })
    
    return {
        "kpis": kpi_data,
        "active_batches": active_batches,
        "critical_alerts": alerts_data,
        "last_updated": datetime.now()
    }

@app.get("/api/dashboard/process-flow")
async def get_process_flow_status(db: Session = Depends(get_db)):
    """工程フロー図用のステータス情報を取得"""
    
    # 各工程の稼働状況
    processes = ["P1", "P2", "P3", "P4"]
    process_status = {}
    
    for process_code in processes:
        # 過去1時間のアラート数
        recent_alerts = db.query(MachineStatusLog).join(
            ProcessRecord, MachineStatusLog.record_id == ProcessRecord.record_id
        ).filter(
            ProcessRecord.process_code == process_code,
            MachineStatusLog.ts >= datetime.now() - timedelta(hours=1),
            MachineStatusLog.resolved == False
        ).count()
        
        # 現在稼働中のバッチ数
        active_records = db.query(ProcessRecord).filter(
            ProcessRecord.process_code == process_code,
            ProcessRecord.end_ts.is_(None)
        ).count()
        
        # ステータス判定
        if recent_alerts > 0:
            status = "alarm"
        elif active_records > 0:
            status = "running"
        else:
            status = "idle"
        
        process_status[process_code] = {
            "status": status,
            "active_batches": active_records,
            "recent_alerts": recent_alerts
        }
    
    return {"processes": process_status}

# === 工程別モニタリングダッシュボード用API ===

@app.get("/api/dashboard/process/{process_code}")
async def get_process_monitoring(
    process_code: str,
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """工程別詳細モニタリングデータを取得"""
    
    if not start_time:
        start_time = datetime.now() - timedelta(hours=24)
    if not end_time:
        end_time = datetime.now()
    
    # 工程記録取得
    records = db.query(ProcessRecord).filter(
        ProcessRecord.process_code == process_code,
        ProcessRecord.start_ts >= start_time,
        ProcessRecord.start_ts <= end_time
    ).order_by(ProcessRecord.start_ts).all()
    
    # 品質データ取得
    quality_data = []
    for record in records:
        qualities = db.query(QualityCheck).filter(
            QualityCheck.record_id == record.record_id
        ).all()
        
        for quality in qualities:
            quality_data.append({
                "timestamp": quality.ts,
                "parameter": quality.parameter_name,
                "value": quality.value,
                "target": quality.target_value,
                "upper_limit": quality.upper_limit,
                "lower_limit": quality.lower_limit,
                "is_ok": quality.is_ok,
                "cd_profile": quality.value_array
            })
    
    # 設備ステータス
    machines_in_process = {
        "P1": ["DG-01", "DG-02"],
        "P2": ["MC-01", "MC-02"], 
        "P3": ["PM-01", "PM-02"],
        "P4": ["RW-01", "RW-02", "SL-01"]
    }
    
    machine_status = []
    for machine_id in machines_in_process.get(process_code, []):
        latest_log = db.query(MachineStatusLog).filter(
            MachineStatusLog.machine_id == machine_id
        ).order_by(MachineStatusLog.ts.desc()).first()
        
        if latest_log:
            machine_status.append({
                "machine_id": machine_id,
                "status": latest_log.status,
                "last_update": latest_log.ts,
                "alert_level": latest_log.alert_level
            })
    
    return {
        "process_code": process_code,
        "time_range": {"start": start_time, "end": end_time},
        "quality_data": quality_data,
        "machine_status": machine_status,
        "total_records": len(records)
    }

@app.get("/api/dashboard/quality-trend/{parameter}")
async def get_quality_trend(
    parameter: str,
    hours: int = Query(24, description="過去何時間のデータを取得するか"),
    db: Session = Depends(get_db)
):
    """特定品質パラメータのトレンドデータを取得"""
    
    start_time = datetime.now() - timedelta(hours=hours)
    
    quality_data = db.query(QualityCheck).filter(
        QualityCheck.parameter_name == parameter,
        QualityCheck.ts >= start_time
    ).order_by(QualityCheck.ts).all()
    
    trend_data = []
    for data in quality_data:
        trend_data.append({
            "timestamp": data.ts,
            "value": data.value,
            "target": data.target_value,
            "upper_limit": data.upper_limit,
            "lower_limit": data.lower_limit,
            "is_ok": data.is_ok
        })
    
    return {
        "parameter": parameter,
        "data": trend_data,
        "time_range": {"hours": hours, "start_time": start_time}
    }

# === トレーサビリティ検索・分析用API ===

@app.get("/api/traceability/search")
async def search_traceability(
    product_lot_id: Optional[str] = None,
    batch_id: Optional[str] = None,
    raw_material_lot_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """トレーサビリティ検索"""
    
    # 検索条件に基づいてデータを取得
    query_results = []
    
    if product_lot_id:
        # 製品ロットから遡る
        product = db.query(FinishedProductLot).filter(
            FinishedProductLot.product_lot_id == product_lot_id
        ).first()
        
        if product:
            query_results.append({
                "type": "product",
                "data": {
                    "product_lot_id": product.product_lot_id,
                    "product_code": product.product_code,
                    "batch_id": product.batch_id,
                    "completion_ts": product.completion_ts,
                    "destination": product.destination,
                    "quantity_kg": product.quantity_kg
                }
            })
            
            batch_id = product.batch_id
    
    if batch_id:
        # バッチ情報取得
        batch = db.query(ProductionBatch).filter(
            ProductionBatch.batch_id == batch_id
        ).first()
        
        if batch:
            query_results.append({
                "type": "batch", 
                "data": {
                    "batch_id": batch.batch_id,
                    "raw_material_lot_id": batch.raw_material_lot_id,
                    "creation_ts": batch.creation_ts,
                    "batch_type": batch.batch_type,
                    "initial_quantity_kg": batch.initial_quantity_kg
                }
            })
            
            raw_material_lot_id = batch.raw_material_lot_id
    
    if raw_material_lot_id:
        # 原料ロット情報取得
        raw_lot = db.query(RawMaterialLot).filter(
            RawMaterialLot.lot_id == raw_material_lot_id
        ).first()
        
        if raw_lot:
            query_results.append({
                "type": "raw_material",
                "data": {
                    "lot_id": raw_lot.lot_id,
                    "supplier_name": raw_lot.supplier_name,
                    "material_type": raw_lot.material_type,
                    "fsc_cert_id": raw_lot.fsc_cert_id,
                    "arrival_ts": raw_lot.arrival_ts,
                    "weight_kg": raw_lot.weight_kg
                }
            })
    
    return {"search_results": query_results}

@app.get("/api/traceability/journey/{lot_id}")
async def get_lot_journey(lot_id: str, db: Session = Depends(get_db)):
    """ロットの生産ジャーニー（タイムライン）を取得"""
    
    # バッチID取得
    if lot_id.startswith("FPL-"):
        # 製品ロットの場合
        product = db.query(FinishedProductLot).filter(
            FinishedProductLot.product_lot_id == lot_id
        ).first()
        if not product:
            raise HTTPException(status_code=404, detail="製品ロットが見つかりません")
        batch_id = product.batch_id
    elif lot_id.startswith("PB-"):
        # バッチIDの場合
        batch_id = lot_id
    else:
        raise HTTPException(status_code=400, detail="無効なロットIDです")
    
    # バッチ情報取得
    batch = db.query(ProductionBatch).filter(
        ProductionBatch.batch_id == batch_id
    ).first()
    
    if not batch:
        raise HTTPException(status_code=404, detail="バッチが見つかりません")
    
    # 工程記録取得
    process_records = db.query(ProcessRecord).filter(
        ProcessRecord.batch_id == batch_id
    ).order_by(ProcessRecord.start_ts).all()
    
    # タイムライン構築
    timeline = []
    
    # 原料入荷
    raw_lot = db.query(RawMaterialLot).filter(
        RawMaterialLot.lot_id == batch.raw_material_lot_id
    ).first()
    
    if raw_lot:
        timeline.append({
            "timestamp": raw_lot.arrival_ts,
            "event_type": "raw_material_arrival",
            "title": "原料入荷",
            "description": f"{raw_lot.supplier_name}から{raw_lot.material_type}が入荷",
            "data": {
                "supplier": raw_lot.supplier_name,
                "weight": raw_lot.weight_kg,
                "fsc_cert": raw_lot.fsc_cert_id
            }
        })
    
    # 各工程の実行
    for record in process_records:
        # 品質データ取得
        quality_checks = db.query(QualityCheck).filter(
            QualityCheck.record_id == record.record_id
        ).all()
        
        process_names = {
            "P1": "パルプ化工程",
            "P2": "調成工程", 
            "P3": "抄紙工程",
            "P4": "仕上げ工程"
        }
        
        timeline.append({
            "timestamp": record.start_ts,
            "event_type": "process_start",
            "title": f"{process_names.get(record.process_code, record.process_code)}開始",
            "description": f"設備: {record.machine_id}, オペレーター: {record.operator_id}",
            "data": {
                "machine_id": record.machine_id,
                "operator_id": record.operator_id,
                "output_kg": record.output_kg,
                "quality_checks": len(quality_checks)
            }
        })
        
        if record.end_ts:
            timeline.append({
                "timestamp": record.end_ts,
                "event_type": "process_end",
                "title": f"{process_names.get(record.process_code, record.process_code)}完了",
                "description": f"出力量: {record.output_kg:.1f}kg",
                "data": {
                    "duration_hours": (record.end_ts - record.start_ts).total_seconds() / 3600,
                    "output_kg": record.output_kg
                }
            })
    
    # 製品完成
    finished_product = db.query(FinishedProductLot).filter(
        FinishedProductLot.batch_id == batch_id
    ).first()
    
    if finished_product:
        timeline.append({
            "timestamp": finished_product.completion_ts,
            "event_type": "product_completion", 
            "title": "製品完成",
            "description": f"製品: {finished_product.product_code}",
            "data": {
                "product_code": finished_product.product_code,
                "quantity_kg": finished_product.quantity_kg,
                "roll_count": finished_product.roll_count
            }
        })
        
        if finished_product.shipment_ts:
            timeline.append({
                "timestamp": finished_product.shipment_ts,
                "event_type": "shipment",
                "title": "出荷",
                "description": f"出荷先: {finished_product.destination}",
                "data": {
                    "destination": finished_product.destination,
                    "quantity_kg": finished_product.quantity_kg
                }
            })
    
    return {
        "lot_id": lot_id,
        "batch_id": batch_id,
        "timeline": timeline
    }

# === KPI・分析用API ===

@app.get("/api/kpi/trend/{metric_name}")
async def get_kpi_trend(
    metric_name: str,
    period: str = Query("daily", regex="^(hourly|daily|monthly)$"),
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """KPI指標のトレンドデータを取得"""
    
    start_date = datetime.now() - timedelta(days=days)
    
    kpi_data = db.query(KPIMetrics).filter(
        KPIMetrics.metric_name == metric_name,
        KPIMetrics.period_type == period,
        KPIMetrics.ts >= start_date
    ).order_by(KPIMetrics.ts).all()
    
    trend_data = []
    for kpi in kpi_data:
        trend_data.append({
            "timestamp": kpi.ts,
            "value": kpi.value,
            "target": kpi.target_value,
            "unit": kpi.unit,
            "achievement_rate": (kpi.value / kpi.target_value * 100) if kpi.target_value > 0 else 0
        })
    
    return {
        "metric_name": metric_name,
        "period": period,
        "data": trend_data
    }

@app.get("/api/alerts")
async def get_alerts(
    status: str = Query("active", regex="^(active|resolved|all)$"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """アラート・通知一覧を取得"""
    
    query = db.query(MachineStatusLog)
    
    if status == "active":
        query = query.filter(MachineStatusLog.resolved == False)
    elif status == "resolved":
        query = query.filter(MachineStatusLog.resolved == True)
    
    alerts = query.order_by(MachineStatusLog.ts.desc()).limit(limit).all()
    
    alert_data = []
    for alert in alerts:
        alert_data.append({
            "log_id": alert.log_id,
            "machine_id": alert.machine_id,
            "timestamp": alert.ts,
            "status": alert.status,
            "alert_level": alert.alert_level,
            "message": alert.message,
            "resolved": alert.resolved
        })
    
    return {"alerts": alert_data}

@app.get("/health")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"status": "healthy", "timestamp": datetime.now()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)