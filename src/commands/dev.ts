import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

export async function devServer(port: number = 4242) {
  console.log(chalk.blue('🚀 Запуск NEIRA MCP Server...'));

  // Проверяем наличие neira-app.json
  const manifestPath = path.join(process.cwd(), 'neira-app.json');
  if (!fs.existsSync(manifestPath)) {
    console.log(chalk.yellow('⚠️  neira-app.json не найден в текущей директории'));
    console.log(chalk.gray('   Создайте приложение с помощью: neira-cli-mcp create <app-name>'));
  }

  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Логирование запросов
  app.use((req, res, next) => {
    console.log(chalk.gray(`${req.method} ${req.path}`));
    next();
  });

  // API Routes
  app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', server: 'neira-mcp-dev', version: '0.2.0' });
  });

  // Получение контекста приложения
  app.get('/api/v1/context', (req, res) => {
    let manifest = null;
    try {
      if (fs.existsSync(manifestPath)) {
        manifest = fs.readJsonSync(manifestPath);
      }
    } catch (error) {
      console.error(chalk.red('Ошибка чтения neira-app.json:'), error);
    }

    res.json({
      manifest,
      messages: [
        {
          role: 'system',
          content: 'Добро пожаловать в NEIRA MCP Dev Server! Это имитация рантайма для разработки.'
        }
      ],
      settings: {
        model: 'gpt-4',
        temperature: 0.7
      }
    });
  });

  // Эндпоинт для отправки сообщений (имитация chat completions)
  app.post('/api/v1/chat/completions', (req, res) => {
    const { messages, stream = false } = req.body;
    
    if (stream) {
      // Для стриминга отправляем клиента на WebSocket
      res.json({ 
        message: 'Для стриминга используйте WebSocket /api/v1/stream',
        websocket_url: `ws://localhost:${port}/api/v1/stream`
      });
    } else {
      // Простой ответ для тестирования
      res.json({
        id: 'dev-response-' + Date.now(),
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'neira-dev-model',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: `Это тестовый ответ от NEIRA MCP Dev Server. Получено сообщений: ${messages?.length || 0}`
          },
          finish_reason: 'stop'
        }]
      });
    }
  });

  // WebSocket для стриминга
  wss.on('connection', (ws) => {
    console.log(chalk.green('📡 WebSocket соединение установлено'));

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(chalk.blue('📨 Получено сообщение:'), message);

        // Имитация стриминга ответа
        const response = {
          id: 'dev-stream-' + Date.now(),
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: 'neira-dev-model',
          choices: [{
            index: 0,
            delta: {
              role: 'assistant',
              content: 'Это стриминговый ответ от NEIRA MCP Dev Server! '
            },
            finish_reason: null
          }]
        };

        // Отправляем ответ частями
        ws.send(JSON.stringify(response));
        
        setTimeout(() => {
          const finalResponse = {
            ...response,
            choices: [{
              index: 0,
              delta: {},
              finish_reason: 'stop'
            }]
          };
          ws.send(JSON.stringify(finalResponse));
        }, 1000);

      } catch (error) {
        console.error(chalk.red('Ошибка обработки WebSocket сообщения:'), error);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log(chalk.yellow('📡 WebSocket соединение закрыто'));
    });
  });

  // Запуск сервера
  server.listen(port, () => {
    console.log(chalk.green(`✅ NEIRA MCP Server запущен на http://localhost:${port}`));
    console.log(chalk.gray('   API endpoints:'));
    console.log(chalk.gray(`   • GET  /api/v1/health`));
    console.log(chalk.gray(`   • GET  /api/v1/context`));
    console.log(chalk.gray(`   • POST /api/v1/chat/completions`));
    console.log(chalk.gray(`   • WS   /api/v1/stream`));
    console.log(chalk.gray(''));
    console.log(chalk.blue('🔍 Отслеживание изменений в neira-app.json...'));
    console.log(chalk.gray('   Нажмите Ctrl+C для остановки'));

    // Отслеживание изменений в neira-app.json
    if (fs.existsSync(manifestPath)) {
      fs.watchFile(manifestPath, (curr, prev) => {
        console.log(chalk.blue('📝 neira-app.json изменен, перезагружаю конфигурацию...'));
      });
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Остановка сервера...'));
    server.close(() => {
      console.log(chalk.green('✅ Сервер остановлен'));
      process.exit(0);
    });
  });
} 