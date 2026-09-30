const reagentService = require('../services/reagent.service');
const { sendSuccess } = require('../utils/response');

/**
 * REAGENT CONTROLLER
 * Handles colorimetric knowledge-base queries and CV color-matching.
 */

/** GET /api/reagents — all reagents */
const getAllReagents = async (req, res, next) => {
  try {
    const reagents = await reagentService.getAllReagents();
    return sendSuccess(res, `${reagents.length} reagent(s) found`, { reagents }, 200);
  } catch (error) {
    next(error);
  }
};

/** GET /api/reagents/search?name=Marquis — search by reagent name */
const searchByName = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) {
      const err = new Error('Query parameter ?name= is required.');
      err.statusCode = 400;
      throw err;
    }
    const reagents = await reagentService.searchByReagentName(name);
    return sendSuccess(res, `${reagents.length} reagent(s) matched`, { reagents }, 200);
  } catch (error) {
    next(error);
  }
};

/** GET /api/reagents/reactions?substance=Heroin — search reactions by substance */
const searchBySubstance = async (req, res, next) => {
  try {
    const { substance } = req.query;
    if (!substance) {
      const err = new Error('Query parameter ?substance= is required.');
      err.statusCode = 400;
      throw err;
    }
    const results = await reagentService.searchByTestFor(substance);
    return sendSuccess(res, `Found ${results.length} reagent(s) with matching reactions`, { results }, 200);
  } catch (error) {
    next(error);
  }
};

/** POST /api/reagents/match — CV color-match engine */
const matchColors = async (req, res, next) => {
  try {
    const { reagentName, detectedColors, confidence } = req.body;
    const result = await reagentService.matchByColors({ reagentName, detectedColors, confidence });
    return sendSuccess(
      res,
      result.matched ? 'Reaction match found' : 'No confident match — result inconclusive',
      result,
      200
    );
  } catch (error) {
    next(error);
  }
};

/** GET /api/reagents/:id — single reagent by MongoDB _id */
const getReagentById = async (req, res, next) => {
  try {
    const reagent = await reagentService.getReagentById(req.params.id);
    return sendSuccess(res, 'Reagent found', { reagent }, 200);
  } catch (error) {
    next(error);
  }
};

/** GET /api/reagents/:id/reactions — reactions for a reagent */
const getReactions = async (req, res, next) => {
  try {
    const data = await reagentService.getReactionsForReagent(req.params.id);
    return sendSuccess(res, `${data.reactions.length} reaction(s) for ${data.reagentName}`, data, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReagents,
  searchByName,
  searchBySubstance,
  matchColors,
  getReagentById,
  getReactions,
};
