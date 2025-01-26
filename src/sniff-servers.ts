// created by j__r0d 2023-10-22

import { NS } from '@ns';
import { buildScannedServerList, fileFetch, getScanDepth } from './hackLib';

/** 
 * @param {NS} ns Netscript namespace
 * @remarks
 * This function scans servers up to a specified depth and optionally fetches files from each server.
 * The scan depth and initial server list can be provided as arguments.
 * If the scan depth is not provided or is invalid, it is determined dynamically.
 * If the server list is not provided, it is built by scanning.
 * The function also checks for fetch flags ('-f' or '-fetch') to determine whether to fetch files.
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