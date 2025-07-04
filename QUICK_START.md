# Быстрый старт: neira-cli-mcp

## Что настроено

✅ **Отдельный репозиторий**: https://github.com/KonstantinRogozhkin/neira-cli-mcp  
✅ **GitHub Actions** для автоматической публикации в NPM  
✅ **Скрипт для создания релизов**  
✅ **Обновленный README**  
✅ **Базовые шаблоны приложений**  

## Как создать релиз

### 1. Настроить NPM токен (один раз)

1. Перейдите в настройки репозитория на GitHub
2. Откройте "Settings" → "Secrets and variables" → "Actions"
3. Создайте секрет `NPM_TOKEN` с вашим NPM токеном

### 2. Создать релиз

```bash
# Создать patch релиз (0.2.0 → 0.2.1)
./scripts/release.sh patch

# Создать minor релиз (0.2.0 → 0.3.0)
./scripts/release.sh minor

# Создать major релиз (0.2.0 → 1.0.0)
./scripts/release.sh major
```

### 3. Создать релиз на GitHub

После выполнения скрипта:

1. Перейдите по ссылке, которую выдаст скрипт
2. Добавьте описание изменений
3. Нажмите "Publish release"
4. Пакет автоматически опубликуется в NPM

## Проверка

- **GitHub Actions**: https://github.com/KonstantinRogozhkin/neira-cli-mcp/actions
- **NPM пакет**: https://www.npmjs.com/package/neira-cli-mcp

## Использование

```bash
# Установка
npm install -g neira-cli-mcp

# Создание приложения
neira-cli-mcp create my-app

# Запуск dev сервера
neira-cli-mcp dev
```

---

🚀 **Готово к использованию!** 