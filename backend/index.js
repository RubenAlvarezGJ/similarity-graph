const { crawl } = require('./crawler');
const { getSimilarityScores } = require('./similarity');

(async () => {
  const sourceUrl = 'https://www.w3schools.com/nodejs/nodejs_intro.asp'; // we want to get this from the frontend in the future

  const data = await crawl(sourceUrl);
  const sourceText = data.values().next().value;

  getSimilarityScores(sourceText, data);

  // sanity check: making sure scores are being calculated and mapped to urls
  for (const [key, value] of data.entries()) {
    console.log(`${key}: ${value}`);
  }

})();