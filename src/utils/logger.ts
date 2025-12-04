const log = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

const error = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.error(...args);
  }
};

const warn = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.warn(...args);
  }
};

const info = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.info(...args);
  }
};

// Named exports for convenience
export { log, error, warn, info };

// Default export for backward compatibility
const logger = {
  log,
  error,
  warn,
  info,
};

export default logger;
