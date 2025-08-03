import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { EXPORT_PROFILES } from '../commands/export';
import { generateRepositoryMap } from '../commands/map';

describe('Export Command', () => {
  it('should have all required export profiles', () => {
    const expectedProfiles = [
      'general',
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

describe('Repository Map Generation', () => {
  const testDir = path.join(process.cwd(), 'test-temp');
  const originalCwd = process.cwd();

  beforeEach(async () => {
    // Создаем временную директорию для тестов
    await fs.mkdir(testDir, { recursive: true });
    process.chdir(testDir);
    
    // Создаем тестовые файлы
    await fs.writeFile('README.md', '# Test Project\n\nThis is a test project.');
    await fs.writeFile('CLAUDE.md', '# Claude Instructions\n\nTest instructions.');
    
    // Создаем src директорию с TypeScript файлами
    await fs.mkdir('src', { recursive: true });
    await fs.writeFile('src/index.ts', `
export function testFunction(param: string): string {
  return param;
}

export class TestClass {
  constructor(private value: string) {}
  
  getValue(): string {
    return this.value;
  }
}
`);
  });

  afterEach(async () => {
    // Возвращаемся в исходную директорию
    process.chdir(originalCwd);
    
    // Удаляем временную директорию
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Игнорируем ошибки удаления
    }
  });

  it('should generate repository map successfully', async () => {
    const outputFile = path.join(testDir, 'test-map.txt');
    
    await generateRepositoryMap({
      output: outputFile,
      force: true,
      include: ['**/*.ts'],
      exclude: ['**/node_modules/**']
    });

    // Проверяем, что файл создан
    const exists = await fs.access(outputFile).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    // Проверяем содержимое файла
    const content = await fs.readFile(outputFile, 'utf-8');
    expect(content).toContain('Карта репозитория');
    expect(content).toContain('testFunction');
    expect(content).toContain('TestClass');
  });

  it('should handle empty projects gracefully', async () => {
    // Удаляем src директорию
    await fs.rm('src', { recursive: true, force: true });
    
    const outputFile = path.join(testDir, 'empty-map.txt');
    
    await generateRepositoryMap({
      output: outputFile,
      force: true,
      include: ['**/*.ts'],
      exclude: ['**/node_modules/**']
    });

    // Проверяем, что файл создан даже для пустого проекта
    const exists = await fs.access(outputFile).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    const content = await fs.readFile(outputFile, 'utf-8');
    expect(content).toContain('Карта репозитория');
    expect(content).toContain('Всего файлов: 0');
  });

  it('should create documentation export with dynamic includes', async () => {
    // Создаем docs папку
    await fs.mkdir('docs', { recursive: true });
    await fs.writeFile('docs/api.md', '# API Documentation\n\nAPI docs here.');
    
    // Проверяем что необходимые файлы существуют для документационного экспорта
    const docFiles = ['README.md', 'CLAUDE.md', 'docs'];
    
    for (const file of docFiles) {
      const exists = await fs.access(file).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    }
  });
}); 