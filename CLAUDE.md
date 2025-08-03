# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **neira-cli-mcp** - a CLI tool and MCP (Model Context Protocol) server for developing NEIRA applications. It's written in TypeScript and uses Yarn 4 as package manager.

## Development Commands

```bash
# Install dependencies
yarn install

# Build the project
yarn build

# Development with auto-reload
yarn dev

# Run tests
yarn test

# Watch tests
yarn test:watch

# Test coverage
yarn test:coverage
```

## Code Architecture

### Core Structure
- **Entry point**: `src/cli.ts` - Main CLI setup using Commander.js
- **Commands**: `src/commands/` - Individual CLI command implementations
- **Templates**: `templates/` - Project templates for scaffolding new apps
- **Build output**: `dist/` - Compiled JavaScript (single CJS bundle)

### Key Commands Implementation
- `create.ts` - Scaffolds new NEIRA applications using templates
- `dev.ts` - Runs MCP server with tools for app validation and file listing
- `export.ts` - Exports code using profiles with `code2prompt` integration
- `map.ts` - Generates repository structure maps
- `validate.ts` - Validates NEIRA app manifests
- `package.ts` - Builds apps into NPX packages

### MCP Server Architecture
The `dev` command runs a fully-featured MCP server using the official `@modelcontextprotocol/sdk`:
- **Tools**: `get_app_info`, `validate_app`, `list_project_files`
- **Resources**: `neira://project/info`
- **Transport**: stdio (standard for MCP servers)
- **Integration**: Works with Claude Desktop, Cursor, and other MCP clients

### Build System
- **Bundler**: tsup (generates single CJS file with shebang)
- **Target**: Node 18+
- **Output**: `dist/cli.cjs` (executable binary)
- **Templates**: Copied to `dist/templates/` during build

### Testing
- **Framework**: Vitest with Node environment
- **Coverage**: v8 provider with text/html/lcov output
- **Location**: `src/__tests__/` for unit tests

## NEIRA App Structure
This CLI works with NEIRA applications that have:
- `neira-app.json` - App manifest with name, version, description
- `src/` directory - Main application code
- Integration with `neira-shared-types` package

## Export System
The export command supports multiple profiles for different parts of the NEIRA ecosystem:
- Uses `code2prompt` for generating markdown exports
- Profiles include: general, mobile, community, enterprise, cli, cloud, docs, build, tests, all
- Automatically generates repository maps when exporting current directory