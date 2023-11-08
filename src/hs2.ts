/** 
 * created by j__r0d 2023-10-11
 * command to start script: 
 *   home; clear; killall; run hs2.js <hack-script> <target-server> [-h] [-f] [-k]
 * 
 * TODO: write a logger script that will log all the things - might be unnecessary?  i'm only after a better way to format the terminal output
 * TODO: properly calculate hack target -- from Documentation/beginner's guide: 
 *      `your hacking target should be the server with highest max money that's required hacking level is under 1/2 of your hacking level.`
 *      `Keep security level low. Security level affects everything when hacking. Two important Netscript functions for this are getServerSecurityLevel() and getServerMinSecurityLevel()`x
 */

import { NS, Server } from '@ns';
import { ServerMatrix } from './server-matrix';
import { colors } from './helperLib';

/** 
 * @param {NS} ns Netscript namespace
 */

export async function main(ns: NS) {
    ns.tprint(`INFO: hack initiated...`);
    const hackToDeploy: string = ns.args[0]?.toString();
    let hackTarget: Server = ns.getServer(ns.args[1]?.toString());
    const includeHome = (ns.args.includes('-h') || ns.args.includes('-home')) ? true : false;
    const doFetch = (ns.args.includes('-f') || ns.args.includes('-fetch')) ? true : false;
    const killAllFirst = (ns.args.includes('-k') || ns.args.includes('-kill')) ? true : false;

    if (hackToDeploy) {
        const matrix = new ServerMatrix(ns);
        await matrix.initialize();
        if (!hackTarget) hackTarget = matrix.hackTarget;  // matrix.hackTarget has a default built-in, so use that if no target is specified

        /* future Tor Router functionality
        // buy a tor router and then all of the executables as money becomes available
        // this doesn't work yet, waiting for the API to unlock? I think?
        //connect darkweb; buy FTPCrack.exe; buy relaySMTP.exe; buy HTTPWorm.exe; buy SQLInject.exe; buy DeepscanV1.exe; buy DeepscanV2.exe;  buy serverProfiler.exe ; buy Autolink.exe; home;
        if (ns.hasTorRouter()) {
            ns.tprint(`INFO: TOR router found...`);
            }
        else {
            //buy one
        }
        */

        if (hackTarget) {
            ns.tprint(`INFO: attempting to deploy ${colors.Magenta}${hackToDeploy}${colors.Reset} to all servers; targeting ${colors.Green}${hackTarget.hostname}${colors.Reset} ...`);
            await matrix.deployHackOnAllServers(hackToDeploy, killAllFirst);
            await (async () => {
                if (includeHome)
                    ns.run(`start-home-server.js`, 1, hackToDeploy, hackTarget.hostname);
                else
                    ns.tprint(`INFO: skipping home server. use 2nd arg '-h' to include home server in hacktivities.`);
            })();
            await (async () => {
                if (matrix.purchasedServerList.length > 0) {
                    ns.run(`start-purchased-servers.js`, 1, hackToDeploy, hackTarget.hostname);
                }
                else {
                    ns.tprint(`INFO: no purchased servers available!`);
                };
            })();
            ns.toast(`hacks deployed!`);
        };

        if (doFetch) {
            await  matrix.fetchFilesFromServers();
        };
    }
    else {
        ns.tprint(`ERROR: no hack script to deploy. include script name!`);
        ns.toast(`no hacks deployed!`, 'error')
    };
}
