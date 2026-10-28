#!/usr/bin/env node
import { Command } from 'commander';
import * as path from 'path';

const program = new Command();

program
  .name('testcli')
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
  console.error(`Error loading target module from ${targetPath}:`, e);
  process.exit(1);
}

// Command: create-window
program
  .command('create-window')
  .description('
Creates a new browser window')
  .option('--options <options>', 'Window configuration options'.required())
  .action(async (options) => {
    try {
      const handler = targetModule.createWindow;
      if (!handler) {
        console.error(`Handler not found: createWindow`);
        process.exit(1);
      }
      
      const result = await handler(options: options.options);
      if (result !== undefined) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Command: load-url
program
  .command('load-url')
  .description('
Loads a URL in the main window')
  .option('--url <url>', 'The URL to load'.required())
  .option('--window <window>', 'Optional window instance')
  .action(async (options) => {
    try {
      const handler = targetModule.loadUrl;
      if (!handler) {
        console.error(`Handler not found: loadUrl`);
        process.exit(1);
      }
      
      const result = await handler(url: options.url, window: options.window);
      if (result !== undefined) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Command: show-window
program
  .command('show-window')
  .description('
Shows the main window')
  .action(async (options) => {
    try {
      const handler = targetModule.showWindow;
      if (!handler) {
        console.error(`Handler not found: showWindow`);
        process.exit(1);
      }
      
      const result = await handler();
      if (result !== undefined) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Command: hide-window
program
  .command('hide-window')
  .description('
Hides the main window')
  .action(async (options) => {
    try {
      const handler = targetModule.hideWindow;
      if (!handler) {
        console.error(`Handler not found: hideWindow`);
        process.exit(1);
      }
      
      const result = await handler();
      if (result !== undefined) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Command: quit-app
program
  .command('quit-app')
  .description('
Quits the application')
  .action(async (options) => {
    try {
      const handler = targetModule.quitApp;
      if (!handler) {
        console.error(`Handler not found: quitApp`);
        process.exit(1);
      }
      
      const result = await handler();
      if (result !== undefined) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
