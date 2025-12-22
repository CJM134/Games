import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { ACTION_CARDS, GAME_CONFIG } from '../config';
import ActionCard from './actioncard';
import CharacterModel from './charactermodel';
import ActionFeedback from './actionfeedback';
import Emitter from '../libs/tinyemitter';

/**
 * 游戏UI管理类
 */
export default class GameUI extends Emitter {
  constructor() {
    super();
    
    this.actionCards = [];
    this.pressedCard = null;
    
    // 创建人物模型
    this.character = new CharacterModel();
    
    // 创建行动反馈
    this.actionFeedback = new ActionFeedback();
    
    // 创建行动卡片
    this.createActionCards();
    
    // 初始化事件
    this.initEvent();
    
    // UI状态
    this.showTermEnd = false;
    this.showGameOver = false;
    this.termScore = 0;
    this.termGrade = null;
  }

  // 创建行动卡片
  createActionCards() {
    const cardWidth = 90;
    const cardHeight = 80;
    const padding = 8;
    const startY = SCREEN_HEIGHT - 170;
    
    // 计算每行显示的卡片数
    const cardsPerRow = 3;
    const totalWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * padding;
    const startX = (SCREEN_WIDTH - totalWidth) / 2;

    ACTION_CARDS.forEach((config, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);
      
      this.actionCards.push(new ActionCard(config, x, y, cardWidth, cardHeight));
    });
  }

  // 显示行动反馈
  showActionFeedback(effects) {
    this.actionFeedback.show(effects);
    this.character.playAction();
  }

  // 初始化事件
  initEvent() {
    wx.onTouchStart((e) => {
      const { clientX: x, clientY: y } = e.touches[0];
      
      // 检查是否点击了卡片
      for (const card of this.actionCards) {
        if (card.checkClick(x, y)) {
          this.pressedCard = card;
          card.setPressed(true);
          break;
        }
      }

      // 检查是否点击了学期结束按钮
      if (this.showTermEnd) {
        if (this.checkNextTermButton(x, y)) {
          this.emit('nextTerm');
          this.showTermEnd = false;
        }
      }

      // 检查是否点击了游戏结束重新开始按钮
      if (this.showGameOver) {
        if (this.checkRestartButton(x, y)) {
          this.emit('restart');
          this.showGameOver = false;
        }
      }
    });

    wx.onTouchEnd((e) => {
      if (this.pressedCard) {
        const { clientX: x, clientY: y } = e.changedTouches[0];
        
        // 检查是否仍在卡片范围内
        if (this.pressedCard.checkClick(x, y)) {
          this.emit('actionSelected', this.pressedCard.config);
        }
        
        this.pressedCard.setPressed(false);
        this.pressedCard = null;
      }
    });
  }

  // 显示学期结束界面
  showTermEndScreen(score, grade) {
    this.showTermEnd = true;
    this.termScore = score;
    this.termGrade = grade;
  }

  // 显示游戏结束界面
  showGameOverScreen(totalScore) {
    this.showGameOver = true;
    this.totalScore = totalScore;
  }

  // 显示属性衰减提示
  showDecayWarning() {
    // 可以在这里添加衰减提示的UI
    // 暂时不实现，让玩家自己发现
  }

  // 检查下一学期按钮
  checkNextTermButton(x, y) {
    const btnX = SCREEN_WIDTH / 2 - 60;
    const btnY = SCREEN_HEIGHT / 2 + 100;
    const btnW = 120;
    const btnH = 40;
    return x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH;
  }

  // 检查重新开始按钮
  checkRestartButton(x, y) {
    const btnX = SCREEN_WIDTH / 2 - 60;
    const btnY = SCREEN_HEIGHT - 100;
    const btnW = 120;
    const btnH = 40;
    return x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH;
  }

  // 更新
  update() {
    this.actionCards.forEach(card => card.update());
    this.character.update();
    this.actionFeedback.update();
  }

  // 渲染
  render(ctx, gameData) {
    // 渲染顶部信息栏
    this.renderTopBar(ctx, gameData);
    
    // 渲染人物模型
    this.character.render(ctx);
    
    // 渲染属性面板（在底部）
    this.renderAttributes(ctx, gameData);
    
    // 渲染行动卡片
    if (!this.showTermEnd && !this.showGameOver) {
      this.actionCards.forEach(card => card.render(ctx));
    }
    
    // 渲染行动反馈
    this.actionFeedback.render(ctx);
    
    // 渲染学期结束界面
    if (this.showTermEnd) {
      this.renderTermEndScreen(ctx, gameData);
    }
    
    // 渲染游戏结束界面
    if (this.showGameOver) {
      this.renderGameOverScreen(ctx, gameData);
    }
  }

  // 渲染顶部信息栏
  renderTopBar(ctx, gameData) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, 60);
    
    // 左侧：学期信息
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(gameData.getCurrentTerm(), 15, 25);
    
    ctx.font = '14px Arial';
    ctx.fillText(`剩余行动: ${gameData.remainingActions}`, 15, 45);
    
    // 右侧：当前分数
    const currentScore = gameData.calculateTermScore();
    ctx.textAlign = 'right';
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`${currentScore}`, SCREEN_WIDTH - 15, 25);
    
    ctx.font = '11px Arial';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText('当前分数', SCREEN_WIDTH - 15, 42);
    
    // 成就数量
    ctx.font = '10px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`🏆 ${gameData.getAchievementProgress()}`, SCREEN_WIDTH - 15, 55);
  }

  // 渲染属性面板（底部小字显示）
  renderAttributes(ctx, gameData) {
    const attrs = gameData.attributes;
    const attrConfig = [
      { key: 'study', name: '学习', icon: '📚', color: '#4A90E2' },
      { key: 'sports', name: '体育', icon: '⚽', color: '#E24A4A' },
      { key: 'art', name: '艺术', icon: '🎨', color: '#9B59B6' },
      { key: 'social', name: '社交', icon: '👥', color: '#2ECC71' },
      { key: 'stress', name: '压力', icon: '😰', color: '#E67E22' }
    ];

    const startY = SCREEN_HEIGHT - 260;
    const itemWidth = (SCREEN_WIDTH - 40) / 5;

    attrConfig.forEach((config, index) => {
      const x = 20 + index * itemWidth;
      const value = attrs[config.key];
      
      // 图标
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(config.icon, x + itemWidth / 2, startY);
      
      // 属性名称
      ctx.fillStyle = '#666666';
      ctx.font = '11px Arial';
      ctx.fillText(config.name, x + itemWidth / 2, startY + 20);
      
      // 属性值
      ctx.fillStyle = config.key === 'stress' && value > GAME_CONFIG.STRESS_WARNING 
        ? '#E74C3C' : config.color;
      ctx.font = 'bold 14px Arial';
      ctx.fillText(value, x + itemWidth / 2, startY + 38);
      
      // 小进度条
      const barX = x + 5;
      const barY = startY + 45;
      const barWidth = itemWidth - 10;
      const barHeight = 4;
      
      // 背景
      ctx.fillStyle = '#E0E0E0';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // 进度
      const maxValue = config.key === 'stress' ? GAME_CONFIG.MAX_STRESS : 100;
      const progress = Math.min(value / maxValue, 1);
      ctx.fillStyle = config.color;
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    });
  }

  // 渲染学期结束界面
  renderTermEndScreen(ctx, gameData) {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // 检查是否是关键考试
    const isKeyExam = gameData.isKeyExam();
    const examInfo = isKeyExam ? gameData.getKeyExamInfo() : null;
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    const title = isKeyExam ? examInfo.name : '学期结束';
    ctx.fillText(title, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 100);
    
    if (isKeyExam) {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.fillText('⭐ 关键考试 ⭐', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 75);
    }
    
    // 成绩
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = this.termGrade.color;
    ctx.fillText(this.termGrade.grade, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(this.termGrade.text, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 20);
    ctx.fillText(`分数: ${this.termScore}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50);
    
    // 关键考试额外提示
    if (isKeyExam) {
      ctx.font = '12px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`(分数已按 ${examInfo.weight}x 加权计算)`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 70);
    }
    
    // 下一学期按钮
    const btnText = gameData.isLastTerm() ? '查看结果' : '下一学期';
    this.renderButton(ctx, SCREEN_WIDTH / 2 - 60, SCREEN_HEIGHT / 2 + 100, 120, 40, btnText, '#4A90E2');
  }

  // 渲染游戏结束界面
  renderGameOverScreen(ctx, gameData) {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('高中毕业！', SCREEN_WIDTH / 2, 70);
    
    // 计算最终分数和大学等级
    const finalScore = gameData.calculateFinalScore();
    const university = gameData.getUniversityLevel(finalScore);
    
    // 大学等级
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = university.color;
    ctx.fillText(university.level, SCREEN_WIDTH / 2, 130);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(university.name, SCREEN_WIDTH / 2, 165);
    
    // 描述
    ctx.font = '16px Arial';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText(university.description, SCREEN_WIDTH / 2, 195);
    
    // 分数
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`总分: ${finalScore}`, SCREEN_WIDTH / 2, 230);
    
    // 关键考试成绩
    ctx.font = '14px Arial';
    ctx.fillStyle = '#FFFFFF';
    let examY = 260;
    Object.keys(gameData.examScores).forEach(examName => {
      const score = gameData.examScores[examName];
      ctx.fillText(`${examName}: ${score}分`, SCREEN_WIDTH / 2, examY);
      examY += 25;
    });
    
    // 最终属性
    ctx.font = '14px Arial';
    const attrs = gameData.attributes;
    const lines = [
      `📚 学习: ${attrs.study}`,
      `⚽ 体育: ${attrs.sports}`,
      `🎨 艺术: ${attrs.art}`,
      `👥 社交: ${attrs.social}`
    ];
    
    const startY = examY + 10;
    lines.forEach((line, index) => {
      ctx.fillText(line, SCREEN_WIDTH / 2, startY + index * 25);
    });
    
    // 天赋显示
    if (gameData.selectedTalent) {
      ctx.font = '12px Arial';
      ctx.fillStyle = gameData.selectedTalent.color;
      ctx.fillText(`${gameData.selectedTalent.icon} ${gameData.selectedTalent.name}`, 
        SCREEN_WIDTH / 2, startY + lines.length * 25 + 15);
    }
    
    // 评价
    ctx.font = '12px Arial';
    ctx.fillStyle = '#999999';
    const gradeText = this.getGradeComment(finalScore);
    ctx.fillText(gradeText, SCREEN_WIDTH / 2, SCREEN_HEIGHT - 130);
    
    // 重新开始按钮
    this.renderButton(ctx, SCREEN_WIDTH / 2 - 60, SCREEN_HEIGHT - 100, 120, 40, '重新开始', '#2ECC71');
  }

  // 获取评价文本
  getGradeComment(score) {
    if (score >= 600) return '你是父母的骄傲，老师的榜样！';
    if (score >= 500) return '优秀的成绩，光明的未来！';
    if (score >= 400) return '稳扎稳打，前途无量！';
    if (score >= 300) return '还不错，继续加油！';
    if (score >= 200) return '虽有遗憾，但未来可期！';
    return '人生不只有一条路，加油！';
  }

  // 渲染按钮
  renderButton(ctx, x, y, width, height, text, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
  }
}
