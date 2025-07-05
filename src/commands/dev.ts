import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';

/**
 * Интерфейс для манифеста NEIRA приложения
 */
interface NeiraAppManifest {
  name?: string;
  version?: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Запускает MCP dev сервер для разработки NEIRA приложений
 */
export async function devServer() {
  console.log(chalk.blue('🚀 Запуск NEIRA MCP Server...'));

  // Проверяем наличие neira-app.json
  const manifestPath = path.join(process.cwd(), 'neira-app.json');
  let manifest: NeiraAppManifest | null = null;
  
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = await fs.readJson(manifestPath) as NeiraAppManifest;
      console.log(chalk.green(`✅ Найден манифест: ${manifest.name} v${manifest.version}`));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Ошибка чтения neira-app.json:', error));
    }
  } else {
    console.log(chalk.yellow('⚠️  neira-app.json не найден в текущей директории'));
    console.log(chalk.gray('   Создайте приложение с помощью: neira-cli-mcp create <app-name>'));
  }

  // Создаем MCP сервер
  const server = new McpServer({
    name: manifest?.name || 'neira-dev-server',
    version: manifest?.version || '0.1.0'
  });

  // Добавляем базовые инструменты для разработки
  server.registerTool(
    'get_app_info',
    {
      title: 'Получить информацию о приложении',
      description: 'Возвращает информацию о текущем NEIRA приложении',
      inputSchema: {}
    },
    async () => {
      if (manifest) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(manifest, null, 2)
          }]
        };
      } else {
        return {
          content: [{
            type: 'text',
            text: 'Манифест приложения не найден. Создайте neira-app.json или используйте команду create.'
          }]
        };
      }
    }
  );

  // Инструмент для валидации приложения
  server.registerTool(
    'validate_app',
    {
      title: 'Валидировать приложение',
      description: 'Проверяет корректность структуры NEIRA приложения',
      inputSchema: {}
    },
    async () => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Проверяем наличие манифеста
      if (!manifest) {
        errors.push('Отсутствует neira-app.json');
      } else {
        // Проверяем обязательные поля
        if (!manifest.name) errors.push('Отсутствует поле "name"');
        if (!manifest.version) errors.push('Отсутствует поле "version"');
        if (!manifest.description) warnings.push('Рекомендуется добавить описание');
      }

      // Проверяем структуру файлов
      const srcPath = path.join(process.cwd(), 'src');
      if (!fs.existsSync(srcPath)) {
        warnings.push('Отсутствует папка src/');
      }

      const result = {
        valid: errors.length === 0,
        errors,
        warnings
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    }
  );

  // Инструмент для получения списка файлов проекта
  server.registerTool(
    'list_project_files',
    {
      title: 'Список файлов проекта',
      description: 'Возвращает список файлов в текущем проекте',
      inputSchema: {
        pattern: z.string().optional().describe('Паттерн для фильтрации файлов (например, "*.ts")')
      }
    },
    async ({ pattern }) => {
      try {
        const glob = await import('fast-glob');
        const files = await glob.default(pattern || '**/*', {
          cwd: process.cwd(),
          ignore: ['node_modules/**', 'dist/**', '.git/**'],
          onlyFiles: true
        });

        return {
          content: [{
            type: 'text',
            text: `Найдено файлов: ${files.length}\n\n${files.join('\n')}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Ошибка при получении списка файлов: ${error}`
          }],
          isError: true
        };
      }
    }
  );

  // Добавляем ресурс с информацией о проекте
  server.registerResource(
    'project_info',
    'neira://project/info',
    {
      title: 'Информация о проекте',
      description: 'Общая информация о текущем NEIRA проекте',
      mimeType: 'application/json'
    },
    async () => {
      const projectInfo = {
        name: manifest?.name || 'Unknown',
        version: manifest?.version || '0.0.0',
        description: manifest?.description || 'NEIRA приложение',
        hasManifest: !!manifest,
        workingDirectory: process.cwd(),
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      };

      return {
        contents: [{
          uri: 'neira://project/info',
          text: JSON.stringify(projectInfo, null, 2),
          mimeType: 'application/json'
        }]
      };
    }
  );

  // Запускаем сервер через stdio transport
  const transport = new StdioServerTransport();
  
  try {
    await server.connect(transport);
    
    console.log(chalk.green('✅ NEIRA MCP Server запущен успешно!'));
    console.log(chalk.gray(''));
    console.log(chalk.blue('📋 Доступные инструменты:'));
    console.log(chalk.gray('   • get_app_info - Получить информацию о приложении'));
    console.log(chalk.gray('   • validate_app - Валидировать приложение'));
    console.log(chalk.gray('   • list_project_files - Список файлов проекта'));
    console.log(chalk.gray(''));
    console.log(chalk.blue('📚 Доступные ресурсы:'));
    console.log(chalk.gray('   • neira://project/info - Информация о проекте'));
    console.log(chalk.gray(''));
    console.log(chalk.yellow('💡 Подключите этот сервер к Claude Desktop или другому MCP клиенту'));
    console.log(chalk.gray('   Нажмите Ctrl+C для остановки'));

    // Отслеживание изменений в neira-app.json
    if (fs.existsSync(manifestPath)) {
      fs.watchFile(manifestPath, async (curr, prev) => {
        console.log(chalk.blue('📝 neira-app.json изменен, перезагружаю конфигурацию...'));
        try {
          manifest = await fs.readJson(manifestPath) as NeiraAppManifest;
          console.log(chalk.green('✅ Конфигурация обновлена'));
        } catch (error) {
          console.log(chalk.red('❌ Ошибка чтения обновленного манифеста:', error));
        }
      });
    }

  } catch (error) {
    console.error(chalk.red('❌ Ошибка запуска MCP сервера:'), error);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Остановка сервера...'));
    fs.unwatchFile(manifestPath);
    console.log(chalk.green('✅ Сервер остановлен'));
    process.exit(0);
  });
} 