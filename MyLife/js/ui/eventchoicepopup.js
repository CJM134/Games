import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Emitter from '../libs/tinyemitter';

/**
 * 事件选择弹窗类
 */
export default class EventChoicePopup extends Emitter {
  constructor() {
    super();
    this.visible = false;
    this.event = null;
    this.alpha = 0;
    this.targetAlpha = 0;
    this.selectedChoice = -1;
    
    this.initEvent();
  }

  // 显示事件
  show(event) {
    this.event = event;
    this.visible = true;
    this.targetAlpha = 1;
    this.selectedChoice = -1;
  }

  // 隐藏事件
  hide() {
    this.targetAlpha = 0;
    setTimeout(() => {
      this.visible = false;
      this.event = null;
      this.selectedChoice = -1;
    }, 300);
  }

  // 初始化事件
  initEvent() {
    wx.onTouchStart((e) => {
      // 只有在弹窗完全显示时才能点击
      if (!this.visible || this.alpha < 0.95) return;
      
      const { clientX: x, clientY: y } = e.touches[0];
      
      // 检查是否点击了选择按钮
      if (this.event && this.event.choices) {
        this.event.choices.forEach((choice, index) => {
          if (this.checkChoiceButton(x, y, index)) {
            this.selectedChoice = index;
            // 立即隐藏并触发确认
            this.visible = false;
            this.targetAlpha = 0;
            this.emit('choiceSelected', choice.effects);
          }
        });
      }
    });
  }

  // 检查选择按钮
  checkChoiceButton(x, y, index) {
    const btnWidth = 240;
    const btnHeight = 50;
    const btnX = SCREEN_WIDTH / 2 - btnWidth / 2;
    const startY = SCREEN_HEIGHT / 2 - 20;
    const btnY = startY + index * (btnHeight + 10);
    
    return x >= btnX && x <= btnX + btnWidth && 
           y >= btnY && y <= btnY + btnHeight;
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
    const popupX = SCREEN_WIDTH / 2 - 150;
    const popupY = SCREEN_HEIGHT / 2 - 200;
    const popupW = 300;
    const popupH = 400;

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

    // 选择按钮
    if (this.event.choices) {
      const btnWidth = 240;
      const btnHeight = 50;
      const btnX = SCREEN_WIDTH / 2 - btnWidth / 2;
      const startY = SCREEN_HEIGHT / 2 - 20;

      this.event.choices.forEach((choice, index) => {
        const btnY = startY + index * (btnHeight + 10);
        
        // 按钮背景
        ctx.fillStyle = '#4A90E2';
        this.roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 8);
        ctx.fill();
        
        // 按钮文字
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textBaseline = 'middle';
        ctx.fillText(choice.text, SCREEN_WIDTH / 2, btnY + btnHeight / 2);
        
        // 效果预览
        const effectTexts = [];
        Object.keys(choice.effects).forEach(key => {
          const value = choice.effects[key];
          if (value !== 0) {
            const sign = value > 0 ? '+' : '';
            const names = {
              study: '学习',
              sports: '体育',
              art: '艺术',
              social: '社交',
              stress: '压力'
            };
            effectTexts.push(`${names[key]}${sign}${value}`);
          }
        });
        
        ctx.font = '11px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(effectTexts.join(' '), SCREEN_WIDTH / 2, btnY + btnHeight - 10);
      });
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
