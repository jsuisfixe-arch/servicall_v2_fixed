import { describe, it, expect } from 'vitest';
import { normalizeWorkflow } from './workflow';

describe('Workflow Normalizer', () => {
  it('should return a valid workflow with default values for missing fields', () => {
    const incompleteData = {
      id: 1,
      name: 'Test Workflow'
    };
    
    const result = normalizeWorkflow(incompleteData);
    
    expect(result.id).toBe(1);
    expect(result.name).toBe('Test Workflow');
    expect(result.isActive).toBe(false); // Default value
    expect(result.actions).toEqual([]); // Default value
  });

  it('should handle null or undefined input gracefully', () => {
    const result = normalizeWorkflow(null);
    expect(result.id).toBe(0);
    expect(result.name).toBe('Sans nom');
  });

  it('should preserve valid data', () => {
    const validData = {
      id: 10,
      tenantId: 1,
      name: 'Full Workflow',
      description: 'A complete workflow',
      triggerType: 'manual',
      triggerConfig: {},
      actions: [],
      isActive: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    
    const result = normalizeWorkflow(validData);
    expect(result).toEqual(validData);
  });
});
