#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createApp } from './commands/create';
import { devServer } from './commands/dev';
import { validateApp } from './commands/validate';
import { packageApp } from './commands/package';

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

program.parse(); 