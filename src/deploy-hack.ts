import { NS } from '@ns';
import { deployHack, nukeServer } from './hackLib';

/**  @param {NS} ns  */

export async function main(ns: NS) {
    const hostname: string = ns.args[0].toString();
    const hackToDeploy: string = ns.args[1]?.toString();
    const hackTarget: string = ns.args[2]?.toString();
    await nukeServer(ns, hostname);
    await deployHack(ns, hostname, hackToDeploy, hackTarget);
}