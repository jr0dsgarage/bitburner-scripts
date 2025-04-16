/*
* created by j__r0d on 2025-04-15
*
* this is a watcher script, that monitors for a new hack target, and when it changes, 
* it execs the loop to hack/grow/weaken the new target.
* 
*/

import { NS } from '@ns';
import { ServerMatrix } from './lib/server-matrix';
import { Logger } from './lib/logger';

export async function main(ns: NS) {
    const reporting = ns.args[0] === true;
    if (reporting) Logger.debug(ns, `watcher started`, reporting)
    const matrix = new ServerMatrix(ns);
    matrix.initialize(ns, false);

    const hackTarget = matrix.hackTarget;
    const hackScripts = ['hack.js', 'grow.js', 'weaken.js'];

    // Defines how much money a server should have before we hack it
    // In this case, it is set to the maximum amount of money.
    const moneyThresh = ns.getServerMaxMoney(hackTarget.hostname);

    // Defines the maximum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
    const securityThresh = ns.getServerMinSecurityLevel(hackTarget.hostname);

    // decide whether the current target is the best hacktarget
    // if not, find the best hack target and set it as the target



    // Infinite loop that continously hacks/grows/weakens the target server
    for (; ;) {
        Logger.info (ns, `looping...`);
        for (const server of matrix.serversToUse) {
            // get the number of threads available from the server
            const hackThreadsAvailable = await matrix.getThreadsAvailableForScript(hackScripts[0], server);
            const growThreadsAvailable = await matrix.getThreadsAvailableForScript(hackScripts[1], server);
            const weakenThreadsAvailable = await matrix.getThreadsAvailableForScript(hackScripts[2], server);

            // get the number of threads needed for each script
            const hackThreads = Math.floor(hackThreadsAvailable * 0.1);
            const growThreads = Math.floor(growThreadsAvailable * 0.7);
            const weakenThreads = Math.floor(weakenThreadsAvailable * 0.2);
            if (ns.getServerSecurityLevel(hackTarget.hostname) > securityThresh) {
                // If the server's security level is above our threshold, weaken it
                if (ns.exec(hackScripts[2], server.hostname, hackThreads, hackTarget.hostname)) {
                    Logger.info(ns, `executing ${hackScripts[0]} on ${server.hostname} with ${hackThreads} threads`);
                }
            } else if (ns.getServerMoneyAvailable(hackTarget.hostname) < moneyThresh) {
                // If the server's money is less than our threshold, grow it
                if (ns.exec(hackScripts[1], server.hostname, growThreads, hackTarget.hostname)) {
                    Logger.info(ns, `executing ${hackScripts[1]} on ${server.hostname} with ${growThreads} threads`);
                }
            } else {
                // Otherwise, hack it
                if (ns.exec(hackScripts[0], server.hostname, weakenThreads, hackTarget.hostname)) {
                    Logger.info(ns, `executing ${hackScripts[0]} on ${server.hostname} with ${hackThreads} threads`);
                }
            }
        }
    }
}