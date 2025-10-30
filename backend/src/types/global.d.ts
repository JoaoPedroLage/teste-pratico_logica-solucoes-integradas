// Declarações de tipos globais para resolver erros de módulos Node.js
declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: any): void;
  export function writeFileSync(path: string, data: any, options?: any): void;
  export function createReadStream(path: string, options?: any): any;
  export function readFileSync(path: string, encoding?: string): string;
  export function writeFile(path: string, data: any, callback: (err: any) => void): void;
  export function readFile(path: string, callback: (err: any, data: any) => void): void;
  export function unlinkSync(path: string): void;
  export function statSync(path: string): any;
  export function readdirSync(path: string): string[];
}

declare module 'path' {
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
  export function isAbsolute(path: string): boolean;
}

declare module 'util' {
  export function promisify(fn: any): any;
  export function inspect(object: any, options?: any): string;
  export function format(format: string, ...args: any[]): string;
}

declare module 'dns' {
  export function setServers(servers: string[]): void;
  export function lookup(hostname: string, callback: (err: any, address: string, family: number) => void): void;
  export function resolve(hostname: string, rrtype: string, callback: (err: any, records: any[]) => void): void;
}

declare module 'crypto' {
  export function randomBytes(size: number): Buffer;
  export function createHash(algorithm: string): any;
  export function createHmac(algorithm: string, key: string): any;
}

// Declarações globais
declare var process: {
  env: any;
  exit(code?: number): void;
  cwd(): string;
  nextTick(callback: () => void): void;
};

declare var console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
};

declare var setTimeout: (callback: () => void, delay: number) => any;
declare var setInterval: (callback: () => void, delay: number) => any;
declare var clearTimeout: (id: any) => void;
declare var clearInterval: (id: any) => void;

declare namespace NodeJS {
  interface Process {
    env: any;
    exit(code?: number): void;
    cwd(): string;
    nextTick(callback: () => void): void;
  }
  
  interface ErrnoException extends Error {
    errno?: number;
    code?: string;
    path?: string;
    syscall?: string;
  }
}
