import { NS } from "@ns";

/**
 * @param {NS} ns Netscript namespace
 */

export async function main(ns: NS) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        await ns.share();
    }
}
