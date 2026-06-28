// src/tools/track_project_progress.js
// Plan de implementación gestionado por hitos de cláusula. isoEvent: "project_progress_update".
export const meta = {
  id: 'track_project_progress',
  name: 'Seguimiento de Avance de Proyecto',
  version: '1.0.0',
  category: 'system',
  consumes: ['KPI_REPORT_GENERATED'],
  produces: ['PROJECT_AT_RISK']
};

export function handler (event) {
  const input = event.data || {};
  return {
    event: { type: 'PROJECT_AT_RISK', category: 'system', severity: 'medium' },
    asset: event.asset,
    data: {
      projectId: input.projectId || 'ISO9001-IMPL',
      completionPercent: 62,
      milestonesCompleted: 5,
      milestonesTotal: 9,
      budgetUsedPercent: 78,
      status: 'at_risk' // dispara la regla track→followups (status == 'at_risk')
    }
  };
}
