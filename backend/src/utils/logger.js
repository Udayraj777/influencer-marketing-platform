import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, process.env.LOG_FILE || 'app.log');

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Format timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Write to file
const writeToFile = (level, message, meta = {}) => {
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    meta: Object.keys(meta).length > 0 ? meta : undefined
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  
  try {
    fs.appendFileSync(logFile, logLine);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

// Console output with colors
const writeToConsole = (level, message, meta = {}) => {
  const timestamp = getTimestamp();
  let colorCode = colors.reset;
  
  switch (level) {
    case 'ERROR':
      colorCode = colors.red;
      break;
    case 'WARN':
      colorCode = colors.yellow;
      break;
    case 'INFO':
      colorCode = colors.green;
      break;
    case 'DEBUG':
      colorCode = colors.blue;
      break;
  }

  const prefix = `${colorCode}[${timestamp}] ${level}:${colors.reset}`;
  
  if (Object.keys(meta).length > 0) {
    console.log(prefix, message, meta);
  } else {
    console.log(prefix, message);
  }
};

// Log function
const log = (level, message, meta = {}) => {
  const levelValue = LOG_LEVELS[level];
  
  if (levelValue <= currentLogLevel) {
    writeToConsole(level, message, meta);
    writeToFile(level, message, meta);
  }
};

// Logger object with different methods
export const logger = {
  error: (message, meta = {}) => {
    // Handle Error objects
    if (message instanceof Error) {
      meta.stack = message.stack;
      message = message.message;
    }
    log('ERROR', message, meta);
  },
  
  warn: (message, meta = {}) => {
    log('WARN', message, meta);
  },
  
  info: (message, meta = {}) => {
    log('INFO', message, meta);
  },
  
  debug: (message, meta = {}) => {
    log('DEBUG', message, meta);
  },
  
  // Request logging helper
  request: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };
      
      if (res.statusCode >= 400) {
        logger.warn(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
      } else {
        logger.info(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
      }
    });
    
    if (next) next();
  }
};