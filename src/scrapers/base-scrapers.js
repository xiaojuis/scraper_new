import { logger } from '../utils/logger.js';
import { DateHelper } from '../utils/date-helper.js';

export class BaseScraper {
  constructor(config) {
    this.config = config;
    this.startDate = null;
  }

  setStartDate(date) {
    this.startDate = date;
  }

  async initialize() {
    // 子类实现具体初始化逻辑
  }

  async close() {
    // 子类实现具体关闭逻辑
  }

  isValidResult(date) {
    return DateHelper.isAfterDate(date, this.startDate);
  }

  logError(error, context) {
    logger.error(`Error in ${context}: ${error.message}`, { 
      stack: error.stack,
      context 
    });
  }
}