// Polyfill globalThis.crypto for environments where it's not available
// Ensures `crypto.randomUUID()` is available as expected by some packages
if (typeof (globalThis as any).crypto === 'undefined') {
  // Use CommonJS require to avoid TS compile issues in some configs
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  (globalThis as any).crypto = require('crypto');
}
