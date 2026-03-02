#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
《赤穹协议》核心游戏引擎
- 动态核平衡系统
- 五大国关系矩阵
- 多支线剧情管理
"""

import json
import os
import sys
from datetime import datetime

class GameEngine:
    def __init__(self):
        self.game_state = {
            "nuclear_tension": 30,  # 核紧张指数 (0-100)
            "relations": {
                "USA": 50,
                "China": 50,
                "Russia": 50,
                "EU": 50,
                "India": 50
            },
            "resources": {
                "budget": 100,  # 单位: 10亿美元
                "tech_level": 30
            },
            "flags": {
                "first_contact_russia": False,
                "africa_proxy_active": False,
                "discovered_secret_weapon": False
            },
            "current_chapter": 1
        }
        self.save_file = "savegame.json"
    
    def display_status(self):
        print("\n" + "="*50)
        print(f"🌍 南太平洋联邦国家安全简报 | {datetime.now().strftime('%Y年%m月%d日')}")
        print("="*50)
        print(f"☢️  核紧张指数: {self.game_state['nuclear_tension']}%")
        print(f"💰 国家预算: ${self.game_state['resources']['budget']}B")
        print(f"🔬 科技水平: {self.game_state['resources']['tech_level']}/100")
        print("\n🌐 五大国关系:")
        for country, relation in self.game_state["relations"].items():
            status = "友好" if relation > 70 else "中立" if relation > 30 else "敌对"
            print(f"  {country}: {relation} ({status})")
        print("="*50)
    
    def chapter_1(self):
        """第一章：南海危机"""
        print("\n🌊 第一章：南海无人艇对峙")
        print("五艘中国无人艇与三艘美国驱逐舰在南海争议海域对峙，")
        print("双方均声称你方海域内的稀土矿脉归属权。")
        print("作为南太平洋联邦安全顾问，你必须立即决策：")
        
        choices = [
            "1. 公开支持美国，允许其舰艇停靠我方港口 (+美关系, -中关系)",
            "2. 向中国出售稀土开采权，换取科技援助 (+中关系, -美关系)",
            "3. 宣布中立，同时向俄罗斯秘密求购S-500防空系统",
            "4. 支持本地渔民组织'海洋守护者'，制造民间冲突"
        ]
        
        for choice in choices:
            print(choice)
        
        while True:
            try:
                selection = int(input("\n请选择行动 [1-4]: "))
                if 1 <= selection <= 4:
                    break
                else:
                    print("请输入 1-4 之间的数字！")
            except ValueError:
                print("请输入有效数字！")
        
        # 执行选择
        if selection == 1:
            self.game_state["relations"]["USA"] += 15
            self.game_state["relations"]["China"] -= 20
            self.game_state["nuclear_tension"] += 10
            print("\n✅ 美国舰队获准停靠，但中国宣布制裁我方航运企业。")
        elif selection == 2:
            self.game_state["relations"]["China"] += 20
            self.game_state["relations"]["USA"] -= 15
            self.game_state["resources"]["tech_level"] += 10
            print("\n✅ 中国技术团队已抵达，但美国第七舰队进入警戒状态。")
        elif selection == 3:
            self.game_state["relations"]["Russia"] += 25
            self.game_state["resources"]["budget"] -= 15
            self.game_state["flags"]["first_contact_russia"] = True
            print("\n✅ 俄罗斯军火商承诺两周内交付S-500，但需预付150亿美元。")
        elif selection == 4:
            self.game_state["nuclear_tension"] -= 5
            self.game_state["relations"]["USA"] -= 5
            self.game_state["relations"]["China"] -= 5
            self.game_state["flags"]["africa_proxy_active"] = True
            print("\n✅ '海洋守护者'成功干扰双方行动，但大国对你产生不信任。")
        
        self.game_state["current_chapter"] = 2
        self.save_game()
        input("\n按回车继续...")
    
    def save_game(self):
        with open(self.save_file, 'w', encoding='utf-8') as f:
            json.dump(self.game_state, f, ensure_ascii=False, indent=2)
        print(f"\n💾 游戏已保存至 {self.save_file}")
    
    def load_game(self):
        if os.path.exists(self.save_file):
            with open(self.save_file, 'r', encoding='utf-8') as f:
                self.game_state = json.load(f)
            print(f"\n📂 已加载存档 {self.save_file}")
            return True
        return False
    
    def run(self):
        print("🚀 启动《赤穹协议》...")
        print("⚠️  本游戏包含多结局，请谨慎决策！")
        
        if self.load_game():
            choice = input("检测到存档，是否继续？[Y/n]: ").lower()
            if choice == 'n':
                self.game_state = GameEngine().__dict__['game_state']
        else:
            print("\n🆕 新游戏开始！")
        
        self.display_status()
        self.chapter_1()
        # 后续章节将在此处扩展

if __name__ == "__main__":
    game = GameEngine()
    game.run()