const winston = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, json, errors  } = winston.format;

const logger = winston.createLogger({
    format: combine(errors({ stack: true }), timestamp(), json()),
    transports: [
        //new winston.transports.Console(),
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
    // exceptionHandlers: [
    //     new winston.transports.File({ filename: './data/logs/exception.log' }),
    // ],
    // rejectionHandlers: [
    //     new winston.transports.File({ filename: './data/logs/rejections.log' }),
    // ],
});



// logger.info('Hello from Winston logger!')
// logger.error(new Error('An error'));


module.exports = logger