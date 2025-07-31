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

// return urls from the site (maximum of MAX_TOTAL). Limits the amount of internal links to MAX_INTERAL.
function extractUrls($, sourceDomain) {
  let internalCount = 0;
  let totalCount = 0;
  const MAX_INTERNAL = 5;
  const MAX_TOTAL = 10;
  const urls = [];

  $('a').each((_, element) => {
    if (totalCount >= MAX_TOTAL) return false; // breaks out early 

    const url = $(element).attr('href');
    if (!url || !isValid(url)) return;

    const internal = isInternal(url, sourceDomain);

    if (internal && (internalCount < MAX_INTERNAL)) {
      urls.push(url);
      internalCount++;
      totalCount++;
    }
    else if (!internal) {
      urls.push(url);
      totalCount++
    } 
  });

  return urls;
}

// returns first 500 words of text from webpage.
function extractText($) {
  const raw = $('p, h1, h2, h3, li').text();
  const filtered = raw.trim().split(/\s+/);

  return filtered.splice(0, 500).join(' ');
}

// returns urls and text found in webpage
async function getData(source) {
  try {
    const domain = new URL(source).hostname;
    const response = await axios.get(source, {timeout: 10000});
    const $ = cheerio.load(response.data);

    const urls = extractUrls($, domain);
    const text = extractText($);

    return { urls, text };
  }
  catch (err) {
    if (axios.isCancel(err)) {
      console.log("Request canceled due to timeout: ", err.message);
    }
    else {
      console.error("Error fetching data:", err);
    }
    return { urls: [], text: ""};
  }
}

module.exports = { getData };