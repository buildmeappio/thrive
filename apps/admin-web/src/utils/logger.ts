const log = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const error = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  } else {
    console.log(`Error at ${new Date().toISOString()}:`, ...args);
  }
};

const warn = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(...args);
  }
};

const info = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(...args);
  }
};

export default {
  log,
  error,
  warn,
  info,
};
