// created by j__r0d 10/11/23
import { NS } from '@ns';
import { colors } from './colors';

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint('INFO: deploying hack on purchased servers...');
    const hackToDeploy = ns.args[0].toString();
    const hackTarget = ns.args[1].toString();
    let hackedCount = 0;
    let i = 1;

    
    // TODO: ack okay this could be easier using ns.getPurchasedServers() ...
    while (i < ns.getPurchasedServerLimit()+1) {
        let hostname = `pserv-`.concat(i.toString());
        ns.killall(hostname);
        let threadsToUse = Math.max(1, (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(hackToDeploy));
        ns.scp(hackToDeploy, hostname);  
        ns.exec(hackToDeploy, hostname, ~~threadsToUse, hackTarget)
        if (ns.scriptRunning(hackToDeploy, hostname)) {
            ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads on ${colors.Cyan}${hostname}${colors.Reset}`)
            ++hackedCount;
        };
        ++i;
    }
    ns.tprint(`INFO: hacks deployed on ${colors.Green}${hackedCount}${colors.Reset} purchased servers`);
}