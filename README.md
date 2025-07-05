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
neira-cli-mcp dev
```

**Новое в версии 0.3.0:** Команда `dev` теперь использует официальный Model Context Protocol (MCP) SDK и предоставляет полноценный MCP сервер для интеграции с AI инструментами.

#### Возможности MCP сервера:

**🛠️ Инструменты (Tools):**
- `get_app_info` - Получить информацию о текущем NEIRA приложении
- `validate_app` - Валидировать структуру приложения
- `list_project_files` - Получить список файлов проекта с фильтрацией

**📚 Ресурсы (Resources):**
- `neira://project/info` - Общая информация о проекте

**🔌 Подключение к AI инструментам:**
Сервер работает через stdio transport и может быть подключен к:
- Claude Desktop
- Cursor
- Любому другому MCP-совместимому клиенту

#### Пример конфигурации для Claude Desktop:

Добавьте в `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "neira-dev": {
      "command": "neira-cli-mcp",
      "args": ["dev"]
    }
  }
}
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

## Технологии

### Model Context Protocol (MCP)

Начиная с версии 0.3.0, NEIRA CLI MCP использует официальный TypeScript SDK для Model Context Protocol:

- **Библиотека**: `@modelcontextprotocol/sdk` v1.15.0
- **Транспорт**: stdio (стандартный для MCP серверов)
- **Возможности**: Tools, Resources, полная совместимость с MCP спецификацией

#### Почему официальный SDK?

✅ **Стабильность** - официальная реализация от создателей протокола  
✅ **Совместимость** - поддержка всех возможностей MCP  
✅ **Долгосрочная поддержка** - активная разработка и обновления  
✅ **Большое сообщество** - 7,980+ зависимых проектов  
✅ **Документация** - полная документация и примеры  

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
- 🤖 **MCP интеграция** - Полноценный Model Context Protocol сервер для AI инструментов
- 📦 **Управление зависимостями** - Автоматическая настройка зависимостей NEIRA
- 🔍 **Экспорт кода** - Мощная система экспорта кода для анализа AI

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
│   │   ├── dev.ts        # MCP сервер для разработки
│   │   ├── package.ts    # Команда создания пакетов
│   │   ├── validate.ts   # Команда валидации
│   │   └── export.ts     # Команда экспорта кода
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

### Использование MCP сервера

```bash
# Запустить MCP сервер для разработки
neira-cli-mcp dev

# Сервер будет доступен для подключения AI инструментов
# Используйте инструменты для получения информации о проекте
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

- **PATCH** (0.3.1) - исправления багов
- **MINOR** (0.4.0) - новые возможности (обратно совместимые)
- **MAJOR** (1.0.0) - breaking changes

### Changelog

#### v0.3.0
- ✨ Интеграция с официальным MCP TypeScript SDK
- 🔧 Полная переработка команды `dev` для поддержки MCP
- 📋 Добавлены MCP Tools для работы с проектами
- 📚 Добавлены MCP Resources для информации о проектах
- 🤖 Совместимость с Claude Desktop и другими MCP клиентами

## Связь

- GitHub: [neira-cli-mcp](https://github.com/KonstantinRogozhkin/neira-cli-mcp)
- NPM: [neira-cli-mcp](https://www.npmjs.com/package/neira-cli-mcp)
- Issues: [GitHub Issues](https://github.com/KonstantinRogozhkin/neira-cli-mcp/issues)

## CI/CD и GitHub Actions

В репозитории настроено **три** основных workflow GitHub Actions, которые полностью автоматизируют CI/CD процесс:

| Workflow | Файл | Триггер | Что происходит |
|----------|------|---------|----------------|
| **CI Pipeline** | `.github/workflows/ci.yml` | Push / Pull&nbsp;Request в ветки `main` и `develop` | Сборка пакета, линт, тесты (Node 18/20), проверка TypeScript, smoke-тест CLI и валидация содержимого пакета |
| **NPM Publishing** | `.github/workflows/publish-neira-cli-mcp.yml` | Создание GitHub Release с тегом `neira-cli-mcp-v*` или ручной запуск (`workflow_dispatch`) | Установка зависимостей, сборка, тесты, публикация в NPM и комментарий в релизе с результатом |
| **Docusaurus Docs** | `.github/workflows/docusaurus.yml` | Push в ветку `main` | Сборка и деплой документации на GitHub Pages |

> 💡  Для корректной работы публикации в NPM необходимо один раз добавить секрет `NPM_TOKEN` в настройках репозитория (`Settings → Secrets and variables → Actions`).

---

## Процесс релиза

Ниже приведён рекомендуемый порядок действий для выпуска новой версии **neira-cli-mcp**.

1. **Повышаем версию** (SemVer) с помощью встроенного скрипта:

   ```bash
   # patch   → 0.3.1 → 0.3.2
   ./scripts/release.sh patch

   # minor   → 0.3.x → 0.4.0
   ./scripts/release.sh minor

   # major   → 0.x.x → 1.0.0
   ./scripts/release.sh major
   ```

2. **Пушим изменения** в `main` или `develop` (в зависимости от вашей стратегии):

   ```bash
   git add package.json
   git commit -m "chore: bump version to X.Y.Z"
   git push
   ```

3. **Создаём GitHub Release** с тегом `neira-cli-mcp-vX.Y.Z` и кратким описанием изменений.

4. **Ждём завершения workflow** `publish-neira-cli-mcp.yml` – он автоматически опубликует пакет в NPM.

5. **Проверяем результат**:
   - Статус сборки во вкладке **Actions**
   - Новая версия на https://www.npmjs.com/package/neira-cli-mcp

---

Создано для экосистемы NEIRA