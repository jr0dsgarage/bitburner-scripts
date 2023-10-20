import { NS } from "@ns";
import { colors } from "./colors";

/** 
 * @param {NS} ns
 * @param {string} hostname
 * @param {string} hackToDeploy
 * @param {string} hackTarget
 *  */
export async function deployHack(ns: NS, hostname: string, hackToDeploy: string, hackTarget: string = `joesguns`) {
    ns.tprint(`INFO: deploying hack to server: ${colors.Cyan}${hostname}${colors.Reset}`);

    ns.killall(hostname); // free up RAM
    ns.scp(hackToDeploy, hostname); // always over-write the existing script with the latest version
    let threadsToUse = Math.max(1, (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(hackToDeploy));
    ns.exec(hackToDeploy, hostname, ~~threadsToUse, hackTarget);
    
    if (ns.scriptRunning(hackToDeploy, hostname)) ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads!`);
}