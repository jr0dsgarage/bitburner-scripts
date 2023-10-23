// created by j__r0d 2023-10-22

import { NS } from '@ns';
import { buildScannedServerList, getScanDepth } from './hackLib';

/** 
 * @param {NS} ns Netscript namespace
 */
export async function main(ns: NS) {
    const doFetch = ns.args[0]?.toString() === '-f' ? true : false;
    const scanDepth = await getScanDepth(ns);
    const serverList = await buildScannedServerList(ns, scanDepth);
    const homefilelist = await (async () =>  ns.ls('home'))();
    serverList.forEach((hostname: string) => {
        //ns.tprint(hostname);
        if (doFetch) fileFetch(ns, hostname, homefilelist);
    });
}

export async function getFileList(ns: NS, hostname: string) {
    return ns.ls(hostname);
}

export async function fileFetch(ns: NS, hostname: string, homefilelist: string[] = []) {   
    ns.ls(hostname).forEach((file: string) => {
        //ns.tprint(`--${file}`);
        if (!homefilelist.includes(file))
            try {
                ns.scp(file, `home`, hostname);
                ns.tprint(`INFO: ...${file} fetched from ${hostname}`);
            }
            catch { ns.tprint(`ERROR: ...can't fetch ${file} from ${hostname}!`); }
    });
}
