import { NS, Server } from '@ns';
//import { ServerMatrix } from `./server-matrix`;
//import * as hl from `./helperLib`;
import { colors } from './helperLib';

/**
 * investigates a server and prints it`s stats and info on loop
 * @param ns Netscript Namespace
*/

let STATUSCOLOR = colors.Reset;
const LINELENGTH = 75;


export enum ValueFormat {
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
    const usedRam: number = ns.getServerUsedRam(targetHostname);
    const availableRAM: number = maxRam - usedRam;

    while (true) {
        ns.ui.clearTerminal();
        const moneyAvailable: number = ns.getServerMoneyAvailable(targetHostname);

        printTitle(ns, `Server Investigation`);
        ns.tprintf(`Investigating ${STATUSCOLOR}${targetHostname}${colors.Reset}:` + `${ns.getServerSecurityLevel(targetHostname) > minSecurityLevel ? `👇` : moneyAvailable < maxMoney ? `👆` : `👉`}`);
        ns.tprintf(`RAM Used: ${colors.Cyan}${ns.formatNumber(ns.getServerUsedRam(targetHostname), 2)}GB / ${~~maxRam}GB = ${ns.formatNumber(availableRAM, 2)}GB${colors.Reset} Available`);
        ns.tprintf(`Ports still closed: ${colors.Cyan}${ns.getServerNumPortsRequired(targetHostname)}${colors.Reset}`);
        ns.tprintf(`Minimum Security Level: ${colors.Cyan}${minSecurityLevel}${colors.Reset}`);
        ns.tprintf(`Required Hacking Level: ${colors.Cyan}${requiredHackingLevel}${colors.Reset}`);

        printTitle(ns, `Analysis Values`)

        let analysisClues: Clues = {
            currentSecurityLevel: {
                label: `Current Security Level`,
                value: ns.getServerSecurityLevel(targetHostname),
                format: ValueFormat.RoundDown,
            },
            hackChance: {
                label: `Successful ${colors.Green}hack()${colors.Reset} chance`,
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
                label: `Threads needed to steal ${colors.Green}$${ns.formatNumber(moneyAvailable)}${colors.Reset}`,
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
                label: `Security increase for ${colors.Green}hack()${colors.Reset}`,
                value: ns.hackAnalyzeSecurity(ns.hackAnalyzeThreads(targetHostname, maxMoney - moneyAvailable), targetHostname),
            },
            securityIncreaseIfGrow: {
                label: `Security increase for ${colors.Magenta}grow()${colors.Reset}`,
                value: ns.growthAnalyzeSecurity(ns.growthAnalyze(targetHostname, 100), targetHostname),
            },
            securityDecreaseifWeaken: {
                label: `Security decrease for ${colors.Yellow}weaken()${colors.Reset}`,
                value: ns.weakenAnalyze(ns.growthAnalyze(targetHostname, 100)),
            },
        };

        STATUSCOLOR = analysisClues.currentSecurityLevel.value > minSecurityLevel ? colors.Yellow : analysisClues.moneyAvailable.value < maxMoney ? colors.Magenta : colors.Green;
        await printClues(ns, analysisClues);

        // only print if the Formulas.exe file exists
        if (ns.fileExists(`Formulas.exe`)) {
            const linelength = 75 / 2 - ` Formulas `.length / 2;
            printTitle(ns, `Formulas.exe Analysis`)
            let cluesUsingFormulas: Clues = {
                growPercentforThreadCount: {
                    label: `Percent of Growth per Thread`,
                    value: ns.formulas.hacking.growPercent(target, ns.growthAnalyze(targetHostname, 100), ns.getPlayer()) * 100,
                    format: ValueFormat.Percent,
                },
                growThreads: {
                    label: `Threads needed to grow to ${colors.Green}$${ns.formatNumber(maxMoney)}${colors.Reset}`,
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
                    label: `Successful ${colors.Green}hack()${colors.Reset} chance`,
                    value: ns.formulas.hacking.hackChance(target, ns.getPlayer()) * 100,
                    format: ValueFormat.Percent,
                },
                hackTimeFormulas: {
                    label: `Hack time`,
                    value: ns.formulas.hacking.hackTime(target, ns.getPlayer()),
                    format: ValueFormat.Time,
                },
                growTimeFormulas: {
                    label: `Time to grow to ${colors.Green}$${ns.formatNumber(maxMoney)}${colors.Reset}`,
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

        const colorCodeRegex = /\x1b\[\d+m/g;
        const prefixColorCodes = clue.label.match(colorCodeRegex) || [];
        const prefixColorCodesLength = prefixColorCodes.reduce((total, code) => total + code.length, 0);
        const prefixPadLength = LINELENGTH / 2 + prefixColorCodesLength + (clue.label.includes('%%') ? 1 : 0);
        const suffixPadLength = LINELENGTH / 2  + (formattedValue.toString().includes('%') ? 1 : 0) + 7;
        const useStatusColor = clue.useStatusColor ?? true;
        ns.tprintf(
            `${colors.White}│${colors.Reset}` +
            `${clue.label.padStart(prefixPadLength)}` +
            `${colors.White} │ ${colors.Reset}` +
            `${useStatusColor ? STATUSCOLOR : colors.Cyan}${formattedValue}${colors.Reset}`.padEnd(suffixPadLength) +
            `${colors.White}│${colors.Reset}`
        );
    });
}

export async function printTitle(ns: NS, title: string) {
    const titleLinelength = (LINELENGTH / 2) - ((title.length + 2) / 2);
    const sectionTitle = `┌` + `─`.repeat(titleLinelength) + ` ${title} ` + `─`.repeat(titleLinelength) + `┐`;
    ns.tprintf(`${colors.White}${sectionTitle}${colors.Reset}`);
}

export async function printFooter(ns: NS) {
    ns.tprintf(`${colors.White}└${`─`.repeat(LINELENGTH)}┘${colors.Reset}`);
}

