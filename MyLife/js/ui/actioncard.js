/**
 * 行动卡片类
 */
export default class ActionCard {
  constructor(config, x, y, width, height) {
    this.config = config;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.visible = true;
    this.scale = 1;
    this.targetScale = 1;
  }

  // 检查点击
  checkClick(touchX, touchY) {
    return (
      touchX >= this.x &&
      touchX <= this.x + this.width &&
      touchY >= this.y &&
      touchY <= this.y + this.height
    );
  }

  // 更新动画
  update() {
    // 平滑缩放动画
    this.scale += (this.targetScale - this.scale) * 0.2;
  }

  // 设置按下状态
  setPressed(pressed) {
    this.targetScale = pressed ? 0.95 : 1;
  }

  // 渲染卡片
  render(ctx) {
    if (!this.visible) return;

    ctx.save();

    // 应用缩放
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-centerX, -centerY);

    // 绘制卡片背景
    ctx.fillStyle = this.config.color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    this.roundRect(ctx, this.x, this.y, this.width, this.height, 8);
    ctx.fill();

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 绘制图标
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.icon, centerX, this.y + 30);

    // 绘制名称
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(this.config.name, centerX, this.y + this.height - 15);

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
