import { AstAnalyzer } from './ast-analyzer';
import * as fs from 'fs';
import * as path from 'path';

describe('AstAnalyzer', () => {
  let analyzer: AstAnalyzer;
  const testDir = path.join(__dirname, '..', '..', 'test', 'fixtures', 'sample-app');

  beforeEach(() => {
    analyzer = new AstAnalyzer();
  });

  test('should analyze sample app and find exported functions', async () => {
    const functions = await analyzer.analyzeDirectory(testDir);
    
    expect(functions.length).toBeGreaterThan(0);
    
    const functionNames = functions.map(f => f.name);
    expect(functionNames).toContain('createWindow');
    expect(functionNames).toContain('loadUrl');
    expect(functionNames).toContain('showWindow');
    expect(functionNames).toContain('hideWindow');
    expect(functionNames).toContain('quitApp');
  });

  test('should extract parameters for createWindow', async () => {
    const functions = await analyzer.analyzeDirectory(testDir);
    const createWindow = functions.find(f => f.name === 'createWindow');
    
    expect(createWindow).toBeDefined();
    expect(createWindow!.parameters.length).toBe(1);
    expect(createWindow!.parameters[0].name).toBe('options');
  });

  test('should extract parameters for loadUrl', async () => {
    const functions = await analyzer.analyzeDirectory(testDir);
    const loadUrl = functions.find(f => f.name === 'loadUrl');
    
    expect(loadUrl).toBeDefined();
    expect(loadUrl!.parameters.length).toBe(2);
    expect(loadUrl!.parameters[0].name).toBe('url');
    expect(loadUrl!.parameters[1].name).toBe('window');
    expect(loadUrl!.parameters[1].optional).toBe(true);
  });

  test('should mark functions as exported', async () => {
    const functions = await analyzer.analyzeDirectory(testDir);
    
    for (const func of functions) {
      expect(func.isExported).toBe(true);
    }
  });

  test('should extract JSDoc descriptions', async () => {
    const functions = await analyzer.analyzeDirectory(testDir);
    const createWindow = functions.find(f => f.name === 'createWindow');
    
    expect(createWindow).toBeDefined();
    expect(createWindow!.description).toContain('Creates a new browser window');
  });
});
