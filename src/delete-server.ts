import { NS } from '@ns';
/** @param {NS} ns Netscript namespace */

export async function main(ns: NS) { 
    const purchasedServer = ns.args[0].toString();
    ns.deleteServer(purchasedServer);
}