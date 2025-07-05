# NEIRA CLI MCP - Руководство по Model Context Protocol

## Что такое MCP?

Model Context Protocol (MCP) - это стандартизированный протокол для подключения больших языковых моделей (LLM) к внешним источникам данных и инструментам. Думайте о MCP как об "USB-C для AI" - универсальном способе подключения AI к различным сервисам.

## Возможности NEIRA MCP сервера

### 🛠️ Инструменты (Tools)

**`get_app_info`**
- Получает информацию о текущем NEIRA приложении
- Читает и возвращает содержимое `neira-app.json`

**`validate_app`**
- Валидирует структуру NEIRA приложения
- Проверяет наличие обязательных полей в манифесте
- Проверяет структуру файлов проекта

**`list_project_files`**
- Возвращает список файлов в проекте
- Поддерживает фильтрацию по паттернам (например, `*.ts`)
- Исключает служебные папки (`node_modules`, `dist`, `.git`)

### 📚 Ресурсы (Resources)

**`neira://project/info`**
- Общая информация о проекте
- Включает имя, версию, описание
- Показывает рабочую директорию и версию Node.js

## Подключение к AI инструментам

### Claude Desktop

1. Найдите файл конфигурации:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

2. Добавьте конфигурацию NEIRA MCP сервера:

```json
{
  "mcpServers": {
    "neira-dev": {
      "command": "neira-cli-mcp",
      "args": ["dev"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

3. Перезапустите Claude Desktop

4. Проверьте подключение - в чате должны появиться доступные инструменты

### Cursor

Cursor поддерживает MCP через расширения. Следите за обновлениями документации Cursor для актуальной информации о подключении MCP серверов.

## Использование

### Запуск MCP сервера

```bash
# Перейдите в папку с NEIRA проектом
cd my-neira-app

# Запустите MCP сервер
neira-cli-mcp dev
```

Сервер будет ожидать подключения от MCP клиентов через stdio transport.

### Примеры команд в Claude

После подключения вы можете использовать следующие команды:

**Получить информацию о проекте:**
```
Покажи информацию о текущем NEIRA проекте
```

**Валидировать проект:**
```
Проверь корректность структуры моего NEIRA приложения
```

**Список файлов:**
```
Покажи все TypeScript файлы в проекте
```

**Анализ кода:**
```
Прочитай ресурс neira://project/info и расскажи о проекте
```

## Технические детали

### Архитектура

- **Протокол**: Model Context Protocol v2025-03-26
- **Транспорт**: stdio (стандартный ввод/вывод)
- **SDK**: `@modelcontextprotocol/sdk` v1.15.0
- **Валидация**: Zod схемы для типобезопасности

### Безопасность

- Сервер работает только с локальными файлами проекта
- Не выполняет сетевых запросов
- Все операции только для чтения (кроме валидации)
- Исключает доступ к служебным папкам

### Отладка

Для отладки MCP сервера используйте:

```bash
# Запуск с отладочной информацией
DEBUG=mcp* neira-cli-mcp dev

# Проверка подключения
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-03-26", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | neira-cli-mcp dev
```

## Расширение функциональности

### Добавление новых инструментов

Инструменты определяются в `src/commands/dev.ts`:

```typescript
server.registerTool(
  'my_tool',
  {
    title: 'Мой инструмент',
    description: 'Описание инструмента',
    inputSchema: {
      param: z.string().describe('Параметр')
    }
  },
  async ({ param }) => {
    // Логика инструмента
    return {
      content: [{
        type: 'text',
        text: `Результат: ${param}`
      }]
    };
  }
);
```

### Добавление новых ресурсов

Ресурсы также определяются в `src/commands/dev.ts`:

```typescript
server.registerResource(
  'my_resource',
  'neira://my/resource',
  {
    title: 'Мой ресурс',
    description: 'Описание ресурса',
    mimeType: 'application/json'
  },
  async () => {
    return {
      contents: [{
        uri: 'neira://my/resource',
        text: JSON.stringify({ data: 'value' }),
        mimeType: 'application/json'
      }]
    };
  }
);
```

## Полезные ссылки

- [Официальная документация MCP](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Примеры MCP серверов](https://github.com/modelcontextprotocol/servers)
- [Claude Desktop MCP](https://claude.ai/docs/mcp) 