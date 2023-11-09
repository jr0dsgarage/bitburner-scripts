import { NS } from "@ns";

/**
 * @param {NS} ns Netscript namespace
 */

export async function main(ns: NS) {
    ns.hack((ns.args[0].toString()))
}
