/**
 * REAGENT SEED DATA
 *
 * Source of truth: Standard Field Drug-Testing Reagent Reference Table (image).
 * All colour names are transcribed exactly as labelled in that table.
 * No HEX / RGB values are invented — colour names only.
 *
 * Rows marked [UNREADABLE] indicate any text that could not be clearly read.
 * None found in this table — all rows were clearly legible.
 */

const REAGENTS = [
  {
    testNo: 1,
    reagentName: 'Marquis Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Amphetamines/Methamphetamine',
        colorSequence: ['Orange', 'Brown'],
        patternType: 'TRANSITION',
        resultDescription: 'Orange turning to Brown',
        timingNote: 'within 12 seconds',
      },
      {
        testFor: 'Heroin/Morphine',
        colorSequence: ['Orange', 'Purple'],
        patternType: 'TRANSITION',
        resultDescription: 'Orange turning to Purple',
      },
      {
        testFor: 'MDMA (Ecstasy)',
        colorSequence: ['Orange', 'Black'],
        patternType: 'TRANSITION',
        resultDescription: 'Orange turning to Black',
      },
    ],
  },

  {
    testNo: 2,
    reagentName: 'Nitric Acid Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Heroin',
        colorSequence: ['Yellow', 'Green-Yellow'],
        patternType: 'TRANSITION',
        resultDescription: 'Yellow turning to Green-Yellow',
      },
      {
        testFor: 'Morphine',
        colorSequence: ['Orange-Yellow', 'Yellow'],
        patternType: 'TRANSITION',
        resultDescription: 'Orange-Yellow turning to Yellow',
      },
    ],
  },

  {
    testNo: 3,
    reagentName: 'Dille-Koppanyi Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Barbiturates',
        colorSequence: ['Clear', 'Lavender'],
        patternType: 'TRANSITION',
        resultDescription: 'Clear turning to Lavender',
      },
    ],
  },

  {
    testNo: 4,
    reagentName: "Ehrlich's Reagent",
    notes: '',
    reactions: [
      {
        testFor: 'LSD (Lysergic Acid Diethylamide)',
        colorSequence: ['Clear', 'Lavender', 'Purple'],
        patternType: 'TRANSITION',
        resultDescription: 'Clear turning to Lavender then Purple',
      },
    ],
  },

  {
    testNo: 5,
    reagentName: 'Duquenois-Levine Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Marijuana, THC',
        colorSequence: ['Clear', 'Purplish-Blue', 'Light Blue-Purple over Dark Purple'],
        patternType: 'TRANSITION',
        resultDescription: 'Clear to Purplish-Blue, final result Light Blue-Purple over Dark Purple',
      },
    ],
  },

  {
    testNo: 7,
    reagentName: 'Scott Reagent (modified)',
    notes: '',
    reactions: [
      {
        testFor: 'Cocaine HCl (powder)',
        colorSequence: ['Blue', 'Pink', 'Pink over Blue'],
        patternType: 'TRANSITION',
        resultDescription: 'Blue turning to Pink, settling as Pink over Blue',
      },
      {
        testFor: 'Cocaine Base (crack, freebase)',
        colorSequence: ['Blue Specks in Pink', 'Pink', 'Pink over Blue'],
        patternType: 'TRANSITION',
        resultDescription: 'Starts as Blue Specks in Pink, transitions to Pink, then Pink over Blue',
      },
    ],
  },

  {
    testNo: 8,
    reagentName: 'Methadone Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Methadone',
        colorSequence: ['Blue'],
        patternType: 'SOLID',
        resultDescription: 'Blue',
      },
    ],
  },

  {
    testNo: 9,
    reagentName: 'PCP Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'PCP (Phencyclidine)',
        colorSequence: ['Blue Specks in Pink', 'Blue'],
        patternType: 'MULTI',
        resultDescription: 'Blue Specks in Pink or Blue',
      },
      {
        testFor: 'Methaqualone',
        colorSequence: ['Clear', 'Blue'],
        patternType: 'TRANSITION',
        resultDescription: 'Clear turning to Blue',
      },
    ],
  },

  {
    testNo: 10,
    reagentName: 'Special Opiates Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Codeine',
        colorSequence: ['Green'],
        patternType: 'SOLID',
        resultDescription: 'Green',
      },
      {
        testFor: 'Heroin, Morphine, Buprenorphine (Suboxone®)',
        colorSequence: ['Purple'],
        patternType: 'SOLID',
        resultDescription: 'Purple',
      },
      {
        testFor: 'Oxycodone, Fentanyl',
        colorSequence: ['Yellow'],
        patternType: 'SOLID',
        resultDescription: 'Yellow',
      },
    ],
  },

  {
    testNo: 11,
    reagentName: "Mecke's Modified Reagent",
    notes: '',
    reactions: [
      {
        testFor: 'Heroin (white, brown, black tar)',
        colorSequence: ['Clear', 'Green'],
        patternType: 'TRANSITION',
        resultDescription: 'Clear turning to Green',
      },
    ],
  },

  {
    testNo: 12,
    reagentName: 'Frohdes Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Pentazocine',
        colorSequence: ['Purple', 'Yellow'],
        patternType: 'TRANSITION',
        resultDescription: 'Purple turning to Yellow',
      },
      {
        testFor: 'DMT',
        colorSequence: ['Orange-Yellow', 'Orange'],
        patternType: 'TRANSITION',
        resultDescription: 'Orange-Yellow turning to Orange',
      },
    ],
  },

  {
    testNo: 13,
    reagentName: 'Ephedrine Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Ephedrine/Pseudoephedrine',
        colorSequence: ['Clear', 'Bluish-Purple'],
        patternType: 'TRANSITION',
        resultDescription: 'Clear turning to Bluish-Purple',
      },
    ],
  },

  {
    testNo: 14,
    reagentName: 'Valium, Rohypnol, Methcathinone Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Valium, Rohypnol',
        colorSequence: ['Clear', 'Lavender'],
        patternType: 'TRANSITION',
        resultDescription: 'Clear turning to Lavender',
      },
      {
        testFor: 'Methcathinone',
        colorSequence: ['Clear', 'Brown'],
        patternType: 'TRANSITION',
        resultDescription: 'Clear turning to Brown',
      },
    ],
  },

  {
    testNo: 15,
    reagentName: 'Sodium Nitroprusside Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Methamphetamine, MDMA',
        colorSequence: ['Clear', 'Clear', 'Navy Blue'],
        patternType: 'TRANSITION',
        resultDescription: 'Clear → Clear → Navy Blue (two-stage process)',
      },
    ],
  },

  {
    testNo: 19,
    reagentName: "Mayer's Reagent",
    notes: '',
    reactions: [
      {
        testFor: 'Narcotic Alkaloids',
        colorSequence: ['Tan/Cream'],
        patternType: 'SOLID',
        resultDescription: 'Tan/Cream',
      },
    ],
  },

  {
    testNo: 20,
    reagentName: 'KN (Fast B Blue Salt) Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Marijuana, THC',
        colorSequence: ['Clear', 'Tan', 'Red-Brown'],
        patternType: 'MULTI',
        resultDescription: 'Clear or Tan turning to Red-Brown',
      },
    ],
  },

  {
    testNo: 21,
    reagentName: 'GHB Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'GHB',
        colorSequence: ['Teal'],
        patternType: 'SOLID',
        resultDescription: 'Teal',
      },
    ],
  },

  {
    testNo: 22,
    reagentName: 'Mandelin Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Methadone',
        colorSequence: ['Olive', 'Dark Aqua'],
        patternType: 'TRANSITION',
        resultDescription: 'Olive turning to Dark Aqua',
      },
      {
        testFor: 'Amphetamines',
        colorSequence: ['Green-Yellow'],
        patternType: 'SOLID',
        resultDescription: 'Green-Yellow',
      },
      {
        testFor: 'Methamphetamine',
        colorSequence: ['Yellow-Green'],
        patternType: 'SOLID',
        resultDescription: 'Yellow-Green',
      },
    ],
  },

  {
    testNo: 23,
    reagentName: 'Synthetic Cannabinoid Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Synthetic cannabinoids (JWH-018, JWH-073, JWH-250, CP-47, 497, HU-210)',
        colorSequence: ['Clear', 'Yellow', 'Orange'],
        patternType: 'MULTI',
        resultDescription: 'Clear turning to Yellow or Orange',
      },
    ],
  },

  {
    testNo: 24,
    reagentName: 'MDPV Reagent',
    notes: 'If result is Clear, proceed to Test 25',
    reactions: [
      {
        testFor: 'Methylenedioxypyrovalerone (Bath Salts)',
        colorSequence: ['Yellow', 'Green-Yellow', 'Clear'],
        patternType: 'CONDITIONAL',
        resultDescription: 'Yellow or Green-Yellow; if Clear proceed to Test 25',
        conditionalNote: 'If Clear, proceed to Test 25 (Mephedrone Reagent)',
      },
    ],
  },

  {
    testNo: 25,
    reagentName: 'Mephedrone Reagent',
    notes: '',
    reactions: [
      {
        testFor: '4-methylmethcathinone (4-MMC)',
        colorSequence: ['Clear', 'Purple'],
        patternType: 'TRANSITION',
        resultDescription: 'Clear turning to Purple',
      },
    ],
  },

  {
    testNo: 26,
    reagentName: 'a-PVP Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'alpha-pyrrolidinopentiophenone',
        colorSequence: ['Blue Specks in Pink', 'Pink', 'Pink over Blue'],
        patternType: 'TRANSITION',
        resultDescription: 'Blue Specks in Pink turning to Pink, then Pink over Blue',
      },
    ],
  },

  {
    testNo: 27,
    reagentName: 'Weber Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Psilocybin (magic Mushrooms)',
        colorSequence: ['Red', 'Dark Aqua'],
        patternType: 'TRANSITION',
        resultDescription: 'Red turning to Dark Aqua',
      },
    ],
  },

  {
    testNo: 29,
    reagentName: '2C Reagent',
    notes: '',
    reactions: [
      {
        testFor: '2C-B, 2C-C, 2C-3, 2C-I, 2C-N, 2C-T7',
        colorSequence: ['Yellow', 'Yellow-Green', 'Light Green', 'Brown', 'Red-Purple', 'Purple'],
        patternType: 'MULTI',
        resultDescription: 'Yellow; Yellow-Green; Light Green; Brown; Red-Purple; or Purple depending on specific compound',
      },
    ],
  },

  {
    testNo: 30,
    reagentName: 'Psilocybin/Psilocin Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Psilocybin',
        colorSequence: ['Pink'],
        patternType: 'SOLID',
        resultDescription: 'Pink',
      },
      {
        testFor: 'Psilocin',
        colorSequence: ['Purple'],
        patternType: 'SOLID',
        resultDescription: 'Purple',
      },
    ],
  },

  {
    testNo: 31,
    reagentName: 'Liebermann Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Amphetamine',
        colorSequence: ['Green'],
        patternType: 'SOLID',
        resultDescription: 'Green',
      },
      {
        testFor: 'Methamphetamine',
        colorSequence: ['Orange'],
        patternType: 'SOLID',
        resultDescription: 'Orange',
      },
      {
        testFor: 'Morphine',
        colorSequence: ['Black'],
        patternType: 'SOLID',
        resultDescription: 'Black',
      },
    ],
  },

  {
    testNo: 32,
    reagentName: 'Mollies Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'MDMA/MDMA Analogs',
        colorSequence: ['Orange', 'Black'],
        patternType: 'TRANSITION',
        resultDescription: 'Orange turning to Black',
      },
      {
        testFor: '2C/MDPV/Mephedrone',
        colorSequence: ['Yellow', 'Green-Yellow', 'Clear'],
        patternType: 'TRANSITION',
        resultDescription: 'Yellow or Green-Yellow turning to Clear',
      },
      {
        testFor: 'Amphetamines/Meth',
        colorSequence: ['Orange', 'Brown'],
        patternType: 'TRANSITION',
        resultDescription: 'Orange turning to Brown',
      },
    ],
  },

  {
    testNo: 33,
    reagentName: 'Fentanyl Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Fentanyl (Acetyl-fentanyl)/Heroin',
        colorSequence: ['Orange', 'Purple'],
        patternType: 'MULTI',
        resultDescription: 'Orange; Purple',
      },
    ],
  },

  {
    testNo: 34,
    reagentName: 'Hemp/CBD Reagent',
    notes: '',
    reactions: [
      {
        testFor: 'Hemp/CBD',
        colorSequence: ['Purple', 'Teal Blue'],
        patternType: 'MULTI',
        resultDescription: 'Purple; Teal Blue',
      },
    ],
  },
];

module.exports = REAGENTS;
