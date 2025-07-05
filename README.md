# NEIRA CLI MCP

CLI и MCP-сервер для разработки приложений NEIRA.

## Установка

```bash
npm install -g neira-cli-mcp
```

## Команды

### `create <app-name>`
Создает новую структуру приложения NEIRA.

```bash
neira-cli-mcp create my-app --description "Мое приложение"
```

### `dev`
Запускает локальный MCP-сервер для разработки.

```bash
neira-cli-mcp dev --port 4242
```

### `validate`
Проверяет neira-app.json на корректность.

```bash
neira-cli-mcp validate
```

### `package`
Собирает приложение в .npx пакет.

```bash
neira-cli-mcp package
```

### `export [profile]`
**🆕 Новая команда!** Экспортирует код проекта в markdown файл для анализа.

```bash
# Показать доступные профили
neira-cli-mcp export --list-profiles

# Экспорт с профилем по умолчанию (general)
neira-cli-mcp export

# Экспорт конкретного профиля
neira-cli-mcp export community

# Экспорт с пользовательским именем файла
neira-cli-mcp export general --output my-export.md

# Принудительная перезапись существующего файла
neira-cli-mcp export general --force
```

#### Доступные профили экспорта:

- **`general`** - Основные компоненты без документации и тестов
- **`mobile`** - Мобильная часть (neira-mobile-core + neira-mobile-bff)
- **`community`** - Открытая экосистема (neira-core + neira-apps)
- **`enterprise`** - Коммерческая часть (neira-enterprise)
- **`cli`** - Инструменты разработчика (neira-cli-mcp)
- **`cloud`** - Облачные сервисы (neira-cloud-backend)
- **`docs`** - Документация (neira-docs/docs + README файлы)
- **`build`** - Конфигурация сборки и CI
- **`tests`** - Тесты и вспомогательные скрипты
- **`all`** - Максимально полный дамп

Также поддерживаются динамические профили для отдельных пакетов (например, `neira-core`, `neira-apps`).

#### Требования для экспорта:
- Должен быть установлен `code2prompt`: `npm install -g code2prompt`
- Команда должна выполняться из корня проекта NEIRA Super App или любой его подпапки

## Разработка

```bash
# Установка зависимостей
yarn install

# Сборка
yarn build

# Запуск тестов
yarn test

# Разработка с автоперезагрузкой
yarn dev
```

## Лицензия

MIT

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

## Связь

- GitHub: [neira-cli-mcp](https://github.com/KonstantinRogozhkin/neira-cli-mcp)
- NPM: [neira-cli-mcp](https://www.npmjs.com/package/neira-cli-mcp)
- Issues: [GitHub Issues](https://github.com/KonstantinRogozhkin/neira-cli-mcp/issues)

---

Создано для экосистемы NEIRA