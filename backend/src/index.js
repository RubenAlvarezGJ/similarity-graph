const { crawl } = require('./crawler');
const { getSimilarityScores } = require('./similarity');
const { getTopScores } = require('./utils');

(async () => {
  const sourceUrl = 'https://nodejs.org/en'; // we want to get this from the frontend in the future

  const data = await crawl(sourceUrl);
  const sourceText = data.values().next().value;

  getSimilarityScores(sourceText, data);

  const topScores = getTopScores(data);

  // sanity check: making sure scores are being calculated and mapped to urls
  for (const [key, value] of data.entries()) {
    console.log(`${key}: ${value}`);
  }
  console.log("---\nTOP SCORES:")
  for (const [key, value] of topScores.entries()) {
    console.log(`${key}: ${value}`);
  }

})();