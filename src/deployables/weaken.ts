import { NS } from "@ns";

/**
 * @param {NS} ns Netscript namespace
 */

export async function main(ns: NS) {
    for (; ;) {
        await ns.weaken((ns.args[0].toString()))
        //ns.tprint(`weakening ${target} on ${ns.getHostname().padEnd(15,`.`)}security level is now ` + ns.getServerSecurityLevel(target).toFixed(2));
    }
}
