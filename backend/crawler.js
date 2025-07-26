const { getLinks } = require('./utils');
const pLimit = require('p-limit').default;
const fs = require('fs');

const logger = new Set();

async function crawl(url) {
  const queue = [{url: url, depth: 0}];
  const visited = new Set(); // might change to some sort of hash data structure to improve performance

  const MAX_DEPTH = 2;
  const CONCURRENCY_LIMIT = 15;
  const limit = pLimit(CONCURRENCY_LIMIT);

  while (queue.length > 0) {
    const urlBatch = queue.splice(0, CONCURRENCY_LIMIT);
    const tasks = urlBatch.map(({url, depth}) => {
      return limit(async () => {
        if ( (depth > MAX_DEPTH) || (visited.has(url)) ) return;

        visited.add(url);
        logger.add(url); // for logging the urls that have been extracted

        const links = await getLinks(url);

        for (const link of links) {
          if (!visited.has(link)) {
            queue.push({url: link, depth: depth + 1});
            logger.add(link);
          }
        }
      })
    });
    await Promise.all(tasks);
  }
  const setTextContent = Array.from(logger).join('\n');
  fs.writeFileSync('linksConcurrent.txt', setTextContent);
};

crawl('https://youtube.com');