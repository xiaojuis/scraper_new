import puppeteer from 'puppeteer';
import { BaseScraper } from './base-scraper.js';
import { DateHelper } from '../utils/date-helper.js';
import { logger } from '../utils/logger.js';

export class ZhihuScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.browser = null;
  }

  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (error) {
      this.logError(error, 'ZhihuScraper.initialize');
      throw error;
    }
  }

  async scrape(keyword) {
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent(this.config.userAgent);
      
      const searchUrl = `${this.config.baseUrl}${this.config.searchPath}?type=content&q=${encodeURIComponent(keyword)}`;
      await page.goto(searchUrl);
      await page.waitForSelector(this.config.selectors.card);

      const results = [];
      let hasMore = true;
      let scrollCount = 0;

      while (hasMore && scrollCount < this.config.maxScrolls) {
        const newResults = await this._scrapeCurrentPage(page);
        results.push(...newResults);

        hasMore = await this._scrollForMore(page);
        scrollCount++;
      }

      logger.info(`Scraped ${results.length} results from Zhihu`);
      return results;
    } catch (error) {
      this.logError(error, 'ZhihuScraper.scrape');
      return [];
    }
  }

  async _scrapeCurrentPage(page) {
    const { selectors } = this.config;
    return await page.evaluate((selectors, startDate) => {
      const items = [];
      document.querySelectorAll(selectors.card).forEach(card => {
        const content = card.querySelector(selectors.content)?.textContent || '';
        const dateStr = card.querySelector(selectors.date)?.textContent || '';
        const link = card.querySelector(selectors.link)?.href || '';
        const author = card.querySelector(selectors.author)?.textContent || '';
        
        if (moment(dateStr).isValid() && moment(dateStr).isAfter(startDate)) {
          items.push({
            content,
            date: moment(dateStr).format('YYYY-MM-DD'),
            link,
            author,
            platform: 'zhihu'
          });
        }
      });
      return items;
    }, selectors, this.startDate);
  }

  async _scrollForMore(page) {
    const previousHeight = await page.evaluate('document.documentElement.scrollHeight');
    await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
    await page.waitForTimeout(this.config.scrollDelay);

    const newHeight = await page.evaluate('document.documentElement.scrollHeight');
    return newHeight > previousHeight;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}