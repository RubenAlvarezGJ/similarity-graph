const axios = require('axios');
const cheerio = require('cheerio');

// returns true if the link is "valid" i.e we want to consider it for crawling
function isValid(link) {
  return (
    link.startsWith('https://') &&
    !link.startsWith('mailto:') &&
    !link.startsWith('javascript:')
  );
}

// Strip "www." for consistent domain comparison
function normalizeDomain(hostname) {
  return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
}

// returns true if link is internal to the source domain
function isInternal(link, sourceDomain) {
  try {
    const url = new URL(link).hostname;
    return normalizeDomain(url) === normalizeDomain(sourceDomain);
  }
  catch (err) {
    return false;
  }
}

// extract a limited number of internal and external links from source url
async function getLinks(source) {
  try {
    const links = [];
    let internalCount = 0;
    let totalCount = 0;
    const MAX_INTERNAL = 5;
    const MAX_TOTAL_LINKS = 10;

    const domain = new URL(source).hostname;
    const response = await axios.get(source, {timeout: 5000});
    const $ = cheerio.load(response.data);

    $('a').each((_, el) => {
      if (totalCount >= MAX_TOTAL_LINKS) return false; // breaks out early 

      const link = $(el).attr('href');
      if (!link || !isValid(link)) return;

      const internal = isInternal(link, domain);

      if (internal && (internalCount < MAX_INTERNAL)) {
        links.push(link);
        internalCount++;
        totalCount++;
      }
      else if (!internal) {
        links.push(link);
        totalCount++
      }
    });

    return links;
  }
  catch (err) {
    if (axios.isCancel(err)) {
      console.log("Request canceled due to timeout: ", err.message);
    }
    else {
      console.error("Error fetching data:", err);
    }
    return [];
  }
}

module.exports = { getLinks };