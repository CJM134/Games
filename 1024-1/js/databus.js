let instance;

/**
 * 全局状态管理器
 * 负责管理1024游戏的状态
 */
export default class DataBus {
  score = 0; // 当前分数
  bestScore = 0; // 最高分数
  isGameOver = false; // 游戏是否结束
  scoreHistory = []; // 分数历史记录

  constructor() {
    // 确保单例模式
    if (instance) return instance;

    // 从本地存储读取数据
    this.loadData();

    instance = this;
  }

  // 加载本地存储的数据
  loadData() {
    try {
      const saved = wx.getStorageSync('bestScore');
      if (saved) {
        this.bestScore = saved;
      }

      const history = wx.getStorageSync('scoreHistory');
      if (history) {
        this.scoreHistory = history;
      }
    } catch (e) {
      console.log('加载数据失败', e);
    }
  }

  // 保存数据到本地存储
  saveData() {
    try {
      wx.setStorageSync('bestScore', this.bestScore);
      wx.setStorageSync('scoreHistory', this.scoreHistory);
    } catch (e) {
      console.log('保存数据失败', e);
    }
  }

  // 重置游戏状态
  reset() {
    this.score = 0;
    this.isGameOver = false;
  }

  // 游戏结束
  gameOver() {
    if (this.isGameOver) {
      console.log('游戏已经结束，跳过重复调用');
      return; // 防止重复调用
    }
    
    console.log('触发游戏结束，当前分数:', this.score);
    this.isGameOver = true;
    
    // 更新最高分
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      console.log('新的最高分:', this.bestScore);
    }

    // 保存本局记录
    this.saveScoreRecord();
  }

  // 保存分数记录
  saveScoreRecord() {
    const record = {
      score: this.score,
      date: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: Date.now()
    };

    // 添加到历史记录
    this.scoreHistory.unshift(record);

    // 只保留最近20条记录
    if (this.scoreHistory.length > 20) {
      this.scoreHistory = this.scoreHistory.slice(0, 20);
    }

    // 保存到本地存储
    this.saveData();
  }

  // 获取排行榜（按分数排序）
  getTopScores(limit = 10) {
    return [...this.scoreHistory]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // 清除所有记录
  clearHistory() {
    this.scoreHistory = [];
    this.bestScore = 0;
    this.saveData();
  }
}
