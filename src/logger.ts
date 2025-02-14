import { TerminalFormats as colors, colorize } from './helperLib';

/*
* Logger class to log messages to the terminal with different log levels.
*/

type LogLevel = 'INFO' | 'DEBUG' | 'ERROR';

const logLevelColors: { [key in LogLevel]: string } = {
    INFO: colors.Info,
    DEBUG: colors.Debug,
    ERROR: colors.Error
};

class Logger {
    private static formatMessage(level: LogLevel, message: string, ...variables: any[]): string {
        const formattedVariables = variables.map(variable => colorize(variable, logLevelColors[level]));
        return `${colorize(`[${level}] ${message}`, logLevelColors[level])} ${formattedVariables.join(' ')}`;
    }

    static info(ns: any, message: string, ...variables: any[]): void {
        ns.tprint(Logger.formatMessage('INFO', message, ...variables));
    }

    static debug(ns: any, message: string, DEBUG: boolean, ...variables: any[]): void {
        if (DEBUG) {
            ns.tprint(Logger.formatMessage('DEBUG', message, ...variables));
        }
    }

    static error(ns: any, message: string, ...variables: any[]): void {
        ns.tprint(Logger.formatMessage('ERROR', message, ...variables));
    }
}

export { Logger, LogLevel };