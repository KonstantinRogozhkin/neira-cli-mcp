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
 * Проверяет, установлен ли code2prompt
 */
async function checkCode2Prompt(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('code2prompt', ['--version'], { stdio: 'pipe' });
    child.on('close', (code) => {
      resolve(code === 0);
    });
    child.on('error', () => {
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
  dynamicPackages: string[]
): string[] {
  const args = [projectRoot, '--no-clipboard', '-O', outputFile];
  
  // Добавляем исключения
  for (const exclude of COMMON_EXCLUDES) {
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
    const child = spawn('code2prompt', args, { 
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`code2prompt завершился с кодом ${code}`));
      }
    });
    
    child.on('error', (error) => {
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
 * Основная функция экспорта кода
 */
export async function exportCode(options: {
  profile: ExportProfile;
  output?: string;
  force?: boolean;
}): Promise<void> {
  const { profile, output, force = false } = options;
  
  console.log(chalk.blue('🚀 Запуск экспорта кода NEIRA Super App...'));
  
  // Проверяем наличие code2prompt
  const hasCode2Prompt = await checkCode2Prompt();
  if (!hasCode2Prompt) {
    throw new Error(
      'code2prompt не найден. Установите его: npm install -g code2prompt'
    );
  }
  
  // Находим корень проекта
  const projectRoot = await findProjectRoot();
  console.log(chalk.gray(`Корень проекта: ${projectRoot}`));
  
  // Получаем динамические пакеты
  const dynamicPackages = await getDynamicPackages(projectRoot);
  
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
      return;
    } catch {
      // Файл не существует, продолжаем
    }
  }
  
  console.log(chalk.blue('📝 Параметры экспорта:'));
  console.log(`   Профиль: ${profile}`);
  console.log(`   Описание: ${EXPORT_PROFILES[profile] || 'Динамический пакет'}`);
  console.log(`   Выходной файл: ${outputFile}`);
  console.log('----------------------------------------');
  
  // Строим аргументы для code2prompt
  const args = buildCode2PromptArgs(projectRoot, profile, outputFile, dynamicPackages);
  
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
} 