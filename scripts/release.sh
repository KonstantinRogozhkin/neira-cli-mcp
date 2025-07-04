#!/bin/bash

# Скрипт для создания релизов @neira/cli-mcp
# Использование: ./scripts/release.sh <version-type>
# Пример: ./scripts/release.sh patch

set -e

VERSION_TYPE=$1

if [ -z "$VERSION_TYPE" ]; then
    echo "❌ Использование: $0 <version-type>"
    echo "   version-type: patch | minor | major"
    exit 1
fi

if [ "$VERSION_TYPE" != "patch" ] && [ "$VERSION_TYPE" != "minor" ] && [ "$VERSION_TYPE" != "major" ]; then
    echo "❌ Неподдерживаемый тип версии: $VERSION_TYPE"
    echo "   Поддерживаемые: patch, minor, major"
    exit 1
fi

echo "🚀 Создание релиза @neira/cli-mcp ($VERSION_TYPE)"

# Проверяем, что рабочая директория чистая
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Рабочая директория не чистая. Закоммитьте изменения перед созданием релиза."
    exit 1
fi

# Обновляем версию
echo "📝 Обновляем версию..."
npm version "$VERSION_TYPE" --no-git-tag-version

# Получаем новую версию
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ Новая версия: $NEW_VERSION"

# Собираем пакет
echo "🔨 Собираем пакет..."
npm run build

# Проверяем пакет
echo "🔍 Проверяем пакет..."
npm pack --dry-run

# Коммитим изменения
echo "💾 Коммитим изменения..."
git add package.json
git commit -m "Bump version to $NEW_VERSION"

# Создаем тег
TAG_NAME="v$NEW_VERSION"
echo "🏷️  Создаем тег: $TAG_NAME"
git tag "$TAG_NAME"

# Пушим изменения и тег
echo "📤 Пушим изменения в репозиторий..."
git push origin main
git push origin "$TAG_NAME"

echo "✅ Релиз создан успешно!"
echo "📦 Тег: $TAG_NAME"
echo "🔗 Создайте релиз на GitHub: https://github.com/KonstantinRogozhkin/neira-cli-mcp/releases/new?tag=$TAG_NAME"
echo "🚀 После создания релиза пакет автоматически опубликуется в NPM" 