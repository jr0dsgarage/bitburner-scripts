// created by j__r0d 10/16/23
import { NS } from '@ns';
import { openPorts } from './hackLib';

/** @param {NS} ns */
export async function main(ns: NS) {
    let hostname = ns.args[0]?.toString();
    openPorts(ns, hostname);
}

