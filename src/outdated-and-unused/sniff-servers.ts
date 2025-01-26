// created by j__r0d 2023-10-22

import { NS } from '@ns';
import { buildScannedServerList, fileFetch, getMaxPossibleScanDepth } from './hackLib';

/** 
 * @param {NS} ns Netscript namespace
 */
export async function main(ns: NS) {
    let scanDepth = parseInt(ns.args[0]?.toString());
    const doFetch = (ns.args.includes('-f') || ns.args.includes('-fetch') )? true : false;
    if (isNaN(scanDepth)) 
        scanDepth = await getMaxPossibleScanDepth(ns);
    const serverList = await buildScannedServerList(ns, scanDepth);
    const homefilelist = await (async () =>  ns.ls('home'))();
    serverList.forEach((hostname: string) => {
        ns.tprint(`searching ${hostname}...`);
        if (doFetch)
            fileFetch(ns, hostname, homefilelist);
    });
} 