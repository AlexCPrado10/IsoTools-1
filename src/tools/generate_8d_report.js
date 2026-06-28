// src/tools/generate_8d_report.js
// Acción correctiva formal en formato 8D (ISO 10.2). isoEvent: "8d_report_issued".
export const meta = {
  id: 'generate_8d_report',
  name: 'Generación de Reporte 8D',
  version: '1.0.0',
  category: 'quality',
  consumes: ['NC_REQUIRES_8D'],
  produces: ['8D_REPORT_ISSUED']
};

export function handler (event) {
  const input = event.data || {};
  return {
    event: { type: '8D_REPORT_ISSUED', category: 'quality', severity: 'medium' },
    asset: event.asset,
    data: {
      reportId: '8D-2026-0007',
      ncId: input.ncId || 'NC-2026-0007',
      d3ContainmentActions: ['Cuarentena del lote afectado'],
      d4RootCauses: ['Desgaste de herramienta de corte'],
      d5CorrectiveActions: ['Reemplazo de herramienta y ajuste de plan de calibración'],
      d8LessonsLearned: 'Incluir verificación de desgaste en checklist diario',
      pdfUrl: '/downloads/8D-2026-0007.pdf'
    }
  };
}
