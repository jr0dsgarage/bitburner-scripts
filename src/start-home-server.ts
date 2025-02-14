// created by j__r0d 10/11/23
import { NS } from '@ns';
import { TerminalFormats as colors } from './helperLib';

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint(`INFO: deploying hack on ${colors.Cyan}home${colors.Reset} server...`);
    const hackToDeploy = ns.args[0]?.toString(); 
    const hackTarget = ns.args[1]?.toString();
    const killallFlag = ns.args.includes('-k');
    const hostname = 'home';
    if (killallFlag) ns.killall();
    const threadsToUse = Math.max(1, ((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(hackToDeploy))- 4);
    ns.run(hackToDeploy, ~~threadsToUse, hackTarget);
    if (ns.scriptRunning(hackToDeploy, 'home')) ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads`);
}