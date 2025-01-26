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
export type TextStyle = string;

//https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters
export class TerminalFormats {
    static Reset: Color = '\u001b[0m';
    static Bold: TextStyle = '\u001b[1m';
    static Underline: TextStyle = '\u001b[4m'; 

    
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

    static BlackBackground: Color = '\u001b[40m';
    static RedBackground: Color = '\u001b[41m';
    static GreenBackground: Color = '\u001b[42m';
    static YellowBackground: Color = '\u001b[43m';
    static BlueBackground: Color = '\u001b[44m';
    static MagentaBackground: Color = '\u001b[45m';
    static CyanBackground: Color = '\u001b[46m';
    static WhiteBackground: Color = '\u001b[47m';
    static BrightBlackBackground: Color = '\u001b[40;1m';
    static BrightRedBackground: Color = '\u001b[41;1m';
    static BrightGreenBackground: Color = '\u001b[42;1m';
    static BrightYellowBackground: Color = '\u001b[43;1m';
    static BrightBlueBackground: Color = '\u001b[44;1m';
    static BrightMagentaBackground: Color = '\u001b[45;1m';
    static BrightCyanBackground: Color = '\u001b[46;1m';
    static BrightWhiteBackground: Color = '\u001b[47;1m';

    

}

export function colorize(value: any, color: Color) {
    return `${color}${value}${TerminalFormats.Reset}`;
}