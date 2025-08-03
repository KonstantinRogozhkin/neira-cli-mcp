import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { createApp } from './commands/create';
import { devServer } from './commands/dev';
import { validateApp } from './commands/validate';
import { exportCode, EXPORT_PROFILES } from './commands/export';
import { generateRepositoryMap } from './commands/map';

const program = new Command();

program
  .name('neira-cli-mcp')
  .description('CLI и MCP-сервер для разработки приложений NEIRA')
  .version('0.3.9');

// Команда создания приложения
program
  .command('create <app-name>')
  .description('Создает новую структуру приложения NEIRA')
  .option('-d, --description <description>', 'Описание приложения')
  .action(async (appName: string, options) => {
    try {
      await createApp(appName, options);
    } catch (error) {
      console.error(chalk.red('Ошибка при создании приложения:'), error);
      process.exit(1);
    }
  });

// Команда запуска MCP dev-сервера
program
  .command('dev')
  .description('Запускает MCP-сервер для разработки NEIRA приложений')
  .action(async () => {
    try {
      await devServer();
    } catch (error) {
      console.error(chalk.red('Ошибка при запуске MCP сервера:'), error);
      process.exit(1);
    }
  });

// Команда валидации
program
  .command('validate')
  .description('Проверяет neira-app.json на корректность')
  .action(async () => {
    try {
      await validateApp();
    } catch (error) {
      console.error(chalk.red('Ошибка при валидации:'), error);
      process.exit(1);
    }
  });


// Команда экспорта кода
program
  .command('export [path-or-profile]')
  .description('Экспортирует код проекта в markdown файл для анализа')
  .option('-o, --output <filename>', 'Имя выходного файла')
  .option('-f, --force', 'Перезаписать существующий файл')
  .option('--list-profiles', 'Показать доступные профили')
  .action(async (pathOrProfile: string, options) => {
    try {
      // Показываем список профилей
      if (options.listProfiles) {
        console.log(chalk.blue('📋 Доступные профили экспорта:'));
        console.log('');
        for (const [key, description] of Object.entries(EXPORT_PROFILES)) {
          console.log(`  ${chalk.cyan(key.padEnd(12))} ${description}`);
        }
        console.log('');
        console.log(chalk.gray('💡 Использование: neira-cli-mcp export <profile>'));
        console.log(chalk.gray('   Пример: neira-cli-mcp export general'));
        console.log(chalk.gray('   Пример: neira-cli-mcp export . (экспорт текущей папки)'));
        return;
      }
      
      // Если передан путь (например, '.'), экспортируем текущий проект и создаем карту
      if (pathOrProfile === '.' || pathOrProfile === './' || pathOrProfile === process.cwd()) {
        console.log(chalk.blue('🚀 Экспорт текущего проекта...'));
        
        // Экспортируем код
        const exportFilePath = await exportCode({
          profile: 'general',
          output: options.output,
          force: options.force
        });
        
        // Автоматически создаем карту репозитория рядом с экспортным файлом
        console.log(chalk.blue('🗺️  Создание карты репозитория...'));
        
        // Определяем имя файла карты на основе экспортного файла
        let mapOutput = 'REPOSITORY_MAP.txt';
        if (exportFilePath) {
          const exportPath = exportFilePath;
          const dir = path.dirname(exportPath);
          const baseName = path.basename(exportPath, path.extname(exportPath));
          mapOutput = path.join(dir, `${baseName}_MAP.txt`);
        } else if (options.output) {
          const exportPath = options.output;
          const dir = path.dirname(exportPath);
          const baseName = path.basename(exportPath, path.extname(exportPath));
          mapOutput = path.join(dir, `${baseName}_MAP.txt`);
        }
        
        await generateRepositoryMap({
          output: mapOutput,
          force: options.force,
          include: ['**/*.ts', '**/*.tsx', '**/*.py', '**/*.js', '**/*.jsx'],
          exclude: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/__pycache__/**', '**/*.pyc', '**/build/**', '**/coverage/**']
        });
        
        console.log(chalk.green('✅ Экспорт и карта репозитория созданы успешно!'));
        return;
      }
      
      // Используем 'general' как профиль по умолчанию
      const selectedProfile = pathOrProfile || 'general';
      
      // Проверяем валидность профиля
      if (!EXPORT_PROFILES[selectedProfile as keyof typeof EXPORT_PROFILES]) {
        console.error(chalk.red(`Неизвестный профиль: ${selectedProfile}`));
        console.log(chalk.gray('Используйте --list-profiles для просмотра доступных профилей'));
        console.log(chalk.gray('Или используйте neira-cli-mcp export . для экспорта текущей папки'));
        process.exit(1);
      }
      
      await exportCode({
        profile: selectedProfile as keyof typeof EXPORT_PROFILES,
        output: options.output,
        force: options.force
      });
    } catch (error) {
      console.error(chalk.red('Ошибка при экспорте:'), error);
      process.exit(1);
    }
  });

// Команда генерации карты репозитория
program
  .command('map')
  .description('Генерирует карту репозитория с структурой функций, классов и их документацией')
  .option('-o, --output <filename>', 'Имя выходного файла (по умолчанию: REPOSITORY_MAP.txt)')
  .option('-f, --force', 'Перезаписать существующий файл')
  .option('-i, --include <patterns>', 'Включить файлы по паттернам (через запятую)', '**/*.ts,**/*.tsx,**/*.py,**/*.js,**/*.jsx')
  .option('-e, --exclude <patterns>', 'Исключить файлы по паттернам (через запятую)', '**/node_modules/**,**/dist/**,**/.git/**,**/__pycache__/**,**/*.pyc')
  .action(async (options) => {
    try {
      const includePatterns = options.include ? options.include.split(',').map((p: string) => p.trim()) : ['**/*.ts', '**/*.tsx', '**/*.py', '**/*.js', '**/*.jsx'];
      const excludePatterns = options.exclude ? options.exclude.split(',').map((p: string) => p.trim()) : ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/__pycache__/**', '**/*.pyc'];
      
      await generateRepositoryMap({
        output: options.output,
        force: options.force,
        include: includePatterns,
        exclude: excludePatterns
      });
    } catch (error) {
      console.error(chalk.red('Ошибка при генерации карты:'), error);
      process.exit(1);
    }
  });

program.parse(); 