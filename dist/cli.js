#!/usr/bin/env node

// src/cli.ts
import { Command } from "commander";
import chalk5 from "chalk";

// src/commands/create.ts
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
async function createApp(appName) {
  console.log(chalk.blue(`\u{1F680} \u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F "${appName}"...`));
  const appDir = path.join(process.cwd(), appName);
  if (fs.existsSync(appDir)) {
    throw new Error(`\u0414\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u044F "${appName}" \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442`);
  }
  await fs.ensureDir(appDir);
  await fs.ensureDir(path.join(appDir, "src"));
  await fs.ensureDir(path.join(appDir, "assets"));
  const manifest = {
    name: appName,
    version: "1.0.0",
    description: `\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 ${appName} \u0434\u043B\u044F NEIRA`,
    author: "\u0412\u0430\u0448\u0435 \u0438\u043C\u044F",
    main: "src/index.tsx",
    icon: "assets/icon.png",
    permissions: ["chat", "context"],
    category: "utility",
    tags: ["\u043D\u043E\u0432\u043E\u0435", "\u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435"]
  };
  await fs.writeJson(path.join(appDir, "neira-app.json"), manifest, { spaces: 2 });
  const packageJson = {
    name: appName,
    version: "1.0.0",
    description: `\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 ${appName} \u0434\u043B\u044F NEIRA`,
    main: "src/index.tsx",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0"
    },
    devDependencies: {
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "@vitejs/plugin-react": "^4.0.0",
      typescript: "^5.0.0",
      vite: "^4.4.0"
    }
  };
  await fs.writeJson(path.join(appDir, "package.json"), packageJson, { spaces: 2 });
  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ["src"],
    references: [{ path: "./tsconfig.node.json" }]
  };
  await fs.writeJson(path.join(appDir, "tsconfig.json"), tsConfig, { spaces: 2 });
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
`;
  await fs.writeFile(path.join(appDir, "vite.config.ts"), viteConfig);
  const mainComponent = `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="neira-app">
      <header className="app-header">
        <h1>\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 ${appName}!</h1>
        <p>\u042D\u0442\u043E \u0432\u0430\u0448\u0435 \u043D\u043E\u0432\u043E\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0434\u043B\u044F NEIRA \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B.</p>
      </header>
      <main className="app-main">
        <div className="card">
          <h2>\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0443</h2>
          <p>\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u0435 \u044D\u0442\u043E\u0442 \u0444\u0430\u0439\u043B \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F.</p>
          <button onClick={() => alert('\u041F\u0440\u0438\u0432\u0435\u0442 \u043E\u0442 NEIRA!')}>
            \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043C\u0435\u043D\u044F
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
`;
  await fs.writeFile(path.join(appDir, "src", "App.tsx"), mainComponent);
  const indexFile = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  await fs.writeFile(path.join(appDir, "src", "index.tsx"), indexFile);
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
  await fs.writeFile(path.join(appDir, "src", "App.css"), appCss);
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
  await fs.writeFile(path.join(appDir, "index.html"), indexHtml);
  const readme = `# ${appName}

\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0434\u043B\u044F NEIRA \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B.

## \u0420\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0430

1. \u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438:
\`\`\`bash
npm install
\`\`\`

2. \u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 dev-\u0441\u0435\u0440\u0432\u0435\u0440 NEIRA:
\`\`\`bash
neira-cli-mcp dev
\`\`\`

3. \u0412 \u0434\u0440\u0443\u0433\u043E\u043C \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0435 \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435:
\`\`\`bash
npm run dev
\`\`\`

4. \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 http://localhost:3000

## \u0421\u0431\u043E\u0440\u043A\u0430

\`\`\`bash
npm run build
\`\`\`

## \u0423\u043F\u0430\u043A\u043E\u0432\u043A\u0430 \u0434\u043B\u044F NEIRA

\`\`\`bash
neira-cli-mcp package
\`\`\`
`;
  await fs.writeFile(path.join(appDir, "README.md"), readme);
  console.log(chalk.green(`\u2705 \u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 "${appName}" \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0443\u0441\u043F\u0435\u0448\u043D\u043E!`));
  console.log(chalk.gray(""));
  console.log(chalk.blue("\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0435 \u0448\u0430\u0433\u0438:"));
  console.log(chalk.gray(`  cd ${appName}`));
  console.log(chalk.gray(`  npm install`));
  console.log(chalk.gray(`  neira-cli-mcp dev`));
  console.log(chalk.gray(""));
  console.log(chalk.gray("\u0417\u0430\u0442\u0435\u043C \u0432 \u0434\u0440\u0443\u0433\u043E\u043C \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0435:"));
  console.log(chalk.gray(`  npm run dev`));
}

// src/commands/dev.ts
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import chalk2 from "chalk";
import fs2 from "fs-extra";
import path2 from "path";
async function devServer(port = 4242) {
  console.log(chalk2.blue("\u{1F680} \u0417\u0430\u043F\u0443\u0441\u043A NEIRA MCP Server..."));
  const manifestPath = path2.join(process.cwd(), "neira-app.json");
  if (!fs2.existsSync(manifestPath)) {
    console.log(chalk2.yellow("\u26A0\uFE0F  neira-app.json \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0438"));
    console.log(chalk2.gray("   \u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E: neira-cli-mcp create <app-name>"));
  }
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    console.log(chalk2.gray(`${req.method} ${req.path}`));
    next();
  });
  app.get("/api/v1/health", (req, res) => {
    res.json({ status: "ok", server: "neira-mcp-dev", version: "0.2.0" });
  });
  app.get("/api/v1/context", (req, res) => {
    let manifest = null;
    try {
      if (fs2.existsSync(manifestPath)) {
        manifest = fs2.readJsonSync(manifestPath);
      }
    } catch (error) {
      console.error(chalk2.red("\u041E\u0448\u0438\u0431\u043A\u0430 \u0447\u0442\u0435\u043D\u0438\u044F neira-app.json:"), error);
    }
    res.json({
      manifest,
      messages: [
        {
          role: "system",
          content: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 NEIRA MCP Dev Server! \u042D\u0442\u043E \u0438\u043C\u0438\u0442\u0430\u0446\u0438\u044F \u0440\u0430\u043D\u0442\u0430\u0439\u043C\u0430 \u0434\u043B\u044F \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438."
        }
      ],
      settings: {
        model: "gpt-4",
        temperature: 0.7
      }
    });
  });
  app.post("/api/v1/chat/completions", (req, res) => {
    const { messages, stream = false } = req.body;
    if (stream) {
      res.json({
        message: "\u0414\u043B\u044F \u0441\u0442\u0440\u0438\u043C\u0438\u043D\u0433\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 WebSocket /api/v1/stream",
        websocket_url: `ws://localhost:${port}/api/v1/stream`
      });
    } else {
      res.json({
        id: "dev-response-" + Date.now(),
        object: "chat.completion",
        created: Math.floor(Date.now() / 1e3),
        model: "neira-dev-model",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: `\u042D\u0442\u043E \u0442\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u043E\u0442\u0432\u0435\u0442 \u043E\u0442 NEIRA MCP Dev Server. \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439: ${messages?.length || 0}`
          },
          finish_reason: "stop"
        }]
      });
    }
  });
  wss.on("connection", (ws) => {
    console.log(chalk2.green("\u{1F4E1} WebSocket \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E"));
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(chalk2.blue("\u{1F4E8} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435:"), message);
        const response = {
          id: "dev-stream-" + Date.now(),
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1e3),
          model: "neira-dev-model",
          choices: [{
            index: 0,
            delta: {
              role: "assistant",
              content: "\u042D\u0442\u043E \u0441\u0442\u0440\u0438\u043C\u0438\u043D\u0433\u043E\u0432\u044B\u0439 \u043E\u0442\u0432\u0435\u0442 \u043E\u0442 NEIRA MCP Dev Server! "
            },
            finish_reason: null
          }]
        };
        ws.send(JSON.stringify(response));
        setTimeout(() => {
          const finalResponse = {
            ...response,
            choices: [{
              index: 0,
              delta: {},
              finish_reason: "stop"
            }]
          };
          ws.send(JSON.stringify(finalResponse));
        }, 1e3);
      } catch (error) {
        console.error(chalk2.red("\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 WebSocket \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F:"), error);
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
    ws.on("close", () => {
      console.log(chalk2.yellow("\u{1F4E1} WebSocket \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0440\u044B\u0442\u043E"));
    });
  });
  server.listen(port, () => {
    console.log(chalk2.green(`\u2705 NEIRA MCP Server \u0437\u0430\u043F\u0443\u0449\u0435\u043D \u043D\u0430 http://localhost:${port}`));
    console.log(chalk2.gray("   API endpoints:"));
    console.log(chalk2.gray(`   \u2022 GET  /api/v1/health`));
    console.log(chalk2.gray(`   \u2022 GET  /api/v1/context`));
    console.log(chalk2.gray(`   \u2022 POST /api/v1/chat/completions`));
    console.log(chalk2.gray(`   \u2022 WS   /api/v1/stream`));
    console.log(chalk2.gray(""));
    console.log(chalk2.blue("\u{1F50D} \u041E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439 \u0432 neira-app.json..."));
    console.log(chalk2.gray("   \u041D\u0430\u0436\u043C\u0438\u0442\u0435 Ctrl+C \u0434\u043B\u044F \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438"));
    if (fs2.existsSync(manifestPath)) {
      fs2.watchFile(manifestPath, (curr, prev) => {
        console.log(chalk2.blue("\u{1F4DD} neira-app.json \u0438\u0437\u043C\u0435\u043D\u0435\u043D, \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044E..."));
      });
    }
  });
  process.on("SIGINT", () => {
    console.log(chalk2.yellow("\n\u{1F6D1} \u041E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430..."));
    server.close(() => {
      console.log(chalk2.green("\u2705 \u0421\u0435\u0440\u0432\u0435\u0440 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D"));
      process.exit(0);
    });
  });
}

// src/commands/validate.ts
import fs3 from "fs-extra";
import path3 from "path";
import chalk3 from "chalk";
async function validateApp() {
  console.log(chalk3.blue("\u{1F50D} \u0412\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u044F neira-app.json..."));
  const manifestPath = path3.join(process.cwd(), "neira-app.json");
  if (!fs3.existsSync(manifestPath)) {
    throw new Error("\u0424\u0430\u0439\u043B neira-app.json \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0438");
  }
  let manifest;
  try {
    manifest = await fs3.readJson(manifestPath);
  } catch (error) {
    throw new Error(`\u041E\u0448\u0438\u0431\u043A\u0430 \u0447\u0442\u0435\u043D\u0438\u044F neira-app.json: ${error}`);
  }
  const errors = [];
  const warnings = [];
  if (!manifest.name) {
    errors.push('\u041F\u043E\u043B\u0435 "name" \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E');
  } else if (typeof manifest.name !== "string") {
    errors.push('\u041F\u043E\u043B\u0435 "name" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u043E\u0439');
  } else if (manifest.name.length < 3) {
    errors.push('\u041F\u043E\u043B\u0435 "name" \u0434\u043E\u043B\u0436\u043D\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C 3 \u0441\u0438\u043C\u0432\u043E\u043B\u0430');
  }
  if (!manifest.version) {
    errors.push('\u041F\u043E\u043B\u0435 "version" \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E');
  } else if (typeof manifest.version !== "string") {
    errors.push('\u041F\u043E\u043B\u0435 "version" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u043E\u0439');
  } else if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push('\u041F\u043E\u043B\u0435 "version" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 X.Y.Z (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, 1.0.0)');
  }
  if (!manifest.description) {
    errors.push('\u041F\u043E\u043B\u0435 "description" \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E');
  } else if (typeof manifest.description !== "string") {
    errors.push('\u041F\u043E\u043B\u0435 "description" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u043E\u0439');
  } else if (manifest.description.length < 10) {
    warnings.push('\u041F\u043E\u043B\u0435 "description" \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 (\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u043C\u0438\u043D\u0438\u043C\u0443\u043C 10 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432)');
  }
  if (!manifest.author) {
    errors.push('\u041F\u043E\u043B\u0435 "author" \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E');
  } else if (typeof manifest.author !== "string") {
    errors.push('\u041F\u043E\u043B\u0435 "author" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u043E\u0439');
  }
  if (!manifest.main) {
    errors.push('\u041F\u043E\u043B\u0435 "main" \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E');
  } else if (typeof manifest.main !== "string") {
    errors.push('\u041F\u043E\u043B\u0435 "main" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u043E\u0439');
  } else {
    const mainPath = path3.join(process.cwd(), manifest.main);
    if (!fs3.existsSync(mainPath)) {
      errors.push(`\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0444\u0430\u0439\u043B "${manifest.main}" \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D`);
    }
  }
  if (manifest.icon) {
    if (typeof manifest.icon !== "string") {
      errors.push('\u041F\u043E\u043B\u0435 "icon" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u043E\u0439');
    } else {
      const iconPath = path3.join(process.cwd(), manifest.icon);
      if (!fs3.existsSync(iconPath)) {
        warnings.push(`\u0424\u0430\u0439\u043B \u0438\u043A\u043E\u043D\u043A\u0438 "${manifest.icon}" \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D`);
      }
    }
  } else {
    warnings.push("\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0438\u043A\u043E\u043D\u043A\u0443 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F");
  }
  if (manifest.permissions) {
    if (!Array.isArray(manifest.permissions)) {
      errors.push('\u041F\u043E\u043B\u0435 "permissions" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043C\u0430\u0441\u0441\u0438\u0432\u043E\u043C');
    } else {
      const validPermissions = ["chat", "context", "files", "network", "storage"];
      const invalidPermissions = manifest.permissions.filter((p) => !validPermissions.includes(p));
      if (invalidPermissions.length > 0) {
        errors.push(`\u041D\u0435\u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u044F: ${invalidPermissions.join(", ")}`);
      }
    }
  }
  if (manifest.category) {
    if (typeof manifest.category !== "string") {
      errors.push('\u041F\u043E\u043B\u0435 "category" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u043E\u0439');
    } else {
      const validCategories = ["utility", "productivity", "entertainment", "education", "business", "developer"];
      if (!validCategories.includes(manifest.category)) {
        warnings.push(`\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430\u044F \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F "${manifest.category}". \u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435: ${validCategories.join(", ")}`);
      }
    }
  }
  if (manifest.tags) {
    if (!Array.isArray(manifest.tags)) {
      errors.push('\u041F\u043E\u043B\u0435 "tags" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043C\u0430\u0441\u0441\u0438\u0432\u043E\u043C');
    } else if (manifest.tags.length > 10) {
      warnings.push("\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0442\u0435\u0433\u043E\u0432 (\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C 10)");
    }
  }
  if (errors.length > 0) {
    console.log(chalk3.red("\u274C \u041D\u0430\u0439\u0434\u0435\u043D\u044B \u043E\u0448\u0438\u0431\u043A\u0438:"));
    errors.forEach((error) => {
      console.log(chalk3.red(`  \u2022 ${error}`));
    });
  }
  if (warnings.length > 0) {
    console.log(chalk3.yellow("\u26A0\uFE0F  \u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F:"));
    warnings.forEach((warning) => {
      console.log(chalk3.yellow(`  \u2022 ${warning}`));
    });
  }
  if (errors.length === 0) {
    console.log(chalk3.green("\u2705 \u041C\u0430\u043D\u0438\u0444\u0435\u0441\u0442 \u0432\u0430\u043B\u0438\u0434\u0435\u043D!"));
    if (warnings.length === 0) {
      console.log(chalk3.green("   \u041D\u0438\u043A\u0430\u043A\u0438\u0445 \u043F\u0440\u043E\u0431\u043B\u0435\u043C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E."));
    }
  } else {
    throw new Error(`\u041D\u0430\u0439\u0434\u0435\u043D\u043E ${errors.length} \u043E\u0448\u0438\u0431\u043E\u043A \u0432 \u043C\u0430\u043D\u0438\u0444\u0435\u0441\u0442\u0435`);
  }
}

// src/commands/package.ts
import fs4 from "fs-extra";
import path4 from "path";
import chalk4 from "chalk";
async function packageApp() {
  console.log(chalk4.blue("\u{1F4E6} \u0423\u043F\u0430\u043A\u043E\u0432\u043A\u0430 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F..."));
  const manifestPath = path4.join(process.cwd(), "neira-app.json");
  if (!fs4.existsSync(manifestPath)) {
    throw new Error("\u0424\u0430\u0439\u043B neira-app.json \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0438");
  }
  let manifest;
  try {
    manifest = await fs4.readJson(manifestPath);
  } catch (error) {
    throw new Error(`\u041E\u0448\u0438\u0431\u043A\u0430 \u0447\u0442\u0435\u043D\u0438\u044F neira-app.json: ${error}`);
  }
  const appName = manifest.name;
  if (!appName) {
    throw new Error('\u041F\u043E\u043B\u0435 "name" \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E \u0432 neira-app.json');
  }
  const buildDir = path4.join(process.cwd(), "build");
  await fs4.ensureDir(buildDir);
  const distDir = path4.join(process.cwd(), "dist");
  if (!fs4.existsSync(distDir)) {
    console.log(chalk4.yellow("\u26A0\uFE0F  \u0414\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u044F dist \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430. \u0417\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u043C \u0441\u0431\u043E\u0440\u043A\u0443..."));
    throw new Error("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u043E\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u043E\u0439: npm run build");
  }
  console.log(chalk4.gray("\u{1F4C1} \u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0444\u0430\u0439\u043B\u043E\u0432..."));
  const tempDir = path4.join(buildDir, "temp");
  await fs4.ensureDir(tempDir);
  await fs4.copy(distDir, path4.join(tempDir, "dist"));
  await fs4.copy(manifestPath, path4.join(tempDir, "neira-app.json"));
  const packageJsonPath = path4.join(process.cwd(), "package.json");
  if (fs4.existsSync(packageJsonPath)) {
    await fs4.copy(packageJsonPath, path4.join(tempDir, "package.json"));
  }
  if (manifest.icon) {
    const iconPath = path4.join(process.cwd(), manifest.icon);
    if (fs4.existsSync(iconPath)) {
      await fs4.copy(iconPath, path4.join(tempDir, manifest.icon));
    }
  }
  const readmePath = path4.join(process.cwd(), "README.md");
  if (fs4.existsSync(readmePath)) {
    await fs4.copy(readmePath, path4.join(tempDir, "README.md"));
  }
  console.log(chalk4.gray("\u{1F5DC}\uFE0F  \u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0430\u0440\u0445\u0438\u0432\u0430..."));
  const packagePath = path4.join(buildDir, `${appName}.npx`);
  const packageMeta = {
    name: appName,
    version: manifest.version,
    description: manifest.description,
    author: manifest.author,
    created: (/* @__PURE__ */ new Date()).toISOString(),
    files: await getFileList(tempDir),
    checksum: "dev-build-" + Date.now()
    // В реальности - настоящая контрольная сумма
  };
  await fs4.writeJson(path4.join(tempDir, "package-meta.json"), packageMeta, { spaces: 2 });
  await fs4.writeJson(packagePath, {
    meta: packageMeta,
    note: "\u042D\u0442\u043E dev-\u0432\u0435\u0440\u0441\u0438\u044F .npx \u0444\u0430\u0439\u043B\u0430. \u0412 \u043F\u0440\u043E\u0434\u0430\u043A\u0448\u0435\u043D\u0435 \u0437\u0434\u0435\u0441\u044C \u0431\u044B\u043B \u0431\u044B \u0431\u0438\u043D\u0430\u0440\u043D\u044B\u0439 \u0430\u0440\u0445\u0438\u0432."
  }, { spaces: 2 });
  await fs4.remove(tempDir);
  console.log(chalk4.green(`\u2705 \u041F\u0430\u043A\u0435\u0442 \u0441\u043E\u0437\u0434\u0430\u043D: ${packagePath}`));
  console.log(chalk4.gray(""));
  console.log(chalk4.blue("\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0435 \u0448\u0430\u0433\u0438:"));
  console.log(chalk4.gray("1. \u041F\u0440\u043E\u0442\u0435\u0441\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u043F\u0430\u043A\u0435\u0442 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E"));
  console.log(chalk4.gray("2. \u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0440\u0435\u043B\u0438\u0437 \u0432 \u0432\u0430\u0448\u0435\u043C GitHub \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u0438"));
  console.log(chalk4.gray("3. \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 .npx \u0444\u0430\u0439\u043B \u0432 \u0440\u0435\u043B\u0438\u0437"));
  console.log(chalk4.gray("4. \u041E\u0442\u043F\u0440\u0430\u0432\u044C\u0442\u0435 PR \u0432 neira-apps"));
}
async function getFileList(dir) {
  const files = [];
  async function scan(currentDir, relativePath = "") {
    const items = await fs4.readdir(currentDir);
    for (const item of items) {
      const fullPath = path4.join(currentDir, item);
      const relativeItemPath = path4.join(relativePath, item);
      const stat = await fs4.stat(fullPath);
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

// src/cli.ts
var program = new Command();
program.name("neira-cli-mcp").description("CLI \u0438 MCP-\u0441\u0435\u0440\u0432\u0435\u0440 \u0434\u043B\u044F \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0439 NEIRA").version("0.2.0");
program.command("create <app-name>").description("\u0421\u043E\u0437\u0434\u0430\u0435\u0442 \u043D\u043E\u0432\u0443\u044E \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0443 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F NEIRA").action(async (appName) => {
  try {
    await createApp(appName);
  } catch (error) {
    console.error(chalk5.red("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F:"), error);
    process.exit(1);
  }
});
program.command("dev").description("\u0417\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 MCP-\u0441\u0435\u0440\u0432\u0435\u0440 \u0434\u043B\u044F \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438").option("-p, --port <port>", "\u041F\u043E\u0440\u0442 \u0434\u043B\u044F \u0441\u0435\u0440\u0432\u0435\u0440\u0430", "4242").action(async (options) => {
  try {
    await devServer(parseInt(options.port));
  } catch (error) {
    console.error(chalk5.red("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0437\u0430\u043F\u0443\u0441\u043A\u0435 dev-\u0441\u0435\u0440\u0432\u0435\u0440\u0430:"), error);
    process.exit(1);
  }
});
program.command("validate").description("\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442 neira-app.json \u043D\u0430 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u043E\u0441\u0442\u044C").action(async () => {
  try {
    await validateApp();
  } catch (error) {
    console.error(chalk5.red("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0432\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u0438:"), error);
    process.exit(1);
  }
});
program.command("package").description("\u0421\u043E\u0431\u0438\u0440\u0430\u0435\u0442 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432 .npx \u043F\u0430\u043A\u0435\u0442").action(async () => {
  try {
    await packageApp();
  } catch (error) {
    console.error(chalk5.red("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0435:"), error);
    process.exit(1);
  }
});
program.parse();
