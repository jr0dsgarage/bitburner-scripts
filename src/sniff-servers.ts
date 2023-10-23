// created by j__r0d 2023-10-22

import { NS } from '@ns';
import { buildScannedServerList, fileFetch, getScanDepth } from './hackLib';

/** 
 * @param {NS} ns Netscript namespace
 */
export async function main(ns: NS) {
    const doFetch = ns.args.includes('-f'||'-fetch') ? true : false;
    const scanDepth = await getScanDepth(ns);
    const serverList = await buildScannedServerList(ns, scanDepth);
    const homefilelist = await (async () =>  ns.ls('home'))();
    serverList.forEach((hostname: string) => {
        if (doFetch) fileFetch(ns, hostname, homefilelist);
    });
}