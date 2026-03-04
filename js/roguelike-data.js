/**
 * 《赤穹协议》Roguelike 与动态剧情数据模块
 * 随机地图、事件链、Perk 系统、剧情模板
 */

const RoguelikeData = (function() {
    const COUNTRY_NAMES = { USA: '美国', China: '中国', Russia: '俄罗斯', EU: '欧盟', India: '印度' };

    // ---------- 资源供应链：商品类型与大国控制 ----------
    const COMMODITIES = {
        oil:        { name: '石油', key: 'oil', basePrice: 20, volatility: 0.3 },
        rare_earth: { name: '稀土', key: 'rare_earth', basePrice: 40, volatility: 0.5 },
        cobalt:     { name: '钴矿', key: 'cobalt', basePrice: 35, volatility: 0.4 },
        grain:      { name: '粮食', key: 'grain', basePrice: 10, volatility: 0.2 },
        chips:      { name: '芯片', key: 'chips', basePrice: 50, volatility: 0.6 }
    };

    const SUPPLY_SOURCES = {
        oil:        ['USA', 'Russia'],
        rare_earth: ['China'],
        cobalt:     ['China', 'USA'],
        grain:      ['USA', 'EU', 'India'],
        chips:      ['USA', 'China', 'EU']
    };

    // ---------- 军备竞赛：各国军备等级与增长 ----------
    const ARMS_RACE_BASE = {
        USA:    { level: 0, growth: 1.2 },
        China:  { level: 0, growth: 1.3 },
        Russia: { level: 0, growth: 1.0 },
        EU:     { level: 0, growth: 0.8 },
        India:  { level: 0, growth: 1.1 }
    };

    // ---------- Perk 池（每局随机出现部分）----------
    const PERK_POOL = [
        { id: 'budget_master', name: '💰 预算大师', desc: '每回合预算消耗-2', effect: 'budgetCost', value: 2 },
        { id: 'diplomat', name: '🕊️ 外交家', desc: '所有关系自然恢复+1', effect: 'relationRecovery', value: 1 },
        { id: 'spy_extra', name: '🕵️ 额外间谍', desc: '初始+1间谍，间谍任务成功率+10%', effect: 'spyBonus', value: 1 },
        { id: 'tech_discount', name: '🔬 科技折扣', desc: '科技相关选项预算消耗-15%', effect: 'techCost', value: 0.15 },
        { id: 'intel_boost', name: '📡 情报增强', desc: '情报能力+15', effect: 'intelBoost', value: 15 },
        { id: 'stability_anchor', name: '🏛️ 稳定锚', desc: '稳定度自然下降减半', effect: 'stabilityAnchor', value: 0.5 },
        { id: 'arms_observer', name: '🔭 军备观察', desc: '可查看各国军备等级', effect: 'seeArmsLevel', value: true },
        { id: 'supply_chain', name: '📦 供应链专家', desc: '供应链中断时损失-25%', effect: 'supplyResist', value: 0.25 },
        { id: 'tension_cool', name: '❄️ 降温者', desc: '核紧张度自然下降+1', effect: 'tensionCool', value: 1 },
        { id: 'blackmarket', name: '🌑 黑市渠道', desc: '可购买禁运物资', effect: 'blackmarket', value: true },
        { id: 'double_agent', name: '🎭 双面人', desc: '间谍暴露时关系惩罚-50%', effect: 'spyExposeReduce', value: 0.5 },
        { id: 'crisis_vision', name: '👁️ 危机预知', desc: '随机事件链触发前可预览', effect: 'eventPreview', value: true }
    ];

    // ---------- 动态剧情模板（离线“AI”生成用）----------
    const STORY_TEMPLATES = {
        crisis_intro: [
            '{{region}}传来紧急情报：{{crisis_type}}。作为南太平洋联邦安全顾问，你必须立即做出反应。',
            '{{region}}局势急转直下。{{crisis_type}}将考验你的战略智慧。',
            '情报显示{{region}}发生{{crisis_type}}。世界目光聚焦于你的决策。'
        ],
        crisis_type: [
            '大国代理人冲突升级',
            '关键资源通道被切断',
            '军事对峙一触即发',
            '间谍网络遭到渗透',
            '经济制裁连锁反应'
        ],
        region: ['南海', '非洲之角', '东欧', '印太', '中东', '拉美', '北极'],
        choice_style: [
            '强硬回应，展示军事存在',
            '外交斡旋，寻求多边解决',
            '秘密接触，情报先行',
            '经济手段，制裁与援助并用',
            '保持观望，等待局势明朗'
        ],
        outcome_positive: [
            '你的决策得到国际社会认可。',
            '危机暂时缓解，但深层矛盾仍在。',
            '情报显示对方正在重新评估立场。'
        ],
        outcome_negative: [
            '局势进一步恶化，各方反应强烈。',
            '你的选择激化了矛盾。',
            '盟友开始质疑你的战略方向。'
        ]
    };

    // ---------- 事件链定义（chainId -> 事件序列）----------
    const EVENT_CHAINS = {
        oil_chain: [
            { eventId: 'oil_crisis', nextChain: 'oil_chain_2' },
            { eventId: 'oil_chain_2', nextChain: null }  // 第二段在 randomEvents 中 id 为 oil_chain_2
        ],
        spy_chain: [
            { eventId: 'spy_network_breach', nextChain: 'spy_chain_2' },
            { eventId: 'spy_chain_2', nextChain: null }
        ],
        arms_chain: [
            { eventId: 'arms_race_escalation', nextChain: 'arms_chain_2' },
            { eventId: 'arms_chain_2', nextChain: null }
        ]
    };

    // ---------- 随机地图：区域类型 ----------
    const REGION_TYPES = {
        crisis_zone:   { name: '危机热点', weight: 25, scenes: ['crisis_escalation', 'proxy_conflict'] },
        resource_rich: { name: '资源富集', weight: 20, scenes: ['resource_discovery', 'supply_negotiation'] },
        tech_hub:      { name: '科技枢纽', weight: 15, scenes: ['tech_race', 'cyber_frontier'] },
        spy_ground:    { name: '情报战场', weight: 20, scenes: ['spy_network', 'intel_war'] },
        diplomatic:    { name: '外交舞台', weight: 20, scenes: ['summit', 'treaty_choice'] }
    };

    function getCountryName(code) {
        return COUNTRY_NAMES[code] || code;
    }

    /**
     * 基于游戏状态与种子的动态剧情文本生成（离线）
     */
    function generateStoryBranch(seed, gs, templateKey, vars) {
        const hash = (s) => {
            let h = 0;
            for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
            return Math.abs(h);
        };
        const rng = (min, max) => {
            seed = (seed * 9301 + 49297) % 233280;
            return min + (seed / 233280) * (max - min + 1) | 0;
        };

        const templates = STORY_TEMPLATES[templateKey];
        if (!templates || !templates.length) return '';
        const idx = rng(0, templates.length - 1);
        let text = templates[idx];
        const v = Object.assign({}, vars);
        if (!v.region && STORY_TEMPLATES.region) v.region = STORY_TEMPLATES.region[rng(0, STORY_TEMPLATES.region.length - 1)];
        if (!v.crisis_type && STORY_TEMPLATES.crisis_type) v.crisis_type = STORY_TEMPLATES.crisis_type[rng(0, STORY_TEMPLATES.crisis_type.length - 1)];
        Object.keys(v).forEach(k => { text = text.replace(new RegExp('{{' + k + '}}', 'g'), v[k]); });
        return text;
    }

    /**
     * 从池中随机抽取 N 个 Perk（每局不同）
     */
    function drawPerks(seed, count) {
        const arr = [...PERK_POOL];
        const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0; return Math.abs(h); };
        let s = (seed + 1) * 12345;
        for (let i = arr.length - 1; i > 0; i--) {
            s = (s * 9301 + 49297) % 233280;
            const j = (s % (i + 1)) | 0;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.slice(0, Math.min(count, arr.length));
    }

    /**
     * 生成一局随机地图（区域列表）
     */
    function generateWorldMap(seed, regionCount) {
        const types = Object.entries(REGION_TYPES);
        const totalWeight = types.reduce((a, [, t]) => a + t.weight, 0);
        let s = (seed + 2) * 67890;
        const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
        const map = [];
        const names = ['南海', '非洲之角', '东欧', '印太', '中东', '拉美', '北极', '巴尔干'];
        for (let i = 0; i < regionCount; i++) {
            let r = rng() * totalWeight;
            for (const [typeKey, typeData] of types) {
                r -= typeData.weight;
                if (r <= 0) {
                    map.push({
                        id: 'region_' + i,
                        name: names[i % names.length],
                        type: typeKey,
                        typeName: typeData.name,
                        scenes: typeData.scenes
                    });
                    break;
                }
            }
        }
        return map;
    }

    return {
        COMMODITIES,
        SUPPLY_SOURCES,
        ARMS_RACE_BASE,
        PERK_POOL,
        STORY_TEMPLATES,
        EVENT_CHAINS,
        REGION_TYPES,
        getCountryName,
        generateStoryBranch,
        drawPerks,
        generateWorldMap
    };
})();
