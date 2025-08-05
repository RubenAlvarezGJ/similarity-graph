const express = require("express");
const cors = require("cors");
const { crawl } = require("./crawler");
const { getSimilarityScores } = require("./similarity");
const { getTopScores } = require("./utils/utils");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // for development purposes

app.get("/crawl", async (req, res) => {
  const sourceUrl = req.query.url;

  if (!sourceUrl) {
    // fallback, frontend checks for empty url
    return res.status(400).json({ error: "Missing url query parameter" });
  }

  try {
    const data = await crawl(sourceUrl);

    if (data.size === 0) {
      return res.status(400).json({
        error:
          "Crawling was blocked or no usable content was found at the source URL.",
      });
    }

    const sourceText = data.get(sourceUrl);
    getSimilarityScores(sourceText, data);
    const topScores = getTopScores(data);

    const results = Array.from(topScores.entries()).map(([url, score]) => {
      return { url, score };
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unexpected Error. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at on port ${PORT})`);
});
