const { getLinks } = require('./utils');
const fs = require('fs');
const { performance } = require('perf_hooks');
var { Mutex, Semaphore } = require('async-mutex');

const logger = [];

async function crawl(url) {
  const queue = [{url: url, depth: 0}];
  const visited = new Set();

  const MAX_DEPTH = 0;
  const CONCURRENCY_LIMIT = 15;

  const semaphore = new Semaphore(CONCURRENCY_LIMIT);
  const queueMutex  = new Mutex();
  const visitedMutex  = new Mutex();

  while (queue.length > 0) {
    const urlBatch = await queueMutex.runExclusive (() => queue.splice(0, CONCURRENCY_LIMIT));
    const tasks = urlBatch.map(async ({url, depth}) => {
        const [_, release] = await semaphore.acquire();
        
        try {
          if (depth > MAX_DEPTH) return;

          let alreadyVisited = false;
          await visitedMutex.runExclusive(async () => {
            if (visited.has(url)) {
              alreadyVisited = true;
            }
            else {
              visited.add(url);
              logger.push(url); // for logging the urls that have been extracted
            }
          });
          
          if (alreadyVisited) return; // skip crawling current url

          const links = await getLinks(url); // extract links from url

          visitedMutex.runExclusive(() => { // add links to the queue if they haven't been visited
            const toQueue = [];
            for (const link of links) {
              if (!visited.has(link)) {
                toQueue.push({url: link, depth: depth + 1});
                logger.push(link)
              }
            }

            queueMutex.runExclusive(() => {
              queue.push(...toQueue);
            });
          });
        }
        finally {
          release();
        }
    });
    await Promise.all(tasks);
  }
  //const setTextContent = Array.from(logger).join('\n');
  fs.writeFileSync('linksArraySafe.txt', logger.join('\n'));
  console.log('As array:', logger.length, "\nAs set:", new Set(logger).size);
  return logger.length;
};

// measuring performance
(async () => {
  const start = performance.now();

  const numLinks = await crawl('https://youtube.com');

  const end = performance.now();
  console.log(`Execution time: ${(end - start).toFixed(3)} ms`);
  console.log('Crawled', numLinks ," links." )
})();