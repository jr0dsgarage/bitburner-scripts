// created by j__r0d 10/11/23
import { NS } from '@ns';
import { colors } from './colors';

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint(`INFO: deploying hack on ${colors.Cyan}home${colors.Reset} server...`);
    const hackToDeploy = ns.args[0]?.toString(); 
    const hackTarget = ns.args[1]?.toString();
    const killallFlag = ns.args[2]?.toString() === '-k';
    let hostname = 'home';
    if (killallFlag) ns.killall();
    let threadsToUse = Math.max(1, (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(hackToDeploy));
    ns.run(hackToDeploy, ~~threadsToUse, hackTarget);
    if (ns.scriptRunning(hackToDeploy, 'home')) ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads`);
}