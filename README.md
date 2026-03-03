# 《赤穹协议》(Crimson Vault Protocol)

一款基于 Python/Web 的多支线、多结局军事权谋文字冒险游戏。

## 🌍 背景设定
公元2049年，五大拥核势力在毁灭边缘签署《赤穹协议》，禁止直接战争但允许代理人冲突。你扮演南太平洋联邦的国家安全顾问，在核威慑阴影下周旋于大国之间，决定国家命运。

## 🎮 核心玩法
- **动态核平衡系统**：每个决策影响全球核紧张指数
- **五大国关系矩阵**：美、中、俄、欧、印的实时态度变化
- **多维行动**：外交谈判、代理人战争、科技研发、经济制裁
- **多章节剧情**：
  - 第一章：南海危机
  - 第二章：非洲代理人战争  
  - 第三章：科技竞赛
- **6+ 结局**：从第六极崛起到核冬天，你的选择塑造世界

## ▶️ 快速开始

### 网页版（推荐）
```bash
# 进入项目目录
cd chiqiong-protocol

# 启动本地服务器
python3 -m http.server 8081

# 在浏览器中访问
# http://localhost:8081
```

### Python 命令行版
```bash
# 进入项目目录
cd chiqiong-protocol

# 运行游戏
python3 main.py
```

## 📁 项目结构
```
chiqiong-protocol/
├── index.html          # 网页版入口
├── main.py             # Python命令行版
├── css/                # 样式文件
│   ├── style.css
│   └── game.css
├── js/                 # JavaScript文件
│   ├── game.js         # 游戏引擎
│   └── main.js         # 主程序
└── images/             # 图片资源
    ├── flags/          # 国旗图标
    └── scenes/         # 场景插图
```

## 🖼️ 视觉特色
- 响应式网页设计，支持桌面和移动设备
- SVG 矢量图形，清晰度无损
- 动态关系可视化，直观显示国际局势
- 军事主题配色方案

## 💾 游戏保存
- **网页版**：自动保存到浏览器 localStorage
- **Python版**：保存到 savegame.json 文件

## 📜 许可证
MIT License