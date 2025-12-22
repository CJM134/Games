import './render'; // 初始化Canvas
import GameData from './gamedata'; // 游戏数据管理
import GameUI from './ui/gameui'; // 游戏UI
import EventPopup from './ui/eventpopup'; // 事件弹窗
import EventChoicePopup from './ui/eventchoicepopup'; // 事件选择弹窗
import EventManager from './event/eventmanager'; // 事件管理器
import Background from './ui/background'; // 背景
import TalentSelection from './ui/talentselection'; // 天赋选择
import AchievementPopup from './ui/achievementpopup'; // 成就弹窗

const ctx = canvas.getContext('2d'); // 获取canvas的2D绘图上下文

/**
 * 中国式家长游戏主函数
 */
export default class Main {
  aniId = 0; // 用于存储动画帧的ID
  gameData = new GameData(); // 游戏数据
  gameUI = new GameUI(); // 游戏UI
  eventPopup = new EventPopup(); // 事件弹窗
  eventChoicePopup = new EventChoicePopup(); // 事件选择弹窗
  eventManager = new EventManager(); // 事件管理器
  background = new Background(); // 背景
  talentSelection = new TalentSelection(); // 天赋选择
  achievementPopup = new AchievementPopup(); // 成就弹窗
  
  // 事件队列
  eventQueue = [];
  isProcessingEvent = false;
  
  // 成就队列
  achievementQueue = [];

  constructor() {
    // 监听UI事件
    this.gameUI.on('actionSelected', this.onActionSelected.bind(this));
    this.gameUI.on('nextTerm', this.onNextTerm.bind(this));
    this.gameUI.on('restart', this.start.bind(this));
    
    // 监听事件弹窗确认
    this.eventPopup.on('confirm', this.onEventConfirm.bind(this));
    
    // 监听事件选择弹窗
    this.eventChoicePopup.on('choiceSelected', this.onChoiceSelected.bind(this));
    
    // 监听天赋选择
    this.talentSelection.on('talentSelected', this.onTalentSelected.bind(this));

    // 开始游戏
    this.start();
  }

  /**
   * 开始或重启游戏
   */
  start() {
    this.gameData.reset(); // 重置数据
    this.gameUI.showTermEnd = false;
    this.gameUI.showGameOver = false;
    this.eventQueue = [];
    this.achievementQueue = [];
    this.isProcessingEvent = false;
    
    // 显示天赋选择界面
    this.talentSelection.show();
    
    cancelAnimationFrame(this.aniId); // 清除上一局的动画
    this.aniId = requestAnimationFrame(this.loop.bind(this)); // 开始新的动画循环
  }

  /**
   * 天赋选择完成
   */
  onTalentSelected(talentId) {
    this.gameData.selectTalent(talentId);
    // 检查初始成就
    this.checkAndShowAchievements();
  }

  /**
   * 处理行动选择
   */
  onActionSelected(actionConfig) {
    // 检查是否选择了天赋
    if (!this.gameData.talentSelected) {
      return;
    }
    
    // 检查是否可以执行行动
    if (this.gameData.isTermEnd || this.gameData.isGameOver) {
      return;
    }
    
    // 如果正在处理事件或事件弹窗正在显示，不允许新的行动
    if (this.isProcessingEvent || this.eventPopup.isShowing() || this.eventChoicePopup.visible) {
      return;
    }

    // 显示行动反馈
    this.gameUI.showActionFeedback(actionConfig.effects);

    // 执行行动
    this.gameData.performAction(actionConfig.effects);
    
    // 检查成就
    this.checkAndShowAchievements();

    // 尝试触发随机事件
    const event = this.eventManager.tryTriggerEvent(this.gameData.attributes);
    if (event) {
      // 将事件加入队列
      this.eventQueue.push(event);
    }

    // 延迟处理事件和学期结束检查
    setTimeout(() => {
      this.processNextEvent();
    }, 2200);
  }

  /**
   * 处理下一个事件
   */
  processNextEvent() {
    // 如果有待处理的事件
    if (this.eventQueue.length > 0 && !this.isProcessingEvent) {
      this.isProcessingEvent = true;
      const event = this.eventQueue.shift();
      this.eventManager.currentEvent = event;
      
      // 判断是选择类事件还是普通事件
      if (event.hasChoice) {
        this.eventChoicePopup.show(event);
      } else {
        this.eventPopup.show(event);
      }
    } 
    // 所有事件处理完毕
    else if (this.eventQueue.length === 0 && !this.isProcessingEvent) {
      // 检查是否学期结束
      if (this.gameData.isTermEnd) {
        this.showTermEndScreen();
      }
    }
  }

  /**
   * 事件确认（普通事件）
   */
  onEventConfirm() {
    // 应用事件效果
    this.eventManager.applyEventEffects(this.gameData.attributes);
    
    // 检查是否有行动惩罚
    const penalty = this.eventManager.getActionPenalty();
    if (penalty > 0) {
      this.gameData.applyActionPenalty(penalty);
    }
    
    this.eventManager.clearEvent();
    
    // 重置处理标志
    this.isProcessingEvent = false;
    
    // 延迟一点再处理下一步，确保状态更新完成
    setTimeout(() => {
      // 检查是否学期结束
      if (this.gameData.isTermEnd && this.eventQueue.length === 0) {
        // 学期结束，显示结算界面
        this.showTermEndScreen();
      } else if (this.eventQueue.length > 0) {
        // 继续处理下一个事件
        this.processNextEvent();
      }
      // 如果既没有结束也没有事件，就什么都不做，等待玩家下一次行动
    }, 200);
  }

  /**
   * 事件选择确认（选择类事件）
   */
  onChoiceSelected(effects) {
    // 应用选择的效果
    Object.keys(effects).forEach(key => {
      this.gameData.attributes[key] = Math.max(0, this.gameData.attributes[key] + effects[key]);
    });
    
    this.eventManager.clearEvent();
    
    // 重置处理标志
    this.isProcessingEvent = false;
    
    // 检查成就
    this.checkAndShowAchievements();
    
    // 延迟一点再处理下一步
    setTimeout(() => {
      // 检查是否学期结束
      if (this.gameData.isTermEnd && this.eventQueue.length === 0) {
        this.showTermEndScreen();
      } else if (this.eventQueue.length > 0) {
        this.processNextEvent();
      }
    }, 200);
  }

  /**
   * 检查并显示成就
   */
  checkAndShowAchievements() {
    const newAchievements = this.gameData.checkAchievements();
    if (newAchievements.length > 0) {
      // 将新成就加入队列
      this.achievementQueue.push(...newAchievements);
      // 如果当前没有显示成就，开始显示
      if (!this.achievementPopup.visible) {
        this.showNextAchievement();
      }
    }
  }

  /**
   * 显示下一个成就
   */
  showNextAchievement() {
    if (this.achievementQueue.length > 0) {
      const achievement = this.achievementQueue.shift();
      this.achievementPopup.show(achievement);
      
      // 3.5秒后显示下一个
      setTimeout(() => {
        this.showNextAchievement();
      }, 3500);
    }
  }

  /**
   * 显示学期结束界面
   */
  showTermEndScreen() {
    // 确保重置处理状态
    this.isProcessingEvent = false;
    this.eventQueue = [];
    
    const score = this.gameData.calculateTermScore();
    const grade = this.gameData.getGrade(score);
    
    // 记录考试成绩
    this.gameData.recordExamScore(score);
    
    // 检查成就
    this.checkAndShowAchievements();
    
    this.gameUI.showTermEndScreen(score, grade);
  }

  /**
   * 进入下一学期
   */
  onNextTerm() {
    // 重置事件处理状态
    this.isProcessingEvent = false;
    this.eventQueue = [];
    
    // 进入下一学期
    this.gameData.nextTerm();
    
    // 检查是否游戏结束（高三毕业）
    if (this.gameData.isGameOver) {
      this.gameUI.showGameOverScreen();
    }
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    this.background.render(ctx);

    // 绘制游戏UI
    this.gameUI.render(ctx, this.gameData);

    // 绘制事件弹窗
    this.eventPopup.render(ctx);
    
    // 绘制事件选择弹窗
    this.eventChoicePopup.render(ctx);
    
    // 绘制天赋选择界面
    this.talentSelection.render(ctx);
    
    // 绘制成就弹窗
    this.achievementPopup.render(ctx);
  }

  // 游戏逻辑更新主函数
  update() {
    this.gameUI.update();
    this.eventPopup.update();
    this.eventChoicePopup.update();
    this.achievementPopup.update();
  }

  // 实现游戏帧循环
  loop() {
    this.update(); // 更新游戏逻辑
    this.render(); // 渲染游戏画面

    // 请求下一帧动画
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }
}
