# Product development plan

Each round completes one feature or repair. Future items are planned, not implemented claims.

## Current round

cli-generation-core

## Roadmap

### cli-generation-core — Core CLI Generation from Source Code

Status: done

Acceptance:
- Parse target application source code (TypeScript/JavaScript/Electron)
- Extract commands, arguments, and types from source
- Generate executable CLI with proper argument parsing
- Generated CLI executes target application functions correctly

Implementation: `Set up project structure with TypeScript CLI generator`, `Implemented AST parser using TypeScript Compiler API`, `Created CLI template engine using Commander.js`, `Built Electron app detector and IPC bridge generator`, `Created end-to-end test with sample Electron app`

Tests: `src/analyzer/ast-analyzer.test.ts (5 tests passing)`

### ast-analysis — AST-based Code Analysis

Status: planned

Acceptance:
- Parse TypeScript/JavaScript files with Babel/TypeScript compiler API
- Identify exported functions, classes, and decorators
- Extract parameter types, defaults, and documentation

### electron-integration — Electron App Integration

Status: planned

Acceptance:
- Detect Electron main/renderer process entry points
- Generate IPC bridge for main↔renderer communication
- Support both CLI invocation and programmatic API

### cli-template-engine — CLI Template Engine

Status: planned

Acceptance:
- Generate Commander.js / Yargs based CLI structure
- Support subcommands, options, arguments, and validation
- Generate TypeScript definitions for type-safe invocation

