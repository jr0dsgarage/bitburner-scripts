import { NS } from "@ns";
import { colors } from "./colors";

/** 
 * @param {NS} ns
 * @param {string} hostname
 * @param {string} hackToDeploy
 * @param {string} hackTarget
 *  */
export async function main(ns: NS, hostname: string, hackToDeploy: string, hackTarget: string = `joesguns`) {
    ns.killall(hostname);
    let threadsToUse = Math.max(1, (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(hackToDeploy));
    ns.tprint(`INFO: deploying hack to server: ${colors.Cyan}${hostname}${colors.Reset}`);
    ns.exec(hackToDeploy, hostname, ~~threadsToUse, hackTarget);
    if (ns.scriptRunning(hackToDeploy, hostname)) ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads!`);
}