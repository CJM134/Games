import Emitter from '../libs/tinyemitter';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

export default class GameInfo extends Emitter {
  showHistory = false; // 是否显示历史记录

  constructor() {
    super();

    this.btnArea = {
      startX: SCREEN_WIDTH / 2 - 60,
      startY: SCREEN_HEIGHT - 120,
      endX: SCREEN_WIDTH / 2 + 60,
      endY: SCREEN_HEIGHT - 70,
    };

    this.historyBtnArea = {
      startX: SCREEN_WIDTH / 2 - 60,
      startY: SCREEN_HEIGHT - 180,
      endX: SCREEN_WIDTH / 2 + 60,
      endY: SCREEN_HEIGHT - 130,
    };

    // 返回按钮区域（左上角）
    this.backBtnArea = {
      startX: 10,
      startY: 10,
      endX: 90,
      endY: 50,
    };

    // 绑定触摸事件
    wx.onTouchStart(this.touchEventHandler.bind(this))
  }

  render(ctx) {
    // 如果显示历史记录，只渲染历史记录界面
    if (this.showHistory) {
      this.renderHistory(ctx);
      return;
    }

    this.renderGameScore(ctx); // 绘制分数信息

    // 游戏结束时显示游戏结束画面
    if (GameGlobal.databus.isGameOver) {
      this.renderGameOver(ctx);
    }
  }

  renderGameScore(ctx) {
    const score = GameGlobal.databus.score;
    const bestScore = GameGlobal.databus.bestScore;
    
    // 绘制当前分数背景
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(20, 85, 90, 45);
    
    // 绘制当前分数标签
    ctx.fillStyle = '#eee4da';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('分数', 65, 100);
    
    // 绘制当前分数值
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(score, 65, 122);
    
    // 绘制最高分背景
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(SCREEN_WIDTH - 110, 85, 90, 45);
    
    // 绘制最高分标签
    ctx.fillStyle = '#eee4da';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('最高分', SCREEN_WIDTH - 65, 100);
    
    // 绘制最高分值
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(bestScore, SCREEN_WIDTH - 65, 122);
    
    // 显示难度提示
    this.renderDifficultyHint(ctx, score);
  }

  renderDifficultyHint(ctx, score) {
    let difficultyText = '';
    let difficultyColor = '#776e65';
    
    if (score >= 500) {
      difficultyText = '🔥 困难模式：+2个方块(4/8)';
      difficultyColor = '#f67c5f';
    } else if (score >= 300) {
      difficultyText = '⚡ 中等模式：+2个方块(2/4)';
      difficultyColor = '#f59563';
    } else if (score >= 200) {
      difficultyText = `💪 再得${300 - score}分进入中等模式`;
      difficultyColor = '#f2b179';
    }
    
    if (difficultyText) {
      ctx.fillStyle = difficultyColor;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(difficultyText, SCREEN_WIDTH / 2, 145);
    }
  }

  renderGameOver(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(238, 228, 218, 0.73)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // 游戏结束文字
    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 80);
    
    // 最终分数
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`得分: ${GameGlobal.databus.score}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);
    
    // 查看记录按钮
    this.drawHistoryButton(ctx);
    
    // 重新开始按钮
    this.drawRestartButton(ctx);
  }

  drawHistoryButton(ctx) {
    ctx.fillStyle = '#8f7a66';
    ctx.fillRect(
      this.historyBtnArea.startX,
      this.historyBtnArea.startY,
      120,
      50
    );
    
    ctx.fillStyle = '#f9f6f2';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      '查看记录',
      SCREEN_WIDTH / 2,
      this.historyBtnArea.startY + 32
    );
  }

  renderHistory(ctx) {
    // 背景
    ctx.fillStyle = '#faf8ef';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // 标题
    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('历史记录', SCREEN_WIDTH / 2, 50);
    
    // 返回按钮（左上角）
    ctx.fillStyle = '#8f7a66';
    ctx.fillRect(10, 10, 80, 40);
    ctx.fillStyle = '#f9f6f2';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← 返回', 50, 35);
    
    // 获取历史记录
    const history = GameGlobal.databus.scoreHistory;
    
    if (history.length === 0) {
      ctx.fillStyle = '#776e65';
      ctx.font = '20px Arial';
      ctx.fillText('暂无记录', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
      return;
    }
    
    // 显示记录列表
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    
    const startY = 90;
    const lineHeight = 35;
    const maxDisplay = Math.min(history.length, 12);
    
    for (let i = 0; i < maxDisplay; i++) {
      const record = history[i];
      const y = startY + i * lineHeight;
      
      // 背景
      ctx.fillStyle = i % 2 === 0 ? '#eee4da' : '#ede0c8';
      ctx.fillRect(20, y - 22, SCREEN_WIDTH - 40, 30);
      
      // 排名
      ctx.fillStyle = '#776e65';
      ctx.fillText(`${i + 1}.`, 30, y);
      
      // 分数
      ctx.fillStyle = '#f67c5f';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`${record.score}分`, 70, y);
      
      // 日期
      ctx.fillStyle = '#776e65';
      ctx.font = '14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(record.date, SCREEN_WIDTH - 30, y);
      ctx.textAlign = 'left';
      ctx.font = 'bold 16px Arial';
    }
    
    // 统计信息
    const topScores = GameGlobal.databus.getTopScores(3);
    if (topScores.length > 0) {
      const statsY = startY + maxDisplay * lineHeight + 30;
      
      ctx.fillStyle = '#776e65';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 最高分排行', SCREEN_WIDTH / 2, statsY);
      
      ctx.font = '16px Arial';
      for (let i = 0; i < Math.min(topScores.length, 3); i++) {
        const medal = ['🥇', '🥈', '🥉'][i];
        ctx.fillText(
          `${medal} ${topScores[i].score}分`,
          SCREEN_WIDTH / 2,
          statsY + 30 + i * 25
        );
      }
    }
  }

  drawRestartButton(ctx) {
    ctx.fillStyle = '#8f7a66';
    ctx.fillRect(
      this.btnArea.startX,
      this.btnArea.startY,
      120,
      50
    );
    
    ctx.fillStyle = '#f9f6f2';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      '重新开始',
      SCREEN_WIDTH / 2,
      this.btnArea.startY + 32
    );
  }

  touchEventHandler(event) {
    const { clientX, clientY } = event.touches[0];

    // 如果在历史记录界面
    if (this.showHistory) {
      // 检查返回按钮
      if (
        clientX >= this.backBtnArea.startX &&
        clientX <= this.backBtnArea.endX &&
        clientY >= this.backBtnArea.startY &&
        clientY <= this.backBtnArea.endY
      ) {
        console.log('点击返回按钮');
        this.showHistory = false;
      }
      return;
    }

    // 游戏结束时处理按钮点击
    if (GameGlobal.databus.isGameOver) {
      // 重新开始按钮
      if (
        clientX >= this.btnArea.startX &&
        clientX <= this.btnArea.endX &&
        clientY >= this.btnArea.startY &&
        clientY <= this.btnArea.endY
      ) {
        console.log('点击重新开始按钮');
        this.emit('restart');
      }
      
      // 查看记录按钮
      if (
        clientX >= this.historyBtnArea.startX &&
        clientX <= this.historyBtnArea.endX &&
        clientY >= this.historyBtnArea.startY &&
        clientY <= this.historyBtnArea.endY
      ) {
        console.log('点击查看记录按钮');
        this.showHistory = true;
      }
    }
  }
}
