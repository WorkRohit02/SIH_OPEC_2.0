const mongoose = require('mongoose');

/**
 * REAGENT MODEL
 *
 * Stores the colorimetric reaction knowledge base extracted from the standard
 * field drug-testing reagent reference table.
 *
 * Architecture:
 *   Camera → CV/ML classifier → detectedColors[]
 *   → backend matches against Reagent.reactions[].colorSequence
 *   → returns best-match reaction + classification result
 *
 * patternType:
 *   - SOLID       : single final colour (e.g. "Blue", "Green")
 *   - TRANSITION  : sequential colour change (e.g. "Orange → Brown")
 *   - MULTI       : multiple possible colours for different substances on same reagent
 *   - SPECKLED    : speckled / two-layer result (e.g. "Blue Specks in Pink")
 *   - CONDITIONAL : result depends on prior test outcome
 */

const ReactionSchema = new mongoose.Schema(
  {
    // Substance or substance group this reaction identifies
    testFor: {
      type: String,
      required: true,
      trim: true,
    },

    // Colour names in the exact order they appear / transition through.
    // For SOLID: single element array  ["Blue"]
    // For TRANSITION: ordered array    ["Orange", "Brown"]
    // For SPECKLED: descriptive array  ["Blue Specks in Pink"]
    colorSequence: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'colorSequence must contain at least one colour name.',
      },
    },

    // Pattern classification — used by the CV module to interpret the sequence
    patternType: {
      type: String,
      enum: ['SOLID', 'TRANSITION', 'MULTI', 'SPECKLED', 'CONDITIONAL'],
      required: true,
      default: 'SOLID',
    },

    // Additional human-readable description of the result appearance
    resultDescription: {
      type: String,
      default: '',
    },

    // Optional timing note (e.g. "within 12 seconds")
    timingNote: {
      type: String,
      default: null,
    },

    // Used when a subsequent test is required (CONDITIONAL pattern)
    conditionalNote: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

/**
 * CV Match Payload Schema (for the computer-vision integration endpoint).
 *
 * The CV module sends:
 * {
 *   "reagentName": "Marquis Reagent",
 *   "detectedColors": ["Orange", "Brown"],
 *   "confidence": 0.94
 * }
 *
 * The backend compares detectedColors against each reaction's colorSequence
 * and returns the best-matching reaction.
 *
 * This schema is NOT stored — it documents the expected CV payload shape.
 */

const ReagentSchema = new mongoose.Schema(
  {
    // Sequential test number as printed on the reference table (e.g. 1, 2, 7, 10 …)
    testNo: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    // Canonical reagent name (e.g. "Marquis Reagent")
    reagentName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Optional additional information / notes about the reagent
    notes: {
      type: String,
      default: '',
    },

    // All known reactions for this reagent
    reactions: {
      type: [ReactionSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'A Reagent must have at least one reaction entry.',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search on reagentName and reaction testFor fields
ReagentSchema.index({ reagentName: 'text', 'reactions.testFor': 'text' });

module.exports = mongoose.model('Reagent', ReagentSchema);
