// 游戏配置文件
export const GAME_CONFIG = {
  // 每个学期的行动次数
  ACTIONS_PER_TERM: 10,
  
  // 学期列表
  TERMS: [
    '小学一年级', '小学二年级', '小学三年级',
    '小学四年级', '小学五年级', '小学六年级',
    '初中一年级', '初中二年级', '初中三年级',
    '高中一年级', '高中二年级', '高中三年级'
  ],
  
  // 初始属性值
  INITIAL_ATTRIBUTES: {
    study: 10,    // 学习
    sports: 10,   // 体育
    art: 10,      // 艺术
    social: 10,   // 社交
    stress: 0     // 压力
  },
  
  // 压力阈值
  MAX_STRESS: 100,
  STRESS_WARNING: 70,
  
  // 属性衰减（每学期自动衰减）
  ATTRIBUTE_DECAY: {
    study: 2,    // 学习会遗忘
    sports: 3,   // 体质会下降
    art: 1,      // 艺术会生疏
    social: 1    // 社交会淡化
  },
  
  // 事件触发概率（每次行动后）
  EVENT_TRIGGER_CHANCE: 0.35,  // 35%概率触发事件（降低一些）
  
  // 关键考试节点（学期索引）
  KEY_EXAMS: {
    5: { name: '小升初', weight: 1.2 },      // 小学六年级
    8: { name: '中考', weight: 1.5 },        // 初中三年级
    11: { name: '高考', weight: 2.0 }        // 高中三年级
  }
};

// 成就配置
export const ACHIEVEMENTS = [
  // 属性类成就
  {
    id: 'scholar',
    name: '学霸',
    icon: '📚',
    description: '学习属性达到80',
    condition: (data) => data.attributes.study >= 80,
    reward: { study: 5 },
    color: '#4A90E2'
  },
  {
    id: 'athlete_master',
    name: '运动健将',
    icon: '🏆',
    description: '体育属性达到80',
    condition: (data) => data.attributes.sports >= 80,
    reward: { sports: 5 },
    color: '#E24A4A'
  },
  {
    id: 'artist_master',
    name: '艺术大师',
    icon: '🎭',
    description: '艺术属性达到80',
    condition: (data) => data.attributes.art >= 80,
    reward: { art: 5 },
    color: '#9B59B6'
  },
  {
    id: 'social_butterfly',
    name: '社交达人',
    icon: '🦋',
    description: '社交属性达到80',
    condition: (data) => data.attributes.social >= 80,
    reward: { social: 5 },
    color: '#2ECC71'
  },
  {
    id: 'all_rounder',
    name: '全能选手',
    icon: '⭐',
    description: '所有属性都达到60',
    condition: (data) => {
      const { study, sports, art, social } = data.attributes;
      return study >= 60 && sports >= 60 && art >= 60 && social >= 60;
    },
    reward: { study: 3, sports: 3, art: 3, social: 3 },
    color: '#FFD700'
  },
  
  // 压力管理类成就
  {
    id: 'zen_master',
    name: '心如止水',
    icon: '🧘',
    description: '完成一个学期且压力低于20',
    condition: (data) => data.isTermEnd && data.attributes.stress < 20,
    reward: { stress: -10 },
    color: '#95A5A6'
  },
  {
    id: 'stress_survivor',
    name: '压力幸存者',
    icon: '💪',
    description: '在压力超过90时完成学期',
    condition: (data) => data.isTermEnd && data.attributes.stress > 90,
    reward: { stress: -15 },
    color: '#E67E22'
  },
  
  // 考试类成就
  {
    id: 'exam_ace',
    name: '考试之神',
    icon: '🎯',
    description: '任意学期获得S级评价',
    condition: (data) => data.lastTermGrade === 'S',
    reward: { study: 5, stress: -5 },
    color: '#FFD700'
  },
  {
    id: 'key_exam_master',
    name: '大考高手',
    icon: '🏅',
    description: '在关键考试中获得A级以上',
    condition: (data) => {
      return data.isKeyExam() && (data.lastTermGrade === 'S' || data.lastTermGrade === 'A');
    },
    reward: { study: 8, stress: -10 },
    color: '#FFD700'
  },
  
  // 特殊成就
  {
    id: 'perfect_balance',
    name: '完美平衡',
    icon: '⚖️',
    description: '四项属性差距不超过10',
    condition: (data) => {
      const { study, sports, art, social } = data.attributes;
      const values = [study, sports, art, social];
      const max = Math.max(...values);
      const min = Math.min(...values);
      return max - min <= 10;
    },
    reward: { study: 2, sports: 2, art: 2, social: 2 },
    color: '#3498DB'
  },
  {
    id: 'early_bird',
    name: '早起的鸟儿',
    icon: '🐦',
    description: '在小学阶段任意属性达到50',
    condition: (data) => {
      if (data.currentTermIndex > 5) return false;
      const { study, sports, art, social } = data.attributes;
      return study >= 50 || sports >= 50 || art >= 50 || social >= 50;
    },
    reward: { study: 5, sports: 5, art: 5, social: 5 },
    color: '#F39C12'
  },
  {
    id: 'comeback_kid',
    name: '逆风翻盘',
    icon: '🔥',
    description: '从D级评价提升到A级以上',
    condition: (data) => {
      return data.previousTermGrade === 'D' && 
             (data.lastTermGrade === 'A' || data.lastTermGrade === 'S');
    },
    reward: { study: 10, stress: -10 },
    color: '#E74C3C'
  },
  {
    id: 'no_stress',
    name: '零压力',
    icon: '😌',
    description: '压力值为0',
    condition: (data) => data.attributes.stress === 0,
    reward: { stress: -5 },
    color: '#1ABC9C'
  },
  {
    id: 'high_achiever',
    name: '高分达人',
    icon: '💯',
    description: '单学期分数超过400',
    condition: (data) => data.lastTermScore >= 400,
    reward: { study: 5, stress: -5 },
    color: '#9B59B6'
  }
];

// 天赋配置
export const TALENTS = [
  {
    id: 'genius',
    name: '天生聪颖',
    icon: '🧠',
    description: '学习效率提升30%，但压力增长更快',
    color: '#4A90E2',
    effects: {
      studyBonus: 0.3,        // 学习行动效果+30%
      stressPenalty: 0.2,     // 压力增长+20%
      initialBonus: { study: 5 }
    }
  },
  {
    id: 'athlete',
    name: '体质强健',
    icon: '💪',
    description: '体育效率提升30%，不易生病，学习稍慢',
    color: '#E24A4A',
    effects: {
      sportsBonus: 0.3,       // 体育行动效果+30%
      studyPenalty: 0.1,      // 学习效果-10%
      sickResistance: 0.5,    // 生病概率减半
      initialBonus: { sports: 5 }
    }
  },
  {
    id: 'artist',
    name: '艺术天赋',
    icon: '🎨',
    description: '艺术效率提升30%，压力恢复更快',
    color: '#9B59B6',
    effects: {
      artBonus: 0.3,          // 艺术行动效果+30%
      stressRecovery: 0.3,    // 压力恢复+30%
      initialBonus: { art: 5 }
    }
  },
  {
    id: 'social',
    name: '社交达人',
    icon: '😊',
    description: '社交效率提升30%，更容易交朋友，压力更低',
    color: '#2ECC71',
    effects: {
      socialBonus: 0.3,       // 社交行动效果+30%
      stressRecovery: 0.2,    // 压力恢复+20%
      initialBonus: { social: 5, stress: -5 }
    }
  },
  {
    id: 'balanced',
    name: '全面发展',
    icon: '⚖️',
    description: '所有属性均衡提升15%，属性衰减减少',
    color: '#F39C12',
    effects: {
      allBonus: 0.15,         // 所有行动效果+15%
      decayReduction: 0.3,    // 属性衰减-30%
      initialBonus: { study: 2, sports: 2, art: 2, social: 2 }
    }
  },
  {
    id: 'resilient',
    name: '抗压能力强',
    icon: '🛡️',
    description: '压力增长减少40%，压力恢复更快',
    color: '#95A5A6',
    effects: {
      stressPenalty: -0.4,    // 压力增长-40%
      stressRecovery: 0.4,    // 压力恢复+40%
      initialBonus: { stress: -10 }
    }
  }
];

// 行动卡片配置
export const ACTION_CARDS = [
  {
    id: 'study',
    name: '学习',
    icon: '📚',
    color: '#4A90E2',
    effects: { study: 8, stress: 5 },
    description: '认真学习，提升学习能力'
  },
  {
    id: 'sports',
    name: '运动',
    icon: '⚽',
    color: '#E24A4A',
    effects: { sports: 8, study: -2, stress: -3 },
    description: '锻炼身体，释放压力，但会占用学习时间'
  },
  {
    id: 'art',
    name: '艺术',
    icon: '🎨',
    color: '#9B59B6',
    effects: { art: 8, study: -2, stress: -2 },
    description: '培养艺术细胞，但会占用学习时间'
  },
  {
    id: 'social',
    name: '社交',
    icon: '👥',
    color: '#2ECC71',
    effects: { social: 8, study: -1, stress: -4 },
    description: '和朋友玩耍，提升社交能力，稍微影响学习'
  },
  {
    id: 'rest',
    name: '休息',
    icon: '😴',
    color: '#95A5A6',
    effects: { stress: -15, study: -1 },
    description: '好好休息，大幅降低压力'
  },
  {
    id: 'cram',
    name: '补习班',
    icon: '📖',
    color: '#E67E22',
    effects: { study: 12, sports: -2, stress: 10 },
    description: '参加补习班，快速提升学习但压力大且缺乏运动'
  }
];

// 随机事件配置
export const RANDOM_EVENTS = [
  // 正面事件
  {
    id: 'exam_success',
    name: '考试成功',
    description: '这次考试考得不错，老师表扬了你！',
    condition: (attrs) => attrs.study >= 50,
    probability: 0.25,
    effects: { study: 5, stress: -5 }
  },
  {
    id: 'friend_help',
    name: '朋友帮助',
    description: '好朋友帮你解决了难题！',
    condition: (attrs) => attrs.social >= 40,
    probability: 0.2,
    effects: { study: 3, stress: -3 }
  },
  {
    id: 'talent_show',
    name: '才艺表演',
    description: '学校举办才艺表演，你的表现获得了掌声！',
    condition: (attrs) => attrs.art >= 40,
    probability: 0.18,
    effects: { art: 5, social: 3, stress: -5 }
  },
  {
    id: 'sports_win',
    name: '运动会获奖',
    description: '运动会上你获得了好成绩！',
    condition: (attrs) => attrs.sports >= 40,
    probability: 0.18,
    effects: { sports: 5, social: 3, stress: -3 }
  },
  
  // 选择类事件
  {
    id: 'internet_cafe',
    name: '网吧邀请',
    description: '同学邀请你去网吧玩游戏，你会怎么做？',
    condition: (attrs) => attrs.social >= 30,
    probability: 0.2,
    hasChoice: true,
    choices: [
      {
        text: '拒绝并回家学习',
        effects: { study: 5, social: -3, stress: 3 }
      },
      {
        text: '去玩一会儿',
        effects: { social: 5, study: -5, stress: -8 }
      },
      {
        text: '劝说去图书馆',
        effects: { study: 3, social: 3, stress: -2 }
      }
    ]
  },
  {
    id: 'competition_choice',
    name: '比赛机会',
    description: '学校有个比赛机会，但会占用学习时间，参加吗？',
    condition: (attrs) => attrs.art >= 35 || attrs.sports >= 35,
    probability: 0.15,
    hasChoice: true,
    choices: [
      {
        text: '参加比赛',
        effects: { art: 5, sports: 3, study: -5, stress: 5 }
      },
      {
        text: '专心学习',
        effects: { study: 8, stress: 5 }
      },
      {
        text: '适度参与',
        effects: { art: 3, sports: 2, study: 2, stress: 3 }
      }
    ]
  },
  {
    id: 'weekend_plan',
    name: '周末安排',
    description: '周末到了，你打算怎么度过？',
    probability: 0.18,
    hasChoice: true,
    choices: [
      {
        text: '在家学习',
        effects: { study: 6, stress: 5 }
      },
      {
        text: '出去玩',
        effects: { social: 6, stress: -8 }
      },
      {
        text: '运动健身',
        effects: { sports: 6, stress: -5 }
      }
    ]
  },
  {
    id: 'help_classmate',
    name: '同学求助',
    description: '同学请你帮忙补习，但你自己也很忙...',
    condition: (attrs) => attrs.study >= 50,
    probability: 0.15,
    hasChoice: true,
    choices: [
      {
        text: '热心帮助',
        effects: { social: 8, study: -3, stress: 5 }
      },
      {
        text: '婉拒请求',
        effects: { study: 5, social: -5, stress: -3 }
      },
      {
        text: '约定周末',
        effects: { social: 4, study: 2, stress: 2 }
      }
    ]
  },
  
  // 负面事件 - 体质相关
  {
    id: 'sick_minor',
    name: '感冒了',
    description: '你感冒了，需要休息，本学期减少1次行动机会...',
    condition: (attrs) => attrs.sports < 30,
    probability: 0.3,
    effects: { sports: -3, stress: 5 },
    actionPenalty: 1
  },
  {
    id: 'sick_major',
    name: '生病住院',
    description: '体质太弱导致生病住院，本学期减少2次行动机会！',
    condition: (attrs) => attrs.sports < 20,
    probability: 0.2,
    effects: { sports: -5, study: -3, stress: 10 },
    actionPenalty: 2
  },
  {
    id: 'exhausted',
    name: '体力透支',
    description: '长期缺乏锻炼，身体疲惫，学习效率下降...',
    condition: (attrs) => attrs.sports < 25,
    probability: 0.25,
    effects: { sports: -3, study: -5, stress: 8 }
  },
  
  // 负面事件 - 压力相关
  {
    id: 'stress_breakdown',
    name: '压力崩溃',
    description: '压力过大导致情绪崩溃，所有属性下降！',
    condition: (attrs) => attrs.stress > 80,
    probability: 0.4,
    effects: { study: -8, sports: -5, art: -5, social: -5, stress: 10 }
  },
  {
    id: 'anxiety',
    name: '考试焦虑',
    description: '压力太大导致考试发挥失常...',
    condition: (attrs) => attrs.stress > 70,
    probability: 0.35,
    effects: { study: -10, stress: 5 }
  },
  {
    id: 'insomnia',
    name: '失眠',
    description: '压力导致失眠，精神状态很差，减少1次行动机会...',
    condition: (attrs) => attrs.stress > 75,
    probability: 0.3,
    effects: { stress: 5, study: -3 },
    actionPenalty: 1
  },
  
  // 负面事件 - 学习相关
  {
    id: 'exam_fail',
    name: '考试不及格',
    description: '这次考试没考好，被老师批评了...',
    condition: (attrs) => attrs.study < 30,
    probability: 0.35,
    effects: { study: -5, stress: 10 }
  },
  {
    id: 'parent_pressure',
    name: '家长施压',
    description: '父母对你的成绩不满意，要求更加努力...',
    condition: (attrs) => attrs.study < 40,
    probability: 0.3,
    effects: { stress: 15 }
  },
  {
    id: 'homework_overload',
    name: '作业堆积',
    description: '作业太多来不及完成，被老师批评，减少1次行动机会...',
    condition: (attrs) => attrs.study < 35,
    probability: 0.25,
    effects: { study: -3, stress: 12 },
    actionPenalty: 1
  },
  
  // 负面事件 - 社交相关
  {
    id: 'bullied',
    name: '被欺负',
    description: '因为不善交际被同学欺负，心情很糟糕...',
    condition: (attrs) => attrs.social < 25,
    probability: 0.3,
    effects: { social: -5, stress: 15, study: -3 }
  },
  {
    id: 'lonely',
    name: '孤独感',
    description: '没有朋友，感到很孤独，影响了学习状态...',
    condition: (attrs) => attrs.social < 20,
    probability: 0.25,
    effects: { social: -3, stress: 10, study: -5 }
  },
  {
    id: 'conflict',
    name: '同学矛盾',
    description: '和同学发生矛盾，心情很差...',
    condition: (attrs) => attrs.social < 30,
    probability: 0.2,
    effects: { social: -5, stress: 12 }
  },
  
  // 负面事件 - 综合
  {
    id: 'phone_addiction',
    name: '手机成瘾',
    description: '沉迷手机游戏，荒废了学业...',
    condition: (attrs) => attrs.stress > 60 && attrs.study < 40,
    probability: 0.25,
    effects: { study: -10, stress: -5 }
  },
  {
    id: 'family_issue',
    name: '家庭问题',
    description: '家里出现了一些问题，影响了你的状态...',
    probability: 0.15,
    effects: { study: -5, stress: 15, social: -3 }
  },
  {
    id: 'bad_weather',
    name: '恶劣天气',
    description: '连续阴雨天气，心情低落，减少1次行动机会...',
    probability: 0.2,
    effects: { stress: 8 },
    actionPenalty: 1
  },
  {
    id: 'equipment_broken',
    name: '学习用品损坏',
    description: '重要的学习用品坏了，影响学习进度...',
    probability: 0.15,
    effects: { study: -5, stress: 8 }
  },
  {
    id: 'distraction',
    name: '注意力分散',
    description: '最近总是无法集中注意力，学习效率很低...',
    condition: (attrs) => attrs.stress > 50,
    probability: 0.25,
    effects: { study: -8, stress: 5 }
  }
];

// 学期目标配置
export const TERM_GOALS = [
  {
    id: 'study_boost',
    name: '学习进步',
    description: '学习属性提升15点',
    check: (startAttrs, currentAttrs) => currentAttrs.study - startAttrs.study >= 15,
    reward: { money: 50, study: 5 }
  },
  {
    id: 'sports_boost',
    name: '强身健体',
    description: '体育属性提升15点',
    check: (startAttrs, currentAttrs) => currentAttrs.sports - startAttrs.sports >= 15,
    reward: { money: 50, sports: 5 }
  },
  {
    id: 'art_boost',
    name: '艺术修养',
    description: '艺术属性提升15点',
    check: (startAttrs, currentAttrs) => currentAttrs.art - startAttrs.art >= 15,
    reward: { money: 50, art: 5 }
  },
  {
    id: 'social_boost',
    name: '社交达人',
    description: '社交属性提升15点',
    check: (startAttrs, currentAttrs) => currentAttrs.social - startAttrs.social >= 15,
    reward: { money: 50, social: 5 }
  },
  {
    id: 'stress_control',
    name: '压力管理',
    description: '学期结束时压力低于30',
    check: (startAttrs, currentAttrs) => currentAttrs.stress < 30,
    reward: { money: 60, stress: -10 }
  },
  {
    id: 'balanced_growth',
    name: '均衡发展',
    description: '所有属性都提升5点以上',
    check: (startAttrs, currentAttrs) => {
      return (currentAttrs.study - startAttrs.study >= 5) &&
             (currentAttrs.sports - startAttrs.sports >= 5) &&
             (currentAttrs.art - startAttrs.art >= 5) &&
             (currentAttrs.social - startAttrs.social >= 5);
    },
    reward: { money: 80, study: 3, sports: 3, art: 3, social: 3 }
  },
  {
    id: 'high_score',
    name: '追求卓越',
    description: '学期分数达到300以上',
    check: (startAttrs, currentAttrs, score) => score >= 300,
    reward: { money: 100, study: 5, stress: -5 }
  },
  {
    id: 'no_stress_increase',
    name: '轻松学习',
    description: '压力不增加或降低',
    check: (startAttrs, currentAttrs) => currentAttrs.stress <= startAttrs.stress,
    reward: { money: 70, stress: -10 }
  }
];

// 物品配置
export const ITEMS = [
  {
    id: 'reference_book',
    name: '参考书',
    icon: '📖',
    description: '提升学习效率10%',
    price: 80,
    effect: { studyBonus: 0.1 },
    category: 'study'
  },
  {
    id: 'sports_shoes',
    name: '运动鞋',
    icon: '👟',
    description: '提升体育效率10%',
    price: 80,
    effect: { sportsBonus: 0.1 },
    category: 'sports'
  },
  {
    id: 'art_supplies',
    name: '画具套装',
    icon: '🎨',
    description: '提升艺术效率10%',
    price: 80,
    effect: { artBonus: 0.1 },
    category: 'art'
  },
  {
    id: 'phone',
    name: '智能手机',
    icon: '📱',
    description: '提升社交效率10%',
    price: 80,
    effect: { socialBonus: 0.1 },
    category: 'social'
  },
  {
    id: 'stress_ball',
    name: '减压球',
    icon: '⚽',
    description: '压力恢复效果+15%',
    price: 60,
    effect: { stressRecovery: 0.15 },
    category: 'stress'
  },
  {
    id: 'energy_drink',
    name: '能量饮料',
    icon: '🥤',
    description: '所有行动效果+5%',
    price: 100,
    effect: { allBonus: 0.05 },
    category: 'all'
  },
  {
    id: 'lucky_charm',
    name: '幸运符',
    icon: '🍀',
    description: '减少负面事件概率',
    price: 120,
    effect: { luckBonus: 0.3 },
    category: 'special'
  },
  {
    id: 'study_desk',
    name: '学习桌',
    icon: '🪑',
    description: '学习效率+15%，压力增长-10%',
    price: 150,
    effect: { studyBonus: 0.15, stressPenalty: -0.1 },
    category: 'study'
  },
  {
    id: 'music_player',
    name: '音乐播放器',
    icon: '🎵',
    description: '艺术+10%，压力恢复+10%',
    price: 100,
    effect: { artBonus: 0.1, stressRecovery: 0.1 },
    category: 'art'
  },
  {
    id: 'fitness_tracker',
    name: '运动手环',
    icon: '⌚',
    description: '体育+15%，生病概率-20%',
    price: 130,
    effect: { sportsBonus: 0.15, sickResistance: 0.2 },
    category: 'sports'
  }
];
