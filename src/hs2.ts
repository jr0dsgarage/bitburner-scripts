/** 
 * hack script 2
 * originally created by j__r0d 2023-10-11
 * heavily updated in March 2025
 * command to start script: 
 *   home; clear; killall; run hs2.js <hack-script> [<target-server>] [-h] [-f] [-k] [-d] [-p]
 * 
 * TODO: properly calculate hack target -- from Documentation/beginner's guide: 
 *      `your hacking target should be the server with highest max money that's required hacking level is under 1/2 of your hacking level.`
 *      `Keep security level low. Security level affects everything when hacking. Two important Netscript functions for this are getServerSecurityLevel() and getServerMinSecurityLevel()`x
 */

import { NS, Server } from '@ns';
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

    const hackToDeploy = parseArgument(ns.args, 0, '');
    const { includeHome, doFetch, killAllFirst, debug: debugFlag, purchaseServers: purchaseServerFlag } = parseFlags(ns.args);

    try {
        if (hackToDeploy !== '') {
            if (!ns.fileExists(hackToDeploy, 'home')) throw new Error(`${hackToDeploy} does not exist!!`);
            const matrix = new ServerMatrix(ns);
            await matrix.initialize(ns,purchaseServerFlag);

            // Set the hack target to the server's built-in default, 
            // then change it to the argument target if one is provided
            const hackTarget: Server = matrix.hackTarget; 
            hackTarget.hostname = parseArgument(ns.args, 1, hackTarget.hostname);

            Logger.debug(ns, 'hack initialized, attempting to deploy {0} to all servers; targeting {1} ...', debugFlag, hackToDeploy, hackTarget.hostname);
            if (!ns.serverExists(hackTarget.hostname)) throw new Error(`server ${hackTarget.hostname} does not exist!`);
            if (hackTarget.hostname === 'home') throw new Error('cannot hack home server!');
            
            await matrix.nukeAllServers();
            
            await matrix.deployScriptonAllServers(hackToDeploy, includeHome, killAllFirst, debugFlag);
            ns.toast('hacks deployed!');
            
            if (doFetch) {
                await matrix.fetchFilesFromServers();
            }
        }
        else {
            Logger.info(ns, 'command to start script: run hs2.js <hack-script> [<target-server>] [-h:help] [-f:fetch] [-k:killAll] [-d:debug] [-p:purchase]');
            ns.toast('no hacks deployed!', 'error');
            throw new Error('no hack script designated! Please provide a hack script to deploy.');
        }
    }
    catch (err) {
        Logger.error(ns, `${err}`);
    }
}
