require('winston-daily-rotate-file');
const { createLogger, format, transports } = require("winston");

const { combine, timestamp, colorize, splat, simple } = format;

// - Write to all logs with level `info` and below to `combined.log`
const combinedTransport = new (transports.DailyRotateFile)({
  filename: 'application-debug-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d'
});

// - Write all logs error (and below) to `error.log`.
const errorTransport = new (transports.DailyRotateFile)({
  level: 'error',
  filename: 'application-error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d'
});

const logger = createLogger({
  level: "debug",
  format: combine(timestamp(), splat(), simple()),
  defaultMeta: { service: "user-service" },
  transports: [
    combinedTransport,
    errorTransport
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(splat(), simple())
    })
  );
}

module.exports = logger;
