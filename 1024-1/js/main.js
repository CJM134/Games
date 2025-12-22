import './render'; // 初始化Canvas
import GameInfo from './runtime/gameinfo'; // 导入游戏UI类
import DataBus from './databus'; // 导入数据类，用于管理游戏状态和数据

const ctx = canvas.getContext('2d'); // 获取canvas的2D绘图上下文
const GRID_SIZE = 4; // 4x4网格
const CELL_SIZE = 70; // 每个格子的大小
const CELL_PADDING = 10; // 格子间距

GameGlobal.databus = new DataBus(); // 全局数据管理

/**
 * 1024游戏主函数
 */
export default class Main {
  aniId = 0;
  gameInfo = new GameInfo();
  grid = []; // 游戏网格
  startX = 0; // 网格起始X坐标
  startY = 0; // 网格起始Y坐标
  touchStartX = 0;
  touchStartY = 0;
  isMoving = false; // 防止连续滑动

  constructor() {
    this.gameInfo.on('restart', this.start.bind(this));
    
    // 计算网格居中位置
    const totalSize = GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * CELL_PADDING;
    this.startX = (canvas.width - totalSize) / 2;
    this.startY = (canvas.height - totalSize) / 2 + 50;
    
    // 绑定触摸事件
    this.bindTouchEvents();
    
    this.start();
  }

  /**
   * 绑定触摸事件
   */
  bindTouchEvents() {
    canvas.addEventListener('touchstart', (e) => {
      if (GameGlobal.databus.isGameOver || this.isMoving) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchend', (e) => {
      if (GameGlobal.databus.isGameOver || this.isMoving) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - this.touchStartX;
      const dy = touchEndY - this.touchStartY;
      
      // 判断滑动方向
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        if (Math.abs(dx) > Math.abs(dy)) {
          // 水平滑动
          this.move(dx > 0 ? 'right' : 'left');
        } else {
          // 垂直滑动
          this.move(dy > 0 ? 'down' : 'up');
        }
      }
    });
  }

  /**
   * 开始或重启游戏
   */
  start() {
    GameGlobal.databus.reset();
    this.initGrid();
    this.addRandomTile();
    this.addRandomTile();
    this.isMoving = false;
    cancelAnimationFrame(this.aniId);
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * 初始化网格
   */
  initGrid() {
    this.grid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      this.grid[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        this.grid[i][j] = 0;
      }
    }
  }

  /**
   * 在随机空位置添加新方块
   * 根据分数调整难度：
   * - 分数 < 300: 添加1个方块（2或4）
   * - 分数 >= 300: 添加2个方块（2或4）
   * - 分数 >= 500: 添加2个方块（4或8）
   * @returns {number} 添加后剩余的空格数
   */
  addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (this.grid[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    
    if (emptyCells.length === 0) {
      console.log('没有空格可以添加新方块');
      return 0;
    }

    const score = GameGlobal.databus.score;
    let tilesToAdd = 1; // 默认添加1个方块
    let minValue = 2;
    let maxValue = 4;

    // 根据分数调整难度
    if (score >= 500) {
      tilesToAdd = 2;
      minValue = 4;
      maxValue = 8;
      console.log('高难度模式：添加2个方块（4或8）');
    } else if (score >= 300) {
      tilesToAdd = 2;
      minValue = 2;
      maxValue = 4;
      console.log('中难度模式：添加2个方块（2或4）');
    } else {
      tilesToAdd = 1;
      minValue = 2;
      maxValue = 4;
    }

    // 添加方块
    const actualTilesToAdd = Math.min(tilesToAdd, emptyCells.length);
    for (let i = 0; i < actualTilesToAdd; i++) {
      if (emptyCells.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const randomCell = emptyCells[randomIndex];
      
      // 90%概率生成最小值，10%概率生成最大值
      const value = Math.random() < 0.9 ? minValue : maxValue;
      this.grid[randomCell.row][randomCell.col] = value;
      
      // 从空格列表中移除已使用的格子
      emptyCells.splice(randomIndex, 1);
      
      console.log(`添加方块 ${value} 到 [${randomCell.row},${randomCell.col}]`);
    }
    
    const remainingEmpty = emptyCells.length;
    console.log(`添加后剩余空格: ${remainingEmpty}`);
    return remainingEmpty;
  }

  /**
   * 移动方块
   */
  move(direction) {
    if (this.isMoving) {
      console.log('正在移动中，忽略操作');
      return;
    }
    
    if (GameGlobal.databus.isGameOver) {
      console.log('游戏已结束，忽略操作');
      return;
    }
    
    console.log(`尝试向${direction}移动`);
    const oldGrid = JSON.stringify(this.grid);
    let moved = false;

    if (direction === 'left') {
      moved = this.moveLeft();
    } else if (direction === 'right') {
      moved = this.moveRight();
    } else if (direction === 'up') {
      moved = this.moveUp();
    } else if (direction === 'down') {
      moved = this.moveDown();
    }

    const gridChanged = oldGrid !== JSON.stringify(this.grid);
    console.log(`移动结果: moved=${moved}, gridChanged=${gridChanged}`);

    // 只有当网格真的发生变化时才添加新方块
    if (moved && gridChanged) {
      this.isMoving = true;
      setTimeout(() => {
        const remainingEmpty = this.addRandomTile();
        this.isMoving = false;
        
        console.log(`添加方块后，剩余空格: ${remainingEmpty}`);
        
        // 添加新方块后立即检查游戏是否结束
        // 如果没有空格了，或者无法移动，游戏结束
        const gameOver = this.checkGameOver();
        console.log(`检查游戏结束: ${gameOver}`);
        if (gameOver) {
          console.log('游戏结束！网格已满且无法合并');
          GameGlobal.databus.gameOver();
        }
      }, 150);
    } else if (!moved || !gridChanged) {
      // 如果无法移动，立即检查是否游戏结束
      console.log('无法移动，检查游戏是否结束');
      const gameOver = this.checkGameOver();
      console.log(`检查游戏结束: ${gameOver}`);
      if (gameOver) {
        console.log('游戏结束！无法移动且网格已满');
        GameGlobal.databus.gameOver();
      }
    }
  }

  /**
   * 向左移动
   */
  moveLeft() {
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
      const oldRow = JSON.stringify(this.grid[i]);
      const row = this.grid[i].filter(val => val !== 0);
      
      // 合并相同的数字
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          const mergedValue = row[j] * 2;
          row[j] = mergedValue;
          row.splice(j + 1, 1);
          GameGlobal.databus.score += mergedValue;
          moved = true;
        }
      }
      
      // 填充空位
      while (row.length < GRID_SIZE) {
        row.push(0);
      }
      
      if (oldRow !== JSON.stringify(row)) {
        moved = true;
      }
      this.grid[i] = row;
    }
    return moved;
  }

  /**
   * 向右移动
   */
  moveRight() {
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
      const oldRow = JSON.stringify(this.grid[i]);
      const row = this.grid[i].filter(val => val !== 0);
      
      // 从右向左合并相同的数字
      for (let j = row.length - 1; j > 0; j--) {
        if (row[j] === row[j - 1]) {
          const mergedValue = row[j] * 2;
          row[j] = mergedValue;
          row.splice(j - 1, 1);
          GameGlobal.databus.score += mergedValue;
          moved = true;
          j--;
        }
      }
      
      // 填充空位
      while (row.length < GRID_SIZE) {
        row.unshift(0);
      }
      
      if (oldRow !== JSON.stringify(row)) {
        moved = true;
      }
      this.grid[i] = row;
    }
    return moved;
  }

  /**
   * 向上移动
   */
  moveUp() {
    let moved = false;
    for (let j = 0; j < GRID_SIZE; j++) {
      const oldCol = [];
      const col = [];
      
      for (let i = 0; i < GRID_SIZE; i++) {
        oldCol.push(this.grid[i][j]);
        if (this.grid[i][j] !== 0) {
          col.push(this.grid[i][j]);
        }
      }
      
      // 合并相同的数字
      for (let i = 0; i < col.length - 1; i++) {
        if (col[i] === col[i + 1]) {
          const mergedValue = col[i] * 2;
          col[i] = mergedValue;
          col.splice(i + 1, 1);
          GameGlobal.databus.score += mergedValue;
          moved = true;
        }
      }
      
      // 填充空位
      while (col.length < GRID_SIZE) {
        col.push(0);
      }
      
      // 更新网格
      for (let i = 0; i < GRID_SIZE; i++) {
        if (this.grid[i][j] !== col[i]) {
          moved = true;
        }
        this.grid[i][j] = col[i];
      }
    }
    return moved;
  }

  /**
   * 向下移动
   */
  moveDown() {
    let moved = false;
    for (let j = 0; j < GRID_SIZE; j++) {
      const oldCol = [];
      const col = [];
      
      for (let i = 0; i < GRID_SIZE; i++) {
        oldCol.push(this.grid[i][j]);
        if (this.grid[i][j] !== 0) {
          col.push(this.grid[i][j]);
        }
      }
      
      // 从下向上合并相同的数字
      for (let i = col.length - 1; i > 0; i--) {
        if (col[i] === col[i - 1]) {
          const mergedValue = col[i] * 2;
          col[i] = mergedValue;
          col.splice(i - 1, 1);
          GameGlobal.databus.score += mergedValue;
          moved = true;
          i--;
        }
      }
      
      // 填充空位
      while (col.length < GRID_SIZE) {
        col.unshift(0);
      }
      
      // 更新网格
      for (let i = 0; i < GRID_SIZE; i++) {
        if (this.grid[i][j] !== col[i]) {
          moved = true;
        }
        this.grid[i][j] = col[i];
      }
    }
    return moved;
  }

  /**
   * 检查游戏是否结束
   * 当网格填满且没有可合并的方块时游戏结束
   */
  checkGameOver() {
    // 打印当前网格状态
    console.log('当前网格状态:');
    for (let i = 0; i < GRID_SIZE; i++) {
      console.log(this.grid[i].join('\t'));
    }
    
    // 首先检查是否有空格
    let hasEmpty = false;
    let emptyCount = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (this.grid[i][j] === 0) {
          hasEmpty = true;
          emptyCount++;
        }
      }
    }
    
    console.log(`空格数量: ${emptyCount}`);
    
    // 如果有空格，游戏继续
    if (hasEmpty) {
      console.log('还有空格，游戏继续');
      return false;
    }
    
    console.log('网格已满，检查是否有可合并的方块...');
    
    // 网格已满，检查是否有可合并的方块
    // 检查水平方向（每行中相邻的格子）
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 1; j++) {
        if (this.grid[i][j] === this.grid[i][j + 1]) {
          console.log(`找到可合并的方块(水平): [${i},${j}]=${this.grid[i][j]} 和 [${i},${j+1}]=${this.grid[i][j+1]}`);
          return false; // 有可合并的方块，游戏继续
        }
      }
    }
    
    // 检查垂直方向（每列中相邻的格子）
    for (let i = 0; i < GRID_SIZE - 1; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (this.grid[i][j] === this.grid[i + 1][j]) {
          console.log(`找到可合并的方块(垂直): [${i},${j}]=${this.grid[i][j]} 和 [${i+1},${j}]=${this.grid[i+1][j]}`);
          return false; // 有可合并的方块，游戏继续
        }
      }
    }
    
    // 网格已满且没有可合并的方块，游戏结束
    console.log('❌ 网格已满且无可合并方块，游戏结束！');
    return true;
  }

  /**
   * 获取方块颜色
   */
  getTileColor(value) {
    const colors = {
      0: '#cdc1b4',
      2: '#eee4da',
      4: '#ede0c8',
      6: '#f4d7a6',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
  }

  /**
   * 渲染游戏画面
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#faf8ef';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制标题
    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('1024游戏', canvas.width / 2, 40);
    
    // 绘制网格背景
    ctx.fillStyle = '#bbada0';
    const totalSize = GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * CELL_PADDING;
    ctx.fillRect(this.startX - 5, this.startY - 5, totalSize + 10, totalSize + 10);
    
    // 绘制方块
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const value = this.grid[i][j];
        const x = this.startX + j * (CELL_SIZE + CELL_PADDING);
        const y = this.startY + i * (CELL_SIZE + CELL_PADDING);
        
        // 绘制方块背景
        ctx.fillStyle = this.getTileColor(value);
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        
        // 绘制数字
        if (value !== 0) {
          ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2';
          ctx.font = value < 100 ? 'bold 32px Arial' : value < 1000 ? 'bold 28px Arial' : 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(value, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        }
      }
    }
    
    this.gameInfo.render(ctx);
  }

  /**
   * 游戏循环
   */
  loop() {
    this.render();
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }
}
