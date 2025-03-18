// created by j__r0d 10/11/23
import { NS } from '@ns';
import {Logger} from '../src/logger';

/** @param {NS} ns */
export async function main(ns: NS) {
    Logger.info(ns, 'deploying hack on {0} server...', 'home');
    const hackToDeploy = ns.args[0]?.toString(); 
    const hackTarget = ns.args[1]?.toString();

    const hostname = 'home';

    const threadsToUse = Math.max(1, ((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(hackToDeploy))- 4);
    ns.run(hackToDeploy, ~~threadsToUse, hackTarget);
    if (ns.scriptRunning(hackToDeploy, 'home')) {
        Logger.info(ns, '...hack deployed using {0} threads', ~~threadsToUse);
    }
}