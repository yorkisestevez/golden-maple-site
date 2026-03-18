/**
 * Golden Maple v2 Landscape Math Engine
 * Calculation logic for high-fidelity outdoor investment modeling.
 * Standards: 16-inch structural base, premium drainage, and Barrie/Simcoe labor rates.
 */

const MATERIALS = {
  patios: [
    { id: 'classic', name: 'Classic (Standard Paver)', costPerSqft: 28, description: 'Durable, high-quality concrete pavers.' },
    { id: 'signature', name: 'Signature (Modern Large Format)', costPerSqft: 38, description: 'Sleek, premium textures and clean lines.' },
    { id: 'legacy', name: 'Legacy (Natural Stone/Premium Overlay)', costPerSqft: 55, description: 'Hand-selected natural materials for estate-level finishes.' }
  ],
  walls: [
    { id: 'structural', name: 'Structural Block', costPerLf: 110, height: 2 },
    { id: 'premium', name: 'Premium Masonry Finish', costPerLf: 165, height: 2 }
  ]
};

const STRUCTURAL_STANDARDS = {
  base16: { name: '16-Inch Structural Base', mult: 1.0, description: 'Golden Maple standard for Ontario clay.' },
  drainage: { name: 'Advanced Drainage System', costPerLf: 18 }
};

export function calculateLandscapeEstimate(data) {
  const {
    patioSqft = 0,
    wallLf = 0,
    patioTier = 'signature',
    wallTier = 'structural',
    complexity = 'standard', // standard, moderate, high
    siteAccess = 'good' // good, tight, difficult
  } = data;

  const selectedPatio = MATERIALS.patios.find(p => p.id === patioTier) || MATERIALS.patios[1];
  const selectedWall = MATERIALS.walls.find(w => w.id === wallTier) || MATERIALS.walls[0];

  // 1. Patio Calculation
  // Base Excavation + Materials + Pavers + Labor
  const baseCost = patioSqft * 12; // Structural excavation and aggregate (16" standard)
  const paverCost = patioSqft * selectedPatio.costPerSqft;
  const patioTotal = baseCost + paverCost;

  // 2. Wall Calculation
  const wallBaseCost = wallLf * 45; // Footing and aggregate
  const wallMaterialCost = wallLf * selectedWall.costPerLf;
  const wallDrainage = wallLf * STRUCTURAL_STANDARDS.drainage.costPerLf;
  const wallTotal = wallBaseCost + wallMaterialCost + wallDrainage;

  // 3. Modifiers (Access & Complexity)
  const complexityMult = complexity === 'high' ? 1.35 : (complexity === 'moderate' ? 1.15 : 1.0);
  const accessMult = siteAccess === 'difficult' ? 1.25 : (siteAccess === 'tight' ? 1.10 : 1.0);

  const subtotal = (patioTotal + wallTotal) * complexityMult * accessMult;

  // 4. Project Management & Overhead
  // We model this as a "Turnkey" experience
  const projectManagement = subtotal * 0.12; 
  const equipmentMobility = 1800; // Flat mobility/setup for high-ticket projects
  
  const finalTotal = subtotal + projectManagement + equipmentMobility;

  // 5. Output Ranges (To set expectations)
  // Low end assumes favorable conditions, high end adds 15% buffer
  const lowRange = Math.floor(finalTotal / 1000) * 1000;
  const highRange = Math.ceil((finalTotal * 1.15) / 1000) * 1000;

  return {
    ranges: {
      low: lowRange,
      high: highRange
    },
    breakdown: {
      patio: Math.round(patioTotal),
      wall: Math.round(wallTotal),
      logistics: Math.round(projectManagement + equipmentMobility)
    },
    specs: {
      excavationTons: Math.round((patioSqft * 1.33) / 20 * 10) / 10, // Rough tonnage estimate
      structuralStandard: '16-Inch Base Engineered'
    }
  };
}
