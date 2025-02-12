/*
* Logger class to log messages to the terminal with different log levels.
* 
* Doesn't function yet, this is just a placeholder for future development.
*/

enum LogLevel {
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    ERROR = 'ERROR'
}

class Logger {
    private static getColor(level: LogLevel): string {
        switch (level) {
            case LogLevel.INFO:
                return '\x1b[34m'; // Blue
            case LogLevel.DEBUG:
                return '\x1b[33m'; // Yellow
            case LogLevel.ERROR:
                return '\x1b[31m'; // Red
            default:
                return '\x1b[0m'; // Reset
        }
    }

    private static formatMessage(level: LogLevel, message: string, ...variables: any[]): string {
        const color = Logger.getColor(level);
        const reset = '\x1b[0m';
        const formattedVariables = variables.map(variable => `${color}${variable}${reset}`);
        return `${color}[${level}]${reset} ${message} ${formattedVariables.join(' ')}`;
    }

    static info(ns: any, message: string, ...variables: any[]): void {
        ns.tprint(Logger.formatMessage(LogLevel.INFO, message, ...variables));
    }

    static debug(ns: any, message: string, DEBUG: boolean, ...variables: any[]): void {
        if (DEBUG) {
            ns.tprint(Logger.formatMessage(LogLevel.DEBUG, message, ...variables));
        }
    }

    static error(ns: any, message: string, ...variables: any[]): void {
        ns.tprint(Logger.formatMessage(LogLevel.ERROR, message, ...variables));
    }
}

export { Logger, LogLevel };