import { AstAnalyzer } from './analyzer/ast-analyzer';
import { CliGenerator } from './generator/cli-generator';
import { GenerationOptions } from './types';
import * as fs from 'fs';
import * as path from 'path';

export async function generateCli(options: GenerationOptions): Promise<void> {
  console.log(`Analyzing source code at: ${options.inputPath}`);
  
  const analyzer = new AstAnalyzer();
  const functions = await analyzer.analyzeDirectory(options.inputPath);
  
  console.log(`Found ${functions.length} exported functions`);
  
  for (const func of functions) {
    console.log(`  - ${func.name} (${func.parameters.length} params)`);
  }

  const generator = new CliGenerator(functions, options);
  generator.writeOutput();
  
  console.log(`CLI generated at: ${options.outputPath}`);
  console.log(`\nTo use the generated CLI:`);
  console.log(`  cd ${options.outputPath}`);
  console.log(`  npm install`);
  console.log(`  npm run build`);
  console.log(`  export CLI_TARGET_PATH=/path/to/target/app`);
  console.log(`  ./dist/index.js --help`);
}

export async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
    console.log(`
CLI-Anything: Core CLI Generator

Usage:
  vector-lab-144 generate <input-path> <output-path> [options]

Commands:
  generate    Generate CLI from source code

Options:
  --entry-point, -e   Entry point name (default: "cli")
  --include-private   Include private functions
  --help, -h          Show this help

Example:
  vector-lab-144 generate ./my-electron-app ./generated-cli
  vector-lab-144 generate ./src ./out --entry-point myapp
`);
    process.exit(0);
  }

  const command = args[0];
  
  if (command === 'generate') {
    const inputPath = args[1];
    const outputPath = args[2];
    const entryPoint = args.includes('-e') ? args[args.indexOf('-e') + 1] : 
                       args.includes('--entry-point') ? args[args.indexOf('--entry-point') + 1] : 'cli';
    const includePrivate = args.includes('--include-private');

    if (!inputPath || !outputPath) {
      console.error('Error: input-path and output-path are required');
      process.exit(1);
    }

    const absInputPath = path.resolve(inputPath);
    const absOutputPath = path.resolve(outputPath);

    if (!fs.existsSync(absInputPath)) {
      console.error(`Error: Input path does not exist: ${absInputPath}`);
      process.exit(1);
    }

    await generateCli({
      inputPath: absInputPath,
      outputPath: absOutputPath,
      entryPoint,
      includePrivate,
      generateTypes: true,
    });
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

main().catch(console.error);
