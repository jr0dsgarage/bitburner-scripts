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

            const targetServerMinSecurity = ns.getServerMinSecurityLevel(hackTarget.hostname);
            const targetServerMaxMoney = ns.getServerMaxMoney(hackTarget.hostname);
            

            for (;;) {
                // prepare the target server (min security and max money)

                if (ns.getServerSecurityLevel(hackTarget.hostname) > targetServerMinSecurity) { // weaken it
                    
                }

                // hack a specific amount of money

                // weaken the target server back to min security

                // grow the target server to max money

                // weaken the target server back to min security
            }
        } else {
            Logger.info(ns, 'command to start script: run hs3.js [<target-server>] [-h:help] [-f:fetch] [-k:killAll] [-d:debug] [-p:purchase]');
            ns.toast('no hacks deployed!', 'error');
        }
    } catch (err) {
        Logger.error(ns, `${err}`);
    }
}
