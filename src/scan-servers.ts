// created by j__r0d 10/12/23
import { colors } from "./colors";

/** @param {NS} ns */
export async function main(ns: any) {
    let serverlist = ns.scan();
    ns.tprint(serverlist);
}