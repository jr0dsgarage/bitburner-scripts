/** 
 * hack script 3
 * originally created by j__r0d 2025-04-14
 * 
 * Unfortunately, this script is not as efficient as I would like it to be.
 * This is slower than sending the same logic to each server in parallel.
 * 
 * command to start script: 
 *   home; clear; killall; run hs3.js [<target-server>] [-h] [-f] [-k] [-d] [-p]
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

function killScripts(ns: NS, server: { hostname: string }, scripts: string[], target: string) {
    scripts.forEach(script => ns.kill(script, server.hostname, target));
}

function calculateAvailableThreads(ns: NS, server: { hostname: string }, script: string): number {
    return Math.floor(ns.getServerMaxRam(server.hostname) / ns.getScriptRam(script));
}

async function executeScripts(ns: NS, server: { hostname: string }, script: string, target: string, debugFlag: boolean): Promise<number> {
    let threadsAvailable = calculateAvailableThreads(ns, server, script);
    let totalThreads = 0;

    while (threadsAvailable > 0) {
        if (ns.exec(script, server.hostname, 1, target)) {
            Logger.debug(ns, 'executed {0} on {1} with {2} threads', debugFlag, script, server.hostname, threadsAvailable);
            totalThreads += 1;
            threadsAvailable -= 1;
        } else {
            break;
        }
    }

    return totalThreads;
}

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
                    throw new Error(`script ${script} does not exist or is not a hack script!`);
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

            for (;;) {
                if (ns.getServerSecurityLevel(hackTarget.hostname) > ns.getServerMinSecurityLevel(hackTarget.hostname)) { // weaken it
                    Logger.debug(ns, '{0} has {1} security level, weakening...', debugFlag, hackTarget.hostname, ns.getServerSecurityLevel(hackTarget.hostname));
                    let totalWeakenThreads = 0;
                    for (const server of matrix.serversToUse) {
                        killScripts(ns, server, [hackScripts[0], hackScripts[1]], hackTarget.hostname);
                        totalWeakenThreads += await executeScripts(ns, server, hackScripts[2], hackTarget.hostname, debugFlag);
                    }
                    await ns.sleep(ns.getWeakenTime(hackTarget.hostname) / totalWeakenThreads);
                } else if (ns.getServerMoneyAvailable(hackTarget.hostname) < ns.getServerMaxMoney(hackTarget.hostname)) { // grow it
                    Logger.debug(ns, '{0} has ${1} available out of ${2}, growing...', debugFlag, hackTarget.hostname, ns.getServerMoneyAvailable(hackTarget.hostname), ns.getServerMaxMoney(hackTarget.hostname));
                    let totalGrowThreads = 0;
                    for (const server of matrix.serversToUse) {
                        killScripts(ns, server, [hackScripts[0], hackScripts[2]], hackTarget.hostname);
                        totalGrowThreads += await executeScripts(ns, server, hackScripts[1], hackTarget.hostname, debugFlag);
                    }
                    await ns.sleep(ns.getGrowTime(hackTarget.hostname) / totalGrowThreads);
                } else { // hack it
                    Logger.debug(ns, '{0} has ${1} money available, hacking...', debugFlag, hackTarget.hostname, ns.getServerMoneyAvailable(hackTarget.hostname));
                    let totalHackThreads = 0;
                    for (const server of matrix.serversToUse) {
                        killScripts(ns, server, [hackScripts[1], hackScripts[2]], hackTarget.hostname);
                        totalHackThreads += await executeScripts(ns, server, hackScripts[0], hackTarget.hostname, debugFlag);
                    }
                    await ns.sleep(ns.getHackTime(hackTarget.hostname) / totalHackThreads);
                }
            }
        } else {
            Logger.info(ns, 'command to start script: run hs3.js [<target-server>] [-h:help] [-f:fetch] [-k:killAll] [-d:debug] [-p:purchase]');
            ns.toast('no hacks deployed!', 'error');
        }
    } catch (err) {
        Logger.error(ns, `${err}`);
    }
}
