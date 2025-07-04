import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { createApp } from '../commands/create.js';

// Мокируем fs-extra
vi.mock('fs-extra');
const mockFs = vi.mocked(fs);

// Мокируем console.log
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('createApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('должен создать новое приложение с базовыми настройками', async () => {
    // Настройка моков
    mockFs.existsSync.mockReturnValue(false); // Директория не существует
    mockFs.copy.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('{"name": "{{appName}}"}');
    mockFs.writeFile.mockResolvedValue(undefined);

    // Выполнение
    await createApp('test-app');

    // Проверки
    expect(mockFs.copy).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Создание приложения "test-app"')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('создано успешно')
    );
  });

  it('должен выбросить ошибку если директория уже существует', async () => {
    // Настройка моков
    mockFs.existsSync.mockReturnValue(true); // Директория существует

    // Выполнение и проверка
    await expect(createApp('existing-app')).rejects.toThrow(
      'Директория "existing-app" уже существует'
    );
  });

  it('должен использовать переданное описание', async () => {
    // Настройка моков
    mockFs.existsSync.mockReturnValue(false);
    mockFs.copy.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('{"description": "{{description}}"}');
    mockFs.writeFile.mockResolvedValue(undefined);

    // Выполнение
    await createApp('test-app', { description: 'Тестовое приложение' });

    // Проверки
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Тестовое приложение')
    );
  });
}); 