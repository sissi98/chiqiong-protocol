/**
 * 供应链系统 - 全球资源供应链模拟
 * 模拟关键战略资源的生产、运输、制裁和断供
 */

class SupplyChainSystem {
    constructor(gameState) {
        this.gs = gameState;
        
        // 全球资源定义
        this.resources = {
            oil: {
                name: '石油',
                icon: '🛢️',
                basePrice: 80,
                volatility: 0.3,
                critical: true,
                producers: ['Russia', 'USA', 'China'],
                consumers: ['EU', 'India'],
                stockpile: 100,
                consumption: 5
            },
            rare_earth: {
                name: '稀土',
                icon: '💎',
                basePrice: 150,
                volatility: 0.4,
                critical: true,
                producers: ['China'],
                consumers: ['USA', 'EU', 'Japan'],
                stockpile: 50,
                consumption: 3
            },
            cobalt: {
                name: '钴矿',
                icon: '🔋',
                basePrice: 40,
                volatility: 0.35,
                critical: true,
                producers: ['Africa_Region'],
                consumers: ['China', 'USA', 'EU'],
                stockpile: 30,
                consumption: 2
            },
            chips: {
                name: '芯片',
                icon: '💻',
                basePrice: 200,
                volatility: 0.25,
                critical: true,
                producers: ['Taiwan_Region', 'USA', 'SouthKorea'],
                consumers: ['China', 'EU', 'India'],
                stockpile: 20,
                consumption: 1
            },
            grain: {
                name: '粮食',
                icon: '🌾',
                basePrice: 30,
                volatility: 0.2,
                critical: false,
                producers: ['USA', 'Russia', 'EU'],
                consumers: ['China', 'India', 'Africa_Region'],
                stockpile: 200,
                consumption: 8
            },
            uranium: {
                name: '铀矿',
                icon: '☢️',
                basePrice: 100,
                volatility: 0.5,
                critical: true,
                producers: ['Russia', 'Africa_Region'],
                consumers: ['USA', 'China', 'EU', 'India'],
                stockpile: 10,
                consumption: 0.5
            }
        };
        
        // 供应链状态
        this.supplyState = {
            routes: {},          // 运输线路状态
            sanctions: [],       // 制裁列表
            embargoes: [],       // 禁运列表
            disruptions: [],     // 供应链中断
            tradeDeals: []       // 贸易协定
        };
        
        // 市场状态
        this.market = {
            prices: {},
            trends: {},
            speculation: 0
        };
        
        // 初始化市场价格
        this.initializeMarket();
    }
    
    initializeMarket() {
        for (const [key, resource] of Object.entries(this.resources)) {
            this.market.prices[key] = resource.basePrice;
            this.market.trends[key] = 0;
        }
    }
    
    // 每回合更新供应链
    update() {
        // 消耗库存
        for (const [key, resource] of Object.entries(this.resources)) {
            resource.stockpile = Math.max(0, resource.stockpile - resource.consumption);
        }
        
        // 市场价格波动
        this.updateMarketPrices();
        
        // 检查供应链中断
        this.checkDisruptions();
        
        // 应用制裁效果
        this.applySanctions();
        
        // 触发随机事件
        if (Math.random() < 0.15) {
            this.triggerSupplyEvent();
        }
        
        // 更新国内效果
        this.applyDomesticEffects();
    }
    
    updateMarketPrices() {
        for (const [key, resource] of Object.entries(this.resources)) {
            // 基础波动
            let change = (Math.random() - 0.5) * resource.volatility * resource.basePrice;
            
            // 库存影响
            if (resource.stockpile < 20) {
                change += resource.basePrice * 0.2; // 短缺涨价
            }
            
            // 趋势影响
            change += this.market.trends[key] * 5;
            
            // 更新价格
            this.market.prices[key] = Math.max(
                resource.basePrice * 0.5,
                Math.min(resource.basePrice * 3, this.market.prices[key] + change)
            );
            
            // 更新趋势
            this.market.trends[key] = Math.max(-1, Math.min(1, 
                this.market.trends[key] + (Math.random() - 0.5) * 0.3
            ));
        }
    }
    
    checkDisruptions() {
        // 检查是否有资源断供
        for (const [key, resource] of Object.entries(this.resources)) {
            if (resource.stockpile <= 0 && resource.critical) {
                this.gs.nuclearTension += 5;
                this.gs.resources.stability -= 10;
                
                // 触发危机事件
                this.gs.pendingEvents = this.gs.pendingEvents || [];
                this.gs.pendingEvents.push({
                    type: 'supply_crisis',
                    resource: key,
                    severity: 'critical'
                });
            }
        }
    }
    
    applySanctions() {
        for (const sanction of this.supplyState.sanctions) {
            if (sanction.active) {
                sanction.duration--;
                if (sanction.duration <= 0) {
                    sanction.active = false;
                }
            }
        }
    }
    
    applyDomesticEffects() {
        // 石油影响军事和预算
        if (this.resources.oil.stockpile < 30) {
            this.gs.resources.militaryPower = Math.max(0, this.gs.resources.militaryPower - 2);
        }
        
        // 稀土影响科技
        if (this.resources.rare_earth.stockpile < 15) {
            this.gs.resources.techLevel = Math.max(0, this.gs.resources.techLevel - 1);
        }
        
        // 粮食影响稳定
        if (this.resources.grain.stockpile < 50) {
            this.gs.resources.stability = Math.max(0, this.gs.resources.stability - 5);
        }
        
        // 铀影响核计划
        if (this.resources.uranium.stockpile < 5 && this.gs.secrets.hasNuclearWeapon) {
            this.gs.secrets.nuclearProgress = Math.max(0, (this.gs.secrets.nuclearProgress || 100) - 5);
        }
    }
    
    triggerSupplyEvent() {
        const events = [
            {
                id: 'pirate_attack',
                title: '海盗袭击商船',
                weight: 10,
                effect: () => {
                    this.resources.oil.stockpile -= 10;
                    return '马六甲海峡发生海盗袭击，石油运输受阻。(-10石油库存)';
                }
            },
            {
                id: 'trade_dispute',
                title: '贸易争端升级',
                weight: 15,
                effect: () => {
                    this.market.trends.chips += 0.5;
                    return '大国芯片贸易争端升级，全球供应链紧张。';
                }
            },
            {
                id: 'new_deposit',
                title: '发现新矿藏',
                weight: 5,
                effect: () => {
                    this.resources.rare_earth.stockpile += 20;
                    this.market.prices.rare_earth *= 0.9;
                    return '地质勘探在本国发现新的稀土矿藏！(+$20稀土)';
                }
            },
            {
                id: 'port_strike',
                title: '港口工人罢工',
                weight: 12,
                effect: () => {
                    this.resources.grain.stockpile -= 15;
                    this.resources.chips.stockpile -= 5;
                    return '主要港口工人罢工，进出口受阻。(-15粮食, -5芯片)';
                }
            },
            {
                id: 'tech_breakthrough',
                title: '替代技术突破',
                weight: 3,
                condition: () => this.gs.resources.techLevel > 60,
                effect: () => {
                    this.resources.rare_earth.consumption = Math.max(1, this.resources.rare_earth.consumption - 1);
                    return '科技突破减少了对稀土的依赖！';
                }
            },
            {
                id: 'pipeline_sabotage',
                title: '管道被破坏',
                weight: 8,
                effect: () => {
                    this.resources.oil.stockpile -= 20;
                    this.gs.nuclearTension += 5;
                    return '关键石油管道遭破坏，怀疑是某国特工所为。(-20石油, +5核紧张)';
                }
            }
        ];
        
        const available = events.filter(e => !e.condition || e.condition());
        const totalWeight = available.reduce((sum, e) => sum + e.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const event of available) {
            random -= event.weight;
            if (random <= 0) {
                return {
                    title: `📦 ${event.title}`,
                    text: event.effect()
                };
            }
        }
        
        return null;
    }
    
    // 玩家行动：采购资源
    purchaseResource(resourceKey, amount) {
        const resource = this.resources[resourceKey];
        if (!resource) return { success: false, message: '未知资源类型' };
        
        const cost = Math.ceil(amount * this.market.prices[resourceKey] / 10);
        
        if (this.gs.resources.budget < cost) {
            return { success: false, message: `预算不足，需要 $${cost}B` };
        }
        
        this.gs.resources.budget -= cost;
        resource.stockpile += amount;
        
        return { 
            success: true, 
            message: `成功采购 ${amount} 单位${resource.name}，花费 $${cost}B` 
        };
    }
    
    // 玩家行动：建立贸易协定
    establishTradeDeal(partner, resourceKey, terms) {
        const deal = {
            id: `deal_${Date.now()}`,
            partner: partner,
            resource: resourceKey,
            amount: terms.amount,
            price: terms.price,
            duration: terms.duration || 10,
            established: this.gs.turn
        };
        
        this.supplyState.tradeDeals.push(deal);
        
        // 影响关系
        this.gs.relations[partner].trade += 10;
        this.gs.relations[partner].trust += 5;
        
        return deal;
    }
    
    // 玩家行动：实施制裁
    imposeSanction(target, resourceKey) {
        const sanction = {
            id: `sanction_${Date.now()}`,
            target: target,
            resource: resourceKey,
            active: true,
            duration: 5,
            imposed: this.gs.turn
        };
        
        this.supplyState.sanctions.push(sanction);
        
        // 影响关系
        this.gs.relations[target].favor -= 15;
        this.gs.relations[target].trust -= 10;
        this.gs.nuclearTension += 5;
        
        return sanction;
    }
    
    // 获取供应链状态报告
    getStatusReport() {
        let report = '📦 供应链状态报告\n\n';
        
        for (const [key, resource] of Object.entries(this.resources)) {
            const price = Math.round(this.market.prices[key]);
            const trend = this.market.trends[key] > 0 ? '📈' : this.market.trends[key] < 0 ? '📉' : '➡️';
            const stockStatus = resource.stockpile < 20 ? '⚠️' : resource.stockpile < 50 ? '⚡' : '✅';
            
            report += `${resource.icon} ${resource.name}: 库存 ${resource.stockpile} ${stockStatus} | 价格 $${price} ${trend}\n`;
        }
        
        return report;
    }
    
    // 序列化保存
    serialize() {
        return {
            resources: this.resources,
            supplyState: this.supplyState,
            market: this.market
        };
    }
    
    // 反序列化加载
    deserialize(data) {
        if (data.resources) this.resources = data.resources;
        if (data.supplyState) this.supplyState = data.supplyState;
        if (data.market) this.market = data.market;
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.SupplyChainSystem = SupplyChainSystem;
}