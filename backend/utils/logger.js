const winston = require('winston');
require('winston-daily-rotate-file');
const moment = require('moment-timezone');
const { combine, timestamp, json, errors, printf } = winston.format;

// Define a custom timestamp format
const venezuelanTimestamp = () => moment().tz('America/Caracas').format('DD-MM-YYYY HH:mm:ss');

// Create a custom format combining the timestamp with other formats
const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
    format: combine(
        errors({ stack: true }),
        timestamp({ format: venezuelanTimestamp }),
        customFormat,
        json()
    ),
    transports: [
        new winston.transports.File({
            filename: './data/logs/backend-combined.log',
        }),
        new winston.transports.File({
            level: 'error',
            filename: './data/logs/backend-combined-error.log',
        }),
        new winston.transports.DailyRotateFile({
            filename: './data/logs/backend-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '1m',
        }),
    ],
    // NOTE: When you enable this options, uncaught errors are throw to those files, and not to the console
    exceptionHandlers: [
        new winston.transports.File({ filename: './data/logs/exception.log' }),
    ],
    // rejectionHandlers: [
    //     new winston.transports.File({ filename: './data/logs/rejections.log' }),
    // ],
});

module.exports = logger;
