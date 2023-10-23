// created by j__r0d 10/12/23
// scans all servers and builds a list of servers to hack
import { NS } from '@ns';
import { buildScannedServerList } from './hackLib';
import { colors } from './colors';

/** @param {NS} ns Netscript namespace */
export async function main(ns: NS) {
    // for testing in bitburner Terminal
    let depth = ns.args[0].toString() || 3;
    let serverList = await buildScannedServerList(ns, ~~depth);
    ns.tprintf(`found ${colors.Cyan}${serverList.length}${colors.Reset} servers`)
    ns.tprintf(`${colors.Cyan}${serverList}${colors.Reset}`);
}


