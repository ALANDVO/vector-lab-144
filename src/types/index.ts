export interface CliOption {
  name: string;
  short?: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: string;
}

export interface CliArgument {
  name: string;
  description: string;
  required: boolean;
  variadic: boolean;
}

export interface CliCommand {
  name: string;
  description: string;
  options: CliOption[];
  arguments: CliArgument[];
  handler: string;
  subcommands?: CliCommand[];
}

export interface ExtractedFunction {
  name: string;
  description: string;
  parameters: ParameterInfo[];
  returnType: string;
  isAsync: boolean;
  isExported: boolean;
  decorators: string[];
  jsdoc?: string;
}

export interface ParameterInfo {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
  description?: string;
}

export interface GenerationOptions {
  inputPath: string;
  outputPath: string;
  template?: string;
  entryPoint?: string;
  includePrivate?: boolean;
  generateTypes?: boolean;
}
