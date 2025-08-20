"""
製紙工場ダッシュボードアプリ - データベースモデル定義
HTMLファイルの設計に基づいたトレーサビリティシステム用データモデル
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import sqlite3

Base = declarative_base()

class RawMaterialLot(Base):
    """原料ロットマスタ - トレーサビリティの起点"""
    __tablename__ = 'raw_material_lots'
    
    lot_id = Column(String(50), primary_key=True)
    arrival_ts = Column(DateTime, nullable=False)
    supplier_name = Column(String(100), nullable=False)
    material_type = Column(String(50))  # 木材チップ、古紙など
    origin_country = Column(String(50))
    fsc_cert_id = Column(String(100))  # FSC認証番号
    quality_report_url = Column(Text)
    weight_kg = Column(Float)
    moisture_content = Column(Float)  # 含水率
    created_at = Column(DateTime, default=datetime.now)
    
    # リレーション
    production_batches = relationship("ProductionBatch", back_populates="raw_material_lot")

class ProductionBatch(Base):
    """生産バッチテーブル - 原料から製品への変換を管理"""
    __tablename__ = 'production_batches'
    
    batch_id = Column(String(50), primary_key=True)
    raw_material_lot_id = Column(String(50), ForeignKey('raw_material_lots.lot_id'))
    creation_ts = Column(DateTime, nullable=False)
    batch_type = Column(String(30))  # Pulp, Stock, Paper
    initial_quantity_kg = Column(Float)
    current_quantity_kg = Column(Float)
    status = Column(String(20))  # active, processing, completed
    
    # リレーション
    raw_material_lot = relationship("RawMaterialLot", back_populates="production_batches")
    process_records = relationship("ProcessRecord", back_populates="batch")
    finished_products = relationship("FinishedProductLot", back_populates="batch")

class ProcessRecord(Base):
    """工程実績テーブル - 各バッチの工程通過履歴"""
    __tablename__ = 'process_records'
    
    record_id = Column(Integer, primary_key=True, autoincrement=True)
    batch_id = Column(String(50), ForeignKey('production_batches.batch_id'))
    process_code = Column(String(10))  # P1:パルプ化, P2:調成, P3:抄紙, P4:仕上げ
    machine_id = Column(String(20))
    start_ts = Column(DateTime)
    end_ts = Column(DateTime)
    operator_id = Column(String(20))
    output_kg = Column(Float)
    
    # リレーション
    batch = relationship("ProductionBatch", back_populates="process_records")
    quality_checks = relationship("QualityCheck", back_populates="process_record")
    machine_logs = relationship("MachineStatusLog", back_populates="process_record")

class QualityCheck(Base):
    """品質検査テーブル - オンライン・オフライン品質データ"""
    __tablename__ = 'quality_checks'
    
    check_id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(Integer, ForeignKey('process_records.record_id'))
    ts = Column(DateTime)
    parameter_name = Column(String(50))  # 坪量、水分率、白色度など
    value = Column(Float)
    value_array = Column(JSON)  # CDプロファイル用配列データ
    target_value = Column(Float)
    upper_limit = Column(Float)
    lower_limit = Column(Float)
    is_ok = Column(Boolean)
    measurement_type = Column(String(20))  # online, offline
    
    # リレーション
    process_record = relationship("ProcessRecord", back_populates="quality_checks")

class FinishedProductLot(Base):
    """製品ロットマスタ - 最終製品の情報"""
    __tablename__ = 'finished_product_lots'
    
    product_lot_id = Column(String(50), primary_key=True)
    batch_id = Column(String(50), ForeignKey('production_batches.batch_id'))
    product_code = Column(String(30))
    completion_ts = Column(DateTime)
    destination = Column(String(100))  # 出荷先
    shipment_ts = Column(DateTime)
    quantity_kg = Column(Float)
    roll_count = Column(Integer)
    final_quality_ok = Column(Boolean)
    
    # リレーション
    batch = relationship("ProductionBatch", back_populates="finished_products")

class MachineStatusLog(Base):
    """設備ステータスログ - アラートとメンテナンス記録"""
    __tablename__ = 'machine_status_logs'
    
    log_id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(Integer, ForeignKey('process_records.record_id'), nullable=True)
    machine_id = Column(String(20))
    ts = Column(DateTime)
    status = Column(String(20))  # running, stopped, maintenance, alarm
    alert_level = Column(String(10))  # info, warning, critical
    message = Column(Text)
    resolved = Column(Boolean, default=False)
    
    # リレーション
    process_record = relationship("ProcessRecord", back_populates="machine_logs")

class KPIMetrics(Base):
    """KPI指標テーブル - 計算済みKPI値の格納"""
    __tablename__ = 'kpi_metrics'
    
    metric_id = Column(Integer, primary_key=True, autoincrement=True)
    ts = Column(DateTime)
    metric_name = Column(String(50))  # OEE, FPY, energy_intensity等
    value = Column(Float)
    unit = Column(String(20))
    period_type = Column(String(10))  # hourly, daily, monthly
    machine_id = Column(String(20), nullable=True)
    target_value = Column(Float)
    
def create_database(database_url="sqlite:///paperplant.db"):
    """データベースとテーブルの作成"""
    engine = create_engine(database_url)
    Base.metadata.create_all(engine)
    return engine

def get_session(engine):
    """セッションファクトリの取得"""
    Session = sessionmaker(bind=engine)
    return Session()

if __name__ == "__main__":
    # データベース作成
    engine = create_database()
    print("データベーステーブルが作成されました。")