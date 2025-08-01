const { getData } = require('./utils');
const fs = require('fs');
const { performance } = require('perf_hooks');
var { Mutex, Semaphore } = require('async-mutex');

const logger = new Set();

async function enqueue(queue, queueMtx, visitedList, visitedListMtx, currDepth, toEnqueue){
  await queueMtx.runExclusive(async () => {
    const toPush = [];
    
    await visitedListMtx.runExclusive(() => {
      for (const url of toEnqueue) {
        if (!visitedList.has(url)) {
          toPush.push({url, depth: currDepth + 1});
        }
      }
    });
    queue.push(...toPush);
  });
}

async function crawl(sourceUrl) {
  const queue = [{url: sourceUrl, depth: 0}];
  const visited = new Set();
  const scrapedData = new Map();

  const MAX_DEPTH = 2;
  const CONCURRENCY_LIMIT = 15;

  const semaphore = new Semaphore(CONCURRENCY_LIMIT);
  const queueMutex  = new Mutex();
  const visitedMutex  = new Mutex();
  const dataMutex = new Mutex();

  while (queue.length > 0) {
    const urlBatch = await queueMutex.runExclusive (() => queue.splice(0, CONCURRENCY_LIMIT));

    const tasks = urlBatch.map(async ({url, depth}) => {
        const [_, release] = await semaphore.acquire();
        
        try {
          if (depth > MAX_DEPTH) return;

          let alreadyVisited = false;
          await visitedMutex.runExclusive(() => {
            if (visited.has(url)) {
              alreadyVisited = true;
            }
            else {
              visited.add(url);
            }
          });
          
          if (alreadyVisited) return; // skip crawling current url

          const data = await getData(url); // extract urls and text from url
          const urls = data.urls
          const text = data.text;

          await dataMutex.runExclusive(() => {
            scrapedData.set(url, text);
          })

          // add the url along with it's text to some type of data structure (might need to account for race conditions)

          await enqueue(queue, queueMutex, visited, visitedMutex, depth, urls)
        }
        finally {
          release();
        }
    });
    await Promise.all(tasks);
  }

  // return all urls that were scraped for their urls and text along with their corresponding text
};

// measuring performance
(async () => {
  const start = performance.now();

  await crawl('https://youtube.com');

  const end = performance.now();
  console.log(`Execution time: ${(end - start).toFixed(3)} ms`);
})();