import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

/**
 * 人物模型类
 */
export default class CharacterModel {
  constructor() {
    this.x = SCREEN_WIDTH / 2;
    this.y = SCREEN_HEIGHT / 2 - 50;
    this.size = 120;
    
    // 动画状态
    this.scale = 1;
    this.targetScale = 1;
    this.rotation = 0;
    this.bobOffset = 0;
    this.bobSpeed = 0.05;
  }

  // 播放行动动画
  playAction() {
    this.targetScale = 1.1;
    setTimeout(() => {
      this.targetScale = 1;
    }, 200);
  }

  // 更新
  update() {
    // 平滑缩放
    this.scale += (this.targetScale - this.scale) * 0.15;
    
    // 呼吸动画（上下浮动）
    this.bobOffset = Math.sin(Date.now() * this.bobSpeed * 0.001) * 5;
  }

  // 渲染人物
  render(ctx) {
    ctx.save();

    const centerX = this.x;
    const centerY = this.y + this.bobOffset;

    // 应用缩放
    ctx.translate(centerX, centerY);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-centerX, -centerY);

    // 绘制阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + this.size / 2 + 10, this.size / 2.5, this.size / 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 绘制身体
    ctx.fillStyle = '#4A90E2';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 20, this.size / 3, this.size / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 绘制头部
    ctx.fillStyle = '#FFD4A3';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 20, this.size / 3, 0, Math.PI * 2);
    ctx.fill();

    // 绘制头发
    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 25, this.size / 3, Math.PI, Math.PI * 2);
    ctx.fill();

    // 绘制眼睛
    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.arc(centerX - 12, centerY - 22, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 12, centerY - 22, 3, 0, Math.PI * 2);
    ctx.fill();

    // 绘制嘴巴（微笑）
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 15, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // 绘制手臂
    ctx.fillStyle = '#FFD4A3';
    // 左手
    ctx.beginPath();
    ctx.arc(centerX - 30, centerY + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    // 右手
    ctx.beginPath();
    ctx.arc(centerX + 30, centerY + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    // 绘制腿
    ctx.fillStyle = '#34495E';
    // 左腿
    ctx.fillRect(centerX - 20, centerY + 45, 15, 25);
    // 右腿
    ctx.fillRect(centerX + 5, centerY + 45, 15, 25);

    // 绘制鞋子
    ctx.fillStyle = '#2C3E50';
    // 左鞋
    ctx.beginPath();
    ctx.ellipse(centerX - 12, centerY + 72, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // 右鞋
    ctx.beginPath();
    ctx.ellipse(centerX + 12, centerY + 72, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 绘制书包（装饰）
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(centerX + 15, centerY + 5, 20, 25);
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX + 15, centerY + 5, 20, 25);

    ctx.restore();
  }
}
