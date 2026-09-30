const express = require('express');
const router = express.Router();
const reagentController = require('../controllers/reagent.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * REAGENT ROUTES  — /api/reagents
 *
 * GET  endpoints are public (read-only knowledge base — no auth required).
 * POST /match requires auth (called by the CV pipeline with a JWT).
 */

// ── Search routes (must be before /:id to avoid collision) ─────────────────
router.get('/search',    reagentController.searchByName);      // ?name=Marquis
router.get('/reactions', reagentController.searchBySubstance); // ?substance=Heroin

// ── CV color-match (protected — CV module sends JWT) ───────────────────────
router.post('/match', protect, reagentController.matchColors);

// ── Catalogue routes ────────────────────────────────────────────────────────
router.get('/',             reagentController.getAllReagents);
router.get('/:id',          reagentController.getReagentById);
router.get('/:id/reactions', reagentController.getReactions);

module.exports = router;
