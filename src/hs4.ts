/** 
 * hack script 4
 * originally created by j__r0d 2025-04-17
 * 
 * command to start script: 
 *   home; clear; killall; run hs4.js [<target-server>] [-h] [-f] [-k] [-d] [-p]
 * 
 * This idea is solid but I'm not sure I'm getting the ratios right.
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

    const scriptsToDeploy = ['./deployables/hack.js', './deployables/grow.js', './deployables/weaken.js'];
    const { includeHome, doFetch, killAllFirst, debug: debugFlag, purchaseServers: purchaseServerFlag } = parseFlags(ns.args);

    try {
        if (scriptsToDeploy !== undefined && scriptsToDeploy.length > 0) {
            scriptsToDeploy.forEach((script: string) => {
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

            await matrix.deployScriptsonAllServers(scriptsToDeploy, includeHome, killAllFirst, false, debugFlag);
            ns.toast('scripts deployed!');

            if (doFetch) {
                await matrix.fetchFilesFromServers();
            }

            // Monitor the amount of money and security on the target server
            let previousHackRatio = 0.07;
            let previousGrowRatio = .76;
            let previousWeakenRatio = 0.15;

            const maxMoney = ns.getServerMaxMoney(hackTarget.hostname);
            const minSecurity = ns.getServerMinSecurityLevel(hackTarget.hostname);

            while (true) {
                const currentMoney = ns.getServerMoneyAvailable(hackTarget.hostname);
                const currentSecurity = ns.getServerSecurityLevel(hackTarget.hostname);

                const moneyStolenBySingleThread = ns.hackAnalyze(hackTarget.hostname);
                const growThreadsNeededToMultiply = ns.growthAnalyze(hackTarget.hostname, maxMoney / Math.max(currentMoney, 1));
                const securityDecreasePerWeakenThread = ns.weakenAnalyze(1);

                // Adjust ratios based on analysis
                let hackRatio = previousHackRatio;
                let growRatio = previousGrowRatio;
                let weakenRatio = previousWeakenRatio;

                // Hack ratio adjustment: prioritize hacking if money stolen is low
                if (moneyStolenBySingleThread < 0.08) {
                    hackRatio = Math.min(0.12, hackRatio + 0.02); // Increase hack ratio more aggressively
                } else if (moneyStolenBySingleThread > 0.12) {
                    hackRatio = Math.max(0.05, hackRatio - 0.01); // Decrease hack ratio slightly
                }

                // Grow ratio adjustment: ensure server money is replenished efficiently
                if (growThreadsNeededToMultiply > 1.5) {
                    growRatio = Math.min(1, growRatio + 0.07); // Increase grow ratio more aggressively
                } else if (growThreadsNeededToMultiply < 1) {
                    growRatio = Math.max(0.6, growRatio - 0.05); // Decrease grow ratio slightly
                }

                // Weaken ratio adjustment: prioritize weakening if security is high
                if (currentSecurity > minSecurity + 10) {
                    weakenRatio = Math.min(0.25, weakenRatio + 0.03); // Increase weaken ratio more aggressively
                } else if (currentSecurity <= minSecurity + 5) {
                    weakenRatio = Math.max(0.1, weakenRatio - 0.02); // Decrease weaken ratio slightly
                }

                if (
                    hackRatio !== previousHackRatio ||
                    growRatio !== previousGrowRatio ||
                    weakenRatio !== previousWeakenRatio
                ) {
                    Logger.info(ns, `Ratios changed. Hack Ratio: ${hackRatio}, Grow Ratio: ${growRatio}, Weaken Ratio: ${weakenRatio}`, 'info');

                    for (const server of matrix.serversToUse) {
                        ns.killall(server.hostname);

                        const totalThreads = Math.floor(server.maxRam / ns.getScriptRam(scriptsToDeploy[0]));
                        let hackThreads = Math.max(1, Math.floor(totalThreads * hackRatio));
                        let growThreads = Math.max(1, Math.floor(totalThreads * growRatio));
                        let weakenThreads = Math.max(1, Math.floor(totalThreads * weakenRatio));

                        // Adjust threads to ensure the total does not exceed available threads
                        const totalAllocatedThreads = hackThreads + growThreads + weakenThreads;
                        if (totalAllocatedThreads > totalThreads) {
                            const scaleFactor = totalThreads / totalAllocatedThreads;
                            hackThreads = Math.max(1, Math.floor(hackThreads * scaleFactor));
                            growThreads = Math.max(1, Math.floor(growThreads * scaleFactor));
                            weakenThreads = Math.max(1, Math.floor(weakenThreads * scaleFactor));
                        }

                        if (hackThreads > 0) {
                            ns.exec(scriptsToDeploy[0], server.hostname, hackThreads, hackTarget.hostname);
                        }
                        if (growThreads > 0) {
                            ns.exec(scriptsToDeploy[1], server.hostname, growThreads, hackTarget.hostname);
                        }
                        if (weakenThreads > 0) {
                            ns.exec(scriptsToDeploy[2], server.hostname, weakenThreads, hackTarget.hostname);
                        }
                    }

                    previousHackRatio = hackRatio;
                    previousGrowRatio = growRatio;
                    previousWeakenRatio = weakenRatio;
                }
                await ns.sleep(10);
            }
        } else {
            Logger.info(ns, 'command to start script: run hs3.js [<target-server>] [-h:help] [-f:fetch] [-k:killAll] [-d:debug] [-p:purchase]');
            ns.toast('no hacks deployed!', 'error');
        }
    } catch (err) {
        Logger.error(ns, `${err}`);
    }
}
