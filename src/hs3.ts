/** 
 * hack script 3
 * originally created by j__r0d 2025-04-14
 * 
 * command to start script: 
 *   home; clear; killall; run hs3.js [<target-server>] [-h] [-f] [-k] [-d] [-p]
 * 
 * TODO: properly calculate hack target -- from Documentation/beginner's guide: 
 *      `your hacking target should be the server with highest max money that's required hacking level is under 1/2 of your hacking level.`
 *      `Keep security level low. Security level affects everything when hacking. Two important Netscript functions for this are getServerSecurityLevel() and getServerMinSecurityLevel()`x
 *
 * purchase programs script:  (buy TOR router first)
 *  buy AutoLink.exe; buy DeepscanV1.exe; buy ServerProfiler.exe; buy FTPCrack.exe; buy relaySMTP.exe; buy DeepscanV2.exe; buy HTTPWorm.exe; buy SQLInject.exe; buy Formulas.exe; buy BruteSSH.exe
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

            // Infinite loop that continously hacks/grows/weakens the target server
            for (; ;) {
                if (ns.getServerSecurityLevel(hackTarget.hostname) > ns.getServerMinSecurityLevel(hackTarget.hostname)) { //weaken it
                    Logger.info(ns, '{0} has {1} security level, weakening...', hackTarget.hostname, ns.getServerSecurityLevel(hackTarget.hostname));
                    let totalWeakenThreads = 0;
                    for (const server of matrix.serversToUse) {
                        ns.kill(hackScripts[0], server.hostname, hackTarget.hostname);
                        ns.kill(hackScripts[1], server.hostname, hackTarget.hostname);
                        const weakenThreadsAvailable = await matrix.getThreadsAvailableForScript(hackScripts[2], server);
                        if (weakenThreadsAvailable > 0) {
                            if (ns.exec(hackScripts[2], server.hostname, weakenThreadsAvailable, hackTarget.hostname)) {
                                Logger.info(ns, 'executed {0} on {1} with {2} threads', hackScripts[2], server.hostname, weakenThreadsAvailable);
                                totalWeakenThreads += weakenThreadsAvailable;
                            }
                        }
                    }
                    await ns.sleep(ns.getWeakenTime(hackTarget.hostname)/totalWeakenThreads);
                }
                else if (ns.getServerMoneyAvailable(hackTarget.hostname) < ns.getServerMaxMoney(hackTarget.hostname)) { //grow it
                    Logger.info(ns, '{0} has ${1} available out of ${2}, growing...', hackTarget.hostname, ns.getServerMoneyAvailable(hackTarget.hostname), ns.getServerMaxMoney(hackTarget.hostname));
                    let totalGrowThreads = 0;
                    for (const server of matrix.serversToUse) {
                        ns.kill(hackScripts[0], server.hostname, hackTarget.hostname);
                        ns.kill(hackScripts[2], server.hostname, hackTarget.hostname);
                        const growThreadsAvailable = await matrix.getThreadsAvailableForScript(hackScripts[1], server);
                        if (growThreadsAvailable > 0) {
                            if (ns.exec(hackScripts[1], server.hostname, growThreadsAvailable, hackTarget.hostname)) {
                                Logger.info(ns, 'executed {0} on {1} with {2} threads', hackScripts[1], server.hostname, growThreadsAvailable);
                                totalGrowThreads += growThreadsAvailable;
                            }
                        }
                    }
                    await ns.sleep(ns.getGrowTime(hackTarget.hostname)/totalGrowThreads);
                }
                else { //hack it
                    Logger.info(ns, '{0} has ${1} money available, hacking...', hackTarget.hostname, ns.getServerMoneyAvailable(hackTarget.hostname));
                    let totalHackThreads = 0;
                    for (const server of matrix.serversToUse) {
                        ns.kill(hackScripts[1], server.hostname, hackTarget.hostname);
                        ns.kill(hackScripts[2], server.hostname, hackTarget.hostname);
                        const hackThreadsAvailable = await matrix.getThreadsAvailableForScript(hackScripts[0], server);
                        if (hackThreadsAvailable > 0) {
                            if (ns.exec(hackScripts[0], server.hostname, hackThreadsAvailable, hackTarget.hostname)) {
                                Logger.info(ns, 'executed {0} on {1} with {2} threads', hackScripts[0], server.hostname, hackThreadsAvailable);
                                totalHackThreads += hackThreadsAvailable;
                            }
                        }
                    }
                    await ns.sleep(ns.getHackTime(hackTarget.hostname)/totalHackThreads);
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
