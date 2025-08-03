import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';

/**
 * Профили экспорта кода
 */
export const EXPORT_PROFILES = {
  general: 'Основные компоненты без документации и тестов',
  mobile: 'Мобильная часть (neira-mobile-core + neira-mobile-bff)',
  community: 'Открытая экосистема (neira-core + neira-apps)',
  enterprise: 'Коммерческая часть (neira-enterprise)',
  cli: 'Инструменты разработчика (neira-cli-mcp)',
  cloud: 'Облачные сервисы (neira-cloud-backend)',
  docs: 'Документация (neira-docs/docs + README файлы)',
  build: 'Конфигурация сборки и CI',
  tests: 'Тесты и вспомогательные скрипты',
  all: 'Максимально полный дамп'
} as const;

export type ExportProfile = keyof typeof EXPORT_PROFILES;

/**
 * Общие исключения для экспорта кода
 */
const COMMON_EXCLUDES = [
  // === ОСНОВНЫЕ АРТЕФАКТЫ СБОРКИ И ЗАВИСИМОСТИ ===
  "**/node_modules/**", "**/dist/**", "**/out/**", "**/build/**", "**/.next/**",
  "**/.turbo/**", "**/coverage/**", "*.log", "*.map", "*.lock",
  "*.DS_Store", "*.idea*", "*.vscode*", ".git/**",
  "*/.neira/export_code/*",
  
  // === СПЕЦИФИЧНЫЕ АРТЕФАКТЫ СБОРКИ ===
  "**/shell/shell/out/**", "**/shell/out/**",
  "**/chrome-context-menu/dist/**",
  "**/chrome-extensions/dist/**", "**/chrome-extensions/spec/**",
  "**/chrome-extensions/script/native-messaging-host/dist/**",
  "**/chrome-extensions/script/native-messaging-host/crxtesthost*",
  "**/chrome-extensions/script/native-messaging-host/*.blob",
  "**/chrome-web-store/dist/**",
  "**/logger/dist/**",
  "**/shell/shell/resources/vscode/dist/**",
  
  // Next.js и веб-приложения
  "**/neira-app/out/**", "**/neira-app/generated/**",
  "**/neira-app/.next/**",
  
  // === ДУБЛИКАТЫ И ПОДМОДУЛИ ===
  "**/neira-enterprise/platform/**", // Git submodule дубликат neira-core
  
  // === ВРЕМЕННЫЕ ФАЙЛЫ И ЛОГИ ===
  "**/logs/**", "**/tmp/**", "**/temp/**", "**/.cache/**",
  "**/electron.vite.config.*.mjs", // Временные конфиги сборки
  
  // === ТЕСТОВЫЕ ДАННЫЕ И ПРИМЕРЫ ===
  "**/__tests__/**", "**/spec/**", "**/test/**", "**/*test*/**",
  "**/neira-apps/examples/**",
  "**/fixtures/**",
  
  // === ДОКУМЕНТАЦИЯ (КРОМЕ АРХИТЕКТУРНОЙ) ===
  "**/neira-docs/blog/**", "**/neira-docs/src/**", "**/neira-docs/static/**",
  "**/neira-docs/docusaurus.config.ts", "**/neira-docs/sidebars.ts",
  "**/.docusaurus/**", "**/resources/docs-site/**",
  
  // === БИНАРНЫЕ И МЕДИА ФАЙЛЫ ===
  "*.png", "*.jpg", "*.jpeg", "*.gif", "*.bmp", "*.webp", "*.svg", "*.tiff", "*.tif",
  "*.ico", "*.icns", "*.wav", "*.mp3", "*.mp4", "*.avi", "*.mov",
  "*.css", "*.dll", "*.bin", "*.dmg", "*.pdf", "*.exe",
  "*.ttf", "*.woff", "*.woff2", "*.otf",
  
  // === КОНФИГУРАЦИОННЫЕ И СЛУЖЕБНЫЕ ФАЙЛЫ ===
  "**/public/**", "**/drizzle/**", "**/*tmp.iconset*/**",
  "**/storybook-static/**", // Статические файлы Storybook
  "*.backup", "*.yml", "*.yaml", "**/*archive*/**", "**/*temp_knowledge*/**",
  "**/*openrouter-models.json*", "*.webpack*",
  "*package-lock.json", "*yarn.lock", "*.pnp.cjs", "*.pnp.js", "*.pnp.loader.mjs",
  
  // === YARN PNP И УСТАНОВОЧНЫЕ ФАЙЛЫ ===
  "**/.yarn/**", "**/install-state.gz",
  
  // === GIT ОБЪЕКТЫ И ИНДЕКСЫ ===
  "**/.git/objects/**", "**/.git/index", "**/.git/logs/**",
  
  // === TYPESCRIPT И СБОРОЧНЫЕ ФАЙЛЫ ===
  "*.tsbuildinfo", "*.tgz", "*.tar.gz",
  
  // === БАЗЫ ДАННЫХ ===
  "*.db", "*.sqlite", "*.sqlite3",
  
  // === ЛИЦЕНЗИОННЫЕ ФАЙЛЫ ===
  "**/LICENSE", "**/LICENSE.*", "**/*.LICENSE", "**/COPYING", "**/COPYRIGHT",
  
  // === УСТАРЕВШИЕ И СПЕЦИФИЧНЫЕ ИСКЛЮЧЕНИЯ ===
  "**/*electron-chrome-web-store*/**", "**/*docs-generator*/**",
  "**/shell/src/proto/**", "**/shell/resources/bin/**", "**/scripts/**"
];

/**
 * Читает файл .exportignore и возвращает список дополнительных исключений
 */
async function readExportIgnore(projectRoot: string): Promise<string[]> {
  const exportIgnorePath = path.join(projectRoot, '.exportignore');
  
  try {
    const content = await fs.readFile(exportIgnorePath, 'utf-8');
    const patterns = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#')); // Игнорируем пустые строки и комментарии
    
    if (patterns.length > 0) {
      console.log(chalk.gray(`📋 Найден .exportignore с ${patterns.length} правилами`));
    }
    
    return patterns;
  } catch (error) {
    // Файл .exportignore не найден или не читается - это нормально
    return [];
  }
}

/**
 * Проверяет, установлен ли code2prompt
 */
async function checkCode2Prompt(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(chalk.gray('Проверка наличия code2prompt...'));
    
    const child = spawn('code2prompt', ['--version'], { 
      stdio: 'pipe',
      shell: true 
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green(`✅ code2prompt найден: ${stdout.trim()}`));
        resolve(true);
      } else {
        console.log(chalk.red(`❌ code2prompt не найден (код: ${code})`));
        if (stderr) {
          console.log(chalk.gray(`Ошибка: ${stderr.trim()}`));
        }
        resolve(false);
      }
    });
    
    child.on('error', (error) => {
      console.log(chalk.red(`❌ Ошибка при проверке code2prompt: ${error.message}`));
      resolve(false);
    });
  });
}

/**
 * Находит корень проекта NEIRA Super App
 */
async function findProjectRoot(): Promise<string> {
  let currentDir = process.cwd();
  
  while (currentDir !== path.parse(currentDir).root) {
    try {
      const files = await fs.readdir(currentDir);
      // Ищем характерные файлы/папки NEIRA Super App
      if (files.includes('neira-core') && files.includes('neira-cli-mcp')) {
        return currentDir;
      }
    } catch (error) {
      // Игнорируем ошибки доступа к директориям
    }
    currentDir = path.dirname(currentDir);
  }
  
  throw new Error('Не удалось найти корень проекта NEIRA Super App');
}

/**
 * Получает динамически обнаруженные пакеты
 */
async function getDynamicPackages(projectRoot: string): Promise<string[]> {
  const packages: string[] = [];
  
  try {
    const dirs = await fs.readdir(projectRoot);
    for (const dir of dirs) {
      if (dir.startsWith('neira-')) {
        const dirPath = path.join(projectRoot, dir);
        const stat = await fs.stat(dirPath);
        if (stat.isDirectory()) {
          const packageJsonPath = path.join(dirPath, 'package.json');
          try {
            await fs.access(packageJsonPath);
            packages.push(dir);
          } catch {
            // package.json не найден, пропускаем
          }
        }
      }
    }
  } catch (error) {
    console.warn(chalk.yellow('Предупреждение: Не удалось получить список пакетов'));
  }
  
  return packages;
}

/**
 * Создает аргументы для code2prompt на основе профиля
 */
function buildCode2PromptArgs(
  projectRoot: string,
  profile: ExportProfile,
  outputFile: string,
  dynamicPackages: string[],
  additionalExcludes: string[] = []
): string[] {
  const args = [projectRoot, '--no-clipboard', '-O', outputFile];
  
  // Добавляем стандартные исключения
  for (const exclude of COMMON_EXCLUDES) {
    args.push('-e', exclude);
  }
  
  // Добавляем дополнительные исключения из .exportignore
  for (const exclude of additionalExcludes) {
    args.push('-e', exclude);
  }
  
  // Добавляем включения в зависимости от профиля
  switch (profile) {
    case 'general':
      args.push(
        '-i', 'package.json', '-i', 'README.md', '-i', 'CHANGELOG.md', '-i', 'ROADMAP.md',
        '-i', 'neira-mobile-core/package.json', '-i', 'neira-mobile-core/packages/**',
        '-i', 'neira-core/package.json', '-i', 'neira-core/packages/**',
        '-i', 'neira-enterprise/package.json', '-i', 'neira-enterprise/packages/**',
        '-i', 'neira-cli-mcp/package.json', '-i', 'neira-cli-mcp/src/**',
        '-i', 'neira-cloud-backend/package.json', '-i', 'neira-cloud-backend/services/**',
        '-e', '*tests*', '-e', '*test.ts', '-e', '*spec.ts', '-e', '.github/*',
        '-e', '*docs*', '-e', 'neira-docs/*'
      );
      break;
    case 'mobile':
      args.push(
        '-i', 'neira-mobile-core/**',
        '-e', '*tests*', '-e', '*test.ts', '-e', '*spec.ts'
      );
      break;
    case 'community':
      args.push(
        '-i', 'neira-core/**', '-i', 'neira-apps/**',
        '-e', '*tests*', '-e', '*test.ts', '-e', '*spec.ts'
      );
      break;
    case 'enterprise':
      args.push(
        '-i', 'neira-enterprise/**',
        '-e', '*tests*', '-e', '*test.ts', '-e', '*spec.ts'
      );
      break;
    case 'cli':
      args.push(
        '-i', 'neira-cli-mcp/**',
        '-e', '*tests*', '-e', '*test.ts', '-e', '*spec.ts'
      );
      break;
    case 'cloud':
      args.push(
        '-i', 'neira-cloud-backend/**',
        '-e', '*tests*', '-e', '*test.ts', '-e', '*spec.ts'
      );
      break;
    case 'docs':
      args.push(
        '-i', 'neira-docs/docs/**', '-i', '*.md', '-i', '**/README*',
        '-i', '*.mmd', '-i', '.neira/docs/**',
        '-e', '*node_modules*'
      );
      break;
    case 'build':
      args.push(
        '-i', 'package.json', '-i', 'turbo.json', '-i', '**/package.json',
        '-i', '*.config.js', '-i', '*.config.ts', '-i', '*.config.json',
        '-i', '.github/workflows/**', '-i', '**/scripts/**',
        '-i', 'tsconfig.json', '-i', '**/tsconfig.json'
      );
      break;
    case 'tests':
      args.push(
        '-i', '**/tests/**', '-i', '*test.ts', '-i', '*spec.ts',
        '-i', '**/scripts/**', '-i', '**/__tests__/**'
      );
      break;
    case 'all':
      // Для 'all' не добавляем дополнительные включения
      // Исключаем тяжёлые исходники LibreChat UI, чтобы сократить объём выгрузки
      args.push('-e', 'neira-core/packages/apps/librechat-ui/src/**');
      break;
    default:
      // Проверяем, является ли профиль динамическим пакетом
      if (dynamicPackages.includes(profile)) {
        args.push('-i', `${profile}/**`);
      } else {
        throw new Error(`Неизвестный профиль: ${profile}`);
      }
  }
  
  return args;
}

/**
 * Запускает code2prompt с заданными аргументами
 */
async function runCode2Prompt(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(chalk.gray(`Запуск: code2prompt ${args.join(' ')}`));
    
    const child = spawn('code2prompt', args, { 
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('✅ code2prompt выполнен успешно'));
        resolve();
      } else {
        console.log(chalk.red(`❌ code2prompt завершился с кодом ${code}`));
        if (stderr) {
          console.log(chalk.gray(`Ошибка: ${stderr.trim()}`));
        }
        reject(new Error(`code2prompt завершился с кодом ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.log(chalk.red(`❌ Ошибка при запуске code2prompt: ${error.message}`));
      reject(error);
    });
  });
}

/**
 * Подсчитывает приблизительное количество токенов в файле
 */
async function estimateTokens(filePath: string): Promise<number> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 1000); // Приблизительно в тысячах
  } catch {
    return 0;
  }
}

/**
 * Экспортирует текущий проект (не Super App)
 */
async function exportCurrentProject(options: {
  output?: string;
  force?: boolean;
}): Promise<string> {
  const { output, force = false } = options;
  
  console.log(chalk.blue('🚀 Запуск экспорта текущего проекта...'));
  
  // Проверяем наличие code2prompt
  const hasCode2Prompt = await checkCode2Prompt();
  if (!hasCode2Prompt) {
    console.log(chalk.yellow('\n💡 Способы установки code2prompt:'));
    console.log(chalk.gray('   npm install -g code2prompt'));
    console.log(chalk.gray('   yarn global add code2prompt'));
    console.log(chalk.gray('   pnpm add -g code2prompt'));
    console.log(chalk.gray('   brew install code2prompt (macOS)'));
    throw new Error(
      'code2prompt не найден. Установите его одним из способов выше.'
    );
  }
  
  const projectRoot = process.cwd();
  console.log(chalk.gray(`Текущий проект: ${projectRoot}`));
  
  // Создаем директорию для экспорта
  const exportDir = path.join(projectRoot, '.neira', 'export_code');
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '-');
  const timePrefix = new Date().toTimeString().slice(0, 5).replace(':', '');
  
  const versionDir = path.join(exportDir, datePrefix, `v${timePrefix}`);
  await fs.mkdir(versionDir, { recursive: true });
  
  // Определяем имя выходного файла
  const projectName = path.basename(projectRoot);
  const outputFileName = output || `v${timePrefix}-${datePrefix}-${projectName}.md`;
  const outputFile = path.join(versionDir, outputFileName);
  
  // Проверяем, существует ли файл (если не force)
  if (!force) {
    try {
      await fs.access(outputFile);
      console.log(chalk.yellow(`Файл ${outputFileName} уже существует. Используйте --force для перезаписи.`));
      return outputFile;
    } catch {
      // Файл не существует, продолжаем
    }
  }
  
  // Читаем дополнительные исключения из .exportignore
  const additionalExcludes = await readExportIgnore(projectRoot);
  
  console.log(chalk.blue('📝 Параметры экспорта:'));
  console.log(`   Проект: ${projectName}`);
  console.log(`   Выходной файл: ${outputFile}`);
  if (additionalExcludes.length > 0) {
    console.log(`   Дополнительные исключения: ${additionalExcludes.length} правил из .exportignore`);
  }
  console.log('----------------------------------------');
  
  // Строим аргументы для code2prompt
  const basicExcludes = [
    'node_modules',
    'dist',
    '.git',
    '*.log',
    '*.map',
    '*.lock',
    '*.DS_Store',
    '.idea',
    '.vscode',
    'coverage',
    '.next',
    'build',
    'out',
    '.turbo',
    'tmp',
    'temp',
    '.cache',
    '*.tsbuildinfo',
    '*.tgz',
    '*.tar.gz'
  ];
  
  const args = [
    '.', // Используем относительный путь
    '--no-clipboard',
    '-O', outputFile
  ];
  
  // Добавляем базовые исключения
  for (const exclude of basicExcludes) {
    args.push('-e', exclude);
  }
  
  // Добавляем дополнительные исключения из .exportignore
  for (const exclude of additionalExcludes) {
    args.push('-e', exclude);
  }
  
  console.log(chalk.blue('⚙️  Запуск code2prompt...'));
  
  // Запускаем code2prompt
  await runCode2Prompt(args);
  
  // Подсчитываем размер файла
  const tokens = await estimateTokens(outputFile);
  
  console.log(chalk.green('✅ Экспорт завершен успешно!'));
  console.log(chalk.blue('📊 Результат:'));
  console.log(`   Размер: ~${tokens}k токенов`);
  console.log(`   Файл: ${outputFile}`);
  
  return outputFile;
}

/**
 * Основная функция экспорта кода
 */
export async function exportCode(options: {
  profile: ExportProfile;
  output?: string;
  force?: boolean;
}): Promise<string | void> {
  const { profile, output, force = false } = options;
  
  console.log(chalk.blue('🚀 Запуск экспорта кода NEIRA Super App...'));
  
  // Проверяем наличие code2prompt
  const hasCode2Prompt = await checkCode2Prompt();
  if (!hasCode2Prompt) {
    console.log(chalk.yellow('\n💡 Способы установки code2prompt:'));
    console.log(chalk.gray('   npm install -g code2prompt'));
    console.log(chalk.gray('   yarn global add code2prompt'));
    console.log(chalk.gray('   pnpm add -g code2prompt'));
    console.log(chalk.gray('   brew install code2prompt (macOS)'));
    throw new Error(
      'code2prompt не найден. Установите его одним из способов выше.'
    );
  }
  
  // Пытаемся найти корень проекта NEIRA Super App
  let projectRoot: string;
  try {
    projectRoot = await findProjectRoot();
    console.log(chalk.gray(`Корень проекта NEIRA Super App: ${projectRoot}`));
  } catch (error) {
    // Если не найден Super App, экспортируем текущий проект
    console.log(chalk.yellow('⚠️  NEIRA Super App не найден, экспортируем текущий проект'));
    const exportFilePath = await exportCurrentProject({ output, force });
    return exportFilePath;
  }
  
  // Получаем динамические пакеты
  const dynamicPackages = await getDynamicPackages(projectRoot);
  
  // Читаем дополнительные исключения из .exportignore
  const additionalExcludes = await readExportIgnore(projectRoot);
  
  // Создаем директорию для экспорта
  const exportDir = path.join(projectRoot, '.neira', 'export_code');
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '-');
  const timePrefix = new Date().toTimeString().slice(0, 5).replace(':', '');
  
  const versionDir = path.join(exportDir, datePrefix, `v${timePrefix}`);
  await fs.mkdir(versionDir, { recursive: true });
  
  // Определяем имя выходного файла
  const outputFileName = output || `v${timePrefix}-${datePrefix}-${profile}-neira-super-app.md`;
  const outputFile = path.join(versionDir, outputFileName);
  
  // Проверяем, существует ли файл (если не force)
  if (!force) {
    try {
      await fs.access(outputFile);
      console.log(chalk.yellow(`Файл ${outputFileName} уже существует. Используйте --force для перезаписи.`));
      return outputFile;
    } catch {
      // Файл не существует, продолжаем
    }
  }
  
  console.log(chalk.blue('📝 Параметры экспорта:'));
  console.log(`   Профиль: ${profile}`);
  console.log(`   Описание: ${EXPORT_PROFILES[profile] || 'Динамический пакет'}`);
  console.log(`   Выходной файл: ${outputFile}`);
  if (additionalExcludes.length > 0) {
    console.log(`   Дополнительные исключения: ${additionalExcludes.length} правил из .exportignore`);
  }
  console.log('----------------------------------------');
  
  // Строим аргументы для code2prompt
  const args = buildCode2PromptArgs(projectRoot, profile, outputFile, dynamicPackages, additionalExcludes);
  
  console.log(chalk.blue('⚙️  Запуск code2prompt...'));
  
  // Запускаем code2prompt
  await runCode2Prompt(args);
  
  // Подсчитываем размер файла
  const tokens = await estimateTokens(outputFile);
  
  console.log(chalk.green('✅ Экспорт завершен успешно!'));
  console.log(chalk.blue('📊 Результат:'));
  console.log(`   Размер: ~${tokens}k токенов`);
  console.log(`   Файл: ${outputFile}`);
  
  // Показываем дополнительную информацию
  if (profile === 'general') {
    console.log(chalk.gray('\n💡 Для экспорта отдельных компонентов используйте:'));
    for (const pkg of dynamicPackages) {
      console.log(chalk.gray(`   neira-cli-mcp export ${pkg}`));
    }
  }
  
  return outputFile;
} 