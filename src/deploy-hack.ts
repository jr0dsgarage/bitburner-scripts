import { NS } from '@ns';
import { defaultHackToDeploy, defaultHackTargetHostname, deployHack, nukeServer, openPorts } from './hackLib';

/**  @param {NS} ns  */

export async function main(ns: NS) {
    if (ns.args.length !== 0) {
        const hostname: string = ns.args[0].toString();
        const hackToDeploy: string = ns.args[1]?.toString() || defaultHackToDeploy;
        const hackTarget: string = ns.args[2]?.toString() || defaultHackTargetHostname;
        await openPorts(ns, hostname);
        await nukeServer(ns, hostname);
        await deployHack(ns, hostname, hackToDeploy, hackTarget);
    }
    else {
        ns.tprint(`ERROR: no hostname provided! aborting deployment...`);
    }
}