import { NS } from "@ns";

/**
 * @param {NS} ns Netscript namespace
 */

export async function main(ns: NS) {
    for (; ;) {
        await ns.grow(ns.args[0].toString());
        //ns.tprint(`growing ${target} on ${ns.getHostname().padEnd(15, `.`)} security level is now ` + ns.getServerSecurityLevel(target).toFixed(2));    
    }
}