"""
製紙工場ダッシュボードアプリ - ダミーデータ生成スクリプト
現実的なシナリオに基づく製紙工場データの生成
"""

import random
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from models import (
    create_database, RawMaterialLot, ProductionBatch, ProcessRecord, 
    QualityCheck, FinishedProductLot, MachineStatusLog, KPIMetrics
)

class PaperMillDataGenerator:
    def __init__(self, database_url="sqlite:///paperplant.db"):
        self.engine = create_database(database_url)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
        
        # サプライヤーマスタ
        self.suppliers = [
            {"name": "北海道木材", "country": "Japan", "fsc_ratio": 0.8, "quality_stable": True},
            {"name": "カナダ森林資源", "country": "Canada", "fsc_ratio": 0.9, "quality_stable": True},
            {"name": "東南アジア木材", "country": "Indonesia", "fsc_ratio": 0.3, "quality_stable": False},
            {"name": "古紙回収センター", "country": "Japan", "fsc_ratio": 1.0, "quality_stable": True},
            {"name": "欧州パルプ", "country": "Sweden", "fsc_ratio": 0.95, "quality_stable": True}
        ]
        
        # 機械マスタ
        self.machines = {
            "P1": ["DG-01", "DG-02"],  # パルプ化：蒸解釜(Digester)
            "P2": ["MC-01", "MC-02"],  # 調成：ミキシングチェスト
            "P3": ["PM-01", "PM-02"],  # 抄紙：抄紙機(Paper Machine)
            "P4": ["RW-01", "RW-02", "SL-01"]  # 仕上：リワインダー・スリッター
        }
        
        # 製品マスタ
        self.products = [
            {"code": "NP-80", "name": "新聞用紙 80g/m²", "target_basis_weight": 80},
            {"code": "OF-90", "name": "オフィス用紙 90g/m²", "target_basis_weight": 90},
            {"code": "CB-120", "name": "段ボール原紙 120g/m²", "target_basis_weight": 120},
            {"code": "CW-60", "name": "コート紙 白 60g/m²", "target_basis_weight": 60}
        ]
        
        # オペレーターマスタ
        self.operators = [f"OP{i:03d}" for i in range(1, 21)]
        
        self.current_time = datetime.now() - timedelta(days=30)
        
    def generate_raw_material_lots(self, count=100):
        """原料ロットの生成"""
        lots = []
        
        for i in range(count):
            supplier = random.choice(self.suppliers)
            
            # 材料タイプ決定
            if "古紙" in supplier["name"]:
                material_type = "古紙"
                weight_range = (15000, 25000)
            else:
                material_type = "木材チップ"
                weight_range = (20000, 40000)
            
            # FSC認証の決定
            fsc_cert = f"FSC-{random.randint(100000, 999999)}" if random.random() < supplier["fsc_ratio"] else None
            
            # 品質のばらつき
            moisture_base = 12.0 if material_type == "木材チップ" else 8.0
            if not supplier["quality_stable"]:
                moisture_content = random.gauss(moisture_base, 2.0)
            else:
                moisture_content = random.gauss(moisture_base, 0.5)
                
            lot = RawMaterialLot(
                lot_id=f"RML-{i+1:04d}",
                arrival_ts=self.current_time + timedelta(hours=i*2),
                supplier_name=supplier["name"],
                material_type=material_type,
                origin_country=supplier["country"],
                fsc_cert_id=fsc_cert,
                weight_kg=random.uniform(*weight_range),
                moisture_content=max(0, moisture_content),
                quality_report_url=f"https://quality.example.com/reports/RML-{i+1:04d}.pdf"
            )
            lots.append(lot)
            
        return lots
    
    def generate_production_flow(self, raw_lots):
        """生産フローの生成（原料→バッチ→工程→製品）"""
        batches = []
        process_records = []
        quality_checks = []
        machine_logs = []
        finished_products = []
        
        for lot in raw_lots[:50]:  # 半分のロットを製品まで完成させる
            # バッチ作成
            batch = ProductionBatch(
                batch_id=f"PB-{len(batches)+1:04d}",
                raw_material_lot_id=lot.lot_id,
                creation_ts=lot.arrival_ts + timedelta(hours=random.uniform(2, 8)),
                batch_type="Pulp",
                initial_quantity_kg=lot.weight_kg * 0.85,  # 歩留まり85%
                current_quantity_kg=lot.weight_kg * 0.85,
                status="completed"
            )
            batches.append(batch)
            
            current_time = batch.creation_ts
            current_quantity = batch.initial_quantity_kg
            
            # 各工程を通る
            for process_code in ["P1", "P2", "P3", "P4"]:
                machine_id = random.choice(self.machines[process_code])
                
                # 工程時間の設定
                process_durations = {"P1": 8, "P2": 4, "P3": 12, "P4": 6}
                base_duration = process_durations[process_code]
                actual_duration = random.gauss(base_duration, base_duration * 0.2)
                
                start_time = current_time + timedelta(hours=random.uniform(0.5, 2))
                end_time = start_time + timedelta(hours=max(1, actual_duration))
                
                # 歩留まり計算
                yield_rates = {"P1": 0.95, "P2": 0.98, "P3": 0.94, "P4": 0.99}
                output_quantity = current_quantity * yield_rates[process_code]
                current_quantity = output_quantity
                
                record = ProcessRecord(
                    batch_id=batch.batch_id,
                    process_code=process_code,
                    machine_id=machine_id,
                    start_ts=start_time,
                    end_ts=end_time,
                    operator_id=random.choice(self.operators),
                    output_kg=output_quantity
                )
                process_records.append(record)
                
                # 品質データ生成
                quality_data = self.generate_quality_data(process_code, record, start_time, end_time)
                quality_checks.extend(quality_data)
                
                # 設備ログ生成（10%の確率でアラート）
                if random.random() < 0.1:
                    alert_time = start_time + timedelta(hours=random.uniform(0, actual_duration))
                    machine_log = MachineStatusLog(
                        machine_id=machine_id,
                        ts=alert_time,
                        status="alarm",
                        alert_level="warning" if random.random() < 0.7 else "critical",
                        message=self.generate_alert_message(process_code, machine_id),
                        resolved=True
                    )
                    machine_logs.append(machine_log)
                
                current_time = end_time
            
            # 製品ロット作成
            product = random.choice(self.products)
            finished_product = FinishedProductLot(
                product_lot_id=f"FPL-{len(finished_products)+1:04d}",
                batch_id=batch.batch_id,
                product_code=product["code"],
                completion_ts=current_time,
                destination=f"Customer-{random.randint(1, 20):02d}",
                shipment_ts=current_time + timedelta(hours=random.uniform(12, 48)),
                quantity_kg=current_quantity,
                roll_count=random.randint(8, 20),
                final_quality_ok=random.random() > 0.05  # 95%良品率
            )
            finished_products.append(finished_product)
            
        return batches, process_records, quality_checks, machine_logs, finished_products
    
    def generate_quality_data(self, process_code, record, start_time, end_time):
        """工程別品質データの生成"""
        quality_checks = []
        duration = (end_time - start_time).total_seconds() / 3600  # 時間
        
        # 工程別パラメータ定義
        quality_params = {
            "P1": [
                {"name": "kappa_number", "target": 15.0, "tolerance": 2.0, "unit": ""},
                {"name": "brightness", "target": 85.0, "tolerance": 3.0, "unit": "%"}
            ],
            "P2": [
                {"name": "freeness_csf", "target": 450.0, "tolerance": 50.0, "unit": "ml"},
                {"name": "consistency", "target": 3.5, "tolerance": 0.3, "unit": "%"}
            ],
            "P3": [
                {"name": "basis_weight", "target": 80.0, "tolerance": 2.0, "unit": "g/m²"},
                {"name": "moisture_content", "target": 5.0, "tolerance": 0.5, "unit": "%"},
                {"name": "caliper", "target": 0.12, "tolerance": 0.01, "unit": "mm"}
            ],
            "P4": [
                {"name": "smoothness", "target": 150.0, "tolerance": 20.0, "unit": "ml/min"},
                {"name": "tensile_strength", "target": 120.0, "tolerance": 15.0, "unit": "N*m/g"}
            ]
        }
        
        if process_code not in quality_params:
            return quality_checks
        
        # データポイント数（工程の長さに応じて）
        num_points = max(5, int(duration * 2))
        
        for param in quality_params[process_code]:
            for i in range(num_points):
                timestamp = start_time + timedelta(hours=duration * i / num_points)
                
                # 基本値にノイズを追加
                value = random.gauss(param["target"], param["tolerance"] / 3)
                
                # CDプロファイル生成（抄紙工程のみ）
                value_array = None
                if process_code == "P3" and param["name"] in ["basis_weight", "moisture_content"]:
                    # 幅方向プロファイル（50ポイント）
                    profile = [value + random.gauss(0, param["tolerance"] / 6) for _ in range(50)]
                    value_array = profile
                
                # 規格判定
                upper_limit = param["target"] + param["tolerance"]
                lower_limit = param["target"] - param["tolerance"]
                is_ok = lower_limit <= value <= upper_limit
                
                check = QualityCheck(
                    record_id=1,  # 仮のID - 実際の保存時に正しく設定
                    ts=timestamp,
                    parameter_name=param["name"],
                    value=value,
                    value_array=value_array,
                    target_value=param["target"],
                    upper_limit=upper_limit,
                    lower_limit=lower_limit,
                    is_ok=is_ok,
                    measurement_type="online" if process_code == "P3" else "offline"
                )
                quality_checks.append(check)
        
        return quality_checks
    
    def generate_alert_message(self, process_code, machine_id):
        """アラートメッセージの生成"""
        messages = {
            "P1": [f"{machine_id}: 蒸解釜温度上昇警告", f"{machine_id}: 薬品供給圧力低下"],
            "P2": [f"{machine_id}: ミキサー回転数異常", f"{machine_id}: パルプ濃度変動大"],
            "P3": [f"{machine_id}: ワイヤー振動異常", f"{machine_id}: ドライヤー蒸気圧低下", f"{machine_id}: QCS測定値異常"],
            "P4": [f"{machine_id}: 巻き取り張力異常", f"{machine_id}: スリッター刃摩耗警告"]
        }
        
        return random.choice(messages.get(process_code, [f"{machine_id}: 一般警告"]))
    
    def generate_kpi_metrics(self, start_date=None, days=30):
        """KPI指標データの生成"""
        if start_date is None:
            start_date = datetime.now() - timedelta(days=days)
        
        kpis = []
        
        # 日次KPI生成
        for day in range(days):
            current_date = start_date + timedelta(days=day)
            
            # 主要KPI
            metrics_config = [
                {"name": "OEE", "base": 75.0, "variation": 8.0, "unit": "%", "target": 85.0},
                {"name": "FPY", "base": 92.0, "variation": 3.0, "unit": "%", "target": 95.0},
                {"name": "energy_intensity", "base": 4.5, "variation": 0.3, "unit": "GJ/t", "target": 4.2},
                {"name": "yield_rate", "base": 96.0, "variation": 1.5, "unit": "%", "target": 98.0},
                {"name": "fsc_ratio", "base": 25.0, "variation": 5.0, "unit": "%", "target": 30.0},
                {"name": "production_rate", "base": 45.0, "variation": 5.0, "unit": "t/h", "target": 50.0}
            ]
            
            for metric_config in metrics_config:
                value = random.gauss(metric_config["base"], metric_config["variation"])
                
                kpi = KPIMetrics(
                    ts=current_date,
                    metric_name=metric_config["name"],
                    value=max(0, value),
                    unit=metric_config["unit"],
                    period_type="daily",
                    target_value=metric_config["target"]
                )
                kpis.append(kpi)
                
        return kpis
    
    def generate_all_data(self):
        """全データの生成と保存"""
        print("原料ロットデータ生成中...")
        raw_lots = self.generate_raw_material_lots(100)
        
        print("生産フローデータ生成中...")
        batches, records, quality_data, machine_logs, products = self.generate_production_flow(raw_lots)
        
        print("KPI指標データ生成中...")
        kpi_data = self.generate_kpi_metrics()
        
        print("データベースに保存中...")
        # 保存処理
        self.session.add_all(raw_lots)
        self.session.add_all(batches)
        self.session.add_all(records)
        self.session.add_all(quality_data)
        self.session.add_all(machine_logs)
        self.session.add_all(products)
        self.session.add_all(kpi_data)
        
        self.session.commit()
        
        print(f"データ生成完了:")
        print(f"- 原料ロット: {len(raw_lots)}件")
        print(f"- 生産バッチ: {len(batches)}件")
        print(f"- 工程記録: {len(records)}件")
        print(f"- 品質データ: {len(quality_data)}件")
        print(f"- 設備ログ: {len(machine_logs)}件")
        print(f"- 製品ロット: {len(products)}件")
        print(f"- KPI指標: {len(kpi_data)}件")

if __name__ == "__main__":
    generator = PaperMillDataGenerator()
    generator.generate_all_data()