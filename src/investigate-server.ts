import { NS, Server } from '@ns';
import { ServerMatrix } from './server-matrix';
import * as hl from './hackLib';
import { colors } from './hackLib';

/**
 * investigates a server and prints it's stats and info on loop
 * @param ns Netscript Namespace
*/


export async function main(ns: NS) {
    const targetHostname: string = ns.getServer(ns.args[0].toString()).hostname;

    const target: Server = ns.getServer(targetHostname);

    const moneyThresh = ns.getServerMaxMoney(targetHostname);
    const securityThresh = ns.getServerMinSecurityLevel(targetHostname);
    const minSecurityLevel: number = ns.getServerMinSecurityLevel(targetHostname);
    const maxMoney: number = ns.getServerMaxMoney(targetHostname)
    const numPortsRequired: number = ns.getServerNumPortsRequired(targetHostname);
    const requiredHackingLevel: number = ns.getServerRequiredHackingLevel(targetHostname);
    const maxRam: number = ns.getServerMaxRam(targetHostname);

    while (true) {
        ns.ui.clearTerminal();

        let moneyAvailable: number = ns.getServerMoneyAvailable(targetHostname);
        let usedRam: number = ns.getServerUsedRam(targetHostname);
        let securityLevel: number = ns.getServerSecurityLevel(targetHostname);
        

        let availableRam: number = maxRam - usedRam;

        const hackTime: number = ns.getHackTime(targetHostname);
        const growTime: number = ns.getGrowTime(targetHostname);
        const weakenTime: number = ns.getWeakenTime(targetHostname);

        ns.tprintf(`Investigating ${colors.Green}${targetHostname}${colors.Reset}: ${securityLevel > securityThresh ? '👇' : moneyAvailable < moneyThresh ? '👆' : '👉'}`);
        ns.tprintf(`RAM: ${colors.Magenta}${ns.formatNumber(usedRam, 2)}GB${colors.Reset} / ${colors.Magenta}${~~maxRam}GB${colors.Reset}`);
        ns.tprintf(`Available RAM: ${colors.Magenta}${ns.formatNumber(availableRam, 2)}GB${colors.Reset}`)
        ns.tprintf(`Security Level: ${colors.Magenta}${securityLevel}${colors.Reset}`);
        ns.tprintf(`Minimum Security Level: ${colors.Magenta}${minSecurityLevel}${colors.Reset}`);
        ns.tprintf(`Money Available: ${colors.Magenta}${moneyAvailable}${colors.Reset}`);
        ns.tprintf(`Maximum Money: ${colors.Magenta}${maxMoney}${colors.Reset}`);
        ns.tprintf(`Required Hacking Level: ${colors.Magenta}${requiredHackingLevel}${colors.Reset}`);
        ns.tprintf(`Number of open ports: ${colors.Magenta}${numPortsRequired}${colors.Reset}`);
        ns.tprintf(`Hack time: ${colors.Magenta}${~~hackTime}s${colors.Reset}`);
        ns.tprintf(`Grow time: ${colors.Magenta}${~~growTime}s${colors.Reset}`);
        ns.tprintf(`Weaken time: ${colors.Magenta}${~~weakenTime}s${colors.Reset}`);

        await ns.sleep(1000);
    }
}
