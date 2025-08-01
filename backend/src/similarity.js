const natural = require("natural");

/**
 * Creates a shared vocabulary (unique word list) between two token arrays.
 *
 * @param {string[]} sourceText - Tokenized words from the source text.
 * @param {string[]} text - Tokenized words from the comparison text.
 * @returns {string[]} Array of unique words appearing in either token list.
 */
function createVocab(sourceText, text) {
  const vocabSet = new Set([...sourceText, ...text]); // to remove duplicated
  const vocabArray = Array.from(vocabSet); // need an array for .map() functionality
  return vocabArray;
}

/**
 * Computes the TF-IDF vector for a piece of text using a shared vocabulary.
 *
 * @param {object} tfidf - A natural.TfIdf instance containing all documents (texts).
 * @param {string[]} vocab - Array of all unique words across source and text.
 * @param {number} docIndex - Index of the document in the TF-IDF store.
 * @returns {number[]} TF-IDF vector of the document, aligned to vocab order.
 */
function computeVector(tfidf, vocab, textIdx) {
  const vector = vocab.map((word) => {
    return tfidf.tfidf(word, textIdx);
  });
  return vector;
}

/**
 * Computes the cosine similarity between two numeric vectors.
 *
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} Cosine similarity score between 0 and 1 (or 0 if undefined).
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0; // avoid division by zero
}

/**
 * Calculates cosine similarity scores between a source text and a list of documents.
 *
 * @param {string} sourceText - The base text to compare all others against.
 * @param {Map<string, string>} data - A Map of URLs to their associated text content.
 *                                     Each value will be replaced with a similarity score (0–1).
 * @returns {void} Modifies the input Map to store similarity scores instead of text.
 */
function getSimilarityScores(sourceText, data) {
  const tfidf = new natural.TfIdf();
  const tokenizer = new natural.WordTokenizer();

  const sourceTokenized = tokenizer.tokenize(sourceText.toLowerCase());
  tfidf.addDocument(sourceTokenized);

  let textIdx = 1; // index into the tfidf store
  for (const [url, text] of data) {
    // create shared vocab
    const textTokenized = tokenizer.tokenize(text.toLowerCase());
    const sharedVocab = createVocab(sourceTokenized, textTokenized);

    //tfidf vector calculation
    tfidf.addDocument(textTokenized);

    const sourceVector = computeVector(tfidf, sharedVocab, 0); // sourceTokenized added outside the loop so it's always at idx 0;
    const textVector = computeVector(tfidf, sharedVocab, textIdx);

    // cosine similarity calculation
    const similarityScore = cosineSimilarity(sourceVector, textVector);

    // map url to its similarityScore
    data.set(url, similarityScore);
    textIdx++;
  }
}

module.exports = { getSimilarityScores };
