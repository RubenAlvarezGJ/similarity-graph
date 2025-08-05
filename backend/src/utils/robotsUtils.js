const axios = require("axios");
const robotsParser = require("robots-parser");

const robotsCache = new Map();

async function isAllowed(url, userAgent = "Allied_Mastercomputer") {
  try {
    const { origin } = new URL(url);

    if (!robotsCache.has(origin)) {
      const robotsUrl = `${origin}/robots.txt`;
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      const robotsTxt = response.data;
      const parser = robotsParser(robotsUrl, robotsTxt);
      robotsCache.set(origin, parser);
    }

    const parser = robotsCache.get(origin);
    return parser.isAllowed(url, userAgent);
  } catch (err) {
    console.warn(`robots.txt check failed for ${url}: assuming allowed`);
    return true;
  }
}

module.exports = { isAllowed };
