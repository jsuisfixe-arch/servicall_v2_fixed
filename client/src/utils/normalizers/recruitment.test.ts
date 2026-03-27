import { describe, it, expect } from 'vitest';
import { normalizeInterview } from './recruitment';

describe('Recruitment Normalizer', () => {
  it('should return a valid interview with default values for missing fields', () => {
    const incompleteData = {
      id: 1,
      candidateName: 'John Doe'
    };
    
    const result = normalizeInterview(incompleteData);
    
    expect(result.id).toBe(1);
    expect(result.candidateName).toBe('John Doe');
    expect(result.status).toBe('pending'); // Default value
    expect(result.jobPosition).toBe(''); // Default value
  });

  it('should handle null or undefined input gracefully', () => {
    const result = normalizeInterview(null);
    expect(result.id).toBe(0);
    expect(result.candidateName).toBe('Inconnu');
  });

  it('should preserve valid data', () => {
    const validData = {
      id: 10,
      tenantId: 1,
      candidateName: 'Jane Smith',
      candidateEmail: 'jane@example.com',
      candidatePhone: '123456789',
      jobPosition: 'Developer',
      status: 'shortlisted',
      scheduledAt: '2026-01-01T10:00:00Z',
      startedAt: null,
      completedAt: null,
      duration: null,
      recordingUrl: null,
      transcription: null,
      summary: null,
      notesJson: null,
      recommendation: null,
      employerDecision: null,
      employerNotes: null,
      businessType: 'IT',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    
    const result = normalizeInterview(validData);
    expect(result).toEqual(validData);
  });
});
