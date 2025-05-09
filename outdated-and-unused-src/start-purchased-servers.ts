// created by j__r0d 10/11/23
import { NS } from '@ns';
import { deployHack } from '../src/hackLib';
import { TerminalFormats as colors } from '../src/helperLib';


/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint('INFO: deploying hack on purchased servers...');
    const hackToDeploy = ns.args[0].toString();
    const hackTarget = ns.args[1].toString();
    let hackedCount = 0;
    let i = 1;

    while (i < ns.getPurchasedServerLimit() + 1) {
        const hostname = `pserv-`.concat(i.toString());
        ns.killall(hostname);
        await deployHack(ns, hostname, hackToDeploy, hackTarget);
        if (ns.scriptRunning(hackToDeploy, hostname)) {
            ++hackedCount;
        }
        ++i;
    }
    ns.tprint(`INFO: hacks deployed on ${colors.Green}${hackedCount}${colors.Reset} purchased servers`);
}