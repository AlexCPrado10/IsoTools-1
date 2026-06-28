import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  removeAdditional: true
});
addFormats(ajv);

const eventSchema = {
  type: 'object',
  required: ['event_id', 'timestamp', 'platform_version', 'module', 'asset', 'event'],
  properties: {
    event_id: { type: 'string', minLength: 1 },
    timestamp: { type: 'string', format: 'date-time' },
    platform_version: { type: 'string', minLength: 1 },
    module: {
      type: 'object',
      required: ['id', 'version'],
      properties: {
        id: { type: 'string' },
        version: { type: 'string' }
      },
      additionalProperties: false
    },
    asset: {
      type: 'object',
      required: ['asset_id'],
      properties: {
        asset_id: { type: 'string' },
        asset_type: { type: 'string', nullable: true },
        plant_id: { type: 'string', nullable: true },
        area_id: { type: 'string', nullable: true },
        line_id: { type: 'string', nullable: true },
        location: { type: 'string', nullable: true }
      },
      additionalProperties: false
    },
    event: {
      type: 'object',
      required: ['type'],
      properties: {
        type: { type: 'string' },
        category: { type: 'string', nullable: true },
        severity: { type: 'string', nullable: true }
      },
      additionalProperties: false
    },
    data: { type: 'object' },
    metadata: { type: 'object' },
    correlation_id: { type: 'string', nullable: true },
    causation_id: { type: 'string', nullable: true }
  },
  additionalProperties: false
};

const validate = ajv.compile(eventSchema);

export function validateEventPayload (payload) {
  const valid = validate(payload);
  return {
    valid,
    errors: valid ? [] : validate.errors
  };
}
