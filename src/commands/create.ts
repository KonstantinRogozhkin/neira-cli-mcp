import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

/**
 * Создает новое приложение NEIRA на основе шаблона
 */
export async function createApp(appName: string, options: { description?: string } = {}) {
  console.log(chalk.blue(`🚀 Создание приложения "${appName}"...`));

  const appDir = path.join(process.cwd(), appName);
  const templateDir = path.join(__dirname, 'basic-app');

  // Проверяем, что директория не существует
  if (fs.existsSync(appDir)) {
    throw new Error(`Директория "${appName}" уже существует`);
  }

  // Проверяем, что шаблон существует
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Шаблон не найден: ${templateDir}`);
  }

  // Копируем шаблон
  await fs.copy(templateDir, appDir);

  // Заменяем плейсхолдеры в файлах
  const description = options.description || `Приложение ${appName} для NEIRA`;
  const author = 'NEIRA Developer';

  await replaceInFile(path.join(appDir, 'package.json'), {
    '{{appName}}': appName,
    '{{description}}': description,
    '{{author}}': author
  });

  await replaceInFile(path.join(appDir, 'README.md'), {
    '{{appName}}': appName,
    '{{description}}': description,
    '{{author}}': author
  });

  await replaceInFile(path.join(appDir, 'src', 'index.ts'), {
    '{{appName}}': appName,
    '{{description}}': description,
    '{{author}}': author
  });

  console.log(chalk.green(`✅ Приложение "${appName}" создано успешно!`));
  console.log(chalk.gray(''));
  console.log(chalk.blue('Следующие шаги:'));
  console.log(chalk.gray(`  cd ${appName}`));
  console.log(chalk.gray(`  npm install`));
  console.log(chalk.gray(`  npm run dev`));
  console.log(chalk.gray(''));
  console.log(chalk.yellow('💡 Приложение использует neira-shared-types для типизации'));
}

/**
 * Заменяет плейсхолдеры в файле
 */
async function replaceInFile(filePath: string, replacements: Record<string, string>) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = await fs.readFile(filePath, 'utf8');
  
  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(placeholder, 'g'), value);
  }

  await fs.writeFile(filePath, content);
} 