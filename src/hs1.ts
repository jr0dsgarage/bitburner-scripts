/**
 * hack script 1
 * created by j__r0d 2025-02-04
 * 
 * The first master script for hacking servers
 * This script should be lightweight enough to run on the home server before upgrading the RAM
 * 
 * Usage: 
 *  home; clear; killall; run hs1.js <hack-script> [<target-server>] [-h] [-f] [-k]
 */
  
import { NS } from '@ns';
const DEBUG = false;
const defaultHackTarget = 'n00dles';

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint(`INFO: hack initiated...`);
    const hackToDeploy = ns.args[0]?.toString() || '';
    let hackTarget = ns.args[1]?.toString() || defaultHackTarget;
    const includeHome = (ns.args.includes('-h') || ns.args.includes('-home')) ? true : false;
    const doFetch = (ns.args.includes('-f') || ns.args.includes('-fetch')) ? true : false;
    const killAllFirst = (ns.args.includes('-k') || ns.args.includes('-kill')) ? true : false;
    const servers = [
        { name: 'n00dles', threads: 1 },
        { name: 'sigma-cosmetics', threads: 6 },
        { name: 'joesguns', threads: 6 },
        { name: 'nectar-net', threads: 6 },
        { name: 'hong-fang-tea', threads: 6 },
        { name: 'harakiri-sushi', threads: 6 }
    ];

    if (hackToDeploy !== '') {
        await (async () => {
            if (includeHome)
                ns.run(`start-home-server.js`, 1, hackToDeploy, hackTarget);
            else
                ns.tprint(`INFO: skipping home server. use 2nd arg '-h' to include home server in hacktivities.`);
        })();
        // Deploy the hack script to each server
        for (const server of servers) {
            await ns.scp(hackToDeploy, 'home', server.name);
            await ns.nuke(server.name);
            ns.run(hackToDeploy, server.threads);
        }
    }
    else {
        ns.tprint(`ERROR: no hack script to deploy. include script name!`);
        ns.tprint(`Usage: home; clear; killall; run hs1.js <hack-script> [<target-server>] [-h] [-f] [-k]`);
    }
}

