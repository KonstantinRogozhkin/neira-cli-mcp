import { promises as fs, existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';

/**
 * Профили экспорта кода
 */
export const EXPORT_PROFILES = {
  general: 'Основные компоненты без документации и тестов',
  docs: 'Документация (README файлы, docs папки)',
  build: 'Конфигурация сборки и CI',
  tests: 'Тесты и вспомогательные скрипты',
  all: 'Максимально полный дамп'
} as const;

export type ExportProfile = keyof typeof EXPORT_PROFILES;

/**
 * Общие исключения для экспорта кода (упрощенные для совместимости с code2prompt v3.x)
 */
const COMMON_EXCLUDES = [
  // Основные служебные папки
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  '.git',
  '.next',
  '.turbo',
  '.cache',
  'logs',
  'tmp',
  'temp'
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
 * Определяет путь к бинарному файлу code2prompt
 */
function getCode2PromptCommand(): string {
  const isWindows = process.platform === 'win32';
  const binName = isWindows ? 'code2prompt.cmd' : 'code2prompt';
  
  // Сначала пробуем найти в текущем проекте
  const localPath = path.join(process.cwd(), 'node_modules', '.bin', binName);
  if (existsSync(localPath)) {
    return localPath;
  }
  
  // Пробуем найти code2prompt через require.resolve (самый надежный способ)
  try {
    const code2promptModule = require.resolve('code2prompt');
    const moduleRoot = path.dirname(code2promptModule);
    
    // Ищем исполняемый файл в различных возможных местах
    const possibleBinPaths = [
      path.join(moduleRoot, '..', '.bin', binName),
      path.join(moduleRoot, '..', '..', '.bin', binName),
      path.join(moduleRoot, 'bin', 'code2prompt.js'), // Альтернативный путь
    ];
    
    for (const binPath of possibleBinPaths) {
      if (existsSync(binPath)) {
        return binPath;
      }
    }
    
    // Если .bin не найден, возвращаем путь к модулю для npx
    return `npx code2prompt`;
  } catch (error) {
    // code2prompt не найден через require.resolve
  }
  
  // Fallback на глобальную команду
  return binName;
}

/**
 * Проверяет, установлен ли code2prompt
 */
async function checkCode2Prompt(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(chalk.gray('Проверка наличия code2prompt...'));
    
    const command = getCode2PromptCommand();
    const child = spawn(command, ['--version'], { 
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
 * Находит корень монорепозитория (ищет несколько связанных пакетов)
 */
async function findMonorepoRoot(): Promise<string | null> {
  let currentDir = process.cwd();
  const startDir = currentDir;
  let levelsUp = 0;
  const maxLevels = 2; // Ограничиваем поиск 2 уровнями вверх
  
  while (currentDir !== path.parse(currentDir).root && levelsUp < maxLevels) {
    try {
      const files = await fs.readdir(currentDir);
      
      // Ищем признаки монорепозитория
      const hasWorkspaces = await fs.access(path.join(currentDir, 'package.json'))
        .then(async () => {
          const pkg = JSON.parse(await fs.readFile(path.join(currentDir, 'package.json'), 'utf-8'));
          return pkg.workspaces || pkg.packages;
        })
        .catch(() => false);
      
      // Или ищем несколько пакетов с package.json
      const packageDirs = [];
      for (const file of files) {
        if (file.startsWith('.') || file === 'node_modules' || file === 'dist' || file === 'build') {
          continue;
        }
        try {
          const filePath = path.join(currentDir, file);
          const stat = await fs.stat(filePath);
          if (stat.isDirectory()) {
            const packageJsonPath = path.join(filePath, 'package.json');
            try {
              await fs.access(packageJsonPath);
              packageDirs.push(file);
            } catch {
              // package.json не найден
            }
          }
        } catch {
          // Ошибка доступа к файлу
        }
      }
      
      if (hasWorkspaces || packageDirs.length >= 2) {
        return currentDir;
      }
    } catch (error) {
      // Игнорируем ошибки доступа к директориям
    }
    currentDir = path.dirname(currentDir);
    levelsUp++;
  }
  
  return null;
}

/**
 * Получает динамически обнаруженные пакеты
 */
async function getDynamicPackages(projectRoot: string): Promise<string[]> {
  const packages: string[] = [];
  
  try {
    const dirs = await fs.readdir(projectRoot);
    
    // Ищем любые директории с package.json
    for (const dir of dirs) {
      // Пропускаем служебные папки
      if (dir.startsWith('.') || dir === 'node_modules' || dir === 'dist' || dir === 'build') {
        continue;
      }
      
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
      // Включаем основные файлы проекта и пакеты
      args.push('-i', 'package.json');
      // Добавляем найденные пакеты
      for (const pkg of dynamicPackages) {
        args.push('-i', `${pkg}/package.json`, '-i', `${pkg}/src`);
      }
      args.push('-e', '.github');
      break;
    case 'docs':
      args.push(
        '-i', 'docs'
      );
      break;
    case 'build':
      args.push(
        '-i', 'package.json', '-i', 'turbo.json',
        '-i', '.github', '-i', 'scripts',
        '-i', 'tsconfig.json'
      );
      break;
    case 'tests':
      args.push(
        '-i', 'tests', '-i', '__tests__', '-i', 'spec'
      );
      break;
    case 'all':
      // Для 'all' не добавляем дополнительные включения - берем все
      break;
    default:
      // Проверяем, является ли профиль динамическим пакетом
      if (dynamicPackages.includes(profile)) {
        args.push('-i', profile);
      } else {
        throw new Error(`Неизвестный профиль: ${profile}`);
      }
  }
  
  return args;
}

/**
 * Экспортирует документацию проекта
 */
async function exportDocumentation(options: {
  projectRoot: string;
  outputFile: string;
  force?: boolean;
}): Promise<void> {
  const { projectRoot, outputFile, force = false } = options;
  
  console.log(chalk.blue('📚 Создание выгрузки документации...'));
  console.log(chalk.gray(`Проект: ${projectRoot}`));
  
  // Проверяем, существует ли файл (если не force)
  if (!force) {
    try {
      await fs.access(outputFile);
      console.log(chalk.yellow(`Файл документации уже существует. Используйте --force для перезаписи.`));
      return;
    } catch {
      // Файл не существует, продолжаем
    }
  }
  
  // Динамически проверяем существование документационных файлов и папок
  const args = [
    '.',
    '--no-clipboard',
    '-O', outputFile
  ];
  
  // Проверяем существование основных документационных файлов
  const potentialFiles = ['README.md', 'CLAUDE.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'LICENSE.md', 'LICENSE'];
  const potentialDirs = ['docs', 'src/docs', 'documentation', 'doc'];
  
  // Добавляем отдельные файлы
  for (const include of potentialFiles) {
    try {
      const includePath = path.join(projectRoot, include);
      await fs.access(includePath);
      args.push('-i', include);
      console.log(chalk.gray(`Добавлен в документацию: ${include}`));
    } catch {
      // Файл не существует, пропускаем
    }
  }
  
  // Добавляем папки с их содержимым
  for (const dir of potentialDirs) {
    try {
      const dirPath = path.join(projectRoot, dir);
      const stat = await fs.stat(dirPath);
      if (stat.isDirectory()) {
        args.push('-i', `${dir}/**/*`);
        console.log(chalk.gray(`Добавлена папка в документацию: ${dir}/**/*`));
      }
    } catch {
      // Папка не существует, пропускаем
    }
  }
  
  // Исключаем основные служебные папки
  const excludes = ['node_modules', 'dist', '.git', 'src/cli.ts', 'src/commands', 'src/__tests__', 'templates'];
  for (const exclude of excludes) {
    args.push('-e', exclude);
  }
  
  console.log(chalk.gray(`Запуск экспорта документации...`));
  
  // Запускаем code2prompt из директории проекта
  const originalCwd = process.cwd();
  process.chdir(projectRoot);
  
  try {
    await runCode2Prompt(args);
  } finally {
    // Возвращаем обратно рабочую директорию
    process.chdir(originalCwd);
  }
  
  // Подсчитываем размер файла
  const tokens = await estimateTokens(outputFile);
  
  console.log(chalk.green('✅ Выгрузка документации завершена!'));
  console.log(chalk.blue('📊 Результат документации:'));
  console.log(`   Размер: ~${tokens}k токенов`);
  console.log(`   Файл: ${outputFile}`);
}

/**
 * Запускает code2prompt с заданными аргументами
 */
async function runCode2Prompt(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = getCode2PromptCommand();
    console.log(chalk.gray(`Запуск: ${command} ${args.join(' ')}`));
    
    // Если команда содержит пробелы (например, "npx code2prompt"), разбиваем её
    let spawnCommand: string;
    let spawnArgs: string[];
    
    if (command.includes(' ')) {
      const parts = command.split(' ');
      spawnCommand = parts[0]; // 'npx' или 'node'
      spawnArgs = [...parts.slice(1), ...args]; // остальные аргументы + наши аргументы
    } else {
      spawnCommand = command;
      spawnArgs = args;
    }
    
    const child = spawn(spawnCommand, spawnArgs, { 
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
    console.log(chalk.yellow('\n💡 Установите code2prompt:'));
    console.log(chalk.gray('   В текущий проект: npm install code2prompt'));
    console.log(chalk.gray('   Глобально: npm install -g code2prompt'));
    throw new Error(
      'code2prompt не найден. Установите его локально или глобально.'
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
  const outputFileName = output || `v${timePrefix}-${datePrefix}-${projectName}.txt`;
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
  
  // Строим аргументы для code2prompt (удален старый basicExcludes)
  
  const args = [
    '.', // Используем относительный путь
    '--no-clipboard',
    '-O', outputFile
  ];
  
  // Добавляем критичные исключения + документационные файлы
  const criticalExcludes = [
    'node_modules',
    'dist',
    '.git'
  ];
  
  // Исключаем документационные файлы, так как они будут в отдельной выгрузке
  const docExcludes = [
    'docs',
    'documentation',
    'templates'
  ];
  
  // Динамически находим все .md и .mmd файлы для исключения (с учётом .exportignore)
  try {
    const { glob } = await import('glob');
    
    // Создаём список игнорируемых паттернов для glob
    const ignorePatterns = [
      ...criticalExcludes.map(p => `**/${p}/**`),
      ...additionalExcludes.map(p => p.includes('**') ? p : `**/${p}/**`)
    ];
    
    const mdFiles = await glob('**/*.md', { 
      cwd: projectRoot,
      ignore: ignorePatterns
    });
    const mmdFiles = await glob('**/*.mmd', { 
      cwd: projectRoot,
      ignore: ignorePatterns
    });
    
    // Добавляем найденные файлы к исключениям
    for (const file of [...mdFiles, ...mmdFiles]) {
      docExcludes.push(file);
    }
  } catch (error) {
    // Fallback на статичные исключения если glob не работает
    docExcludes.push('README.md', 'CLAUDE.md', 'src/docs/diagram.mmd');
  }
  
  for (const exclude of criticalExcludes) {
    args.push('-e', exclude);
  }
  
  for (const exclude of docExcludes) {
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
  
  // Создаем файл документации
  const docFileName = outputFileName.replace('.txt', '-docs.txt');
  const docOutputFile = path.join(versionDir, docFileName);
  
  await exportDocumentation({
    projectRoot: process.cwd(),
    outputFile: docOutputFile,
    force
  });
  
  return outputFile;
}

/**
 * Основная функция экспорта кода
 */
export async function exportCode(options: {
  profile: ExportProfile;
  output?: string;
  force?: boolean;
  forceCurrentProject?: boolean;
}): Promise<string | void> {
  const { profile, output, force = false, forceCurrentProject = false } = options;
  
  console.log(chalk.blue('🚀 Запуск экспорта кода...'));
  
  // Проверяем наличие code2prompt
  const hasCode2Prompt = await checkCode2Prompt();
  if (!hasCode2Prompt) {
    console.log(chalk.yellow('\n💡 Установите code2prompt:'));
    console.log(chalk.gray('   В текущий проект: npm install code2prompt'));
    console.log(chalk.gray('   Глобально: npm install -g code2prompt'));
    throw new Error(
      'code2prompt не найден. Установите его локально или глобально.'
    );
  }
  
  // Если принудительно запрошен экспорт текущего проекта, пропускаем поиск монорепозитория
  if (forceCurrentProject) {
    console.log(chalk.gray('📁 Принудительный экспорт текущего проекта'));
    const exportFilePath = await exportCurrentProject({ output, force });
    return exportFilePath;
  }
  
  // Пытаемся найти корень монорепозитория
  const monorepoRoot = await findMonorepoRoot();
  if (!monorepoRoot) {
    // Если монорепозиторий не найден, экспортируем текущий проект
    console.log(chalk.gray('📁 Экспортируем текущий проект'));
    const exportFilePath = await exportCurrentProject({ output, force });
    return exportFilePath;
  }
  
  console.log(chalk.gray(`📁 Найден монорепозиторий: ${monorepoRoot}`));
  const projectRoot = monorepoRoot;
  
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
  const projectName = path.basename(projectRoot);
  const outputFileName = output || `v${timePrefix}-${datePrefix}-${profile}-${projectName}.txt`;
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
  
  // Создаем файл документации
  const docFileName = outputFileName.replace('.txt', '-docs.txt');
  const docOutputFile = path.join(versionDir, docFileName);
  
  await exportDocumentation({
    projectRoot: process.cwd(),
    outputFile: docOutputFile,
    force
  });
  
  // Показываем дополнительную информацию
  if (profile === 'general') {
    console.log(chalk.gray('\n💡 Для экспорта отдельных компонентов используйте:'));
    for (const pkg of dynamicPackages) {
      console.log(chalk.gray(`   neira-cli-mcp export ${pkg}`));
    }
  }
  
  return outputFile;
} 