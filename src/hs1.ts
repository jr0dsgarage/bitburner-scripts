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
const DEFAULT_HACK_TARGET = 'n00dles';

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint(`INFO: hack initiated...`);

    function debugPrint(message: string) {
        if (DEBUG) {
            ns.tprint(`DEBUG: ${message}`);
        }
    }

    function parseFlags(args: (string | number | boolean)[]): { includeHome: boolean, doFetch: boolean, killAllFirst: boolean, debug: boolean } {
        return {
            includeHome: args.includes('-h') || args.includes('-home'),
            doFetch: args.includes('-f') || args.includes('-fetch'),
            killAllFirst: args.includes('-k') || args.includes('-kill'),
            debug: args.includes('-d') || args.includes('-debug')
        };
    }

    const { includeHome, doFetch, killAllFirst, debug } = parseFlags(ns.args);
    const DEBUG = debug;

    const hackToDeploy: string = ns.args[0]?.toString() || '';
    let hackTarget: string = DEFAULT_HACK_TARGET;

    // Check if the second argument is a target server or a flag and set hackTarget accordingly
    if (ns.args[1] && !ns.args[1].toString().startsWith('-')) {
        hackTarget = ns.args[1].toString();
    }
    
    // List of servers to deploy the hack script to; this list comes from the Beginner's guide
    const servers = [
        { name: 'n00dles', threads: 1 },
        { name: 'sigma-cosmetics', threads: 6 },
        { name: 'joesguns', threads: 6 },
        { name: 'nectar-net', threads: 6 },
        { name: 'hong-fang-tea', threads: 6 },
        { name: 'harakiri-sushi', threads: 6 }
    ];
    // Add home to servers if requested
    if (includeHome) servers.push({ name: 'home', threads: 1 });

    let homefilelist: string[] = [];
    try {
        homefilelist = ns.ls('home');
    } catch (error) {
        ns.tprint(`ERROR: Failed to list files on home server: ${error}`);
    }

    if (hackToDeploy !== '') {
        try {
            debugPrint(`attempting to deploy ${hackToDeploy} to all servers; targeting ${hackTarget} ...`);
            // Deploy the hack script to each server
            for (const server of servers) {
                // Kill all scripts on the server if requested
                if (killAllFirst) ns.killall(server.name);
                
                // Copy the requested hack script to the server
                ns.scp(hackToDeploy, server.name, `home`);
                if (ns.fileExists(hackToDeploy, server.name)) debugPrint(`deployed ${hackToDeploy} to ${server.name}`);

                // NUKE the server if it doesn't have root access
                if (!ns.hasRootAccess(server.name)) {
                    ns.nuke(server.name);
                    debugPrint(`${server.name} has been nuked`);
                } else {
                    debugPrint(`${server.name} already has root access`);
                }

            // Run the hack script on the server
            ns.exec(hackToDeploy, server.name, server.threads, hackTarget, DEBUG);
            if (ns.scriptRunning(hackToDeploy, server.name)) ns.tprint(`INFO: ${hackToDeploy} is running on ${server.name}`);

                // Fetch files if requested
                if (doFetch) {
                    ns.ls(server.name).forEach((file: string) => {
                        if (!homefilelist.includes(file) && server.name !== 'home')
                            try {
                                ns.scp(file, `home`, server.name);
                                ns.tprint(`INFO: ...${file} fetched from ${server.name}`);
                            }
                            catch { ns.tprint(`ERROR: ...can't fetch ${file} from ${server.name}!`); }
                    });
                }
            }
        } catch (error) {
            ns.tprint(`ERROR: Failed to deploy hack script: ${error}`);
        }
    } else {
        ns.tprint(`ERROR: no hack script to deploy. include script name!`);
        ns.tprint(`Usage: home; clear; killall; run hs1.js <hack-script> [<target-server>] [-h -home] [-f -fetch] [-k -kill] [-d -debug]`);
    }
}
