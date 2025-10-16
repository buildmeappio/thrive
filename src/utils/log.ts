const debug = (...message: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...message);
  }
};

const info = (...message: unknown[]) => {
  console.log(...message);
};

const error = (...message: unknown[]) => {
  console.error(...message);
};

const log = { debug, info, error };

export default log;
