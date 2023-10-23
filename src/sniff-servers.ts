// created by j__r0d 2023-10-22

import { NS } from '@ns';
import { buildScannedServerList, fileFetch, getScanDepth } from './hackLib';

/** 
 * @param {NS} ns Netscript namespace
 */
export async function main(ns: NS) {
    let scanDepth = parseInt(ns.args[0].toString());
    let serverList: string[] = ns.args[1]?.toString().split(',');
    const doFetch = (ns.args.includes('-f') || ns.args.includes('-fetch') )? true : false;
    if (isNaN(scanDepth)) scanDepth = await getScanDepth(ns);
    if (serverList.length === 0) serverList = await buildScannedServerList(ns, scanDepth);
    const homefilelist = await (async () =>  ns.ls('home'))();
    serverList.forEach((hostname: string) => {
        if (doFetch) fileFetch(ns, hostname, homefilelist);
    });
}