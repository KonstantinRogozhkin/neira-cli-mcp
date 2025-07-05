import { Command } from 'commander';
import chalk from 'chalk';
import { createApp } from './commands/create';
import { devServer } from './commands/dev';
import { validateApp } from './commands/validate';
import { packageApp } from './commands/package';
import { exportCode, EXPORT_PROFILES } from './commands/export';

const program = new Command();

program
  .name('neira-cli-mcp')
  .description('CLI и MCP-сервер для разработки приложений NEIRA')
  .version('0.3.0');

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

// Команда запуска dev-сервера
program
  .command('dev')
  .description('Запускает локальный MCP-сервер для разработки')
  .option('-p, --port <port>', 'Порт для сервера', '4242')
  .action(async (options) => {
    try {
      await devServer(parseInt(options.port));
    } catch (error) {
      console.error(chalk.red('Ошибка при запуске dev-сервера:'), error);
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

// Команда упаковки
program
  .command('package')
  .description('Собирает приложение в .npx пакет')
  .action(async () => {
    try {
      await packageApp();
    } catch (error) {
      console.error(chalk.red('Ошибка при упаковке:'), error);
      process.exit(1);
    }
  });

// Команда экспорта кода
program
  .command('export [profile]')
  .description('Экспортирует код проекта в markdown файл для анализа')
  .option('-o, --output <filename>', 'Имя выходного файла')
  .option('-f, --force', 'Перезаписать существующий файл')
  .option('--list-profiles', 'Показать доступные профили')
  .action(async (profile: string, options) => {
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
        return;
      }
      
      // Используем 'general' как профиль по умолчанию
      const selectedProfile = profile || 'general';
      
      // Проверяем валидность профиля
      if (!EXPORT_PROFILES[selectedProfile as keyof typeof EXPORT_PROFILES]) {
        console.error(chalk.red(`Неизвестный профиль: ${selectedProfile}`));
        console.log(chalk.gray('Используйте --list-profiles для просмотра доступных профилей'));
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

program.parse(); 