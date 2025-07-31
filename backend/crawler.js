const { getData } = require('./utils');
const fs = require('fs');
const { performance } = require('perf_hooks');
var { Mutex, Semaphore } = require('async-mutex');

const logger = [];

/**
 * Adds new URLs to the shared crawl queue if they have not been visited.
 * It ensures thread-safe access using the provided mutexes.
 *
 * @param {Array} queue - The shared queue of URLs to crawl.
 * @param {Mutex} queueMtx - Mutex to protect concurrent access to the queue.
 * @param {Set} visitedList - A set of already visited URLs.
 * @param {Mutex} visitedListMtx - Mutex to protect concurrent access to the visited set.
 * @param {number} currDepth - The current depth of the URL being processed.
 * @param {Array<string>} toEnqueue - An array of URLs to consider adding to the queue.
 */
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

/**
 * Crawls a website starting from the given source URL.
 * Uses concurrency control to crawl pages up to a maximum depth and stores
 * the scraped text data for each visited URL.
 *
 * @param {string} sourceUrl - The URL to begin crawling from.
 * @returns {Promise<Map<string, string>>} - A map of URLs to their extracted text content.
 */
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
          await visitedMutex.runExclusive(async () => {
            if (visited.has(url)) {
              alreadyVisited = true;
            }
            else {
              visited.add(url);
            }
          });
          
          if (alreadyVisited) return; // skip crawling current url

          const data = await getData(url); // extract urls and text from url
          const urls = data.urls;
          const text = data.text;

          await dataMutex.runExclusive(() => {
            scrapedData.set(url, text);
          });

          await enqueue(queue, queueMutex, visited, visitedMutex, depth, urls)
        }
        finally {
          release();
        }
    });
    await Promise.all(tasks);
  }
  
  return scrapedData;
};

// measuring performance
(async () => {
  const start = performance.now();

  const testMap = await crawl('https://youtube.com');

  const end = performance.now();
  console.log(`Execution time: ${(end - start).toFixed(3)} ms`);
  
  for (const [url, text] of testMap) {
  console.log(`URL: ${url}`);
  console.log(`Text: ${text}`);
  console.log('---');
}
})();