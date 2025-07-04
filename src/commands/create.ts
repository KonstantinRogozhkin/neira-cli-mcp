import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function createApp(appName: string) {
  console.log(chalk.blue(`🚀 Создание приложения "${appName}"...`));

  const appDir = path.join(process.cwd(), appName);

  // Проверяем, что директория не существует
  if (fs.existsSync(appDir)) {
    throw new Error(`Директория "${appName}" уже существует`);
  }

  // Создаем структуру директорий
  await fs.ensureDir(appDir);
  await fs.ensureDir(path.join(appDir, 'src'));
  await fs.ensureDir(path.join(appDir, 'assets'));

  // Создаем neira-app.json
  const manifest = {
    name: appName,
    version: '1.0.0',
    description: `Приложение ${appName} для NEIRA`,
    author: 'Ваше имя',
    main: 'src/index.tsx',
    icon: 'assets/icon.png',
    permissions: ['chat', 'context'],
    category: 'utility',
    tags: ['новое', 'приложение']
  };

  await fs.writeJson(path.join(appDir, 'neira-app.json'), manifest, { spaces: 2 });

  // Создаем package.json
  const packageJson = {
    name: appName,
    version: '1.0.0',
    description: `Приложение ${appName} для NEIRA`,
    main: 'src/index.tsx',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0'
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@vitejs/plugin-react': '^4.0.0',
      typescript: '^5.0.0',
      vite: '^4.4.0'
    }
  };

  await fs.writeJson(path.join(appDir, 'package.json'), packageJson, { spaces: 2 });

  // Создаем tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }]
  };

  await fs.writeJson(path.join(appDir, 'tsconfig.json'), tsConfig, { spaces: 2 });

  // Создаем vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
`;

  await fs.writeFile(path.join(appDir, 'vite.config.ts'), viteConfig);

  // Создаем основной компонент
  const mainComponent = `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="neira-app">
      <header className="app-header">
        <h1>Добро пожаловать в ${appName}!</h1>
        <p>Это ваше новое приложение для NEIRA платформы.</p>
      </header>
      <main className="app-main">
        <div className="card">
          <h2>Начните разработку</h2>
          <p>Измените этот файл и сохраните, чтобы увидеть изменения.</p>
          <button onClick={() => alert('Привет от NEIRA!')}>
            Нажмите меня
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
`;

  await fs.writeFile(path.join(appDir, 'src', 'App.tsx'), mainComponent);

  // Создаем index.tsx
  const indexFile = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  await fs.writeFile(path.join(appDir, 'src', 'index.tsx'), indexFile);

  // Создаем базовые стили
  const appCss = `.neira-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.app-header {
  margin-bottom: 2rem;
}

.app-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.app-main {
  display: flex;
  justify-content: center;
}

.card {
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  max-width: 400px;
}

.card h2 {
  color: #555;
  margin-bottom: 1rem;
}

.card button {
  background: #007acc;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.card button:hover {
  background: #005999;
}
`;

  await fs.writeFile(path.join(appDir, 'src', 'App.css'), appCss);

  // Создаем index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/assets/icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
`;

  await fs.writeFile(path.join(appDir, 'index.html'), indexHtml);

  // Создаем README.md
  const readme = `# ${appName}

Приложение для NEIRA платформы.

## Разработка

1. Установите зависимости:
\`\`\`bash
npm install
\`\`\`

2. Запустите dev-сервер NEIRA:
\`\`\`bash
neira-cli-mcp dev
\`\`\`

3. В другом терминале запустите приложение:
\`\`\`bash
npm run dev
\`\`\`

4. Откройте http://localhost:3000

## Сборка

\`\`\`bash
npm run build
\`\`\`

## Упаковка для NEIRA

\`\`\`bash
neira-cli-mcp package
\`\`\`
`;

  await fs.writeFile(path.join(appDir, 'README.md'), readme);

  console.log(chalk.green(`✅ Приложение "${appName}" создано успешно!`));
  console.log(chalk.gray(''));
  console.log(chalk.blue('Следующие шаги:'));
  console.log(chalk.gray(`  cd ${appName}`));
  console.log(chalk.gray(`  npm install`));
  console.log(chalk.gray(`  neira-cli-mcp dev`));
  console.log(chalk.gray(''));
  console.log(chalk.gray('Затем в другом терминале:'));
  console.log(chalk.gray(`  npm run dev`));
} 