import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './src/config/config.js';
import { ZhihuScraper } from './src/scrapers/zhihu.js';
import { TiebaScraper } from './src/scrapers/tieba.js';
import { BilibiliScraper } from './src/scrapers/bilibili.js';
import { DateHelper } from './src/utils/date-helper.js';
import { logger } from './src/utils/logger.js';
import fs from 'fs/promises';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const keyword = process.argv[2];
  if (!keyword) {
    console.error('请提供搜索关键词');
    process.exit(1);
  }

  // 设置5年前的日期范围
  const startDate = DateHelper.getDateYearsAgo(5);
  
  const zhihuScraper = new ZhihuScraper(config.zhihu);
  const tiebaScraper = new TiebaScraper(config.tieba);
  const bilibiliScraper = new BilibiliScraper(config.bilibili);
  
  try {
    // 设置开始日期
    zhihuScraper.setStartDate(startDate);
    tiebaScraper.setStartDate(startDate);
    bilibiliScraper.setStartDate(startDate);

    // 初始化知乎爬虫
    await zhihuScraper.initialize();
    
    // 并行运行爬虫
    const [zhihuResults, tiebaResults, bilibiliResults] = await Promise.all([
      zhihuScraper.scrape(keyword),
      tiebaScraper.scrape(keyword),
      bilibiliScraper.scrape(keyword)
    ]);

    const results = {
      keyword,
      timestamp: new Date().toISOString(),
      zhihu: zhihuResults,
      tieba: tiebaResults,
      bilibili: bilibiliResults
    };

    // 创建results目录（如果不存在）
    const resultsDir = join(__dirname, 'results');
    await fs.mkdir(resultsDir, { recursive: true });

    // 保存结果到results目录
    const filename = join(resultsDir, `results_${keyword}_${DateHelper.formatDate(new Date())}.json`);
    await fs.writeFile(filename, JSON.stringify(results, null, 2), 'utf8');
    
    logger.info(`爬取完成。结果已保存到 ${filename}`);
    console.log(`总结果数: 知乎 (${zhihuResults.length}), 贴吧 (${tiebaResults.length}), B站 (${bilibiliResults.length})`);
  } catch (error) {
    logger.error('爬取过程中出错:', error);
  } finally {
    await zhihuScraper.close();
  }
}

main();