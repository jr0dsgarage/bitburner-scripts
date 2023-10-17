// created by j__r0d 10/11/23
import { NS } from "@ns";
import { colors } from "./colors";

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint("INFO: deploying hack on purchased servers...");
    const hackToDeploy = ns.args[0].toString();
    let i = 1;
    while (i < ns.getPurchasedServerLimit()) {
        let hostname = "pserv-".concat(i.toString());
        ns.killall(hostname);
        let threadsToUse = Math.max(1, (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(hackToDeploy));
        ns.exec(hackToDeploy, hostname, ~~threadsToUse);
        ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads on ${colors.Cyan}${hostname}${colors.Reset}`);
        ++i;
    }
    ns.tprint(`INFO: ...hacks deployed on ${colors.Green}${i}${colors.Reset} purchased servers`);
}