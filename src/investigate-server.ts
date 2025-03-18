import { NS, Server } from '@ns';
//import { ServerMatrix } from `./server-matrix`;
//import * as hl from `./helperLib`;
import { TerminalFormats as colors, colorize } from './lib/helperLib';

/**
 * investigates a server and prints it`s stats and info on loop
 * @param ns Netscript Namespace
*/

let STATUSCOLOR = colors.Reset;
const LINELENGTH = 75;
const colorCodeRegex = /\x1b\[\d+m/g;
const borderBar = colorize(`│`, colors.White);
const midSeparator = borderBar + `»`.padEnd(2);

enum ValueFormat {
    Percent,
    Time,
    Money,
    RoundUp,
    RoundDown
}

interface Clues {
    [key: string]: {
        label: string;
        value: number;
        format?: ValueFormat;
        useStatusColor?: boolean;
    };
}

export async function main(ns: NS) {
    
    const target: Server = ns.getServer(ns.args[0].toString());
    const targetHostname: string = target.hostname;
    const maxRam: number = target.maxRam;
    const minSecurityLevel: number = ns.getServerMinSecurityLevel(targetHostname);
    const maxMoney: number = ns.getServerMaxMoney(targetHostname)
    const requiredHackingLevel: number = ns.getServerRequiredHackingLevel(targetHostname);
    

    while (true) {
        ns.ui.clearTerminal();
        printHeader(ns, colorize(`Server Investigation Report`, colors.Bold));
        const usedRam: number = ns.getServerUsedRam(targetHostname);
        const availableRAM: number = maxRam - usedRam;
        const moneyAvailable: number = ns.getServerMoneyAvailable(targetHostname);
        const currentSecurityLevel = ns.getServerSecurityLevel(targetHostname);     

        STATUSCOLOR = `${currentSecurityLevel > minSecurityLevel ? colors.Yellow : moneyAvailable < maxMoney ? colors.Magenta : colors.Green}`;
        
        
        const pointer = colorize(`${currentSecurityLevel > minSecurityLevel ? ` ↓ ` : moneyAvailable < maxMoney ? ` ↑ ` : ` → `}`,STATUSCOLOR);
        const serverValues: string[] = [
            `Investigating ${colorize(targetHostname, colors.Cyan)}:`,
            `RAM Used: ${colorize(`${ns.formatNumber(ns.getServerUsedRam(targetHostname), 2)}GB / ${~~maxRam}GB = ${ns.formatNumber(availableRAM, 2)}GB`, colors.Cyan)} Available`,
            `Minimum Security Level: ${colorize(minSecurityLevel, colors.Cyan)}`,
            `Required Hacking Level: ${colorize(requiredHackingLevel, colors.Cyan)}`,
        ];
        
        serverValues.forEach(serverValue => ns.tprintf(borderBar + pointer + serverValue.padEnd(LINELENGTH + 6) + borderBar));

        printSubheader(ns, colorize(`Analysis Values`, colors.White))
        
        const analysisClues: Clues = {
            currentSecurityLevel: {
                label: `Current Security Level`,
                value: ns.getServerSecurityLevel(targetHostname),
                format: ValueFormat.RoundDown,
            },
            hackChance: {
                label: `Successful ${colorize(`hack()`, colors.Green)} chance`,
                value: ns.hackAnalyzeChance(targetHostname) * 100,
                format: ValueFormat.Percent
            },
            maxMoney: {
                label: `Maximum Money`,
                value: maxMoney,
                format: ValueFormat.Money
            },
            moneyAvailable: {
                label: `Money Available`,
                value: moneyAvailable,
                format: ValueFormat.Money
            },
            percentofMoneyStolenPerThread: {
                label: `Percent of Money hacked per Thread`,
                value: ns.hackAnalyze(targetHostname) * 100,
                format: ValueFormat.Percent,
            },
            threadsNeededforMoneyAmount: {
                label: `Threads needed to steal ${colorize(`$${ns.formatNumber(moneyAvailable).padStart(7)}`, colors.Green)}`,
                value: ns.hackAnalyzeThreads(targetHostname, moneyAvailable),
                format: ValueFormat.RoundDown,
            },
            hackTime: {
                label: `Hack time`,
                value: ns.getHackTime(targetHostname),
                format: ValueFormat.Time,
            },
            growTime: {
                label: `Grow time`,
                value: ns.getGrowTime(targetHostname),
                format: ValueFormat.Time,
            },
            weakenTime: {
                label: `Weaken time`,
                value: ns.getWeakenTime(targetHostname),
                format: ValueFormat.Time,
            },
            growThreadsNeeded: {
                label: `Threads needed for 100%% growth`,
                value: ns.growthAnalyze(targetHostname, 100),
                format: ValueFormat.RoundDown,
            },
            securityIncreaseIfHack: {
                label: `Security increase for ${colorize(`hack()`, colors.Green)}`,
                value: ns.hackAnalyzeSecurity(ns.hackAnalyzeThreads(targetHostname, moneyAvailable), targetHostname),
            },
            securityIncreaseIfGrow: {
                label: `Security increase for ${colorize(`grow()`, colors.Magenta)}`,
                value: ns.growthAnalyzeSecurity(ns.growthAnalyze(targetHostname, 100), targetHostname),
            },
            securityDecreaseifWeaken: {
                label: `Security decrease for ${colorize(`weaken()`, colors.Yellow)}`,
                value: ns.weakenAnalyze(ns.growthAnalyze(targetHostname, 100)),
            },
        };

        await printClues(ns, analysisClues);

        // only print if the Formulas.exe file exists
        if (ns.fileExists(`Formulas.exe`)) {
            const linelength = 75 / 2 - ` Formulas `.length / 2;
            
            printSubheader(ns, colorize(`Formulas.exe Analysis`, colors.White))
            
            const cluesUsingFormulas: Clues = {
                growPercentforThreadCount: {
                    label: `Percent of Growth per Thread`,
                    value: ns.formulas.hacking.growPercent(target, ns.growthAnalyze(targetHostname, 100), ns.getPlayer()) * 100,
                    format: ValueFormat.Percent,
                },
                growThreads: {
                    label: `Threads needed to grow to ${colorize(`$${ns.formatNumber(maxMoney).padStart(2, '.')}`, colors.Green)}`,
                    value: ns.formulas.hacking.growThreads(target, ns.getPlayer(), maxMoney),
                    format: ValueFormat.RoundDown,
                },
                hackExpPerThread: {
                    label: `Hack Experience for one Thread`,
                    value: ns.formulas.hacking.hackExp(target, ns.getPlayer()),
                },
                hackPercentPerThread: {
                    label: `Hack Percent for one Thread`,
                    value: ns.formulas.hacking.hackPercent(target, ns.getPlayer()) * 100,
                    format: ValueFormat.Percent,
                },
                hackChanceFormulas: {
                    label: `Successful ${colorize(`hack()`, colors.Green)} chance`,
                    value: ns.formulas.hacking.hackChance(target, ns.getPlayer()) * 100,
                    format: ValueFormat.Percent,
                },
                hackTimeFormulas: {
                    label: `Hack time`,
                    value: ns.formulas.hacking.hackTime(target, ns.getPlayer()),
                    format: ValueFormat.Time,
                },
                growTimeFormulas: {
                    label: `Time to grow to ${colorize(`$${ns.formatNumber(maxMoney)}`, colors.Green)}`,
                    value: ns.formulas.hacking.growTime(target, ns.getPlayer()),
                    format: ValueFormat.Time,
                },
                weakenTimeFormulas: {
                    label: `Weaken time`,
                    value: ns.formulas.hacking.weakenTime(target, ns.getPlayer()),
                    format: ValueFormat.Time,
                },
            }
            await printClues(ns, cluesUsingFormulas);
        }

        printFooter(ns);

        await ns.sleep(100);
    }
}

export async function printClues(ns: NS, cluesToPrint: Clues) {
    Object.keys(cluesToPrint).forEach((clueKey: string) => {
        const clue = cluesToPrint[clueKey];
        let formattedValue;
        switch (clue.format) {
            case ValueFormat.Percent:
                formattedValue = ns.formatNumber(clue.value, 3) + `%%`;
                break;
            case ValueFormat.Money:
                formattedValue = `$${ns.formatNumber(clue.value)}`;
                break;
            case ValueFormat.Time:
                formattedValue = ns.tFormat(clue.value, true);
                break;
            case ValueFormat.RoundUp:
                formattedValue = Math.ceil(clue.value); //# Math: \lceil clue.value \rceil
                break;
            case ValueFormat.RoundDown:
                formattedValue = Math.floor(clue.value); //# Math: \lfloor clue.value \rfloor
                break;
            default:
                formattedValue = ns.formatNumber(clue.value);
        }

        const prefixColorCodes = clue.label.match(colorCodeRegex) || [];
        const prefixColorCodesLength = prefixColorCodes.reduce((total, code) => total + code.length, 0);
        const prefixPadLength = LINELENGTH / 2 + prefixColorCodesLength + (clue.label.includes('%%') ? 1 : 0);
        const suffixPadLength = LINELENGTH / 2  + (formattedValue.toString().includes('%') ? 1 : 0) + 7;
        const useStatusColor = clue.useStatusColor ?? true;
        // ↑ defaulting to true requires turning _off_ the status color for a specific clue; 
        
        ns.tprintf(
            borderBar +
            `${clue.label.padStart(prefixPadLength)}` +
            `${colorize(midSeparator,colors.White)}` +
            `${colorize(formattedValue,(useStatusColor ? STATUSCOLOR : colors.Cyan)).padEnd(suffixPadLength)}` +
            borderBar
        );
    });
}

export async function printHeader(ns: NS, title: string) {
    const halfLinelength = getHalfLinelength(ns, title) + borderBar.length;
    const headerTop = colorize((`┌` + `─`.repeat(LINELENGTH) + `┐`), colors.White);
    const headerTitle =
        borderBar.padEnd( halfLinelength) +
        title +
        borderBar.padStart(halfLinelength) ;
    const headerBottom = colorize((`├` + `─`.repeat(LINELENGTH) + `┤`), colors.White);

    ns.tprintf(`${headerTop}`);
    ns.tprintf(`${headerTitle}`);
    ns.tprintf(`${headerBottom}`);
}

export async function printSubheader(ns: NS, title: string) {
    const halfLinelength = getHalfLinelength(ns, title) - 1; // -1 to account for the ` ` around the Subheader title
    const sectionTitle =
        colorize(`├` + `─`.repeat(halfLinelength), colors.White) +
        title.padStart(title.length+1).padEnd(title.length+2) +
        colorize(`─`.repeat(halfLinelength) + `┤`, colors.White);
    
    ns.tprintf(`${sectionTitle}`);
}

export async function printFooter(ns: NS) {
    const footerString = `└` + `─`.repeat(LINELENGTH / 2) + `┴` + `─`.repeat(LINELENGTH / 2) + `┘`;
    ns.tprintf(`${colorize(footerString, colors.White)}`);
}

/**
 * Calculates the half line length for a given title; 
 * Equals: half LINELENGTH - half title length + half 'hidden' color code length
 * @param ns - The Netscript namespace
 * @param title - The title  to print
 * @returns The calculated half line length, as the integer portion of the result of the calculation
 *  
 */
function getHalfLinelength(ns: NS, title: string): number {
    const prefixColorCodes = title.match(colorCodeRegex) || [];
    const prefixColorCodesLength = prefixColorCodes.reduce((total, code) => total + code.length, 0);
    const halfLinelength = (LINELENGTH / 2) - ((title.length) / 2) + (prefixColorCodesLength / 2); 
    return ~~halfLinelength;
    //# Math: \frac{LINELENGTH}{2} - \frac{title.length}{2} + \frac{prefixColorCodesLength}{2}
}

