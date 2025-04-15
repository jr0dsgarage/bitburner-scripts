/** 
 * hack script 2
 * originally created by j__r0d 2025-04-14
 * 
 * command to start script: 
 *   home; clear; killall; run hs3.js [<target-server>] [-h] [-f] [-k] [-d] [-p]
 * 
 * TODO: properly calculate hack target -- from Documentation/beginner's guide: 
 *      `your hacking target should be the server with highest max money that's required hacking level is under 1/2 of your hacking level.`
 *      `Keep security level low. Security level affects everything when hacking. Two important Netscript functions for this are getServerSecurityLevel() and getServerMinSecurityLevel()`x
 */

import { NS } from '@ns';
import { ServerMatrix } from './lib/server-matrix';
import { Logger } from './lib/logger';

/** 
 * @param {NS} ns Netscript namespace
 */

export async function main(ns: NS) {
    Logger.info(ns, 'hack initiated...');

    function parseArgument(args: (string | number | boolean)[], index: number, defaultValue: string): string {
        return args[index] && !args[index].toString().startsWith('-') ? args[index].toString() : defaultValue;
    }

    function parseFlags(args: (string | number | boolean)[]): { includeHome: boolean, doFetch: boolean, killAllFirst: boolean, debug: boolean, purchaseServers: boolean } {
        return {
            includeHome: args.includes('-h') || args.includes('-home'),
            doFetch: args.includes('-f') || args.includes('-fetch'),
            killAllFirst: args.includes('-k') || args.includes('-kill'),
            debug: args.includes('-d') || args.includes('-debug'),
            purchaseServers: args.includes('-p') || args.includes('-purchase')
        };
    }

    const hackScripts = ['./deployables/hack.js', './deployables/grow.js', './deployables/weaken.js'];
    const { includeHome, doFetch, killAllFirst, debug: debugFlag, purchaseServers: purchaseServerFlag } = parseFlags(ns.args);


    try {
        if (hackScripts !== undefined && hackScripts.length > 0) {
            hackScripts.forEach((script: string) => {
                if (!ns.fileExists(script, 'home')) {
                    throw new Error(`script ${script} does not exist!`);
                }
            });

            const matrix: ServerMatrix = new ServerMatrix(ns);
            await matrix.initialize(ns, purchaseServerFlag);

            // Set the hack target to the server's built-in default, 
            // then change it to the argument target if one is provided
            const hackTarget = matrix.hackTarget;
            hackTarget.hostname = parseArgument(ns.args, 0, hackTarget.hostname);

            if (!ns.serverExists(hackTarget.hostname)) throw new Error(`server ${hackTarget.hostname} does not exist!`);
            if (hackTarget.hostname === 'home') throw new Error('cannot hack home server!');

            await matrix.nukeAllServers();

            await matrix.deployScriptsonAllServers(hackScripts, includeHome, killAllFirst, false, debugFlag);
            ns.toast('scripts deployed!');

            if (doFetch) {
                await matrix.fetchFilesFromServers();
            }

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
                Logger.info(ns, `looping...`);
                for (const server of matrix.serversToUse) {
                    // get the number of threads available from the server
                    const hackThreadsAvailable = await matrix.getThreadsAvailableForScript(hackScripts[0], server);
                    const growThreadsAvailable = await matrix.getThreadsAvailableForScript(hackScripts[1], server);
                    const weakenThreadsAvailable = await matrix.getThreadsAvailableForScript(hackScripts[2], server);

                    const totalThreadsAvailable = hackThreadsAvailable + growThreadsAvailable + weakenThreadsAvailable;

                    // get the number of threads needed for each script
                    const hackThreads = Math.floor(totalThreadsAvailable * 0.1);
                    const growThreads = Math.floor(totalThreadsAvailable * 0.7);
                    const weakenThreads = Math.floor(totalThreadsAvailable * 0.2);

                    if (hackThreads > 0 && growThreads > 0 && weakenThreads > 0) {
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
                        await ns.sleep(10);
                    }
                }
            }
        }
        else {
                Logger.info(ns, 'command to start script: run hs3.js [<target-server>] [-h:help] [-f:fetch] [-k:killAll] [-d:debug] [-p:purchase]');
                ns.toast('no hacks deployed!', 'error');
            }
        }
    catch (err) {
            Logger.error(ns, `${err}`);
        }
    }
