import axios from 'axios';
import qs from 'qs';
import { BaseScraper } from './base-scraper.js';
import { DateHelper } from '../utils/date-helper.js';
import { logger } from '../utils/logger.js';

export class BilibiliScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.axios = axios.create({
      headers: {
        'User-Agent': this.config.userAgent,
        ...this.config.headers
      }
    });
  }

  async scrape(keyword) {
    try {
      const results = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= this.config.maxPages) {
        const searchParams = {
          keyword,
          page,
          order: 'pubdate',
          search_type: 'video',
          page_size: this.config.pageSize
        };

        const searchUrl = `${this.config.baseUrl}${this.config.searchPath}?${qs.stringify(searchParams)}`;
        const response = await this.axios.get(searchUrl);

        if (response.data.code === 0 && response.data.data.result) {
          const videos = response.data.data.result;
          
          for (const video of videos) {
            const pubDate = video.pubdate * 1000; // 转换为毫秒
            
            if (this.isValidResult(pubDate)) {
              const videoData = {
                bvid: video.bvid,
                title: video.title,
                author: video.author,
                date: DateHelper.formatDate(pubDate, 'x'),
                description: video.description,
                link: `https://www.bilibili.com/video/${video.bvid}`,
                platform: 'bilibili'
              };

              // 获取视频评论
              const comments = await this._scrapeComments(video.bvid);
              videoData.comments = comments;

              results.push(videoData);
            }
          }

          hasMore = videos.length === this.config.pageSize;
        } else {
          hasMore = false;
        }

        page++;
        // 添加延迟以避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      logger.info(`Scraped ${results.length} results from Bilibili`);
      return results;
    } catch (error) {
      this.logError(error, 'BilibiliScraper.scrape');
      return [];
    }
  }

  async _scrapeComments(bvid, maxComments = 100) {
    try {
      const comments = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && comments.length < maxComments) {
        const replyParams = {
          oid: await this._getAidFromBvid(bvid),
          type: 1,
          pn: page,
          ps: 20,
          sort: 2 // 按时间排序
        };

        const replyUrl = `${this.config.baseUrl}${this.config.replyPath}?${qs.stringify(replyParams)}`;
        const response = await this.axios.get(replyUrl);

        if (response.data.code === 0 && response.data.data.replies) {
          const replies = response.data.data.replies || [];
          
          for (const reply of replies) {
            comments.push({
              content: reply.content.message,
              author: reply.member.uname,
              date: DateHelper.formatDate(reply.ctime * 1000, 'x'),
              likes: reply.like
            });
          }

          hasMore = replies.length === 20 && comments.length < maxComments;
        } else {
          hasMore = false;
        }

        page++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return comments;
    } catch (error) {
      this.logError(error, 'BilibiliScraper._scrapeComments');
      return [];
    }
  }

  async _getAidFromBvid(bvid) {
    try {
      const detailUrl = `${this.config.baseUrl}${this.config.videoPath}?bvid=${bvid}`;
      const response = await this.axios.get(detailUrl);
      
      if (response.data.code === 0 && response.data.data.View) {
        return response.data.data.View.aid;
      }
      return null;
    } catch (error) {
      this.logError(error, 'BilibiliScraper._getAidFromBvid');
      return null;
    }
  }
}