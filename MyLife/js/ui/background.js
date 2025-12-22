import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

/**
 * 背景类
 */
export default class Background {
  constructor() {
    this.img = wx.createImage();
    this.img.src = 'images/bg.png';
    this.loaded = false;
    
    this.img.onload = () => {
      this.loaded = true;
    };
    
    this.img.onerror = () => {
      console.error('背景图片加载失败');
      this.loaded = false;
    };
  }

  render(ctx) {
    if (this.loaded) {
      // 绘制背景图片，填充整个屏幕
      ctx.drawImage(this.img, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      
      // 添加半透明遮罩，让前景内容更清晰
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    } else {
      // 如果图片未加载，使用渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
      gradient.addColorStop(0, '#E3F2FD');
      gradient.addColorStop(1, '#BBDEFB');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
  }
}
