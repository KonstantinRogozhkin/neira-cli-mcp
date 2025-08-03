import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';

/**
 * Улучшенные интерфейсы для более детальной карты
 */
interface FunctionInfo {
  name: string;
  type: 'function' | 'method' | 'arrow' | 'async' | 'generator';
  params: ParameterInfo[];
  returnType?: string;
  description?: string;
  fullJSDoc?: string; // Полный JSDoc комментарий
  location: string;
  line: number;
  isExported: boolean;
  isDefault: boolean;
  visibility?: 'public' | 'private' | 'protected';
  decorators?: string[];
  complexity?: number; // Цикломатическая сложность
  linesOfCode?: number; // Количество строк
  dependencies?: string[]; // Зависимости функции
  callers?: string[]; // Кто вызывает эту функцию
  businessLogic?: string; // Бизнес-логика функции
  errorHandling?: ErrorHandlingInfo; // Обработка ошибок
  dataFlow?: DataFlowInfo; // Потоки данных
  performance?: PerformanceInfo; // Производительность
}

interface ClassInfo {
  name: string;
  description?: string;
  fullJSDoc?: string;
  location: string;
  line: number;
  methods: FunctionInfo[];
  properties: PropertyInfo[];
  isExported: boolean;
  extends?: string;
  implements?: string[];
  decorators?: string[];
  isAbstract?: boolean;
  complexity?: number;
  linesOfCode?: number;
  dependencies?: string[];
  designPattern?: string; // Архитектурный паттерн
  lifecycle?: string[]; // Жизненный цикл класса
  stateManagement?: string; // Управление состоянием
}

interface PropertyInfo {
  name: string;
  type?: string;
  description?: string;
  fullJSDoc?: string;
  isExported: boolean;
  isReadonly: boolean;
  isOptional: boolean;
  isStatic?: boolean;
  defaultValue?: string;
  decorators?: string[];
  validation?: string; // Валидация
  constraints?: string; // Ограничения
}

interface ParameterInfo {
  name: string;
  type?: string;
  isOptional: boolean;
  defaultValue?: string;
  description?: string;
  isRest?: boolean;
  validation?: string; // Валидация параметра
  constraints?: string; // Ограничения
}

interface InterfaceInfo {
  name: string;
  description?: string;
  fullJSDoc?: string;
  location: string;
  line: number;
  properties: PropertyInfo[];
  methods: FunctionInfo[];
  isExported: boolean;
  extends?: string[];
  isGeneric?: boolean;
  genericParams?: string[];
  dependencies?: string[];
  contract?: string; // Контракт интерфейса
  usage?: string[]; // Где используется
}

interface TypeInfo {
  name: string;
  description?: string;
  fullJSDoc?: string;
  location: string;
  line: number;
  isExported: boolean;
  type: 'type' | 'enum' | 'namespace' | 'module';
  value?: string;
  members?: PropertyInfo[];
  dependencies?: string[];
  domain?: string; // Доменная область
  constraints?: string; // Ограничения типа
}

interface ConstantInfo {
  name: string;
  type?: string;
  description?: string;
  fullJSDoc?: string;
  isExported: boolean;
  isDefault: boolean;
  location: string;
  line: number;
  value?: string;
  category?: string; // Категория константы
  scope?: string; // Область видимости
}

interface FileStructure {
  path: string;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  types: TypeInfo[];
  constants: ConstantInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  dependencies: string[];
  size: number;
  complexity: number;
  purpose?: string; // Назначение файла
  api?: string[]; // Публичные API
  testCoverage?: number; // Покрытие тестами
  businessDomain?: string; // Бизнес-домен
  architecturalLayer?: string; // Архитектурный слой
  configuration?: ConfigInfo; // Конфигурация
  documentation?: DocInfo; // Документация
}

interface ImportInfo {
  module: string;
  imports: string[];
  isDefault: boolean;
  isNamespace: boolean;
  line: number;
  type?: 'internal' | 'external' | 'builtin'; // Тип импорта
  usage?: string[]; // Где используется
  version?: string; // Версия зависимости
}

interface ExportInfo {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'constant' | 'default';
  isDefault: boolean;
  line: number;
  description?: string;
  consumers?: string[]; // Кто использует
  stability?: string; // Стабильность API
}

// Новые интерфейсы для лучшего понимания кода
interface ErrorHandlingInfo {
  tryCatchBlocks: number;
  errorTypes: string[];
  errorMessages: string[];
  fallbackStrategies: string[];
  logging: string[];
}

interface DataFlowInfo {
  inputs: string[];
  outputs: string[];
  transformations: string[];
  sideEffects: string[];
  dataStructures: string[];
}

interface PerformanceInfo {
  timeComplexity?: string;
  spaceComplexity?: string;
  bottlenecks?: string[];
  optimizations?: string[];
  memoryUsage?: string;
}

interface ConfigInfo {
  environmentVariables: string[];
  configurationFiles: string[];
  defaultValues: { [key: string]: string };
  validationRules: string[];
  secrets: string[];
}

interface DocInfo {
  readme?: string;
  apiDocs?: string[];
  examples?: string[];
  tutorials?: string[];
  changelog?: string;
}

interface ProjectArchitecture {
  modules: ModuleInfo[];
  dependencies: DependencyInfo[];
  patterns: PatternInfo[];
  complexity: ComplexityInfo;
  businessLogic: BusinessLogicInfo;
  dataFlow: DataFlowAnalysis;
  errorHandling: ErrorHandlingAnalysis;
  performance: PerformanceAnalysis;
  security: SecurityAnalysis;
}

interface ModuleInfo {
  name: string;
  path: string;
  purpose: string;
  exports: string[];
  imports: string[];
  complexity: number;
  size: number;
  businessDomain: string;
  architecturalLayer: string;
  designPatterns: string[];
}

interface DependencyInfo {
  from: string;
  to: string;
  type: 'import' | 'extends' | 'implements' | 'uses';
  strength: 'strong' | 'weak';
  direction: 'incoming' | 'outgoing' | 'bidirectional';
  businessContext: string;
}

interface PatternInfo {
  name: string;
  description: string;
  occurrences: number;
  files: string[];
  benefits: string[];
  tradeoffs: string[];
  alternatives: string[];
}

interface ComplexityInfo {
  totalComplexity: number;
  averageComplexity: number;
  mostComplexFunctions: FunctionInfo[];
  simpleFunctions: FunctionInfo[];
  hotspots: string[]; // Проблемные места
  refactoringOpportunities: string[];
}

interface BusinessLogicInfo {
  coreFunctions: FunctionInfo[];
  businessRules: string[];
  workflows: string[];
  validations: string[];
  calculations: string[];
  integrations: string[];
}

interface DataFlowAnalysis {
  dataSources: string[];
  dataSinks: string[];
  transformations: string[];
  dataStructures: string[];
  dataValidation: string[];
  dataPersistence: string[];
}

interface ErrorHandlingAnalysis {
  errorTypes: string[];
  errorHandlingStrategies: string[];
  loggingStrategies: string[];
  recoveryMechanisms: string[];
  errorBoundaries: string[];
}

interface PerformanceAnalysis {
  bottlenecks: string[];
  optimizationOpportunities: string[];
  resourceUsage: string[];
  scalabilityIssues: string[];
  performancePatterns: string[];
}

interface SecurityAnalysis {
  vulnerabilities: string[];
  securityPatterns: string[];
  authentication: string[];
  authorization: string[];
  dataProtection: string[];
  inputValidation: string[];
}

/**
 * Парсит JSDoc комментарии
 */
function parseJSDoc(comment: string): string | undefined {
  if (!comment) return undefined;
  
  // Убираем /** и */
  const cleanComment = comment
    .replace(/^\s*\/\*\*/, '')
    .replace(/\*\/\s*$/, '')
    .trim();
  
  // Извлекаем первое описание (до @param, @returns и т.д.)
  const lines = cleanComment.split('\n');
  const descriptionLines: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.replace(/^\s*\*\s*/, '').trim();
    if (trimmedLine.startsWith('@')) break;
    if (trimmedLine) descriptionLines.push(trimmedLine);
  }
  
  return descriptionLines.join(' ').trim() || undefined;
}

/**
 * Извлекает полный JSDoc комментарий
 */
function extractFullJSDoc(comment: string): string | undefined {
  if (!comment) return undefined;
  
  // Очищаем комментарий от маркеров, но сохраняем структуру
  let cleanComment = comment
    .replace(/^\s*\/\*\*/, '')
    .replace(/\*\/\s*$/, '')
    .trim();
  
  return cleanComment || undefined;
}

/**
 * Вычисляет цикломатическую сложность функции
 */
function calculateComplexity(content: string, startLine: number, endLine: number): number {
  const lines = content.split('\n').slice(startLine - 1, endLine);
  let complexity = 1; // Базовая сложность
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.includes('if ') || trimmedLine.includes('else if ')) complexity++;
    if (trimmedLine.includes('for ') || trimmedLine.includes('while ')) complexity++;
    if (trimmedLine.includes('switch ')) complexity++;
    if (trimmedLine.includes('catch ')) complexity++;
    if (trimmedLine.includes('&&') || trimmedLine.includes('||')) complexity++;
    if (trimmedLine.includes('?') && trimmedLine.includes(':')) complexity++;
  }
  
  return complexity;
}

/**
 * Определяет назначение файла на основе его содержимого и структуры
 */
function determineFilePurpose(content: string, path: string): string {
  const fileName = path.split('/').pop() || '';
  const lowerContent = content.toLowerCase();
  
  // Определяем по имени файла
  if (fileName.includes('test') || fileName.includes('spec')) return 'Тестирование';
  if (fileName.includes('config')) return 'Конфигурация';
  if (fileName.includes('types') || fileName.includes('interfaces')) return 'Типы и интерфейсы';
  if (fileName.includes('utils') || fileName.includes('helpers')) return 'Утилиты';
  if (fileName.includes('api') || fileName.includes('routes')) return 'API';
  if (fileName.includes('components')) return 'Компоненты';
  if (fileName.includes('services')) return 'Сервисы';
  if (fileName.includes('models')) return 'Модели данных';
  if (fileName.includes('controllers')) return 'Контроллеры';
  if (fileName.includes('middleware')) return 'Промежуточное ПО';
  
  // Определяем по содержимому
  if (lowerContent.includes('export default') && lowerContent.includes('function')) return 'Основной модуль';
  if (lowerContent.includes('interface') && lowerContent.includes('export')) return 'Типы и интерфейсы';
  if (lowerContent.includes('class') && lowerContent.includes('export')) return 'Классы';
  if (lowerContent.includes('describe(') || lowerContent.includes('it(')) return 'Тестирование';
  if (lowerContent.includes('process.env') || lowerContent.includes('config')) return 'Конфигурация';
  
  return 'Общий код';
}

/**
 * Анализирует зависимости функции
 */
function analyzeFunctionDependencies(content: string, startLine: number, endLine: number): string[] {
  const lines = content.split('\n').slice(startLine - 1, endLine);
  const dependencies: string[] = [];
  
  for (const line of lines) {
    // Ищем вызовы функций
    const functionCalls = line.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
    if (functionCalls) {
      for (const call of functionCalls) {
        const funcName = call.replace(/\s*\($/, '');
        if (funcName && !['if', 'for', 'while', 'switch', 'catch'].includes(funcName)) {
          dependencies.push(funcName);
        }
      }
    }
  }
  
  return [...new Set(dependencies)]; // Убираем дубликаты
}

/**
 * Анализирует бизнес-логику функции
 */
function analyzeBusinessLogic(content: string, startLine: number, endLine: number): string {
  const lines = content.split('\n').slice(startLine - 1, endLine);
  const businessKeywords = [
    'validate', 'check', 'verify', 'process', 'calculate', 'compute',
    'transform', 'convert', 'format', 'parse', 'serialize', 'deserialize',
    'save', 'load', 'create', 'update', 'delete', 'find', 'search',
    'filter', 'sort', 'group', 'aggregate', 'sum', 'count', 'average',
    'authenticate', 'authorize', 'encrypt', 'decrypt', 'hash', 'sign',
    'send', 'receive', 'notify', 'log', 'audit', 'backup', 'restore'
  ];
  
  const foundLogic: string[] = [];
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    for (const keyword of businessKeywords) {
      if (lowerLine.includes(keyword)) {
        foundLogic.push(keyword);
      }
    }
  }
  
  return foundLogic.length > 0 ? foundLogic.join(', ') : 'Общая логика';
}

/**
 * Анализирует обработку ошибок
 */
function analyzeErrorHandling(content: string, startLine: number, endLine: number): ErrorHandlingInfo {
  const lines = content.split('\n').slice(startLine - 1, endLine);
  const errorInfo: ErrorHandlingInfo = {
    tryCatchBlocks: 0,
    errorTypes: [],
    errorMessages: [],
    fallbackStrategies: [],
    logging: []
  };
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Подсчитываем try-catch блоки
    if (lowerLine.includes('try') || lowerLine.includes('catch')) {
      errorInfo.tryCatchBlocks++;
    }
    
    // Ищем типы ошибок
    const errorTypeMatch = line.match(/catch\s*\(\s*([^)]+)\s*\)/);
    if (errorTypeMatch) {
      errorInfo.errorTypes.push(errorTypeMatch[1].trim());
    }
    
    // Ищем сообщения об ошибках
    if (lowerLine.includes('error') || lowerLine.includes('exception')) {
      const messageMatch = line.match(/['"`]([^'"`]*error[^'"`]*)['"`]/i);
      if (messageMatch) {
        errorInfo.errorMessages.push(messageMatch[1]);
      }
    }
    
    // Ищем стратегии восстановления
    if (lowerLine.includes('fallback') || lowerLine.includes('default') || lowerLine.includes('else')) {
      errorInfo.fallbackStrategies.push('fallback');
    }
    
    // Ищем логирование
    if (lowerLine.includes('console.log') || lowerLine.includes('logger') || lowerLine.includes('log')) {
      errorInfo.logging.push('logging');
    }
  }
  
  return errorInfo;
}

/**
 * Анализирует потоки данных
 */
function analyzeDataFlow(content: string, startLine: number, endLine: number): DataFlowInfo {
  const lines = content.split('\n').slice(startLine - 1, endLine);
  const dataFlow: DataFlowInfo = {
    inputs: [],
    outputs: [],
    transformations: [],
    sideEffects: [],
    dataStructures: []
  };
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Ищем входные данные
    if (lowerLine.includes('read') || lowerLine.includes('input') || lowerLine.includes('get')) {
      dataFlow.inputs.push('input');
    }
    
    // Ищем выходные данные
    if (lowerLine.includes('write') || lowerLine.includes('output') || lowerLine.includes('return')) {
      dataFlow.outputs.push('output');
    }
    
    // Ищем преобразования
    if (lowerLine.includes('map') || lowerLine.includes('filter') || lowerLine.includes('reduce')) {
      dataFlow.transformations.push('transformation');
    }
    
    // Ищем побочные эффекты
    if (lowerLine.includes('console.log') || lowerLine.includes('fs.write') || lowerLine.includes('db.insert')) {
      dataFlow.sideEffects.push('side_effect');
    }
    
    // Ищем структуры данных
    if (lowerLine.includes('array') || lowerLine.includes('object') || lowerLine.includes('map') || lowerLine.includes('set')) {
      dataFlow.dataStructures.push('data_structure');
    }
  }
  
  return dataFlow;
}

/**
 * Анализирует производительность
 */
function analyzePerformance(content: string, startLine: number, endLine: number): PerformanceInfo {
  const lines = content.split('\n').slice(startLine - 1, endLine);
  const performance: PerformanceInfo = {};
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Ищем потенциальные узкие места
    if (lowerLine.includes('for') && lowerLine.includes('for')) {
      performance.bottlenecks = performance.bottlenecks || [];
      performance.bottlenecks.push('nested_loops');
    }
    
    if (lowerLine.includes('await') && lowerLine.includes('await')) {
      performance.bottlenecks = performance.bottlenecks || [];
      performance.bottlenecks.push('sequential_awaits');
    }
    
    // Ищем оптимизации
    if (lowerLine.includes('cache') || lowerLine.includes('memoize') || lowerLine.includes('optimize')) {
      performance.optimizations = performance.optimizations || [];
      performance.optimizations.push('optimization');
    }
  }
  
  return performance;
}

/**
 * Определяет архитектурный паттерн класса
 */
function detectDesignPattern(content: string, className: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('singleton') || (lowerContent.includes('instance') && lowerContent.includes('static'))) {
    return 'Singleton';
  }
  
  if (lowerContent.includes('factory') || lowerContent.includes('create')) {
    return 'Factory';
  }
  
  if (lowerContent.includes('observer') || lowerContent.includes('subscribe') || lowerContent.includes('emit')) {
    return 'Observer';
  }
  
  if (lowerContent.includes('strategy') || lowerContent.includes('algorithm')) {
    return 'Strategy';
  }
  
  if (lowerContent.includes('decorator') || lowerContent.includes('@')) {
    return 'Decorator';
  }
  
  if (lowerContent.includes('adapter') || lowerContent.includes('adapt')) {
    return 'Adapter';
  }
  
  if (lowerContent.includes('repository') || lowerContent.includes('data access')) {
    return 'Repository';
  }
  
  if (lowerContent.includes('service') || lowerContent.includes('business logic')) {
    return 'Service';
  }
  
  return 'Standard Class';
}

/**
 * Анализирует конфигурацию файла
 */
function analyzeConfiguration(content: string, filePath: string): ConfigInfo {
  const config: ConfigInfo = {
    environmentVariables: [],
    configurationFiles: [],
    defaultValues: {},
    validationRules: [],
    secrets: []
  };
  
  const lines = content.split('\n');
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Ищем переменные окружения
    if (lowerLine.includes('process.env') || lowerLine.includes('env.')) {
      const envMatch = line.match(/process\.env\.([A-Z_]+)/);
      if (envMatch) {
        config.environmentVariables.push(envMatch[1]);
      }
    }
    
    // Ищем конфигурационные файлы
    if (lowerLine.includes('config') || lowerLine.includes('settings')) {
      config.configurationFiles.push('config');
    }
    
    // Ищем секреты
    if (lowerLine.includes('password') || lowerLine.includes('secret') || lowerLine.includes('key')) {
      config.secrets.push('secret');
    }
    
    // Ищем валидацию
    if (lowerLine.includes('validate') || lowerLine.includes('check') || lowerLine.includes('assert')) {
      config.validationRules.push('validation');
    }
  }
  
  return config;
}

/**
 * Определяет бизнес-домен файла
 */
function determineBusinessDomain(content: string, filePath: string): string {
  const fileName = path.basename(filePath);
  const lowerContent = content.toLowerCase();
  
  // Определяем по ключевым словам
  if (lowerContent.includes('user') || lowerContent.includes('auth') || lowerContent.includes('login')) {
    return 'Authentication & Authorization';
  }
  
  if (lowerContent.includes('payment') || lowerContent.includes('billing') || lowerContent.includes('invoice')) {
    return 'Billing & Payments';
  }
  
  if (lowerContent.includes('order') || lowerContent.includes('cart') || lowerContent.includes('purchase')) {
    return 'Orders & Shopping';
  }
  
  if (lowerContent.includes('product') || lowerContent.includes('catalog') || lowerContent.includes('inventory')) {
    return 'Product Management';
  }
  
  if (lowerContent.includes('notification') || lowerContent.includes('email') || lowerContent.includes('sms')) {
    return 'Notifications';
  }
  
  if (lowerContent.includes('report') || lowerContent.includes('analytics') || lowerContent.includes('dashboard')) {
    return 'Reporting & Analytics';
  }
  
  if (lowerContent.includes('file') || lowerContent.includes('upload') || lowerContent.includes('download')) {
    return 'File Management';
  }
  
  return 'General Business Logic';
}

/**
 * Определяет архитектурный слой
 */
function determineArchitecturalLayer(filePath: string): string {
  const pathParts = filePath.split('/');
  
  if (pathParts.includes('controllers') || pathParts.includes('routes')) {
    return 'Presentation Layer';
  }
  
  if (pathParts.includes('services') || pathParts.includes('business')) {
    return 'Business Logic Layer';
  }
  
  if (pathParts.includes('models') || pathParts.includes('entities')) {
    return 'Data Layer';
  }
  
  if (pathParts.includes('middleware') || pathParts.includes('interceptors')) {
    return 'Middleware Layer';
  }
  
  if (pathParts.includes('utils') || pathParts.includes('helpers')) {
    return 'Utility Layer';
  }
  
  if (pathParts.includes('config') || pathParts.includes('settings')) {
    return 'Configuration Layer';
  }
  
  return 'General Layer';
}

/**
 * Парсит параметры функции
 */
function parseParameters(paramString: string): ParameterInfo[] {
  if (!paramString) return [];
  
  const params: ParameterInfo[] = [];
  const paramRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^=]+?)(?:\s*=\s*([^,]+))?\s*,?/g;
  let match;
  
  while ((match = paramRegex.exec(paramString)) !== null) {
    params.push({
      name: match[1].trim(),
      type: match[2]?.trim(),
      isOptional: match[1].includes('?'),
      defaultValue: match[3]?.trim()
    });
  }
  
  return params;
}

/**
 * Парсит TypeScript файл и извлекает структуру
 */
function parseTypeScriptFile(content: string, filePath: string): FileStructure {
  const structure: FileStructure = {
    path: filePath,
    functions: [],
    classes: [],
    interfaces: [],
    types: [],
    constants: [],
    imports: [],
    exports: [],
    dependencies: [],
    size: content.length,
    complexity: 0, // Placeholder, will be calculated later
    purpose: determineFilePurpose(content, filePath)
  };
  
  const lines = content.split('\n');
  let currentJSDoc = '';
  let inClass = false;
  let currentClass: ClassInfo | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;
    
    // Собираем JSDoc комментарии
    if (line.startsWith('/**')) {
      currentJSDoc = line;
      continue;
    }
    if (line.startsWith('*') && currentJSDoc) {
      currentJSDoc += '\n' + line;
      continue;
    }
    if (line.includes('*/') && currentJSDoc) {
      currentJSDoc += '\n' + line;
      continue;
    }
    
    // Парсим импорты
    if (line.startsWith('import ')) {
      const importMatch = line.match(/import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const [, moduleName, path] = importMatch;
        structure.imports.push({
          module: moduleName,
          imports: [path],
          isDefault: false,
          isNamespace: false,
          line: lineNumber
        });
      } else {
        const importMatch = line.match(/import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (importMatch) {
          const [, moduleName] = importMatch;
          structure.imports.push({
            module: moduleName,
            imports: [],
            isDefault: false,
            isNamespace: false,
            line: lineNumber
          });
        }
      }
      continue;
    }
    
    // Парсим экспорты
    if (line.startsWith('export ')) {
      const exportMatch = line.match(/export\s+(?:default\s+)?(?:async\s+)?(?:function|class|interface|type|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (exportMatch) {
        const [, name] = exportMatch;
        const isDefault = line.includes('export default');
        const isAsync = line.includes('async');
        const isFunction = line.includes('function');
        const isClass = line.includes('class');
        const isInterface = line.includes('interface');
        const isType = line.includes('type');
        const isConst = line.includes('const');

        if (isConst) {
          structure.exports.push({
            name,
            type: 'constant',
            isDefault,
            line: lineNumber
          });
        } else if (isFunction) {
          structure.exports.push({
            name,
            type: 'function',
            isDefault,
            line: lineNumber
          });
        } else if (isClass) {
          structure.exports.push({
            name,
            type: 'class',
            isDefault,
            line: lineNumber
          });
        } else if (isInterface) {
          structure.exports.push({
            name,
            type: 'interface',
            isDefault,
            line: lineNumber
          });
        } else if (isType) {
          structure.exports.push({
            name,
            type: 'type',
            isDefault,
            line: lineNumber
          });
        }
      }
      continue;
    }
    
    // Парсим функции - только объявления, не вызовы
    const functionDeclarationMatch = line.match(/^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*{?$/);
    if (functionDeclarationMatch && !inClass) {
      const [, name, params, returnType] = functionDeclarationMatch;
      const isExported = line.startsWith('export');
      const isAsync = line.includes('async');
      
      // Находим конец функции (приблизительно)
      let endLine = lineNumber;
      let braceCount = 0;
      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        braceCount += (currentLine.match(/{/g) || []).length;
        braceCount -= (currentLine.match(/}/g) || []).length;
        if (braceCount === 0 && j > i) {
          endLine = j + 1;
          break;
        }
      }
      
      structure.functions.push({
        name,
        type: isAsync ? 'async' : 'function',
        params: parseParameters(params),
        returnType: returnType?.trim(),
        description: parseJSDoc(currentJSDoc),
        fullJSDoc: extractFullJSDoc(currentJSDoc),
        location: filePath,
        line: lineNumber,
        isExported,
        isDefault: line.includes('export default'),
        complexity: calculateComplexity(content, lineNumber, endLine),
        linesOfCode: endLine - lineNumber,
        dependencies: analyzeFunctionDependencies(content, lineNumber, endLine),
        businessLogic: analyzeBusinessLogic(content, lineNumber, endLine),
        errorHandling: analyzeErrorHandling(content, lineNumber, endLine),
        dataFlow: analyzeDataFlow(content, lineNumber, endLine),
        performance: analyzePerformance(content, lineNumber, endLine)
      });
    }
    
    // Парсим стрелочные функции
    const arrowFunctionMatch = line.match(/^(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*([^{]+))?\s*=>/);
    if (arrowFunctionMatch && !inClass) {
      const [, name, params, returnType] = arrowFunctionMatch;
      const isExported = line.startsWith('export');
      const isAsync = line.includes('async');
      
      // Для стрелочных функций используем приблизительный endLine (до следующей пустой строки или конца блока)
      let endLine = lineNumber + 1;
      for (let j = i + 1; j < lines.length && j < i + 50; j++) { // ограничиваем поиск 50 строками
        const nextLine = lines[j].trim();
        if (nextLine === '' || (!nextLine.startsWith(' ') && !nextLine.startsWith('\t'))) {
          endLine = j;
          break;
        }
        endLine = j + 1;
      }
      
      structure.functions.push({
        name,
        type: isAsync ? 'async' : 'arrow',
        params: parseParameters(params),
        returnType: returnType?.trim(),
        description: parseJSDoc(currentJSDoc),
        location: filePath,
        line: lineNumber,
        isExported,
        isDefault: line.includes('export default'),
        linesOfCode: endLine - lineNumber,
        businessLogic: analyzeBusinessLogic(content, lineNumber, endLine),
        errorHandling: analyzeErrorHandling(content, lineNumber, endLine),
        dataFlow: analyzeDataFlow(content, lineNumber, endLine),
        performance: analyzePerformance(content, lineNumber, endLine)
      });
    }
    
    // Парсим классы
    const classMatch = line.match(/^(?:export\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)(?:\s+extends\s+([a-zA-Z_$][a-zA-Z0-9_$]*))?(?:\s+implements\s+([^{]+))?/);
    if (classMatch) {
      const [, name, extendsClass, implementsInterfaces] = classMatch;
      const isExported = line.startsWith('export');
      
      currentClass = {
        name,
        description: parseJSDoc(currentJSDoc),
        location: filePath,
        line: lineNumber,
        methods: [],
        properties: [],
        isExported,
        extends: extendsClass,
        implements: implementsInterfaces ? implementsInterfaces.split(',').map(i => i.trim()) : undefined,
        designPattern: detectDesignPattern(content, name)
      };
      
      structure.classes.push(currentClass);
      inClass = true;
      continue;
    }
    
    // Парсим методы класса
    if (inClass && currentClass) {
      const methodMatch = line.match(/^(?:async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?/);
      if (methodMatch) {
        const [, name, params, returnType] = methodMatch;
        const isAsync = line.includes('async');
        
        currentClass.methods.push({
          name,
          type: isAsync ? 'async' : 'method',
          params: parseParameters(params),
          returnType: returnType?.trim(),
          description: parseJSDoc(currentJSDoc),
          location: filePath,
          line: lineNumber,
          isExported: false,
          isDefault: false,
          businessLogic: analyzeBusinessLogic(content, lineNumber, endLine),
          errorHandling: analyzeErrorHandling(content, lineNumber, endLine),
          dataFlow: analyzeDataFlow(content, lineNumber, endLine),
          performance: analyzePerformance(content, lineNumber, endLine)
        });
      }
      
      // Парсим свойства класса
      const propertyMatch = line.match(/^(?:readonly\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\??\s*:\s*([^;]+);?/);
      if (propertyMatch) {
        const [, name, type] = propertyMatch;
        currentClass.properties.push({
          name,
          type: type?.trim(),
          description: parseJSDoc(currentJSDoc),
          isExported: false,
          isReadonly: line.includes('readonly'),
          isOptional: line.includes('?')
        });
      }
    }
    
    // Конец класса
    if (line === '}' && inClass) {
      inClass = false;
      currentClass = null;
    }
    
    // Парсим интерфейсы
    const interfaceMatch = line.match(/^(?:export\s+)?interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)(?:\s+extends\s+([^{]+))?/);
    if (interfaceMatch) {
      const [, name, extendsInterfaces] = interfaceMatch;
      const isExported = line.startsWith('export');
      
      structure.interfaces.push({
        name,
        description: parseJSDoc(currentJSDoc),
        location: filePath,
        line: lineNumber,
        properties: [],
        methods: [],
        isExported,
        extends: extendsInterfaces ? extendsInterfaces.split(',').map(i => i.trim()) : undefined
      });
    }
    
    // Парсим типы
    const typeMatch = line.match(/^(?:export\s+)?type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
    if (typeMatch) {
      const [, name] = typeMatch;
      const isExported = line.startsWith('export');
      
      structure.types.push({
        name,
        description: parseJSDoc(currentJSDoc),
        location: filePath,
        line: lineNumber,
        isExported,
        type: 'type'
      });
    }

    // Парсим константы
    const constantMatch = line.match(/^(?:export\s+)?const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+);?/);
    if (constantMatch) {
      const [, name, value] = constantMatch;
      const isExported = line.startsWith('export');
      const isDefault = line.includes('export default');

      structure.constants.push({
        name,
        type: 'const',
        description: parseJSDoc(currentJSDoc),
        isExported,
        isDefault,
        location: filePath,
        line: lineNumber,
        value: value?.trim()
      });
    }
    
    // Сбрасываем JSDoc после использования
    if (currentJSDoc && !line.startsWith('*') && !line.includes('*/')) {
      currentJSDoc = '';
    }
  }
  
  return structure;
}

/**
 * Парсит Python docstring
 */
function parsePythonDocstring(lines: string[], startLine: number): { docstring: string, endDocstringLine: number } | null {
  let docstring = '';
  let inDocstring = false;
  let endDocstringLine = startLine;

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('"""') || line.startsWith("'''")) {
      if (!inDocstring) {
        inDocstring = true;
        docstring += line.substring(3); // Remove opening quotes
      } else {
        docstring += ' ' + line.substring(0, line.length - 3); // Remove closing quotes
        endDocstringLine = i;
        return { docstring: docstring.trim(), endDocstringLine };
      }
    } else if (inDocstring) {
      docstring += ' ' + line;
    } else if (line !== '') { // If not in docstring and line is not empty, then no docstring
      break;
    }
    endDocstringLine = i;
  }
  return null;
}

/**
 * Парсит Python файл и извлекает структуру
 */
function parsePythonFile(content: string, filePath: string): FileStructure {
  const structure: FileStructure = {
    path: filePath,
    functions: [],
    classes: [],
    interfaces: [], // Python doesn't have interfaces in the same way as TS
    types: [],       // Python doesn't have types in the same way as TS
    constants: [],
    imports: [],
    exports: [],     // Python doesn't have explicit exports like TS
    dependencies: [],
    size: content.length,
    complexity: 0,
    purpose: determineFilePurpose(content, filePath)
  };

  const lines = content.split('\n');
  let inClass = false;
  let currentClass: ClassInfo | null = null;
  let decorators: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]; // Keep original line for indentation check
    const trimmedLine = line.trim();
    const lineNumber = i + 1;

    // Parse imports
    const importMatch = trimmedLine.match(/^(?:from\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s+)?import\s+(.*)/);
    if (importMatch) {
      const [, fromModule, importedItems] = importMatch;
      const imports = importedItems.split(',').map(item => item.trim());
      structure.imports.push({
        module: fromModule || '',
        imports: imports,
        isDefault: false, // Python doesn't have default imports like TS
        isNamespace: false, // Python doesn't have namespace imports like TS
        line: lineNumber,
        type: fromModule ? 'external' : 'internal' // Simplified categorization
      });
      continue;
    }

    // End of class (based on indentation) - check before processing other constructs
    if (inClass && trimmedLine !== '') {
      const classIndentation = lines[currentClass!.line - 1].match(/^\s*/)?.[0].length || 0;
      const currentLineIndentation = line.match(/^\s*/)?.[0].length || 0;
      
      // Check if this is a top-level definition that should end the class
      if (currentLineIndentation <= classIndentation && 
          (trimmedLine.startsWith('def ') || 
           trimmedLine.startsWith('class ') ||
           trimmedLine.startsWith('@') ||
           (trimmedLine.match(/^[A-Z_][A-Z0-9_]*\s*=/) && !trimmedLine.includes('self.')))) {
        inClass = false;
        currentClass = null;
      }
    }

    // Parse decorators
    if (trimmedLine.startsWith('@')) {
      decorators.push(trimmedLine.substring(1));
      continue;
    }

    // Parse functions
    const functionMatch = trimmedLine.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/);
    if (functionMatch && !inClass) {
      const [, name, params, returnType] = functionMatch;
      const parsedParams = params.split(',').filter(p => p.trim() !== '').map(p => {
        const paramParts = p.trim().match(/^(\w+)(?:\s*:\s*([^=]+))?(?:\s*=\s*(.*))?$/);
        if (paramParts) {
          const [, paramName, paramType, defaultValue] = paramParts;
          return { name: paramName, type: paramType?.trim(), isOptional: !!defaultValue, defaultValue: defaultValue?.trim() };
        }
        return { name: p.trim(), isOptional: false }; // Fallback
      });

      let description = '';
      let fullDocstring = '';
      let docstringEndLine = i;
      const docstringResult = parsePythonDocstring(lines, i + 1);
      if (docstringResult) {
        description = docstringResult.docstring.split('\n')[0].trim(); // First line as description
        fullDocstring = docstringResult.docstring;
        docstringEndLine = docstringResult.endDocstringLine;
      }

      // Find end of function based on indentation
      let endLine = docstringEndLine;
      const currentIndentation = line.match(/^\s*/)?.[0].length || 0;
      for (let j = docstringEndLine + 1; j < lines.length; j++) {
        const nextLine = lines[j];
        const nextTrimmedLine = nextLine.trim();
        if (nextTrimmedLine === '') { // Empty lines are part of the function body
          endLine = j + 1;
          continue;
        }
        const nextIndentation = nextLine.match(/^\s*/)?.[0].length || 0;
        if (nextIndentation <= currentIndentation) {
          endLine = j;
          break;
        }
        endLine = j + 1;
      }

      structure.functions.push({
        name,
        type: 'function',
        params: parsedParams,
        returnType: returnType?.trim(),
        description: description,
        fullJSDoc: fullDocstring,
        location: filePath,
        line: lineNumber,
        isExported: true, // All top-level functions are "exported" in a sense
        isDefault: false,
        decorators: decorators.length > 0 ? decorators : undefined,
        complexity: calculateComplexity(content, lineNumber, endLine),
        linesOfCode: endLine - lineNumber,
        businessLogic: analyzeBusinessLogic(content, lineNumber, endLine),
        errorHandling: analyzeErrorHandling(content, lineNumber, endLine),
        dataFlow: analyzeDataFlow(content, lineNumber, endLine),
        performance: analyzePerformance(content, lineNumber, endLine)
      });
      decorators = []; // Reset decorators after use
      i = endLine - 1; // Move index to the end of the parsed function
      continue;
    }

    // Parse classes
    const classMatch = trimmedLine.match(/^class\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\(([^)]*)\))?:/);
    if (classMatch) {
      const [, name, extendsClass] = classMatch;

      let description = '';
      let fullDocstring = '';
      let docstringEndLine = i;
      const docstringResult = parsePythonDocstring(lines, i + 1);
      if (docstringResult) {
        description = docstringResult.docstring.split('\n')[0].trim();
        fullDocstring = docstringResult.docstring;
        docstringEndLine = docstringResult.endDocstringLine;
      }

      currentClass = {
        name,
        description: description,
        fullJSDoc: fullDocstring,
        location: filePath,
        line: lineNumber,
        methods: [],
        properties: [],
        isExported: true, // All top-level classes are "exported" in a sense
        extends: extendsClass?.trim(),
        designPattern: detectDesignPattern(content, name)
      };
      structure.classes.push(currentClass);
      decorators = []; // Reset decorators after use
      inClass = true;
      i = docstringEndLine; // Move index to the end of the docstring
      continue;
    }

    // Parse methods within a class
    if (inClass && currentClass) {
      const methodMatch = trimmedLine.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/);
      if (methodMatch) {
        const [, name, params, returnType] = methodMatch;
        const parsedParams = params.split(',').filter(p => p.trim() !== '').map(p => {
          const paramParts = p.trim().match(/^(\w+)(?:\s*:\s*([^=]+))?(?:\s*=\s*(.*))?$/);
          if (paramParts) {
            const [, paramName, paramType, defaultValue] = paramParts;
            return { name: paramName, type: paramType?.trim(), isOptional: !!defaultValue, defaultValue: defaultValue?.trim() };
          }
          return { name: p.trim(), isOptional: false }; // Fallback
        });

        let description = '';
        let fullDocstring = '';
        let docstringEndLine = i;
        const docstringResult = parsePythonDocstring(lines, i + 1);
        if (docstringResult) {
          description = docstringResult.docstring.split('\n')[0].trim();
          fullDocstring = docstringResult.docstring;
          docstringEndLine = docstringResult.endDocstringLine;
        }

        // Find end of method based on indentation
        let endLine = docstringEndLine;
        const currentIndentation = line.match(/^\s*/)?.[0].length || 0;
        for (let j = docstringEndLine + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          const nextTrimmedLine = nextLine.trim();
          if (nextTrimmedLine === '') {
            endLine = j + 1;
            continue;
          }
          const nextIndentation = nextLine.match(/^\s*/)?.[0].length || 0;
          if (nextIndentation <= currentIndentation) {
            endLine = j;
            break;
          }
          endLine = j + 1;
        }

        currentClass.methods.push({
          name,
          type: 'method',
          params: parsedParams,
          returnType: returnType?.trim(),
          description: description,
          fullJSDoc: fullDocstring,
          location: filePath,
          line: lineNumber,
          isExported: false,
          isDefault: false,
          decorators: decorators.length > 0 ? decorators : undefined,
          complexity: calculateComplexity(content, lineNumber, endLine),
          linesOfCode: endLine - lineNumber,
          businessLogic: analyzeBusinessLogic(content, lineNumber, endLine),
          errorHandling: analyzeErrorHandling(content, lineNumber, endLine),
          dataFlow: analyzeDataFlow(content, lineNumber, endLine),
          performance: analyzePerformance(content, lineNumber, endLine)
        });
        decorators = []; // Reset decorators after use
        i = endLine - 1; // Move index to the end of the parsed method
        continue;
      }

      // Parse properties within a class (simplified - looking for assignments)
      const propertyMatch = trimmedLine.match(/^self\.(\w+)\s*=\s*(.*)/);
      if (propertyMatch) {
        const [, name, value] = propertyMatch;
        currentClass.properties.push({
          name,
          type: 'any',
          description: '',
          isExported: false,
          isReadonly: false,
          isOptional: false,
          defaultValue: value.trim()
        });
        continue;
      }
    }

    // Parse constants (top-level assignments)
    const constantMatch = trimmedLine.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)/);
    if (constantMatch && !inClass && !trimmedLine.startsWith('def ') && !trimmedLine.startsWith('class ')) {
      const [, name, value] = constantMatch;
      structure.constants.push({
        name,
        type: 'const',
        description: '',
        isExported: true,
        isDefault: false,
        location: filePath,
        line: lineNumber,
        value: value.trim()
      });
      continue;
    }

    // Reset decorators if they weren't used for any definition
    if (decorators.length > 0 && 
        !trimmedLine.startsWith('def ') && 
        !trimmedLine.startsWith('class ') &&
        !trimmedLine.startsWith('@') &&
        trimmedLine !== '') {
      decorators = [];
    }
  }

  return structure;
}

/**
 * Генерирует карту репозитория в markdown формате
 */
function generateMapContent(files: FileStructure[]): string {
  let map = `# Карта репозитория

*Сгенерировано автоматически*

> Поддерживаются TypeScript (.ts, .tsx) и Python (.py) файлы

## 🏗️ Архитектурный обзор

### 📊 Общая статистика

- **Всего файлов:** ${files.length}
- **Общий размер:** ${(files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1)} KB
- **Функций:** ${files.reduce((sum, f) => sum + f.functions.length, 0)} (экспортировано: ${files.reduce((sum, f) => sum + f.functions.filter(func => func.isExported).length, 0)})
- **Классов:** ${files.reduce((sum, f) => sum + f.classes.length, 0)} (экспортировано: ${files.reduce((sum, f) => sum + f.classes.filter(cls => cls.isExported).length, 0)})
- **Интерфейсов:** ${files.reduce((sum, f) => sum + f.interfaces.length, 0)} (экспортировано: ${files.reduce((sum, f) => sum + f.interfaces.filter(iface => iface.isExported).length, 0)})
- **Типов:** ${files.reduce((sum, f) => sum + f.types.length, 0)} (экспортировано: ${files.reduce((sum, f) => sum + f.types.filter(type => type.isExported).length, 0)})
- **Констант:** ${files.reduce((sum, f) => sum + f.constants.length, 0)} (экспортировано: ${files.reduce((sum, f) => sum + f.constants.filter(c => c.isExported).length, 0)})

### 🎯 Назначения файлов

`;
  
  // Группируем файлы по назначению
  const purposeGroups: { [purpose: string]: FileStructure[] } = {};
  for (const file of files) {
    const purpose = file.purpose || 'Общий код';
    if (!purposeGroups[purpose]) {
      purposeGroups[purpose] = [];
    }
    purposeGroups[purpose].push(file);
  }
  
  for (const [purpose, purposeFiles] of Object.entries(purposeGroups)) {
    map += `**${purpose}:** ${purposeFiles.length} файлов\n`;
  }
  
  map += `
### 🔗 Основные экспорты

`;

  // Группируем файлы по директориям
  const fileGroups: { [dir: string]: FileStructure[] } = {};
  
  for (const file of files) {
    const dir = path.dirname(file.path);
    if (!fileGroups[dir]) {
      fileGroups[dir] = [];
    }
    fileGroups[dir].push(file);
  }
  
  // Генерируем структуру по директориям
  for (const [dir, dirFiles] of Object.entries(fileGroups)) {
    const relativeDir = path.relative(process.cwd(), dir);
    map += `### 📂 ${relativeDir || 'Корень проекта'}\n\n`;
    
    for (const file of dirFiles) {
      const fileName = path.basename(file.path);
      map += `#### 📄 ${fileName}\n\n`;
      
      // Функции
      if (file.functions.length > 0) {
        map += `**Функции:**\n\n`;
        for (const func of file.functions) {
          const exportPrefix = func.isExported ? 'export ' : '';
          const asyncPrefix = func.type === 'async' ? 'async ' : '';
          const params = func.params.map(p => 
            `${p.name}${p.isOptional ? '?' : ''}${p.type ? `: ${p.type}` : ''}`
          ).join(', ');
          
          map += `- \`${exportPrefix}${asyncPrefix}${func.name}(${params})${func.returnType ? `: ${func.returnType}` : ''}\``;
          if (func.description) {
            map += ` - ${func.description}`;
          }
          map += ` (строка ${func.line})\n`;
        }
        map += '\n';
      }
      
      // Классы
      if (file.classes.length > 0) {
        map += `**Классы:**\n\n`;
        for (const cls of file.classes) {
          const exportPrefix = cls.isExported ? 'export ' : '';
          const extendsPart = cls.extends ? ` extends ${cls.extends}` : '';
          const implementsPart = cls.implements ? ` implements ${cls.implements.join(', ')}` : '';
          const designPattern = cls.designPattern ? ` (архитектурный паттерн: ${cls.designPattern})` : '';
          
          map += `- \`${exportPrefix}class ${cls.name}${extendsPart}${implementsPart}${designPattern}\``;
          if (cls.description) {
            map += ` - ${cls.description}`;
          }
          map += ` (строка ${cls.line})\n`;
          
          // Методы класса
          if (cls.methods.length > 0) {
            for (const method of cls.methods) {
              const asyncPrefix = method.type === 'async' ? 'async ' : '';
              const params = method.params.map(p => 
                `${p.name}${p.isOptional ? '?' : ''}${p.type ? `: ${p.type}` : ''}`
              ).join(', ');
              
              map += `  - \`${asyncPrefix}${method.name}(${params})${method.returnType ? `: ${method.returnType}` : ''}\``;
              if (method.description) {
                map += ` - ${method.description}`;
              }
              map += ` (строка ${method.line})\n`;
            }
          }
          
          // Свойства класса
          if (cls.properties.length > 0) {
            for (const prop of cls.properties) {
              const readonlyPrefix = prop.isReadonly ? 'readonly ' : '';
              const optionalSuffix = prop.isOptional ? '?' : '';
              
              map += `  - \`${readonlyPrefix}${prop.name}${optionalSuffix}${prop.type ? `: ${prop.type}` : ''}\``;
              if (prop.description) {
                map += ` - ${prop.description}`;
              }
              map += '\n';
            }
          }
          map += '\n';
        }
      }
      
      // Интерфейсы
      if (file.interfaces.length > 0) {
        map += `**Интерфейсы:**\n\n`;
        for (const iface of file.interfaces) {
          const exportPrefix = iface.isExported ? 'export ' : '';
          const extendsPart = iface.extends ? ` extends ${iface.extends.join(', ')}` : '';
          
          map += `- \`${exportPrefix}interface ${iface.name}${extendsPart}\``;
          if (iface.description) {
            map += ` - ${iface.description}`;
          }
          map += ` (строка ${iface.line})\n`;
          
          // Свойства интерфейса
          if (iface.properties.length > 0) {
            for (const prop of iface.properties) {
              const readonlyPrefix = prop.isReadonly ? 'readonly ' : '';
              const optionalSuffix = prop.isOptional ? '?' : '';
              
              map += `  - \`${readonlyPrefix}${prop.name}${optionalSuffix}${prop.type ? `: ${prop.type}` : ''}\``;
              if (prop.description) {
                map += ` - ${prop.description}`;
              }
              map += '\n';
            }
          }
          map += '\n';
        }
      }
      
      // Типы
      if (file.types.length > 0) {
        map += `**Типы:**\n\n`;
        for (const type of file.types) {
          const exportPrefix = type.isExported ? 'export ' : '';
          
          map += `- \`${exportPrefix}type ${type.name}\``;
          if (type.description) {
            map += ` - ${type.description}`;
          }
          map += ` (строка ${type.line})\n`;
        }
        map += '\n';
      }

      // Константы
      if (file.constants.length > 0) {
        map += `**Константы:**\n\n`;
        for (const constant of file.constants) {
          const exportPrefix = constant.isExported ? 'export ' : '';
          const isDefault = constant.isDefault ? 'export default ' : '';

          map += `- \`${exportPrefix}${isDefault}${constant.name}${constant.value ? ` = ${constant.value}` : ''}\``;
          if (constant.description) {
            map += ` - ${constant.description}`;
          }
          map += ` (строка ${constant.line})\n`;
        }
        map += '\n';
      }
    }
  }
  
  // Статистика
  const totalFunctions = files.reduce((sum, f) => sum + f.functions.length, 0);
  const totalClasses = files.reduce((sum, f) => sum + f.classes.length, 0);
  const totalInterfaces = files.reduce((sum, f) => sum + f.interfaces.length, 0);
  const totalTypes = files.reduce((sum, f) => sum + f.types.length, 0);
  const totalConstants = files.reduce((sum, f) => sum + f.constants.length, 0);
  const exportedFunctions = files.reduce((sum, f) => sum + f.functions.filter(func => func.isExported).length, 0);
  const exportedClasses = files.reduce((sum, f) => sum + f.classes.filter(cls => cls.isExported).length, 0);
  
  map += `## 📊 Статистика

- **Всего файлов:** ${files.length}
- **Функций:** ${totalFunctions} (экспортировано: ${exportedFunctions})
- **Классов:** ${totalClasses} (экспортировано: ${exportedClasses})
- **Интерфейсов:** ${totalInterfaces}
- **Типов:** ${totalTypes}
- **Констант:** ${totalConstants}

## 🔗 Основные экспорты

`;

  // Список основных экспортов
  for (const file of files) {
    const exports = [
      ...file.functions.filter(f => f.isExported).map(f => f.name),
      ...file.classes.filter(c => c.isExported).map(c => c.name),
      ...file.interfaces.filter(i => i.isExported).map(i => i.name),
      ...file.types.filter(t => t.isExported).map(t => t.name),
      ...file.constants.filter(c => c.isExported).map(c => c.name)
    ];
    
    if (exports.length > 0) {
      const fileName = path.basename(file.path);
      map += `### ${fileName}\n`;
      for (const exp of exports) {
        map += `- \`${exp}\`\n`;
      }
      map += '\n';
    }
  }
  
  map += `---
*Карта сгенерирована: ${new Date().toISOString()}*
`;
  
  return map;
}

/**
 * Основная функция генерации карты репозитория
 */
export async function generateRepositoryMap(options: {
  output?: string;
  force?: boolean;
  include?: string[];
  exclude?: string[];
}): Promise<void> {
  const { output, force = false, include = ['**/*.ts', '**/*.tsx', '**/*.py', '**/*.js', '**/*.jsx'], exclude = ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/__pycache__/**', '**/*.pyc', '**/build/**', '**/coverage/**'] } = options;
  
  console.log(chalk.blue('🗺️  Генерация карты репозитория...'));
  
  // Находим все поддерживаемые файлы
  const patterns = include.length > 0 ? include : ['**/*.ts', '**/*.tsx', '**/*.py', '**/*.js', '**/*.jsx'];
  const files: string[] = [];
  
  for (const pattern of patterns) {
    const matches = await glob(pattern, { ignore: exclude });
    files.push(...matches);
  }
  
  console.log(chalk.gray(`Найдено файлов: ${files.length}`));
  
  // Парсим каждый файл
  const fileStructures: FileStructure[] = [];
  
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      let structure: FileStructure;
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        structure = parseTypeScriptFile(content, file);
      } else if (file.endsWith('.py')) {
        structure = parsePythonFile(content, file);
      } else {
        console.warn(chalk.yellow(`⚠️  Неподдерживаемый тип файла для парсинга: ${file}`));
        continue;
      }
      fileStructures.push(structure);
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Не удалось прочитать файл ${file}: ${error}`));
    }
  }
  
  // Генерируем карту
  const mapContent = generateMapContent(fileStructures);
  
  // Определяем путь для сохранения
  const outputPath = output || path.join(process.cwd(), 'REPOSITORY_MAP.txt');
  
  // Проверяем, существует ли файл
  if (!force) {
    try {
      await fs.access(outputPath);
      console.log(chalk.yellow(`Файл ${outputPath} уже существует. Используйте --force для перезаписи.`));
      return;
    } catch {
      // Файл не существует, продолжаем
    }
  }
  
  // Сохраняем карту
  await fs.writeFile(outputPath, mapContent, 'utf-8');
  
  console.log(chalk.green('✅ Карта репозитория сгенерирована успешно!'));
  console.log(chalk.blue('📊 Результат:'));
  console.log(`   Файл: ${outputPath}`);
  console.log(`   Размер: ${(mapContent.length / 1024).toFixed(1)} KB`);
  console.log(`   Строк: ${mapContent.split('\n').length}`);
  
  // Показываем краткую статистику
  const totalFunctions = fileStructures.reduce((sum, f) => sum + f.functions.length, 0);
  const totalClasses = fileStructures.reduce((sum, f) => sum + f.classes.length, 0);
  const totalInterfaces = fileStructures.reduce((sum, f) => sum + f.interfaces.length, 0);
  const totalTypes = fileStructures.reduce((sum, f) => sum + f.types.length, 0);
  const totalConstants = fileStructures.reduce((sum, f) => sum + f.constants.length, 0);
  
  console.log(`   Функций: ${totalFunctions}`);
  console.log(`   Классов: ${totalClasses}`);
  console.log(`   Интерфейсов: ${totalInterfaces}`);
  console.log(`   Типов: ${totalTypes}`);
  console.log(`   Констант: ${totalConstants}`);
} 