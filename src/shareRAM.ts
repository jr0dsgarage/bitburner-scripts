/*
* created by j__r0d 2025-04-11
*
* This script is used to share RAM with the provided faction to increase the reputation gain
* 
* This script should deploy the share.js script to all servers that have RAM available
* 
* Usage: home; killall; run shareRAM.js
*/

import { NS } from '@ns';
import { Logger } from './lib/logger';
import { ServerMatrix } from './lib/server-matrix';

export async function main(ns: NS) {
    Logger.info(ns, 'shareRAM initiated...');

    const matrix = new ServerMatrix(ns);
    await matrix.initialize(ns, false);
    const shareScript = './deployables/share.js';
    if (!ns.fileExists(shareScript, 'home')) throw new Error(`${shareScript} does not exist!!`);
    
    await matrix.deployHackOnAllServers(shareScript, true, true, true);
}
