// src/tools/detect_business_anomalies.js
// Procesos con variabilidad inexplicada (diagnóstico y mejora). isoEvent: "business_anomaly_detected".
export const meta = {
  id: 'detect_business_anomalies',
  name: 'Detección de Anomalías de Negocio',
  version: '1.0.0',
  category: 'productivity',
  consumes: ['FORECAST_READY', 'PRODUCTION_VARIANCE_DETECTED'],
  produces: ['BUSINESS_ANOMALY_DETECTED']
};

export function handler (event) {
  const input = event.data || {};
  const sensitivityLevel = (input.sensitivityLevel || 'medium').toLowerCase();
  const thresholds = { low: 3, medium: 2, high: 1.5 };
  const zThreshold = thresholds[sensitivityLevel] || 2;

  // default historical baselines (deterministic simple arrays)
  const baseline = Object.assign({
    scrap_rate: [1.0,1.2,1.1,1.3,1.0,1.2,1.1,1.15,1.05,1.25],
    production_efficiency: [88,87,89,90,86,88,87,89,88,90],
    energy_consumption: [120,118,121,119,122,117,120,118,121,119],
    downtime: [10,12,9,11,10,13,8,9,11,10]
  }, input.metrics || {});

  const stats = (arr) => {
    const m = arr.reduce((a,b)=>a+b,0)/arr.length;
    const sd = Math.sqrt(arr.reduce((s,x)=>s+Math.pow(x-m,2),0)/(arr.length-1 || 1));
    return { mean: m, sd };
  };

  const anomalies = [];
  const nowPeriod = input.period || new Date().toISOString().slice(0,7);
  const plantId = input.plantId || input.asset?.plantId || 'plant_01';

  // If event provides a direct variance for a metric
  if (event.event && event.event.type === 'PRODUCTION_VARIANCE_DETECTED' && typeof input.deviationPercent === 'number' && input.metric) {
    const metric = input.metric;
    const base = baseline[metric] || baseline.scrap_rate;
    const s = stats(base);
    const expected = s.mean;
    const observed = expected * (1 + (input.deviationPercent / 100));
    const zScore = s.sd ? (observed - expected) / s.sd : 0;
    const severity = Math.abs(zScore) >= zThreshold ? 'critical' : 'informative';
    anomalies.push({ metric, expected, observed, unit: input.unit || (metric.includes('rate') ? '%' : 'units'), zScore: Number(zScore.toFixed(3)), severity });
  } else {
    // otherwise scan known metrics for outliers relative to baseline
    for (const [metric, series] of Object.entries(baseline)) {
      const s = stats(series);
      const last = Array.isArray(series) ? series[series.length-1] : series;
      const z = s.sd ? (last - s.mean) / s.sd : 0;
      const severity = Math.abs(z) >= zThreshold ? 'critical' : (Math.abs(z) >= (zThreshold/1.5) ? 'informative' : 'none');
      if (severity !== 'none') {
        anomalies.push({ metric, expected: s.mean, observed: last, unit: metric.includes('rate') ? '%' : 'units', zScore: Number(z.toFixed(3)), severity });
      }
    }
  }

  const criticalCount = anomalies.filter(a=>a.severity === 'critical').length;

  return {
    event: { type: 'BUSINESS_ANOMALY_DETECTED', category: 'productivity', severity: criticalCount>0 ? 'high' : 'low' },
    asset: event.asset,
    data: {
      anomalies,
      criticalCount,
      plantId,
      period: nowPeriod
    }
  };
}
