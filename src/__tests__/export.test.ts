import { describe, it, expect } from 'vitest';
import { EXPORT_PROFILES } from '../commands/export';

describe('Export Command', () => {
  it('should have all required export profiles', () => {
    const expectedProfiles = [
      'general',
      'mobile', 
      'community',
      'enterprise',
      'cli',
      'cloud',
      'docs',
      'build',
      'tests',
      'all'
    ];
    
    for (const profile of expectedProfiles) {
      expect(EXPORT_PROFILES).toHaveProperty(profile);
      expect(typeof EXPORT_PROFILES[profile as keyof typeof EXPORT_PROFILES]).toBe('string');
    }
  });
  
  it('should have descriptive names for all profiles', () => {
    for (const [profile, description] of Object.entries(EXPORT_PROFILES)) {
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(10);
      expect(profile).toBeTruthy();
    }
  });
  
  it('should have unique descriptions', () => {
    const descriptions = Object.values(EXPORT_PROFILES);
    const uniqueDescriptions = new Set(descriptions);
    expect(descriptions.length).toBe(uniqueDescriptions.size);
  });
}); 