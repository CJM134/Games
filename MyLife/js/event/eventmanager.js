import { RANDOM_EVENTS, GAME_CONFIG } from '../config';

/**
 * 事件管理器
 */
export default class EventManager {
  constructor() {
    this.currentEvent = null;
  }

  // 尝试触发随机事件
  tryTriggerEvent(attributes) {
    // 使用配置的概率触发事件
    if (Math.random() > GAME_CONFIG.EVENT_TRIGGER_CHANCE) {
      return null;
    }

    // 筛选符合条件的事件
    const availableEvents = RANDOM_EVENTS.filter(event => {
      // 检查条件
      if (event.condition && !event.condition(attributes)) {
        return false;
      }
      // 检查概率
      return Math.random() < event.probability;
    });

    if (availableEvents.length === 0) {
      return null;
    }

    // 随机选择一个事件
    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    this.currentEvent = event;
    return event;
  }

  // 应用事件效果
  applyEventEffects(attributes) {
    if (!this.currentEvent) return attributes;

    const effects = this.currentEvent.effects;
    Object.keys(effects).forEach(key => {
      attributes[key] = Math.max(0, attributes[key] + effects[key]);
    });

    return attributes;
  }

  // 获取行动惩罚
  getActionPenalty() {
    if (!this.currentEvent) return 0;
    return this.currentEvent.actionPenalty || 0;
  }

  // 清除当前事件
  clearEvent() {
    this.currentEvent = null;
  }
}
