import { NS, Server } from '@ns';
//import { ServerMatrix } from `./server-matrix`;
//import * as hl from `./helperLib`;
import { TerminalFormats as colors, colorize } from './helperLib';

/**
 * investigates a server and prints it`s stats and info on loop
 * @param ns Netscript Namespace
*/

let STATUSCOLOR = colors.Reset;
const LINELENGTH = 75;
const colorCodeRegex = /\x1b\[\d+m/g;

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
        printHeader(ns, colorize(`Server Investigation Report`, colors.Yellow));
        const usedRam: number = ns.getServerUsedRam(targetHostname);
        const availableRAM: number = maxRam - usedRam;
        const moneyAvailable: number = ns.getServerMoneyAvailable(targetHostname);
        const currentSecurityLevel = ns.getServerSecurityLevel(targetHostname);     

        STATUSCOLOR = `${currentSecurityLevel > minSecurityLevel ? colors.Yellow : moneyAvailable < maxMoney ? colors.Magenta : colors.Green}`;
        
        const bar = colorize(`│`, colors.White);
        const pointer = colorize(`${currentSecurityLevel > minSecurityLevel ? ` ↓ ` : moneyAvailable < maxMoney ? ` ↑ ` : ` → `}`,STATUSCOLOR);
        const serverValues: string[] = [
            `Investigating ${colorize(targetHostname, colors.Cyan)}:`,
            `RAM Used: ${colorize(`${ns.formatNumber(ns.getServerUsedRam(targetHostname), 2)}GB / ${~~maxRam}GB = ${ns.formatNumber(availableRAM, 2)}GB`, colors.Cyan)} Available`,
            `Minimum Security Level: ${colorize(minSecurityLevel, colors.Cyan)}`,
            `Required Hacking Level: ${colorize(requiredHackingLevel, colors.Cyan)}`,
        ]; 
        serverValues.forEach(serverValue => ns.tprintf(bar + pointer + serverValue.padEnd(LINELENGTH + 6) + bar));

        printSubheader(ns, colorize(`Analysis Values`, colors.Magenta))
        let analysisClues: Clues = {
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
            printSubheader(ns, colorize(`Formulas.exe Analysis`, colors.Magenta))
            let cluesUsingFormulas: Clues = {
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
                formattedValue = Math.ceil(clue.value);
                break;
            case ValueFormat.RoundDown:
                formattedValue = Math.floor(clue.value);
                break;
            default:
                formattedValue = ns.formatNumber(clue.value);
        }

        
        const prefixColorCodes = clue.label.match(colorCodeRegex) || [];
        const prefixColorCodesLength = prefixColorCodes.reduce((total, code) => total + code.length, 0);
        const prefixPadLength = LINELENGTH / 2 + prefixColorCodesLength + (clue.label.includes('%%') ? 1 : 0);
        const suffixPadLength = LINELENGTH / 2  + (formattedValue.toString().includes('%') ? 1 : 0) + 7;
        const useStatusColor = clue.useStatusColor ?? true;
        ns.tprintf(
            `${colors.White}│${colors.Reset}` +
            `${clue.label.padStart(prefixPadLength)}` +
            `${colors.White}│» ${colors.Reset}` +
            `${useStatusColor ? STATUSCOLOR : colors.Cyan}${formattedValue}${colors.Reset}`.padEnd(suffixPadLength) +
            `${colors.White}│${colors.Reset}`
        );
    });
}

export async function printHeader(ns: NS, title: string) {
    // need to calculate the length of the title and pad the header accordingly
    // the title _might_ have color codes in it, so we need to strip those out before calculating the length
    const prefixColorCodes = title.match(colorCodeRegex) || [];
    const prefixColorCodesLength = prefixColorCodes.reduce((total, code) => total + code.length, 0);

    const headerLinelength = LINELENGTH;
    const halfLinelengthMinusTitle = ((LINELENGTH+2) / 2) - (title.length / 2) ;
    const headerTop = colorize((`┌` + `─`.repeat(headerLinelength) + `┐`), colors.White);
    const headerTitle = colorize(`│`.padEnd(halfLinelengthMinusTitle), colors.White) + title + colorize(`│`.padStart(halfLinelengthMinusTitle), colors.White);
    const headerBottom = colorize((`├` + `─`.repeat(headerLinelength) + `┤`), colors.White);

    ns.tprintf(`${headerTop}`);
    ns.tprintf(`${headerTitle}`);
    ns.tprintf(`${headerBottom}`);
}

export async function printSubheader(ns: NS, title: string) {
    const titleLinelength = (LINELENGTH / 2) - ((title.length + 2) / 2);
    const sectionTitle = colorize(`├` + `─`.repeat(titleLinelength) + ` ${title} ` + `─`.repeat(titleLinelength) + `┤`, colors.White);
    ns.tprintf(`${sectionTitle}`);
}

export async function printFooter(ns: NS) {
    ns.tprintf(`${colorize(`└${`─`.repeat(LINELENGTH/2)}┴${`─`.repeat(LINELENGTH/2)}┘`, colors.White)}`);
}

