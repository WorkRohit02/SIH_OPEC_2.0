const Reagent = require('../models/Reagent');

/**
 * REAGENT SERVICE
 *
 * Knowledge-base queries for the colorimetric reagent reference table.
 *
 * CV Integration:
 *   The matchByColors method accepts a payload shaped like:
 *   { reagentName, detectedColors, confidence }
 *   and returns the best-matching reaction(s) from the stored knowledge base.
 */

/**
 * Returns all reagents (with all reactions).
 */
const getAllReagents = async () => {
  return Reagent.find().sort({ testNo: 1 }).lean();
};

/**
 * Returns a single reagent by MongoDB _id.
 */
const getReagentById = async (id) => {
  const reagent = await Reagent.findById(id).lean();
  if (!reagent) {
    const err = new Error(`Reagent with id '${id}' not found.`);
    err.statusCode = 404;
    throw err;
  }
  return reagent;
};

/**
 * Returns a single reagent by testNo.
 */
const getReagentByTestNo = async (testNo) => {
  const reagent = await Reagent.findOne({ testNo: Number(testNo) }).lean();
  if (!reagent) {
    const err = new Error(`Reagent No. ${testNo} not found.`);
    err.statusCode = 404;
    throw err;
  }
  return reagent;
};

/**
 * Search reagents by reagentName (partial, case-insensitive).
 */
const searchByReagentName = async (name) => {
  return Reagent.find({
    reagentName: { $regex: name, $options: 'i' },
  })
    .sort({ testNo: 1 })
    .lean();
};

/**
 * Search all reactions across all reagents by substance name (testFor).
 * Returns an array of { reagent, matchingReactions }.
 */
const searchByTestFor = async (substance) => {
  const reagents = await Reagent.find({
    'reactions.testFor': { $regex: substance, $options: 'i' },
  })
    .sort({ testNo: 1 })
    .lean();

  return reagents.map((r) => ({
    testNo: r.testNo,
    reagentName: r.reagentName,
    reagentId: r._id,
    matchingReactions: r.reactions.filter((rx) =>
      rx.testFor.toLowerCase().includes(substance.toLowerCase())
    ),
  }));
};

/**
 * Returns only the reactions array for a given reagent _id.
 */
const getReactionsForReagent = async (id) => {
  const reagent = await Reagent.findById(id).select('reactions reagentName testNo').lean();
  if (!reagent) {
    const err = new Error(`Reagent with id '${id}' not found.`);
    err.statusCode = 404;
    throw err;
  }
  return reagent;
};

/**
 * CV COLOR-MATCH ENGINE
 *
 * Accepts a CV classifier payload and returns ranked matching reactions.
 *
 * Input:
 *   {
 *     reagentName: "Marquis Reagent",
 *     detectedColors: ["Orange", "Brown"],
 *     confidence: 0.94
 *   }
 *
 * Output:
 *   {
 *     matched: true | false,
 *     bestMatch: { testFor, colorSequence, patternType, score },
 *     allMatches: [...],
 *     cvConfidence: 0.94,
 *     reagent: { testNo, reagentName }
 *   }
 *
 * Scoring:
 *   - Exact sequence match → score 1.0
 *   - All detected colors present in stored sequence (any order) → score 0.7
 *   - Partial overlap → score = overlap / max(len1, len2)
 *   - No overlap → score 0
 */
const matchByColors = async ({ reagentName, detectedColors, confidence = 0 }) => {
  if (!reagentName || !Array.isArray(detectedColors) || detectedColors.length === 0) {
    const err = new Error('reagentName and detectedColors[] are required.');
    err.statusCode = 400;
    throw err;
  }

  // Find the reagent (case-insensitive)
  const reagent = await Reagent.findOne({
    reagentName: { $regex: `^${reagentName.trim()}$`, $options: 'i' },
  }).lean();

  if (!reagent) {
    const err = new Error(`Reagent '${reagentName}' not found in knowledge base.`);
    err.statusCode = 404;
    throw err;
  }

  const normalise = (s) => s.toLowerCase().trim();
  const detected = detectedColors.map(normalise);

  const scoredMatches = reagent.reactions.map((reaction) => {
    const stored = reaction.colorSequence.map(normalise);

    // 1. Exact ordered sequence match
    const exactMatch =
      stored.length === detected.length &&
      stored.every((c, i) => c === detected[i]);

    if (exactMatch) {
      return { ...reaction, score: 1.0, matchType: 'EXACT' };
    }

    // 2. All detected colours present in stored sequence (order ignored)
    const allPresent = detected.every((c) => stored.includes(c));
    if (allPresent) {
      return { ...reaction, score: 0.85, matchType: 'ALL_COLORS_PRESENT' };
    }

    // 3. Partial overlap score
    const overlap = detected.filter((c) => stored.includes(c)).length;
    const score = overlap / Math.max(stored.length, detected.length);
    return { ...reaction, score: parseFloat(score.toFixed(3)), matchType: 'PARTIAL' };
  });

  scoredMatches.sort((a, b) => b.score - a.score);
  const bestMatch = scoredMatches[0];
  const MATCH_THRESHOLD = 0.5;

  return {
    matched: bestMatch.score >= MATCH_THRESHOLD,
    bestMatch,
    allMatches: scoredMatches,
    cvConfidence: confidence,
    reagent: {
      testNo: reagent.testNo,
      reagentName: reagent.reagentName,
      reagentId: reagent._id,
    },
  };
};

module.exports = {
  getAllReagents,
  getReagentById,
  getReagentByTestNo,
  searchByReagentName,
  searchByTestFor,
  getReactionsForReagent,
  matchByColors,
};
