import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function packageApp() {
  console.log(chalk.blue('📦 Упаковка приложения...'));

  const manifestPath = path.join(process.cwd(), 'neira-app.json');

  // Проверяем наличие манифеста
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Файл neira-app.json не найден в текущей директории');
  }

  let manifest;
  try {
    manifest = await fs.readJson(manifestPath);
  } catch (error) {
    throw new Error(`Ошибка чтения neira-app.json: ${error}`);
  }

  const appName = manifest.name;
  if (!appName) {
    throw new Error('Поле "name" не найдено в neira-app.json');
  }

  // Создаем директорию для сборки
  const buildDir = path.join(process.cwd(), 'build');
  await fs.ensureDir(buildDir);

  // Проверяем наличие собранного приложения
  const distDir = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    console.log(chalk.yellow('⚠️  Директория dist не найдена. Запускаем сборку...'));
    
    // Здесь можно добавить автоматическую сборку, но пока просто предупреждаем
    throw new Error('Сначала соберите приложение командой: npm run build');
  }

  console.log(chalk.gray('📁 Копирование файлов...'));

  // Создаем временную директорию для пакета
  const tempDir = path.join(buildDir, 'temp');
  await fs.ensureDir(tempDir);

  // Копируем необходимые файлы
  await fs.copy(distDir, path.join(tempDir, 'dist'));
  await fs.copy(manifestPath, path.join(tempDir, 'neira-app.json'));

  // Копируем package.json если есть
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    await fs.copy(packageJsonPath, path.join(tempDir, 'package.json'));
  }

  // Копируем иконку если есть
  if (manifest.icon) {
    const iconPath = path.join(process.cwd(), manifest.icon);
    if (fs.existsSync(iconPath)) {
      await fs.copy(iconPath, path.join(tempDir, manifest.icon));
    }
  }

  // Копируем README если есть
  const readmePath = path.join(process.cwd(), 'README.md');
  if (fs.existsSync(readmePath)) {
    await fs.copy(readmePath, path.join(tempDir, 'README.md'));
  }

  console.log(chalk.gray('🗜️  Создание архива...'));

  // Простая имитация создания .npx файла
  // В реальности здесь бы был код для создания специального архива
  const packagePath = path.join(buildDir, `${appName}.npx`);
  
  // Создаем метаданные пакета
  const packageMeta = {
    name: appName,
    version: manifest.version,
    description: manifest.description,
    author: manifest.author,
    created: new Date().toISOString(),
    files: await getFileList(tempDir),
    checksum: 'dev-build-' + Date.now() // В реальности - настоящая контрольная сумма
  };

  await fs.writeJson(path.join(tempDir, 'package-meta.json'), packageMeta, { spaces: 2 });

  // Имитируем создание .npx файла (в реальности это был бы архив)
  await fs.writeJson(packagePath, {
    meta: packageMeta,
    note: 'Это dev-версия .npx файла. В продакшене здесь был бы бинарный архив.'
  }, { spaces: 2 });

  // Очищаем временную директорию
  await fs.remove(tempDir);

  console.log(chalk.green(`✅ Пакет создан: ${packagePath}`));
  console.log(chalk.gray(''));
  console.log(chalk.blue('Следующие шаги:'));
  console.log(chalk.gray('1. Протестируйте пакет локально'));
  console.log(chalk.gray('2. Создайте релиз в вашем GitHub репозитории'));
  console.log(chalk.gray('3. Загрузите .npx файл в релиз'));
  console.log(chalk.gray('4. Отправьте PR в neira-apps'));
}

async function getFileList(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function scan(currentDir: string, relativePath: string = '') {
    const items = await fs.readdir(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const relativeItemPath = path.join(relativePath, item);
      
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await scan(fullPath, relativeItemPath);
      } else {
        files.push(relativeItemPath);
      }
    }
  }
  
  await scan(dir);
  return files;
} 