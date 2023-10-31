/** 
 * created by j__r0d 2023-10-11
 * command to start script: 
 *   home; clear; killall; run hack - servers.js my - first - hack.js - h
 * 
 * TODO: write a logger script that will log all the things - might be unnecessary?  i'm only after a better way to format the terminal output
 * TODO: properly calculate hack target -- from Documentation/beginner's guide: 
 *      `your hacking target should be the  with highest max money that's required hacking level is under 1/2 of your hacking level.`
 *      `Keep security level low. Security level affects everything when hacking. Two important Netscript functions for this are getServerSecurityLevel() and getServerMinSecurityLevel()`
 * TODO: instead of a bunch of helper scripts, make a Library of helper functions (ie: hackLib.openPorts(ns, hostname))
 */

import { NS, Server} from '@ns';
import { ServerMatrix } from './server-matrix';
import * as hl from './hackLib';
import { colors } from './hackLib';

/** 
 * @param {NS} ns Netscript namespace
 */

export async function main(ns: NS) {
    ns.tprint(`INFO: hack initiated...`);
    const hackToDeploy: string = ns.args[0]?.toString();
    const includeHome = (ns.args.includes('-h') || ns.args.includes('-home')) ? true : false;
    const doFetch = (ns.args.includes('-f') || ns.args.includes('-fetch')) ? true : false;

    if (hackToDeploy) {
        const matrix = new ServerMatrix(ns);
        await matrix.initialize();
        let hackTarget = matrix.hackTarget

        /* future Tor Router functionality
        // buy a tor router and then all of the executables as money becomes available
        // this doesn't work yet, waiting for the API to unlock? I think?
         if (ns.hasTorRouter()) {
            ns.tprint(`INFO: TOR router found...`);
            //eventually i should be able to do this through script, but for now here is a command that will buy all the executables, skipping those that are not yet affordable
            //connect darkweb; buy FTPCrack.exe; buy relaySMTP.exe; buy HTTPWorm.exe; buy SQLInject.exe; buy DeepscanV1.exe; buy DeepscanV2.exe;  buy serverProfiler.exe ; buy Autolink.exe; home;
        }
        else {
            //buy one
        }
     */

        if (hackTarget) {
            const hackableServerList = await matrix.getHackableServers()

            ns.tprint(`INFO: attempting to deploy ${colors.Magenta}${hackToDeploy}${colors.Reset} to all servers; targeting ${colors.Green}${hackTarget.hostname}${colors.Reset} ...`);

            await ((async () => hackableServerList.forEach(async (hackableServer: Server) => {
                if (!ns.hasRootAccess(hackableServer.hostname)) {
                    ns.tprint(`WARN: ${colors.Cyan}${hackableServer.hostname}${colors.Reset} does not have root access. attempting root...`);
                    hl.openPorts(ns, hackableServer.hostname);
                    hl.nukeServer(ns, hackableServer.hostname);
                }
                else {
                    ns.killall(hackableServer.hostname);
                    await hl.deployHack(ns, hackableServer.hostname, hackToDeploy, hackTarget.hostname);
                }
            }))());


            // check for existing purchased servers and start them, or purchase them if they don't exist and there's enough money
            const ramToPurchase = hl.calculateMaxRAM(ns);
            if (ns.getPurchasedServers().length === 0) {
                ns.tprint(`INFO: ...no purchased servers found. checking for available monies...`)
                if (ns.getServerMoneyAvailable(`home`) > (ns.getPurchasedServerCost(ramToPurchase) * ns.getPurchasedServerLimit())) {
                    ns.tprint(`INFO: enough monies secured; attempting to purchase servers...`)
                    await (async () => ns.run(`purchase-server.js`, 1, hackToDeploy, hackTarget.hostname, ramToPurchase))();
                }
                else {
                    ns.tprint(`ERROR: not enough monies to purchase servers! keep hacking...`);
                }
            }
            else {
                await (async () => ns.run(`start-purchased-servers.js`, 1, hackToDeploy, hackTarget.hostname))();
            }

            if (includeHome)
                await (async () => ns.run(`start-home-server.js`, 1, hackToDeploy, hackTarget.hostname))();
            else
                ns.tprint(`INFO: skipping home server. use 2nd arg '-h' to include home server in hacktivities.`);

            ns.toast(`hacks deployed!`);
        };
        if (doFetch) {
            await (async () => matrix.fetchFilesFromServers())();
        };
    }
    else {
        ns.tprint(`ERROR: no hack script to deploy. include script name! use 2nd arg '-h' to include home server in hacktivities.`);
        ns.toast(`no hacks deployed!`, 'error')
    };
}
