export const colors = {
    Black: '\u001b[30m',
    Red: '\u001b[31m',
    Green: '\u001b[32m',
    Yellow: '\u001b[33m',
    Blue: '\u001b[34m',
    Magenta: '\u001b[35m',
    Cyan: '\u001b[36m',
    White: '\u001b[37m',
    BrightBlack: '\u001b[30;1m',
    BrightRed: '\u001b[31;1m',
    BrightGreen: '\u001b[32;1m',
    BrightYellow: '\u001b[33;1m',
    BrightBlue: '\u001b[34;1m',
    BrightMagenta: '\u001b[35;1m',
    BrightCyan: '\u001b[36;1m',
    BrightWhite: '\u001b[37;1m',
    Reset: '\u001b[0m',
};

export const defaultHackToDeploy = `my-first-hack.js`;
export const defaultHackTargetHostname = `joesguns`;
export const portOpeningPrograms = [
    `brutessh.exe`,
    `ftpcrack.exe`,
    `relaysmtp.exe`,
    `httpworm.exe`,
    `sqlinject.exe`
];

export function colorize(str: string, color: string) {
    return `${color}${str}${colors.Reset}`;
}