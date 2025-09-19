const isProd = process.env.NODE_ENV === "production";

function log(...args: unknown[]) {
  if (!isProd) {
    
    console.log(...args);
  }
}

function info(...args: unknown[]) {
  if (!isProd) {
    
    console.info(...args);
  }
}

function warn(...args: unknown[]) {
  if (!isProd) {
    
    console.warn(...args);
  }
}

function error(...args: unknown[]) {
  // Always log errors in dev; in prod, we could wire to external monitoring
  
  console.error(...args);
}

export const logger = { log, info, warn, error };
