/**
 * 《赤穹协议》深度战略版 v2.0
 * 多分支、多结局、随机事件的地缘政治模拟器
 */

class GameEngine {
    constructor() {
        // 核心游戏状态
        this.gameState = {
            // 基础属性
            turn: 1,
            maxTurns: 50,
            currentAct: 1, // 幕
            
            // 核心紧张度 (0-100, 到达100 = 核战争)
            nuclearTension: 25,
            
            // 国家资源
            resources: {
                budget: 100,        // 国家预算 (B)
                techLevel: 25,      // 科技水平 (0-100)
                militaryPower: 30,  // 军事力量 (0-100)
                intelligence: 20,   // 情报能力 (0-100)
                stability: 70,      // 国内稳定度 (0-100)
                reputation: 50       // 国际声誉 (0-100)
            },
            
            // 五大国关系 (多维)
            relations: {
                USA: { favor: 50, trust: 50, threat: 30, trade: 40 },
                China: { favor: 50, trust: 50, threat: 30, trade: 40 },
                Russia: { favor: 40, trust: 30, threat: 40, trade: 20 },
                EU: { favor: 55, trust: 60, threat: 10, trade: 50 },
                India: { favor: 45, trust: 45, threat: 20, trade: 30 }
            },
            
            // 秘密状态
            secrets: {
                hasNuclearWeapon: false,
                hasBioWeapon: false,
                hasAISuperiority: false,
                hasQuantumTech: false,
                hasSpaceWeapon: false,
                usaIntel: [],      // 美国情报
                chinaIntel: [],    // 中国情报
                russiaIntel: [],   // 俄罗斯情报
                blackmailable: []  // 可勒索对象
            },
            
            // 间谍网络
            spies: {
                available: 2,
                deployed: [] // {target: 'USA', mission: 'intel', turnsLeft: 3}
            },
            
            // 事件标记
            flags: {
                // 第一章节
                southChinaSeaCrisis: false,
                usaBaseAccess: false,
                chinaRareEarth: false,
                russiaS500: false,
                proxyCreated: false,
                
                // 第二章节
                africaIntervened: false,
                cobaltControlled: false,
                humanitarianPraised: false,
                doubleAgent: false,
                
                // 第三章节
                aiRace: false,
                quantumProject: false,
                spaceProgram: false,
                bioResearch: false,
                
                // 特殊事件
                assasinationAttempt: false,
                coupDetected: false,
                leakScandal: false,
                economicCrisis: false
            },
            
            // 历史记录
            history: [],
            
            // 解锁的结局
            unlockedEndings: []
        };
        
        // 随机事件池
        this.randomEvents = {
            global: [
                {
                    id: 'oil_crisis',
                    title: '🛢️ 全球石油危机',
                    weight: 5,
                    minTurn: 5,
                    condition: (gs) => gs.resources.budget > 50,
                    effect: (gs) => {
                        gs.resources.budget -= 25;
                        gs.nuclearTension += 5;
                        return '中东局势动荡，全球油价飙升，你的国家预算受到严重冲击。(-$25B, +5核紧张)';
                    }
                },
                {
                    id: 'cyber_attack',
                    title: '💻 大规模网络攻击',
                    weight: 8,
                    minTurn: 3,
                    condition: (gs) => gs.resources.techLevel > 30,
                    effect: (gs) => {
                        const attacker = this.weightedRandom(['USA', 'China', 'Russia'], [30, 40, 30]);
                        gs.relations[attacker].trust -= 15;
                        gs.resources.stability -= 10;
                        return `情报显示${this.countryName(attacker)}是幕后黑手。你的基础设施遭受重创。(-10稳定, ${this.countryName(attacker)}信任-15)`;
                    }
                },
                {
                    id: 'pandemic',
                    title: '🦠 新型疫情爆发',
                    weight: 3,
                    minTurn: 10,
                    condition: (gs) => !gs.flags.bioResearch,
                    effect: (gs) => {
                        gs.resources.stability -= 20;
                        gs.resources.budget -= 30;
                        gs.nuclearTension -= 10;
                        return '全球公共卫生危机！各国暂时放下分歧合作应对，但你的国家付出了惨重代价。(-20稳定, -$30B, -10核紧张)';
                    }
                },
                {
                    id: 'asteroid',
                    title: '☄️ 小行星威胁',
                    weight: 1,
                    minTurn: 20,
                    condition: (gs) => gs.resources.techLevel > 50,
                    effect: (gs) => {
                        gs.nuclearTension -= 15;
                        gs.resources.reputation += 10;
                        return '一颗小行星威胁地球，全球联合防御计划启动，大国关系暂时缓和。(-15核紧张, +10声誉)';
                    }
                },
                {
                    id: 'alien_signal',
                    title: '📡 收到外星信号',
                    weight: 1,
                    minTurn: 30,
                    condition: (gs) => gs.resources.techLevel > 70,
                    effect: (gs) => {
                        gs.nuclearTension = Math.max(10, gs.nuclearTension - 30);
                        gs.resources.techLevel += 15;
                        return 'SETI项目收到确认的外星信号！全球恐慌与兴奋交织，人类首次团结面对宇宙。(-30核紧张, +15科技)';
                    }
                }
            ],
            domestic: [
                {
                    id: 'protest',
                    title: '✊ 大规模抗议',
                    weight: 10,
                    minTurn: 1,
                    condition: (gs) => gs.resources.stability < 50,
                    effect: (gs) => {
                        gs.resources.stability -= 15;
                        gs.resources.budget -= 10;
                        return '民众对政府决策不满，首都爆发大规模抗议活动。(-15稳定, -$10B)';
                    }
                },
                {
                    id: 'coup_attempt',
                    title: '⚠️ 军事政变未遂',
                    weight: 3,
                    minTurn: 15,
                    condition: (gs) => gs.resources.stability < 30 && gs.resources.militaryPower > 50,
                    effect: (gs) => {
                        gs.resources.stability -= 25;
                        gs.nuclearTension += 10;
                        gs.flags.assasinationAttempt = true;
                        return '军方激进派试图夺权！虽然政变被镇压，但国家陷入混乱。需要做出选择。';
                    },
                    choices: [
                        { text: '清洗军方，巩固文官统治', effect: (gs) => { gs.resources.militaryPower -= 20; gs.resources.stability += 10; return '军方势力被大幅削弱，文官政府加强控制。(-20军事, +10稳定)'; }},
                        { text: '妥协谈判，分享权力', effect: (gs) => { gs.resources.stability -= 5; return '与军方达成权力分享协议，暂时恢复平静。(-5稳定)'; }},
                        { text: '借机宣布紧急状态', effect: (gs) => { gs.resources.stability -= 10; gs.nuclearTension += 5; return '总统权力扩大，但民主制度受损。(-10稳定, +5核紧张)'; }}
                    ]
                },
                {
                    id: 'economic_boom',
                    title: '📈 经济繁荣',
                    weight: 5,
                    minTurn: 5,
                    condition: (gs) => gs.resources.budget > 80 && gs.resources.stability > 60,
                    effect: (gs) => {
                        gs.resources.budget += 30;
                        gs.resources.stability += 10;
                        return '国际贸易协定带来巨大收益，经济高速增长！(+$30B, +10稳定)';
                    }
                },
                {
                    id: 'corruption_scandal',
                    title: '📰 腐败丑闻',
                    weight: 8,
                    minTurn: 8,
                    condition: (gs) => gs.resources.budget < 70,
                    effect: (gs) => {
                        gs.resources.stability -= 15;
                        gs.resources.reputation -= 10;
                        gs.flags.leakScandal = true;
                        return '媒体曝光高层腐败案件，政府公信力严重受损。(-15稳定, -10声誉)';
                    }
                }
            ],
            diplomatic: [
                {
                    id: 'summit_invitation',
                    title: '🕊️ 国际峰会邀请',
                    weight: 15,
                    minTurn: 3,
                    condition: (gs) => gs.resources.reputation > 40,
                    effect: (gs) => {
                        return '五大国邀请你参加核裁军峰会，这是一个展示领导力的机会。';
                    },
                    choices: [
                        { text: '积极主导，推动全面裁军', effect: (gs) => { 
                            gs.nuclearTension -= 15; 
                            gs.resources.reputation += 15;
                            Object.keys(gs.relations).forEach(k => gs.relations[k].trust += 5);
                            return '峰会取得重大突破！你的领导力得到认可。(-15核紧张, +15声誉, 各国信任+5)';
                        }},
                        { text: '低调参与，不做出承诺', effect: (gs) => {
                            gs.resources.reputation += 5;
                            return '稳健的参与让你保持灵活性。(+5声誉)';
                        }},
                        { text: '借机提出秘密核计划曝光威胁', effect: (gs) => {
                            gs.nuclearTension += 20;
                            gs.resources.reputation -= 20;
                            Object.keys(gs.relations).forEach(k => gs.relations[k].trust -= 10);
                            return '外交灾难！你的威胁激怒了所有参会国。(+20核紧张, -20声誉, 各国信任-10)';
                        }}
                    ]
                },
                {
                    id: 'trade_war',
                    title: '💰 贸易战爆发',
                    weight: 10,
                    minTurn: 5,
                    condition: (gs) => gs.relations.USA.trade > 50 || gs.relations.China.trade > 50,
                    effect: (gs) => {
                        const target = gs.relations.USA.trade > gs.relations.China.trade ? 'USA' : 'China';
                        gs.relations[target].trade -= 20;
                        gs.relations[target].favor -= 10;
                        gs.resources.budget -= 15;
                        return `${this.countryName(target)}对你的出口商品加征关税！贸易战开始。(-$15B, ${this.countryName(target)}贸易-20)`;
                    }
                },
                {
                    id: 'defence_treaty',
                    title: '🛡️ 防务条约提议',
                    weight: 8,
                    minTurn: 10,
                    condition: (gs) => {
                        const allies = Object.entries(gs.relations).filter(([k, v]) => v.favor > 60);
                        return allies.length > 0;
                    },
                    effect: (gs) => {
                        const ally = Object.entries(gs.relations).filter(([k, v]) => v.favor > 60)[0][0];
                        return `${this.countryName(ally)}提议签署共同防务条约，这将大幅提升双方关系。`;
                    },
                    choices: [
                        { text: '签署条约', effect: (gs) => {
                            const ally = Object.entries(gs.relations).filter(([k, v]) => v.favor > 60)[0][0];
                            gs.relations[ally].trust += 25;
                            gs.relations[ally].favor += 15;
                            gs.nuclearTension += 5;
                            return `与${this.countryName(ally)}正式结盟！对方会期待你在冲突中支持他们。(+25信任, +15好感, +5核紧张)`;
                        }},
                        { text: '婉拒但保持友好', effect: (gs) => {
                            const ally = Object.entries(gs.relations).filter(([k, v]) => v.favor > 60)[0][0];
                            gs.relations[ally].favor -= 10;
                            return '友好关系维持，但对方有些失望。(好感-10)';
                        }}
                    ]
                }
            ]
        };
        
        // 章节剧情
        this.chapters = {
            1: {
                title: '第一幕：风云初起',
                scenes: ['south_china_sea', 'resource_discovery', 'diplomatic_choice']
            },
            2: {
                title: '第二幕：暗流涌动',
                scenes: ['africa_proxy', 'tech_race', 'spy_network']
            },
            3: {
                title: '第三幕：临界点',
                scenes: ['crisis_escalation', 'final_choice', 'resolution']
            }
        };
        
        // 场景定义
        this.scenes = {
            south_china_sea: {
                title: '🌊 南海危机',
                text: `五艘中国无人艇与三艘美国驱逐舰在南海争议海域对峙，双方均声称该区域内的稀土矿脉归属权。作为南太平洋联邦安全顾问，你的决策将影响地区格局。`,
                image: 'images/scenes/south-china-sea.svg',
                choices: [
                    { 
                        text: '🇺🇸 公开支持美国，允许舰队停靠',
                        effect: (gs) => {
                            gs.relations.USA.favor += 20;
                            gs.relations.USA.trust += 10;
                            gs.relations.China.favor -= 25;
                            gs.relations.China.threat += 20;
                            gs.nuclearTension += 10;
                            gs.resources.budget += 15;
                            gs.flags.southChinaSeaCrisis = true;
                            gs.flags.usaBaseAccess = true;
                            return '美国舰队获准停靠，双边关系大幅提升。中国强烈抗议并宣布制裁。\n\n(+20美国好感, +10信任, -25中国好感, +20威胁, +$15B, +10核紧张)';
                        }
                    },
                    { 
                        text: '🇨🇳 向中国出售稀土开采权',
                        effect: (gs) => {
                            gs.relations.China.favor += 25;
                            gs.relations.China.trust += 15;
                            gs.relations.China.trade += 30;
                            gs.relations.USA.favor -= 20;
                            gs.relations.USA.threat += 15;
                            gs.resources.techLevel += 15;
                            gs.resources.budget += 40;
                            gs.flags.southChinaSeaCrisis = true;
                            gs.flags.chinaRareEarth = true;
                            return '中国技术团队抵达，稀土合作正式启动。美国第七舰队进入警戒状态。\n\n(+25中国好感, +15信任, +30贸易, +15科技, +$40B, -20美国好感)';
                        }
                    },
                    { 
                        text: '🇷🇺 向俄罗斯秘密购买S-500防空系统',
                        effect: (gs) => {
                            gs.relations.Russia.favor += 30;
                            gs.relations.Russia.trust += 20;
                            gs.resources.militaryPower += 20;
                            gs.resources.budget -= 35;
                            gs.secrets.russiaIntel.push('s500_deal');
                            gs.flags.southChinaSeaCrisis = true;
                            gs.flags.russiaS500 = true;
                            return '俄罗斯军火商承诺两周内交付S-500系统。你的防空能力大幅提升，但花费不菲。\n\n(+30俄罗斯好感, +20信任, +20军事, -$35B)';
                        }
                    },
                    { 
                        text: '🏝️ 保持中立，支持本地渔民组织',
                        effect: (gs) => {
                            gs.relations.USA.favor -= 5;
                            gs.relations.China.favor -= 5;
                            gs.nuclearTension -= 10;
                            gs.resources.stability += 5;
                            gs.flags.southChinaSeaCrisis = true;
                            gs.flags.proxyCreated = true;
                            return '"海洋守护者"组织成功干扰双方行动，展现了你的独立性。大国对你产生警惕，但国内民意支持上升。\n\n(-5美中好感, -10核紧张, +5稳定)';
                        }
                    },
                    {
                        text: '🕵️ 秘密接触双方，收集情报',
                        condition: (gs) => gs.resources.intelligence >= 30,
                        effect: (gs) => {
                            gs.secrets.usaIntel.push('fleet_movement');
                            gs.secrets.chinaIntel.push('drone_tactics');
                            gs.relations.USA.trust -= 5;
                            gs.relations.China.trust -= 5;
                            gs.resources.intelligence += 10;
                            gs.flags.southChinaSeaCrisis = true;
                            return '你的间谍成功渗透双方阵营，获取了宝贵的情报。\n\n(+10情报能力, 获取美国舰队动向和中国无人机战术数据)';
                        }
                    }
                ]
            },
            
            resource_discovery: {
                title: '💎 深海资源发现',
                text: `地质勘探队在你的专属经济区内发现了价值连城的深海稀土矿藏。世界大国已经开始接触，希望获得开采权。`,
                image: 'images/scenes/resource-discovery.svg',
                choices: [
                    {
                        text: '公开拍卖开采权，价高者得',
                        effect: (gs) => {
                            gs.resources.budget += 80;
                            gs.resources.reputation -= 10;
                            gs.nuclearTension += 10;
                            Object.keys(gs.relations).forEach(k => {
                                gs.relations[k].trust -= 5;
                            });
                            return '拍卖获得巨额收入，但被批评为"出卖国家资源"。各国信任下降。\n\n(+$80B, -10声誉, 各国信任-5, +10核紧张)';
                        }
                    },
                    {
                        text: '邀请多国联合开发',
                        effect: (gs) => {
                            gs.resources.budget += 40;
                            gs.resources.techLevel += 10;
                            gs.resources.reputation += 15;
                            gs.nuclearTension -= 5;
                            Object.keys(gs.relations).forEach(k => {
                                gs.relations[k].favor += 5;
                            });
                            return '多国合作模式获得国际赞誉，技术转移也让本国受益。\n\n(+$40B, +10科技, +15声誉, 各国好感+5, -5核紧张)';
                        }
                    },
                    {
                        text: '自主研发，禁止外国介入',
                        effect: (gs) => {
                            gs.resources.budget -= 30;
                            gs.resources.techLevel += 25;
                            gs.resources.stability += 10;
                            gs.nuclearTension += 5;
                            return '民族主义情绪高涨，国内支持度上升。但研发成本高昂，外国不满。\n\n(-$30B, +25科技, +10稳定, +5核紧张)';
                        }
                    },
                    {
                        text: '秘密开采，建立主权基金',
                        condition: (gs) => gs.resources.intelligence >= 40,
                        effect: (gs) => {
                            gs.resources.budget += 100;
                            gs.secrets.hasNuclearWeapon = true;
                            gs.resources.stability -= 5;
                            return '秘密开采计划成功启动，资金流入主权基金。情报部门开始研究核武器选项...\n\n(+$100B, 解锁核武器研发)';
                        }
                    }
                ]
            },
            
            africa_proxy: {
                title: '🌍 非洲代理人战争',
                text: `刚果民主共和国的钴矿争夺战升级。美国支持的M23叛军与中国支持的政府军激烈交火，全球供应链面临中断风险。`,
                image: 'images/scenes/africa-proxy.svg',
                choices: [
                    {
                        text: '🇺🇸 支持美国代理力量',
                        effect: (gs) => {
                            gs.relations.USA.favor += 15;
                            gs.relations.USA.trust += 10;
                            gs.relations.China.favor -= 20;
                            gs.relations.China.threat += 15;
                            gs.resources.budget -= 25;
                            gs.nuclearTension += 10;
                            gs.flags.africaIntervened = true;
                            return '美国情报部门表示感谢，刚果战局向美方倾斜。中国警告此举越过红线。\n\n(+15美国好感, -20中国好感, -$25B, +10核紧张)';
                        }
                    },
                    {
                        text: '🇨🇳 支持中国政府军',
                        effect: (gs) => {
                            gs.relations.China.favor += 20;
                            gs.relations.China.trust += 10;
                            gs.relations.China.trade += 25;
                            gs.relations.USA.favor -= 15;
                            gs.relations.USA.threat += 10;
                            gs.resources.budget += 35;
                            gs.flags.africaIntervened = true;
                            gs.flags.cobaltControlled = true;
                            return '中国政府军获胜，钴矿供应稳定。美国国务院发表谴责声明。\n\n(+20中国好感, +25贸易, +$35B, -15美国好感)';
                        }
                    },
                    {
                        text: '🏥 呼吁停火，人道主义援助',
                        effect: (gs) => {
                            gs.resources.reputation += 20;
                            gs.resources.budget -= 40;
                            gs.nuclearTension -= 15;
                            gs.flags.humanitarianPraised = true;
                            return '国际社会赞誉你的中立立场，联合国安理会通过停火决议。\n\n(+20声誉, -$40B, -15核紧张)';
                        }
                    },
                    {
                        text: '🎭 秘密支持双方，坐收渔利',
                        condition: (gs) => gs.resources.intelligence >= 50,
                        effect: (gs) => {
                            gs.resources.budget += 60;
                            gs.nuclearTension += 15;
                            gs.secrets.blackmailable.push('africa_double_deal');
                            gs.flags.doubleAgent = true;
                            gs.flags.africaIntervened = true;
                            return '情报机构运作完美，双方都认为你是他们的支持者。但一旦暴露...\n\n(+$60B, +15核紧张, 获得勒索筹码)';
                        }
                    },
                    {
                        text: '派遣维和部队，军事介入',
                        condition: (gs) => gs.resources.militaryPower >= 40,
                        effect: (gs) => {
                            gs.resources.militaryPower -= 15;
                            gs.resources.reputation += 15;
                            gs.resources.budget -= 50;
                            gs.nuclearTension += 5;
                            gs.flags.africaIntervened = true;
                            return '维和部队成功建立缓冲区，但军事开支巨大。\n\n(-15军事, +15声誉, -$50B, +5核紧张)';
                        }
                    }
                ]
            },
            
            tech_race: {
                title: '🚀 全球科技竞赛',
                text: `大国竞争转向高科技领域：人工智能、量子计算、太空技术、生物工程。南太平洋联邦必须选择战略方向。`,
                image: 'images/scenes/tech-race.svg',
                choices: [
                    {
                        text: '🤖 全力投入人工智能军事应用',
                        effect: (gs) => {
                            gs.resources.budget -= 50;
                            gs.resources.techLevel += 30;
                            gs.nuclearTension += 15;
                            gs.secrets.hasAISuperiority = true;
                            gs.flags.aiRace = true;
                            return 'AI军事系统部署成功，战术决策速度提升300%。但这引发了伦理争议...\n\n(-$50B, +30科技, +15核紧张, AI霸权解锁)';
                        }
                    },
                    {
                        text: '⚛️ 专注量子通信与计算',
                        effect: (gs) => {
                            gs.resources.budget -= 40;
                            gs.resources.techLevel += 35;
                            gs.relations.China.favor += 10;
                            gs.secrets.hasQuantumTech = true;
                            gs.flags.quantumProject = true;
                            return '量子技术突破！你的通信现在是不可破解的，中国表示合作意向。\n\n(-$40B, +35科技, +10中国好感, 量子技术解锁)';
                        }
                    },
                    {
                        text: '🛰️ 发展太空监视与防御',
                        effect: (gs) => {
                            gs.resources.budget -= 60;
                            gs.resources.techLevel += 20;
                            gs.resources.militaryPower += 15;
                            gs.relations.USA.favor += 15;
                            gs.secrets.hasSpaceWeapon = true;
                            gs.flags.spaceProgram = true;
                            return '太空监视网络上线，全球视野无死角。NASA希望分享数据。\n\n(-$60B, +20科技, +15军事, +15美国好感, 太空能力解锁)';
                        }
                    },
                    {
                        text: '🧬 投资生物科技与基因工程',
                        effect: (gs) => {
                            gs.resources.budget -= 35;
                            gs.resources.techLevel += 25;
                            gs.resources.stability -= 10;
                            gs.secrets.hasBioWeapon = true;
                            gs.flags.bioResearch = true;
                            return '生物技术突破带来医疗革命，但暗中的军事应用也进展迅速...\n\n(-$35B, +25科技, -10稳定, 生物武器解锁)';
                        }
                    },
                    {
                        text: '🌐 建立开源国际研究平台',
                        effect: (gs) => {
                            gs.resources.budget -= 20;
                            gs.resources.techLevel += 15;
                            gs.resources.reputation += 25;
                            Object.keys(gs.relations).forEach(k => {
                                gs.relations[k].favor += 10;
                            });
                            return '开源研究平台获得全球赞誉，各国科学家争相参与。\n\n(-$20B, +15科技, +25声誉, 各国好感+10)';
                        }
                    }
                ]
            },
            
            spy_network: {
                title: '🕵️ 间谍网络建设',
                text: `信息是现代战争的生命线。你可以投资建设情报网络，获取战略优势。`,
                image: 'images/scenes/spy-network.svg',
                choices: [
                    {
                        text: '培训本土间谍，建立国内网络',
                        effect: (gs) => {
                            gs.resources.intelligence += 25;
                            gs.resources.budget -= 20;
                            gs.resources.stability += 10;
                            gs.spies.available += 2;
                            return '本土间谍网络建立，反渗透能力大幅提升。\n\n(+25情报, +2间谍, +10稳定, -$20B)';
                        }
                    },
                    {
                        text: '招募外国线人，渗透大国',
                        effect: (gs) => {
                            gs.resources.intelligence += 35;
                            gs.resources.budget -= 40;
                            gs.spies.available += 3;
                            gs.secrets.usaIntel.push('source_in_pentagon');
                            gs.secrets.chinaIntel.push('source_in_pla');
                            return '多名外国线人被成功招募，情报开始流入。\n\n(+35情报, +3间谍, -$40B, 获取美中军事情报来源)';
                        }
                    },
                    {
                        text: '投资网络战能力',
                        effect: (gs) => {
                            gs.resources.intelligence += 30;
                            gs.resources.techLevel += 15;
                            gs.resources.budget -= 35;
                            gs.secrets.hasAISuperiority = true;
                            return '网络战部队成立，AI辅助的渗透工具已就绪。\n\n(+30情报, +15科技, -$35B, 网络战能力解锁)';
                        }
                    },
                    {
                        text: '建立信号情报站',
                        condition: (gs) => gs.resources.techLevel >= 40,
                        effect: (gs) => {
                            gs.resources.intelligence += 45;
                            gs.resources.budget -= 50;
                            gs.secrets.usaIntel.push('sigint_capability');
                            gs.secrets.chinaIntel.push('sigint_capability');
                            return '卫星信号拦截站上线，可以截获全球通信。\n\n(+45情报, -$50B, 信号情报解锁)';
                        }
                    }
                ]
            },
            
            crisis_escalation: {
                title: '⚠️ 危机升级',
                text: `全球紧张局势达到临界点。一场意外的军事对峙可能引发连锁反应...`,
                image: 'images/scenes/crisis.svg',
                dynamicText: (gs) => {
                    if (gs.nuclearTension > 70) {
                        return `核战争的阴云笼罩全球。大国都在最高戒备状态，任何误判都可能导致毁灭性后果。你的情报网络传来警告：某大国正在考虑先发制人的核打击选项。`;
                    } else if (gs.nuclearTension > 50) {
                        return `地区冲突不断升级，大国代理人战争正在全球多个热点同时进行。外交渠道几乎中断，军事对抗成为常态。`;
                    } else {
                        return `虽然局势紧张，但外交渠道仍然开放。国际社会正在寻求缓和局势的方案。`;
                    }
                },
                choices: [
                    {
                        text: '召开紧急国际峰会',
                        effect: (gs) => {
                            gs.nuclearTension -= 20;
                            gs.resources.reputation += 15;
                            Object.keys(gs.relations).forEach(k => {
                                gs.relations[k].trust += 10;
                            });
                            return '峰会成功召开，各国承诺降温。你的领导力得到认可。\n\n(-20核紧张, +15声誉, 各国信任+10)';
                        }
                    },
                    {
                        text: '秘密接触核大国，寻求保障',
                        condition: (gs) => gs.secrets.russiaIntel.length > 0 || gs.secrets.usaIntel.length > 0,
                        effect: (gs) => {
                            const ally = gs.secrets.russiaIntel.length > gs.secrets.usaIntel.length ? 'Russia' : 'USA';
                            gs.relations[ally].trust += 20;
                            gs.nuclearTension -= 15;
                            return `与${this.countryName(ally)}达成秘密谅解，获得核保护伞承诺。\n\n(${this.countryName(ally)}信任+20, -15核紧张)`;
                        }
                    },
                    {
                        text: '展示军事威慑力',
                        effect: (gs) => {
                            gs.nuclearTension += 15;
                            gs.resources.militaryPower += 10;
                            Object.keys(gs.relations).forEach(k => {
                                gs.relations[k].threat += 10;
                            });
                            return '军事演习和武器展示向世界传递强硬信号。各国对你的威胁感知上升。\n\n(+15核紧张, +10军事, 各国威胁+10)';
                        }
                    },
                    {
                        text: '推进核武器计划',
                        condition: (gs) => gs.secrets.hasNuclearWeapon && gs.resources.budget >= 50,
                        effect: (gs) => {
                            gs.resources.budget -= 60;
                            gs.nuclearTension += 30;
                            gs.secrets.hasNuclearWeapon = true;
                            return '秘密核计划加速推进。一旦成功，你将成为核俱乐部成员，但风险极大。\n\n(-$60B, +30核紧张, 核武器即将完成)';
                        }
                    }
                ]
            },
            
            final_choice: {
                title: '🎯 最终抉择',
                text: `历史将记住这一刻。你的决策将决定人类文明的走向。`,
                image: 'images/scenes/final.svg',
                dynamicText: (gs) => {
                    let context = '';
                    if (gs.secrets.hasNuclearWeapon) {
                        context += '你已掌握核武器技术，这是一个改变力量平衡的筹码。';
                    }
                    if (gs.secrets.hasAISuperiority) {
                        context += '你的AI系统可以预测敌对行动，提供战略优势。';
                    }
                    if (gs.resources.reputation > 70) {
                        context += '国际社会尊重你的领导力，你的声音有分量。';
                    }
                    if (gs.nuclearTension > 80) {
                        context += '世界站在核战争的边缘，每一个决定都可能触发末日的齿轮。';
                    }
                    return context;
                },
                choices: [
                    {
                        text: '推动全球和平倡议',
                        effect: (gs) => {
                            gs.nuclearTension -= 30;
                            gs.resources.reputation += 25;
                            Object.keys(gs.relations).forEach(k => {
                                gs.relations[k].favor += 15;
                            });
                            return '你的和平倡议获得广泛支持，成为全球外交史上的里程碑。\n\n(-30核紧张, +25声誉, 各国好感+15)';
                        }
                    },
                    {
                        text: '宣布中立，退出大国竞争',
                        effect: (gs) => {
                            gs.nuclearTension -= 20;
                            gs.resources.budget += 30;
                            Object.keys(gs.relations).forEach(k => {
                                gs.relations[k].favor -= 10;
                            });
                            return '中立宣言让小国获得喘息，但大国视此为软弱信号。\n\n(-20核紧张, +$30B, 各国好感-10)';
                        }
                    },
                    {
                        text: '公开核武器，加入核俱乐部',
                        condition: (gs) => gs.secrets.hasNuclearWeapon,
                        effect: (gs) => {
                            gs.nuclearTension += 40;
                            gs.resources.militaryPower += 30;
                            gs.resources.reputation -= 30;
                            Object.keys(gs.relations).forEach(k => {
                                gs.relations[k].threat += 30;
                                gs.relations[k].trust -= 20;
                            });
                            return '核试验成功！你是新的核国家。世界震惊，制裁随之而来。\n\n(+40核紧张, +30军事, -30声誉, 各国威胁+30, 信任-20)';
                        }
                    },
                    {
                        text: '寻求区域联盟',
                        effect: (gs) => {
                            gs.resources.militaryPower += 15;
                            gs.resources.stability += 15;
                            gs.nuclearTension -= 10;
                            return '区域联盟建立，集体安全机制启动。\n\n(+15军事, +15稳定, -10核紧张)';
                        }
                    }
                ]
            }
        };
        
        // 结局定义
        this.endings = {
            nuclear_winter: {
                title: '☢️ 核冬天',
                condition: (gs) => gs.nuclearTension >= 100,
                description: '核战争爆发了。人类的愚蠢最终导致了文明的终结。在最后时刻，你回想起那些本可以改变历史的选择...',
                rarity: 'bad'
            },
            sixth_pole: {
                title: '🌟 第六极崛起',
                condition: (gs) => {
                    const avgFavor = Object.values(gs.relations).reduce((a, b) => a + b.favor, 0) / 5;
                    const avgTrust = Object.values(gs.relations).reduce((a, b) => a + b.trust, 0) / 5;
                    return gs.nuclearTension < 30 && avgFavor > 70 && avgTrust > 60 && gs.resources.reputation > 70;
                },
                description: '通过高超的外交手腕，你成功将南太平洋联邦打造为世界第六极！大国尊重你的国家，小国仰慕你的领导力。',
                rarity: 'legendary'
            },
            ai_dictatorship: {
                title: '🤖 AI统治时代',
                condition: (gs) => gs.secrets.hasAISuperiority && gs.resources.techLevel >= 90,
                description: '人工智能系统逐渐接管了国家决策。效率和理性战胜了人类的情感与偏见。一个新时代开始了...',
                rarity: 'rare'
            },
            nuclear_state: {
                title: '☢️ 核国家',
                condition: (gs) => gs.secrets.hasNuclearWeapon && gs.resources.militaryPower >= 60,
                description: '你成功加入了核俱乐部。大国不敢轻视你，但你的国家也成为了核威慑的目标。和平与恐惧并存。',
                rarity: 'uncommon'
            },
            economic_giant: {
                title: '💰 经济巨人',
                condition: (gs) => gs.resources.budget >= 200 && gs.resources.stability >= 70,
                description: '你的国家成为了区域经济强国。财富带来影响力，你的外交政策以经济手段为主，军事手段为辅。',
                rarity: 'uncommon'
            },
            fallen_state: {
                title: '🏚️ 崩溃的国家',
                condition: (gs) => gs.resources.stability <= 10 || gs.resources.budget <= 0,
                description: '过度扩张和政策失误导致国家崩溃。内乱、经济危机和外交孤立最终摧毁了南太平洋联邦。',
                rarity: 'bad'
            },
            balanced_peace: {
                title: '⚖️ 和平守护者',
                condition: (gs) => gs.nuclearTension < 40 && gs.resources.reputation > 60,
                description: '在动荡的世界中，你维护了地区的和平与稳定。不是最强大的，但最受尊敬的。',
                rarity: 'common'
            },
            shadow_ruler: {
                title: '👤 影子统治者',
                condition: (gs) => gs.secrets.blackmailable.length >= 3 && gs.resources.intelligence >= 70,
                description: '你的间谍网络掌握了太多秘密。各国领导人都害怕你的情报档案。权力的真正主人从不站在聚光灯下。',
                rarity: 'rare'
            },
            tech_empire: {
                title: '🔬 科技帝国',
                condition: (gs) => gs.resources.techLevel >= 90 && gs.secrets.hasQuantumTech,
                description: '量子计算、人工智能、太空技术...你的国家成为全球科技创新中心。知识就是力量。',
                rarity: 'rare'
            },
            uncertain_future: {
                title: '🌫️ 不确定的未来',
                condition: () => true, // 默认结局
                description: '世界依然在核威慑的阴影下前行。你的选择为国家争取了宝贵的喘息时间，但历史尚未写下终章。',
                rarity: 'common'
            }
        };
        
        this.saveKey = 'chiqiongProtocolV2Save';
        this.currentScene = null;
        this.eventLog = [];
    }

    // 初始化
    init() {
        this.loadGame();
        this.render();
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        document.getElementById('new-game-btn').onclick = () => {
            if (confirm('确定要开始新游戏吗？当前进度将丢失。')) {
                this.newGame();
            }
        };
        document.getElementById('save-game-btn').onclick = () => {
            this.saveGame();
            this.showMessage('游戏已保存！', 'success');
        };
        document.getElementById('load-game-btn').onclick = () => {
            if (this.loadGame()) {
                this.render();
                this.showMessage('游戏已加载！', 'success');
            } else {
                this.showMessage('没有找到存档！', 'error');
            }
        };
    }

    // 渲染游戏界面
    render() {
        this.renderStatus();
        if (this.checkEnding()) {
            return;
        }
        this.renderScene();
    }

    // 渲染状态面板
    renderStatus() {
        const statusDiv = document.getElementById('game-status');
        const countryNames = { USA: '美国', China: '中国', Russia: '俄罗斯', EU: '欧盟', India: '印度' };
        const countryFlags = { USA: '🇺🇸', China: '🇨🇳', Russia: '🇷🇺', EU: '🇪🇺', India: '🇮🇳' };
        
        // 核紧张度颜色
        let tensionColor = '#4CAF50';
        if (this.gameState.nuclearTension > 70) tensionColor = '#F44336';
        else if (this.gameState.nuclearTension > 40) tensionColor = '#FF9800';
        else if (this.gameState.nuclearTension > 20) tensionColor = '#FFC107';
        
        let html = `
            <div class="status-header">
                <span class="turn-counter">回合 ${this.gameState.turn}/${this.gameState.maxTurns}</span>
                <span class="act-label">第${this.gameState.currentAct}幕</span>
            </div>
            
            <div class="core-status">
                <div class="status-item critical">
                    <span class="status-label">☢️ 核紧张度</span>
                    <div class="status-bar">
                        <div class="status-fill" style="width:${this.gameState.nuclearTension}%; background:${tensionColor}"></div>
                    </div>
                    <span class="status-value">${this.gameState.nuclearTension}%</span>
                </div>
            </div>
            
            <div class="resources-panel">
                <h3>📊 国家资源</h3>
                <div class="resources-grid">
                    <div class="resource-item">
                        <span class="resource-icon">💰</span>
                        <span class="resource-label">预算</span>
                        <span class="resource-value">$${this.gameState.resources.budget}B</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">🔬</span>
                        <span class="resource-label">科技</span>
                        <span class="resource-value">${this.gameState.resources.techLevel}/100</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">⚔️</span>
                        <span class="resource-label">军事</span>
                        <span class="resource-value">${this.gameState.resources.militaryPower}/100</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">🕵️</span>
                        <span class="resource-label">情报</span>
                        <span class="resource-value">${this.gameState.resources.intelligence}/100</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">🏛️</span>
                        <span class="resource-label">稳定</span>
                        <span class="resource-value">${this.gameState.resources.stability}/100</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">🌐</span>
                        <span class="resource-label">声誉</span>
                        <span class="resource-value">${this.gameState.resources.reputation}/100</span>
                    </div>
                </div>
            </div>
            
            <div class="relations-panel">
                <h3>🌐 五大国关系</h3>
                <div class="relations-grid">
        `;
        
        for (const [code, name] of Object.entries(countryNames)) {
            const rel = this.gameState.relations[code];
            const avgRel = (rel.favor + rel.trust) / 2;
            const status = avgRel > 65 ? '友好' : avgRel > 35 ? '中立' : '敌对';
            const statusClass = avgRel > 65 ? 'friendly' : avgRel > 35 ? 'neutral' : 'hostile';
            
            html += `
                <div class="relation-card ${statusClass}">
                    <div class="relation-header">
                        <span class="relation-flag">${countryFlags[code]}</span>
                        <span class="relation-name">${name}</span>
                    </div>
                    <div class="relation-details">
                        <div class="rel-bar">
                            <span>好感</span>
                            <div class="mini-bar"><div style="width:${rel.favor}%"></div></div>
                            <span>${rel.favor}</span>
                        </div>
                        <div class="rel-bar">
                            <span>信任</span>
                            <div class="mini-bar"><div style="width:${rel.trust}%"></div></div>
                            <span>${rel.trust}</span>
                        </div>
                    </div>
                    <span class="relation-status ${statusClass}">${status}</span>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
            
            <div class="secrets-panel">
                <h3>🔐 秘密资产</h3>
                <div class="secrets-list">
                    ${this.gameState.secrets.hasNuclearWeapon ? '<span class="secret-badge">☢️ 核武</span>' : ''}
                    ${this.gameState.secrets.hasBioWeapon ? '<span class="secret-badge">🧬 生武</span>' : ''}
                    ${this.gameState.secrets.hasAISuperiority ? '<span class="secret-badge">🤖 AI</span>' : ''}
                    ${this.gameState.secrets.hasQuantumTech ? '<span class="secret-badge">⚛️ 量子</span>' : ''}
                    ${this.gameState.secrets.hasSpaceWeapon ? '<span class="secret-badge">🛰️ 太空</span>' : ''}
                    ${this.gameState.secrets.blackmailable.length > 0 ? `<span class="secret-badge">🕵️ 勒索×${this.gameState.secrets.blackmailable.length}</span>` : ''}
                    ${Object.values(this.gameState.secrets).flat().filter(x => typeof x === 'string').length === 0 && this.gameState.secrets.blackmailable.length === 0 ? '<span class="secret-badge empty">暂无</span>' : ''}
                </div>
            </div>
        `;
        
        statusDiv.innerHTML = html;
    }

    // 渲染当前场景
    renderScene() {
        const scene = this.getCurrentScene();
        if (!scene) return;
        
        const storyDiv = document.getElementById('story-content');
        let sceneText = scene.text;
        if (scene.dynamicText) {
            sceneText += '\n\n' + scene.dynamicText(this.gameState);
        }
        
        storyDiv.innerHTML = `
            <div class="scene-container">
                <h2 class="scene-title">${scene.title}</h2>
                <div class="scene-text">${sceneText.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        
        const choicesDiv = document.getElementById('choices-container');
        const availableChoices = scene.choices.filter(c => !c.condition || c.condition(this.gameState));
        
        choicesDiv.innerHTML = availableChoices.map((c, i) => 
            `<button class="choice-btn" data-index="${i}">${c.text}</button>`
        ).join('');
        
        choicesDiv.querySelectorAll('.choice-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.index);
                this.makeChoice(availableChoices[idx]);
            };
        });
    }

    // 获取当前场景
    getCurrentScene() {
        // 根据游戏状态决定场景
        const turn = this.gameState.turn;
        const act = this.gameState.currentAct;
        
        // 线性场景流 + 随机事件
        if (turn === 1) return this.scenes.south_china_sea;
        if (turn === 2) return this.scenes.resource_discovery;
        if (turn === 3) return this.scenes.africa_proxy;
        if (turn === 4) return this.scenes.tech_race;
        if (turn === 5) return this.scenes.spy_network;
        
        // 中期随机事件 + 场景
        if (turn >= 6 && turn <= 10) {
            if (Math.random() < 0.4) {
                return this.scenes.crisis_escalation;
            }
            return this.getRandomScene();
        }
        
        // 后期高潮
        if (turn >= 11 && turn <= 15) {
            return this.scenes.crisis_escalation;
        }
        
        // 最终抉择
        if (turn >= 16) {
            return this.scenes.final_choice;
        }
        
        return this.scenes.crisis_escalation;
    }

    // 获取随机场景
    getRandomScene() {
        const scenes = [
            this.scenes.resource_discovery,
            this.scenes.africa_proxy,
            this.scenes.tech_race,
            this.scenes.spy_network
        ];
        return scenes[Math.floor(Math.random() * scenes.length)];
    }

    // 做出选择
    makeChoice(choice) {
        // 执行效果
        const result = choice.effect(this.gameState);
        
        // 记录历史
        this.gameState.history.push({
            turn: this.gameState.turn,
            choice: choice.text,
            result: result
        });
        
        // 显示结果
        this.showResult(result);
        
        // 触发随机事件
        setTimeout(() => {
            this.triggerRandomEvent();
        }, 2000);
    }

    // 显示结果
    showResult(text) {
        const storyDiv = document.getElementById('story-content');
        storyDiv.innerHTML = `
            <div class="result-container">
                <h3>📋 决策结果</h3>
                <div class="result-text">${text.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        
        document.getElementById('choices-container').innerHTML = `
            <button class="choice-btn continue-btn" onclick="game.nextTurn()">继续 ➤</button>
        `;
    }

    // 触发随机事件
    triggerRandomEvent() {
        const allEvents = [
            ...this.randomEvents.global,
            ...this.randomEvents.domestic,
            ...this.randomEvents.diplomatic
        ];
        
        // 筛选符合条件的事件
        const availableEvents = allEvents.filter(e => 
            e.minTurn <= this.gameState.turn &&
            (!e.condition || e.condition(this.gameState)) &&
            Math.random() < e.weight / 100
        );
        
        if (availableEvents.length === 0) return;
        
        // 随机选择一个事件
        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        
        // 显示事件
        this.showEvent(event);
    }

    // 显示事件
    showEvent(event) {
        const storyDiv = document.getElementById('story-content');
        storyDiv.innerHTML = `
            <div class="event-container">
                <h3>⚡ 随机事件</h3>
                <h4>${event.title}</h4>
                <div class="event-text">${typeof event.effect === 'function' && !event.choices ? event.effect(this.gameState) : ''}</div>
            </div>
        `;
        
        if (event.choices) {
            document.getElementById('choices-container').innerHTML = event.choices.map((c, i) => 
                `<button class="choice-btn" data-index="${i}">${c.text}</button>`
            ).join('') + `<button class="choice-btn continue-btn" onclick="game.nextTurn()">跳过</button>`;
            
            document.querySelectorAll('#choices-container .choice-btn[data-index]').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.index);
                    const result = event.choices[idx].effect(this.gameState);
                    this.showResult(result);
                };
            });
        } else {
            document.getElementById('choices-container').innerHTML = `
                <button class="choice-btn continue-btn" onclick="game.nextTurn()">继续 ➤</button>
            `;
        }
    }

    // 下一回合
    nextTurn() {
        this.gameState.turn++;
        
        // 更新幕
        if (this.gameState.turn > 5 && this.gameState.turn <= 10) {
            this.gameState.currentAct = 2;
        } else if (this.gameState.turn > 10) {
            this.gameState.currentAct = 3;
        }
        
        // 自动调整
        this.applyTurnEffects();
        
        // 检查结局
        if (this.checkEnding()) return;
        
        // 保存
        this.saveGame();
        
        // 渲染
        this.render();
    }

    // 回合效果
    applyTurnEffects() {
        // 预算消耗
        this.gameState.resources.budget -= 5;
        
        // 稳定性自然恢复
        if (this.gameState.resources.stability < 50) {
            this.gameState.resources.stability += 2;
        }
        
        // 关系自然调整
        Object.keys(this.gameState.relations).forEach(k => {
            const rel = this.gameState.relations[k];
            // 信任度缓慢恢复
            if (rel.trust < 50) rel.trust += 1;
            // 威胁感知缓慢下降
            if (rel.threat > 20) rel.threat -= 1;
        });
        
        // 核紧张度缓慢下降
        if (this.gameState.nuclearTension > 20) {
            this.gameState.nuclearTension -= 1;
        }
    }

    // 检查结局
    checkEnding() {
        // 特殊结局：核战
        if (this.gameState.nuclearTension >= 100) {
            this.showEnding(this.endings.nuclear_winter);
            return true;
        }
        
        // 特殊结局：国家崩溃
        if (this.gameState.resources.stability <= 0 || this.gameState.resources.budget <= -50) {
            this.showEnding(this.endings.fallen_state);
            return true;
        }
        
        // 回合结束
        if (this.gameState.turn > this.gameState.maxTurns) {
            // 找到匹配的结局
            for (const [key, ending] of Object.entries(this.endings)) {
                if (key !== 'uncertain_future' && ending.condition(this.gameState)) {
                    this.showEnding(ending);
                    return true;
                }
            }
            this.showEnding(this.endings.uncertain_future);
            return true;
        }
        
        return false;
    }

    // 显示结局
    showEnding(ending) {
        const rarityColors = {
            legendary: '#FFD700',
            rare: '#9C27B0',
            uncommon: '#2196F3',
            common: '#4CAF50',
            bad: '#F44336'
        };
        
        const storyDiv = document.getElementById('story-content');
        storyDiv.innerHTML = `
            <div class="ending-container">
                <div class="ending-badge" style="color: ${rarityColors[ending.rarity]}">${ending.rarity.toUpperCase()}</div>
                <h1 class="ending-title">${ending.title}</h1>
                <div class="ending-text">${ending.description}</div>
                <div class="ending-stats">
                    <h3>📊 最终统计</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span>回合数</span>
                            <span>${this.gameState.turn}</span>
                        </div>
                        <div class="stat-item">
                            <span>核紧张度</span>
                            <span>${this.gameState.nuclearTension}%</span>
                        </div>
                        <div class="stat-item">
                            <span>国家预算</span>
                            <span>$${this.gameState.resources.budget}B</span>
                        </div>
                        <div class="stat-item">
                            <span>科技水平</span>
                            <span>${this.gameState.resources.techLevel}/100</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('choices-container').innerHTML = `
            <button class="choice-btn" onclick="game.newGame()">🔄 重新开始</button>
            <button class="choice-btn" onclick="game.showHistory()">📜 查看历史</button>
        `;
        
        // 记录结局
        if (!this.gameState.unlockedEndings.includes(ending.title)) {
            this.gameState.unlockedEndings.push(ending.title);
            this.saveGame();
        }
    }

    // 显示历史
    showHistory() {
        const storyDiv = document.getElementById('story-content');
        storyDiv.innerHTML = `
            <div class="history-container">
                <h2>📜 决策历史</h2>
                <div class="history-list">
                    ${this.gameState.history.map(h => `
                        <div class="history-item">
                            <div class="history-turn">回合 ${h.turn}</div>
                            <div class="history-choice">${h.choice}</div>
                            <div class="history-result">${h.result.replace(/\n/g, '<br>')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.getElementById('choices-container').innerHTML = `
            <button class="choice-btn" onclick="game.render()">返回</button>
        `;
    }

    // 显示消息
    showMessage(text, type = 'info') {
        let msgDiv = document.getElementById('message-display');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.id = 'message-display';
            msgDiv.className = 'message-display';
            document.body.appendChild(msgDiv);
        }
        msgDiv.textContent = text;
        msgDiv.className = `message-display ${type}`;
        msgDiv.style.display = 'block';
        setTimeout(() => msgDiv.style.display = 'none', 3000);
    }

    // 工具函数
    countryName(code) {
        const names = { USA: '美国', China: '中国', Russia: '俄罗斯', EU: '欧盟', India: '印度' };
        return names[code] || code;
    }

    weightedRandom(items, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) return items[i];
        }
        return items[items.length - 1];
    }

    // 保存游戏
    saveGame() {
        localStorage.setItem(this.saveKey, JSON.stringify(this.gameState));
    }

    // 加载游戏
    loadGame() {
        const saved = localStorage.getItem(this.saveKey);
        if (saved) {
            try {
                this.gameState = JSON.parse(saved);
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    // 新游戏
    newGame() {
        localStorage.removeItem(this.saveKey);
        location.reload();
    }
}

// 初始化游戏
const game = new GameEngine();
document.addEventListener('DOMContentLoaded', () => game.init());