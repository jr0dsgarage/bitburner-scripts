// created by j__r0d 10/11/23
import { colors } from "./colors";

/** @param {NS} ns */
export async function main(ns: any) {
    ns.tprint(`INFO: deploying hack on ${colors.Cyan}home${colors.Reset} server...`);
    const hackToApply = ns.args[0];
    let hostname = "home";
    if (ns.args[1] == "-k") {
        ns.killall();
    }
    let threadsToUse = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname) / ns.getScriptRam(hackToApply);
    ns.run(hackToApply, ~~threadsToUse);
    ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads`);
}