# neira-cli-mcp

Официальный CLI и MCP Server для разработки приложений на платформе NEIRA.

## Установка

### Глобальная установка

```bash
npm install -g neira-cli-mcp
```

### Локальная установка

```bash
npm install neira-cli-mcp
```

## Использование

### CLI команды

#### Создание нового приложения

```bash
neira-cli-mcp create my-app
```

Это создаст новое приложение NEIRA с базовой структурой:

```
my-app/
├── src/
│   └── index.js          # Главный файл приложения
├── package.json          # Конфигурация пакета
└── README.md            # Документация
```

#### Запуск в режиме разработки

```bash
neira-cli-mcp dev
```

#### Валидация проекта

```bash
neira-cli-mcp validate
```

#### Создание пакета

```bash
neira-cli-mcp package
```

### MCP Server

CLI также включает MCP (Model Context Protocol) сервер для интеграции с AI инструментами.

## Возможности

- 🚀 **Быстрое создание проектов** - Создавайте новые приложения NEIRA одной командой
- 🛠️ **Готовые шаблоны** - Используйте проверенные шаблоны для разных типов приложений
- 🔧 **Инструменты разработки** - Встроенные команды для разработки и сборки
- 🤖 **MCP интеграция** - Поддержка Model Context Protocol для AI инструментов
- 📦 **Управление зависимостями** - Автоматическая настройка зависимостей NEIRA

## Доступные шаблоны

### basic-app
Базовое приложение NEIRA с минимальной настройкой:
- Node.js приложение
- Интеграция с `neira-shared-types`
- Готовая структура проекта
- Скрипты для разработки и продакшена

## Разработка

### Требования

- Node.js 16+
- npm или yarn
- TypeScript 5.0+

### Установка зависимостей

```bash
npm install
```

### Сборка

```bash
npm run build
```

### Разработка с автоматической пересборкой

```bash
npm run dev
```

### Запуск

```bash
npm start
```

## Публикация

### Автоматическая публикация

Пакет автоматически публикуется в NPM при создании релиза на GitHub.

1. Создайте релиз с помощью скрипта:
   ```bash
   ./scripts/release.sh patch  # или minor, major
   ```

2. Создайте релиз на GitHub с созданным тегом

3. Пакет автоматически опубликуется в NPM

### Ручная публикация

```bash
npm run build
npm publish
```

## Структура проекта

```
neira-cli-mcp/
├── src/
│   ├── cli.ts            # Главный CLI файл
│   ├── commands/         # CLI команды
│   │   ├── create.ts     # Команда создания проектов
│   │   ├── dev.ts        # Команда разработки
│   │   ├── package.ts    # Команда создания пакетов
│   │   └── validate.ts   # Команда валидации
│   └── docs/
│       └── diagram.mmd   # Диаграммы архитектуры
├── templates/            # Шаблоны проектов
│   └── basic-app/        # Базовый шаблон приложения
├── dist/                 # Скомпилированные файлы
├── scripts/
│   └── release.sh        # Скрипт для создания релизов
├── .github/
│   └── workflows/
│       └── publish.yml   # GitHub Actions для публикации
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Примеры использования

### Создание и запуск приложения

```bash
# Создать новое приложение
neira-cli-mcp create my-neira-app

# Перейти в папку
cd my-neira-app

# Установить зависимости
npm install

# Запустить в режиме разработки
npm run dev
```

### Интеграция с neira-shared-types

Созданные приложения автоматически включают `neira-shared-types`:

```javascript
// В созданном приложении
const { NeiraApiResponse } = require('neira-shared-types');

// Использование типов
const response = {
  success: true,
  data: { message: 'Hello NEIRA!' },
  message: 'Operation completed'
};
```

## Версионирование

Проект использует [Semantic Versioning](https://semver.org/):

- **PATCH** (0.2.1) - исправления багов
- **MINOR** (0.3.0) - новые возможности (обратно совместимые)
- **MAJOR** (1.0.0) - breaking changes

## Лицензия

MIT

## Связь

- GitHub: [neira-cli-mcp](https://github.com/KonstantinRogozhkin/neira-cli-mcp)
- NPM: [neira-cli-mcp](https://www.npmjs.com/package/neira-cli-mcp)
- Issues: [GitHub Issues](https://github.com/KonstantinRogozhkin/neira-cli-mcp/issues)

---

Создано для экосистемы NEIRA