// src/tools/inspect_product_quality.js
// Inspección de calidad de producto físico (ISO 8.6). isoEvent (catálogo ISO,
// NO es el evento del bus): "product_quality_inspection".
export const meta = {
  id: 'inspect_product_quality',
  name: 'Inspección de Calidad de Producto',
  version: '1.0.0',
  category: 'quality',
  consumes: ['FRAME_CAPTURED'],
  produces: ['DEFECT_FOUND']
};

export function handler (event) {
  const input = event.data || {};
  return {
    event: { type: 'DEFECT_FOUND', category: 'quality', severity: 'high' },
    asset: event.asset,
    data: {
      partId: input.partId || 'PART-001',
      defectFound: true,
      defectType: 'scratch',
      confidence: 0.92,
      frameId: input.frameId || 'FRAME-0001',
      boundingBox: { x: 120, y: 80, w: 40, h: 25 }
    }
  };
}
