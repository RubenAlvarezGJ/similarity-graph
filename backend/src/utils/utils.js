const axios = require("axios");
const cheerio = require("cheerio");
const { isAllowed } = require("./robotsUtils");

// returns true if the link is "valid" i.e we want to consider it for crawling
function isValid(link) {
  return (
    link.startsWith("https://") &&
    !link.startsWith("mailto:") &&
    !link.startsWith("javascript:")
  );
}

// Strip "www." for consistent domain comparison
function normalizeDomain(hostname) {
  return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol;
    const hostname = normalizeDomain(parsed.hostname); // strip "www."
    const pathname = parsed.pathname.replace(/\/$/, ""); // remove trailing slash
    return `${protocol}//${hostname}${pathname}`;
  } catch {
    return url; // fallback just in case
  }
}

// returns true if link is internal to the source domain
function isInternal(link, sourceDomain) {
  try {
    const url = new URL(link).hostname;
    return normalizeDomain(url) === normalizeDomain(sourceDomain);
  } catch (err) {
    return false;
  }
}

// return urls from the site (maximum of MAX_TOTAL). Limits the amount of internal links to MAX_INTERAL.
function extractUrls($, sourceDomain) {
  let internalCount = 0;
  let totalCount = 0;
  const MAX_INTERNAL = 5;
  const MAX_TOTAL = 10;
  const urls = new Set();

  $("a").each((_, element) => {
    if (totalCount >= MAX_TOTAL) return false; // breaks out early

    const url = $(element).attr("href");
    if (!url || !isValid(url)) return;

    const internal = isInternal(url, sourceDomain);
    const normalizedUrl = normalizeUrl(url);

    if (internal && internalCount < MAX_INTERNAL) {
      urls.add(normalizedUrl);
      internalCount++;
      totalCount++;
    } else if (!internal) {
      urls.add(normalizedUrl);
      totalCount++;
    }
  });

  return Array.from(urls);
}

// returns first 500 words of text from webpage.
function extractText($) {
  const raw = $("p, h1, h2, h3, li").text();
  const filtered = raw.trim().split(/\s+/);

  return filtered.slice(0, 500).join(" ");
}

// returns urls and text found in webpage
async function getData(source) {
  try {
    const allowed = await isAllowed(source);
    if (!allowed) {
      console.warn(`Skipping disallowed URL: ${source}`);
      return { urls: [], text: "", skipped: true };
    }

    const domain = new URL(source).hostname;
    const response = await axios.get(source, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    const urls = extractUrls($, domain);
    const text = extractText($);

    return { urls, text };
  } catch (err) {
    if (axios.isCancel(err)) {
      console.log("Request canceled due to timeout: ", err.message);
    } else {
      console.error("Error fetching data:", err);
    }
    return { urls: [], text: "", skipped: true };
  }
}

// returns a Map<string, number> of the top 10 scores and their urls
function getTopScores(data) {
  const topScores = [...data.entries()]
    .sort((a, b) => b[1] - a[1]) // sort in descending order
    .slice(0, 10);
  return new Map(topScores);
}

module.exports = { getData, getTopScores };
