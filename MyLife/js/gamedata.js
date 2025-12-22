import { GAME_CONFIG, TALENTS, ACHIEVEMENTS } from './config';

let instance;

/**
 * 游戏数据管理器
 */
export default class GameData {
  constructor() {
    if (instance) return instance;
    instance = this;
    this.reset();
  }

  reset() {
    // 当前学期索引
    this.currentTermIndex = 0;
    
    // 当前学期剩余行动次数
    this.remainingActions = GAME_CONFIG.ACTIONS_PER_TERM;
    
    // 角色属性
    this.attributes = { ...GAME_CONFIG.INITIAL_ATTRIBUTES };
    
    // 选择的天赋
    this.selectedTalent = null;
    
    // 游戏状态
    this.isGameOver = false;
    this.isTermEnd = false;
    this.talentSelected = false;
    
    // 当前事件
    this.currentEvent = null;
    
    // 历史记录
    this.history = [];
    
    // 考试成绩记录
    this.examScores = {};
    
    // 成就系统
    this.unlockedAchievements = [];
    this.pendingAchievements = []; // 待显示的成就
    
    // 学期成绩记录
    this.lastTermScore = 0;
    this.lastTermGrade = '';
    this.previousTermGrade = '';
  }

  // 选择天赋
  selectTalent(talentId) {
    const talent = TALENTS.find(t => t.id === talentId);
    if (!talent) return;
    
    this.selectedTalent = talent;
    this.talentSelected = true;
    
    // 应用初始加成
    if (talent.effects.initialBonus) {
      Object.keys(talent.effects.initialBonus).forEach(key => {
        this.attributes[key] += talent.effects.initialBonus[key];
      });
    }
  }

  // 获取天赋效果
  getTalentEffect(effectType) {
    if (!this.selectedTalent) return 0;
    return this.selectedTalent.effects[effectType] || 0;
  }

  // 检查是否有天赋
  hasTalent(talentId) {
    return this.selectedTalent && this.selectedTalent.id === talentId;
  }

  // 获取当前学期名称
  getCurrentTerm() {
    return GAME_CONFIG.TERMS[this.currentTermIndex];
  }

  // 是否是最后一个学期
  isLastTerm() {
    return this.currentTermIndex >= GAME_CONFIG.TERMS.length - 1;
  }

  // 计算最终总分
  calculateFinalScore() {
    const { study, sports, art, social } = this.attributes;
    // 学习占比最大，其他属性也有贡献
    return Math.floor(study * 3 + sports * 1.5 + art * 1.5 + social * 1.5);
  }

  // 根据分数获取大学等级
  getUniversityLevel(score) {
    if (score >= 600) {
      return {
        level: '985名校',
        name: '清华大学',
        color: '#FFD700',
        description: '恭喜你！考入了顶尖名校！'
      };
    }
    if (score >= 500) {
      return {
        level: '211重点',
        name: '重点大学',
        color: '#4A90E2',
        description: '很棒！进入了重点大学！'
      };
    }
    if (score >= 400) {
      return {
        level: '一本',
        name: '普通本科',
        color: '#2ECC71',
        description: '不错！考上了本科大学！'
      };
    }
    if (score >= 300) {
      return {
        level: '二本',
        name: '二本院校',
        color: '#95A5A6',
        description: '还可以，继续努力！'
      };
    }
    if (score >= 200) {
      return {
        level: '专科',
        name: '专科院校',
        color: '#E67E22',
        description: '加油，未来还有机会！'
      };
    }
    return {
      level: '落榜',
      name: '复读或就业',
      color: '#E74C3C',
      description: '没关系，人生还有很多可能！'
    };
  }

  // 执行行动
  performAction(actionEffects) {
    // 复制效果
    const effects = { ...actionEffects };
    
    // 应用天赋加成
    Object.keys(effects).forEach(key => {
      let bonus = 0;
      
      // 全面发展天赋
      if (this.getTalentEffect('allBonus')) {
        bonus += this.getTalentEffect('allBonus');
      }
      
      // 特定属性加成
      if (key === 'study' && this.getTalentEffect('studyBonus')) {
        bonus += this.getTalentEffect('studyBonus');
      } else if (key === 'study' && this.getTalentEffect('studyPenalty')) {
        bonus -= this.getTalentEffect('studyPenalty');
      }
      
      if (key === 'sports' && this.getTalentEffect('sportsBonus')) {
        bonus += this.getTalentEffect('sportsBonus');
      }
      
      if (key === 'art' && this.getTalentEffect('artBonus')) {
        bonus += this.getTalentEffect('artBonus');
      }
      
      if (key === 'social' && this.getTalentEffect('socialBonus')) {
        bonus += this.getTalentEffect('socialBonus');
      }
      
      // 压力相关
      if (key === 'stress') {
        if (effects[key] > 0) {
          // 压力增长
          const stressPenalty = this.getTalentEffect('stressPenalty') || 0;
          bonus += stressPenalty;
        } else {
          // 压力恢复
          const stressRecovery = this.getTalentEffect('stressRecovery') || 0;
          bonus -= stressRecovery; // 负值变得更负，恢复更多
        }
      }
      
      // 应用加成
      if (bonus !== 0) {
        effects[key] = Math.round(effects[key] * (1 + bonus));
      }
    });
    
    // 应用效果
    Object.keys(effects).forEach(key => {
      this.attributes[key] = Math.max(0, this.attributes[key] + effects[key]);
    });

    // 压力上限检查
    if (this.attributes.stress > GAME_CONFIG.MAX_STRESS) {
      this.attributes.stress = GAME_CONFIG.MAX_STRESS;
    }

    // 减少行动次数
    this.remainingActions--;

    // 检查是否学期结束
    if (this.remainingActions <= 0) {
      this.isTermEnd = true;
    }

    return this.attributes;
  }

  // 应用行动惩罚（减少行动次数）
  applyActionPenalty(penalty) {
    this.remainingActions = Math.max(0, this.remainingActions - penalty);
    
    // 检查是否学期结束
    if (this.remainingActions <= 0) {
      this.isTermEnd = true;
    }
  }

  // 进入下一学期
  nextTerm() {
    this.currentTermIndex++;
    this.remainingActions = GAME_CONFIG.ACTIONS_PER_TERM;
    this.isTermEnd = false;

    // 每学期开始时稍微降低压力
    this.attributes.stress = Math.max(0, this.attributes.stress - 10);
    
    // 应用属性衰减
    this.applyAttributeDecay();
    
    // 检查是否到达最后一个学期（高三结束）
    if (this.currentTermIndex >= GAME_CONFIG.TERMS.length) {
      this.isGameOver = true;
    }
  }

  // 应用属性衰减
  applyAttributeDecay() {
    const decay = GAME_CONFIG.ATTRIBUTE_DECAY;
    const decayReduction = this.getTalentEffect('decayReduction') || 0;
    
    Object.keys(decay).forEach(key => {
      const actualDecay = Math.round(decay[key] * (1 - decayReduction));
      this.attributes[key] = Math.max(0, this.attributes[key] - actualDecay);
    });
  }

  // 检查是否是关键考试学期
  isKeyExam() {
    return GAME_CONFIG.KEY_EXAMS.hasOwnProperty(this.currentTermIndex);
  }

  // 获取关键考试信息
  getKeyExamInfo() {
    return GAME_CONFIG.KEY_EXAMS[this.currentTermIndex];
  }

  // 计算学期成绩
  calculateTermScore() {
    const { study, sports, art, social, stress } = this.attributes;
    
    // 基础分数
    let score = study * 2 + sports + art + social;
    
    // 压力惩罚
    if (stress > GAME_CONFIG.STRESS_WARNING) {
      score *= 0.8;
    }
    
    // 关键考试加权
    if (this.isKeyExam()) {
      const examInfo = this.getKeyExamInfo();
      score *= examInfo.weight;
    }
    
    return Math.floor(score);
  }

  // 记录考试成绩
  recordExamScore(score) {
    // 记录上一次成绩
    this.previousTermGrade = this.lastTermGrade;
    this.lastTermScore = score;
    this.lastTermGrade = this.getGrade(score).grade;
    
    if (this.isKeyExam()) {
      const examInfo = this.getKeyExamInfo();
      this.examScores[examInfo.name] = score;
    }
  }

  // 检查并解锁成就
  checkAchievements() {
    const newAchievements = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      // 如果已经解锁，跳过
      if (this.unlockedAchievements.includes(achievement.id)) {
        return;
      }
      
      // 检查条件
      if (achievement.condition(this)) {
        this.unlockedAchievements.push(achievement.id);
        newAchievements.push(achievement);
        
        // 应用奖励
        if (achievement.reward) {
          Object.keys(achievement.reward).forEach(key => {
            this.attributes[key] = Math.max(0, this.attributes[key] + achievement.reward[key]);
          });
        }
      }
    });
    
    return newAchievements;
  }

  // 获取已解锁成就数量
  getAchievementCount() {
    return this.unlockedAchievements.length;
  }

  // 获取成就完成度
  getAchievementProgress() {
    return `${this.unlockedAchievements.length}/${ACHIEVEMENTS.length}`;
  }

  // 获取评价等级
  getGrade(score) {
    if (score >= 300) return { grade: 'S', text: '优秀', color: '#FFD700' };
    if (score >= 250) return { grade: 'A', text: '良好', color: '#4A90E2' };
    if (score >= 200) return { grade: 'B', text: '中等', color: '#2ECC71' };
    if (score >= 150) return { grade: 'C', text: '及格', color: '#95A5A6' };
    return { grade: 'D', text: '不及格', color: '#E74C3C' };
  }
}
