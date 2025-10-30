// Declarações de tipos globais para resolver erros de módulos Node.js
declare module 'fs' {
  export * from 'fs';
}

declare module 'path' {
  export * from 'path';
}

declare module 'util' {
  export * from 'util';
}

declare module 'dns' {
  export * from 'dns';
}

declare module 'crypto' {
  export * from 'crypto';
}

// Declarações globais
declare var process: any;
declare var console: any;
declare var setTimeout: any;
declare var setInterval: any;
declare var clearTimeout: any;
declare var clearInterval: any;

declare namespace NodeJS {
  interface Process {
    env: any;
  }
}
