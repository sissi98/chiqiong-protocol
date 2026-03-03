/**
 * 军备竞赛系统 - 全球军事力量模拟
 * 追踪大国军备发展、军售、核武器扩散
 */

class ArmsRaceSystem {
    constructor(gameState) {
        this.gs = gameState;
        
        // 军事单位类型
        this.unitTypes = {
            infantry: { name: '步兵师', icon: '🎖️', cost: 5, power: 5, maintenance: 1 },
            armor: { name: '装甲师', icon: '🛡️', cost: 15, power: 15, maintenance: 3 },
            artillery: { name: '炮兵团', icon: '💥', cost: 8, power: 8, maintenance: 2 },
            airforce: { name: '空军联队', icon: '✈️', cost: 25, power: 25, maintenance: 5 },
            navy: { name: '海军舰队', icon: '⚓', cost: 30, power: 20, maintenance: 6 },
            submarine: { name: '潜艇编队', icon: '🚢', cost: 40, power: 30, maintenance: 4, stealth: true },
            missile: { name: '导弹部队', icon: '🚀', cost: 20, power: 35, maintenance: 3 },
            cyber: { name: '网络战部队', icon: '💻', cost: 15, power: 10, maintenance: 2, special: 'cyber' },
            drone: { name: '无人机群', icon: '🛸', cost: 12, power: 12, maintenance: 2, special: 'drone' }
        };
        
        // 大国军事力量
        this.globalForces = {
            USA: {
                units: { infantry: 10, armor: 8, airforce: 15, navy: 12, submarine: 8, missile: 6, cyber: 5, drone: 4 },
                nukes: 5500,
                techLevel: 95,
                defenseBudget: 800,
                doctrine: 'power_projection'  // 力量投射型
            },
            China: {
                units: { infantry: 20, armor: 12, airforce: 10, navy: 8, submarine: 6, missile: 12, cyber: 4, drone: 8 },
                nukes: 500,
                techLevel: 85,
                defenseBudget: 300,
                doctrine: 'area_denial'  // 区域拒止型
            },
            Russia: {
                units: { infantry: 8, armor: 6, airforce: 6, navy: 4, submarine: 10, missile: 8, cyber: 3, drone: 2 },
                nukes: 6000,
                techLevel: 75,
                defenseBudget: 70,
                doctrine: 'strategic_deterrence'  // 战略威慑型
            },
            EU: {
                units: { infantry: 6, armor: 4, airforce: 8, navy: 6, submarine: 4, missile: 2, cyber: 2, drone: 2 },
                nukes: 300,  // 法国
                techLevel: 90,
                defenseBudget: 250,
                doctrine: 'collective_defense'  // 集体防御型
            },
            India: {
                units: { infantry: 12, armor: 4, airforce: 5, navy: 3, submarine: 2, missile: 3, cyber: 1, drone: 1 },
                nukes: 160,
                techLevel: 65,
                defenseBudget: 80,
                doctrine: 'regional_dominance'  // 区域主导型
            }
        };
        
        // 军售市场
        this.armsMarket = {
            activeDeals: [],
            pendingOffers: [],
            embargoes: []
        };
        
        // 军备竞赛指标
        this.raceMetrics = {
            globalTension: 25,
            armsSpending: 0,
            proliferationRisk: 0,
            lastUpdate: 0
        };
        
        // 研发项目
        this.researchProjects = {
            hypersonic: { name: '高超音速武器', progress: 0, cost: 50, turns: 5, unlocked: false },
            stealth: { name: '隐身技术', progress: 0, cost: 40, turns: 4, unlocked: false },
            ai_combat: { name: 'AI作战系统', progress: 0, cost: 60, turns: 6, unlocked: false },
            abm: { name: '反导系统', progress: 0, cost: 45, turns: 5, unlocked: false },
            space_weapon: { name: '太空武器', progress: 0, cost: 80, turns: 8, unlocked: false }
        };
    }
    
    // 每回合更新
    update() {
        // 更新大国军力
        this.updateGlobalForces();
        
        // 计算竞赛指标
        this.calculateRaceMetrics();
        
        // 检查军售到期
        this.updateArmsDeals();
        
        // 研发进度
        this.updateResearch();
        
        // 随机事件
        if (Math.random() < 0.1) {
            this.triggerArmsEvent();
        }
        
        // 军备竞赛效应
        this.applyRaceEffects();
    }
    
    updateGlobalForces() {
        for (const [country, forces] of Object.entries(this.globalForces)) {
            // 根据军事学说调整力量
            const budgetGrowth = forces.defenseBudget * 0.02;
            
            // 科技进步
            if (Math.random() < 0.1) {
                forces.techLevel = Math.min(100, forces.techLevel + 1);
            }
            
            // 大国军备扩张
            if (this.raceMetrics.globalTension > 50) {
                // 紧张时增加军备
                if (Math.random() < 0.3) {
                    const unitTypes = Object.keys(this.unitTypes);
                    const randomUnit = unitTypes[Math.floor(Math.random() * unitTypes.length)];
                    forces.units[randomUnit] = (forces.units[randomUnit] || 0) + 1;
                }
            }
        }
    }
    
    calculateRaceMetrics() {
        // 计算全球军费
        this.raceMetrics.armsSpending = Object.values(this.globalForces)
            .reduce((sum, f) => sum + f.defenseBudget, 0);
        
        // 计算核扩散风险
        let proliferation = 0;
        for (const [country, forces] of Object.entries(this.globalForces)) {
            if (forces.nukes > 0) {
                proliferation += forces.nukes / 1000;
            }
        }
        this.raceMetrics.proliferationRisk = Math.min(100, proliferation * 5);
        
        // 更新全球紧张度
        const avgNukes = this.raceMetrics.armsSpending / 5;
        this.raceMetrics.globalTension = Math.min(100, 
            this.raceMetrics.globalTension + (avgNukes > 400 ? 1 : -0.5)
        );
    }
    
    updateArmsDeals() {
        this.armsMarket.activeDeals = this.armsMarket.activeDeals.filter(deal => {
            deal.duration--;
            if (deal.duration <= 0) {
                // 交易结束
                return false;
            }
            return true;
        });
    }
    
    updateResearch() {
        for (const [key, project] of Object.entries(this.researchProjects)) {
            if (project.inProgress && project.progress < 100) {
                project.progress += 100 / project.turns;
                if (project.progress >= 100) {
                    project.unlocked = true;
                    project.inProgress = false;
                }
            }
        }
    }
    
    applyRaceEffects() {
        // 军备竞赛影响核紧张
        if (this.raceMetrics.globalTension > 70) {
            this.gs.nuclearTension = Math.min(100, this.gs.nuclearTension + 1);
        }
        
        // 核扩散风险
        if (this.raceMetrics.proliferationRisk > 50 && !this.gs.secrets.hasNuclearWeapon) {
            // 可能触发核武器选择事件
            if (Math.random() < 0.05) {
                this.gs.pendingEvents = this.gs.pendingEvents || [];
                this.gs.pendingEvents.push({
                    type: 'nuclear_option',
                    text: '情报显示，周边国家正在秘密发展核武器。是否启动本国的核计划？'
                });
            }
        }
    }
    
    triggerArmsEvent() {
        const events = [
            {
                id: 'military_parade',
                title: '大国阅兵展示武力',
                weight: 15,
                effect: () => {
                    const country = ['USA', 'China', 'Russia'][Math.floor(Math.random() * 3)];
                    this.raceMetrics.globalTension += 5;
                    this.gs.relations[country].threat += 5;
                    return `${this.countryName(country)}举行大规模阅兵，展示新型武器。全球军备竞赛加剧。`;
                }
            },
            {
                id: 'arms_deal',
                title: '国际军售大单',
                weight: 20,
                effect: () => {
                    const seller = ['USA', 'Russia', 'China'][Math.floor(Math.random() * 3)];
                    this.globalForces[seller].defenseBudget += 20;
                    return `${this.countryName(seller)}签署重大军售协议，军火收入增加 $20B。`;
                }
            },
            {
                id: 'defense_budget_hike',
                title: '国防预算激增',
                weight: 10,
                effect: () => {
                    const country = Object.keys(this.globalForces)[Math.floor(Math.random() * 5)];
                    this.globalForces[country].defenseBudget += 30;
                    this.raceMetrics.globalTension += 3;
                    return `${this.countryName(country)}宣布国防预算增加 10%，引发地区军备竞赛。`;
                }
            },
            {
                id: 'weapon_test',
                title: '新型武器试验',
                weight: 12,
                effect: () => {
                    const country = ['USA', 'China', 'Russia', 'India'][Math.floor(Math.random() * 4)];
                    this.globalForces[country].techLevel = Math.min(100, this.globalForces[country].techLevel + 2);
                    this.gs.nuclearTension += 3;
                    return `${this.countryName(country)}成功试验新型武器系统，技术突破引发关注。`;
                }
            },
            {
                id: 'treaty_violation',
                title: '军控条约违规',
                weight: 5,
                effect: () => {
                    this.gs.nuclearTension += 8;
                    return '情报证实某大国违反军控条约，秘密发展被禁武器。';
                }
            },
            {
                id: 'joint_exercise',
                title: '联合军事演习',
                weight: 15,
                effect: () => {
                    const countries = ['USA-Japan', 'China-Russia', 'NATO'][Math.floor(Math.random() * 3)];
                    this.raceMetrics.globalTension += 2;
                    return `${countries}举行大规模联合军演，展示军事同盟实力。`;
                }
            }
        ];
        
        const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const event of events) {
            random -= event.weight;
            if (random <= 0) {
                return {
                    title: `⚔️ ${event.title}`,
                    text: event.effect()
                };
            }
        }
        
        return null;
    }
    
    // 玩家行动：购买军事单位
    purchaseUnit(unitType, quantity = 1) {
        const unit = this.unitTypes[unitType];
        if (!unit) return { success: false, message: '未知单位类型' };
        
        const totalCost = unit.cost * quantity;
        
        if (this.gs.resources.budget < totalCost) {
            return { success: false, message: `预算不足，需要 $${totalCost}B` };
        }
        
        this.gs.resources.budget -= totalCost;
        this.gs.resources.militaryPower += unit.power * quantity;
        
        // 记录拥有的单位
        this.gs.militaryUnits = this.gs.militaryUnits || {};
        this.gs.militaryUnits[unitType] = (this.gs.militaryUnits[unitType] || 0) + quantity;
        
        // 增加核紧张
        this.gs.nuclearTension += 2;
        
        return { 
            success: true, 
            message: `成功组建 ${quantity} 个${unit.name}，军力 +${unit.power * quantity}` 
        };
    }
    
    // 玩家行动：启动研发项目
    startResearch(projectKey) {
        const project = this.researchProjects[projectKey];
        if (!project) return { success: false, message: '未知项目' };
        if (project.unlocked) return { success: false, message: '技术已解锁' };
        if (project.inProgress) return { success: false, message: '项目进行中' };
        
        if (this.gs.resources.budget < project.cost) {
            return { success: false, message: `预算不足，需要 $${project.cost}B` };
        }
        
        if (this.gs.resources.techLevel < 40) {
            return { success: false, message: '科技水平不足' };
        }
        
        this.gs.resources.budget -= project.cost;
        project.inProgress = true;
        project.progress = 0;
        
        return { 
            success: true, 
            message: `${project.name}研发启动，预计 ${project.turns} 回合完成` 
        };
    }
    
    // 玩家行动：购买武器
    buyWeaponsFrom(seller, package_type) {
        const packages = {
            light: { cost: 20, power: 10, units: ['infantry', 'artillery'] },
            medium: { cost: 50, power: 30, units: ['armor', 'airforce'] },
            heavy: { cost: 100, power: 60, units: ['missile', 'submarine'] },
            advanced: { cost: 200, power: 100, units: ['stealth', 'cyber'], requiresTrust: 70 }
        };
        
        const pkg = packages[package_type];
        if (!pkg) return { success: false, message: '未知武器包' };
        
        // 检查关系
        if (pkg.requiresTrust && this.gs.relations[seller].trust < pkg.requiresTrust) {
            return { success: false, message: `${this.countryName(seller)}不愿出售先进武器` };
        }
        
        // 检查禁运
        if (this.armsMarket.embargoes.includes(seller)) {
            return { success: false, message: `${this.countryName(seller)}受到武器禁运` };
        }
        
        if (this.gs.resources.budget < pkg.cost) {
            return { success: false, message: `预算不足` };
        }
        
        this.gs.resources.budget -= pkg.cost;
        this.gs.resources.militaryPower += pkg.power;
        this.gs.relations[seller].favor += 10;
        this.gs.relations[seller].trade += 15;
        
        // 卖方获得收入
        this.globalForces[seller].defenseBudget += pkg.cost * 0.3;
        
        return { 
            success: true, 
            message: `从${this.countryName(seller)}购买了价值 $${pkg.cost}B 的武器装备` 
        };
    }
    
    // 获取军事报告
    getMilitaryReport() {
        let report = '⚔️ 军事力量报告\n\n';
        
        // 自身军力
        report += `本国军力: ${this.gs.resources.militaryPower}/100\n`;
        
        if (this.gs.militaryUnits) {
            report += '已部署单位:\n';
            for (const [type, count] of Object.entries(this.gs.militaryUnits)) {
                const unit = this.unitTypes[type];
                if (unit && count > 0) {
                    report += `  ${unit.icon} ${unit.name}: ${count}\n`;
                }
            }
        }
        
        report += '\n大国军力对比:\n';
        for (const [country, forces] of Object.entries(this.globalForces)) {
            const totalPower = this.calculateTotalPower(forces);
            report += `  ${this.countryName(country)}: ${totalPower} (核弹头: ${forces.nukes})\n`;
        }
        
        // 研发状态
        const activeResearch = Object.values(this.researchProjects).filter(p => p.inProgress);
        if (activeResearch.length > 0) {
            report += '\n进行中研发:\n';
            for (const project of activeResearch) {
                report += `  🔬 ${project.name}: ${Math.round(project.progress)}%\n`;
            }
        }
        
        return report;
    }
    
    calculateTotalPower(forces) {
        let power = 0;
        for (const [type, count] of Object.entries(forces.units)) {
            const unit = this.unitTypes[type];
            if (unit) {
                power += unit.power * count;
            }
        }
        power += forces.nukes / 100;  // 核武器加成
        power *= (forces.techLevel / 100);  // 科技加成
        return Math.round(power);
    }
    
    countryName(code) {
        const names = { USA: '美国', China: '中国', Russia: '俄罗斯', EU: '欧盟', India: '印度' };
        return names[code] || code;
    }
    
    // 序列化
    serialize() {
        return {
            globalForces: this.globalForces,
            armsMarket: this.armsMarket,
            raceMetrics: this.raceMetrics,
            researchProjects: this.researchProjects
        };
    }
    
    deserialize(data) {
        if (data.globalForces) this.globalForces = data.globalForces;
        if (data.armsMarket) this.armsMarket = data.armsMarket;
        if (data.raceMetrics) this.raceMetrics = data.raceMetrics;
        if (data.researchProjects) this.researchProjects = data.researchProjects;
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.ArmsRaceSystem = ArmsRaceSystem;
}