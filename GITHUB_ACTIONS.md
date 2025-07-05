# GitHub Actions для neira-cli-mcp

## Обзор

Этот репозиторий настроен с автоматическими GitHub Actions для:
- ✅ Непрерывной интеграции (CI)
- ✅ Автоматической публикации в NPM
- ✅ Документации (Docusaurus)

## Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Триггеры:**
- Push в ветки `main`, `develop`
- Pull Request в ветки `main`, `develop`

**Что выполняется:**
- Тестирование на Node.js 18 и 20
- Сборка пакета
- Запуск тестов с покрытием
- Проверка TypeScript компиляции
- Тестирование CLI функциональности
- Валидация содержимого пакета

### 2. NPM Publishing (`.github/workflows/publish-neira-cli-mcp.yml`)

**Триггеры:**
- Создание нового релиза в GitHub (с тегом содержащим 'neira-cli-mcp')
- Ручной запуск через workflow_dispatch

**Что выполняется:**
- Установка зависимостей через Yarn
- Сборка пакета
- Запуск тестов
- Публикация в NPM
- Создание комментария с результатом

### 3. Docusaurus Documentation (`.github/workflows/docusaurus.yml`)

**Триггеры:**
- Push в основную ветку

**Что выполняется:**
- Сборка и развертывание документации

## Настройка секретов

Для работы автоматической публикации необходимо настроить секрет в GitHub:

1. Перейдите в Settings → Secrets and variables → Actions
2. Добавьте секрет `NPM_TOKEN`:
   - Получите токен в NPM: https://www.npmjs.com/settings/tokens
   - Выберите "Automation" token type
   - Скопируйте токен и добавьте как секрет

## Процесс релиза

1. **Обновите версию** в `package.json`:
   ```bash
   yarn version patch  # или minor/major
   ```

2. **Создайте коммит** с изменениями:
   ```bash
   git add package.json
   git commit -m "chore: bump version to X.X.X"
   git push
   ```

3. **Создайте релиз** в GitHub:
   - Перейдите в Releases → Create a new release
   - Создайте новый тег с префиксом `neira-cli-mcp-vX.X.X` (например, `neira-cli-mcp-v0.3.1`)
   - Добавьте описание изменений
   - Нажмите "Publish release"

4. **Автоматическая публикация**: GitHub Actions автоматически опубликует пакет в NPM

## Особенности CLI пакета

### Тестирование CLI
Workflow автоматически тестирует CLI команды:
```bash
node dist/cli.js --help
```

### Структура пакета
CLI включает:
- Исполняемый файл в `dist/cli.js`
- Шаблоны в папке `templates/`
- TypeScript определения

## Мониторинг

- **CI статус**: Проверяйте статус в разделе Actions
- **NPM публикация**: После релиза проверьте https://www.npmjs.com/package/neira-cli-mcp
- **CLI установка**: Тестируйте установку через `npm install -g neira-cli-mcp`
- **Логи**: Все логи доступны в разделе Actions → конкретный workflow

## Troubleshooting

### Ошибка публикации в NPM
- Проверьте актуальность `NPM_TOKEN`
- Убедитесь, что версия в `package.json` больше текущей в NPM
- Проверьте права доступа к пакету

### Ошибки сборки
- Проверьте TypeScript ошибки
- Убедитесь, что все зависимости корректно установлены
- Проверьте конфигурацию `tsup.config.ts`

### CI падает на тестах
- Проверьте тесты с помощью `yarn test`
- Убедитесь, что все тестовые файлы корректны
- Проверьте конфигурацию Vitest

### CLI не работает после публикации
- Проверьте права выполнения на `dist/cli.js`
- Убедитесь, что shebang корректен
- Проверьте поле `bin` в `package.json`

## Зависимости

CLI пакет зависит от:
- `neira-shared-types` - убедитесь, что версия актуальна
- Другие зависимости указаны в `package.json` 