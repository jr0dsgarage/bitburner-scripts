/** 
 * hack script 4
 * originally created by j__r0d 2025-04-17
 * 
 * command to start script: 
 *   home; clear; killall; run hs4.js [<target-server>] [-h] [-f] [-k] [-d] [-p]
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

            const hackScriptRam = ns.getScriptRam(scriptsToDeploy[0]);
            const growScriptRam = ns.getScriptRam(scriptsToDeploy[1]);
            const weakenScriptRam = ns.getScriptRam(scriptsToDeploy[2]);

            // Monitor the amount of money and security on the target server
            let previousHackRatio = 0.07;
            let previousGrowRatio = 0.76;
            let previousWeakenRatio = 0.15;

            while (true) {
                const currentMoney = ns.getServerMoneyAvailable(hackTarget.hostname);
                const maxMoney = ns.getServerMaxMoney(hackTarget.hostname);
                const currentSecurity = ns.getServerSecurityLevel(hackTarget.hostname);
                const minSecurity = ns.getServerMinSecurityLevel(hackTarget.hostname);

                let hackRatio = 0.07; // Default ratios
                let growRatio = 0.76;
                let weakenRatio = 0.15;

                if (currentMoney < maxMoney * 0.9) {
                    //Logger.info(ns, `${hackTarget.hostname} money is below 90% of max. Adjusting grow ratio.`);
                    growRatio += 0.05; // Increase grow ratio
                    hackRatio -= 0.02; // Decrease hack ratio
                }

                if (currentSecurity > minSecurity * 1.1) {
                    //Logger.info(ns, `${hackTarget.hostname} security is above 110% of min. Adjusting weaken ratio.`);
                    weakenRatio += 0.05; // Increase weaken ratio
                    growRatio -= 0.02; // Decrease grow ratio
                }

                if (
                    hackRatio !== previousHackRatio ||
                    growRatio !== previousGrowRatio ||
                    weakenRatio !== previousWeakenRatio
                ) {
                    Logger.info(ns,`Ratios changed. Hack Ratio: ${hackRatio}, Grow Ratio: ${growRatio}, Weaken Ratio: ${weakenRatio}`, 'info');

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
