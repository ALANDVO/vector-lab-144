import { Project, SourceFile, FunctionDeclaration, MethodDeclaration, ParameterDeclaration, Node, Decorator, JSDoc, SyntaxKind } from 'ts-morph';
import { ExtractedFunction, ParameterInfo } from '../types';

export class AstAnalyzer {
  private project: Project;

  constructor() {
    this.project = new Project({
      compilerOptions: {
        target: 99,
        module: 99,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
      skipAddingFilesFromTsConfig: true,
    });
  }

  async analyzeDirectory(inputPath: string): Promise<ExtractedFunction[]> {
    this.project.addSourceFilesAtPaths(`${inputPath}/**/*.ts`);
    this.project.addSourceFilesAtPaths(`${inputPath}/**/*.js`);

    const functions: ExtractedFunction[] = [];

    for (const sourceFile of this.project.getSourceFiles()) {
      const extracted = this.extractFunctionsFromFile(sourceFile);
      functions.push(...extracted);
    }

    return functions;
  }

  async analyzeFile(filePath: string): Promise<ExtractedFunction[]> {
    const sourceFile = this.project.addSourceFileAtPath(filePath);
    return this.extractFunctionsFromFile(sourceFile);
  }

  private extractFunctionsFromFile(sourceFile: SourceFile): ExtractedFunction[] {
    const functions: ExtractedFunction[] = [];

    for (const func of sourceFile.getFunctions()) {
      if (this.shouldIncludeFunction(func)) {
        functions.push(this.extractFunctionInfo(func));
      }
    }

    for (const cls of sourceFile.getClasses()) {
      for (const method of cls.getMethods()) {
        if (this.shouldIncludeFunction(method)) {
          functions.push(this.extractFunctionInfo(method, cls.getName() || ''));
        }
      }
    }

    return functions;
  }

  private shouldIncludeFunction(func: FunctionDeclaration | MethodDeclaration): boolean {
    if (Node.isFunctionDeclaration(func) && func.isExported()) return true;
    if (Node.isMethodDeclaration(func) && func.hasModifier(SyntaxKind.PublicKeyword)) return true;
    return false;
  }

  private extractFunctionInfo(
    func: FunctionDeclaration | MethodDeclaration,
    className: string = ''
  ): ExtractedFunction {
    const name = className ? `${className}.${func.getName()}` : func.getName();
    const isAsync = func.isAsync();
    const isExported = Node.isFunctionDeclaration(func) ? func.isExported() : 
                        Node.isMethodDeclaration(func) ? func.hasModifier(SyntaxKind.PublicKeyword) : false;
    const returnType = func.getReturnType().getText();
    const decorators = this.extractDecorators(func);
    const jsdoc = this.extractJSDoc(func);

    const parameters: ParameterInfo[] = func.getParameters().map((param: ParameterDeclaration) => {
      const type = param.getType();
      return {
        name: param.getName(),
        type: type.getText(),
        optional: param.isOptional(),
        defaultValue: param.getInitializer()?.getText(),
        description: this.extractParamDescription(jsdoc, param.getName()),
      };
    });

    const description = jsdoc ? jsdoc.getDescription() ?? '' : '';
    return {
      name,
      description,
      parameters,
      returnType,
      isAsync,
      isExported,
      decorators,
      jsdoc: description,
    } as ExtractedFunction;
  }

  private extractDecorators(func: FunctionDeclaration | MethodDeclaration): string[] {
    if (Node.isMethodDeclaration(func)) {
      const decorators = func.getDecorators();
      return decorators.map((d: Decorator) => d.getName());
    }
    return [];
  }

  private extractJSDoc(func: FunctionDeclaration | MethodDeclaration): JSDoc | undefined {
    const jsdocs = func.getJsDocs();
    return jsdocs.length > 0 ? jsdocs[0] : undefined;
  }

  private extractParamDescription(jsdoc: JSDoc | undefined, paramName: string): string | undefined {
    if (!jsdoc) return undefined;
    const paramTags = jsdoc.getTags();
    for (const paramTag of paramTags) {
      if (paramTag.getTagName() === 'param') {
        const name = (paramTag as any).getName();
        if (name === paramName) {
          const fullText = paramTag.getFullText();
          const match = fullText.match(/@param\s+\w+\s*[-—]?\s*(.+)/);
          return match ? match[1].trim() : '';
        }
      }
    }
    return undefined;
  }
}
