/**
 * hack script 1
 * created by j__r0d 2025-02-04
 * 
 * The first master script for hacking servers
 * This script should be lightweight enough to run on the home server before upgrading the RAM
 * This script distributes the supplied hack script to the servers that do not require open ports to NUKE
 * 
 * Usage: 
 *  home; clear; killall; run hs1.js <hack-script> [<target-server>] [-h] [-f] [-k] [-d]
 */

import { NS } from '@ns';
import { Logger } from './logger';

// List of servers to deploy the hack script to; this list comes from the Beginner's guide
const servers = [
    { name: 'n00dles', threads: 1 },
    { name: 'sigma-cosmetics', threads: 6 },
    { name: 'joesguns', threads: 6 },
    { name: 'nectar-net', threads: 6 },
    { name: 'hong-fang-tea', threads: 6 },
    { name: 'harakiri-sushi', threads: 6 }
];
const DEFAULT_HACK_TARGET = 'n00dles';

/** @param {NS} ns */
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

    const { includeHome, doFetch, killAllFirst, debug: debugFlag } = parseFlags(ns.args);

    const hackToDeploy: string = ns.args[0]?.toString() || '';
    let hackTarget: string = DEFAULT_HACK_TARGET;
    // Check if the second argument is a target server or a flag and set hackTarget accordingly
    if (ns.args[1] && !ns.args[1].toString().startsWith('-')) {
        hackTarget = ns.args[1].toString();
    }
    
    if (includeHome) servers.push({ name: 'home', threads: 1 });

    let homefilelist: string[] = [];
    try {
        homefilelist = ns.ls('home');
    } catch (error) {
        Logger.error(ns, `Failed to list files on home server: {0}`, error);
    }

    if (hackToDeploy !== '') {
        try {
            // Deploy the hack script to all servers
            Logger.debug(ns, `attempting to deploy {0} to all servers; targeting {1} ...`, debugFlag, hackToDeploy, hackTarget);
            for (const server of servers) {
                // Kill all scripts on the server if flag is set
                if (killAllFirst) ns.killall(server.name);
                
                // Copy the requested hack script to the server
                ns.scp(hackToDeploy, server.name, `home`);
                if (ns.fileExists(hackToDeploy, server.name)) Logger.debug(ns, `deployed {0} to {1}`, debugFlag, hackToDeploy, server.name);

                // NUKE the server if it doesn't have root access
                if (!ns.hasRootAccess(server.name)) {
                    try {
                        ns.nuke(server.name);
                        if (ns.hasRootAccess(server.name)) {
                            Logger.info(ns, `{0} has been nuked`, server.name);
                        } else {
                            throw new Error(`Failed to nuke ${server.name}`);
                        }
                    } catch (error) {
                        Logger.error(ns, `${error}`);
                    }} else {
                    Logger.debug(ns, `{0} already has root access`, debugFlag, server.name);
                }

                // Execute the hack script on the server
                Logger.debug(ns, `Attempting to execute {0} on {1} with {2} threads targetting {3}`, debugFlag, hackToDeploy, server.name, server.threads, hackTarget);
                ns.exec(hackToDeploy, server.name, server.threads, hackTarget, debugFlag);
                if (ns.scriptRunning(hackToDeploy, server.name)) Logger.info(ns, `{0} is running on {1} using {2} threads`,hackToDeploy, server.name, server.threads);

                // Fetch files if flag is set
                if (doFetch) {
                    ns.ls(server.name).forEach((file: string) => {
                        if (!homefilelist.includes(file) && server.name !== 'home')
                            try {
                                ns.scp(file, `home`, server.name);
                                Logger.info(ns, `...{0} fetched from {1}`, file, server.name);
                            }
                            catch { Logger.error(ns, `...can't fetch {0} from {1}!`, file, server.name); }
                    });
                }
            }
            ns.toast('hacks deployed!');
        } catch (error) {
            Logger.error(ns, `Failed to deploy hack script: {0}`, error);
        }
    } else {
        Logger.error(ns, `no hack script to deploy. include script name!`);
        Logger.info(ns, `Usage: home; clear; killall; run hs1.js <hack-script> [<target-server>] [-h -home] [-f -fetch] [-k -kill] [-d -debug]`);
    }
}
