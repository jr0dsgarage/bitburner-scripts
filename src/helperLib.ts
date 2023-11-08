// Defaults that can be used throughout scripts
export const defaultHackToDeploy = `my-first-hack.js`;
export const defaultHackTargetHostname = `joesguns`;

// Programs that can open ports
export const portOpeningPrograms = [
    `brutessh.exe`,
    `ftpcrack.exe`,
    `relaysmtp.exe`,
    `httpworm.exe`,
    `sqlinject.exe`
];

export type Color = string;

export class TerminalFormats {
    static Reset: Color = '\u001b[0m';
    static Black: Color = '\u001b[30m';
    static Red: Color = '\u001b[31m';
    static Green: Color = '\u001b[32m';
    static Yellow: Color = '\u001b[33m';
    static Blue: Color = '\u001b[34m';
    static Magenta: Color = '\u001b[35m';
    static Cyan: Color = '\u001b[36m';
    static White: Color = '\u001b[37m';
    static BrightBlack: Color = '\u001b[30;1m';
    static BrightRed: Color = '\u001b[31;1m';
    static BrightGreen: Color = '\u001b[32;1m';
    static BrightYellow: Color = '\u001b[33;1m';
    static BrightBlue: Color = '\u001b[34;1m';
    static BrightMagenta: Color = '\u001b[35;1m';
    static BrightCyan: Color = '\u001b[36;1m';
    static BrightWhite: Color = '\u001b[37;1m'; 
}

export function colorize(value: any, color: Color) {
    return `${color}${value}${TerminalFormats.Reset}`;
}