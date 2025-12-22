import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Emitter from '../libs/tinyemitter';

/**
 * 事件弹窗类
 */
export default class EventPopup extends Emitter {
  constructor() {
    super();
    this.visible = false;
    this.event = null;
    this.alpha = 0;
    this.targetAlpha = 0;
    
    this.initEvent();
  }

  // 显示事件
  show(event) {
    this.event = event;
    this.visible = true;
    this.targetAlpha = 1;
  }

  // 隐藏事件
  hide() {
    this.targetAlpha = 0;
    setTimeout(() => {
      this.visible = false;
      this.event = null;
    }, 300);
  }

  // 检查是否正在显示
  isShowing() {
    return this.visible && this.alpha > 0.1;
  }

  // 初始化事件
  initEvent() {
    wx.onTouchStart((e) => {
      // 只有在弹窗完全显示时才能点击
      if (!this.visible || this.alpha < 0.95) return;
      
      const { clientX: x, clientY: y } = e.touches[0];
      
      // 检查是否点击了确认按钮
      if (this.checkConfirmButton(x, y)) {
        // 立即隐藏并触发确认
        this.visible = false;
        this.targetAlpha = 0;
        this.emit('confirm');
      }
    });
  }

  // 检查确认按钮
  checkConfirmButton(x, y) {
    const btnX = SCREEN_WIDTH / 2 - 50;
    const btnY = SCREEN_HEIGHT / 2 + 100;
    const btnW = 100;
    const btnH = 40;
    return x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH;
  }

  // 更新
  update() {
    if (!this.visible && this.alpha <= 0) return;
    
    // 平滑透明度变化
    this.alpha += (this.targetAlpha - this.alpha) * 0.15;
  }

  // 渲染
  render(ctx) {
    if (!this.visible && this.alpha <= 0) return;
    if (!this.event) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 弹窗背景
    const popupX = SCREEN_WIDTH / 2 - 140;
    const popupY = SCREEN_HEIGHT / 2 - 140;
    const popupW = 280;
    const popupH = 260;

    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    this.roundRect(ctx, popupX, popupY, popupW, popupH, 15);
    ctx.fill();

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 事件标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.event.name, SCREEN_WIDTH / 2, popupY + 45);

    // 事件描述
    ctx.fillStyle = '#666666';
    ctx.font = '15px Arial';
    this.wrapText(ctx, this.event.description, SCREEN_WIDTH / 2, popupY + 90, popupW - 40, 24);

    // 只有非选择类事件才显示效果
    if (this.event.effects && !this.event.hasChoice) {
      const effects = this.event.effects;
      const effectTexts = [];
      Object.keys(effects).forEach(key => {
        const value = effects[key];
        const sign = value > 0 ? '+' : '';
        const names = {
          study: '学习',
          sports: '体育',
          art: '艺术',
          social: '社交',
          stress: '压力'
        };
        const color = value > 0 ? '#2ECC71' : '#E74C3C';
        effectTexts.push({ text: `${names[key]} ${sign}${value}`, color });
      });

      // 行动惩罚提示
      if (this.event.actionPenalty && this.event.actionPenalty > 0) {
        effectTexts.push({ 
          text: `⚠️ 行动次数 -${this.event.actionPenalty}`, 
          color: '#E74C3C' 
        });
      }

      // 绘制效果
      const effectStartY = popupY + 160;
      effectTexts.forEach((item, index) => {
        ctx.fillStyle = item.color;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(item.text, SCREEN_WIDTH / 2, effectStartY + index * 22);
      });
    }

    // 确认按钮（只对非选择类事件显示）
    if (!this.event.hasChoice) {
      const btnX = SCREEN_WIDTH / 2 - 50;
      const btnY = SCREEN_HEIGHT / 2 + 100;
      ctx.fillStyle = '#2ECC71';
      this.roundRect(ctx, btnX, btnY, 100, 40, 8);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textBaseline = 'middle';
      ctx.fillText('确定', SCREEN_WIDTH / 2, btnY + 20);
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

  // 文本换行
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
}
