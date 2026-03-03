/**
 * 《赤穹协议》网页版游戏引擎
 * 多章节、多结局军事权谋文字冒险游戏
 */

class GameEngine {
    constructor() {
        this.gameState = {
            nuclearTension: 30,
            relations: { USA: 50, China: 50, Russia: 50, EU: 50, India: 50 },
            resources: { budget: 100, techLevel: 30 },
            flags: {
                firstContactRussia: false,
                africaProxyActive: false,
                discoveredSecretWeapon: false,
                africanConflictResolved: false,
                techRaceStarted: false,
                quantumBreakthrough: false,
                aiSupremacy: false
            },
            currentChapter: 1
        };
        this.saveKey = 'chiqiongProtocolSave';
        this.currentChoices = [];
    }

    // 初始化游戏
    init() {
        this.loadGame();
        this.displayStatus();
        this.startChapter();
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        document.getElementById('new-game-btn').onclick = () => this.newGame();
        document.getElementById('save-game-btn').onclick = () => {
            this.saveGame();
            this.showMessage('游戏已保存！');
        };
        document.getElementById('load-game-btn').onclick = () => {
            if (this.loadGame()) {
                this.displayStatus();
                this.startChapter();
                this.showMessage('游戏已加载！');
            } else {
                this.showMessage('没有找到存档！');
            }
        };
    }

    // 显示状态
    displayStatus() {
        const statusDiv = document.getElementById('game-status');
        const countryNames = { USA: '美国', China: '中国', Russia: '俄罗斯', EU: '欧盟', India: '印度' };
        
        let html = `
            <div class="status-row">
                <div class="status-item">
                    <span class="status-label">☢️ 核紧张指数</span>
                    <div class="status-bar"><div class="status-fill" style="width:${this.gameState.nuclearTension}%"></div></div>
                    <span class="status-value">${this.gameState.nuclearTension}%</span>
                </div>
                <div class="status-item">
                    <span class="status-label">💰 国家预算</span>
                    <span class="status-value">$${this.gameState.resources.budget}B</span>
                </div>
                <div class="status-item">
                    <span class="status-label">🔬 科技水平</span>
                    <span class="status-value">${this.gameState.resources.techLevel}/100</span>
                </div>
            </div>
            <div class="relations-panel">
                <h3>🌐 五大国关系</h3>
                <div class="relations-grid">
        `;
        
        for (const [code, name] of Object.entries(countryNames)) {
            const val = this.gameState.relations[code];
            const status = val > 70 ? '友好' : val > 30 ? '中立' : '敌对';
            const cls = val > 70 ? 'friendly' : val > 30 ? 'neutral' : 'hostile';
            html += `
                <div class="relation-item ${cls}">
                    <img src="images/flags/${code.toLowerCase()}.svg" alt="${name}" class="relation-flag">
                    <div class="relation-info">
                        <span class="relation-name">${name}</span>
                        <span class="relation-value">${val} (${status})</span>
                    </div>
                </div>
            `;
        }
        
        html += '</div></div>';
        statusDiv.innerHTML = html;
    }

    // 开始章节
    startChapter() {
        switch(this.gameState.currentChapter) {
            case 1: this.chapter1(); break;
            case 2: this.chapter2(); break;
            case 3: this.chapter3(); break;
            default: this.checkEnding();
        }
    }

    // 第一章：南海危机
    chapter1() {
        this.showScene(
            '🌊 第一章：南海无人艇对峙',
            `五艘中国无人艇与三艘美国驱逐舰在南海争议海域对峙，
             双方均声称你方海域内的稀土矿脉归属权。
             作为南太平洋联邦安全顾问，你必须立即决策：`,
            'images/chapter1-scene.svg',
            [
                { text: '公开支持美国，允许其舰艇停靠我方港口', action: () => {
                    this.gameState.relations.USA += 15;
                    this.gameState.relations.China -= 20;
                    this.gameState.nuclearTension += 10;
                    this.showMessage('✅ 美国舰队获准停靠，但中国宣布制裁我方航运企业。');
                }},
                { text: '向中国出售稀土开采权，换取科技援助', action: () => {
                    this.gameState.relations.China += 20;
                    this.gameState.relations.USA -= 15;
                    this.gameState.resources.techLevel += 10;
                    this.showMessage('✅ 中国技术团队已抵达，但美国第七舰队进入警戒状态。');
                }},
                { text: '宣布中立，向俄罗斯秘密求购S-500防空系统', action: () => {
                    this.gameState.relations.Russia += 25;
                    this.gameState.resources.budget -= 15;
                    this.gameState.flags.firstContactRussia = true;
                    this.showMessage('✅ 俄罗斯军火商承诺两周内交付S-500。');
                }},
                { text: '支持本地渔民组织"海洋守护者"，制造民间冲突', action: () => {
                    this.gameState.nuclearTension -= 5;
                    this.gameState.relations.USA -= 5;
                    this.gameState.relations.China -= 5;
                    this.gameState.flags.africaProxyActive = true;
                    this.showMessage('✅ "海洋守护者"成功干扰双方行动，但大国对你产生不信任。');
                }}
            ],
            () => { this.gameState.currentChapter = 2; this.saveGame(); this.startChapter(); }
        );
    }

    // 第二章：非洲代理人战争
    chapter2() {
        let title, text;
        if (this.gameState.flags.africaProxyActive) {
            title = '⚔️ 第二章：非洲代理人战争升级';
            text = `'海洋守护者'的成功让大国意识到民间力量的价值。
                    现在刚果民主共和国的钴矿争夺战中，美国支持的M23叛军与
                    中国支持的政府军激烈交火，双方都要求你提供后勤基地。`;
        } else {
            title = '⚔️ 第二章：非洲代理人战争';
            text = `刚果民主共和国的钴矿争夺战升级，大国代理人冲突激烈。
                    你需要在这场资源争夺战中做出选择。`;
        }
        
        this.showScene(title, text, 'images/scenes/africa-proxy.svg',
            [
                { text: '支持美国代理力量 (+美关系, -中关系, -预算)', action: () => {
                    this.gameState.relations.USA += 10;
                    this.gameState.relations.China -= 15;
                    this.gameState.resources.budget -= 20;
                    this.gameState.nuclearTension += 5;
                    this.showMessage('✅ 美国情报部门表示感谢，但中国强烈抗议。');
                }},
                { text: '支持中国代理力量 (+中关系, -美关系, +预算)', action: () => {
                    this.gameState.relations.China += 15;
                    this.gameState.relations.USA -= 10;
                    this.gameState.resources.budget += 25;
                    this.gameState.nuclearTension += 5;
                    this.showMessage('✅ 中国军方对你的支持印象深刻，美国发出警告。');
                }},
                { text: '呼吁停火，提供人道主义援助 (中立立场, -预算)', action: () => {
                    this.gameState.relations.USA -= 5;
                    this.gameState.relations.China -= 5;
                    this.gameState.resources.budget -= 30;
                    this.gameState.nuclearTension -= 10;
                    this.gameState.flags.africanConflictResolved = true;
                    this.showMessage('✅ 你的中立立场获得国际社会赞誉。');
                }},
                { text: '秘密支持双方，坐收渔利 (+预算, 高风险)', action: () => {
                    this.gameState.resources.budget += 40;
                    this.gameState.nuclearTension += 20;
                    this.gameState.flags.discoveredSecretWeapon = true;
                    this.showMessage('✅ 短期内获得巨额利润，但风险极高。');
                }}
            ],
            () => { this.gameState.currentChapter = 3; this.saveGame(); this.startChapter(); }
        );
    }

    // 第三章：科技竞赛
    chapter3() {
        this.showScene(
            '🚀 第三章：全球科技竞赛',
            `随着传统军事平衡趋于稳定，大国间的竞争转向高科技领域。
             人工智能、量子计算、太空技术和生物工程成为新的战略制高点。
             南太平洋联邦必须选择重点发展方向：`,
            'images/scenes/tech-race.svg',
            [
                { text: '全力投入人工智能军事应用 (+AI优势, 高预算消耗)', action: () => {
                    this.gameState.resources.budget -= 40;
                    this.gameState.resources.techLevel += 25;
                    this.gameState.flags.aiSupremacy = true;
                    this.gameState.nuclearTension += 10;
                    this.showMessage('✅ AI军事系统让你获得战术优势，但引发伦理争议。');
                }},
                { text: '专注量子通信和计算 (+量子优势, 中等预算消耗)', action: () => {
                    this.gameState.resources.budget -= 30;
                    this.gameState.resources.techLevel += 30;
                    this.gameState.flags.quantumBreakthrough = true;
                    this.gameState.relations.China += 10;
                    this.showMessage('✅ 量子技术突破让你在加密通信领域领先。');
                }},
                { text: '发展太空监视和防御系统 (+太空优势, 高预算消耗)', action: () => {
                    this.gameState.resources.budget -= 45;
                    this.gameState.resources.techLevel += 20;
                    this.gameState.relations.USA += 15;
                    this.showMessage('✅ 太空监视系统提供全球视野。');
                }},
                { text: '投资生物科技和基因工程 (+生物优势, 道德风险)', action: () => {
                    this.gameState.resources.budget -= 25;
                    this.gameState.resources.techLevel += 15;
                    this.gameState.nuclearTension += 15;
                    this.showMessage('✅ 生物科技带来医疗突破，但也引发生物武器担忧。');
                }}
            ],
            () => { this.gameState.currentChapter = 4; this.saveGame(); this.checkEnding(); }
        );
    }

    // 显示场景
    showScene(title, text, image, choices, onComplete) {
        const storyDiv = document.getElementById('story-content');
        storyDiv.innerHTML = `
            <div class="chapter-header"><h2>${title}</h2></div>
            <div class="story-text"><p>${text}</p></div>
            ${image ? `<div class="scene-image"><img src="${image}" alt="场景"></div>` : ''}
        `;
        
        const choicesDiv = document.getElementById('choices-container');
        choicesDiv.innerHTML = choices.map((c, i) => 
            `<button class="choice-btn" data-index="${i}">${i + 1}. ${c.text}</button>`
        ).join('');
        
        this.currentChoices = choices;
        this.currentOnComplete = onComplete;
        
        choicesDiv.querySelectorAll('.choice-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.index);
                this.currentChoices[idx].action();
                this.displayStatus();
                this.saveGame();
                setTimeout(() => this.currentOnComplete?.(), 1000);
            };
        });
    }

    // 检查结局
    checkEnding() {
        let ending, description;
        
        if (this.gameState.nuclearTension >= 90) {
            ending = '核冬天';
            description = '全球核战争爆发，人类文明几乎毁灭。你的选择未能阻止末日的到来。';
        } else if (this.gameState.nuclearTension <= 10 && Object.values(this.gameState.relations).every(r => r >= 70)) {
            ending = '第六极崛起';
            description = '通过高超的外交手腕，你成功将南太平洋联邦打造为世界第六极！';
        } else if (this.gameState.flags.aiSupremacy && this.gameState.resources.techLevel >= 80) {
            ending = 'AI统治';
            description = '人工智能系统接管了国家决策，人类进入后稀缺时代。';
        } else if (this.gameState.flags.quantumBreakthrough && this.gameState.relations.China >= 80) {
            ending = '中美合作新时代';
            description = '量子技术合作开启了中美新时代，两国共同维护全球稳定。';
        } else if (this.gameState.resources.budget <= 0) {
            ending = '经济崩溃';
            description = '过度军备竞赛导致经济崩溃，国家陷入混乱。';
        } else {
            ending = '不确定的未来';
            description = '世界依然在核威慑的阴影下前行，你的选择为国家争取了宝贵的喘息时间。';
        }
        
        this.showEnding(ending, description);
    }

    // 显示结局
    showEnding(title, description) {
        const storyDiv = document.getElementById('story-content');
        storyDiv.innerHTML = `
            <div class="ending-container">
                <h1>🎉 ${title}</h1>
                <div class="ending-text"><p>${description}</p></div>
                <div class="ending-stats">
                    <h3>最终状态</h3>
                    <p>核紧张指数: ${this.gameState.nuclearTension}%</p>
                    <p>国家预算: $${this.gameState.resources.budget}B</p>
                    <p>科技水平: ${this.gameState.resources.techLevel}/100</p>
                </div>
            </div>
        `;
        
        document.getElementById('choices-container').innerHTML = `
            <button class="choice-btn" onclick="game.newGame()">🔁 重新开始</button>
        `;
    }

    // 显示消息
    showMessage(text) {
        let msgDiv = document.getElementById('message-display');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.id = 'message-display';
            msgDiv.className = 'message-display';
            document.body.appendChild(msgDiv);
        }
        msgDiv.textContent = text;
        msgDiv.style.display = 'block';
        setTimeout(() => msgDiv.style.display = 'none', 3000);
    }

    // 保存游戏
    saveGame() {
        localStorage.setItem(this.saveKey, JSON.stringify(this.gameState));
    }

    // 加载游戏
    loadGame() {
        const saved = localStorage.getItem(this.saveKey);
        if (saved) {
            this.gameState = JSON.parse(saved);
            return true;
        }
        return false;
    }

    // 新游戏
    newGame() {
        this.gameState = {
            nuclearTension: 30,
            relations: { USA: 50, China: 50, Russia: 50, EU: 50, India: 50 },
            resources: { budget: 100, techLevel: 30 },
            flags: {
                firstContactRussia: false, africaProxyActive: false, discoveredSecretWeapon: false,
                africanConflictResolved: false, techRaceStarted: false,
                quantumBreakthrough: false, aiSupremacy: false
            },
            currentChapter: 1
        };
        localStorage.removeItem(this.saveKey);
        this.displayStatus();
        this.startChapter();
    }
}

// 初始化游戏
const game = new GameEngine();
document.addEventListener('DOMContentLoaded', () => game.init());