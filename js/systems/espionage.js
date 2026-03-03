/**
 * 间谍系统 - 情报收集与秘密行动
 * 间谍任务、反间谍、秘密行动、情报分析
 */

class EspionageSystem {
    constructor(gameState) {
        this.gs = gameState;
        
        // 间谍等级定义
        this.spyLevels = {
            recruit: { name: '新手', success: 0.4, detect: 0.3, cost: 10 },
            operative: { name: '特工', success: 0.6, detect: 0.2, cost: 25 },
            master: { name: '大师', success: 0.8, detect: 0.1, cost: 50 }
        };
        
        // 任务类型定义
        this.missionTypes = {
            intel_gather: {
                name: '情报收集',
                icon: '📋',
                duration: 2,
                risk: 0.15,
                effect: (target, spy) => {
                    const intel = this.generateIntel(target);
                    return {
                        success: true,
                        message: `成功获取${this.countryName(target)}的情报: ${intel.type}`,
                        intel: intel
                    };
                }
            },
            sabotage: {
                name: '破坏行动',
                icon: '💥',
                duration: 3,
                risk: 0.35,
                effect: (target, spy) => {
                    // 随机破坏目标
                    const targets = ['militaryPower', 'techLevel', 'budget'];
                    const hit = targets[Math.floor(Math.random() * targets.length)];
                    const damage = Math.floor(Math.random() * 10) + 5;
                    
                    return {
                        success: true,
                        message: `成功破坏${this.countryName(target)}的${hit === 'militaryPower' ? '军事设施' : hit === 'techLevel' ? '研究设施' : '经济设施'}，造成约 ${damage}% 损失`,
                        damage: { target: hit, amount: damage }
                    };
                }
            },
            assassination: {
                name: '暗杀任务',
                icon: '🎯',
                duration: 4,
                risk: 0.5,
                effect: (target, spy) => {
                    const success = Math.random() < 0.6;
                    if (success) {
                        return {
                            success: true,
                            message: `${this.countryName(target)}的高级官员被暗杀，该国陷入政治动荡`,
                            political: true
                        };
                    } else {
                        return {
                            success: false,
                            message: `暗杀失败，目标逃脱`,
                            exposed: true
                        };
                    }
                }
            },
            steal_tech: {
                name: '窃取技术',
                icon: '🔬',
                duration: 3,
                risk: 0.3,
                condition: (gs) => gs.resources.techLevel < 80,
                effect: (target, spy) => {
                    const techGain = Math.floor(Math.random() * 15) + 5;
                    return {
                        success: true,
                        message: `成功窃取${this.countryName(target)}的技术资料，科技 +${techGain}`,
                        techGain: techGain
                    };
                }
            },
            plant_mole: {
                name: '安插卧底',
                icon: '🎭',
                duration: 5,
                risk: 0.25,
                effect: (target, spy) => {
                    return {
                        success: true,
                        message: `成功在${this.countryName(target)}安插长期卧底`,
                        mole: { target: target, expires: this.gs.turn + 20 }
                    };
                }
            },
            propaganda: {
                name: '秘密宣传',
                icon: '📣',
                duration: 2,
                risk: 0.1,
                effect: (target, spy) => {
                    return {
                        success: true,
                        message: `在${this.countryName(target)}成功散布宣传，该国民意转向`,
                        favorChange: -10
                    };
                }
            },
            cyber_attack: {
                name: '网络攻击',
                icon: '💻',
                duration: 1,
                risk: 0.2,
                condition: (gs) => gs.resources.techLevel >= 40,
                effect: (target, spy) => {
                    const damage = Math.floor(Math.random() * 20) + 10;
                    return {
                        success: true,
                        message: `网络攻击成功，${this.countryName(target)}基础设施受损`,
                        cyberDamage: damage
                    };
                }
            },
            extraction: {
                name: '撤离线人',
                icon: '🚁',
                duration: 2,
                risk: 0.4,
                effect: (target, spy) => {
                    return {
                        success: true,
                        message: `成功从${this.countryName(target)}撤离关键线人`,
                        extractedIntel: true
                    };
                }
            }
        };
        
        // 间谍列表
        this.spies = [];
        
        // 活跃任务
        this.activeMissions = [];
        
        // 已获取情报
        this.intelDatabase = {
            USA: [],
            China: [],
            Russia: [],
            EU: [],
            India: []
        };
        
        // 卧底网络
        this.moles = [];
        
        // 反间谍状态
        this.counterIntel = {
            level: 1,
            budget: 0,
            detectedSpies: [],
            recentIncidents: []
        };
    }
    
    // 每回合更新
    update() {
        // 更新活跃任务
        this.updateMissions();
        
        // 卧底情报收集
        this.updateMoles();
        
        // 反间谍
        this.updateCounterIntel();
        
        // 随机事件
        if (Math.random() < 0.08) {
            this.triggerSpyEvent();
        }
    }
    
    updateMissions() {
        const completed = [];
        
        for (let i = this.activeMissions.length - 1; i >= 0; i--) {
            const mission = this.activeMissions[i];
            mission.turnsLeft--;
            
            if (mission.turnsLeft <= 0) {
                // 任务完成/失败判定
                this.resolveMission(mission);
                completed.push(i);
            }
        }
        
        // 移除已完成任务
        for (const idx of completed.reverse()) {
            this.activeMissions.splice(idx, 1);
        }
    }
    
    resolveMission(mission) {
        const spy = this.spies.find(s => s.id === mission.spyId);
        const missionType = this.missionTypes[mission.type];
        const spyLevel = this.spyLevels[spy?.level || 'recruit'];
        
        // 成功率计算
        const baseSuccess = spyLevel?.success || 0.4;
        const risk = missionType.risk;
        const success = Math.random() < (baseSuccess - risk / 2);
        
        // 被发现概率
        const detected = Math.random() < (spyLevel?.detect || 0.3) + risk / 3;
        
        if (success) {
            // 成功
            const result = missionType.effect(mission.target, spy);
            this.applyMissionResult(result, mission.target);
            
            mission.completed = true;
            mission.result = result.message;
            
            // 记录事件
            this.gs.pendingEvents = this.gs.pendingEvents || [];
            this.gs.pendingEvents.push({
                type: 'mission_success',
                title: `✅ 间谍任务成功`,
                text: result.message
            });
        } else {
            // 失败
            mission.completed = false;
            mission.result = '任务失败';
            
            if (detected) {
                // 被发现！
                this.gs.relations[mission.target].trust -= 20;
                this.gs.relations[mission.target].favor -= 15;
                this.gs.nuclearTension += 5;
                
                // 间谍可能被捕
                if (Math.random() < 0.5) {
                    spy.status = 'captured';
                    this.gs.pendingEvents = this.gs.pendingEvents || [];
                    this.gs.pendingEvents.push({
                        type: 'spy_captured',
                        title: `⚠️ 间谍被捕！`,
                        text: `在${this.countryName(mission.target)}执行任务的间谍被捕，外交关系急剧恶化`
                    });
                } else {
                    this.gs.pendingEvents = this.gs.pendingEvents || [];
                    this.gs.pendingEvents.push({
                        type: 'mission_failed',
                        title: `❌ 间谍任务失败`,
                        text: `在${this.countryName(mission.target)}的任务失败，但间谍成功逃脱`
                    });
                }
            }
        }
        
        // 间谍经验增长
        if (spy && spy.status !== 'captured') {
            spy.experience = (spy.experience || 0) + 1;
            if (spy.experience >= 5 && spy.level === 'recruit') {
                spy.level = 'operative';
            } else if (spy.experience >= 15 && spy.level === 'operative') {
                spy.level = 'master';
            }
        }
    }
    
    applyMissionResult(result, target) {
        if (!result.success) return;
        
        // 应用效果
        if (result.intel) {
            this.intelDatabase[target].push({
                ...result.intel,
                collected: this.gs.turn
            });
        }
        
        if (result.damage) {
            // 对目标国家造成伤害（通过关系和紧张度模拟）
            this.gs.relations[target].threat += result.damage.amount;
        }
        
        if (result.techGain) {
            this.gs.resources.techLevel = Math.min(100, this.gs.resources.techLevel + result.techGain);
        }
        
        if (result.mole) {
            this.moles.push(result.mole);
        }
        
        if (result.favorChange) {
            this.gs.relations[target].favor += result.favorChange;
        }
    }
    
    updateMoles() {
        for (let i = this.moles.length - 1; i >= 0; i--) {
            const mole = this.moles[i];
            
            // 卧底可能被发现
            if (Math.random() < 0.02) {
                this.moles.splice(i, 1);
                this.gs.relations[mole.target].trust -= 10;
                continue;
            }
            
            // 定期收集情报
            if (this.gs.turn % 3 === 0) {
                const intel = this.generateIntel(mole.target);
                this.intelDatabase[mole.target].push({
                    ...intel,
                    source: 'mole',
                    collected: this.gs.turn
                });
            }
            
            // 检查过期
            if (mole.expires && this.gs.turn >= mole.expires) {
                this.moles.splice(i, 1);
            }
        }
    }
    
    updateCounterIntel() {
        // 清理旧事件
        this.counterIntel.recentIncidents = this.counterIntel.recentIncidents.filter(
            i => this.gs.turn - i.turn < 10
        );
        
        // 反间谍效率影响国内稳定
        if (this.counterIntel.recentIncidents.length > 3) {
            this.gs.resources.stability = Math.max(0, this.gs.resources.stability - 2);
        }
    }
    
    triggerSpyEvent() {
        const events = [
            {
                id: 'foreign_spy_caught',
                title: '抓获外国间谍',
                weight: 20,
                effect: () => {
                    const country = ['USA', 'China', 'Russia'][Math.floor(Math.random() * 3)];
                    this.counterIntel.detectedSpies.push({ country, turn: this.gs.turn });
                    this.gs.relations[country].trust -= 10;
                    return `抓获一名${this.countryName(country)}间谍，可以用于外交筹码或交换`;
                }
            },
            {
                id: 'intel_leak',
                title: '情报泄露',
                weight: 15,
                effect: () => {
                    this.gs.resources.stability -= 5;
                    return '机密情报被泄露给媒体，政府面临信任危机';
                }
            },
            {
                id: 'defector',
                title: '外国叛逃者',
                weight: 10,
                effect: () => {
                    const country = ['USA', 'China', 'Russia'][Math.floor(Math.random() * 3)];
                    this.gs.resources.intelligence += 10;
                    this.gs.relations[country].favor -= 5;
                    return `一名${this.countryName(country)}高级官员叛逃，带来宝贵情报 (+10情报能力)`;
                }
            },
            {
                id: 'cipher_broken',
                title: '密码被破译',
                weight: 8,
                effect: () => {
                    this.gs.resources.intelligence += 15;
                    return '成功破译某大国外交密码，可以监听其通信 (+15情报能力)';
                }
            },
            {
                id: 'double_agent',
                title: '双面间谍',
                weight: 5,
                effect: () => {
                    this.gs.resources.intelligence -= 10;
                    return '发现一名己方间谍是双面间谍，多年情报可能已泄露';
                }
            }
        ];
        
        const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const event of events) {
            random -= event.weight;
            if (random <= 0) {
                return {
                    title: `🕵️ ${event.title}`,
                    text: event.effect()
                };
            }
        }
        
        return null;
    }
    
    // 玩家行动：招募间谍
    recruitSpy() {
        const cost = this.spyLevels.recruit.cost;
        
        if (this.gs.resources.budget < cost) {
            return { success: false, message: `预算不足，需要 $${cost}B` };
        }
        
        this.gs.resources.budget -= cost;
        
        const spy = {
            id: `spy_${Date.now()}`,
            name: this.generateSpyName(),
            level: 'recruit',
            experience: 0,
            status: 'available',
            recruited: this.gs.turn
        };
        
        this.spies.push(spy);
        
        return { 
            success: true, 
            message: `成功招募新间谍「${spy.name}」` 
        };
    }
    
    // 玩家行动：派遣任务
    sendMission(spyId, target, missionType) {
        const spy = this.spies.find(s => s.id === spyId);
        const mission = this.missionTypes[missionType];
        
        if (!spy) return { success: false, message: '间谍不存在' };
        if (!mission) return { success: false, message: '未知任务类型' };
        if (spy.status !== 'available') return { success: false, message: '间谍不可用' };
        if (mission.condition && !mission.condition(this.gs)) {
            return { success: false, message: '不满足任务条件' };
        }
        
        spy.status = 'on_mission';
        
        const newMission = {
            id: `mission_${Date.now()}`,
            spyId: spyId,
            target: target,
            type: missionType,
            turnsLeft: mission.duration,
            started: this.gs.turn
        };
        
        this.activeMissions.push(newMission);
        
        return { 
            success: true, 
            message: `间谍「${spy.name}」已出发执行「${mission.name}」任务` 
        };
    }
    
    // 玩家行动：加强反间谍
    enhanceCounterIntel(level) {
        const costs = { 1: 0, 2: 30, 3: 60 };
        const cost = costs[level] || 30;
        
        if (this.gs.resources.budget < cost) {
            return { success: false, message: '预算不足' };
        }
        
        this.gs.resources.budget -= cost;
        this.counterIntel.level = level;
        this.counterIntel.budget += cost;
        
        return { 
            success: true, 
            message: `反间谍能力提升至 ${level} 级` 
        };
    }
    
    // 生成间谍代号
    generateSpyName() {
        const prefixes = ['影子', '幽灵', '猎鹰', '暗夜', '银狐', '黑豹', '毒蛇', '风暴'];
        const suffixes = ['', '者', '一号', '特工', '行者'];
        return prefixes[Math.floor(Math.random() * prefixes.length)] + 
               suffixes[Math.floor(Math.random() * suffixes.length)];
    }
    
    // 生成情报
    generateIntel(target) {
        const types = [
            { type: 'military', description: '军事部署情报', value: 15 },
            { type: 'economic', description: '经济数据情报', value: 10 },
            { type: 'political', description: '政治动态情报', value: 12 },
            { type: 'tech', description: '科技发展情报', value: 20 },
            { type: 'nuclear', description: '核计划情报', value: 30, rare: true }
        ];
        
        let intel = types[Math.floor(Math.random() * types.length)];
        if (intel.rare && Math.random() < 0.7) {
            intel = types[Math.floor(Math.random() * 4)];  // 稀有情报概率低
        }
        
        return intel;
    }
    
    // 获取情报报告
    getIntelligenceReport() {
        let report = '🕵️ 情报系统报告\n\n';
        
        // 间谍状态
        report += `可用间谍: ${this.spies.filter(s => s.status === 'available').length}/${this.spies.length}\n`;
        
        for (const spy of this.spies) {
            const levelName = this.spyLevels[spy.level]?.name || spy.level;
            report += `  • ${spy.name} (${levelName}) - ${spy.status === 'available' ? '待命' : '执行任务'}\n`;
        }
        
        // 活跃任务
        if (this.activeMissions.length > 0) {
            report += '\n进行中任务:\n';
            for (const mission of this.activeMissions) {
                const type = this.missionTypes[mission.type];
                report += `  ${type.icon} ${type.name} -> ${this.countryName(mission.target)} (${mission.turnsLeft}回合)\n`;
            }
        }
        
        // 卧底
        if (this.moles.length > 0) {
            report += `\n卧底网络: ${this.moles.length} 个活跃卧底\n`;
        }
        
        // 情报数据库
        report += '\n已获取情报:\n';
        for (const [country, intelList] of Object.entries(this.intelDatabase)) {
            if (intelList.length > 0) {
                report += `  ${this.countryName(country)}: ${intelList.length} 份情报\n`;
            }
        }
        
        return report;
    }
    
    countryName(code) {
        const names = { USA: '美国', China: '中国', Russia: '俄罗斯', EU: '欧盟', India: '印度' };
        return names[code] || code;
    }
    
    // 序列化
    serialize() {
        return {
            spies: this.spies,
            activeMissions: this.activeMissions,
            intelDatabase: this.intelDatabase,
            moles: this.moles,
            counterIntel: this.counterIntel
        };
    }
    
    deserialize(data) {
        if (data.spies) this.spies = data.spies;
        if (data.activeMissions) this.activeMissions = data.activeMissions;
        if (data.intelDatabase) this.intelDatabase = data.intelDatabase;
        if (data.moles) this.moles = data.moles;
        if (data.counterIntel) this.counterIntel = data.counterIntel;
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.EspionageSystem = EspionageSystem;
}