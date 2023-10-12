// created by j__r0d 10/11/23
import { colors } from "./colors";

/** @param {NS} ns */
export async function main(ns: any) {
    ns.tprint(`INFO: deploying hack on ${colors.cyan}home${colors.reset} server...`);
    const hackToApply = ns.args[0];
    let hostname = "home";
    let availableRAM = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);
    if (ns.args[1] == "-k") {
        ns.killall();
    }
    let threadsToUse = availableRAM / ns.getScriptRam(hackToApply);
    ns.run(hackToApply, ~~threadsToUse);
    ns.tprint(`INFO: ...hack deployed using ${colors.magenta}${~~threadsToUse}${colors.reset} threads`);
}