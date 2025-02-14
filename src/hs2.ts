/** 
 * hack script 2
 * created by j__r0d 2023-10-11
 * command to start script: 
 *   home; clear; killall; run hs2.js <hack-script> [<target-server>] [-h] [-f] [-k] [-d]
 * 
 * TODO: properly calculate hack target -- from Documentation/beginner's guide: 
 *      `your hacking target should be the server with highest max money that's required hacking level is under 1/2 of your hacking level.`
 *      `Keep security level low. Security level affects everything when hacking. Two important Netscript functions for this are getServerSecurityLevel() and getServerMinSecurityLevel()`x
 */

import { NS, Server } from '@ns';
import { ServerMatrix } from './server-matrix';
import { Logger } from './logger';

/** 
 * @param {NS} ns Netscript namespace
 */

export async function main(ns: NS) {
    Logger.info(ns, 'hack initiated...');

    function parseFlags(args: (string | number | boolean)[]): { includeHome: boolean, doFetch: boolean, killAllFirst: boolean, debug: boolean } {
        return {
            includeHome: args.includes('-h') || args.includes('-home'),
            doFetch: args.includes('-f') || args.includes('-fetch'),
            killAllFirst: args.includes('-k') || args.includes('-kill'),
            debug: args.includes('-d') || args.includes('-debug')
        };
    }

    const { includeHome, doFetch, killAllFirst, debug } = parseFlags(ns.args);

    const hackToDeploy: string = ns.args[0]?.toString();

    if (hackToDeploy) {
        const matrix = new ServerMatrix(ns);
        await matrix.initialize();
        let hackTarget: Server = matrix.hackTarget;  // matrix.hackTarget has a default built-in, so use that if no target is specified;
        // Check if the second argument is a target server or a flag and set hackTarget accordingly
        if (ns.args[1] && !ns.args[1].toString().startsWith('-')) {
            hackTarget.hostname = ns.args[1].toString();
        }
        /* future Tor Router functionality
        // buy a tor router and then all of the executables as money becomes available
        // this doesn't work yet, waiting for the API to unlock? I think?
        //connect darkweb; buy FTPCrack.exe; buy relaySMTP.exe; buy HTTPWorm.exe; buy SQLInject.exe; buy DeepscanV1.exe; buy DeepscanV2.exe;  buy serverProfiler.exe ; buy Autolink.exe; home;
        if (ns.hasTorRouter()) {
            Logger.info(ns, 'TOR router found...');
            }
        else {
            //buy one
        }
        */

        if (hackTarget) {
            Logger.info(ns, 'attempting to deploy {0} to all servers; targeting {1} ...', hackToDeploy, hackTarget.hostname);
            await matrix.deployHackOnAllServers(hackToDeploy, killAllFirst);
            await (async () => {
                if (includeHome)
                    ns.run('start-home-server.js', 1, hackToDeploy, hackTarget.hostname);
                else
                    Logger.info(ns, 'skipping home server. use 2nd arg \'-h\' to include home server in hacktivities.');
            })();
            await (async () => {
                if (matrix.purchasedServerList.length > 0) {
                    ns.run('start-purchased-servers.js', 1, hackToDeploy, hackTarget.hostname);
                }
                else {
                    Logger.info(ns, 'no purchased servers available!');
                }
            })();
            ns.toast('hacks deployed!');
        }

        if (doFetch) {
            await matrix.fetchFilesFromServers();
        }
    }
    else {
        Logger.error(ns, 'no hack script to deploy. include script name!');
        Logger.info(ns, 'command to start script: run hs2.js <hack-script> [<target-server>] [-h] [-f] [-k] [-d]');
        ns.toast('no hacks deployed!', 'error');
    }
}
