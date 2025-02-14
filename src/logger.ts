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
    // ...used Copilot for this.  I never would have come up with this myself.
    private static formatMessage(level: LogLevel, message: string, ...variables: any[]): string {
        // Split the message into parts and apply the log level color to the entire message
        let formattedMessage = message.split(/{(\d+)}/g).map((part, index) => {
            // If the part is a placeholder, replace it with the corresponding variable colored magenta
            if (index % 2 === 1) {
                return colorize(variables[parseInt(part)], colors.Magenta);
            }
            // Otherwise, colorize the part with the log level color
            return colorize(part, logLevelColors[level]);
        }).join('');

        return `${colorize(`[${level}]`, logLevelColors[level])} ${formattedMessage}`;
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