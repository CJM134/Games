import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

/**
 * 行动反馈提示类
 */
export default class ActionFeedback {
  constructor() {
    this.visible = false;
    this.effects = null;
    this.alpha = 0;
    this.targetAlpha = 0;
    this.y = SCREEN_HEIGHT / 2 - 120;
    this.targetY = SCREEN_HEIGHT / 2 - 120;
    this.displayTime = 0;
    this.maxDisplayTime = 2000; // 显示2秒
  }

  // 显示反馈
  show(effects) {
    this.effects = effects;
    this.visible = true;
    this.targetAlpha = 1;
    this.y = SCREEN_HEIGHT / 2 - 100;
    this.targetY = SCREEN_HEIGHT / 2 - 120;
    this.displayTime = 0;
  }

  // 隐藏反馈
  hide() {
    this.targetAlpha = 0;
    setTimeout(() => {
      this.visible = false;
      this.effects = null;
    }, 300);
  }

  // 更新
  update() {
    if (!this.visible && this.alpha <= 0) return;

    // 平滑透明度变化
    this.alpha += (this.targetAlpha - this.alpha) * 0.15;

    // 平滑位置变化
    this.y += (this.targetY - this.y) * 0.1;

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
    if (!this.effects) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    // 构建反馈文本
    const feedbackTexts = [];
    const attrNames = {
      study: '学习',
      sports: '体育',
      art: '艺术',
      social: '社交',
      stress: '压力'
    };

    Object.keys(this.effects).forEach(key => {
      const value = this.effects[key];
      if (value !== 0) {
        const sign = value > 0 ? '+' : '';
        const color = value > 0 ? '#2ECC71' : '#E74C3C';
        feedbackTexts.push({
          text: `${attrNames[key]} ${sign}${value}`,
          color: color
        });
      }
    });

    if (feedbackTexts.length === 0) {
      ctx.restore();
      return;
    }

    // 绘制背景
    const padding = 15;
    const lineHeight = 25;
    const bgWidth = 200;
    const bgHeight = feedbackTexts.length * lineHeight + padding * 2;
    const bgX = SCREEN_WIDTH / 2 - bgWidth / 2;
    const bgY = this.y;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight, 10);
    ctx.fill();

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 绘制反馈文本
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    feedbackTexts.forEach((item, index) => {
      ctx.fillStyle = item.color;
      const textY = bgY + padding + lineHeight / 2 + index * lineHeight;
      ctx.fillText(item.text, SCREEN_WIDTH / 2, textY);
    });

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
