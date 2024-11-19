export const config = {
    zhihu: {
      baseUrl: 'https://www.zhihu.com',
      searchPath: '/search',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      selectors: {
        card: '.SearchResult-Card',
        content: '.RichText',
        date: '.ContentItem-time',
        author: '.AuthorInfo-name',
        link: 'a'
      },
      scrollDelay: 2000,
      maxScrolls: 50
    },
    tieba: {
      baseUrl: 'https://tieba.baidu.com',
      searchPath: '/f/search/res',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      selectors: {
        post: '.s_post',
        title: '.p_title',
        date: '.p_date',
        comment: '.l_post',
        commentContent: '.d_post_content',
        commentAuthor: '.p_author_name',
        commentDate: '.post-tail-wrap span:last-child'
      },
      maxPages: 50
    },
    bilibili: {
      baseUrl: 'https://api.bilibili.com',
      searchPath: '/x/web-interface/search/type',
      videoPath: '/x/web-interface/view/detail',
      replyPath: '/x/v2/reply',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      headers: {
        'Referer': 'https://www.bilibili.com',
        'Origin': 'https://www.bilibili.com'
      },
      maxPages: 50,
      pageSize: 20
    }
  };