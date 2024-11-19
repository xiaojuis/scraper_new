import axios from 'axios';
import cheerio from 'cheerio';
import { BaseScraper } from './base-scraper.js';
import { DateHelper } from '../utils/date-helper.js';
import { logger } from '../utils/logger.js';

export class TiebaScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.axios = axios.create({
      headers: {
        'User-Agent': this.config.userAgent
      }
    });
  }

  async scrape(keyword) {
    try {
      const results = [];
      let pn = 0;
      let hasMore = true;

      while (hasMore && pn < this.config.maxPages) {
        const url = `${this.config.baseUrl}${this.config.searchPath}?qw=${encodeURIComponent(keyword)}&pn=${pn}`;
        const response = await this.axios.get(url);
        const $ = cheerio.load(response.data);

        const posts = await this._scrapePosts($);
        results.push(...posts.filter(post => post !== null));

        hasMore = $(this.config.selectors.next).length > 0;
        pn++;
      }

      logger.info(`Scraped ${results.length} results from Tieba`);
      return results;
    } catch (error) {
      this.logError(error, 'TiebaScraper.scrape');
      return [];
    }
  }

  async _scrapePosts($) {
    const { selectors } = this.config;
    const posts = $(selectors.post).map(async (_, element) => {
      const $element = $(element);
      const title = $element.find(selectors.title).text().trim();
      const link = this.config.baseUrl + $element.find(`${selectors.title} a`).attr('href');
      const dateStr = $element.find(selectors.date).text().trim();

      if (this.isValidResult(dateStr)) {
        const comments = await this._scrapeComments(link);
        return {
          title,
          link,
          date: DateHelper.formatDate(dateStr, 'YYYY-MM-DD HH:mm'),
          platform: 'tieba',
          comments
        };
      }
      return null;
    }).get();

    return Promise.all(posts);
  }

  async _scrapeComments(postUrl) {
    try {
      const { selectors } = this.config;
      const response = await this.axios.get(postUrl);
      const $ = cheerio.load(response.data);
      
      return $(selectors.comment).map((_, element) => {
        const $element = $(element);
        return {
          content: $element.find(selectors.commentContent).text().trim(),
          author: $element.find(selectors.commentAuthor).text().trim(),
          date: $element.find(selectors.commentDate).text().trim()
        };
      }).get();
    } catch (error) {
      this.logError(error, 'TiebaScraper._scrapeComments');
      return [];
    }
  }
}