import { TerminalFormats as colors, colorize } from './helperLib';

/*
* Logger class to log messages to the terminal with different log levels.
*/

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const logLevelColors: { [key in LogLevel]: string } = {
    DEBUG: colors.Debug,
    INFO: colors.Info,
    WARN: colors.Warn,
    ERROR: colors.Error
};

class Logger {
    // ...used Copilot for this.  I never would have come up with this myself.
    private static formatMessage(level: LogLevel, message: string, ...variables: any[]): string {
        // Split the message into parts and apply the log level color to the entire message
        let formattedMessage = message.split(/{(\d+)}/g).map((part, index) => {
            // If the part is a placeholder, replace it with the corresponding variable
            if (index % 2 === 1) {
                const variable = variables[parseInt(part)];
                // Colorize numbers as green, otherwise magenta
                const color = typeof variable === 'number' ? colors.Green : colors.Magenta;
                return colorize(variable, color);
            }
            // Otherwise, colorize the part with the log level color
            return colorize(part, logLevelColors[level]);
        }).join('');

        return `${colorize(`[${level}]`, logLevelColors[level])} ${formattedMessage}`;
    }

    static debug(ns: any, message: string, DEBUG: boolean, ...variables: any[]): void {
        if (DEBUG) {
            ns.tprint(Logger.formatMessage('DEBUG', message, ...variables));
        }
    }
    
    static info(ns: any, message: string, ...variables: any[]): void {
        ns.tprint(Logger.formatMessage('INFO', message, ...variables));
    }

    static warn(ns: any, message: string, ...variables: any[]): void {
        ns.tprint(Logger.formatMessage('WARN', message, ...variables));
    }
    

    static error(ns: any, message: string, ...variables: any[]): void {
        ns.tprint(Logger.formatMessage('ERROR', message, ...variables));
    }
}

export { Logger, LogLevel };