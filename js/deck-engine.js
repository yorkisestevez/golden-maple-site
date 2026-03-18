// Golden Maple High-Precision Deck Logic
// Ported from DeckCraft Pro Engine (React/TypeScript)
// 2026-03-15

const MATERIAL_TIERS = [
  { id: 'pine', name: 'PT Pine 5/4×6', costPerSqft: 3.25, isComposite: false },
  { id: 'brown_pt', name: 'Brown PT 5/4×6', costPerSqft: 3.75, isComposite: false },
  { id: 'cedar', name: 'Western Red Cedar 5/4×6', costPerSqft: 6.50, isComposite: false },
  { id: 'ipe', name: 'Ipe Hardwood', costPerSqft: 28.00, isComposite: false },
  { id: 'trex_enhance', name: 'Trex Enhance', costPerSqft: 9.84, isComposite: true },
  { id: 'trex_select', name: 'Trex Select', costPerSqft: 13.07, isComposite: true },
  { id: 'trex_transcend', name: 'Trex Transcend', costPerSqft: 20.34, isComposite: true },
  { id: 'deck_venture', name: 'Deckorators Venture', costPerSqft: 8.50, isComposite: true },
  { id: 'deck_vista', name: 'Deckorators Vista', costPerSqft: 14.00, isComposite: true },
  { id: 'deck_voyage', name: 'Deckorators Voyage', costPerSqft: 21.00, isComposite: true },
  { id: 'tt_prime', name: 'TimberTech Prime (EDGE)', costPerSqft: 8.25, isComposite: true },
  { id: 'tt_terrain', name: 'TimberTech Terrain (PRO)', costPerSqft: 11.50, isComposite: true },
  { id: 'tt_vintage', name: 'TimberTech Vintage (AZEK)', costPerSqft: 23.00, isComposite: true },
];

const WASTE_FACTORS = {
  'Straight': 1.10,
  'Diagonal': 1.18,
  'Picture Frame': 1.22,
  'Herringbone': 1.25,
};

const CREW_DAY_RATES = {
  'Toronto': 1350,
  'Barrie': 1180,
  'Simcoe County': 1220,
  'Burlington-Oakville': 1220,
  'Rural-Other': 1220,
};

const PERMIT_FEES = {
  'Toronto': 215,
  'Barrie': 225,
  'Simcoe County': 200,
  'Burlington-Oakville': 280,
  'Rural-Other': 175,
};

const RAILING_COSTS = {
  'Wood Picket': { material: 35, install: 45, spacing: 6, postCost: 45 },
  'Aluminum': { material: 60, install: 55, spacing: 6, postCost: 95 },
  'Cable': { material: 90, install: 90, spacing: 4, postCost: 120 },
  'Glass Panels': { material: 160, install: 95, spacing: 3, postCost: 150 },
};

const STAIR_TREAD_COSTS = {
  'pine': 24,
  'cedar': 40,
  'composite': 85,
};

const LABOR_RATES_2026 = {
  construction: {
    standardDeckingBase: 30,
    standardDeckingMax: 45,
    structuralTieIn: 850,
    specialtyFramingSingle: 15,
    specialtyFramingDouble: 25,
  }
};

/**
 * Core Mathematical Engine
 * @param {Object} data - Input parameters
 * @returns {Object} - Detailed estimate result
 */
function calculateDeckEstimate(data) {
  const {
    width, length, height, 
    shape = 'Rectangle', 
    levels = 1, 
    pattern = 'Straight',
    deckType = 'Attached', 
    municipality = 'Barrie', 
    siteType = 'Standard', 
    soilCondition = 'Unknown', 
    foundation = 'Concrete Piers',
    deckingMaterial = 'tt_prime', 
    boardWidth = 5.5, 
    joistSpacing = 16, 
    fasteningSystem = 'Hidden', 
    pictureFrameRows = 0, 
    hasInlay = false, 
    inlayLf = 0,
    railingType = 'None', 
    railingLf = 0, 
    stairFlights = 0, 
    stairWidth = 36,
    hasDrainage = false, 
    hasDemo = false, 
    pergolaSqft = 0,
    benchLf = 0,
    privacySqft = 0,
    materialMarkup = 0
  } = data;

  // Basic Area Calculations
  const area = width * length;
  const perimeter = 2 * (width + length);
  
  const selectedMaterial = MATERIAL_TIERS.find(m => m.id === deckingMaterial) || MATERIAL_TIERS[0];
  const wasteFactor = WASTE_FACTORS[pattern] || 1.10;

  // Board Math
  const gapIn = selectedMaterial.isComposite ? 0.375 : 0.25;
  const boardCoverageFt = (boardWidth + gapIn) / 12;
  const totalDeckingLf = (area / boardCoverageFt) * wasteFactor;
  const standardBoardLength = selectedMaterial.id === 'cedar' ? 12 : 16;
  const finalBoards = Math.ceil(totalDeckingLf / standardBoardLength);
  const deckingCost = totalDeckingLf * (selectedMaterial.costPerSqft * (boardWidth / 5.5));

  // Framing Logic
  const joistSpacingFt = joistSpacing / 12;
  const joistCount = Math.ceil(width / joistSpacingFt) + 1;
  const rimLf = perimeter;
  let totalFramingLf = (joistCount * (length + 1)) + rimLf;
  
  // Foundation
  const footingCount = Math.ceil(width / 8) * Math.ceil(length / 8);
  let footingCostPerUnit = 190;
  if (foundation === 'Helical Piles') footingCostPerUnit = 475;
  if (foundation === 'Deck Blocks') footingCostPerUnit = 4.50;
  const foundationCost = footingCount * footingCostPerUnit;

  // Hardware
  const hiddenClipCost = fasteningSystem === 'Hidden' ? area * 0.85 : 0;
  const screwCost = fasteningSystem === 'Face' ? (2 * joistCount * finalBoards * 0.28) : 0;
  const hardwareTotal = hiddenClipCost + screwCost + (joistCount * 9) + (footingCount * 22);

  // Railing
  let calculatedRailingLf = 0;
  let railingTotal = 0;
  if (railingType !== 'None') {
    calculatedRailingLf = (deckType === 'Attached' ? (2 * length + width) : perimeter) - (stairFlights * stairWidth / 12);
    const rCost = RAILING_COSTS[railingType] || { material: 60, install: 55, spacing: 6, postCost: 95 };
    const sectionCount = Math.ceil(calculatedRailingLf / rCost.spacing);
    const postCount = sectionCount + 1;
    railingTotal = (calculatedRailingLf * rCost.material) + (postCount * rCost.postCost) + (sectionCount * 4 * 8.50);
  }

  // Labor
  const baseLaborRate = (LABOR_RATES_2026.construction.standardDeckingBase + LABOR_RATES_2026.construction.standardDeckingMax) / 2;
  const laborCost = area * baseLaborRate;

  // Permits & Fees
  let permitFee = 0;
  if (deckType === 'Attached' || area > 108 || height > 24) {
    permitFee = PERMIT_FEES[municipality] || 200;
  }

  // Final Aggregation
  const markupMult = 1 + (materialMarkup / 100);
  const mDecking = deckingCost * markupMult;
  const mFraming = (totalFramingLf * 4.5) * markupMult;
  const mFoundation = foundationCost * markupMult;
  const mHardware = hardwareTotal * markupMult;
  const mRailing = railingTotal * markupMult;

  const addOnCosts = (benchLf * 155 * markupMult) + (privacySqft * 70 * markupMult) + (hasDrainage ? area * 12 * markupMult : 0) + (hasDemo ? area * 14 * markupMult : 0) + (pergolaSqft * 65 * markupMult);

  const directCost = mDecking + mFraming + mFoundation + mHardware + mRailing + laborCost + permitFee + addOnCosts;
  const overhead = directCost * 0.18;
  const contingency = directCost * 0.10;
  const profit = (directCost + overhead + contingency) * 0.15;
  const total = directCost + overhead + contingency + profit;

  return {
    total: Math.round(total),
    costPerSqft: Math.round(total / area),
    area,
    sections: [
      { title: 'Foundation', total: Math.round(mFoundation) },
      { title: 'Structure', total: Math.round(mFraming) },
      { title: 'Decking', total: Math.round(mDecking) },
      { title: 'Railing', total: Math.round(mRailing) },
      { title: 'Labor', total: Math.round(laborCost) },
      { title: 'Add-ons', total: Math.round(addOnCosts) }
    ]
  };
}

// Export for browser use
if (typeof window !== 'undefined') {
  window.calculateDeckEstimate = calculateDeckEstimate;
}