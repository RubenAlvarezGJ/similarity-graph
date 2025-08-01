const express = require("express");
const cors = require("cors");
const { crawl } = require("./crawler");
const { getSimilarityScores } = require("./similarity");
const { getTopScores } = require("./utils");

const app = express();
const PORT = 3000;

app.use(cors()); // for development purposes

app.get("/crawl", async (req, res) => {
  const sourceUrl = req.query.url;

  if (!sourceUrl) {
    return res.status(400).json({ error: "Missing url query parameter" });
  }

  try {
    const data = await crawl(sourceUrl);
    const sourceText = data.values().next().value;

    getSimilarityScores(sourceText, data);

    const topScores = getTopScores(data);

    const results = Array.from(topScores.entries()).map(([url, score]) => {
      return { url, score };
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    req.status(500).json({ error: "Failed to compute similarity scores" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT})`);
});
