import { NS } from "@ns";

/**
 * @param {NS} ns Netscript namespace
 */

export async function main(ns: NS) {
    for (; ;){
        await ns.hack((ns.args[0].toString()))
        //ns.tprint(`hacking ${target} on ${ns.getHostname().padEnd(15,`.`)} money available is $` + ns.getServerMoneyAvailable(target).toFixed(2));
    }
}
