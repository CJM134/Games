import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { TALENTS } from '../config';
import Emitter from '../libs/tinyemitter';

/**
 * 天赋选择界面
 */
export default class TalentSelection extends Emitter {
  constructor() {
    super();
    this.visible = false;
    this.selectedIndex = -1;
    this.hoveredIndex = -1;
    
    this.initEvent();
  }

  // 显示天赋选择
  show() {
    this.visible = true;
    this.selectedIndex = -1;
  }

  // 隐藏天赋选择
  hide() {
    this.visible = false;
  }

  // 初始化事件
  initEvent() {
    wx.onTouchStart((e) => {
      if (!this.visible) return;
      
      const { clientX: x, clientY: y } = e.touches[0];
      
      // 检查是否点击了天赋卡片
      TALENTS.forEach((talent, index) => {
        if (this.checkTalentCard(x, y, index)) {
          this.selectedIndex = index;
        }
      });
      
      // 检查是否点击了确认按钮
      if (this.selectedIndex >= 0 && this.checkConfirmButton(x, y)) {
        this.emit('talentSelected', TALENTS[this.selectedIndex].id);
        this.hide();
      }
    });
  }

  // 检查天赋卡片点击
  checkTalentCard(x, y, index) {
    const cardWidth = 140;
    const cardHeight = 160;
    const padding = 10;
    const cardsPerRow = 2;
    
    const row = Math.floor(index / cardsPerRow);
    const col = index % cardsPerRow;
    
    const startX = (SCREEN_WIDTH - (cardWidth * cardsPerRow + padding * (cardsPerRow - 1))) / 2;
    const startY = 120;
    
    const cardX = startX + col * (cardWidth + padding);
    const cardY = startY + row * (cardHeight + padding);
    
    return x >= cardX && x <= cardX + cardWidth && 
           y >= cardY && y <= cardY + cardHeight;
  }

  // 检查确认按钮
  checkConfirmButton(x, y) {
    const btnX = SCREEN_WIDTH / 2 - 60;
    const btnY = SCREEN_HEIGHT - 80;
    const btnW = 120;
    const btnH = 45;
    return x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH;
  }

  // 渲染
  render(ctx) {
    if (!this.visible) return;

    ctx.save();

    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('选择你的天赋', SCREEN_WIDTH / 2, 60);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText('天赋将影响你的整个学习生涯', SCREEN_WIDTH / 2, 90);

    // 绘制天赋卡片
    const cardWidth = 140;
    const cardHeight = 160;
    const padding = 10;
    const cardsPerRow = 2;
    
    const startX = (SCREEN_WIDTH - (cardWidth * cardsPerRow + padding * (cardsPerRow - 1))) / 2;
    const startY = 120;

    TALENTS.forEach((talent, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);
      
      this.renderTalentCard(ctx, talent, x, y, cardWidth, cardHeight, index === this.selectedIndex);
    });

    // 确认按钮
    if (this.selectedIndex >= 0) {
      const btnX = SCREEN_WIDTH / 2 - 60;
      const btnY = SCREEN_HEIGHT - 80;
      
      ctx.fillStyle = '#2ECC71';
      this.roundRect(ctx, btnX, btnY, 120, 45, 8);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textBaseline = 'middle';
      ctx.fillText('确认选择', SCREEN_WIDTH / 2, btnY + 22);
    }

    ctx.restore();
  }

  // 渲染天赋卡片
  renderTalentCard(ctx, talent, x, y, width, height, selected) {
    // 卡片背景
    ctx.fillStyle = selected ? talent.color : '#2C3E50';
    ctx.shadowColor = selected ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = selected ? 15 : 10;
    this.roundRect(ctx, x, y, width, height, 10);
    ctx.fill();

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 图标
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(talent.icon, x + width / 2, y + 40);

    // 名称
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(talent.name, x + width / 2, y + 75);

    // 描述
    ctx.fillStyle = selected ? '#FFFFFF' : '#CCCCCC';
    ctx.font = '11px Arial';
    this.wrapText(ctx, talent.description, x + width / 2, y + 105, width - 20, 16);

    // 选中标记
    if (selected) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '20px Arial';
      ctx.fillText('✓', x + width - 20, y + 20);
    }
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
