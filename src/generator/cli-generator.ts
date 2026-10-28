import { ExtractedFunction, CliCommand, CliOption, CliArgument, GenerationOptions } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class CliGenerator {
  private functions: ExtractedFunction[];
  private options: GenerationOptions;

  constructor(functions: ExtractedFunction[], options: GenerationOptions) {
    this.functions = functions;
    this.options = options;
  }

  generate(): { cliCode: string; readme: string; packageJson: string; typesCode: string } {
    const commands = this.buildCommands();
    const cliCode = this.generateCliCode(commands);
    const readme = this.generateReadme(commands);
    const packageJson = this.generatePackageJson();
    const typesCode = this.generateTypes(commands);

    return { cliCode, readme, packageJson, typesCode };
  }

  writeOutput(): void {
    const { cliCode, readme, packageJson, typesCode } = this.generate();
    const tsconfig = this.generateTsConfig();
    const outputDir = this.options.outputPath;

    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'src'), { recursive: true });

    fs.writeFileSync(path.join(outputDir, 'src', 'index.ts'), cliCode);
    fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
    fs.writeFileSync(path.join(outputDir, 'package.json'), packageJson);
    fs.writeFileSync(path.join(outputDir, 'src', 'types.ts'), typesCode);
    fs.writeFileSync(path.join(outputDir, 'tsconfig.json'), tsconfig);
  }

  private buildCommands(): CliCommand[] {
    const commands: CliCommand[] = [];

    for (const func of this.functions) {
      const command = this.functionToCommand(func);
      commands.push(command);
    }

    return commands;
  }

  private functionToCommand(func: ExtractedFunction): CliCommand {
    const options: CliOption[] = func.parameters.map(param => ({
      name: param.name,
      description: param.description || `Parameter ${param.name} of type ${param.type}`,
      type: this.mapType(param.type),
      required: !param.optional,
      defaultValue: param.defaultValue,
    }));

    const args: CliArgument[] = [];

    return {
      name: this.camelToKebab(func.name),
      description: func.description || `Execute ${func.name}`,
      options,
      arguments: args,
      handler: func.name,
    };
  }

  private mapType(tsType: string): 'string' | 'number' | 'boolean' | 'array' {
    if (tsType.includes('string')) return 'string';
    if (tsType.includes('number') || tsType.includes('int') || tsType.includes('float')) return 'number';
    if (tsType.includes('boolean')) return 'boolean';
    if (tsType.includes('[]') || tsType.includes('Array')) return 'array';
    return 'string';
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private generateCliCode(commands: CliCommand[]): string {
    const entryPoint = this.options.entryPoint || 'cli';
    const commandHandlers = commands.map(cmd => this.generateCommandHandler(cmd)).join('\n\n');

    return `#!/usr/bin/env node
import { Command } from 'commander';
import * as path from 'path';

const program = new Command();

program
  .name('${entryPoint}')
  .description('Generated CLI from source code analysis')
  .version('1.0.0');

// Target module path - set via environment variable
const targetPath = process.env.CLI_TARGET_PATH;
if (!targetPath) {
  console.error('Error: CLI_TARGET_PATH environment variable not set');
  console.error('Set it to the path of the target application module');
  process.exit(1);
}

// Dynamic import of target module
let targetModule: any;
try {
  targetModule = require(path.resolve(targetPath));
} catch (e) {
  console.error(\`Error loading target module from \${targetPath}:\`, e);
  process.exit(1);
}

${commandHandlers}

program.parse(process.argv);
`;
  }

  private generateCommandHandler(cmd: CliCommand): string {
    const optionsSetup = cmd.options.map(opt => {
      const shortFlag = opt.short ? `, -${opt.short}` : '';
      const required = opt.required ? 'required' : '';
      const defaultVal = opt.defaultValue ? `.default(${opt.defaultValue})` : '';
      const desc = opt.description.replace(/'/g, "\\'").replace(/\n/g, '\\n');
      const method = opt.required ? 'requiredOption' : 'option';
      return `  .${method}('--${opt.name} <${opt.name}>', '${desc}')${defaultVal}`;
    }).join('\n');

    const paramObject = cmd.options.map(o => `options.${o.name}`).join(', ');

    return `// Command: ${cmd.name}
const cmd_${cmd.name.replace(/-/g, '_')} = program
  .command('${cmd.name}')${optionsSetup ? '\n' + optionsSetup : ''}
  .description('${cmd.description.replace(/'/g, "\\'").replace(/\n/g, '\\n')}')
  .action(async (options) => {
    try {
      const handler = targetModule.${cmd.handler};
      if (!handler) {
        console.error(\`Handler not found: ${cmd.handler}\`);
        process.exit(1);
      }
      
      const result = await handler(${paramObject});
      if (result !== undefined) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });`;
  }

  private generateReadme(commands: CliCommand[]): string {
    const entryPoint = this.options.entryPoint || 'cli';
    const commandList = commands.map(cmd => {
      const opts = cmd.options.map(o => `  --${o.name} (${o.type})${o.required ? ' [required]' : ''}: ${o.description}`).join('\n');
      const args = cmd.arguments.map(a => `  <${a.name}>: ${a.description}`).join('\n');
      return `### ${cmd.name}\n${cmd.description}\n\n${opts ? 'Options:\n' + opts + '\n' : ''}${args ? 'Arguments:\n' + args + '\n' : ''}`;
    }).join('\n\n');

    return `# ${entryPoint} CLI

Generated CLI from source code analysis.

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`

## Usage

\`\`\`bash
# Set the target module path
export CLI_TARGET_PATH=/path/to/your/app

# Run commands
${entryPoint} <command> [options]
\`\`\`

## Commands

${commandList}

## Development

\`\`\`bash
npm run dev -- <command> [options]
\`\`\`
`;
  }

  private generatePackageJson(): string {
    const entryPoint = this.options.entryPoint || 'cli';
    return JSON.stringify({
      name: entryPoint,
      version: '1.0.0',
      description: 'Generated CLI from source code analysis',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      bin: {
        [entryPoint]: './dist/index.js',
      },
      scripts: {
        build: 'tsc',
        start: 'node dist/index.js',
        dev: 'ts-node src/index.ts',
      },
      dependencies: {
        commander: '^12.0.0',
      },
      devDependencies: {
        '@types/node': '^20.11.0',
        typescript: '^5.4.0',
        'ts-node': '^10.9.0',
      },
      engines: {
        node: '>=18.0.0',
      },
    }, null, 2);
  }

  private generateTypes(commands: CliCommand[]): string {
    const types = commands.map(cmd => {
      const optionsType = cmd.options.map(o => 
        `  ${o.name}${o.required ? '' : '?'}: ${o.type === 'array' ? 'string[]' : o.type};`
      ).join('\n');
      
      return `export interface ${this.pascalCase(cmd.name)}Options {
${optionsType}
}`;
    }).join('\n\n');

    return `// Generated types for CLI commands
${types}

export interface CliContext {
  targetPath: string;
  targetModule: any;
}
`;
  }

  private generateTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        lib: ['ES2022'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: false,
        allowSyntheticDefaultImports: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    }, null, 2);
  }

  private pascalCase(str: string): string {
    return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  }
}
