import { NS, Server, HackingFormulas, HackingMultipliers } from '@ns';
//import { ServerMatrix } from `./server-matrix`;
//import * as hl from `./helperLib`;
import { colors } from './helperLib';

/**
 * investigates a server and prints it`s stats and info on loop
 * @param ns Netscript Namespace
*/

let STATUSCOLOR = colors.Reset;

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
    };
}

export async function main(ns: NS) {
    const targetHostname: string = ns.getServer(ns.args[0].toString()).hostname;
    const target: Server = ns.getServer(targetHostname);
    const maxRam: number = ns.getServerMaxRam(targetHostname);
    const minSecurityLevel: number = ns.getServerMinSecurityLevel(targetHostname);
    const maxMoney: number = ns.getServerMaxMoney(targetHostname)
    const requiredHackingLevel: number = ns.getServerRequiredHackingLevel(targetHostname);
    const usedRam: number = ns.getServerUsedRam(targetHostname);
    const availableRAM: number = maxRam - usedRam;

    while (true) {
        ns.ui.clearTerminal();

        ns.tprintf(`Investigating ${STATUSCOLOR}${targetHostname}${colors.Reset}:` +`${ns.getServerSecurityLevel(targetHostname) > minSecurityLevel ? `👇` : ns.getServerMoneyAvailable(targetHostname) < maxMoney ? `👆` : `👉`}`);
        ns.tprintf(`RAM Used: ${colors.White}${ns.formatNumber(ns.getServerUsedRam(targetHostname), 2)}GB / ${~~maxRam}GB = ${ns.formatNumber(availableRAM,2)}GB${colors.Reset} Available`);
        
        let cluesWithStaticColor: Clues = {
            numPortsRequired: {
                label: `Ports still closed`,
                value: ns.getServerNumPortsRequired(targetHostname),
            },
            minSecurityLevel: {
                label: `Minimum Security Level`,
                value: minSecurityLevel,
            },
            requiredHackingLevel: {
                label: `Required Hacking Level`,
                value: requiredHackingLevel,
            },
        };

        let cluesUsingStatuscolor: Clues = { 
            hackChance: {
                label: `Successful ${colors.Green}hack()${colors.Reset} chance`,
                value: ns.hackAnalyzeChance(targetHostname) * 100,
                format: ValueFormat.Percent
            },
            moneyAvailable: {
                label: `Money Available`,
                value: ns.getServerMoneyAvailable(targetHostname),
                format: ValueFormat.Money
            },
            maxMoney: {
                label: `Maximum Money`,
                value: maxMoney,
                format: ValueFormat.Money
            },
            percentofMoneyStolenPerThread: {
                label: `Percent of Money hacked per Thread`,
                value: ns.hackAnalyze(targetHostname) * 100,
                format: ValueFormat.Percent,
            },
            threadsNeededforMoneyAmount: {
                label: `Threads needed for ${colors.Green}$${ns.formatNumber(maxMoney - ns.getServerMoneyAvailable(targetHostname))}${colors.Reset}`,
                value: ns.hackAnalyzeThreads(targetHostname, maxMoney - ns.getServerMoneyAvailable(targetHostname)),
                format: ValueFormat.RoundDown,
            },
            currentSecurityLevel: {
                label: `Current Security Level`,
                value: ns.getServerSecurityLevel(targetHostname),
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
            securityIncrease: {
                label: `Security increase for hack()`,
                value: ns.hackAnalyzeSecurity(ns.hackAnalyzeThreads(targetHostname, maxMoney - ns.getServerMoneyAvailable(targetHostname)), targetHostname),
            },
            
            securityIncreaseIfGrow: {
                label: `Security increase for grow()`,
                value: ns.growthAnalyzeSecurity(ns.growthAnalyze(targetHostname, 100), targetHostname),
            },
            securityDecreaseifWeaken: {
                label: `Security decrease prediction for weaken()`,
                value: ns.weakenAnalyze(ns.growthAnalyze(targetHostname, 100)),
            },
           
        };
        
        STATUSCOLOR = cluesUsingStatuscolor.currentSecurityLevel.value > minSecurityLevel ? colors.Yellow : cluesUsingStatuscolor.moneyAvailable.value < maxMoney ? colors.Magenta : colors.Green;

        await printClues(ns, cluesWithStaticColor, false);
        await printClues(ns, cluesUsingStatuscolor, true);

        await ns.sleep(100);
    }
}

export async function printClues(ns: NS, cluesToPrint: Clues, useStatusColor: boolean) {
    Object.keys(cluesToPrint).forEach((clueKey: string) => {
        const clue = cluesToPrint[clueKey];
        const label = clue.label;
        let formattedValue;
        switch (clue.format) {
            case ValueFormat.Percent:
                formattedValue = ns.formatNumber(clue.value,3) + `%%`;
                break;
            case ValueFormat.Time:
                formattedValue = ns.tFormat(clue.value,true);
                break;
            case ValueFormat.RoundUp:
                formattedValue = Math.ceil(clue.value);
                break;
            case ValueFormat.RoundDown:
                formattedValue = Math.floor(clue.value);
                break;
            case ValueFormat.Money:
                formattedValue = `$${ns.formatNumber(clue.value)}`;
                break;
            default:
                formattedValue = ns.formatNumber(clue.value);
        }
        ns.tprintf(`${label}:`.padStart(45) + ` ${useStatusColor ? STATUSCOLOR : colors.Cyan}${formattedValue}${colors.Reset}`);
    });
}

