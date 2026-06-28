// scripts/simulateStream.js
import 'dotenv/config';
import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api/v1/events';
const API_KEY = process.env.API_KEY;
const INTERVAL_MS = Number(process.env.STREAM_INTERVAL_MS || 3000);

if (!API_KEY) {
  console.error('Set API_KEY env var to stream events');
  process.exit(1);
}

const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MODULES = ['vision', 'maintenance', 'quality', 'energy', 'safety', 'environment'];

const ASSETS = {
  vision:      ['robot-01', 'robot-02', 'conveyor-01'],
  maintenance: ['robot-01', 'robot-02', 'press-01', 'conveyor-01', 'hvac-01'],
  quality:     ['press-01', 'conveyor-01', 'robot-01'],
  energy:      ['hvac-01', 'press-01', 'robot-01', 'robot-02'],
  safety:      ['robot-01', 'robot-02', 'press-01', 'conveyor-01'],
  environment: ['sensor-env-01', 'hvac-01'],
};

const INCIDENT_TYPES = ['slip_fall', 'equipment_contact', 'chemical_exposure', 'fire_risk', 'ergonomic', 'electrical'];
const ZONES = ['Zone-A', 'Zone-B', 'Zone-C', 'Assembly-Floor', 'Warehouse', 'Loading-Dock'];

// ─── Severity resolvers ──────────────────────────────────────────────────────

function visionSeverity (temp) {
  if (temp > 110) return 'CRITICAL';
  if (temp > 90)  return 'HIGH';
  if (temp > 70)  return 'MEDIUM';
  return 'LOW';
}

function maintenanceSeverity (vibration, hoursSince, oilPressure) {
  if (vibration > 8.5 || hoursSince > 4500 || oilPressure < 15) return 'CRITICAL';
  if (vibration > 6.5 || hoursSince > 3500 || oilPressure < 30) return 'HIGH';
  if (vibration > 4.0 || hoursSince > 2000 || oilPressure < 50) return 'MEDIUM';
  return 'LOW';
}

function qualitySeverity (score, rejectCount) {
  if (score < 40 || rejectCount > 20) return 'CRITICAL';
  if (score < 60 || rejectCount > 10) return 'HIGH';
  if (score < 75 || rejectCount > 5)  return 'MEDIUM';
  return 'LOW';
}

function energySeverity (kwh, powerFactor, peakDemand) {
  if (kwh > 450 || powerFactor < 0.6)               return 'CRITICAL';
  if (kwh > 380 || (peakDemand && kwh > 300))        return 'HIGH';
  if (kwh > 280 || powerFactor < 0.75)               return 'MEDIUM';
  return 'LOW';
}

function safetySeverity (riskScore) {
  if (riskScore > 85) return 'CRITICAL';
  if (riskScore > 65) return 'HIGH';
  if (riskScore > 40) return 'MEDIUM';
  return 'LOW';
}

function environmentSeverity (co2, temp, humidity) {
  if (co2 > 1800 || temp > 37 || humidity > 85) return 'CRITICAL';
  if (co2 > 1400 || temp > 33 || humidity > 75) return 'HIGH';
  if (co2 > 1000 || temp > 28 || humidity > 65) return 'MEDIUM';
  return 'LOW';
}

function severityToEventType (severity) {
  if (severity === 'CRITICAL' || severity === 'HIGH') return 'ALARM';
  if (severity === 'MEDIUM') return 'WARNING';
  return 'INFO';
}

// ─── Data generators per module ──────────────────────────────────────────────

function generateModuleData (module) {
  switch (module) {
    case 'vision': {
      const temp = parseFloat(rand(20, 120).toFixed(1));
      const defect_rate = parseFloat(rand(0, 15).toFixed(2));
      const severity = visionSeverity(temp);
      return { data: { value: temp, defect_rate, unit: 'celsius' }, severity };
    }
    case 'quality': {
      const score = parseFloat(rand(0, 100).toFixed(1));
      const reject_count = randInt(0, 30);
      const batch_id = `BATCH-${Date.now()}`;
      const severity = qualitySeverity(score, reject_count);
      return { data: { value: score, reject_count, batch_id }, severity };
    }
    case 'maintenance': {
      const vibration = parseFloat(rand(0, 10).toFixed(2));
      const hours_since_maintenance = randInt(0, 5000);
      const oil_pressure = parseFloat(rand(0, 100).toFixed(1));
      const severity = maintenanceSeverity(vibration, hours_since_maintenance, oil_pressure);
      return { data: { value: vibration, hours_since_maintenance, oil_pressure }, severity };
    }
    case 'energy': {
      const kwh = parseFloat(rand(0, 500).toFixed(2));
      const power_factor = parseFloat(rand(0.5, 1.0).toFixed(3));
      const peak_demand = Math.random() > 0.7;
      const severity = energySeverity(kwh, power_factor, peak_demand);
      return { data: { value: kwh, power_factor, peak_demand }, severity };
    }
    case 'safety': {
      const risk_score = parseFloat(rand(0, 100).toFixed(1));
      const incident_type = pick(INCIDENT_TYPES);
      const zone = pick(ZONES);
      const severity = safetySeverity(risk_score);
      return { data: { value: risk_score, incident_type, zone }, severity };
    }
    case 'environment': {
      const co2 = parseFloat(rand(300, 2000).toFixed(1));
      const temperature = parseFloat(rand(15, 40).toFixed(1));
      const humidity = parseFloat(rand(20, 90).toFixed(1));
      const severity = environmentSeverity(co2, temperature, humidity);
      return { data: { value: co2, temperature, humidity, unit: 'ppm_CO2' }, severity };
    }
    default:
      return { data: { value: Math.random() * 100 }, severity: 'LOW' };
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function sendEvent () {
  const module = pick(MODULES);
  const asset = pick(ASSETS[module]);
  const { data, severity } = generateModuleData(module);
  const event_type = severityToEventType(severity);

  const payload = {
    event_id:         `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp:        new Date().toISOString(),
    platform_version: '2.0.0',
    module:           { id: module, version: '1.0.0' },
    asset:            { asset_id: asset, plant_id: 'PLT-01' },
    event:            { type: event_type, severity },
    data,
  };

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify(payload),
    });

    const status = res.ok ? '✓' : '✗';
    console.log(`[${new Date().toISOString()}] ${status} ${module.padEnd(12)} | ${severity.padEnd(8)} | ${event_type.padEnd(7)} | ${asset}`);
    if (!res.ok) console.error('  Error:', await res.text());
  } catch (err) {
    console.error('Stream error:', err.message);
  }
}

console.log(`Streaming to ${API_BASE} every ${INTERVAL_MS}ms`);
sendEvent();
setInterval(sendEvent, INTERVAL_MS);
