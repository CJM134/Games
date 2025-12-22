import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Emitter from '../libs/tinyemitter';

/**
 * 成就解锁弹窗
 */
export default class AchievementPopup extends Emitter {
  constructor() {
    super();
    this.visible = false;
    this.achievement = null;
    this.alpha = 0;
    this.targetAlpha = 0;
    this.y = -100;
    this.targetY = 80;
    this.displayTime = 0;
    this.maxDisplayTime = 3000; // 显示3秒
  }

  // 显示成就
  show(achievement) {
    this.achievement = achievement;
    this.visible = true;
    this.targetAlpha = 1;
    this.y = -100;
    this.targetY = 80;
    this.displayTime = 0;
  }

  // 隐藏成就
  hide() {
    this.targetAlpha = 0;
    this.targetY = -100;
    setTimeout(() => {
      this.visible = false;
      this.achievement = null;
    }, 500);
  }

  // 更新
  update() {
    if (!this.visible && this.alpha <= 0) return;

    // 平滑透明度变化
    this.alpha += (this.targetAlpha - this.alpha) * 0.15;

    // 平滑位置变化
    this.y += (this.targetY - this.y) * 0.15;

    // 计时自动隐藏
    if (this.visible && this.targetAlpha === 1) {
      this.displayTime += 16; // 约60fps
      if (this.displayTime >= this.maxDisplayTime) {
        this.hide();
      }
    }
  }

  // 渲染
  render(ctx) {
    if (!this.visible && this.alpha <= 0) return;
    if (!this.achievement) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    // 弹窗背景
    const width = 280;
    const height = 100;
    const x = SCREEN_WIDTH / 2 - width / 2;
    const y = this.y;

    // 背景
    ctx.fillStyle = this.achievement.color || '#2C3E50';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    this.roundRect(ctx, x, y, width, height, 12);
    ctx.fill();

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 成就解锁标题
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🎉 成就解锁', x + 15, y + 25);

    // 图标
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.achievement.icon, x + 50, y + 65);

    // 成就名称
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(this.achievement.name, x + 80, y + 50);

    // 成就描述
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Arial';
    ctx.fillText(this.achievement.description, x + 80, y + 70);

    // 奖励提示
    if (this.achievement.reward) {
      const rewards = [];
      Object.keys(this.achievement.reward).forEach(key => {
        const value = this.achievement.reward[key];
        const sign = value > 0 ? '+' : '';
        const names = {
          study: '学习',
          sports: '体育',
          art: '艺术',
          social: '社交',
          stress: '压力'
        };
        rewards.push(`${names[key]}${sign}${value}`);
      });
      
      ctx.fillStyle = '#FFD700';
      ctx.font = '11px Arial';
      ctx.fillText(`奖励: ${rewards.join(' ')}`, x + 80, y + 85);
    }

    ctx.restore();
  }

  // 绘制圆角矩形
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
