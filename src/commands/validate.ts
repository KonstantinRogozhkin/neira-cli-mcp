import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

interface NeiraAppManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  icon?: string;
  permissions?: string[];
  category?: string;
  tags?: string[];
}

export async function validateApp() {
  console.log(chalk.blue('🔍 Валидация neira-app.json...'));

  const manifestPath = path.join(process.cwd(), 'neira-app.json');

  // Проверяем наличие файла
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Файл neira-app.json не найден в текущей директории');
  }

  let manifest: NeiraAppManifest;
  try {
    manifest = await fs.readJson(manifestPath);
  } catch (error) {
    throw new Error(`Ошибка чтения neira-app.json: ${error}`);
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Обязательные поля
  if (!manifest.name) {
    errors.push('Поле "name" обязательно');
  } else if (typeof manifest.name !== 'string') {
    errors.push('Поле "name" должно быть строкой');
  } else if (manifest.name.length < 3) {
    errors.push('Поле "name" должно содержать минимум 3 символа');
  }

  if (!manifest.version) {
    errors.push('Поле "version" обязательно');
  } else if (typeof manifest.version !== 'string') {
    errors.push('Поле "version" должно быть строкой');
  } else if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push('Поле "version" должно быть в формате X.Y.Z (например, 1.0.0)');
  }

  if (!manifest.description) {
    errors.push('Поле "description" обязательно');
  } else if (typeof manifest.description !== 'string') {
    errors.push('Поле "description" должно быть строкой');
  } else if (manifest.description.length < 10) {
    warnings.push('Поле "description" слишком короткое (рекомендуется минимум 10 символов)');
  }

  if (!manifest.author) {
    errors.push('Поле "author" обязательно');
  } else if (typeof manifest.author !== 'string') {
    errors.push('Поле "author" должно быть строкой');
  }

  if (!manifest.main) {
    errors.push('Поле "main" обязательно');
  } else if (typeof manifest.main !== 'string') {
    errors.push('Поле "main" должно быть строкой');
  } else {
    // Проверяем наличие основного файла
    const mainPath = path.join(process.cwd(), manifest.main);
    if (!fs.existsSync(mainPath)) {
      errors.push(`Основной файл "${manifest.main}" не найден`);
    }
  }

  // Необязательные поля
  if (manifest.icon) {
    if (typeof manifest.icon !== 'string') {
      errors.push('Поле "icon" должно быть строкой');
    } else {
      const iconPath = path.join(process.cwd(), manifest.icon);
      if (!fs.existsSync(iconPath)) {
        warnings.push(`Файл иконки "${manifest.icon}" не найден`);
      }
    }
  } else {
    warnings.push('Рекомендуется добавить иконку приложения');
  }

  if (manifest.permissions) {
    if (!Array.isArray(manifest.permissions)) {
      errors.push('Поле "permissions" должно быть массивом');
    } else {
      const validPermissions = ['chat', 'context', 'files', 'network', 'storage'];
      const invalidPermissions = manifest.permissions.filter(p => !validPermissions.includes(p));
      if (invalidPermissions.length > 0) {
        errors.push(`Недопустимые разрешения: ${invalidPermissions.join(', ')}`);
      }
    }
  }

  if (manifest.category) {
    if (typeof manifest.category !== 'string') {
      errors.push('Поле "category" должно быть строкой');
    } else {
      const validCategories = ['utility', 'productivity', 'entertainment', 'education', 'business', 'developer'];
      if (!validCategories.includes(manifest.category)) {
        warnings.push(`Неизвестная категория "${manifest.category}". Доступные: ${validCategories.join(', ')}`);
      }
    }
  }

  if (manifest.tags) {
    if (!Array.isArray(manifest.tags)) {
      errors.push('Поле "tags" должно быть массивом');
    } else if (manifest.tags.length > 10) {
      warnings.push('Слишком много тегов (рекомендуется максимум 10)');
    }
  }

  // Выводим результаты
  if (errors.length > 0) {
    console.log(chalk.red('❌ Найдены ошибки:'));
    errors.forEach(error => {
      console.log(chalk.red(`  • ${error}`));
    });
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow('⚠️  Предупреждения:'));
    warnings.forEach(warning => {
      console.log(chalk.yellow(`  • ${warning}`));
    });
  }

  if (errors.length === 0) {
    console.log(chalk.green('✅ Манифест валиден!'));
    if (warnings.length === 0) {
      console.log(chalk.green('   Никаких проблем не найдено.'));
    }
  } else {
    throw new Error(`Найдено ${errors.length} ошибок в манифесте`);
  }
} 