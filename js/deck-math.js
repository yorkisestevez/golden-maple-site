/**
 * Golden Maple v2 Deck Math Engine
 * Ported for high-performance Vanilla JS execution.
 * Standard: 2026 Ontario Building Code & Industry Rates.
 */

const MATERIALS = [
  { id: 'pt_pine', name: 'Premium PT Pine', costPerSqft: 3.25, isComposite: false },
  { id: 'cedar', name: 'Western Red Cedar', costPerSqft: 6.50, isComposite: false },
  { id: 'trex_enhance', name: 'Trex Enhance®', costPerSqft: 5.75, isComposite: true },
  { id: 'trex_transcend', name: 'Trex Transcend®', costPerSqft: 12.50, isComposite: true },
  { id: 'deck_voyage', name: 'Deckorators Voyage', costPerSqft: 14.25, isComposite: true }
];

const RAILING_COSTS = {
  'Aluminum': { material: 55, install: 45, spacing: 6, postCost: 95 },
  'Glass Panels': { material: 140, install: 85, spacing: 4, postCost: 155 },
  'Cable': { material: 110, install: 120, spacing: 5, postCost: 125 },
  'Wood Picket': { material: 25, install: 35, spacing: 8, postCost: 45 }
};

export function calculateDeckEstimate(data) {
  const {
    width, length, deckingMaterialId, railingType, pattern
  } = data;

  const area = width * length;
  const perimeter = 2 * (width + length);
  const selectedMaterial = MATERIALS.find(m => m.id === deckingMaterialId) || MATERIALS[0];
  
  // Math simplified for the front-end "Premium" experience
  const boardWidthIn = 5.5;
  const gapIn = selectedMaterial.isComposite ? 0.375 : 0.25;
  const boardCoverageFt = (boardWidthIn + gapIn) / 12;
  const wasteFactor = pattern === 'Diagonal' ? 1.20 : 1.10;
  
  const totalDeckingLf = (area / boardCoverageFt) * wasteFactor;
  const deckingCost = totalDeckingLf * selectedMaterial.costPerSqft;

  // Framing (PT 2x10 Standard)
  const joistSpacingFt = (pattern === 'Diagonal' ? 12 : 16) / 12;
  const joistCount = Math.ceil(width / joistSpacingFt) + 1;
  const joistLength = length + 1;
  const totalFramingLf = (joistCount * joistLength) + perimeter;
  const framingCost = totalFramingLf * 4.50;

  // Railing
  let railingTotal = 0;
  if (railingType !== 'None') {
    const r = RAILING_COSTS[railingType];
    const railingLf = perimeter * 0.75; // Simplified for estimator
    const sections = Math.ceil(railingLf / r.spacing);
    const posts = sections + 1;
    railingTotal = (railingLf * (r.material + r.install)) + (posts * r.postCost);
  }

  // Labor
  const baseLabor = area * 18.50; // Ontario Standard Base
  const complexityMult = pattern === 'Diagonal' ? 1.25 : 1.0;
  const laborTotal = baseLabor * complexityMult;

  const subtotal = deckingCost + framingCost + railingTotal + laborTotal;
  const overhead = subtotal * 0.15;
  const profit = (subtotal + overhead) * 0.15;
  const total = subtotal + overhead + profit;

  return {
    total: Math.ceil(total / 100) * 100, // Round to nearest 100
    sqft: area,
    costPerSqft: (total / area).toFixed(2),
    breakdown: {
      materials: Math.ceil(deckingCost + framingCost),
      railing: Math.ceil(railingTotal),
      labor: Math.ceil(laborTotal)
    }
  };
}
