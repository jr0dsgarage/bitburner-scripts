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

import { NS } from '@ns';
import * as hl from '../hackLib';
import { colors } from '../hackLib';

/** 
 * @param {NS} ns Netscript namespace
 */

export async function main(ns: NS) {
    const hackToDeploy: string = ns.args[0]?.toString();
    const includeHome = (ns.args.includes('-h') || ns.args.includes('-home')) ? true : false;
    const doFetch = (ns.args.includes('-f') || ns.args.includes('-fetch')) ? true : false;

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

    ns.tprint(`INFO: hack initiated...`);
    const scanDepth = await hl.getMaxPossibleScanDepth(ns);
    const serverList = await hl.buildScannedServerList(ns, scanDepth);
    ns.tprint(`INFO: found ${colors.Cyan}${serverList.length}${colors.Reset} servers during scan of depth ${colors.Magenta}${scanDepth}${colors.Reset}...`);

    if (hackToDeploy) {
        ns.tprint(`INFO: selecting best 🎯 server...`)
        const hackTarget = `joesguns`; //serverWithMostMoney(ns, serverList); --need to account for hacking level, and choose the best server that has high money but low hacking level
        ns.tprint(`INFO: ...${colors.Green}${hackTarget}${colors.Reset} selected!`);

        ns.tprint(`INFO: attempting to deploy hack to all servers...`);
        await ((async () => serverList.forEach((hostname: string) => {
            if (!ns.hasRootAccess(hostname)) {
                ns.tprint(`WARN: ${colors.Cyan}${hostname}${colors.Reset} does not have root access. attempting root...`);
                hl.openPorts(ns, hostname);
                hl.nukeServer(ns, hostname);
            }
            else {
                hl.deployHack(ns, hostname, hackToDeploy, hackTarget);
            }
        }))());

        // check for existing purchased servers and start them, or purchase them if they don't exist and there's enough money
        ns.tprint(`INFO: checking for purchased servers...`)
        const ramToPurchase = hl.calculateMaxRAM(ns);
        if (ns.getPurchasedServers().length === 0) {
            ns.tprint(`INFO: ...no purchased servers found. checking for available monies...`)
            if (ns.getServerMoneyAvailable(`home`) > (ns.getPurchasedServerCost(ramToPurchase) * ns.getPurchasedServerLimit())) {
                ns.tprint(`INFO: enough monies secured; attempting to purchase servers...`)
                
                // This needs to be run on the n00dles server so it doesn't get killed when the home server is included in the hack deployment
                await (async () => ns.run(`purchase-server.js`, 1, hackToDeploy, hackTarget, ramToPurchase))();
            }
            else {
                ns.tprint(`ERROR: not enough monies to purchase servers! keep hacking...`);
            }
        }
        else {
            ns.tprint(`INFO: found purchased servers; deploying hack...`)
            await (async() => ns.run(`start-purchased-servers.js`, 1, hackToDeploy, hackTarget))();
        }

        if (includeHome)
            await (async() => ns.run(`start-home-server.js`, 1, hackToDeploy, hackTarget))();
        else
            ns.tprint(`INFO: skipping home server. use 2nd arg '-h' to include home server in hacktivities.`);

        ns.toast(`hacks deployed!`);
    }
    else {
        ns.tprint(`ERROR: no hack script to deploy. include script name! use 2nd arg '-h' to include home server in hacktivities.`);
        ns.toast(`no hacks deployed!`, 'error')
    };

    if (doFetch) {
        ns.tprint(`INFO: fetching files from servers...`);
        const pid = ns.run(`sniff-servers.js`, 1, scanDepth, serverList.join(','), `-fetch`)
        while (ns.isRunning(pid)) { await ns.sleep(100) };
    };
}